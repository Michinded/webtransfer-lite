# WebTransfer Lite

Lightweight local file transfer server for LAN networks. Secured with JWT authentication, accessible via password or QR code, with configurable session duration and automatic shutdown.

## Requirements

- Node.js 18+
- pnpm

## Getting started

```bash
pnpm install
pnpm run init    # generates .env with a random JWT_SECRET
pnpm run check   # validates the environment before starting
pnpm start       # starts the server
```

## Scripts

| Command | Description |
|---------|-------------|
| `pnpm run init` | Creates `.env` from `.env.example` with a generated `JWT_SECRET`. Run once. |
| `pnpm run check` | Validates `.env` values before starting. |
| `pnpm start` | Starts the server. Shuts down automatically when the session expires. |
| `pnpm run dev` | Starts with nodemon (auto-restart on file changes). For development. |

## Configuration

Edit `.env` after running `pnpm run init`:

```env
JWT_SECRET=       # auto-generated — do not change
PORT=3000         # server port
UPLOADS_DIR=uploads  # folder where uploaded files are stored
SESSION_HOURS=2   # session duration in hours (minimum 0.5)
```

## How it works

On startup, the terminal displays:

```
──────────────────────────────────
   WebTransfer Lite
──────────────────────────────────
  URL      : http://192.168.1.x:3000
  Password : AB3X7K
  Session  : 2h
──────────────────────────────────

  Scan to connect (QR = instant access):
  [ QR code ]
```

**From a PC on the same network:** open the URL and enter the password.  
**From a mobile device:** scan the QR code for instant access — no password needed.

The server shuts down automatically when the session expires, closing the port and leaving the machine unexposed.

## Duplicate file handling

Uploading a file with an existing name automatically renames the new one:

```
photo.png  →  photo-1712345678901.png
```

## Project structure

```
index.js              # entry point
scripts/
  init.js             # generates .env
  check.js            # validates the environment
src/
  middleware/auth.js  # JWT verification
  routes/
    auth.js           # POST /api/auth
    files.js          # GET | POST | DELETE /api/files
public/
  index.html          # web UI
uploads/              # uploaded files (gitignored)
```

## API

All file routes require `Authorization: Bearer <token>` in the request header.  
Downloads also accept `?token=<token>` as a query parameter for direct links.

| Method | Route | Description |
|--------|-------|-------------|
| `POST` | `/api/auth` | Exchange password for a JWT |
| `GET` | `/api/files` | List available files |
| `POST` | `/api/files/upload` | Upload one or more files |
| `GET` | `/api/files/download/:name` | Download a file |
| `DELETE` | `/api/files/:name` | Delete a file |
