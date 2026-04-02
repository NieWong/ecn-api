"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteFinanceEntry = exports.updateFinanceEntry = exports.createFinanceEntry = exports.getFinanceSummary = exports.listFinanceEntries = void 0;
const auth_1 = require("../middleware/auth");
const middleware_1 = require("../validation/middleware");
const finance_schema_1 = require("../validation/schemas/finance.schema");
const finance_service_1 = require("../services/finance.service");
const buildFinanceWhere = (query) => {
    const filters = [];
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
exports.listFinanceEntries = [
    auth_1.requireAuth,
    (0, middleware_1.validateQuery)(finance_schema_1.listFinanceQuerySchema),
    async (req, res, next) => {
        try {
            const query = req.query;
            const entries = await finance_service_1.financeService.list(req.user, {
                where: buildFinanceWhere(query),
                orderBy: { transactionDate: "desc" },
                skip: query.skip,
                take: query.take,
            });
            res.status(200).json(entries);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.getFinanceSummary = [
    auth_1.requireAuth,
    (0, middleware_1.validateQuery)(finance_schema_1.listFinanceQuerySchema),
    async (req, res, next) => {
        try {
            const query = req.query;
            const summary = await finance_service_1.financeService.summary(req.user, buildFinanceWhere(query));
            res.status(200).json({
                ...summary,
                balance: summary.totalIncome - summary.totalExpense,
            });
        }
        catch (error) {
            next(error);
        }
    },
];
exports.createFinanceEntry = [
    auth_1.requireAuth,
    (0, middleware_1.validateBody)(finance_schema_1.createFinanceEntrySchema),
    async (req, res, next) => {
        try {
            const payload = req.body;
            const created = await finance_service_1.financeService.create({
                ...payload,
                transactionDate: payload.transactionDate,
            }, req.user);
            res.status(201).json(created);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.updateFinanceEntry = [
    auth_1.requireAuth,
    (0, middleware_1.validateBody)(finance_schema_1.updateFinanceEntrySchema),
    async (req, res, next) => {
        try {
            const payload = req.body;
            const updated = await finance_service_1.financeService.update(String(req.params.id), {
                ...payload,
                transactionDate: payload.transactionDate,
            }, req.user);
            res.status(200).json(updated);
        }
        catch (error) {
            next(error);
        }
    },
];
exports.deleteFinanceEntry = [
    auth_1.requireAuth,
    async (req, res, next) => {
        try {
            await finance_service_1.financeService.remove(String(req.params.id), req.user);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    },
];
