// src/App.tsx
import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import { HamExamProvider } from "./contexts/HamExamContext";
import Navbar from "./components/layout/Navbar";
import Home from "./components/Home";
import Practice from "./components/Practice";
import Exam from "./components/Exam";
import WrongBook from "./components/WrongBook";
import Favorites from "./components/Favorites";

// 引入结构化数据工具
import { useOrganizationSchema } from './utils/structuredData';

// 引入SEO头部组件
import SeoHead from './components/layout/SeoHead';
import PWAInstallPrompt from './components/layout/PWAInstallPrompt';

// 页面级结构化数据组件
const PageStructuredData: React.FC = () => {
  const location = useLocation();
  const { pathname } = location;

  useOrganizationSchema();

  // 根据路径添加不同的结构化数据
  useEffect(() => {
    let pageData = null;

    switch(pathname) {
      case '/':
        pageData = {
          "@context": "https://schema.org",
          "@type": "WebSite",
          "name": "业余无线电学习平台",
          "description": "专业的业余无线电考试学习平台，提供A、B、C类题库练习、模拟考试和错题本功能，助您轻松通过业余无线电操作证书考试。",
          "url": "https://cqcq.yongkl.cc/",
          "potentialAction": {
            "@type": "SearchAction",
            "target": "https://cqcq.yongkl.cc/search?q={search_term_string}",
            "query-input": "required name=search_term_string"
          }
        };
        break;
      case '/practice':
        pageData = {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "练习模式 - 业余无线电学习平台",
          "description": "在练习模式中顺序回答问题，学习业余无线电知识并获得详细解释。",
          "url": "https://cqcq.yongkl.cc/practice"
        };
        break;
      case '/exam':
        pageData = {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "模拟考试 - 业余无线电学习平台",
          "description": "参加计时模拟考试，测试您的业余无线电知识准备情况。",
          "url": "https://cqcq.yongkl.cc/exam"
        };
        break;
      case '/wrong-book':
        pageData = {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "错题本 - 业余无线电学习平台",
          "description": "复习您之前答错的问题，加强薄弱知识点的学习。",
          "url": "https://cqcq.yongkl.cc/wrong-book"
        };
        break;
      default:
        pageData = {
          "@context": "https://schema.org",
          "@type": "WebPage",
          "name": "业余无线电学习平台",
          "description": "专业的业余无线电考试学习平台",
          "url": `https://cqcq.yongkl.cc${pathname}`
        };
    }

    // 动态添加结构化数据
    const existingScript = document.getElementById('page-structured-data');
    if (existingScript) {
      existingScript.remove();
    }

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'page-structured-data';
    script.textContent = JSON.stringify(pageData);
    document.head.appendChild(script);

    return () => {
      if (document.getElementById('page-structured-data')) {
        document.getElementById('page-structured-data')?.remove();
      }
    };
  }, [pathname]);

  return null;
};

const AppContent = () => {
  return (
    <>
      <SeoHead />
      <PageStructuredData />
      <div className="min-h-screen bg-gray-50 pt-16 pb-16"> {/* 为固定导航栏和PWA安装提示留出空间 */}
        <Navbar />
        <main className="container mx-auto py-6">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/practice" element={<Practice />} />
            <Route path="/exam" element={<Exam />} />
            <Route path="/wrong-book" element={<WrongBook />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>
      <PWAInstallPrompt />
    </>
  );
};

const App: React.FC = () => {
  return (
    <HamExamProvider>
      <Router>
        <AppContent />
      </Router>
    </HamExamProvider>
  );
};

export default App;
