// 발표 시나리오대로 로컬 데모 화면을 녹화한다 (playwright-core + 설치된 Chrome).
// 구간마다 내레이션 길이만큼 머물고, 자막과 커서를 화면에 그린다. 결과: out/raw.webm, out/timeline.json
import { chromium } from "playwright-core";
import fs from "node:fs";
import path from "node:path";

const DIR = path.dirname(new URL(import.meta.url).pathname).replace(/^\/([A-Za-z]:)/, "$1");
const BASE = "http://localhost:3000";
const segments = JSON.parse(fs.readFileSync(path.join(DIR, "segments.json"), "utf8"));
const durations = JSON.parse(fs.readFileSync(path.join(DIR, "durations.json"), "utf8").replace(/^﻿/, ""));
const OUT = path.join(DIR, "out");
fs.mkdirSync(OUT, { recursive: true });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// 자막 막대와 가짜 커서 (영상에는 실제 마우스가 찍히지 않으므로 직접 그린다)
async function overlay(page, caption, cursor = true) {
  await page.evaluate(({ text, cursor }) => {
    let bar = document.getElementById("__cap");
    if (!bar) {
      bar = document.createElement("div");
      bar.id = "__cap";
      bar.style.cssText =
        "position:fixed;left:50%;bottom:28px;transform:translateX(-50%);max-width:1100px;padding:12px 26px;border-radius:14px;" +
        "background:rgba(26,29,12,.88);color:#f1ebdd;font:600 22px/1.4 'IBM Plex Sans KR','Malgun Gothic',sans-serif;" +
        "border:2px solid #c3b091;z-index:2147483647;pointer-events:none;text-align:center;box-shadow:0 6px 24px rgba(0,0,0,.35)";
      document.body.appendChild(bar);
    }
    bar.textContent = text;
    if (!document.getElementById("__cur")) {
      const cur = document.createElement("div");
      cur.id = "__cur";
      cur.style.cssText =
        "position:fixed;left:640px;top:360px;width:26px;height:26px;margin:-13px 0 0 -13px;border-radius:50%;" +
        "background:rgba(195,176,145,.55);border:3px solid #4b5320;z-index:2147483647;pointer-events:none;" +
        "transition:left .6s ease,top .6s ease,transform .15s ease";
      document.body.appendChild(cur);
    }
    document.getElementById("__cur").style.display = cursor ? "block" : "none";
  }, { text: caption, cursor });
}

async function pointAt(page, locator) {
  // 자막 막대에 가리지 않게 화면 가운데로 가져온다
  await locator.evaluate((el) => el.scrollIntoView({ block: "center", behavior: "smooth" }));
  await sleep(500);
  const box = await locator.boundingBox();
  if (!box) return;
  await page.evaluate(({ x, y }) => {
    const cur = document.getElementById("__cur");
    if (cur) { cur.style.left = `${x}px`; cur.style.top = `${y}px`; }
  }, { x: box.x + box.width / 2, y: box.y + box.height / 2 });
  await sleep(700);
}

async function clickAt(page, locator) {
  await pointAt(page, locator);
  await page.evaluate(() => { const c = document.getElementById("__cur"); if (c) c.style.transform = "scale(.7)"; });
  await sleep(150);
  await page.evaluate(() => { const c = document.getElementById("__cur"); if (c) c.style.transform = "scale(1)"; });
  await locator.click();
}

async function typeSlow(locator, text) {
  await locator.click();
  await locator.fill("");
  await locator.pressSequentially(text, { delay: 70 });
}

async function smoothScroll(page, y) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "smooth" }), y);
  await sleep(900);
}

async function go(page, url, caption) {
  await page.goto(BASE + url, { waitUntil: "networkidle" });
  await overlay(page, caption);
}

const navLink = (page, label) => page.locator("header nav a", { hasText: label }).first();

// 휴대폰 틀 안에 앱을 띄운다 (같은 영상 크기를 유지하려고 iframe으로 보여준다)
const PHONE = (src) => `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;height:100vh;display:flex;align-items:center;justify-content:center;gap:60px;background:#2f3417;font-family:'IBM Plex Sans KR','Malgun Gothic',sans-serif;color:#f1ebdd}
  .phone{width:390px;height:844px;border:14px solid #1a1d0c;border-radius:46px;overflow:hidden;transform:scale(.76);transform-origin:center;box-shadow:0 20px 60px rgba(0,0,0,.5);background:#fff}
  iframe{width:390px;height:844px;border:0}
  h2{font-size:34px;margin:0 0 12px} p{font-size:20px;color:#e0d4ba;margin:6px 0}
</style></head><body><div><h2>휴대폰 화면</h2><p>하단 탭 · 홈 · 자격증 · 독서 · 체력 · 더보기</p><p>다크 모드 지원</p></div>
<div class="phone"><iframe src="${src}"></iframe></div></body></html>`;

const TECH = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;height:100vh;background:#f6f3ea;font-family:'IBM Plex Sans KR','Malgun Gothic',sans-serif;color:#26231d;display:flex;flex-direction:column;justify-content:center;padding:0 90px;box-sizing:border-box}
  h1{font-size:40px;margin:0 0 28px;color:#3d431c} .row{display:flex;gap:18px;align-items:center;margin-bottom:34px}
  .box{flex:1;border:2px solid #b5a785;border-radius:16px;padding:18px 20px;background:#fff} .box b{display:block;font-size:22px;margin-bottom:6px}
  .box span{font-size:17px;color:#6e6450} .main{border-color:#4b5320;background:#e6e9d3} .arrow{font-size:28px;color:#8f8264}
  ul{margin:0;padding-left:26px;font-size:21px;line-height:1.8} li b{color:#3d431c}
</style></head><body><h1>기술 · 보안 · 만든 과정</h1>
<div class="row"><div class="box"><b>사용자 브라우저</b><span>웹 · 휴대폰</span></div><div class="arrow">⇄</div>
<div class="box main"><b>Vercel · Next.js 16</b><span>GitHub에 올리면 자동 배포</span></div><div class="arrow">⇄</div>
<div class="box"><b>Supabase (서울)</b><span>로그인 · Postgres · RLS</span></div></div>
<ul><li><b>본인 데이터만</b> — 모든 표에 행 단위 보안(RLS), 32개 항목 검사 실패 0건</li>
<li><b>군사보안</b> — 부대명 · 위치 · 군번 · 실명 입력란 없음, 사진 업로드 없음</li>
<li><b>Claude Code와 대화하며 개발</b> — 명세서 · 체크리스트를 먼저 만들고 주차별 진행</li></ul></body></html>`;

const END = `<!doctype html><html><head><meta charset="utf-8"><style>
  body{margin:0;height:100vh;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#3d431c;color:#f1ebdd;font-family:'IBM Plex Sans KR','Malgun Gothic',sans-serif}
  .star{font-size:60px;color:#c3b091} h1{font-size:64px;margin:10px 0} p{font-size:26px;color:#e0d4ba;margin:6px}
</style></head><body><div class="star">★</div><h1>복무로그</h1><p>쌓이는 복무 시간을 위해</p><p>bokmu-log.vercel.app</p><p style="margin-top:30px">감사합니다</p></body></html>`;

// 구간별 장면
const scenes = {
  s00: async (page, cap) => {
    await go(page, "/", cap);
    await sleep(6000);
    await smoothScroll(page, 650);
    await sleep(8000);
    await smoothScroll(page, 0);
  },
  s01: async (page, cap) => {
    await go(page, "/login", cap);
    await sleep(2500);
    await clickAt(page, page.getByRole("link", { name: /예시 데이터로 둘러보기/ }));
    await page.waitForURL("**/dashboard");
    await page.waitForLoadState("networkidle");
    await overlay(page, cap);
  },
  s02: async (page, cap) => {
    await overlay(page, cap);
    await pointAt(page, page.locator("main .font-stencil").first());
    await sleep(3500);
    await pointAt(page, page.getByText("다음 시험").first());
    await sleep(3000);
    await smoothScroll(page, 420);
    const cell = page.locator('button[aria-label*="기록"]').nth(75);
    await clickAt(page, cell);
    await sleep(2500);
  },
  s03: async (page, cap) => {
    await clickAt(page, navLink(page, "자격증"));
    await page.waitForURL("**/certificates");
    await page.waitForLoadState("networkidle");
    await overlay(page, cap);
    await sleep(3500);
    await pointAt(page, page.getByText("다가오는 시험").first());
    await sleep(2000);
    await smoothScroll(page, 520);
    await pointAt(page, page.getByText("이번 주 공부 시간").first());
  },
  s04: async (page, cap) => {
    await smoothScroll(page, 0);
    await clickAt(page, page.locator('a[href="/certificates/c1"]').first());
    await page.waitForURL("**/certificates/c1");
    await page.waitForLoadState("networkidle");
    await overlay(page, cap);
    await clickAt(page, page.getByRole("button", { name: /이 자격증 공부 기록/ }));
    await typeSlow(page.locator('textarea[name="content"]'), "데이터베이스 오답 정리");
    await clickAt(page, page.getByRole("button", { name: "1시간" }));
    await clickAt(page, page.getByRole("button", { name: "기록하기" }));
    await sleep(1500);
  },
  s05: async (page, cap) => {
    await overlay(page, cap);
    const result = page.getByRole("button", { name: "결과 입력" }).first();
    await clickAt(page, result);
    await page.locator('select[name="result"]').first().selectOption("pass");
    await typeSlow(page.locator('input[name="score"]').first(), "82");
    await sleep(1500);
  },
  s06: async (page, cap) => {
    await clickAt(page, navLink(page, "독서"));
    await page.waitForURL("**/books");
    await page.waitForLoadState("networkidle");
    await overlay(page, cap);
    await pointAt(page, page.locator("article").nth(1));
  },
  s07: async (page, cap) => {
    await clickAt(page, navLink(page, "체력"));
    await page.waitForURL("**/fitness");
    await page.waitForLoadState("networkidle");
    await overlay(page, cap);
    await sleep(1500);
    await pointAt(page, page.locator(".recharts-line-curve").nth(0));
    await sleep(2500);
    await pointAt(page, page.locator(".recharts-line-curve").nth(2));
  },
  s08: async (page, cap) => {
    await clickAt(page, navLink(page, "적금"));
    await page.waitForURL("**/savings");
    await page.waitForLoadState("networkidle");
    await overlay(page, cap);
    await typeSlow(page.locator('input[type="number"]').first(), "550000");
    await sleep(800);
    await pointAt(page, page.locator("main .font-stencil").first());
  },
  s09: async (page, cap) => {
    await page.setContent(PHONE(`${BASE}/dashboard`), { waitUntil: "networkidle" });
    await overlay(page, cap, false);
    await sleep(3200);
    await page.emulateMedia({ colorScheme: "dark" });
  },
  s10: async (page, cap) => {
    await page.emulateMedia({ colorScheme: "light" });
    await page.setContent(TECH, { waitUntil: "load" });
    await overlay(page, cap, false);
  },
  s11: async (page, cap) => {
    await go(page, "/dashboard", cap);
    await sleep(9000);
    await page.setContent(END, { waitUntil: "load" });
    await overlay(page, cap, false);
  },
};

const browser = await chromium.launch({ channel: "chrome", headless: true });

// 1) 미리 한 번씩 열어 개발 서버 컴파일을 끝내 둔다 (녹화에 로딩 화면이 찍히지 않게)
{
  const warm = await browser.newPage({ viewport: { width: 1280, height: 720 } });
  for (const url of ["/", "/login", "/dashboard", "/certificates", "/certificates/c1", "/books", "/fitness", "/savings"]) {
    await warm.goto(BASE + url, { waitUntil: "networkidle" });
  }
  await warm.close();
}

// 2) 녹화
const context = await browser.newContext({
  viewport: { width: 1280, height: 720 },
  recordVideo: { dir: OUT, size: { width: 1280, height: 720 } },
  locale: "ko-KR",
  colorScheme: "light",
});
const page = await context.newPage();
const t0 = Date.now();
const timeline = [];

for (const seg of segments) {
  const start = Date.now() - t0;
  timeline.push({ id: seg.id, start });
  const minLen = (durations[seg.id] ?? 3000) + 700;
  await Promise.all([scenes[seg.id](page, seg.caption), sleep(minLen)]);
  console.log(`${seg.id} start=${start}ms`);
}
await sleep(2500); // 끝 화면 여유
const total = Date.now() - t0;

const videoPath = await page.video().path();
await context.close();
await browser.close();
fs.renameSync(videoPath, path.join(OUT, "raw.webm"));
fs.writeFileSync(path.join(OUT, "timeline.json"), JSON.stringify({ total, timeline }, null, 2));
console.log(`done total=${total}ms`);
