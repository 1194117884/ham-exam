/**
 * 预渲染脚本 - 为 SPA 路由生成静态 HTML 快照
 * 使用 vite preview 作为 HTTP 服务器
 *
 * 用法: node scripts/prerender.mjs
 * 前提: 先运行 "tsc && vite build" 生成 dist/
 */

import puppeteer from 'puppeteer-core';
import { writeFile, mkdir } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { spawn } from 'child_process';

const __dirname = dirname(fileURLToPath(import.meta.url));
const distDir = resolve(__dirname, '..', 'dist');

const ROUTES = [
  { path: '/', title: '业余无线电学习平台 - A/B/C类考试练习系统' },
  { path: '/practice', title: '刷题练习 - 业余无线电学习平台' },
  { path: '/exam', title: '模拟考试 - 业余无线电学习平台' },
  { path: '/wrong-book', title: '错题本 - 业余无线电学习平台' },
  { path: '/favorites', title: '收藏 - 业余无线电学习平台' },
];

const CHROME_PATHS = [
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
];

function findChrome() {
  for (const p of CHROME_PATHS) {
    if (existsSync(p)) return p;
  }
  throw new Error('Chrome not found. Install Google Chrome.');
}

function startPreviewServer() {
  return new Promise((resolve, reject) => {
    const proc = spawn('npx', ['vite', 'preview', '--port', '4567', '--strictPort'], {
      cwd: resolve(__dirname, '..'),
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    let started = false;
    const timeout = setTimeout(() => {
      if (!started) {
        proc.kill();
        reject(new Error('vite preview 启动超时'));
      }
    }, 15000);

    proc.stdout.on('data', (data) => {
      const text = data.toString();
      if (text.includes('Local') || text.includes('localhost')) {
        started = true;
        clearTimeout(timeout);
        // 等待一秒确保服务器就绪
        setTimeout(() => resolve(proc), 1000);
      }
    });

    proc.stderr.on('data', (data) => {
      // vite 把日志输出到 stderr
      const text = data.toString();
      if (text.includes('Local') || text.includes('localhost')) {
        started = true;
        clearTimeout(timeout);
        setTimeout(() => resolve(proc), 1000);
      }
    });

    proc.on('error', (err) => {
      clearTimeout(timeout);
      reject(err);
    });
  });
}

async function prerenderRoute(browser, baseUrl, route) {
  const page = await browser.newPage();

  page.on('pageerror', err => {
    console.error(`  [${route.path}] JS错误: ${err.message}`);
  });

  try {
    const url = `${baseUrl}${route.path}`;
    await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });

    // 等待 React 渲染完成
    await page.waitForFunction(() => {
      const root = document.getElementById('root');
      return root && root.children.length > 0 && root.textContent.trim().length > 50;
    }, { timeout: 10000 }).catch(() => {
      console.log(`  ⚠️  ${route.path} 等待渲染超时`);
    });

    await new Promise(r => setTimeout(r, 2000));

    // 更新页面标题
    await page.evaluate((title) => {
      document.title = title;
    }, route.title);

    const html = await page.content();

    if (route.path === '/') {
      await writeFile(resolve(distDir, 'index.html'), html, 'utf-8');
      console.log(`  ✓ ${route.path} → index.html`);
    } else {
      const dir = resolve(distDir, route.path.replace(/^\//, ''));
      if (!existsSync(dir)) {
        await mkdir(dir, { recursive: true });
      }
      await writeFile(resolve(dir, 'index.html'), html, 'utf-8');
      console.log(`  ✓ ${route.path} → ${route.path}/index.html`);
    }
  } finally {
    await page.close();
  }
}

async function main() {
  console.log('\n🔨 预渲染 SPA 页面...\n');

  if (!existsSync(resolve(distDir, 'index.html'))) {
    console.error('❌ dist/index.html 不存在，请先运行 npm run build');
    process.exit(1);
  }

  const chromePath = findChrome();
  console.log(`  Chrome: ${chromePath}`);

  // 启动 vite preview 服务器
  console.log('  启动 vite preview...');
  const serverProc = await startPreviewServer();
  const baseUrl = 'http://localhost:4567';
  console.log(`  服务器: ${baseUrl}\n`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-gpu',
    ],
  });

  try {
    for (const route of ROUTES) {
      await prerenderRoute(browser, baseUrl, route);
    }
  } finally {
    await browser.close();
    if (serverProc && serverProc.pid) {
      process.kill(serverProc.pid, 'SIGTERM');
    }
  }

  console.log('\n✅ 预渲染完成！Google 现在可以立即索引所有页面内容。\n');
}

main().catch(err => {
  console.error('❌ 预渲染失败:', err.message);
  process.exit(1);
});