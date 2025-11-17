import { BrowserWindow, BrowserView, app } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class WindowManager {
  private mainWindow: BrowserWindow | null = null;
  private browserView: BrowserView | null = null;
  private sidebarWidth = 320;

  /**
   * 创建主窗口
   */
  createMainWindow(): void {
    // 在开发模式下，预加载脚本在项目根目录的 dist/preload 下
    // 在生产模式下，在应用包内的 dist/preload 下
    const preloadPath = app.isPackaged
      ? path.join(app.getAppPath(), 'dist/preload/preload.js')
      : path.join(__dirname, '../../../dist/preload/preload.js');

    this.mainWindow = new BrowserWindow({
      width: 1400,
      height: 900,
      minWidth: 1000,
      minHeight: 600,
      frame: false, // 无边框窗口，使用自定义标题栏
      backgroundColor: '#ffffff',
      webPreferences: {
        preload: preloadPath,
        nodeIntegration: false,
        contextIsolation: true,
        sandbox: false,
      },
    });

    // 开发环境加载开发服务器，生产环境加载构建文件
    if (process.env.NODE_ENV === 'development' || process.env.VITE_DEV_SERVER_URL) {
      this.mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173');
      this.mainWindow.webContents.openDevTools();
    } else {
      this.mainWindow.loadFile(path.join(app.getAppPath(), 'dist/renderer/index.html'));
    }

    // 创建BrowserView用于显示网页内容
    this.createBrowserView();

    // 窗口关闭时清理
    this.mainWindow.on('closed', () => {
      this.mainWindow = null;
      this.browserView = null;
    });

    // 监听窗口大小变化，调整BrowserView
    this.mainWindow.on('resize', () => {
      this.updateBrowserViewBounds();
    });
  }

  /**
   * 创建BrowserView
   */
  private createBrowserView(): void {
    if (!this.mainWindow) return;

    this.browserView = new BrowserView({
      webPreferences: {
        nodeIntegration: false,
        contextIsolation: true,
      },
    });

    this.mainWindow.addBrowserView(this.browserView);
    this.updateBrowserViewBounds();

    // 加载默认页面
    this.browserView.webContents.loadURL('about:blank');
  }

  /**
   * 更新BrowserView的位置和大小
   */
  private updateBrowserViewBounds(): void {
    if (!this.mainWindow || !this.browserView) return;

    const [width, height] = this.mainWindow.getContentSize();
    const titleBarHeight = 40; // 自定义标题栏高度

    this.browserView.setBounds({
      x: this.sidebarWidth,
      y: titleBarHeight,
      width: width - this.sidebarWidth,
      height: height - titleBarHeight,
    });
  }

  /**
   * 设置侧边栏宽度
   */
  setSidebarWidth(width: number): void {
    this.sidebarWidth = width;
    this.updateBrowserViewBounds();
  }

  /**
   * 导航到指定URL
   */
  navigate(url: string): void {
    if (!this.browserView) return;
    this.browserView.webContents.loadURL(url);
  }

  /**
   * 后退
   */
  goBack(): void {
    if (this.browserView?.webContents.canGoBack()) {
      this.browserView.webContents.goBack();
    }
  }

  /**
   * 前进
   */
  goForward(): void {
    if (this.browserView?.webContents.canGoForward()) {
      this.browserView.webContents.goForward();
    }
  }

  /**
   * 刷新
   */
  reload(): void {
    this.browserView?.webContents.reload();
  }

  /**
   * 停止加载
   */
  stop(): void {
    this.browserView?.webContents.stop();
  }

  /**
   * 获取当前页面URL
   */
  getCurrentURL(): string | null {
    return this.browserView?.webContents.getURL() || null;
  }

  /**
   * 获取当前页面标题
   */
  getCurrentTitle(): string | null {
    return this.browserView?.webContents.getTitle() || null;
  }

  /**
   * 获取当前页面HTML
   */
  async getPageHTML(): Promise<string> {
    if (!this.browserView) return '';
    return await this.browserView.webContents.executeJavaScript(
      'document.documentElement.outerHTML'
    );
  }

  /**
   * 执行JavaScript
   */
  async executeJavaScript(code: string): Promise<unknown> {
    if (!this.browserView) return null;
    return await this.browserView.webContents.executeJavaScript(code);
  }

  /**
   * 最小化窗口
   */
  minimize(): void {
    this.mainWindow?.minimize();
  }

  /**
   * 最大化/还原窗口
   */
  toggleMaximize(): void {
    if (!this.mainWindow) return;

    if (this.mainWindow.isMaximized()) {
      this.mainWindow.unmaximize();
    } else {
      this.mainWindow.maximize();
    }
  }

  /**
   * 关闭窗口
   */
  close(): void {
    this.mainWindow?.close();
  }

  /**
   * 聚焦主窗口
   */
  focusMainWindow(): void {
    if (this.mainWindow) {
      if (this.mainWindow.isMinimized()) {
        this.mainWindow.restore();
      }
      this.mainWindow.focus();
    }
  }

  /**
   * 获取主窗口
   */
  getMainWindow(): BrowserWindow | null {
    return this.mainWindow;
  }

  /**
   * 获取BrowserView
   */
  getBrowserView(): BrowserView | null {
    return this.browserView;
  }
}
