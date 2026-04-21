# Week 2 Plan: Supabase + Prisma

Muc tieu: dua he thong Todo chay tren PostgreSQL (Supabase) va truy cap DB thong qua Prisma trong NestJS.

## 1) Muc tieu dau ra

- Co Supabase project va ket noi thanh cong tu backend.
- Co `schema.prisma` cho module Todo va migration dau tien.
- CRUD Todo trong NestJS dung Prisma (khong dung storage tam).
- Co seed data de test nhanh.
- Co tai lieu huong dan setup cho team.

## 2) Ke hoach theo buoi (5 buoi)

### Buoi 1 - Setup Supabase + Prisma

- Tao project tren Supabase.
- Lay `DATABASE_URL` va cap nhat file `.env`.
- Cai package:
  - `npm i @prisma/client`
  - `npm i -D prisma`
- Khoi tao Prisma:
  - `npx prisma init`
- Kiem tra ket noi:
  - `npx prisma migrate dev --name init`

### Buoi 2 - Thiet ke model Todo

- Dinh nghia model `Todo` trong `prisma/schema.prisma`:
  - `id`, `title`, `description?`, `isCompleted`, `createdAt`, `updatedAt`
- Chay:
  - `npx prisma format`
  - `npx prisma generate`
  - `npx prisma migrate dev --name create_todo`

### Buoi 3 - Tich hop Prisma vao NestJS

- Tao `PrismaService` (extends `PrismaClient`).
- Tao `PrismaModule` va export service.
- Inject vao `TodosService`.
- Refactor CRUD:
  - `create` -> `prisma.todo.create`
  - `findAll` -> `prisma.todo.findMany`
  - `findOne` -> `prisma.todo.findUnique`
  - `update` -> `prisma.todo.update`
  - `remove` -> `prisma.todo.delete`

### Buoi 4 - Seed + test API

- Tao `prisma/seed.ts` voi 5-10 du lieu mau.
- Them scripts trong `package.json`:
  - `"prisma:generate": "prisma generate"`
  - `"prisma:migrate": "prisma migrate dev"`
  - `"prisma:seed": "tsx prisma/seed.ts"`
- Test qua Swagger/Postman:
  - Tao, doc, cap nhat, xoa todo
  - Kiem tra response va loi not-found

### Buoi 5 - Hoan thien va tai lieu

- Viet huong dan setup env cho local va production.
- Chot quy trinh:
  - migrate khi co thay doi schema
  - seed cho moi truong dev
- Soat lai toan bo flow run tu dau den cuoi.

## 3) Muc schema dang ap dung (Prisma)

```prisma
model Todo {
  id        Int      @id @default(autoincrement())
  title       String
  completed Boolean  @default(false)
  userId    Int
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

## 4) Checklist hoan thanh

- [ ] Tao Supabase project va ket noi tu app thanh cong
- [ ] Tao migration dau tien thanh cong
- [x] CRUD Todo da chay bang Prisma
- [ ] Seed data chay duoc
- [ ] Swagger/Postman test pass
- [x] Tai lieu setup du cho team

## 5) Tien do da thuc hien trong repo

- Da cai `@prisma/client`, `prisma`, `tsx`.
- Da tao `prisma/schema.prisma` (PostgreSQL datasource + model Todo).
- Da tao `src/prisma/prisma.service.ts` va `src/prisma/prisma.module.ts`.
- Da refactor `TodosService` tu in-memory sang Prisma query.
- Da bo `todos.repository.ts` in-memory.
- Da them `prisma/seed.ts` va scripts `prisma:*` trong `package.json`.
- Da tao `.env.example` de dien `DATABASE_URL`.
- Da build thanh cong (`npm run build`).

## 6) Lenh su dung nhanh

```bash
npm i @prisma/client
npm i -D prisma
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
```

## 7) Luu y quan trong

- Khong commit file `.env`.
- `prisma/schema.prisma` dung `DATABASE_URL` + `DIRECT_URL`: migrate/introspect can **Direct** (port **5432**); pooler **6543** chi phu hop cho runtime (hoac dev co the gan ca hai cung mot URL 5432).
- Mat khau trong URL la **Database password** (Supabase → Settings → Database), khong phai API key. Ky tu dac biet trong mat khau can **URL-encode**.
- Loi **P1000 Authentication failed** voi `pooler.supabase.com:6543`: thuong la sai mat khau, hoac can dung `DIRECT_URL` (5432) cho migrate; doi khi user pooler phai dung dung dinh dang `postgres.[PROJECT_REF]` theo dashboard.
- Uu tien giu schema gon, ro, de thay doi o tuan dau.
