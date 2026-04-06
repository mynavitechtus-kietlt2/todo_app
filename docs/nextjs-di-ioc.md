# IoC / DI và NestJS IoC Container

**Repo `todo_app`:** ví dụ thực tế tương ứng với Nest app tại **thư mục gốc** (`src/`, module gốc `AppModule`).

---

## 1. Hai khái niệm (gọn)

**IoC (Inversion of Control)**  
*Đảo ngược quyền điều khiển*: framework/runtime **gọi code bạn** và/hoặc **nắm vòng đời object** theo luật của nó, thay vì toàn bộ luồng do bạn viết từ đầu đến cuối. Ví dụ: HTTP pipeline gọi controller; Nest tạo/cache provider theo scope.

**DI (Dependency Injection)**  
*Chèn phụ thuộc từ ngoài vào*: class/hàm **không tự tạo** mọi collaboration; dependency được **truyền vào** (constructor, tham số, props…). DI là **cách** giảm gắn chặt; IoC container (Nest) là **nơi** thường **tự động** thực hiện DI.

**Mối quan hệ:** IoC (ai điều phối) rộng hơn; DI thường là **một phần** của IoC trong app dùng **container** để “dây nối” dependency.

---

## 2. Mô hình NestJS IoC Container — ví dụ **Todo App** (sơ đồ ASCII)

> Cùng tinh thần với `nestjs-architecture.md`: `UsersModule`, `TodosModule`, `AuthModule`.

### A) Lúc app vừa chạy — đăng ký vào Container

```
                    ┌────────────────────────────────────────┐
                    │              AppModule                  │
                    │  imports: [Users, Todos, Auth, …]       │
                    └────────────────────┬───────────────────┘
                                         │
              ┌──────────────────────────┴──────────────────────────┐
              ▼                                                     ▼
   ┌─────────────────────────┐                    ┌─────────────────────────┐
   │      UsersModule        │  export công khai   │      TodosModule        │
   │  ─────────────────────  │  cho module khác    │  ─────────────────────  │
   │  • UsersController      │ ──────────────────► │  imports: [UsersModule] │
   │  • UsersService         │                     │  • TodosController      │
   │  • UserRepository       │                     │  • TodosService         │
   │  exports:               │                     │  • TodoRepository       │
   │    → UsersService       │                     │                         │
   └────────────┬────────────┘                     └────────────┬────────────┘
                │                                               │
                └───────────────────────┬───────────────────────┘
                                        ▼
                         ┌──────────────────────────────┐
                         │       IoC Container          │
                         │         (Injector)           │
                         │  token → provider + scope    │
                         └──────────────────────────────┘
```

**Giải thích ngắn**

- **AppModule** chỉ là “cây gốc”: kéo `UsersModule`, `TodosModule` vào cùng một app.
- **TodosModule** `imports UsersModule` vì `TodosService` cần **UsersService** (kiểm tra user, owner). Chỉ class được **export** từ `UsersModule` mới inject được sang module khác.
- Mọi `providers` / `controllers` hợp lệ được ghi vào **một bảng tra cứu** bên trong Nest: đó chính là **Container**; khi app chạy, **Injector** dùng bảng này để biết **tạo class nào trước**, phụ thuộc **class nào sau**.

---

### B) Một request HTTP — ví dụ **POST /todos**

```
   ┌─────────────────────────────────────────────────────────────┐
   │ ①  POST /todos  +  body JSON → map sang CreateTodoDto        │
   └──────────────────────────────────┬──────────────────────────┘
                                        ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ ②  Router Nest: khớp method + path → gọi handler trong       │
   │     TodosController                                           │
   └──────────────────────────────────┬──────────────────────────┘
                                        ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ ③  Injector đã “dây sẵn”: TodosController nhận TodosService  │
   │     (TodosService bên trong đã có UsersService + TodoRepo…)    │
   └──────────────────────────────────┬──────────────────────────┘
                                        ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ ④  create(dto): validate logic, DB, join user nếu cần → entity │
   └──────────────────────────────────┬──────────────────────────┘
                                        ▼
   ┌─────────────────────────────────────────────────────────────┐
   │ ⑤  Trả JSON (todo mới + trạng thái) hoặc lỗi HTTP           │
   └─────────────────────────────────────────────────────────────┘
```

**Giải thích ngắn**

- Bạn **không** tự `new TodosController()` trong code route: Nest **một lần** học dependency từ decorator, **mỗi request** (hoặc theo scope) nó lấy/khởi tạo đủ chỗ rồi gọi method.
- Bước **①–②** là **HTTP + routing**; **③** là chỗ **IoC/DI** can thiệp; **④–⑤** là **logic nghiệp vụ** và **response**.

---

### C) Cây phụ thuộc (Todo + User)

```
                         ┌─────────────────────┐
                         │   TodosController   │
                         └──────────┬──────────┘
                                    │  inject: TodosService
                                    ▼
                         ┌─────────────────────┐
                         │    TodosService     │
                         └──────────┬──────────┘
                         ┌──────────┴──────────┐
                         ▼                     ▼
              ┌──────────────────┐   ┌──────────────────┐
              │ TodoRepository   │   │  UsersService    │
              └────────┬─────────┘   └────────┬─────────┘
                       ▼                      ▼
              ┌──────────────────┐   ┌──────────────────┐
              │  DB: bảng todos │   │ UserRepository   │
              │  (user_id FK)   │   └────────┬─────────┘
              └──────────────────┘            ▼
                                   ┌──────────────────┐
                                   │  DB: bảng users  │
                                   └──────────────────┘
```

**Giải thích ngắn**

- **Một lớp chỉ biết lớp “ngay dưới”** trong cây: Controller → Service → Repository / service khác; không đụng DB trực tiếp từ controller.
- **Nhánh UsersService** minh họa **phụ thuộc xuyên module**: phải **export + import module** đúng, Container mới resolve được.
- Trong code thực tế, `TodoRepository` có thể là class repository tự viết hoặc `Repository<Todo>` của TypeORM (`@InjectRepository(Todo)`); sơ đồ chỉ cần gọn **một ô “truy cập DB todo”**.

---

**Ý chính:** `@Module` **khai báo** graph; **Injector** **resolve + inject constructor** theo **scope**. Cấu trúc thư mục tham chiếu: `src/todos/`, `src/users/`, `app.module.ts` trong `nestjs-architecture.md`.

---

*Tài liệu chi tiết kiến trúc Nest: `nestjs-architecture.md`, luồng request: `nestjs-request-flow.md`.*
