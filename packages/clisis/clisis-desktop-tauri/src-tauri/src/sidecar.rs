use serde::Serialize;
use std::sync::{Arc, Mutex};
use tokio::process::{Child, Command};
use tokio::sync::oneshot;

#[derive(Clone, Serialize)]
pub struct ServerResult {
    pub url: String,
    pub port: u16,
    pub pid: u32,
}

pub struct ServerStatus {
    pub running: bool,
    pub url: Option<String>,
    pub port: Option<u16>,
    pub pid: Option<u32>,
}

pub struct SidecarState {
    pub status: Mutex<ServerStatus>,
    pub stop_tx: Mutex<Option<oneshot::Sender<()>>>,
    pub process: Mutex<Option<Child>>,
}

impl SidecarState {
    pub fn default() -> Arc<Self> {
        Arc::new(Self {
            status: Mutex::new(ServerStatus {
                running: false,
                url: None,
                port: None,
                pid: None,
            }),
            stop_tx: Mutex::new(None),
            process: Mutex::new(None),
        })
    }
}

pub async fn start_server(
    state: &SidecarState,
    port: u16,
) -> Result<ServerResult, anyhow::Error> {
    // Find the clisis-coder server binary
    let CLISIS_CODER_path = find_clisis_coder_server()?;
    let actual_port = if port == 0 { find_free_port().await? } else { port };

    let (stop_tx, stop_rx) = oneshot::channel::<()>();

    let mut child = Command::new(&CLISIS_CODER_path)
        .args(["serve", "--port", &actual_port.to_string(), "--host", "127.0.0.1"])
        .env("CLISIS_CODER_DISABLE_EMBEDDED_WEB_UI", "true")
        .kill_on_drop(true)
        .spawn()?;

    let pid = child.id().ok_or_else(|| anyhow::anyhow!("failed to get child pid"))?;

    // Wait for server to be ready
    let url = format!("http://127.0.0.1:{}", actual_port);
    wait_for_health(&url, 30).await?;

    {
        let mut status = state.status.lock().unwrap();
        status.running = true;
        status.url = Some(url.clone());
        status.port = Some(actual_port);
        status.pid = Some(pid);
    }
    {
        let mut proc = state.process.lock().unwrap();
        *proc = Some(child);
    }
    {
        let mut tx = state.stop_tx.lock().unwrap();
        *tx = Some(stop_tx);
    }

    Ok(ServerResult {
        url,
        port: actual_port,
        pid,
    })
}

pub async fn stop_server(state: &SidecarState) -> Result<(), anyhow::Error> {
    {
        let mut tx = state.stop_tx.lock().unwrap();
        if let Some(tx) = tx.take() {
            let _ = tx.send(());
        }
    }

    {
        let mut proc = state.process.lock().unwrap();
        if let Some(ref mut child) = *proc {
            child.kill().await?;
            child.wait().await?;
        }
        *proc = None;
    }

    {
        let mut status = state.status.lock().unwrap();
        status.running = false;
        status.url = None;
        status.port = None;
        status.pid = None;
    }

    Ok(())
}

fn find_clisis_coder_server() -> Result<String, anyhow::Error> {
    // Check common locations relative to the app bundle
    let candidates = vec![
        // Development: run from workspace
        which_clisis_coder_in_workspace(),
        // Production: bundled sidecar
        None,
    ];

    for candidate in candidates.iter().flatten() {
        if std::path::Path::new(candidate).exists() {
            return Ok(candidate.clone());
        }
    }

    // Fallback: check PATH
    match which::which("clisis-coder") {
        Ok(path) => Ok(path.to_string_lossy().to_string()),
        Err(_) => Err(anyhow::anyhow!(
            "clisis-coder server not found. Install it or add to PATH."
        )),
    }
}

fn which_clisis_coder_in_workspace() -> Option<String> {
    // In development, find the clisis-coder package's built server
    let dev_paths = vec![
        "../ClisisCoder/dist/node/node.js",
        "../../packages/clisis-coder/dist/node/node.js",
    ];
    for p in dev_paths {
        let full = std::path::PathBuf::from(env!("CARGO_MANIFEST_DIR"))
            .parent()
            .unwrap()
            .join(p);
        if full.exists() {
            return Some(format!("node {}", full.to_string_lossy()));
        }
    }
    None
}

async fn find_free_port() -> Result<u16, anyhow::Error> {
    use tokio::net::TcpListener;
    let listener = TcpListener::bind("127.0.0.1:0").await?;
    let port = listener.local_addr()?.port();
    drop(listener);
    Ok(port)
}

async fn wait_for_health(url: &str, timeout_secs: u64) -> Result<(), anyhow::Error> {
    let health_url = format!("{}/global/health", url);
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(2))
        .build()?;

    let start = std::time::Instant::now();
    loop {
        if start.elapsed().as_secs() > timeout_secs {
            return Err(anyhow::anyhow!("server health check timed out after {}s", timeout_secs));
        }
        match client.get(&health_url).send().await {
            Ok(resp) if resp.status().is_success() => return Ok(()),
            _ => tokio::time::sleep(std::time::Duration::from_millis(500)).await,
        }
    }
}
