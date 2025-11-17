import { randomBytes, pbkdf2Sync, createCipheriv, createDecipheriv } from 'crypto';
import {
  PBKDF2_ITERATIONS,
  ENCRYPTION_ALGORITHM,
  SALT_LENGTH,
  IV_LENGTH,
} from '@shared/constants';

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
