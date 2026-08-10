use portable_pty::{CommandBuilder, NativePtySystem, PtyPair, PtySize, PtySystem};
use serde::Serialize;
use std::collections::HashMap;
use std::sync::{Arc, Mutex};
use tauri::{AppHandle, Emitter};

#[derive(Serialize, Clone)]
pub struct PtyOutputEvent {
    pub id: String,
    pub data: String,
}

pub struct PtySession {
    pub pair: PtyPair,
    pub _child_killer: Box<dyn portable_pty::ChildKiller + Send>,
    pub _reader: Option<std::thread::JoinHandle<()>>,
}

pub struct PtyState {
    pub sessions: Mutex<HashMap<String, PtySession>>,
    pub app_handle: AppHandle,
}

impl PtyState {
    pub fn new(app_handle: AppHandle) -> Arc<Self> {
        Arc::new(Self {
            sessions: Mutex::new(HashMap::new()),
            app_handle,
        })
    }
}

pub fn create_session(
    state: &PtyState,
    id: &str,
    rows: u16,
    cols: u16,
    cwd: Option<String>,
) -> Result<(), anyhow::Error> {
    let pty_system = NativePtySystem::default()?;
    let pair = pty_system.openpty(PtySize {
        rows,
        cols,
        pixel_width: 0,
        pixel_height: 0,
    })?;

    let shell = if cfg!(target_os = "windows") {
        "cmd.exe"
    } else {
        std::env::var("SHELL").unwrap_or_else(|_| "/bin/bash".to_string())
    };

    let mut cmd = CommandBuilder::new(shell);
    cmd.cwd(
        cwd.unwrap_or_else(|| {
            std::env::current_dir()
                .unwrap()
                .to_string_lossy()
                .to_string()
        }),
    );

    let child = pair.slave.spawn_command(cmd)?;

    // Reader thread emits events to the webview
    let mut reader = pair.master.try_clone_reader()?;
    let app_handle = state.app_handle.clone();
    let session_id = id.to_string();
    let emitter_id = format!("pty-output-{}", session_id);

    let reader_handle = std::thread::spawn(move || {
        let mut buf = [0u8; 65536];
        loop {
            match reader.read(&mut buf) {
                Ok(0) => break,
                Ok(n) => {
                    let _ = app_handle.emit(
                        &emitter_id,
                        PtyOutputEvent {
                            id: session_id.clone(),
                            data: String::from_utf8_lossy(&buf[..n]).to_string(),
                        },
                    );
                }
                Err(e) => {
                    log::error!("[pty {}] read error: {}", session_id, e);
                    break;
                }
            }
        }
    });

    let mut sessions = state.sessions.lock().unwrap();
    sessions.insert(
        id.to_string(),
        PtySession {
            pair,
            _child_killer: child.killer(),
            _reader: Some(reader_handle),
        },
    );

    Ok(())
}

pub fn write_to_session(state: &PtyState, id: &str, data: &str) -> Result<(), anyhow::Error> {
    use std::io::Write;
    let sessions = state.sessions.lock().unwrap();
    let session = sessions
        .get(id)
        .ok_or_else(|| anyhow::anyhow!("PTY session not found: {}", id))?;
    let mut writer = session.pair.master.try_clone_writer()?;
    writer.write_all(data.as_bytes())?;
    Ok(())
}

pub fn resize_session(
    state: &PtyState,
    id: &str,
    rows: u16,
    cols: u16,
) -> Result<(), anyhow::Error> {
    let sessions = state.sessions.lock().unwrap();
    let session = sessions
        .get(id)
        .ok_or_else(|| anyhow::anyhow!("PTY session not found: {}", id))?;
    session
        .pair
        .master
        .resize(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| anyhow::anyhow!("resize failed: {}", e))?;
    Ok(())
}

pub fn kill_session(state: &PtyState, id: &str) -> Result<(), anyhow::Error> {
    let mut sessions = state.sessions.lock().unwrap();
    if let Some(session) = sessions.remove(id) {
        session
            ._child_killer
            .kill()
            .map_err(|e| anyhow::anyhow!("kill failed: {}", e))?;
    }
    Ok(())
}
