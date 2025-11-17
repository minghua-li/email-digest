import React, { useState, useEffect } from 'react';

export const TitleBar: React.FC = () => {
  const [url, setUrl] = useState('');
  const [isElectronReady, setIsElectronReady] = useState(false);

  useEffect(() => {
    // 检查 electron API 是否可用
    if (window.electron) {
      setIsElectronReady(true);
    } else {
      console.warn('Electron API not available');
    }
  }, []);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    if (url && isElectronReady) {
      // 如果没有协议，默认添加https://
      const finalUrl = url.match(/^https?:\/\//) ? url : `https://${url}`;
      window.electron.browser.navigate(finalUrl);
    }
  };

  const handleCapture = async () => {
    if (!isElectronReady) return;

    const result = await window.electron.capture.page();
    if (result.success) {
      console.log('Page captured successfully', result.data);
      // TODO: 显示成功提示
    } else {
      console.error('Failed to capture page:', result.error);
      // TODO: 显示错误提示
    }
  };

  return (
    <div className="h-10 bg-gray-100 dark:bg-gray-900 border-b border-gray-300 dark:border-gray-700 flex items-center px-2 select-none">
      {/* 窗口控制按钮 */}
      <div className="flex items-center gap-2 mr-4">
        <button
          onClick={() => isElectronReady && window.electron.window.close()}
          className="w-3 h-3 rounded-full bg-red-500 hover:bg-red-600"
          title="关闭"
          disabled={!isElectronReady}
        />
        <button
          onClick={() => isElectronReady && window.electron.window.minimize()}
          className="w-3 h-3 rounded-full bg-yellow-500 hover:bg-yellow-600"
          title="最小化"
          disabled={!isElectronReady}
        />
        <button
          onClick={() => isElectronReady && window.electron.window.maximize()}
          className="w-3 h-3 rounded-full bg-green-500 hover:bg-green-600"
          title="最大化"
          disabled={!isElectronReady}
        />
      </div>

      {/* 浏览器导航按钮 */}
      <div className="flex items-center gap-1 mr-2">
        <button
          onClick={() => isElectronReady && window.electron.browser.goBack()}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded disabled:opacity-50"
          title="后退"
          disabled={!isElectronReady}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <button
          onClick={() => isElectronReady && window.electron.browser.goForward()}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded disabled:opacity-50"
          title="前进"
          disabled={!isElectronReady}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
        <button
          onClick={() => isElectronReady && window.electron.browser.reload()}
          className="p-1.5 hover:bg-gray-200 dark:hover:bg-gray-800 rounded disabled:opacity-50"
          title="刷新"
          disabled={!isElectronReady}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
            />
          </svg>
        </button>
      </div>

      {/* 地址栏 */}
      <form onSubmit={handleNavigate} className="flex-1 mr-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="输入网址或搜索..."
          className="w-full px-3 py-1 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded text-sm focus:outline-none focus:ring-1 focus:ring-primary-500"
        />
      </form>

      {/* 捕获按钮 */}
      <button
        onClick={handleCapture}
        className="px-3 py-1 bg-primary-500 hover:bg-primary-600 text-white rounded text-sm font-medium"
        title="捕获当前页面"
      >
        捕获
      </button>
    </div>
  );
};
