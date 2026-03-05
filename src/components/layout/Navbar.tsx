// src/components/layout/Navbar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useHamExam } from '../../contexts/HamExamContext';
import { useTheme } from '../../contexts/ThemeContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { currentClass, setCurrentClass, wrongAnswers, favorites } = useHamExam();
  const { theme, toggleTheme } = useTheme();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white dark:bg-gray-800 shadow-md dark:shadow-gray-700 fixed top-0 left-0 right-0 z-40">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Hamburger menu button for mobile */}
            <button
              onClick={toggleMenu}
              className="md:hidden mr-2 text-gray-500 dark:text-gray-300 hover:text-blue-600 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>

            <Link to="/" className="flex-shrink-0 flex items-center">
              <span className="text-blue-600 dark:text-blue-400 font-bold text-xl">业余无线电考试</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`h-16 flex items-center px-1 pt-1 ${
                isActive('/')
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              首页
            </Link>
            <Link
              to="/practice"
              className={`h-16 flex items-center px-1 pt-1 ${
                isActive('/practice')
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              刷题练习
            </Link>
            <Link
              to="/exam"
              className={`h-16 flex items-center px-1 pt-1 ${
                isActive('/exam')
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              模拟考试
            </Link>
            <Link
              to="/wrong-book"
              className={`h-16 flex items-center px-1 pt-1 relative ${
                isActive('/wrong-book')
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              错题本
              {Object.keys(wrongAnswers).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full h-6 min-w-6 flex items-center justify-center px-1">
                  {Object.keys(wrongAnswers).length > 99 ? '99+' : Object.keys(wrongAnswers).length}
                </span>
              )}
            </Link>
            <Link
              to="/favorites"
              className={`h-16 flex items-center px-1 pt-1 relative ${
                isActive('/favorites')
                  ? 'border-b-2 border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'text-gray-500 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400'
              }`}
            >
              收藏
              {Object.keys(favorites).filter(key => favorites[key]).length > 0 && (
                <span className="absolute -top-2 -right-2 bg-yellow-500 text-white text-xs rounded-full h-6 min-w-6 flex items-center justify-center px-1">
                  {Object.keys(favorites).filter(key => favorites[key]).length > 99 ? '99+' : Object.keys(favorites).filter(key => favorites[key]).length}
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center space-x-3">
            {/* 深色模式切换按钮 */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center justify-center"
              aria-label={theme === 'dark' ? '切换到浅色模式' : '切换到深色模式'}
            >
              {theme === 'dark' ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" clipRule="evenodd" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                </svg>
              )}
            </button>

            <div className="relative">
              <select
                value={currentClass}
                onChange={(e) => {
                  setCurrentClass(e.target.value as 'A' | 'B' | 'C');
                }}
                className="appearance-none bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">A类</option>
                <option value="B">B类</option>
                <option value="C">C类</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700 dark:text-gray-200">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - overlay on top of content */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden absolute top-16 left-0 right-0 bg-white dark:bg-gray-800 shadow-lg z-50`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`block pl-3 pr-4 py-2 border-l-4 ${
              isActive('/')
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setIsMenuOpen(false)} // Close menu when clicking a link
          >
            首页
          </Link>
          <Link
            to="/practice"
            className={`block pl-3 pr-4 py-2 border-l-4 ${
              isActive('/practice')
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setIsMenuOpen(false)} // Close menu when clicking a link
          >
            刷题练习
          </Link>
          <Link
            to="/exam"
            className={`block pl-3 pr-4 py-2 border-l-4 ${
              isActive('/exam')
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-700 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setIsMenuOpen(false)} // Close menu when clicking a link
          >
            模拟考试
          </Link>
          <Link
            to="/wrong-book"
            className={`block pl-3 pr-4 py-2 border-l-4 relative ${
              isActive('/wrong-book')
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setIsMenuOpen(false)} // Close menu when clicking a link
          >
            错题本
            {Object.keys(wrongAnswers).length > 0 && (
              <span className="absolute top-2 right-3 bg-red-500 text-white text-xs rounded-full h-6 min-w-6 flex items-center justify-center px-1">
                {Object.keys(wrongAnswers).length > 99 ? '99+' : Object.keys(wrongAnswers).length}
              </span>
            )}
          </Link>
          <Link
            to="/favorites"
            className={`block pl-3 pr-4 py-2 border-l-4 relative ${
              isActive('/favorites')
                ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-500 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 hover:border-gray-300'
            }`}
            onClick={() => setIsMenuOpen(false)} // Close menu when clicking a link
          >
            收藏
            {Object.keys(favorites).filter(key => favorites[key]).length > 0 && (
              <span className="absolute top-2 right-3 bg-yellow-500 text-white text-xs rounded-full h-6 min-w-6 flex items-center justify-center px-1">
                {Object.keys(favorites).filter(key => favorites[key]).length > 99 ? '99+' : Object.keys(favorites).filter(key => favorites[key]).length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;