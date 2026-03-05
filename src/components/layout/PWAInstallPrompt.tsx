import React, { useState, useEffect } from 'react';

const PWAInstallPrompt: React.FC = () => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [dismissed, setDismissed] = useState(false);

  // 检查是否为移动设备
  const isMobile = () => {
    return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // 从localStorage检查用户是否已关闭过此提示
  useEffect(() => {
    const hasDismissed = localStorage.getItem('pwa-install-dismissed');
    if (hasDismissed) {
      setDismissed(true);
    }
  }, []);

  useEffect(() => {
    if (dismissed || !isMobile()) return;

    const handleBeforeInstallPrompt = (e: Event) => {
      // 阻止浏览器的默认安装提示
      e.preventDefault();

      // 保存触发事件以便后续使用
      setDeferredPrompt(e);

      // 仅当用户已在页面停留一段时间后再显示提示
      setTimeout(() => {
        if (!dismissed && isMobile()) {
          setShowPrompt(true);
        }
      }, 10000); // 10秒后显示，让用户先了解应用内容
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, [dismissed]);

  const handleInstallClick = () => {
    if (deferredPrompt) {
      // 显示安装提示
      deferredPrompt.prompt();

      // 等待用户响应
      deferredPrompt.userChoice.then((choiceResult: any) => {
        if (choiceResult.outcome === 'accepted') {
          console.log('用户接受了安装');
        } else {
          console.log('用户拒绝了安装');
        }
        setDeferredPrompt(null);
        setShowPrompt(false);
        setDismissed(true);
        localStorage.setItem('pwa-install-dismissed', 'true');
      });
    }
  };

  const handleClose = () => {
    setShowPrompt(false);
    setDismissed(true);
    localStorage.setItem('pwa-install-dismissed', 'true');
  };

  // 对于iOS设备，提供手动安装说明
  const isIOS = () => {
    const userAgent = navigator.userAgent;
    return /iPad|iPhone|iPod/.test(userAgent);
  };

  if (!showPrompt || dismissed || !isMobile()) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg p-4 max-w-xs z-50 transition-all duration-300 ease-in-out transform hover:scale-[1.02]">
      <div className="flex items-start">
        <div className="flex-1">
          <div className="flex items-center">
            <img src="/logo.svg" alt="Logo" className="w-8 h-8 mr-2" />
            <h3 className="font-bold text-gray-800 dark:text-white">安装应用</h3>
          </div>
          <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">将业余无线电学习平台添加到主屏幕，随时随地练习考题。</p>
        </div>

        <div className="flex space-x-1 ml-2">
          <button
            onClick={handleClose}
            className="p-1 rounded-full text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
            aria-label="关闭"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </div>

      <div className="mt-3 flex justify-between items-center">
        <span className="text-xs text-gray-500 dark:text-gray-400">不再显示</span>
        <div className="flex space-x-2">
          {isIOS() ? (
            <button
              onClick={handleClose}
              className="px-3 py-1.5 text-sm rounded border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
            >
              知道了
            </button>
          ) : (
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 text-sm rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              立即安装
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PWAInstallPrompt;
