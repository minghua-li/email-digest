import { contextBridge, ipcRenderer } from 'electron';
import { IPCChannel } from '@shared/types';
import type { APIResponse, DigestData, SearchParams, AppConfig } from '@shared/types';

// 定义暴露给渲染进程的API
const electronAPI = {
  // 窗口控制
  window: {
    minimize: () => ipcRenderer.invoke(IPCChannel.WINDOW_MINIMIZE),
    maximize: () => ipcRenderer.invoke(IPCChannel.WINDOW_MAXIMIZE),
    close: () => ipcRenderer.invoke(IPCChannel.WINDOW_CLOSE),
  },

  // 浏览器导航
  browser: {
    navigate: (url: string) => ipcRenderer.invoke(IPCChannel.WINDOW_NAVIGATE, url),
    goBack: () => ipcRenderer.invoke(IPCChannel.WINDOW_GO_BACK),
    goForward: () => ipcRenderer.invoke(IPCChannel.WINDOW_GO_FORWARD),
    reload: () => ipcRenderer.invoke(IPCChannel.WINDOW_RELOAD),
  },

  // 内容捕获
  capture: {
    page: (): Promise<APIResponse> => ipcRenderer.invoke(IPCChannel.CAPTURE_PAGE),
    selection: (): Promise<APIResponse> => ipcRenderer.invoke(IPCChannel.CAPTURE_SELECTION),
  },

  // 文摘管理
  digest: {
    list: (): Promise<APIResponse> => ipcRenderer.invoke(IPCChannel.DIGEST_LIST),
    get: (id: string): Promise<APIResponse> => ipcRenderer.invoke(IPCChannel.DIGEST_GET, id),
    save: (digest: DigestData): Promise<APIResponse> =>
      ipcRenderer.invoke(IPCChannel.DIGEST_SAVE, digest),
    delete: (id: string): Promise<APIResponse> =>
      ipcRenderer.invoke(IPCChannel.DIGEST_DELETE, id),
    update: (digest: DigestData): Promise<APIResponse> =>
      ipcRenderer.invoke(IPCChannel.DIGEST_UPDATE, digest),
    search: (params: SearchParams): Promise<APIResponse> =>
      ipcRenderer.invoke(IPCChannel.DIGEST_SEARCH, params),
  },

  // 邮件同步
  email: {
    sync: (): Promise<APIResponse> => ipcRenderer.invoke(IPCChannel.EMAIL_SYNC),
    send: (data: unknown): Promise<APIResponse> => ipcRenderer.invoke(IPCChannel.EMAIL_SEND, data),
    fetch: (): Promise<APIResponse> => ipcRenderer.invoke(IPCChannel.EMAIL_FETCH),
  },

  // 配置管理
  config: {
    get: (): Promise<APIResponse<AppConfig>> => ipcRenderer.invoke(IPCChannel.CONFIG_GET),
    set: (config: Partial<AppConfig>): Promise<APIResponse> =>
      ipcRenderer.invoke(IPCChannel.CONFIG_SET, config),
  },

  // LLM
  llm: {
    summarize: (content: string): Promise<APIResponse> =>
      ipcRenderer.invoke(IPCChannel.LLM_SUMMARIZE, content),
  },
};

// 将API暴露给渲染进程
contextBridge.exposeInMainWorld('electron', electronAPI);

// 类型声明，供TypeScript使用
export type ElectronAPI = typeof electronAPI;
