# NestJS Request Lifecycle

> Luồng xử lý một HTTP Request đi qua các tầng trong NestJS framework

**Repo `todo_app`:** code NestJS ở **root** (`src/main.ts` là entry). Chạy thử: `npm run start:dev`.

---

```
Client Request
      │
      ▼
┌─────────────┐
│  Middleware  │ ── Global → Module-level
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Guards    │ ── Authorization (true/false)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Interceptors│ ── Pre-processing (before handler)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│    Pipes    │ ── Validation & Transformation
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Controller │ ── Route Handler
└──────┬──────┘
       │
       ▼
┌─────────────┐
│   Service   │ ── Business Logic & Database
└──────┬──────┘
       │
       ▼
┌─────────────┐
│ Interceptors│ ── Post-processing (after handler)
└──────┬──────┘
       │
       ▼
┌─────────────┐
│  Response   │ ── HTTP Response → Client
└─────────────┘

  ⚡ Exception xảy ra ở bất kỳ tầng nào:
       │
       ▼
┌──────────────────┐
│ Exception Filters │ ── Catch & format error response
└──────────────────┘
```

---

## 1. Incoming Request

> **HTTP Request** | `GET` `POST` `PUT` `DELETE` `PATCH`

Client gửi HTTP Request đến server NestJS. Request chứa method, URL, headers, body, query params...

```typescript
// Client gửi request
fetch('/api/todos', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ title: 'Learn NestJS' })
});
```

---

## 2. Middleware

> **Global → Module-level** | `Logging` `CORS` `Helmet` `Body Parser` `Session`

Middleware chạy **đầu tiên**, trước mọi Guard/Interceptor. Dùng cho logging, CORS, body parsing, authentication cơ bản. Thực thi theo thứ tự **global → module-scoped**.

```typescript
@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  use(req: Request, res: Response, next: NextFunction) {
    console.log(`[${req.method}] ${req.url}`);
    next();
  }
}
```

**Đăng ký Middleware:**

```typescript
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
  }
}
```

---

## 3. Guards

> **Authorization Layer** | `AuthGuard` `RolesGuard` `ThrottlerGuard` `canActivate()`

Guards quyết định request có được phép tiếp tục hay không (trả về `true`/`false`). Thường dùng để xác thực JWT, kiểm tra role, permission. Chạy **sau Middleware, trước Interceptor**.

```typescript
@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const token = request.headers.authorization;
    return validateToken(token); // true → tiếp tục, false → 403
  }
}
```

**Sử dụng Guard:**

```typescript
// Áp dụng cho 1 route
@UseGuards(JwtAuthGuard)
@Get('profile')
getProfile() { ... }

// Áp dụng Global
app.useGlobalGuards(new JwtAuthGuard());
```

---

## 4. Interceptors (Before)

> **Pre-processing** | `CacheInterceptor` `LoggingInterceptor` `TimeoutInterceptor` `RxJS`

Interceptors wrap quanh route handler, có thể transform request **trước khi** vào controller. Dùng cho caching, logging thời gian xử lý, transform data. Chạy theo pattern **RxJS Observable**.

```typescript
@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const now = Date.now();
    console.log('Before handler...');

    return next.handle().pipe(
      tap(() => console.log(`After... ${Date.now() - now}ms`))
    );
  }
}
```

---

## 5. Pipes

> **Validation & Transformation** | `ValidationPipe` `ParseIntPipe` `ParseUUIDPipe` `class-validator`

Pipes validate và transform dữ liệu input trước khi đến route handler. Dùng `class-validator` để validate DTO, `ParseIntPipe` để chuyển đổi kiểu dữ liệu. Nếu validation fail → ném `BadRequestException`.

```typescript
@Injectable()
export class ValidationPipe implements PipeTransform {
  async transform(value: any, metadata: ArgumentMetadata) {
    const object = plainToInstance(metadata.metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      throw new BadRequestException(errors);
    }
    return value;
  }
}
```

**Sử dụng Pipe:**

```typescript
// Áp dụng cho parameter
@Get(':id')
findOne(@Param('id', ParseIntPipe) id: number) { ... }

// Áp dụng Global
app.useGlobalPipes(new ValidationPipe());
```

---

## 6. Route Handler (Controller)

> **Controller Method** | `@Controller` `@Get` `@Post` `@Body` `@Param` `@Query`

Controller nhận request đã được validate, gọi Service để xử lý business logic. Mỗi method được đánh dấu bằng decorator (`@Get`, `@Post`, `@Put`, `@Delete`...) và map với HTTP method + route tương ứng.

```typescript
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  async create(@Body() dto: CreateTodoDto) {
    return this.todosService.create(dto);
  }

  @Get()
  async findAll(@Query('page') page: number) {
    return this.todosService.findAll(page);
  }

  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number) {
    return this.todosService.findOne(id);
  }
}
```

---

## 7. Service / Business Logic

> **Provider Layer** | `@Injectable` `TypeORM` `Prisma` `Repository` `DI`

Service chứa business logic chính, tương tác với database qua Repository/ORM (TypeORM, Prisma, Mongoose...). Được inject vào Controller qua **Dependency Injection**. Tách biệt logic khỏi controller.

```typescript
@Injectable()
export class TodosService {
  constructor(
    @InjectRepository(Todo)
    private todoRepo: Repository<Todo>
  ) {}

  async create(dto: CreateTodoDto): Promise<Todo> {
    const todo = this.todoRepo.create(dto);
    return this.todoRepo.save(todo);
  }

  async findOne(id: number): Promise<Todo> {
    const todo = await this.todoRepo.findOne({ where: { id } });
    if (!todo) {
      throw new NotFoundException(`Todo #${id} not found`);
    }
    return todo;
  }
}
```

---

## 8. Interceptors (After)

> **Post-processing** | `TransformInterceptor` `map()` `tap()` `Response Mapping`

Sau khi handler trả về response, Interceptors xử lý tiếp: transform data (ví dụ wrap trong `{ data: ... }`), logging response time, caching response. Sử dụng RxJS operators như `map`, `tap`, `catchError`.

```typescript
@Injectable()
export class TransformInterceptor<T> implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    return next.handle().pipe(
      map(data => ({
        statusCode: context.switchToHttp().getResponse().statusCode,
        data,
        timestamp: new Date().toISOString()
      }))
    );
  }
}
```

---

## 9. Server Response

> **HTTP Response** | `200 OK` `201 Created` `JSON` `Headers`

Response cuối cùng được gửi về client với status code, headers và body phù hợp. NestJS tự động serialize object thành JSON. Có thể custom bằng `@Res()` decorator hoặc Interceptor.

```json
{
  "statusCode": 201,
  "data": {
    "id": 1,
    "title": "Learn NestJS",
    "completed": false,
    "createdAt": "2026-03-31T10:00:00.000Z"
  },
  "timestamp": "2026-03-31T10:00:00.123Z"
}
```

---

## Exception Filters (Error Handling)

> **Error Handling Layer** | `HttpException` `ExceptionFilter` `catch()` `Global Filter`

Khi exception xảy ra ở **bất kỳ tầng nào** (Guard throw `UnauthorizedException`, Pipe throw `BadRequestException`, Service throw `NotFoundException`...), Exception Filter sẽ catch và trả về error response chuẩn hóa.

```typescript
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const status = exception.getStatus();

    response.status(status).json({
      statusCode: status,
      message: exception.message,
      timestamp: new Date().toISOString()
    });
  }
}
```

**Đăng ký Exception Filter:**

```typescript
// Cho 1 route
@UseFilters(HttpExceptionFilter)
@Get()
findAll() { ... }

// Global
app.useGlobalFilters(new HttpExceptionFilter());
```

**Error Response mẫu:**

```json
{
  "statusCode": 404,
  "message": "Todo #99 not found",
  "timestamp": "2026-03-31T10:00:00.456Z"
}
```

---

## Thứ tự thực thi (Execution Order)

| Thứ tự | Tầng | Scope hỗ trợ | Khi nào chạy |
|:------:|------|:------------:|---------------|
| 1 | **Middleware** | Global, Module | Mọi request đi qua |
| 2 | **Guards** | Global, Controller, Method | Trước khi vào handler |
| 3 | **Interceptors** (before) | Global, Controller, Method | Trước handler |
| 4 | **Pipes** | Global, Controller, Method, Param | Trước handler, validate input |
| 5 | **Route Handler** | Method | Xử lý request |
| 6 | **Service** | Injectable | Business logic |
| 7 | **Interceptors** (after) | Global, Controller, Method | Sau handler |
| 8 | **Exception Filters** | Global, Controller, Method | Khi có exception |

---

## Binding Scope

Mỗi tầng có thể được áp dụng ở nhiều scope khác nhau:

```typescript
// GLOBAL - áp dụng cho toàn bộ app
app.useGlobalGuards(new AuthGuard());
app.useGlobalPipes(new ValidationPipe());
app.useGlobalInterceptors(new LoggingInterceptor());
app.useGlobalFilters(new HttpExceptionFilter());

// CONTROLLER - áp dụng cho tất cả route trong controller
@UseGuards(AuthGuard)
@UseInterceptors(LoggingInterceptor)
@Controller('todos')
export class TodosController { ... }

// METHOD - áp dụng cho 1 route cụ thể
@UseGuards(RolesGuard)
@UsePipes(ValidationPipe)
@Post()
create(@Body() dto: CreateTodoDto) { ... }
```

---

## Tài liệu tham khảo

- [NestJS Official Docs - Request Lifecycle](https://docs.nestjs.com/faq/request-lifecycle)
- [NestJS Middleware](https://docs.nestjs.com/middleware)
- [NestJS Guards](https://docs.nestjs.com/guards)
- [NestJS Interceptors](https://docs.nestjs.com/interceptors)
- [NestJS Pipes](https://docs.nestjs.com/pipes)
- [NestJS Exception Filters](https://docs.nestjs.com/exception-filters)
