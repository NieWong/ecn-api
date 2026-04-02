import { z } from "zod";

export const financeEntryTypeSchema = z.enum(["BUDGET", "INCOME", "EXPENSE"]);
export const financeStatusSchema = z.enum(["PENDING", "APPROVED", "PAID", "CANCELLED"]);

export const createFinanceEntrySchema = z.object({
  title: z.string().trim().min(1),
  type: financeEntryTypeSchema,
  amount: z.coerce.number().nonnegative(),
  source: z.string().trim().optional().nullable(),
  purpose: z.string().trim().optional().nullable(),
  usedBy: z.string().trim().optional().nullable(),
  status: financeStatusSchema.optional(),
  transactionDate: z.coerce.date(),
  notes: z.string().trim().optional().nullable(),
  managerId: z.string().optional().nullable(),
});

export const updateFinanceEntrySchema = z.object({
  title: z.string().trim().min(1).optional(),
  type: financeEntryTypeSchema.optional(),
  amount: z.coerce.number().nonnegative().optional(),
  source: z.string().trim().optional().nullable(),
  purpose: z.string().trim().optional().nullable(),
  usedBy: z.string().trim().optional().nullable(),
  status: financeStatusSchema.optional(),
  transactionDate: z.coerce.date().optional(),
  notes: z.string().trim().optional().nullable(),
  managerId: z.string().optional().nullable(),
});

export const listFinanceQuerySchema = z.object({
  type: financeEntryTypeSchema.optional(),
  status: financeStatusSchema.optional(),
  managerId: z.string().optional(),
  from: z.coerce.date().optional(),
  to: z.coerce.date().optional(),
  skip: z.coerce.number().int().nonnegative().optional(),
  take: z.coerce.number().int().positive().max(100).optional(),
});

export type FinanceEntryType = z.infer<typeof financeEntryTypeSchema>;
export type FinanceStatus = z.infer<typeof financeStatusSchema>;
export type CreateFinanceEntryInput = z.infer<typeof createFinanceEntrySchema>;
export type UpdateFinanceEntryInput = z.infer<typeof updateFinanceEntrySchema>;
export type ListFinanceQueryInput = z.infer<typeof listFinanceQuerySchema>;
