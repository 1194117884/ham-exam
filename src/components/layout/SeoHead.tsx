import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

interface SeoHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  canonicalUrl?: string;
  ogImage?: string;
  schemaData?: object;
}

const SeoHead: React.FC<SeoHeadProps> = ({
  title = "业余无线电学习平台 - A/B/C类考试练习系统",
  description = "专业的业余无线电考试学习平台，提供A、B、C类题库练习、模拟考试和错题本功能，助您轻松通过业余无线电操作证书考试。",
  keywords = "业余无线电, 无线电考试, A类考试, B类考试, C类考试, 题库练习, 模拟考试, 错题本",
  canonicalUrl,
  ogImage = "/logo.svg",
  schemaData
}) => {
  const location = useLocation();
  const currentUrl = `https://cqcq.yongkl.cc${location.pathname}`;

  useEffect(() => {
    // 更新页面标题
    document.title = title;

    // 查找现有元标签并更新或创建
    const updateOrCreateMeta = (name: string, content: string) => {
      const existingTag = document.querySelector(`meta[name="${name}"]`);
      if (existingTag) {
        existingTag.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    // 更新或创建描述标签
    updateOrCreateMeta('description', description);
    updateOrCreateMeta('keywords', keywords);
    updateOrCreateMeta('title', title);

    // 创建或更新Open Graph标签
    const updateOrCreateOgMeta = (property: string, content: string) => {
      const existingTag = document.querySelector(`meta[property="${property}"]`);
      if (existingTag) {
        existingTag.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.setAttribute('property', property);
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    updateOrCreateOgMeta('og:title', title);
    updateOrCreateOgMeta('og:description', description);
    updateOrCreateOgMeta('og:url', canonicalUrl || currentUrl);
    updateOrCreateOgMeta('og:image', ogImage);

    // 创建或更新Twitter Card标签
    const updateOrCreateTwitterMeta = (name: string, content: string) => {
      const existingTag = document.querySelector(`meta[name="${name}"]`);
      if (existingTag) {
        existingTag.setAttribute('content', content);
      } else {
        const meta = document.createElement('meta');
        meta.name = name;
        meta.content = content;
        document.head.appendChild(meta);
      }
    };

    updateOrCreateTwitterMeta('twitter:title', title);
    updateOrCreateTwitterMeta('twitter:description', description);
    updateOrCreateTwitterMeta('twitter:image', ogImage);

    // 更新规范链接
    const existingLink = document.querySelector('link[rel="canonical"]');
    if (existingLink) {
      existingLink.setAttribute('href', canonicalUrl || currentUrl);
    } else {
      const link = document.createElement('link');
      link.rel = 'canonical';
      link.href = canonicalUrl || currentUrl;
      document.head.appendChild(link);
    }

    // 添加结构化数据
    if (schemaData) {
      const existingScript = document.getElementById('structured-data');
      if (existingScript) {
        existingScript.remove();
      }

      const script = document.createElement('script');
      script.type = 'application/ld+json';
      script.id = 'structured-data';
      script.textContent = JSON.stringify(schemaData);
      document.head.appendChild(script);
    }

    // 清理函数
    return () => {
      // 清理动态添加的标签（保留原始的）
      const dynamicMetas = document.querySelectorAll('meta[data-dynamic="true"]');
      dynamicMetas.forEach(meta => meta.remove());

      const dynamicLinks = document.querySelectorAll('link[data-dynamic="true"]');
      dynamicLinks.forEach(link => link.remove());
    };
  }, [title, description, keywords, canonicalUrl, ogImage, schemaData, location.pathname]);

  return null;
};

export default SeoHead;