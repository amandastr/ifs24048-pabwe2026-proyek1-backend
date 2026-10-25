const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const SECRET = process.env.JWT_SECRET || 'dolceria-dev-secret';
const PORT = process.env.PORT || 3001;

app.use(cors({ origin: process.env.FRONTEND_URL || true }));
app.use(express.json());

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    res.status(401).json({ message: 'Sesi tidak valid. Silakan masuk kembali.' });
  }
}

app.get('/', (req, res) => res.json({ name: 'Dolceria Bakery API', status: 'ok' }));

app.get('/api/products', (req, res) => {
  const { category } = req.query;
  const rows = category
    ? db.prepare('SELECT * FROM products WHERE category = ? ORDER BY id').all(category)
    : db.prepare('SELECT * FROM products ORDER BY id').all();
  res.json(rows);
});

app.get('/api/products/:id', (req, res) => {
  const row = db.prepare('SELECT * FROM products WHERE id = ?').get(req.params.id);
  if (!row) return res.status(404).json({ message: 'Produk tidak ditemukan.' });
  res.json(row);
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body || {};
  const user = db.prepare('SELECT * FROM users WHERE username = ?').get(username || '');
  if (!user || !bcrypt.compareSync(password || '', user.password_hash)) {
    return res.status(401).json({ message: 'Username atau password salah.' });
  }
  const token = jwt.sign({ id: user.id, username: user.username }, SECRET, { expiresIn: '8h' });
  res.json({ token, user: { id: user.id, username: user.username, full_name: user.full_name, email: user.email } });
});

app.get('/api/me', auth, (req, res) => {
  const u = db.prepare('SELECT id, username, full_name, email FROM users WHERE id = ?').get(req.user.id);
  res.json(u);
});

app.get('/api/orders', auth, (req, res) => {
  const rows = db.prepare(`
    SELECT o.id, o.quantity, o.status, o.created_at, p.name AS product_name, p.price, p.emoji
    FROM orders o JOIN products p ON p.id = o.product_id
    WHERE o.user_id = ? ORDER BY o.id DESC`).all(req.user.id);
  res.json(rows);
});

if (require.main === module) {
  app.listen(PORT, () => console.log(`Dolceria API berjalan di http://localhost:${PORT}`));
}
module.exports = app;