const assert = require('assert');
const app = require('./server');
const server = app.listen(0, async () => {
  const base = `http://localhost:${server.address().port}`;
  try {
    const products = await (await fetch(`${base}/api/products`)).json();
    assert(products.length >= 8, 'produk harus tersedia');
    const bad = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: 'salah' }) });
    assert.strictEqual(bad.status, 401);
    const ok = await (await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ username: 'admin', password: 'password123' }) })).json();
    assert(ok.token, 'token harus ada');
    const orders = await (await fetch(`${base}/api/orders`, { headers: { Authorization: `Bearer ${ok.token}` } })).json();
    assert(orders.length > 0);
    const post = (path, body, token, method = 'POST') => fetch(`${base}${path}`, { method, headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) }, body: JSON.stringify(body) });
    assert.strictEqual((await post('/api/messages', { nama: 'Budi', email: 'budi@mail.com', pesan: 'Halo, saya ingin pesan kue.' })).status, 201);
    assert.strictEqual((await post('/api/messages', { nama: '', email: 'salah', pesan: 'x' })).status, 400);
    assert.strictEqual((await post('/api/settings', { language: 'en', notifications: false }, null, 'PUT')).status, 401);
    assert.strictEqual((await post('/api/settings', { language: 'xx', notifications: false }, ok.token, 'PUT')).status, 400);
    assert.strictEqual((await post('/api/settings', { language: 'en', notifications: false }, ok.token, 'PUT')).status, 200);
    const saved = await (await fetch(`${base}/api/settings`, { headers: { Authorization: `Bearer ${ok.token}` } })).json();
    assert.deepStrictEqual(saved, { language: 'en', notifications: false });
    console.log('Semua pengujian API lulus');
    server.close(); process.exit(0);
  } catch (e) { console.error(e); process.exit(1); }
});
