/**
 * 预渲染脚本 - 为 SPA 路由生成静态 HTML 快照
 * 使用 vite preview 作为 HTTP 服务器
 *
 * 用法: node scripts/prerender.mjs
 * 前提: 先运行 "tsc && vite build" 生成 dist/
 */

import puppeteer from 'puppeteer-core';
import { writeFile, mkdir, readFile } from 'fs/promises';
import { existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import http from 'http';

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
  process.env.PUPPETEER_EXECUTABLE_PATH,
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome-stable',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
  '/usr/bin/chromium-browser',
  '/usr/bin/chromium-browser-stable',
  '/opt/google/chrome/chrome',
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
].filter(Boolean);

async function findChrome() {
  for (const p of CHROME_PATHS) {
    if (existsSync(p)) return p;
  }
  // 尝试使用 @sparticuz/chromium (Vercel/serverless 环境)
  try {
    const sparticuzChromium = await import('@sparticuz/chromium');
    const path = await sparticuzChromium.default.executablePath();
    if (path) {
      return { path, isSparticuz: true };
    }
  } catch {
    // @sparticuz/chromium 不可用
  }
  return null;
}

// 简单的静态文件服务器（替代 vite preview，不依赖 npx）
function startStaticServer() {
  return new Promise((resolve, reject) => {
    const MIME = {
      '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css',
      '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png',
      '.ico': 'image/x-icon', '.txt': 'text/plain', '.xml': 'application/xml',
      '.woff2': 'font/woff2',
    };

    const server = http.createServer(async (req, res) => {
      try {
        let urlPath = req.url.split('?')[0];
        if (urlPath === '/') urlPath = '/index.html';

        const cleanPath = urlPath.replace(/^\//, '');
        const filePath = resolve(distDir, cleanPath);

        try {
          const data = await readFile(filePath);
          const ext = extname(filePath).toLowerCase();
          res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
          res.end(data);
        } catch (err) {
          if (err.code === 'ENOENT') {
            // SPA fallback
            const data = await readFile(resolve(distDir, 'index.html'));
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
          } else {
            res.writeHead(500);
            res.end('Server Error');
          }
        }
      } catch {
        res.writeHead(500);
        res.end('Server Error');
      }
    });

    server.listen(4567, () => resolve(server));
    server.on('error', reject);
  });
}

async function prerenderRoute(browser, baseUrl, route) {
  const page = await browser.newPage();

  try {
    const url = `${baseUrl}${route.path}`;
    await page.goto(url, { waitUntil: 'load', timeout: 30000 });

    // 等待 JS 执行和 React 渲染
    await new Promise(r => setTimeout(r, 5000));

    // 尝试等待 React 渲染，但不强制要求
    await page.waitForFunction(() => {
      const root = document.getElementById('root');
      return root && root.children.length > 0;
    }, { timeout: 15000 }).catch(() => {});

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

  const chromeResult = await findChrome();
  if (!chromeResult) {
    console.log('  ⚠️  未找到 Chrome，跳过预渲染（SPA 仍可正常工作）');
    console.log('  提示: 安装 Chrome 或设置 PUPPETEER_EXECUTABLE_PATH 环境变量');
    process.exit(0);
  }

  const chromePath = typeof chromeResult === 'string' ? chromeResult : chromeResult.path;
  console.log(`  Chrome: ${chromePath}`);

  // puppeteer 启动参数
  const puppeteerArgs = [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-dev-shm-usage',
    '--disable-gpu',
  ];
  if (typeof chromeResult !== 'string' && chromeResult.isSparticuz) {
    puppeteerArgs.push('--single-process');
  }

  // 启动静态文件服务器
  console.log('  启动静态文件服务器...');
  const server = await startStaticServer();
  const baseUrl = 'http://localhost:4567';
  console.log(`  服务器: ${baseUrl}\n`);

  const browser = await puppeteer.launch({
    executablePath: chromePath,
    headless: true,
    args: puppeteerArgs,
  });

  try {
    for (const route of ROUTES) {
      await prerenderRoute(browser, baseUrl, route);
    }
  } finally {
    await browser.close();
    server.close();
  }

  console.log('\n✅ 预渲染完成！Google 现在可以立即索引所有页面内容。\n');
  process.exit(0);
}

main().catch(err => {
  console.error('❌ 预渲染失败:', err.message);
  console.log('⚠️  预渲染失败不影响构建，SPA 仍可正常工作');
  process.exit(0);
});