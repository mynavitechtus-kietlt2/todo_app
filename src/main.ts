import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
// --- Swagger / OpenAPI: toàn bộ decorator & class dưới đây đến từ package `@nestjs/swagger`
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.setGlobalPrefix('api');
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  // [Swagger] DocumentBuilder: dựng metadata tổng thể của file OpenAPI (info, securitySchemes, tags).
  const swaggerConfig = new DocumentBuilder()
    .setTitle('todo_app API')
    .setDescription(
      'REST API Todo (NestJS). Header **x-user-id** (số ≥ 1) để tách dữ liệu demo — dùng nút **Authorize** trên Swagger UI.',
    )
    .setVersion('1.0')
    // [Swagger] addApiKey: đăng ký security scheme kiểu API Key (header). Tham số thứ 2 là tên scheme, dùng lại trong @ApiSecurity('x-user-id') ở controller.
    .addApiKey(
      {
        type: 'apiKey',
        name: 'x-user-id',
        in: 'header',
        description: 'User ID (mặc định server dùng 1 nếu không gửi)',
      },
      'x-user-id',
    )
    // [Swagger] addTag: khai báo tag (nhóm) — thường khớp @ApiTags() trên controller.
    .addTag('app', 'Hello')
    .addTag('todos', 'REST /todos')
    .build();

  // [Swagger] createDocument: quét toàn bộ controller, đọc decorator @Api*, sinh object OpenAPI 3.
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  // [Swagger] setup: mount Swagger UI tại đường dẫn tương đối; useGlobalPrefix: true để khớp app.setGlobalPrefix('api') → UI tại /api/docs
  SwaggerModule.setup('docs', app, document, {
    useGlobalPrefix: true,
  });

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
