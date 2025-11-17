// 应用常量
export const APP_NAME = 'Email Digest Browser';
export const APP_VERSION = '0.1.0';

// 邮件主题前缀
export const EMAIL_SUBJECT_PREFIX = '[EmailDigest]';
export const EMAIL_HTML_TYPE = 'HTML';
export const EMAIL_JSON_TYPE = 'JSON';
export const EMAIL_IMAGE_TYPE = 'IMAGE';

// 邮件主题格式: [EmailDigest][TYPE] title - date - id
export const getEmailSubject = (
  type: string,
  title: string,
  date: string,
  id: string
): string => {
  return `${EMAIL_SUBJECT_PREFIX}[${type}] ${title} - ${date} - ${id}`;
};

// 图片存储限制
export const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
export const SUPPORTED_IMAGE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'image/svg+xml',
];

// 文件路径
export const DATA_FOLDER = 'data';
export const CACHE_FOLDER = 'cache';
export const METADATA_FILE = 'metadata.json';
export const CONFIG_FILE = 'config.json';

// UI 常量
export const DEFAULT_SIDEBAR_WIDTH = 320;
export const MIN_SIDEBAR_WIDTH = 240;
export const MAX_SIDEBAR_WIDTH = 600;

// 加密相关
export const PBKDF2_ITERATIONS = 100000;
export const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
export const SALT_LENGTH = 32;
export const IV_LENGTH = 16;
export const AUTH_TAG_LENGTH = 16;

// LLM 默认配置
export const DEFAULT_LLM_MAX_TOKENS = 1000;
export const DEFAULT_LLM_MODEL = 'gpt-3.5-turbo';

// 分页
export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;
