// Vẽ icon 1024 px cho iOS từ logo đèn giao thông của bản web (src/app/icon.svg).
// Chạy từ thư mục gốc repo: node ios/scripts/make-icon.mjs  (cần Chromium của Playwright;
// đặt PLAYWRIGHT_MODULE=<đường dẫn playwright/index.mjs> nếu Playwright cài toàn cục).
import { writeFileSync, readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const here = dirname(fileURLToPath(import.meta.url));
const svg = readFileSync(join(here, "..", "..", "src", "app", "icon.svg"), "utf8");
const html = `<body style="margin:0;width:1024px;height:1024px;background:#0b0d12;display:flex;align-items:center;justify-content:center;overflow:hidden">
<div style="position:absolute;inset:0;background:radial-gradient(circle at 30% 20%,rgba(255,210,63,.28),transparent 55%)"></div>
<div style="position:absolute;left:0;right:0;bottom:120px;height:26px;background:repeating-linear-gradient(90deg,#ffd23f 0 90px,transparent 90px 150px);opacity:.9"></div>
<div style="width:640px;height:640px;position:relative">${svg.replace("<svg ", '<svg width="640" height="640" ')}</div>
</body>`;
const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1024, height: 1024 }, deviceScaleFactor: 1 });
await page.setContent(html);
const out = join(here, "..", "LaiLua", "Resources", "Assets.xcassets", "AppIcon.appiconset", "icon-1024.png");
writeFileSync(out, await page.screenshot({ type: "png", clip: { x: 0, y: 0, width: 1024, height: 1024 } }));
await browser.close();
console.log("Đã ghi", out);
