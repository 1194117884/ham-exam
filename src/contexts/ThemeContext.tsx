// src/contexts/ThemeContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react';

interface ThemeContextType {
  theme: 'light' | 'dark';
  toggleTheme: () => void;
  setTheme: (newTheme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setInternalTheme] = useState<'light' | 'dark'>('light');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 获取存储的主题设置
    const storedPreference = localStorage.getItem('themePreference');
    let initialTheme: 'light' | 'dark' = 'light';

    if (storedPreference) {
      try {
        const preference = JSON.parse(storedPreference);
        initialTheme = preference.theme;
      } catch {
        // 如果解析失败，尝试旧格式
        const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
        if (storedTheme) {
          initialTheme = storedTheme;
        } else {
          initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }
      }
    } else {
      // 向后兼容：检查旧格式
      const storedTheme = localStorage.getItem('theme') as 'light' | 'dark' | null;
      if (storedTheme) {
        initialTheme = storedTheme;
      } else {
        initialTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
    }

    // 立即应用主题到DOM，避免页面闪烁
    document.documentElement.classList.toggle('dark', initialTheme === 'dark');
    setInternalTheme(initialTheme);
    setIsInitialized(true);

    // 监听系统主题变化 - 仅在用户未手动设置时应用
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e: MediaQueryListEvent) => {
      const hasStoredPreference = localStorage.getItem('themePreference') !== null || localStorage.getItem('theme') !== null;
      if (!hasStoredPreference) {
        const newTheme = e.matches ? 'dark' : 'light';
        document.documentElement.classList.toggle('dark', newTheme === 'dark');
        setInternalTheme(newTheme);
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!isInitialized) return;
    localStorage.setItem('themePreference', JSON.stringify({ theme }));
  }, [theme, isInitialized]);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    document.documentElement.classList.toggle('dark', newTheme === 'dark');
    setInternalTheme(newTheme);
  };

  const setTheme = (newTheme: 'light' | 'dark') => {
    if (newTheme !== theme) {
      document.documentElement.classList.toggle('dark', newTheme === 'dark');
      setInternalTheme(newTheme);
    }
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
