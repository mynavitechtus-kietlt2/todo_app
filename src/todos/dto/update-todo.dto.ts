// [Swagger] @ApiPropertyOptional — field không bắt buộc trên schema (PATCH partial update).
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

const trimString = ({ value }: { value: unknown }): unknown =>
  typeof value === 'string' ? value.trim() : value;

export class UpdateTodoDto {
  @ApiPropertyOptional({ example: 'Tiêu đề mới', maxLength: 200 })
  @IsOptional()
  @Transform(trimString)
  @IsString()
  @MinLength(1)
  @MaxLength(200)
  title?: string;

  @ApiPropertyOptional({ example: true, description: 'true = hoàn thành' })
  @IsOptional()
  @IsBoolean()
  completed?: boolean;
}
