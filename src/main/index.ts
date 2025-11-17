import { app, BrowserWindow } from 'electron';
import { WindowManager } from './window/WindowManager';
import { setupIPC } from './ipc';
import { StorageManager } from './storage/StorageManager';

// 防止应用多开
const gotTheLock = app.requestSingleInstanceLock();

if (!gotTheLock) {
  app.quit();
} else {
  let windowManager: WindowManager;
  let storageManager: StorageManager;

  // 当第二个实例启动时，聚焦到主窗口
  app.on('second-instance', () => {
    if (windowManager) {
      windowManager.focusMainWindow();
    }
  });

  // 应用准备就绪
  app.whenReady().then(async () => {
    // 初始化存储管理器
    storageManager = new StorageManager();
    await storageManager.initialize();

    // 初始化窗口管理器
    windowManager = new WindowManager();
    windowManager.createMainWindow();

    // 设置IPC通信
    setupIPC(windowManager, storageManager);

    // macOS: 当所有窗口关闭后，应用不退出
    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        windowManager.createMainWindow();
      }
    });
  });

  // 所有窗口关闭时退出（macOS除外）
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  // 应用退出前清理
  app.on('before-quit', () => {
    // 这里可以添加清理逻辑，如保存状态等
  });
}
