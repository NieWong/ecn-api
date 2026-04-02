"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.listFinanceQuerySchema = exports.updateFinanceEntrySchema = exports.createFinanceEntrySchema = exports.financeStatusSchema = exports.financeEntryTypeSchema = void 0;
const zod_1 = require("zod");
exports.financeEntryTypeSchema = zod_1.z.enum(["BUDGET", "INCOME", "EXPENSE"]);
exports.financeStatusSchema = zod_1.z.enum(["PENDING", "APPROVED", "PAID", "CANCELLED"]);
exports.createFinanceEntrySchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1),
    type: exports.financeEntryTypeSchema,
    amount: zod_1.z.coerce.number().nonnegative(),
    source: zod_1.z.string().trim().optional().nullable(),
    purpose: zod_1.z.string().trim().optional().nullable(),
    usedBy: zod_1.z.string().trim().optional().nullable(),
    status: exports.financeStatusSchema.optional(),
    transactionDate: zod_1.z.coerce.date(),
    notes: zod_1.z.string().trim().optional().nullable(),
    managerId: zod_1.z.string().optional().nullable(),
});
exports.updateFinanceEntrySchema = zod_1.z.object({
    title: zod_1.z.string().trim().min(1).optional(),
    type: exports.financeEntryTypeSchema.optional(),
    amount: zod_1.z.coerce.number().nonnegative().optional(),
    source: zod_1.z.string().trim().optional().nullable(),
    purpose: zod_1.z.string().trim().optional().nullable(),
    usedBy: zod_1.z.string().trim().optional().nullable(),
    status: exports.financeStatusSchema.optional(),
    transactionDate: zod_1.z.coerce.date().optional(),
    notes: zod_1.z.string().trim().optional().nullable(),
    managerId: zod_1.z.string().optional().nullable(),
});
exports.listFinanceQuerySchema = zod_1.z.object({
    type: exports.financeEntryTypeSchema.optional(),
    status: exports.financeStatusSchema.optional(),
    managerId: zod_1.z.string().optional(),
    from: zod_1.z.coerce.date().optional(),
    to: zod_1.z.coerce.date().optional(),
    skip: zod_1.z.coerce.number().int().nonnegative().optional(),
    take: zod_1.z.coerce.number().int().positive().max(100).optional(),
});
