const Database = require('better-sqlite3');
const bcrypt = require('bcryptjs');
const path = require('path');

// Di Vercel hanya /tmp yang bisa ditulis; database dibuat ulang dari seed.
const dbPath = process.env.VERCEL ? '/tmp/dolceria.db' : path.join(__dirname, 'dolceria.db');
const db = new Database(dbPath);
if (!process.env.VERCEL) db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  full_name TEXT NOT NULL,
  email TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS products (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT NOT NULL,
  price INTEGER NOT NULL,
  emoji TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS orders (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER NOT NULL REFERENCES users(id),
  product_id INTEGER NOT NULL REFERENCES products(id),
  quantity INTEGER NOT NULL DEFAULT 1,
  status TEXT NOT NULL DEFAULT 'Diproses',
  created_at TEXT NOT NULL DEFAULT (date('now'))
);
CREATE TABLE IF NOT EXISTS messages (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  message TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);
CREATE TABLE IF NOT EXISTS settings (
  user_id INTEGER PRIMARY KEY REFERENCES users(id),
  language TEXT NOT NULL DEFAULT 'id',
  notifications INTEGER NOT NULL DEFAULT 1
);
`);

if (db.prepare('SELECT COUNT(*) c FROM users').get().c === 0) {
  db.prepare('INSERT INTO users (username,password_hash,full_name,email) VALUES (?,?,?,?)')
    .run('admin', bcrypt.hashSync('password123', 10), 'Admin Dolceria', 'admin@dolceria.id');
}
if (db.prepare('SELECT COUNT(*) c FROM products').get().c === 0) {
  const ins = db.prepare('INSERT INTO products (name,category,description,price,emoji) VALUES (?,?,?,?,?)');
  [
    ['Croissant Mentega', 'Roti', 'Berlapis renyah dengan mentega Prancis, dipanggang setiap pagi.', 22000, '🥐'],
    ['Roti Sourdough', 'Roti', 'Fermentasi 24 jam, kulit garing dan remah lembut.', 45000, '🍞'],
    ['Baguette Klasik', 'Roti', 'Roti panjang khas Prancis dengan kulit tipis renyah.', 28000, '🥖'],
    ['Cheesecake Vanila', 'Kue', 'Keju krim lembut di atas dasar biskuit mentega.', 38000, '🍰'],
    ['Kue Cokelat Gelap', 'Kue', 'Tiga lapis sponge cokelat dengan ganache pekat.', 42000, '🎂'],
    ['Cupcake Karamel', 'Kue', 'Cupcake kecil dengan frosting karamel asin.', 18000, '🧁'],
    ['Cookies Cokelat Chip', 'Kue Kering', 'Tebal, renyah di tepi, lembut di tengah.', 15000, '🍪'],
    ['Donat Gula Kayu Manis', 'Kue Kering', 'Donat empuk bertabur gula kayu manis.', 12000, '🍩'],
  ].forEach(p => ins.run(...p));
  const ord = db.prepare('INSERT INTO orders (user_id,product_id,quantity,status,created_at) VALUES (1,?,?,?,?)');
  [[1, 4, 'Selesai', '2026-10-01'], [5, 1, 'Selesai', '2026-10-09'], [2, 2, 'Dikirim', '2026-10-20'], [4, 1, 'Diproses', '2026-10-24']]
    .forEach(o => ord.run(...o));
}
module.exports = db;
