const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
  const header = req.headers.authorization;
  // Also accept token from query string (needed for direct download links)
  const raw = header?.startsWith('Bearer ') ? header.slice(7) : req.query.token;
  if (!raw) return res.status(401).json({ error: 'Unauthorized' });
  try {
    jwt.verify(raw, process.env.JWT_SECRET);
    next();
  } catch (err) {
    const msg = err.name === 'TokenExpiredError' ? 'Session expired' : 'Invalid token';
    res.status(401).json({ error: msg });
  }
};
