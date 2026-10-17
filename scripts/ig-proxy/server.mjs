// Buscador de Instagram para Postre: maneja un Chromium logueado y busca como en la app.
import http from "node:http";
import fs from "node:fs";
import puppeteer from "puppeteer-core";

const env = Object.fromEntries(fs.readFileSync(new URL("./.env", import.meta.url), "utf8").split("\n").filter(Boolean).map((l) => l.split("=")));
const TOKEN = env.IG_PROXY_TOKEN;
const PORT = 8187;
const headless = process.argv.includes("--headless");

const browser = await puppeteer.launch({
  executablePath: "/usr/bin/chromium",
  userDataDir: new URL("./profile", import.meta.url).pathname,
  headless,
  defaultViewport: null,
  args: ["--ozone-platform=wayland", "--no-first-run"],
});
const page = (await browser.pages())[0] ?? (await browser.newPage());
await page.goto("https://www.instagram.com/explore/", { waitUntil: "domcontentloaded" });

let queue = Promise.resolve();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function search(q) {
  if (!page.url().includes("instagram.com")) await page.goto("https://www.instagram.com/explore/");
  return page.evaluate(async (q) => {
    const s = (ms) => new Promise((r) => setTimeout(r, ms));
    const find = () => document.querySelector('input[aria-label="Search input"],input[placeholder=Search],input[placeholder=Buscar]');
    if (!find()) {
      const b = [...document.querySelectorAll("a,div[role=button]")].find((e) => e.querySelector('svg[aria-label=Search],svg[aria-label=Búsqueda]'));
      b?.click();
      for (let k = 0; k < 10 && !find(); k++) await s(300);
    }
    const i = find();
    if (!i) return { error: document.body.innerText.includes("Log in") ? "Chromium no está logueado en IG" : "No encontré el buscador" };
    const set = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value").set;
    i.focus();
    set.call(i, ""); i.dispatchEvent(new Event("input", { bubbles: true }));
    await s(250);
    set.call(i, q); i.dispatchEvent(new Event("input", { bubbles: true }));
    let prev = "", stable = 0;
    for (let k = 0; k < 20 && stable < 3; k++) {
      await s(300);
      const t = [...document.querySelectorAll('a[href^="/"]')].map((a) => a.href).join();
      stable = t === prev && t ? stable + 1 : 0; prev = t;
    }
    return {
      results: [...document.querySelectorAll('a[href^="/"]')]
        .filter((a) => a.querySelector("img") && a.innerText.trim() && !a.getAttribute("href").startsWith("/explore"))
        .slice(0, 10)
        .map((a) => {
          const l = a.innerText.split("\n").map((x) => x.trim()).filter(Boolean);
          const rest = l.slice(1).join(" ").split(" • ");
          return { username: a.getAttribute("href").replace(/\//g, ""), fullName: rest.length > 1 ? rest[0] : (rest[0] && !/Followed by|followers/.test(rest[0]) ? rest[0] : null), hint: rest.find((x) => /Followed by|followers/.test(x)) ?? null, pic: a.querySelector("img").src };
        }),
    };
  }, q);
}

http.createServer(async (req, res) => {
  const url = new URL(req.url, "http://x");
  if (req.headers.authorization !== `Bearer ${TOKEN}`) { res.writeHead(401).end(); return; }
  if (url.pathname === "/status") {
    const info = await page.evaluate(() => ({ url: location.href, text: document.body.innerText.slice(0, 300), inputs: [...document.querySelectorAll("input")].map((i) => i.getAttribute("aria-label") || i.placeholder) }));
    res.writeHead(200, { "content-type": "application/json" }).end(JSON.stringify(info));
    return;
  }
  if (url.pathname !== "/search" || !url.searchParams.get("q")) { res.writeHead(404).end(); return; }
  const job = queue.then(() => search(url.searchParams.get("q").slice(0, 60))).finally(() => sleep(800));
  queue = job.catch(() => {});
  try {
    const out = await job;
    res.writeHead(out.error ? 503 : 200, { "content-type": "application/json" }).end(JSON.stringify(out));
  } catch (e) {
    res.writeHead(500, { "content-type": "application/json" }).end(JSON.stringify({ error: String(e) }));
  }
}).listen(PORT, "127.0.0.1", () => console.log(`postre-ig en :${PORT}`));
