# BOZOR.UZ — O‘zbekiston uchun zamonaviy Full-Stack Marketplace MVP

BOZOR.UZ — ko‘p sotuvchili (multi-vendor), real vaqtda ishlaydigan professional elektron tijorat (marketplace) veb-platformasi. Sotuvchilar o‘z tovarlarini joylashtiradi va buyurtmalarni boshqaradi, xaridorlar qidiradi, savatga qo‘shadi va buyurtma beradi, administrator esa barcha foydalanuvchilar, sotuvchilar va do‘konlarni nazorat qiladi.

---

## 🌟 Asosiy imkoniyatlar

### 1. 👥 Rollar va ruxsatlar (Role-Based Access Control)
- **CUSTOMER (Xaridor)**:
  - Tovar qidirish, kategoriyalar bo‘yicha filtrlash, narx va reyting filtrlari
  - Savatga qo‘shish (mehmon holatida ham saqlanadi va kirganda avtomatik sinxronlashadi)
  - Yetkazib berish (Toshkent va 14 ta viloyat) va to‘lov usullari (Naqd, Click, Payme, Uzum Bank)
  - Buyurtmalar holatini real vaqtda kuzatish (`PENDING` → `CONFIRMED` → `PROCESSING` → `SHIPPED` → `DELIVERED`)
  - Sevimlilar ro‘yxati (Wishlist)
  - Mahsulotlarga baho va sharhlar qoldirish
- **SELLER (Sotuvchi)**:
  - Do‘kon ochish (`/seller/register`)
  - Sotuvchi shaxsiy boshqaruv kabineti (`/seller/dashboard`)
  - Mahsulotlar to‘liq CRUD (Yaratish, tahrirlash, o‘chirish, ombor miqdori, narx, rasmlar, SKU)
  - Buyurtmalarni boshqarish va holatini o‘zgartirish (`CONFIRMED`, `SHIPPED`, `DELIVERED`, `CANCELLED`)
  - Daromad va sotuvlar statistikasi
- **ADMIN (Administrator)**:
  - Tizim statistikasi (Foydalanuvchilar, sotuvchilar, tovarlar, jami aylanma va tushum)
  - Foydalanuvchilar ro‘yxati, qidiruv, rollarni o‘zgartirish, bloklash / faollashtirish
  - Sotuvchilarni tasdiqlash (`APPROVED`), to‘xtatish (`SUSPENDED`), rad etish
  - Mahsulotlarni moderatsiya qilish
  - Kategoriyalar boshqaruvi (CRUD)
  - Demo ma’lumotlarni bir bosishda qayta tiklash

### 2. 🔐 Xavfsizlik va Autentifikatsiya
- **JWT (JSON Web Token)**: Access token (1 kun) + Refresh token (7 kun) arxitekturasi
- **Bcrypt**: Parollar tuzli (salt 10) xeshlanadi
- **Zod**: Backend kiruvchi barcha so‘rovlar (Register, Login, Product, Order, Category) uchun qat'iy tekshiruv
- **Protected Routes**: Ruxsatsiz kirish bloklangan, role middleware orqali xavfsizlik ta’minlangan
- **XSS & SQL Injection protection**: Toza arxitektura va sanatsiya

---

## 🔑 Demo hisoblar (Quick Test Logins)

Platformani darhol tekshirish uchun quyidagi hisoblar yoki saytdagi **"Demo Rollar"** tugmasidan foydalaning:

| Rol | Elektron pochta | Parol | Tavsif |
|---|---|---|---|
| **ADMIN** | `admin@bozor.uz` | `admin123` | Barcha vakolatlarga ega tizim boshqaruvchisi |
| **SELLER** | `seller@bozor.uz` | `seller123` | "TechnoMall O‘zbekiston" rasmiy do‘koni |
| **CUSTOMER** | `user@bozor.uz` | `user123` | Anvar Karimov (Mijoz) |

> ⚠️ **OGOHLANTIRISH**: Production rejimida ushbu demo parollardan foydalanmang! Parollarni o‘zgartiring va `.env` faylida xavfsiz kalitlarni belgilang.

---

## 🛠 Texnologiyalar to‘plami

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS, Lucide Icons, Axios
- **Backend**: Node.js, Express.js, TypeScript (tsx), JWT, bcryptjs, Zod
- **Database**: PostgreSQL / Prisma ORM schema (`prisma/schema.prisma`), persistent file-backed JSON relational store
- **Architecture**: Controllers, Services, Routes, Middleware, Models, Types, Error Handling

---

## 🚀 O‘rnatish va Ishga tushirish (Local Setup)

### 1. Talablar (Requirements)
- Node.js >= 18.0.0
- npm >= 9.0.0
- PostgreSQL (agar PostgreSQL bilan ishlatilsa)

### 2. Bog‘liqliklarni o‘rnatish
```bash
npm install
```

### 3. Environment sozlamalari (`.env`)
Loyihaning ildiz qismida `.env` faylini yarating:
```env
PORT=3000
DATABASE_URL="postgresql://postgres:password@localhost:5432/bozoruz"
JWT_ACCESS_SECRET="bozor_uz_jwt_access_secret_super_secure_key_2026"
JWT_REFRESH_SECRET="bozor_uz_jwt_refresh_secret_super_secure_key_2026"
VITE_API_URL="/api"
CLOUDINARY_CLOUD_NAME=""
CLOUDINARY_API_KEY=""
CLOUDINARY_API_SECRET=""
```

### 4. Prisma va Ma’lumotlar bazasi (PostgreSQL)
Prisma migratsiyalarini ishga tushirish:
```bash
npx prisma migrate dev --name init
npx prisma db seed
```

### 5. Serverni ishga tushirish (Full-Stack dev)
```bash
npm run dev
```
Ushbu buyruq Express serverini ishga tushiradi (`server.ts`), `/api/*` REST API marshrutlarini faollashtiradi va bir vaqtning o‘zida Vite middleware orqali React interfeysini taqdim etadi.

Dastur manzili:
```
http://localhost:3000
```

---

## 📡 REST API Hujjatlari (API Documentation)

### 1. Autentifikatsiya (`/api/auth`)
- `POST /api/auth/register` — Yangi xaridor ro‘yxatdan o‘tkazish
- `POST /api/auth/login` — Tizimga kirish (Access va Refresh token qaytaradi)
- `POST /api/auth/refresh` — Access tokenni yangilash
- `POST /api/auth/logout` — Tizimdan chiqish
- `GET /api/auth/me` — Joriy profil ma’lumotlari (Himoyalangan)
- `PUT /api/auth/profile` — Profilni yangilash (Ism, telefon)
- `PUT /api/auth/password` — Parolni o‘zgartirish

### 2. Mahsulotlar (`/api/products`)
- `GET /api/products` — Qidiruv, saralash, filtrlar (`q`, `category`, `minPrice`, `maxPrice`, `rating`, `sort`, `page`, `limit`)
- `GET /api/products/:id` — Mahsulot tafsilotlari, sotuvchi ma’lumotlari va sharhlar
- `POST /api/products` — Yangi mahsulot yaratish (Sotuvchi/Admin)
- `PUT /api/products/:id` — Mahsulotni yangilash
- `DELETE /api/products/:id` — Mahsulotni o‘chirish

### 3. Savat (`/api/cart`)
- `GET /api/cart` — Savat tarkibi, yetkazib berish narxi va jami hisob
- `POST /api/cart` — Mahsulot qo‘shish
- `PUT /api/cart/:itemId` — Miqdorini o‘zgartirish
- `DELETE /api/cart/:itemId` — Savatdan olib tashlash
- `DELETE /api/cart` — Savatni tozalash
- `POST /api/cart/sync` — Mehmon savatini foydalanuvchi hisobi bilan birlashtirish

### 4. Buyurtmalar (`/api/orders`)
- `POST /api/orders` — Yangi buyurtma yaratish
- `GET /api/orders` — Foydalanuvchi buyurtmalari (Admin barchasini ko‘radi)
- `GET /api/orders/:id` — Buyurtma tafsilotlari va kuzatuv ma’lumotlari
- `PUT /api/orders/:id/status` — Buyurtma holatini yangilash (Sotuvchi/Admin)

### 5. Sevimlilar (`/api/favorites`)
- `GET /api/favorites` — Sevimli mahsulotlar ro‘yxati
- `POST /api/favorites/:productId` — Sevimlilarga qo‘shish
- `DELETE /api/favorites/:productId` — Sevimlilardan o‘chirish

### 6. Sotuvchi (`/api/seller`)
- `POST /api/seller/register` — Sotuvchi sifatida ro‘yxatdan o‘tish
- `GET /api/seller/dashboard` — Statistika (Daromad, buyurtmalar, tovarlar qoldig‘i)
- `GET /api/seller/products` — Sotuvchining tovarlari
- `GET /api/seller/orders` — Sotuvchining buyurtmalari

### 7. Admin (`/api/admin`)
- `GET /api/admin/dashboard` — Umumiy hisobotlar va diagramma ko‘rsatkichlari
- `GET /api/admin/users` — Foydalanuvchilar ro‘yxati va qidiruv
- `PUT /api/admin/users/:id/role` — Rolni o‘zgartirish (`CUSTOMER`, `SELLER`, `ADMIN`)
- `PUT /api/admin/users/:id/status` — Bloklash / Faollashtirish (`ACTIVE`, `BLOCKED`)
- `GET /api/admin/sellers` — Sotuvchilar ro‘yxati
- `PUT /api/admin/sellers/:id/status` — Sotuvchini tasdiqlash / to‘xtatish
- `POST /api/admin/reset-data` — Boshlang‘ich demo bazani tiklash

---

## 🚢 Production Deployment

Loyiha Cloud Run, VPS, Docker yoki istalgan Node.js muhitida ishga tushirishga tayyor.

Production build yaratish:
```bash
npm run build
npm start
```
Bu holda Vite frontend kodini optimallashtirib `dist/` jildiga yig‘adi va `server.ts` uni statik ravishda tarqatadi.
