/**
 * Xuất dữ liệu dùng chung cho ứng dụng Android (mobile/) và iOS (ios/ tham chiếu thẳng thư mục assets này):
 *   - assets/data/questions.json  (câu hỏi + quỹ đạo xe cho sa hình, đã tính sẵn)
 *   - assets/data/licenses.json, chapters.json, signs.json
 *   - assets/signs/<code>.png     (biển báo vẽ từ SignGraphic, 256 px)
 *
 * Chạy: npx tsx scripts/export-mobile-data.tsx
 * Cần Chromium của Playwright để vẽ PNG (PLAYWRIGHT_BROWSERS_PATH).
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { renderToStaticMarkup } from "react-dom/server";
import type { JunctionScene } from "@/lib/types";
import { QUESTIONS } from "@/data/questions";
import { LICENSES } from "@/data/licenses";
import { CHAPTERS } from "@/data/chapters";
import { SIGNS, SIGN_GROUPS } from "@/data/signs";
import { SignGraphic } from "@/components/signs/SignGraphic";
import { vehiclePath } from "@/components/scene/junctionPaths";
import { TOP_LABEL } from "@/components/scene/sprites";
import { TOPICS, topicOf } from "@/lib/topics";

const ROOT = join(__dirname, "..", "mobile", "app", "src", "main", "assets");
const DATA = join(ROOT, "data");
const SIGN_DIR = join(ROOT, "signs");
mkdirSync(DATA, { recursive: true });
mkdirSync(SIGN_DIR, { recursive: true });

function withPaths(scene: JunctionScene) {
  return { ...scene, vehicles: scene.vehicles.map((v) => ({ ...v, label: v.label ?? TOP_LABEL[v.kind], path: vehiclePath(v, scene.layout) })) };
}

const write = (name: string, value: unknown) => writeFileSync(join(DATA, name), JSON.stringify(value));

write(
  "questions.json",
  QUESTIONS.map((q) => ({
    ...q,
    topic: topicOf(q),
    scene: q.scene?.kind === "junction" ? withPaths(q.scene) : q.scene,
  })),
);
write("licenses.json", LICENSES);
write("chapters.json", CHAPTERS);
write("signs.json", { groups: SIGN_GROUPS, signs: SIGNS });
write("topics.json", TOPICS);

async function renderSigns() {
  const { chromium } = await import(process.env.PLAYWRIGHT_MODULE ?? "playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 256, height: 256 }, deviceScaleFactor: 1 });
  for (const s of SIGNS) {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="256" height="256">${renderToStaticMarkup(<SignGraphic code={s.code} />)}</svg>`;
    await page.setContent(`<body style="margin:0;background:transparent">${svg}</body>`);
    await page.screenshot({ path: join(SIGN_DIR, `${s.code}.png`), omitBackground: true, clip: { x: 0, y: 0, width: 256, height: 256 } });
  }
  await browser.close();
}

renderSigns().then(() => {
  console.log(`Đã xuất ${QUESTIONS.length} câu hỏi, ${SIGNS.length} biển báo → ${ROOT}`);
});
