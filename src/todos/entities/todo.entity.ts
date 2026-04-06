/**
 * NOTE — Entity vs DTO:
 * - Đây là **mô hình domain / trạng thái đầy đủ** của todo trong app (và gần với bảng DB sau này):
 *   id, userId, timestamps, v.v. Client **không** gửi hết các field này khi tạo/sửa.
 * - **DTO** (`CreateTodoDto`, `UpdateTodoDto`, …) chỉ mô tả **phần được phép qua API** + validate.
 * - Swagger dùng `@ApiProperty` ở đây để vẽ schema **response**; DTO dùng cho **request body / query**.
 */
import { ApiProperty } from '@nestjs/swagger';

export class Todo {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Học NestJS' })
  title: string;

  @ApiProperty({ example: false })
  completed: boolean;

  @ApiProperty({ example: 1 })
  userId: number;

  @ApiProperty({ type: String, format: 'date-time' })
  createdAt: Date;

  @ApiProperty({ type: String, format: 'date-time' })
  updatedAt: Date;
}
