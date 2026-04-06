import { Controller, Get } from '@nestjs/common';
// --- Swagger / OpenAPI: decorator từ `@nestjs/swagger`
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AppService } from './app.service';

// [Swagger] @ApiTags — gán mọi route trong class này vào nhóm "app" trên UI (cột trái Swagger).
@ApiTags('app')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  // [Swagger] @ApiOperation — summary/description ngắn cho từng operation (method HTTP).
  @ApiOperation({ summary: 'Hello world (kiểm tra app đang chạy)' })
  // [Swagger] @ApiOkResponse — mô tả response 200; có thể dùng `type: Class` hoặc `schema` inline như dưới.
  @ApiOkResponse({
    description: 'Chuỗi chào mặc định',
    schema: { type: 'string', example: 'Hello World!' },
  })
  getHello(): string {
    return this.appService.getHello();
  }
}
