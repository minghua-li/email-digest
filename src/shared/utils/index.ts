import { randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from 'crypto';
import {
  PBKDF2_ITERATIONS,
  ENCRYPTION_ALGORITHM,
  SALT_LENGTH,
  IV_LENGTH,
} from '../constants';

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
 * 从PIN码派生加密密钥
 */
export function deriveKeyFromPIN(pin: string, salt: Buffer): Buffer {
  return pbkdf2Sync(pin, salt, PBKDF2_ITERATIONS, 32, 'sha256');
}

/**
 * 生成随机盐值
 */
export function generateSalt(): Buffer {
  return randomBytes(SALT_LENGTH);
}

/**
 * 加密数据
 */
export function encrypt(data: string, key: Buffer): {
  encrypted: string;
  iv: string;
  authTag: string;
} {
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, key, iv);

  let encrypted = cipher.update(data, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted,
    iv: iv.toString('hex'),
    authTag: authTag.toString('hex'),
  };
}

/**
 * 解密数据
 */
export function decrypt(
  encrypted: string,
  key: Buffer,
  iv: string,
  authTag: string
): string {
  const decipher = createDecipheriv(
    ENCRYPTION_ALGORITHM,
    key,
    Buffer.from(iv, 'hex')
  );

  decipher.setAuthTag(Buffer.from(authTag, 'hex'));

  let decrypted = decipher.update(encrypted, 'hex', 'utf8');
  decrypted += decipher.final('utf8');

  return decrypted;
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
