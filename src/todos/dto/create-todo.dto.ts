import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class CreateTodoDto {
  // [Swagger] @ApiProperty — mô tả 1 field trong Request Body / Schema (OpenAPI).
  @ApiProperty({ example: 'Học NestJS', maxLength: 200 })
  @Transform(trimString)
  @IsString()
  @IsNotEmpty()
  @MaxLength(200)
  title: string;
}
