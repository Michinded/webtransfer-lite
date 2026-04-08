const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envFile = path.join(root, '.env');

const OK  = '\x1b[32m✓\x1b[0m';
const ERR = '\x1b[31m✗\x1b[0m';
const WRN = '\x1b[33m!\x1b[0m';

let failed = false;

function pass(msg) { console.log(`  ${OK}  ${msg}`); }
function fail(msg) { console.log(`  ${ERR}  ${msg}`); failed = true; }
function warn(msg) { console.log(`  ${WRN}  ${msg}`); }

console.log('\n  WebTransfer Lite — environment check\n');

// .env exists
if (!fs.existsSync(envFile)) {
  fail('.env not found — run: pnpm run init');
  console.log('\n  1 error found.\n');
  process.exit(1);
}
pass('.env found');

// Parse .env manually (no dotenv side-effects)
const raw = fs.readFileSync(envFile, 'utf8');
const env = Object.fromEntries(
  raw.split('\n')
    .filter(l => l.trim() && !l.startsWith('#'))
    .map(l => l.split('=').map((p, i) => i === 0 ? p.trim() : l.slice(l.indexOf('=') + 1).trim()))
);

// JWT_SECRET
if (!env.JWT_SECRET) {
  fail('JWT_SECRET is empty — run: pnpm run init');
} else if (env.JWT_SECRET.length < 32) {
  fail(`JWT_SECRET too short (${env.JWT_SECRET.length} chars) — run: pnpm run init to regenerate`);
} else {
  pass(`JWT_SECRET set (${env.JWT_SECRET.length} chars)`);
}

// PORT
const port = Number(env.PORT || 3000);
if (!Number.isInteger(port) || port < 1024 || port > 65535) {
  fail(`PORT=${env.PORT} is invalid — must be an integer between 1024 and 65535`);
} else {
  pass(`PORT=${port}`);
}

// SESSION_HOURS
const hours = Number(env.SESSION_HOURS ?? 2);
if (isNaN(hours) || hours < 0.5) {
  fail(`SESSION_HOURS=${env.SESSION_HOURS} is invalid — must be a number >= 0.5`);
} else {
  if (hours > 24) warn(`SESSION_HOURS=${hours} is unusually long`);
  else pass(`SESSION_HOURS=${hours}`);
}

// MAX_FILE_SIZE_MB
const maxMB = Number(env.MAX_FILE_SIZE_MB ?? 0);
if (isNaN(maxMB) || maxMB < 0) {
  fail(`MAX_FILE_SIZE_MB=${env.MAX_FILE_SIZE_MB} is invalid — must be a number >= 0 (0 = unlimited)`);
} else if (maxMB === 0) {
  warn('MAX_FILE_SIZE_MB=0 — no file size limit enforced');
} else {
  pass(`MAX_FILE_SIZE_MB=${maxMB} (${maxMB >= 1024 ? (maxMB / 1024).toFixed(1) + ' GB' : maxMB + ' MB'} per file)`);
}

// UPLOADS_DIR — path.resolve handles macOS, Linux and Windows paths (C:\..., \\server\share, /mnt/...)
const uploadsDir = path.resolve(env.UPLOADS_DIR || 'uploads');
try {
  fs.mkdirSync(uploadsDir, { recursive: true });
  fs.accessSync(uploadsDir, fs.constants.W_OK);
  pass(`UPLOADS_DIR writable (${uploadsDir})`);
} catch (e) {
  if (e.code === 'ENOENT') {
    fail(`UPLOADS_DIR path does not exist and could not be created: ${uploadsDir}`);
  } else if (e.code === 'EACCES') {
    fail(`UPLOADS_DIR exists but is not writable: ${uploadsDir}`);
  } else {
    fail(`UPLOADS_DIR error (${e.code}): ${uploadsDir}`);
  }
}

// Summary
console.log();
if (failed) {
  console.log('  \x1b[31mErrors found. Fix them before running pnpm start.\x1b[0m\n');
  process.exit(1);
} else {
  console.log('  \x1b[32mAll checks passed. Ready to run pnpm start.\x1b[0m\n');
}
