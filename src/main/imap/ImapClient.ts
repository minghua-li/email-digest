import Imap from 'imap';
import { simpleParser } from 'mailparser';
import type { ImapConfig, DigestData } from '@shared/types';
import { EMAIL_HTML_TYPE, EMAIL_JSON_TYPE, EMAIL_IMAGE_TYPE } from '@shared/constants';
import { parseEmailSubject } from '@shared/utils';

interface EmailMessage {
  uid: number;
  subject: string;
  body: string;
  html?: string;
}

export class ImapClient {
  private imap: Imap | null = null;
  private config: ImapConfig | null = null;

  /**
   * 初始化IMAP客户端
   */
  async initialize(config: ImapConfig): Promise<void> {
    this.config = config;

    this.imap = new Imap({
      user: config.auth.user,
      password: config.auth.pass,
      host: config.host,
      port: config.port,
      tls: config.secure,
      tlsOptions: { rejectUnauthorized: false },
    });

    // 等待连接建立
    await new Promise<void>((resolve, reject) => {
      if (!this.imap) return reject(new Error('IMAP not initialized'));

      this.imap.once('ready', () => resolve());
      this.imap.once('error', (err) => reject(err));
      this.imap.connect();
    });
  }

  /**
   * 获取所有文摘邮件
   */
  async fetchDigests(): Promise<DigestData[]> {
    if (!this.imap) {
      throw new Error('IMAP client not initialized');
    }

    // 获取所有EmailDigest相关的邮件
    const messages = await this.searchMessages('[EmailDigest]');

    // 按文摘ID分组
    const digestMap = new Map<string, {
      html?: string;
      json?: DigestData;
      images: Map<string, string[]>;
    }>();

    for (const msg of messages) {
      const parsed = parseEmailSubject(msg.subject);
      if (!parsed.id || !parsed.type) continue;

      const digestId = parsed.id;

      if (!digestMap.has(digestId)) {
        digestMap.set(digestId, { images: new Map() });
      }

      const digestData = digestMap.get(digestId)!;

      if (parsed.type === EMAIL_HTML_TYPE) {
        digestData.html = msg.html || msg.body;
      } else if (parsed.type === EMAIL_JSON_TYPE) {
        try {
          const jsonStr = Buffer.from(msg.body, 'base64').toString('utf8');
          digestData.json = JSON.parse(jsonStr);
        } catch (error) {
          console.error('Failed to parse JSON digest:', error);
        }
      } else if (parsed.type === EMAIL_IMAGE_TYPE) {
        // 处理图片邮件
        try {
          const imageData = JSON.parse(msg.body);
          const { imageId, partIndex, data } = imageData;

          if (!digestData.images.has(imageId)) {
            digestData.images.set(imageId, []);
          }

          const parts = digestData.images.get(imageId)!;
          parts[partIndex] = data;
        } catch (error) {
          console.error('Failed to parse image email:', error);
        }
      }
    }

    // 重组完整的文摘数据
    const digests: DigestData[] = [];

    for (const [, data] of digestMap.entries()) {
      if (data.json) {
        // 如果有图片数据，合并到JSON中
        if (data.images.size > 0) {
          for (const [imageId, parts] of data.images.entries()) {
            const base64 = parts.join('');
            const image = data.json.images.find((img) => img.id === imageId);
            if (image) {
              image.base64 = base64;
            }
          }
        }

        digests.push(data.json);
      }
    }

    return digests;
  }

  /**
   * 搜索邮件
   */
  private async searchMessages(searchTerm: string): Promise<EmailMessage[]> {
    if (!this.imap || !this.config) {
      throw new Error('IMAP client not initialized');
    }

    return new Promise((resolve, reject) => {
      if (!this.imap) return reject(new Error('IMAP not initialized'));

      this.imap.openBox(this.config!.folder, false, (err) => {
        if (err) return reject(err);

        // 搜索包含特定主题的邮件
        this.imap!.search([['SUBJECT', searchTerm]], (err, results) => {
          if (err) return reject(err);
          if (!results || results.length === 0) return resolve([]);

          const messages: EmailMessage[] = [];
          const fetch = this.imap!.fetch(results, {
            bodies: ['HEADER.FIELDS (SUBJECT)', 'TEXT'],
            struct: true,
          });

          fetch.on('message', (msg, seqno) => {
            const message: Partial<EmailMessage> = { uid: seqno };

            msg.on('body', (stream, info) => {
              let buffer = '';

              stream.on('data', (chunk) => {
                buffer += chunk.toString('utf8');
              });

              stream.once('end', async () => {
                if (info.which === 'TEXT') {
                  try {
                    const parsed = await simpleParser(buffer);
                    message.body = parsed.text || '';
                    message.html = parsed.html || undefined;
                  } catch (error) {
                    console.error('Failed to parse email body:', error);
                  }
                } else {
                  // 解析主题
                  const match = buffer.match(/Subject: (.+)/i);
                  if (match) {
                    message.subject = match[1].trim();
                  }
                }
              });
            });

            msg.once('end', () => {
              if (message.subject && message.body) {
                messages.push(message as EmailMessage);
              }
            });
          });

          fetch.once('error', (err) => reject(err));
          fetch.once('end', () => resolve(messages));
        });
      });
    });
  }

  /**
   * 删除邮件
   */
  async deleteMessage(uid: number): Promise<void> {
    if (!this.imap || !this.config) {
      throw new Error('IMAP client not initialized');
    }

    return new Promise((resolve, reject) => {
      if (!this.imap) return reject(new Error('IMAP not initialized'));

      this.imap.openBox(this.config!.folder, false, (err) => {
        if (err) return reject(err);

        this.imap!.addFlags(uid, ['\\Deleted'], (err) => {
          if (err) return reject(err);

          this.imap!.expunge((err) => {
            if (err) return reject(err);
            resolve();
          });
        });
      });
    });
  }

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    if (this.imap) {
      this.imap.end();
      this.imap = null;
    }
  }
}
