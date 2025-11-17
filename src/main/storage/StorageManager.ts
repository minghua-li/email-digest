import fs from 'fs/promises';
import path from 'path';
import { app } from 'electron';
import type { DigestData, DigestListItem, SearchParams } from '@shared/types';
import { DATA_FOLDER, CACHE_FOLDER, METADATA_FILE } from '@shared/constants';
import { sanitizeFilename } from '@shared/utils';

interface MetadataIndex {
  digests: DigestListItem[];
  lastSync: string | null;
}

export class StorageManager {
  private dataPath: string;
  private cachePath: string;
  private metadataPath: string;
  private metadata: MetadataIndex = { digests: [], lastSync: null };

  constructor() {
    const userDataPath = app.getPath('userData');
    this.dataPath = path.join(userDataPath, DATA_FOLDER);
    this.cachePath = path.join(userDataPath, CACHE_FOLDER);
    this.metadataPath = path.join(this.dataPath, METADATA_FILE);
  }

  /**
   * 初始化存储
   */
  async initialize(): Promise<void> {
    // 创建必要的目录
    await fs.mkdir(this.dataPath, { recursive: true });
    await fs.mkdir(this.cachePath, { recursive: true });

    // 加载元数据
    await this.loadMetadata();
  }

  /**
   * 加载元数据索引
   */
  private async loadMetadata(): Promise<void> {
    try {
      const data = await fs.readFile(this.metadataPath, 'utf8');
      this.metadata = JSON.parse(data);
    } catch (error) {
      // 文件不存在或解析失败，使用默认值
      this.metadata = { digests: [], lastSync: null };
      await this.saveMetadata();
    }
  }

  /**
   * 保存元数据索引
   */
  private async saveMetadata(): Promise<void> {
    await fs.writeFile(this.metadataPath, JSON.stringify(this.metadata, null, 2), 'utf8');
  }

  /**
   * 保存文摘
   */
  async saveDigest(digest: DigestData): Promise<void> {
    // 保存完整数据到文件
    const filename = sanitizeFilename(`${digest.id}.json`);
    const filepath = path.join(this.dataPath, filename);
    await fs.writeFile(filepath, JSON.stringify(digest, null, 2), 'utf8');

    // 更新元数据索引
    const listItem: DigestListItem = {
      id: digest.id,
      title: digest.title,
      url: digest.url,
      excerpt: digest.excerpt,
      siteName: digest.siteName,
      createdAt: digest.createdAt,
      tags: digest.tags,
      hasSummary: !!digest.summary,
    };

    const index = this.metadata.digests.findIndex((d) => d.id === digest.id);
    if (index >= 0) {
      this.metadata.digests[index] = listItem;
    } else {
      this.metadata.digests.unshift(listItem); // 新项目添加到开头
    }

    await this.saveMetadata();
  }

  /**
   * 获取文摘列表
   */
  async getDigestList(): Promise<DigestListItem[]> {
    return [...this.metadata.digests];
  }

  /**
   * 获取单个文摘
   */
  async getDigest(id: string): Promise<DigestData | null> {
    try {
      const filename = sanitizeFilename(`${id}.json`);
      const filepath = path.join(this.dataPath, filename);
      const data = await fs.readFile(filepath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      return null;
    }
  }

  /**
   * 删除文摘
   */
  async deleteDigest(id: string): Promise<void> {
    // 删除文件
    const filename = sanitizeFilename(`${id}.json`);
    const filepath = path.join(this.dataPath, filename);

    try {
      await fs.unlink(filepath);
    } catch (error) {
      // 文件可能不存在，忽略错误
    }

    // 从元数据中删除
    this.metadata.digests = this.metadata.digests.filter((d) => d.id !== id);
    await this.saveMetadata();
  }

  /**
   * 更新文摘
   */
  async updateDigest(digest: DigestData): Promise<void> {
    await this.saveDigest(digest);
  }

  /**
   * 搜索文摘
   */
  async searchDigests(params: SearchParams): Promise<DigestListItem[]> {
    let results = [...this.metadata.digests];

    // 关键词搜索
    if (params.keyword) {
      const keyword = params.keyword.toLowerCase();
      results = results.filter(
        (d) =>
          d.title.toLowerCase().includes(keyword) ||
          d.excerpt?.toLowerCase().includes(keyword) ||
          d.url.toLowerCase().includes(keyword)
      );
    }

    // 标签过滤
    if (params.tags && params.tags.length > 0) {
      results = results.filter((d) => {
        if (!d.tags) return false;
        return params.tags!.some((tag) => d.tags!.includes(tag));
      });
    }

    // 日期范围过滤
    if (params.startDate) {
      const startDate = new Date(params.startDate);
      results = results.filter((d) => new Date(d.createdAt) >= startDate);
    }

    if (params.endDate) {
      const endDate = new Date(params.endDate);
      results = results.filter((d) => new Date(d.createdAt) <= endDate);
    }

    // 分页
    const offset = params.offset || 0;
    const limit = params.limit || 20;
    results = results.slice(offset, offset + limit);

    return results;
  }

  /**
   * 批量保存文摘（同步时使用）
   */
  async saveDigests(digests: DigestData[]): Promise<void> {
    for (const digest of digests) {
      await this.saveDigest(digest);
    }
  }

  /**
   * 更新最后同步时间
   */
  async updateLastSync(): Promise<void> {
    this.metadata.lastSync = new Date().toISOString();
    await this.saveMetadata();
  }

  /**
   * 获取最后同步时间
   */
  getLastSync(): string | null {
    return this.metadata.lastSync;
  }

  /**
   * 清除缓存
   */
  async clearCache(): Promise<void> {
    try {
      const files = await fs.readdir(this.cachePath);
      for (const file of files) {
        await fs.unlink(path.join(this.cachePath, file));
      }
    } catch (error) {
      console.error('Failed to clear cache:', error);
    }
  }

  /**
   * 获取存储路径信息
   */
  getStoragePaths(): { dataPath: string; cachePath: string } {
    return {
      dataPath: this.dataPath,
      cachePath: this.cachePath,
    };
  }
}
