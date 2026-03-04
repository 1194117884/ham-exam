// src/components/layout/Navbar.tsx
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useHamExam } from '../../contexts/HamExamContext';

const Navbar: React.FC = () => {
  const location = useLocation();
  const { currentClass, setCurrentClass, wrongAnswers } = useHamExam();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const isActive = (path: string) => {
    return location.pathname === path;
  };

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="bg-white shadow-md relative">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            {/* Hamburger menu button for mobile */}
            <button
              onClick={toggleMenu}
              className="md:hidden mr-2 text-gray-500 hover:text-blue-600 focus:outline-none"
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
              <span className="text-blue-600 font-bold text-xl">业余无线电考试</span>
            </Link>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/"
              className={`h-16 flex items-center px-1 pt-1 ${
                isActive('/')
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              首页
            </Link>
            <Link
              to="/practice"
              className={`h-16 flex items-center px-1 pt-1 ${
                isActive('/practice')
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              刷题练习
            </Link>
            <Link
              to="/exam"
              className={`h-16 flex items-center px-1 pt-1 ${
                isActive('/exam')
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              模拟考试
            </Link>
            <Link
              to="/wrong-book"
              className={`h-16 flex items-center px-1 pt-1 relative ${
                isActive('/wrong-book')
                  ? 'border-b-2 border-blue-500 text-blue-600'
                  : 'text-gray-500 hover:text-blue-600'
              }`}
            >
              错题本
              {Object.keys(wrongAnswers).length > 0 && (
                <span className="absolute -top-1 -right-3 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {Object.keys(wrongAnswers).length}
                </span>
              )}
            </Link>
          </div>

          <div className="flex items-center">
            <div className="relative">
              <select
                value={currentClass}
                onChange={(e) => {
                  setCurrentClass(e.target.value as 'A' | 'B' | 'C');
                }}
                className="appearance-none bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 pr-8 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="A">A类</option>
                <option value="B">B类</option>
                <option value="C">C类</option>
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile menu - overlay on top of content */}
      <div className={`${isMenuOpen ? 'block' : 'hidden'} md:hidden absolute top-16 left-0 right-0 bg-white shadow-lg z-50`}>
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          <Link
            to="/"
            className={`block pl-3 pr-4 py-2 border-l-4 ${
              isActive('/')
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }`}
            onClick={() => setIsMenuOpen(false)} // Close menu when clicking a link
          >
            首页
          </Link>
          <Link
            to="/practice"
            className={`block pl-3 pr-4 py-2 border-l-4 ${
              isActive('/practice')
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }`}
            onClick={() => setIsMenuOpen(false)} // Close menu when clicking a link
          >
            刷题练习
          </Link>
          <Link
            to="/exam"
            className={`block pl-3 pr-4 py-2 border-l-4 ${
              isActive('/exam')
                ? 'bg-blue-50 border-blue-500 text-blue-700'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }`}
            onClick={() => setIsMenuOpen(false)} // Close menu when clicking a link
          >
            模拟考试
          </Link>
          <Link
            to="/wrong-book"
            className={`block pl-3 pr-4 py-2 border-l-4 relative ${
              isActive('/wrong-book')
                ? 'bg-blue-50 border-blue-500 text-blue-600'
                : 'border-transparent text-gray-600 hover:bg-gray-50 hover:border-gray-300'
            }`}
            onClick={() => setIsMenuOpen(false)} // Close menu when clicking a link
          >
            错题本
            {Object.keys(wrongAnswers).length > 0 && (
              <span className="absolute top-2 right-4 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {Object.keys(wrongAnswers).length}
              </span>
            )}
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;