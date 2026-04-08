# WebTransfer Lite

Servidor local para transferir archivos entre dispositivos en la misma red LAN. Requiere autenticación por contraseña o QR, con sesiones de duración configurable.

## Requisitos

- Node.js 18+
- pnpm

## Setup inicial

```bash
pnpm install
pnpm run init    # genera el .env con JWT_SECRET
pnpm run check   # valida que todo esté OK
pnpm start       # arranca el servidor
```

## Scripts

| Comando | Descripción |
|---------|-------------|
| `pnpm run init` | Genera `.env` desde `.env.example` con `JWT_SECRET` aleatorio. Solo se ejecuta una vez. |
| `pnpm run check` | Valida que el `.env` exista y tenga valores correctos. |
| `pnpm start` | Arranca el servidor en modo producción. Se apaga automáticamente al expirar la sesión. |
| `pnpm run dev` | Arranca con nodemon (reinicia al guardar cambios). Para desarrollo. |

## Configuración

Edita `.env` (generado por `pnpm run init`) para personalizar:

```env
JWT_SECRET=       # generado automáticamente, no modificar
PORT=3000         # puerto del servidor
UPLOADS_DIR=uploads  # carpeta donde se guardan los archivos
SESSION_HOURS=2   # duración de la sesión (mínimo 0.5)
```

## Uso

Al arrancar, el servidor muestra en terminal:

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

**Desde un PC en la misma red:** abre la URL e ingresa la contraseña.  
**Desde móvil:** escanea el QR para acceder directamente sin escribir la contraseña.

La sesión expira automáticamente y el servidor se apaga, cerrando el puerto.

## Archivos duplicados

Si subes un archivo con el mismo nombre que uno existente, el nuevo se renombra automáticamente:

```
foto.png  →  foto-1712345678901.png
```

## Estructura del proyecto

```
index.js              # entry point
scripts/
  init.js             # genera .env
  check.js            # valida el entorno
src/
  middleware/auth.js  # verificación JWT
  routes/
    auth.js           # POST /api/auth
    files.js          # GET|POST|DELETE /api/files
public/
  index.html          # UI web
uploads/              # archivos subidos (gitignored)
```

## API

Todas las rutas de archivos requieren `Authorization: Bearer <token>` en el header (o `?token=<token>` en query para descargas directas).

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/api/auth` | Intercambia password por JWT |
| `GET` | `/api/files` | Lista archivos disponibles |
| `POST` | `/api/files/upload` | Sube uno o varios archivos |
| `GET` | `/api/files/download/:name` | Descarga un archivo |
| `DELETE` | `/api/files/:name` | Elimina un archivo |
