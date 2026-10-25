# Dolceria Bakery - Backend
REST API dengan Express.js dan SQLite. Akun uji coba: `admin` / `password123`.

## Jalankan lokal
```
git clone https://github.com/amandastr/ifs24048-pabwe2026-proyek1-backend.git
cd ifs24048-pabwe2026-proyek1-backend
npm install
npm start        # http://localhost:3001
npm test         # pengujian API
```
Variabel lingkungan (opsional, lihat `.env.example`): `PORT`, `JWT_SECRET`, `FRONTEND_URL`.

## Endpoint
- GET /api/products?category=Roti | GET /api/products/:id
- POST /api/auth/login  {username, password} -> {token, user}
- GET /api/me, GET /api/orders  (header `Authorization: Bearer <token>`)

Database SQLite (`dolceria.db`) dibuat dan diisi data awal otomatis saat server pertama berjalan.
