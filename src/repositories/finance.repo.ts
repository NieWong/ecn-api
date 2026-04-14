import { prisma } from "../db/prisma";

const financeInclude = {
  createdBy: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
  manager: {
    select: {
      id: true,
      name: true,
      email: true,
    },
  },
};

const financeDelegate = (prisma as any).financeEntry;

const withActiveFinanceOnly = (where?: Record<string, unknown>) => {
  const andFromWhere =
    where && Array.isArray((where as { AND?: unknown }).AND)
      ? (((where as { AND?: unknown }).AND as Record<string, unknown>[]) ?? [])
      : where
      ? [where]
      : [];

  return {
    AND: [...andFromWhere, { status: { not: "CANCELLED" } }],
  };
};

export const financeRepo = {
  list: (args?: {
    where?: Record<string, unknown>;
    orderBy?: Record<string, unknown>;
    skip?: number;
    take?: number;
  }) => {
    return financeDelegate.findMany({
      where: args?.where,
      orderBy: args?.orderBy ?? { transactionDate: "desc" },
      skip: args?.skip,
      take: args?.take,
      include: financeInclude,
    });
  },
  findById: (id: string) => {
    return financeDelegate.findUnique({
      where: { id },
      include: financeInclude,
    });
  },
  create: (data: Record<string, unknown>) => {
    return financeDelegate.create({
      data: data as any,
      include: financeInclude,
    });
  },
  update: (id: string, data: Record<string, unknown>) => {
    return financeDelegate.update({
      where: { id },
      data: data as any,
      include: financeInclude,
    });
  },
  delete: (id: string) => {
    return financeDelegate.delete({ where: { id } });
  },
  summary: async (where?: Record<string, unknown>) => {
    const activeWhere = withActiveFinanceOnly(where);

    const [income, expense, budget] = await Promise.all([
      financeDelegate.aggregate({
        where: { AND: [activeWhere, { type: "INCOME" }] },
        _sum: { amount: true },
      }),
      financeDelegate.aggregate({
        where: { AND: [activeWhere, { type: "EXPENSE" }] },
        _sum: { amount: true },
      }),
      financeDelegate.aggregate({
        where: { AND: [activeWhere, { type: "BUDGET" }] },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalIncome: Number(income._sum.amount ?? 0),
      totalExpense: Number(expense._sum.amount ?? 0),
      totalBudget: Number(budget._sum.amount ?? 0),
    };
  },
};
