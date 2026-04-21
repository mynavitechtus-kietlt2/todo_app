import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const seedTodos = [
  { title: 'Hoc NestJS module', userId: 1, completed: false },
  { title: 'Tich hop Prisma vao service', userId: 1, completed: true },
  { title: 'Viet migration dau tien', userId: 1, completed: false },
  { title: 'Kiem tra API voi Swagger', userId: 2, completed: false },
  { title: 'Viet tai lieu setup cho team', userId: 2, completed: true },
];

const main = async (): Promise<void> => {
  await prisma.todo.deleteMany();
  await prisma.todo.createMany({ data: seedTodos });
};

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error: unknown) => {
    console.error('Seed failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });
