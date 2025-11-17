import React, { useEffect, useState } from 'react';
import { useDigestStore } from '../stores/useDigestStore';
import { formatReadableDate } from '@shared/utils';

export const Sidebar: React.FC = () => {
  const { digests, isLoading, error, loadDigests, setCurrentDigest } = useDigestStore();
  const [isElectronReady, setIsElectronReady] = useState(false);

  useEffect(() => {
    if (window.electron) {
      setIsElectronReady(true);
      loadDigests();
    }
  }, [loadDigests]);

  return (
    <div className="w-80 h-full bg-white dark:bg-gray-900 border-r border-gray-300 dark:border-gray-700 flex flex-col">
      {/* 头部 */}
      <div className="p-4 border-b border-gray-300 dark:border-gray-700">
        <h1 className="text-lg font-semibold">文摘列表</h1>
        <div className="mt-2">
          <input
            type="search"
            placeholder="搜索文摘..."
            className="w-full px-3 py-1.5 bg-gray-100 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
          />
        </div>
      </div>

      {/* 列表 */}
      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <div className="p-4 text-center text-gray-500">加载中...</div>
        )}

        {error && (
          <div className="p-4 text-center text-red-500 text-sm">{error}</div>
        )}

        {!isLoading && !error && digests.length === 0 && (
          <div className="p-4 text-center text-gray-500 text-sm">
            暂无文摘
            <div className="mt-2 text-xs">
              点击顶部"捕获"按钮保存当前页面
            </div>
          </div>
        )}

        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          {digests.map((digest) => (
            <div
              key={digest.id}
              onClick={() => setCurrentDigest(null)} // TODO: 加载完整文摘
              className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors"
            >
              <h3 className="font-medium text-sm line-clamp-2 mb-1">
                {digest.title}
              </h3>

              {digest.excerpt && (
                <p className="text-xs text-gray-600 dark:text-gray-400 line-clamp-2 mb-2">
                  {digest.excerpt}
                </p>
              )}

              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                <span className="truncate flex-1">
                  {digest.siteName || new URL(digest.url).hostname}
                </span>
                <span className="ml-2">
                  {formatReadableDate(digest.createdAt)}
                </span>
              </div>

              {digest.tags && digest.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-2">
                  {digest.tags.slice(0, 3).map((tag) => (
                    <span
                      key={tag}
                      className="px-2 py-0.5 bg-gray-200 dark:bg-gray-700 text-xs rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* 底部操作 */}
      <div className="p-4 border-t border-gray-300 dark:border-gray-700">
        <button
          onClick={() => isElectronReady && window.electron.email.sync()}
          className="w-full px-3 py-2 bg-primary-500 hover:bg-primary-600 text-white rounded text-sm font-medium disabled:opacity-50"
          disabled={!isElectronReady}
        >
          同步邮箱
        </button>
      </div>
    </div>
  );
};
