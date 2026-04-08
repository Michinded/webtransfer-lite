const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const root = path.join(__dirname, '..');
const envExample = path.join(root, '.env.example');
const envFile = path.join(root, '.env');

if (fs.existsSync(envFile)) {
  console.log('.env already exists. Delete it first to regenerate.');
  process.exit(0);
}

if (!fs.existsSync(envExample)) {
  console.error('.env.example not found.');
  process.exit(1);
}

const secret = crypto.randomBytes(64).toString('hex');
const example = fs.readFileSync(envExample, 'utf8');
const result = example.replace('JWT_SECRET=', `JWT_SECRET=${secret}`);

fs.writeFileSync(envFile, result);
console.log('✓ .env created with generated JWT_SECRET');
console.log('  Edit PORT or UPLOADS_DIR if needed, then run: pnpm start');
