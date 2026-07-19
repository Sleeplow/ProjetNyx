// Bake driver: spins up the static server, opens the render page in the
// pre-installed headless Chromium (software GL), and turns 3D KayKit models
// into 2D sprite sheets — 8 directions × N animation frames — plus a manifest.
//
// Usage: node tools/sprite-bake/bake.mjs <job.json>
import { spawn } from 'child_process';
import { readFile, writeFile, mkdir, readdir } from 'fs/promises';
import { existsSync } from 'fs';
import { dirname, join, resolve, relative, sep } from 'path';
import { fileURLToPath } from 'url';

const HERE = dirname(fileURLToPath(import.meta.url));
// Repo root = where you invoke `node`. Overridable so the skill works no matter
// where its scripts live (bundled in .claude/skills, copied elsewhere, etc.).
const ROOT = process.env.BAKE_ROOT || process.cwd();
// URL path of bake.html relative to the served root (POSIX slashes for the URL).
const PAGE_URL = '/' + relative(ROOT, join(HERE, 'bake.html')).split(sep).join('/');
const PORT = 5199;

// The pre-provisioned Chromium lives under a versioned dir; resolve it so the
// bake survives browser updates instead of pinning one version number.
async function findChrome() {
  if (process.env.BAKE_CHROME && existsSync(process.env.BAKE_CHROME)) return process.env.BAKE_CHROME;
  const base = '/opt/pw-browsers';
  try {
    const dirs = (await readdir(base)).filter((d) => d.startsWith('chromium')).sort();
    for (const d of dirs.reverse()) {
      const p = join(base, d, 'chrome-linux', 'chrome');
      if (existsSync(p)) return p;
    }
  } catch {}
  return undefined; // fall back to Playwright's bundled browser
}
const CHROME = await findChrome();

const job = JSON.parse(await readFile(process.argv[2], 'utf8'));
const outDir = resolve(ROOT, job.outDir);
await mkdir(outDir, { recursive: true });

// 1) Static server rooted at the project.
const server = spawn('node', [join(HERE, 'serve.mjs'), ROOT, String(PORT)], { stdio: 'inherit' });
const stop = () => { try { server.kill(); } catch {} };
process.on('exit', stop);
await new Promise((r) => setTimeout(r, 500));

// Playwright ships globally in this environment, not in the project. It's a CJS
// package, so under ESM the exports land on `.default`.
const pw = await import('/opt/node22/lib/node_modules/playwright/index.js');
const chromium = pw.chromium ?? pw.default?.chromium;
const browser = await chromium.launch({
  ...(CHROME ? { executablePath: CHROME } : {}),
  headless: true,
  args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'],
});

try {
  const page = await browser.newPage({ viewport: { width: 512, height: 512 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e.message || e)));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('CONSOLE ' + m.text()); });

  await page.goto(`http://localhost:${PORT}${PAGE_URL}`, { waitUntil: 'load', timeout: 30000 });
  await page.waitForFunction(() => window.__bake && window.__bake.ready, { timeout: 20000 });

  const cfg = { size: job.size ?? 256, elevDeg: job.elevDeg, yawOffsetDeg: job.yawOffsetDeg, padding: job.padding, aimBias: job.aimBias, azimDeg: job.azimDeg };
  await page.evaluate((c) => window.__bake.init(c), cfg);

  const animUrls = (job.animGlbs || []).map((p) => '/' + p.replace(/^\/+/, ''));
  const manifest = { pack: job.pack ?? 'kaykit', size: cfg.size, dirs: job.dirs ?? 8, characters: {} };

  for (const ch of job.characters) {
    const charUrl = '/' + ch.glb.replace(/^\/+/, '');
    const loaded = await page.evaluate(async (a) => window.__bake.loadModel(a.charUrl, a.animUrls, a.cfg), { charUrl, animUrls, cfg });
    console.log(`\n[${ch.name}] clips=${loaded.clips.length} radius=${loaded.radius.toFixed(2)}`);
    manifest.characters[ch.name] = { anims: {} };

    for (const clip of ch.clips) {
      const sheet = await page.evaluate(async (c) => window.__bake.bakeSheet(c), { clip: clip.name, dirs: job.dirs ?? 8, frames: clip.frames ?? 1, stillAt: clip.stillAt });
      const file = `${ch.name.toLowerCase()}_${clip.out}.png`;
      const b64 = sheet.dataURL.split(',')[1];
      await writeFile(join(outDir, file), Buffer.from(b64, 'base64'));
      manifest.characters[ch.name].anims[clip.out] = { file, cols: sheet.cols, rows: sheet.rows, frameW: sheet.frameW, frameH: sheet.frameH };
      console.log(`  ${clip.out}: ${sheet.cols}×${sheet.rows} → ${file}`);
    }
  }

  await writeFile(join(outDir, 'manifest.json'), JSON.stringify(manifest, null, 2));
  if (errors.length) console.log('\nPAGE ERRORS:', JSON.stringify(errors.slice(0, 8)));
  console.log(`\n✅ baked → ${outDir}`);
} finally {
  await browser.close();
  stop();
}
