import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreateTodoDto } from './dto/create-todo.dto';
import { FilterTodoDto } from './dto/filter-todo.dto';
import { UpdateTodoDto } from './dto/update-todo.dto';
import { Todo } from './entities/todo.entity';
import { TodosRepository } from './todos.repository';

@Injectable()
export class TodosService {
  constructor(private readonly todosRepository: TodosRepository) {}

  create(dto: CreateTodoDto, userId: number): Todo {
    return this.todosRepository.create({
      title: dto.title,
      userId,
    });
  }

  findAll(
    userId: number,
    query: FilterTodoDto,
  ): {
    items: Todo[];
    total: number;
    page: number;
    lastPage: number;
  } {
    const page = query.page ?? 1;
    const limit = query.limit ?? 10;
    const { items, total } = this.todosRepository.findByUser(userId, {
      page,
      limit,
      completed: query.completed,
    });
    const lastPage = Math.max(1, Math.ceil(total / limit));
    return { items, total, page, lastPage };
  }

  findOne(id: number, userId: number): Todo {
    const todo = this.todosRepository.findOneByUser(id, userId);
    if (!todo) {
      throw new NotFoundException(`Todo #${id} not found`);
    }
    return todo;
  }

  update(id: number, userId: number, dto: UpdateTodoDto): Todo {
    const todo = this.findOne(id, userId);
    if (dto.completed === true && todo.completed) {
      throw new BadRequestException('Todo is already completed');
    }
    const updated = this.todosRepository.update(id, userId, {
      title: dto.title,
      completed: dto.completed,
    });
    if (!updated) {
      throw new NotFoundException(`Todo #${id} not found`);
    }
    return updated;
  }

  remove(id: number, userId: number): void {
    this.findOne(id, userId);
    this.todosRepository.delete(id, userId);
  }
}
