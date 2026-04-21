import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CreateTodoDto } from './dto/create-todo.dto';
import { FilterTodoDto } from './dto/filter-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';

@Injectable()
export class TodosService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreateTodoDto, userId: number): Promise<Todo> {
    return this.prisma.todo.create({
      data: {
        title: dto.title,
        userId,
      },
    });
  }

  async findAll(
    userId: number,
    query: FilterTodoDto,
  ): Promise<{
    items: Todo[];
    total: number;
    page: number;
    lastPage: number;
  }> {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const where: Prisma.TodoWhereInput = { userId };
    if (query.completed !== undefined) {
      where.completed = query.completed;
    }
    const [items, total] = await Promise.all([
      this.prisma.todo.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.todo.count({ where }),
    ]);
    const lastPage = Math.max(1, Math.ceil(total / limit));
    return { items, total, page, lastPage };
  }

  async findOne(id: number, userId: number): Promise<Todo> {
    const todo = await this.prisma.todo.findFirst({
      where: { id, userId },
    });
    if (!todo) {
      throw new NotFoundException(`Todo #${id} not found`);
    }
    return todo;
  }

  async update(id: number, userId: number, dto: UpdateTodoDto): Promise<Todo> {
    const todo = await this.findOne(id, userId);
    if (dto.completed === true && todo.completed) {
      throw new BadRequestException('Todo is already completed');
    }
    return this.prisma.todo.update({
      where: { id },
      data: {
        title: dto.title,
        completed: dto.completed,
      },
    });
  }

  async remove(id: number, userId: number): Promise<void> {
    await this.findOne(id, userId);
    await this.prisma.todo.delete({ where: { id } });
  }
}
