// 临时使用静态数据，避免 Prisma 依赖
export const prisma = {
  tool: {
    findMany: async () => [],
    findUnique: async () => null,
  },
  category: {
    findMany: async () => [],
    findUnique: async () => null,
  },
};
