use crate::platform;
use crate::pty::{self, PtyState};
use crate::sidecar::{self, SidecarState};
use serde::{Deserialize, Serialize};
use std::sync::Arc;
use tauri::State;

#[derive(Serialize)]
pub struct ServerStatus {
    pub running: bool,
    pub url: Option<String>,
    pub port: Option<u16>,
    pub pid: Option<u32>,
}

#[derive(Serialize)]
pub struct PlatformInfo {
    pub os: String,
    pub arch: String,
    pub hostname: String,
}

// ── Sidecar (clisis-coder server) commands ─────────────

#[tauri::command]
pub async fn start_clisis_coder_server(
    state: State<'_, Arc<SidecarState>>,
    port: Option<u16>,
) -> Result<ServerStatus, String> {
    let port = port.unwrap_or(0);
    let result = sidecar::start_server(&state, port)
        .await
        .map_err(|e| e.to_string())?;
    Ok(ServerStatus {
        running: true,
        url: Some(result.url.clone()),
        port: Some(result.port),
        pid: Some(result.pid),
    })
}

#[tauri::command]
pub async fn stop_clisis_coder_server(state: State<'_, Arc<SidecarState>>) -> Result<(), String> {
    sidecar::stop_server(&state)
        .await
        .map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn get_server_status(state: State<'_, Arc<SidecarState>>) -> ServerStatus {
    let status = state.status.lock().unwrap();
    ServerStatus {
        running: status.running,
        url: status.url.clone(),
        port: status.port,
        pid: status.pid,
    }
}

// ── PTY terminal commands ──────────────────────────

#[tauri::command]
pub async fn pty_create(
    state: State<'_, Arc<PtyState>>,
    id: String,
    rows: u16,
    cols: u16,
    cwd: Option<String>,
) -> Result<(), String> {
    pty::create_session(&state, &id, rows, cols, cwd).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn pty_write(
    state: State<'_, Arc<PtyState>>,
    id: String,
    data: String,
) -> Result<(), String> {
    pty::write_to_session(&state, &id, &data).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn pty_resize(
    state: State<'_, Arc<PtyState>>,
    id: String,
    rows: u16,
    cols: u16,
) -> Result<(), String> {
    pty::resize_session(&state, &id, rows, cols).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn pty_kill(state: State<'_, Arc<PtyState>>, id: String) -> Result<(), String> {
    pty::kill_session(&state, &id).map_err(|e| e.to_string())
}

// ── Platform commands ──────────────────────────────

#[tauri::command]
pub async fn get_platform_info() -> PlatformInfo {
    let info = platform::get_info();
    PlatformInfo {
        os: info.os,
        arch: info.arch,
        hostname: info.hostname,
    }
}

#[tauri::command]
pub async fn open_link(url: String) -> Result<(), String> {
    open::that(&url).map_err(|e| e.to_string())
}

#[tauri::command]
pub async fn show_notification(title: String, body: String) -> Result<(), String> {
    // Notifications are handled via the tauri-plugin-notification
    // This command is a fallback for programmatic use
    log::info!("Notification: {} - {}", title, body);
    Ok(())
}
