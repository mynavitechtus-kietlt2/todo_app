# NestJS Architecture

> Kiến trúc tổng quan và các khái niệm cốt lõi của NestJS framework — **đồng bộ với repo `todo_app` hiện tại** (có thể mở rộng Users/Auth/DB sau).

**Repo `todo_app`:** mã nằm ở **thư mục gốc** (`src/`, `package.json`). Chạy: `npm install`, `npm run start` / `npm run start:dev`. Tiền tố API: **`/api`**. Tài liệu kèm: [`getting-started.md`](./getting-started.md), [`project-structure.md`](./project-structure.md), [`api-loi-http.md`](./api-loi-http.md), [`swagger-hien-thi-api.md`](./swagger-hien-thi-api.md).

---

## Tổng quan

NestJS là framework Node.js progressive, **TypeScript**, kiến trúc **modular**, **Dependency Injection**, adapter HTTP mặc định **Express**.

### App trong repo hiện tại (thực tế)

```
┌───────────────────────────────────────────────────────────────┐
│                     NestJS App (todo_app)                      │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │                    AppModule (root)                       │ │
│  │  imports: [TodosModule]                                   │ │
│  │  controllers: [AppController]  →  GET /api (hello)        │ │
│  │  providers: [AppService]                                  │ │
│  └───────────────────────────┬──────────────────────────────┘ │
│                              │                                 │
│  ┌───────────────────────────▼──────────────────────────────┐ │
│  │                    TodosModule                             │ │
│  │  TodosController  →  /api/todos  (REST)                    │ │
│  │  TodosService                                              │ │
│  │  TodosRepository  →  in-memory (Map), sau này thay DB      │ │
│  └──────────────────────────────────────────────────────────┘ │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │  main.ts             — ValidationPipe, Swagger, prefix api │ │
│  └──────────────────────────────────────────────────────────┘ │
└───────────────────────────────────────────────────────────────┘
```

### Hướng mở rộng (chưa có trong repo)

Có thể thêm **UsersModule**, **AuthModule** (JWT), **guards/interceptors/filters** trong `src/common/`, và **PostgreSQL / TypeORM / Prisma** thay cho in-memory — mô hình phân tầng bên dưới vẫn áp dụng.

---

## Layered Architecture (kiến trúc phân tầng)

Mỗi tầng một trách nhiệm; thường chỉ nói chuyện với tầng liền kề.

```
  HTTP Request
       │
       ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 1: TRANSPORT / API (Controllers, …)                  │
│  Nhận request, validate input (Pipe + DTO), trả response      │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 2: BUSINESS (Services)                               │
│  Quy tắc nghiệp vụ, orchestration                           │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 3: DATA ACCESS (Repositories, ORM, …)                │
│  Đọc/ghi dữ liệu, không chứa rule HTTP                       │
└─────────────────────────────┬───────────────────────────────┘
                              ▼
┌─────────────────────────────────────────────────────────────┐
│  LAYER 4: PERSISTENCE (DB, cache, file, …)                    │
│  Trong todo_app hiện tại: Map trong TodosRepository         │
└─────────────────────────────────────────────────────────────┘
```

**Ghi chú `todo_app`:** `ValidationPipe` global trong `main.ts` + DTO `class-validator`. Lỗi HTTP: JSON `{ statusCode, message, error }` — xem [`api-loi-http.md`](./api-loi-http.md). Swagger: [`swagger-hien-thi-api.md`](./swagger-hien-thi-api.md).

---

## Ví dụ mở rộng: Users + Auth (chưa triển khai trong repo)

Luồng đăng ký / đăng nhập / profile với JWT là **mẫu tham khảo** khi bạn thêm module; hiện **không** có `users/` hay `JwtAuthGuard` trong source.

```
  POST /api/users/register   { email, password, name }
  POST /api/users/login      { email, password }
  GET  /api/users/profile    [Authorization: Bearer …]
       │
       ▼
  UsersController → UsersService → UserRepository → PostgreSQL (users)
```

---

## Todos Module — khớp code hiện tại

**Xác thực “demo”:** header **`x-user-id`** (số ≥ 1), không phải JWT. Swagger: nút **Authorize** + scheme `addApiKey` trong `main.ts`.

### REST (tiền tố `/api`)

```
  GET    /api/todos          ?page=&limit=&completed=
  POST   /api/todos          { title }
  GET    /api/todos/:id
  PATCH  /api/todos/:id      { title?, completed? }
  DELETE /api/todos/:id      → 204 No Content
```

### LAYER 1: `TodosController`

```
┌─────────────────────────────────────────────────────────────────┐
│  TodosController  @Controller('todos')  +  @ApiTags / Swagger   │
│                                                                 │
│  @Get()        findAll(@Query() FilterTodoDto, @Headers('x-user-id')) │
│  @Post()       create(@Body() CreateTodoDto, …)  → 201 Todo    │
│  @Get(':id')   findOne(@Param('id', ParseIntPipe), …)            │
│  @Patch(':id') update(@Body() UpdateTodoDto, …)                 │
│  @Delete(':id') remove(…)  → 204                               │
└──────────────────────────────┬──────────────────────────────────┘
                               ▼
```

### LAYER 2: `TodosService`

- **create:** `TodosRepository.create({ title, userId })`
- **findAll:** phân trang + lọc `completed` qua repository
- **findOne:** không thấy → `NotFoundException`
- **update:** nếu `completed === true` và đã completed → `BadRequestException`; còn lại partial update qua repository
- **remove:** `findOne` rồi `repository.delete`

(Không có event bus trong code hiện tại — có thể thêm sau.)

### LAYER 3: `TodosRepository`

- **create / findByUser / findOneByUser / update / delete** trên `Map<number, Todo>`
- **Entity** domain: `Todo` (`id`, `title`, `completed`, `userId`, `createdAt`, `updatedAt`) — file `entities/todo.entity.ts`
- **DTO:** `CreateTodoDto`, `UpdateTodoDto`, `FilterTodoDto`, `TodoListResponseDto` (response list)

### LAYER 4: Persistence

- **Hiện tại:** in-memory, mất dữ liệu khi restart process.
- **Sau này:** bảng `todos` (id, title, completed, user_id, created_at, updated_at), FK tới `users(id)` khi có module Users.

---

## Mối quan hệ module & dữ liệu (trạng thái repo)

```
┌─────────────────────────────────────────────────────────────────┐
│                        AppModule                                 │
│  imports: [TodosModule]                                          │
│  controllers: [AppController]    providers: [AppService]         │
│                                                                  │
│  ┌─────────────────────────────┐                                │
│  │        TodosModule            │                                │
│  │  TodosController            │                                │
│  │       → TodosService        │                                │
│  │       → TodosRepository     │  (Map in-memory)               │
│  └─────────────────────────────┘                                │
│                                                                  │
│  Chưa có: UsersModule, AuthModule, DB thật.                      │
│  Phân tách user demo: header x-user-id (mặc định logic = 1).   │
└─────────────────────────────────────────────────────────────────┘
```

Khi thêm **UsersModule** + DB: có thể `TodosModule` import `UsersModule` để `TodosService` kiểm tra user tồn tại; `user_id` lưu trong bảng `todos`.

---

## Cấu trúc thư mục `src/` (todo_app — cập nhật theo repo)

```
src/
├── main.ts                 # NestFactory, globalPrefix 'api', ValidationPipe, SwaggerModule
├── app.module.ts
├── app.controller.ts
├── app.service.ts
└── todos/
    ├── todos.module.ts
    ├── todos.controller.ts
    ├── todos.service.ts
    ├── todos.repository.ts
    ├── dto/
    │   ├── create-todo.dto.ts
    │   ├── update-todo.dto.ts
    │   ├── filter-todo.dto.ts
    │   └── todo-list-response.dto.ts
    └── entities/
        └── todo.entity.ts              # domain + @ApiProperty (Swagger response)
```

Thư mục **`docs/`** (ngoài `src/`): kiến trúc, Swagger, lỗi HTTP, getting-started — xem [`README.md`](./README.md).

### Có thể thêm sau (placeholder kiến trúc đầy đủ)

```
src/common/guards/          # JwtAuthGuard, …
src/common/filters/         # Exception filter tùy chỉnh
src/users/                  # UsersModule, …
```

---

## Tài liệu liên quan trong repo

| File | Nội dung |
|------|----------|
| [`project-structure.md`](./project-structure.md) | Giải thích từng phần cấu trúc |
| [`nestjs-request-flow.md`](./nestjs-request-flow.md) | Vòng đời request (middleware, guard, pipe, …) |
| [`nextjs-di-ioc.md`](./nextjs-di-ioc.md) | IoC/DI (khái niệm, ví dụ Todo) |
| [`api-loi-http.md`](./api-loi-http.md) | JSON lỗi HTTP |
| [NestJS Documentation](https://docs.nestjs.com) | Tài liệu chính thức |
