"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeRepo = void 0;
const prisma_1 = require("../db/prisma");
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
const financeDelegate = prisma_1.prisma.financeEntry;
exports.financeRepo = {
    list: (args) => {
        return financeDelegate.findMany({
            where: args?.where,
            orderBy: args?.orderBy ?? { transactionDate: "desc" },
            skip: args?.skip,
            take: args?.take,
            include: financeInclude,
        });
    },
    findById: (id) => {
        return financeDelegate.findUnique({
            where: { id },
            include: financeInclude,
        });
    },
    create: (data) => {
        return financeDelegate.create({
            data: data,
            include: financeInclude,
        });
    },
    update: (id, data) => {
        return financeDelegate.update({
            where: { id },
            data: data,
            include: financeInclude,
        });
    },
    delete: (id) => {
        return financeDelegate.delete({ where: { id } });
    },
    summary: async (where) => {
        const [income, expense, budget] = await Promise.all([
            financeDelegate.aggregate({
                where: { ...where, type: "INCOME" },
                _sum: { amount: true },
            }),
            financeDelegate.aggregate({
                where: { ...where, type: "EXPENSE" },
                _sum: { amount: true },
            }),
            financeDelegate.aggregate({
                where: { ...where, type: "BUDGET" },
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
