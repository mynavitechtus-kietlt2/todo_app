import {
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  HttpStatus,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
// --- Swagger / OpenAPI: import từ `@nestjs/swagger` (không phải @nestjs/common)
import {
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiSecurity,
  ApiTags,
} from '@nestjs/swagger';
import { CreateTodoDto } from './dto/create-todo.dto';
import { FilterTodoDto } from './dto/filter-todo.dto';
import { TodoListResponseDto } from './dto/todo-list-response.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';
import { TodosService } from './todos.service';

/**
 * RESTful resource: `/todos`
 * - Collection: GET (list + query), POST (create)
 * - Item: GET, PATCH (partial update), DELETE
 * - Hoàn thành: PATCH `:id` + body `{ "completed": true }`
 */
// [Swagger] @ApiTags — nhóm các operation dưới tag "todos" trên UI.
@ApiTags('todos')
// [Swagger] @ApiSecurity — áp dụng scheme đã addApiKey(..., 'x-user-id') trong main.ts; bật nút Authorize.
@ApiSecurity('x-user-id')
@Controller('todos')
export class TodosController {
  constructor(private readonly todosService: TodosService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách todo (phân trang, lọc completed)' })
  // [Swagger] @ApiOkResponse — response 200; type: class để Swagger render schema từ @ApiProperty trong class đó.
  @ApiOkResponse({ type: TodoListResponseDto })
  findAll(
    @Query() query: FilterTodoDto,
    @Headers('x-user-id') userIdHeader?: string,
  ) {
    const userId = this.resolveUserId(userIdHeader);
    return this.todosService.findAll(userId, query);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo todo mới (chỉ title)' })
  // [Swagger] @ApiCreatedResponse — tương đương HTTP 201, thường dùng sau POST tạo resource.
  @ApiCreatedResponse({ type: Todo, description: 'Todo đã tạo' })
  create(
    @Body() dto: CreateTodoDto,
    @Headers('x-user-id') userIdHeader?: string,
  ): Todo {
    const userId = this.resolveUserId(userIdHeader);
    return this.todosService.create(dto, userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết một todo' })
  // [Swagger] @ApiParam — mô tả path parameter :id (tên, kiểu, ví dụ).
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: Todo })
  findOne(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-user-id') userIdHeader?: string,
  ): Todo {
    const userId = this.resolveUserId(userIdHeader);
    return this.todosService.findOne(id, userId);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Cập nhật một phần (title, completed)',
  })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  @ApiOkResponse({ type: Todo })
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateTodoDto,
    @Headers('x-user-id') userIdHeader?: string,
  ): Todo {
    const userId = this.resolveUserId(userIdHeader);
    return this.todosService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Xóa todo' })
  @ApiParam({ name: 'id', type: Number, example: 1 })
  // [Swagger] @ApiNoContentResponse — mô tả 204 No Content (thường cho DELETE thành công).
  @ApiNoContentResponse({ description: 'Đã xóa' })
  remove(
    @Param('id', ParseIntPipe) id: number,
    @Headers('x-user-id') userIdHeader?: string,
  ): void {
    const userId = this.resolveUserId(userIdHeader);
    this.todosService.remove(id, userId);
  }

  private resolveUserId(raw?: string): number {
    const n = parseInt(raw ?? '1', 10);
    if (!Number.isFinite(n) || n < 1) {
      return 1;
    }
    return n;
  }
}
