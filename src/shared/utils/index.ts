/**
 * 生成UUID v4
 */
export function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/**
 * 格式化日期为 ISO8601 字符串
 */
export function formatDate(date: Date = new Date()): string {
  return date.toISOString();
}

/**
 * 格式化日期为可读字符串
 */
export function formatReadableDate(isoDate: string): string {
  const date = new Date(isoDate);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * 截断文本到指定长度
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
}

/**
 * 清理文件名中的非法字符
 */
export function sanitizeFilename(filename: string): string {
  return filename.replace(/[<>:"/\\|?*\x00-\x1F]/g, '_');
}

/**
 * 计算字符串的字节大小
 */
export function getByteSize(str: string): number {
  return Buffer.byteLength(str, 'utf8');
}

/**
 * 将字节大小格式化为可读字符串
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

/**
 * 解析邮件主题，提取类型、标题、日期和ID
 */
export function parseEmailSubject(subject: string): {
  type: string | null;
  title: string | null;
  date: string | null;
  id: string | null;
} {
  const regex = /\[EmailDigest\]\[(\w+)\]\s+(.+?)\s+-\s+(.+?)\s+-\s+([a-f0-9-]+)$/;
  const match = subject.match(regex);

  if (!match) {
    return { type: null, title: null, date: null, id: null };
  }

  return {
    type: match[1],
    title: match[2],
    date: match[3],
    id: match[4],
  };
}

/**
 * 验证邮箱地址格式
 */
export function isValidEmail(email: string): boolean {
  const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return regex.test(email);
}

/**
 * 等待指定时间
 */
export function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
