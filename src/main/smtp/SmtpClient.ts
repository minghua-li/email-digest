import nodemailer from 'nodemailer';
import type { Transporter } from 'nodemailer';
import type { SmtpConfig, DigestData, ImageData } from '@shared/types';
import {
  getEmailSubject,
  EMAIL_HTML_TYPE,
  EMAIL_JSON_TYPE,
  EMAIL_IMAGE_TYPE,
  MAX_IMAGE_SIZE,
} from '@shared/constants';
import { formatDate } from '@shared/utils';

export class SmtpClient {
  private transporter: Transporter | null = null;
  private config: SmtpConfig | null = null;

  /**
   * 初始化SMTP客户端
   */
  async initialize(config: SmtpConfig): Promise<void> {
    this.config = config;

    this.transporter = nodemailer.createTransport({
      host: config.host,
      port: config.port,
      secure: config.secure,
      auth: {
        user: config.auth.user,
        pass: config.auth.pass,
      },
    });

    // 验证连接
    await this.transporter.verify();
  }

  /**
   * 发送文摘邮件（HTML格式）
   */
  async sendHtmlDigest(digest: DigestData): Promise<void> {
    if (!this.transporter || !this.config) {
      throw new Error('SMTP client not initialized');
    }

    const subject = getEmailSubject(
      EMAIL_HTML_TYPE,
      digest.title,
      formatDate(new Date(digest.createdAt)),
      digest.id
    );

    const html = this.formatHtmlEmail(digest);

    await this.transporter.sendMail({
      from: this.config.auth.user,
      to: this.config.auth.user, // 发送给自己
      subject,
      html,
    });
  }

  /**
   * 发送文摘邮件（JSON格式）
   */
  async sendJsonDigest(digest: DigestData): Promise<void> {
    if (!this.transporter || !this.config) {
      throw new Error('SMTP client not initialized');
    }

    const subject = getEmailSubject(
      EMAIL_JSON_TYPE,
      digest.title,
      formatDate(new Date(digest.createdAt)),
      digest.id
    );

    // 将JSON数据转换为Base64
    const jsonData = JSON.stringify(digest, null, 2);
    const base64Data = Buffer.from(jsonData).toString('base64');

    await this.transporter.sendMail({
      from: this.config.auth.user,
      to: this.config.auth.user,
      subject,
      text: base64Data,
    });
  }

  /**
   * 发送图片邮件
   */
  async sendImageEmails(digest: DigestData): Promise<void> {
    if (!this.transporter || !this.config) {
      throw new Error('SMTP client not initialized');
    }

    const largeImages = digest.images.filter((img) => img.size > MAX_IMAGE_SIZE);

    for (const image of largeImages) {
      const subject = getEmailSubject(
        EMAIL_IMAGE_TYPE,
        `${digest.title} - ${image.id}`,
        formatDate(new Date(digest.createdAt)),
        digest.id
      );

      // 将图片分块发送（如果超过5MB）
      if (image.base64) {
        const chunks = this.chunkBase64(image.base64, MAX_IMAGE_SIZE);

        for (let i = 0; i < chunks.length; i++) {
          const chunkSubject = `${subject} - Part ${i + 1}/${chunks.length}`;

          await this.transporter.sendMail({
            from: this.config.auth.user,
            to: this.config.auth.user,
            subject: chunkSubject,
            text: JSON.stringify({
              imageId: image.id,
              digestId: digest.id,
              partIndex: i,
              totalParts: chunks.length,
              mimeType: image.mimeType,
              data: chunks[i],
            }),
          });
        }
      }
    }
  }

  /**
   * 发送完整文摘（HTML + JSON + 图片）
   */
  async sendDigest(digest: DigestData): Promise<void> {
    // 发送HTML格式
    await this.sendHtmlDigest(digest);

    // 发送JSON格式
    await this.sendJsonDigest(digest);

    // 发送大图片
    const hasLargeImages = digest.images.some((img) => img.size > MAX_IMAGE_SIZE);
    if (hasLargeImages) {
      await this.sendImageEmails(digest);
    }
  }

  /**
   * 格式化HTML邮件内容
   */
  private formatHtmlEmail(digest: DigestData): string {
    return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>${digest.title}</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      max-width: 800px;
      margin: 0 auto;
      padding: 20px;
      color: #333;
    }
    h1 {
      color: #2563eb;
      border-bottom: 2px solid #2563eb;
      padding-bottom: 10px;
    }
    .metadata {
      background: #f3f4f6;
      padding: 15px;
      border-radius: 5px;
      margin: 20px 0;
    }
    .metadata p {
      margin: 5px 0;
    }
    .content {
      margin-top: 30px;
    }
    .summary {
      background: #eff6ff;
      border-left: 4px solid #2563eb;
      padding: 15px;
      margin: 20px 0;
    }
    .tags {
      margin: 20px 0;
    }
    .tag {
      display: inline-block;
      background: #e5e7eb;
      padding: 5px 10px;
      border-radius: 3px;
      margin-right: 5px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <h1>${digest.title}</h1>

  <div class="metadata">
    <p><strong>URL:</strong> <a href="${digest.url}">${digest.url}</a></p>
    <p><strong>作者:</strong> ${digest.author || '未知'}</p>
    <p><strong>网站:</strong> ${digest.siteName || '未知'}</p>
    <p><strong>创建时间:</strong> ${digest.createdAt}</p>
    ${digest.metadata.publishedTime ? `<p><strong>发布时间:</strong> ${digest.metadata.publishedTime}</p>` : ''}
  </div>

  ${
    digest.summary
      ? `
  <div class="summary">
    <h3>AI 摘要</h3>
    <p>${digest.summary}</p>
  </div>
  `
      : ''
  }

  ${
    digest.tags && digest.tags.length > 0
      ? `
  <div class="tags">
    ${digest.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}
  </div>
  `
      : ''
  }

  <div class="content">
    ${digest.html}
  </div>
</body>
</html>
    `.trim();
  }

  /**
   * 将Base64字符串分块
   */
  private chunkBase64(base64: string, maxSize: number): string[] {
    const chunks: string[] = [];
    const chunkSize = Math.floor((maxSize * 3) / 4); // Base64编码后大小约为原始大小的4/3

    for (let i = 0; i < base64.length; i += chunkSize) {
      chunks.push(base64.substring(i, i + chunkSize));
    }

    return chunks;
  }

  /**
   * 关闭连接
   */
  async close(): Promise<void> {
    if (this.transporter) {
      this.transporter.close();
      this.transporter = null;
    }
  }
}
