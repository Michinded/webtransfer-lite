const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

router.post('/', (req, res) => {
  const { password } = req.body;
  if (!password || password !== global.serverPassword) {
    return res.status(401).json({ error: 'Invalid password' });
  }
  const hours = Math.max(0.5, Number(process.env.SESSION_HOURS) || 2);
  const token = jwt.sign({ authorized: true }, process.env.JWT_SECRET, { expiresIn: `${hours}h` });
  res.json({ token });
});

module.exports = router;
