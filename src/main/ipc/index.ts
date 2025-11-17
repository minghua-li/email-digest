import { ipcMain } from 'electron';
import { WindowManager } from '../window/WindowManager';
import { StorageManager } from '../storage/StorageManager';
import { IPCChannel } from '@shared/types';
import type { APIResponse, DigestData, SearchParams } from '@shared/types';

/**
 * 设置所有IPC通信处理器
 */
export function setupIPC(windowManager: WindowManager, storageManager: StorageManager): void {
  // 窗口控制
  ipcMain.handle(IPCChannel.WINDOW_MINIMIZE, () => {
    windowManager.minimize();
    return { success: true };
  });

  ipcMain.handle(IPCChannel.WINDOW_MAXIMIZE, () => {
    windowManager.toggleMaximize();
    return { success: true };
  });

  ipcMain.handle(IPCChannel.WINDOW_CLOSE, () => {
    windowManager.close();
    return { success: true };
  });

  // 浏览器导航
  ipcMain.handle(IPCChannel.WINDOW_NAVIGATE, async (_, url: string) => {
    try {
      windowManager.navigate(url);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Navigation failed',
      };
    }
  });

  ipcMain.handle(IPCChannel.WINDOW_GO_BACK, () => {
    windowManager.goBack();
    return { success: true };
  });

  ipcMain.handle(IPCChannel.WINDOW_GO_FORWARD, () => {
    windowManager.goForward();
    return { success: true };
  });

  ipcMain.handle(IPCChannel.WINDOW_RELOAD, () => {
    windowManager.reload();
    return { success: true };
  });

  // 页面捕获
  ipcMain.handle(IPCChannel.CAPTURE_PAGE, async (): Promise<APIResponse> => {
    try {
      const html = await windowManager.getPageHTML();
      const url = windowManager.getCurrentURL();
      const title = windowManager.getCurrentTitle();

      // TODO: 这里需要调用内容提取和处理逻辑
      // 暂时返回基础数据
      return {
        success: true,
        data: {
          html,
          url,
          title,
        },
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Capture failed',
      };
    }
  });

  // 配置管理
  ipcMain.handle(IPCChannel.CONFIG_GET, async () => {
    const paths = storageManager.getStoragePaths();
    return {
      success: true,
      data: {
        email: undefined,
        llm: undefined,
        storage: paths,
        ui: {
          theme: 'system' as const,
          sidebarWidth: 320,
        },
      },
    };
  });

  ipcMain.handle(IPCChannel.CONFIG_SET, async (_, config) => {
    // TODO: 实现配置保存到文件
    return { success: true };
  });

  // 文摘管理
  ipcMain.handle(IPCChannel.DIGEST_LIST, async () => {
    try {
      const digests = await storageManager.getDigestList();
      return {
        success: true,
        data: digests,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load digests',
      };
    }
  });

  ipcMain.handle(IPCChannel.DIGEST_GET, async (_, id: string) => {
    try {
      const digest = await storageManager.getDigest(id);
      if (digest) {
        return {
          success: true,
          data: digest,
        };
      } else {
        return {
          success: false,
          error: 'Digest not found',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to load digest',
      };
    }
  });

  ipcMain.handle(IPCChannel.DIGEST_SAVE, async (_, digest: DigestData) => {
    try {
      await storageManager.saveDigest(digest);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to save digest',
      };
    }
  });

  ipcMain.handle(IPCChannel.DIGEST_DELETE, async (_, id: string) => {
    try {
      await storageManager.deleteDigest(id);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to delete digest',
      };
    }
  });

  ipcMain.handle(IPCChannel.DIGEST_UPDATE, async (_, digest: DigestData) => {
    try {
      await storageManager.updateDigest(digest);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to update digest',
      };
    }
  });

  ipcMain.handle(IPCChannel.DIGEST_SEARCH, async (_, params: SearchParams) => {
    try {
      const results = await storageManager.searchDigests(params);
      return {
        success: true,
        data: results,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to search digests',
      };
    }
  });

  // 邮件同步
  ipcMain.handle(IPCChannel.EMAIL_SYNC, async () => {
    // TODO: 实现邮件同步
    return { success: true };
  });

  ipcMain.handle(IPCChannel.EMAIL_SEND, async (_, data) => {
    // TODO: 实现邮件发送
    return { success: true };
  });

  ipcMain.handle(IPCChannel.EMAIL_FETCH, async () => {
    // TODO: 实现邮件获取
    return {
      success: true,
      data: [],
    };
  });

  // LLM
  ipcMain.handle(IPCChannel.LLM_SUMMARIZE, async (_, content: string) => {
    // TODO: 实现LLM摘要
    return {
      success: false,
      error: 'LLM not configured',
    };
  });
}
