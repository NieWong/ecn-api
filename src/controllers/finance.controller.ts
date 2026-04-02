import type { RequestHandler } from "express";
import { requireAuth } from "../middleware/auth";
import { validateBody, validateQuery } from "../validation/middleware";
import {
  type CreateFinanceEntryInput,
  type ListFinanceQueryInput,
  type UpdateFinanceEntryInput,
  createFinanceEntrySchema,
  listFinanceQuerySchema,
  updateFinanceEntrySchema,
} from "../validation/schemas/finance.schema";
import { financeService } from "../services/finance.service";

const buildFinanceWhere = (query: ListFinanceQueryInput) => {
  const filters: Record<string, unknown>[] = [];

  if (query.type) {
    filters.push({ type: query.type });
  }
  if (query.status) {
    filters.push({ status: query.status });
  }
  if (query.managerId) {
    filters.push({ managerId: query.managerId });
  }
  if (query.from || query.to) {
    filters.push({
      transactionDate: {
        gte: query.from,
        lte: query.to,
      },
    });
  }

  return filters.length ? { AND: filters } : undefined;
};

export const listFinanceEntries: RequestHandler[] = [
  requireAuth,
  validateQuery(listFinanceQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as ListFinanceQueryInput;

      const entries = await financeService.list(req.user!, {
        where: buildFinanceWhere(query),
        orderBy: { transactionDate: "desc" },
        skip: query.skip,
        take: query.take,
      });

      res.status(200).json(entries);
    } catch (error) {
      next(error);
    }
  },
];

export const getFinanceSummary: RequestHandler[] = [
  requireAuth,
  validateQuery(listFinanceQuerySchema),
  async (req, res, next) => {
    try {
      const query = req.query as ListFinanceQueryInput;

      const summary = await financeService.summary(req.user!, buildFinanceWhere(query));

      res.status(200).json({
        ...summary,
        balance: summary.totalBudget + summary.totalIncome - summary.totalExpense,
      });
    } catch (error) {
      next(error);
    }
  },
];

export const createFinanceEntry: RequestHandler[] = [
  requireAuth,
  validateBody(createFinanceEntrySchema),
  async (req, res, next) => {
    try {
      const payload = req.body as CreateFinanceEntryInput;
      const created = await financeService.create(
        {
          ...payload,
          transactionDate: payload.transactionDate,
        },
        req.user!
      );
      res.status(201).json(created);
    } catch (error) {
      next(error);
    }
  },
];

export const updateFinanceEntry: RequestHandler[] = [
  requireAuth,
  validateBody(updateFinanceEntrySchema),
  async (req, res, next) => {
    try {
      const payload = req.body as UpdateFinanceEntryInput;
      const updated = await financeService.update(
        String(req.params.id),
        {
          ...payload,
          transactionDate: payload.transactionDate,
        },
        req.user!
      );
      res.status(200).json(updated);
    } catch (error) {
      next(error);
    }
  },
];

export const deleteFinanceEntry: RequestHandler[] = [
  requireAuth,
  async (req, res, next) => {
    try {
      await financeService.remove(String(req.params.id), req.user!);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },
];
