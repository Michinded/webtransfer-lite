const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();

const uploadsDir = () => path.resolve(process.env.UPLOADS_DIR || 'uploads');

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadsDir()),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext);
    const target = path.join(uploadsDir(), file.originalname);

    if (fs.existsSync(target)) {
      cb(null, `${base}-${Date.now()}${ext}`);
    } else {
      cb(null, file.originalname);
    }
  },
});

const upload = multer({ storage });

// List files
router.get('/', (req, res) => {
  const dir = uploadsDir();
  const files = fs.readdirSync(dir)
    .filter(name => !name.startsWith('.'))
    .map(name => {
      const stat = fs.statSync(path.join(dir, name));
      return { name, size: stat.size, modified: stat.mtime };
    })
    .sort((a, b) => new Date(b.modified) - new Date(a.modified));
  res.json(files);
});

// Upload (multiple files)
router.post('/upload', upload.array('files'), (req, res) => {
  if (!req.files?.length) {
    return res.status(400).json({ error: 'No files received' });
  }
  res.json({ uploaded: req.files.map(f => ({ name: f.filename, size: f.size })) });
});

// Download
router.get('/download/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filepath = path.join(uploadsDir(), filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  res.download(filepath);
});

// Delete
router.delete('/:filename', (req, res) => {
  const filename = path.basename(req.params.filename);
  const filepath = path.join(uploadsDir(), filename);
  if (!fs.existsSync(filepath)) {
    return res.status(404).json({ error: 'File not found' });
  }
  fs.unlinkSync(filepath);
  res.json({ deleted: filename });
});

module.exports = router;
