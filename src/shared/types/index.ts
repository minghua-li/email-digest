// 文摘数据结构
export interface DigestData {
  id: string; // UUID
  title: string; // 页面标题
  url: string; // 原始URL
  content: string; // 提取的正文内容（纯文本或Markdown）
  html: string; // 完整HTML
  author?: string; // 作者信息
  siteName?: string; // 网站名称
  excerpt?: string; // 摘要
  images: ImageData[]; // 图片列表
  metadata: PageMetadata; // 元数据
  createdAt: string; // 创建时间 ISO8601
  updatedAt: string; // 更新时间 ISO8601
  summary?: string; // AI生成的摘要
  tags?: string[]; // 标签
}

// 图片数据
export interface ImageData {
  id: string; // 图片ID
  url: string; // 原始URL
  width?: number;
  height?: number;
  alt?: string;
  mimeType: string;
  size: number; // 字节大小
  base64?: string; // Base64编码的图片数据（当需要存储时）
}

// 页面元数据
export interface PageMetadata {
  charset?: string;
  language?: string;
  publishedTime?: string;
  modifiedTime?: string;
  keywords?: string[];
  description?: string;
}

// 邮箱配置
export interface EmailConfig {
  smtp: SmtpConfig;
  imap: ImapConfig;
}

export interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean; // 使用SSL/TLS
  auth: {
    user: string;
    pass: string;
  };
}

export interface ImapConfig {
  host: string;
  port: number;
  secure: boolean;
  auth: {
    user: string;
    pass: string;
  };
  folder: string; // 邮件文件夹，如 'INBOX'
}

// 应用配置
export interface AppConfig {
  email?: EmailConfig;
  llm?: LLMConfig;
  storage: {
    dataPath: string; // 本地数据存储路径
    cachePath: string; // 缓存路径
  };
  ui: {
    theme: 'light' | 'dark' | 'system';
    sidebarWidth: number;
  };
}

export interface LLMConfig {
  provider: 'openai' | 'anthropic' | 'custom';
  apiKey: string;
  apiUrl?: string; // 自定义API地址
  model: string;
  maxTokens?: number;
}

// IPC 通信消息类型
export enum IPCChannel {
  // 窗口管理
  WINDOW_MINIMIZE = 'window:minimize',
  WINDOW_MAXIMIZE = 'window:maximize',
  WINDOW_CLOSE = 'window:close',
  WINDOW_NAVIGATE = 'window:navigate',
  WINDOW_GO_BACK = 'window:goBack',
  WINDOW_GO_FORWARD = 'window:goForward',
  WINDOW_RELOAD = 'window:reload',

  // 内容捕获
  CAPTURE_PAGE = 'capture:page',
  CAPTURE_SELECTION = 'capture:selection',

  // 文摘管理
  DIGEST_SAVE = 'digest:save',
  DIGEST_LIST = 'digest:list',
  DIGEST_GET = 'digest:get',
  DIGEST_DELETE = 'digest:delete',
  DIGEST_UPDATE = 'digest:update',
  DIGEST_SEARCH = 'digest:search',

  // 邮件同步
  EMAIL_SYNC = 'email:sync',
  EMAIL_SEND = 'email:send',
  EMAIL_FETCH = 'email:fetch',

  // 配置管理
  CONFIG_GET = 'config:get',
  CONFIG_SET = 'config:set',

  // LLM
  LLM_SUMMARIZE = 'llm:summarize',
}

// API 响应类型
export interface APIResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// 文摘列表项（用于列表显示）
export interface DigestListItem {
  id: string;
  title: string;
  url: string;
  excerpt?: string;
  siteName?: string;
  createdAt: string;
  tags?: string[];
  hasSummary: boolean;
}

// 搜索参数
export interface SearchParams {
  keyword?: string;
  tags?: string[];
  startDate?: string;
  endDate?: string;
  limit?: number;
  offset?: number;
}
