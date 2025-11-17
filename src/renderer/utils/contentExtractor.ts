import { Readability } from '@mozilla/readability';
import type { DigestData } from '@shared/types';
import { generateUUID, formatDate } from '@shared/utils';

/**
 * 从HTML中提取内容
 */
export async function extractContent(html: string, url: string): Promise<Partial<DigestData>> {
  // 创建临时DOM
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');

  // 使用Readability提取主要内容
  const reader = new Readability(doc);
  const article = reader.parse();

  if (!article) {
    throw new Error('Failed to extract content from page');
  }

  // 提取图片
  const images = extractImages(doc, url);

  // 提取元数据
  const metadata = extractMetadata(doc);

  return {
    id: generateUUID(),
    title: article.title,
    url,
    content: article.textContent,
    html: article.content,
    author: article.byline || undefined,
    siteName: article.siteName || undefined,
    excerpt: article.excerpt || undefined,
    images,
    metadata,
    createdAt: formatDate(),
    updatedAt: formatDate(),
  };
}

/**
 * 提取图片信息
 */
function extractImages(doc: Document, baseUrl: string) {
  const images: DigestData['images'] = [];
  const imgElements = doc.querySelectorAll('img');

  imgElements.forEach((img, index) => {
    const src = img.getAttribute('src');
    if (!src) return;

    // 转换为绝对URL
    const absoluteUrl = new URL(src, baseUrl).href;

    images.push({
      id: `img-${index}`,
      url: absoluteUrl,
      width: img.naturalWidth || undefined,
      height: img.naturalHeight || undefined,
      alt: img.getAttribute('alt') || undefined,
      mimeType: 'image/jpeg', // 默认值，实际需要根据URL或下载后判断
      size: 0, // 需要下载后才能确定
    });
  });

  return images;
}

/**
 * 提取页面元数据
 */
function extractMetadata(doc: Document) {
  const getMetaContent = (name: string): string | undefined => {
    const meta = doc.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
    return meta?.getAttribute('content') || undefined;
  };

  return {
    charset: doc.characterSet,
    language: doc.documentElement.lang || undefined,
    publishedTime: getMetaContent('article:published_time'),
    modifiedTime: getMetaContent('article:modified_time'),
    keywords: getMetaContent('keywords')?.split(',').map(k => k.trim()),
    description: getMetaContent('description'),
  };
}
