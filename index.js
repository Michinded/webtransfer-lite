require('dotenv').config();
const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const os = require('os');
const qrcode = require('qrcode');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 3000;
const UPLOADS_DIR = path.resolve(process.env.UPLOADS_DIR || 'uploads');

if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

function getLanIp() {
  const ifaces = os.networkInterfaces();
  for (const name of Object.keys(ifaces)) {
    for (const iface of ifaces[name]) {
      if (iface.family === 'IPv4' && !iface.internal) {
        return iface.address;
      }
    }
  }
  return 'localhost';
}

function generatePassword() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const bytes = crypto.randomBytes(6);
  return Array.from(bytes).map(b => chars[b % chars.length]).join('');
}

async function start() {
  if (!process.env.JWT_SECRET) {
    console.error('\n  ERROR: JWT_SECRET is not set.');
    console.error('  Run first: pnpm run init\n');
    process.exit(1);
  }

  const ip = getLanIp();
  const baseUrl = `http://${ip}:${PORT}`;
  const password = generatePassword();

  global.serverPassword = password;

  // Token embedded in QR — scan = instant access, same 2h expiry
  const qrToken = jwt.sign({ authorized: true }, process.env.JWT_SECRET, { expiresIn: '2h' });
  const qrUrl = `${baseUrl}/?token=${qrToken}`;

  const app = express();

  app.use(express.json());
  app.use(express.static(path.join(__dirname, 'public')));

  const authMiddleware = require('./src/middleware/auth');
  app.use('/api/auth', require('./src/routes/auth'));
  app.use('/api/files', authMiddleware, require('./src/routes/files'));

  app.listen(PORT, '0.0.0.0', async () => {
    const line = '─'.repeat(34);
    console.log(`\n${line}`);
    console.log('   WebTransfer Lite');
    console.log(line);
    console.log(`  URL      : ${baseUrl}`);
    console.log(`  Password : ${password}`);
    console.log(`  Session  : 2 hours`);
    console.log(`${line}\n`);
    console.log('  Scan to connect (QR = instant access):\n');
    const qr = await qrcode.toString(qrUrl, { type: 'terminal', small: true });
    console.log(qr);
    console.log(line + '\n');
  });
}

start();
