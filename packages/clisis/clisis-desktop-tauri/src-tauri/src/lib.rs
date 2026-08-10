mod commands;
mod pty;
mod sidecar;
mod platform;

use tauri::Manager;

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_process::init())
        .plugin(tauri_plugin_store::Builder::default().build())
        .plugin(tauri_plugin_updater::Builder::default().build())
        .setup(|app| {
            let handle = app.handle().clone();

            // Initialize sidecar state
            let sidecar_state = sidecar::SidecarState::default();
            app.manage(sidecar_state);

            // Initialize PTY state with app handle for event emission
            let pty_state = pty::PtyState::new(handle);
            app.manage(pty_state);

            log::info!("Clisis Coder Desktop (Tauri) initialized");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            commands::start_clisis_coder_server,
            commands::stop_clisis_coder_server,
            commands::get_server_status,
            commands::pty_create,
            commands::pty_write,
            commands::pty_resize,
            commands::pty_kill,
            commands::get_platform_info,
            commands::open_link,
            commands::show_notification,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
