import React, { useEffect } from 'react';
import { TitleBar } from './components/TitleBar';
import { Sidebar } from './components/Sidebar';
import { useAppStore } from './stores/useAppStore';

export const App: React.FC = () => {
  const { loadConfig } = useAppStore();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  return (
    <div className="w-screen h-screen flex flex-col bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      {/* 标题栏 */}
      <TitleBar />

      {/* 主内容区域 */}
      <div className="flex-1 flex overflow-hidden">
        {/* 侧边栏 */}
        <Sidebar />

        {/* BrowserView 区域 - 由 Electron 主进程管理 */}
        {/* 这里留空，实际的网页内容显示在 BrowserView 中 */}
      </div>
    </div>
  );
};
