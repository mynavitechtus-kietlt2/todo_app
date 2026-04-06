// DTO chỉ để mô tả hình dạng JSON trả về cho Swagger (GET danh sách). Khác với entity Todo (domain).
import { ApiProperty } from '@nestjs/swagger';
import { Todo } from '../entities/todo.entity';

export class TodoListResponseDto {
  // [Swagger] type: [Todo] = mảng Todo trong schema OpenAPI
  @ApiProperty({ type: [Todo] })
  items: Todo[];

  @ApiProperty({ example: 10 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 1 })
  lastPage: number;
}
