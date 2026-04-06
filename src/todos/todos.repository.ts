import { Injectable } from '@nestjs/common';
import { Todo } from './entities/todo.entity';

export type TodoFindByUserOptions = {
  page: number;
  limit: number;
  completed?: boolean;
};

@Injectable()
export class TodosRepository {
  private readonly todos = new Map<number, Todo>();
  private nextId = 1;

  create(data: { title: string; userId: number }): Todo {
    const id = this.nextId++;
    const now = new Date();
    const todo: Todo = {
      id,
      title: data.title,
      completed: false,
      userId: data.userId,
      createdAt: now,
      updatedAt: now,
    };
    this.todos.set(id, todo);
    return todo;
  }

  findByUser(
    userId: number,
    opts: TodoFindByUserOptions,
  ): { items: Todo[]; total: number } {
    let list = [...this.todos.values()].filter((t) => t.userId === userId);
    if (opts.completed !== undefined) {
      list = list.filter((t) => t.completed === opts.completed);
    }
    list.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const total = list.length;
    const start = (opts.page - 1) * opts.limit;
    const items = list.slice(start, start + opts.limit);
    return { items, total };
  }

  findOneByUser(id: number, userId: number): Todo | undefined {
    const todo = this.todos.get(id);
    if (!todo || todo.userId !== userId) {
      return undefined;
    }
    return todo;
  }

  update(
    id: number,
    userId: number,
    data: Partial<Pick<Todo, 'title' | 'completed'>>,
  ): Todo | undefined {
    const todo = this.findOneByUser(id, userId);
    if (!todo) {
      return undefined;
    }
    if (data.title !== undefined) {
      todo.title = data.title;
    }
    if (data.completed !== undefined) {
      todo.completed = data.completed;
    }
    todo.updatedAt = new Date();
    this.todos.set(id, todo);
    return todo;
  }

  delete(id: number, userId: number): boolean {
    const todo = this.findOneByUser(id, userId);
    if (!todo) {
      return false;
    }
    this.todos.delete(id);
    return true;
  }
}
