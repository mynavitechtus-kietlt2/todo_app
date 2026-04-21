# Hiển thị API lên Swagger (NestJS + `@nestjs/swagger`)

Tóm tắt cách OpenAPI/Swagger hoạt động trong project. **Hiện tất cả route todo + hello đều có trên Swagger UI** (`/api/docs`).

Trong code, chỗ nào dùng syntax Swagger thường có comment **`[Swagger]`** hoặc **`Swagger / OpenAPI`** — xem [`src/main.ts`](../src/main.ts), [`src/app.controller.ts`](../src/app.controller.ts), [`src/todos/todos.controller.ts`](../src/todos/todos.controller.ts), các file trong [`src/todos/dto/`](../src/todos/dto/), [`src/todos/entities/todo.entity.ts`](../src/todos/entities/todo.entity.ts).

---

## 1. Cài đặt & bật Swagger toàn app (`main.ts`)

| Thành phần | Ý nghĩa |
|------------|---------|
| **`DocumentBuilder`** | Tiêu đề, mô tả, version, **tags**, **security schemes** (API Key, Bearer, …) |
| **`addApiKey(..., 'tên-scheme')`** | Đăng ký API Key; tên scheme dùng lại trong **`@ApiSecurity('tên-scheme')`** |
| **`addTag`** | Khai báo nhóm tag (khớp **`@ApiTags`** trên controller) |
| **`SwaggerModule.createDocument(app, config)`** | Quét decorator `@Api*` trên controller/DTO → object OpenAPI |
| **`SwaggerModule.setup('docs', app, document, { useGlobalPrefix: true })`** | Gắn UI; `useGlobalPrefix` khớp `setGlobalPrefix('api')` → **`/api/docs`** |

---

## 2. Controller — decorator thường gặp

| Decorator | Tác dụng trên UI / spec |
|-----------|-------------------------|
| **`@ApiTags('nhóm')`** | Gom operation vào một mục bên trái Swagger |
| **`@ApiOperation({ summary })`** | Tiêu đề ngắn cho từng method |
| **`@ApiOkResponse`**, **`@ApiCreatedResponse`**, **`@ApiNoContentResponse`** | Mô tả status 200 / 201 / 204 và kiểu `type: Class` |
| **`@ApiBadRequestResponse`**, **`@ApiNotFoundResponse`**, … | Mô tả **response lỗi** (thường kèm `schema`) — xem [`api-loi-http.md`](./api-loi-http.md) |
| **`@ApiParam`**, **`@ApiQuery`** | Mô tả path param / query (có thể bổ sung cho query nếu cần) |
| **`@ApiSecurity('scheme')`** | Gắn operation với scheme (Authorize) |
| **`@ApiExcludeEndpoint()`** | Ẩn một route khỏi Swagger (project hiện **không** dùng) |
| **`@ApiBearerAuth()`** | Shortcut nếu dùng JWT Bearer (chưa cấu hình trong app này) |

HTTP routing vẫn do **`@Get` / `@Post` / …** của `@nestjs/common`; Swagger chỉ đọc thêm metadata.

---

## 3. DTO & entity — schema Request/Response

| Decorator | Tác dụng |
|-----------|----------|
| **`@ApiProperty(...)`** | Field bắt buộc trong schema (body / object lồng nhau) |
| **`@ApiPropertyOptional(...)`** | Field không bắt buộc |
| **`type: [Todo]`** trong `@ApiProperty` | Mảng của schema `Todo` |

Kết hợp **`class-validator`** + **`ValidationPipe`**: validate runtime; Swagger chỉ **tài liệu hóa**.

---

## 4. Kiểm tra nhanh

1. Chạy app → **`http://localhost:3000/api/docs`**
2. **Authorize** → nhập `x-user-id` (ví dụ `1`)
3. Spec JSON: **`/api/docs-json`**

---

## Tài liệu chính thức

- [NestJS OpenAPI](https://docs.nestjs.com/openapi/introduction)
