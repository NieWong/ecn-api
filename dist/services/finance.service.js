"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.financeService = void 0;
const errors_1 = require("../utils/errors");
const finance_repo_1 = require("../repositories/finance.repo");
const user_repo_1 = require("../repositories/user.repo");
const canViewFinance = (actor) => {
    if (actor.role === "ADMIN")
        return true;
    if (actor.isAccountant)
        return true;
    return actor.membershipLevel !== "REGULAR_USER";
};
const canManageFinance = (actor) => {
    return actor.role === "ADMIN" || actor.isAccountant;
};
const canManageEntry = (actor, entry) => {
    return canManageFinance(actor) || entry.managerId === actor.id;
};
const assertManagerEligibility = async (managerId) => {
    if (!managerId)
        return;
    const manager = await user_repo_1.userRepo.findById(managerId);
    if (!manager) {
        throw new errors_1.AppError("Assigned manager not found", 404);
    }
    if (!manager.isActive) {
        throw new errors_1.AppError("Assigned manager must be active", 400);
    }
    if (manager.membershipLevel === "REGULAR_USER") {
        throw new errors_1.AppError("Assigned manager must be a member", 400);
    }
};
const normalizeDate = (value) => {
    if (!value)
        return undefined;
    if (value instanceof Date)
        return value;
    return new Date(value);
};
const mergeScopedWhere = (base, actorId) => {
    const actorScope = [{ managerId: actorId }, { createdById: actorId }];
    const andFromBase = base && Array.isArray(base.AND)
        ? (base.AND ?? [])
        : base
            ? [base]
            : [];
    return {
        AND: [...andFromBase, { OR: actorScope }],
    };
};
exports.financeService = {
    list: (actor, args) => {
        if (!canViewFinance(actor)) {
            throw new errors_1.AppError("Finance section is only for members", 403);
        }
        if (!canManageFinance(actor)) {
            return finance_repo_1.financeRepo.list({
                ...args,
                where: mergeScopedWhere(args?.where, actor.id),
            });
        }
        return finance_repo_1.financeRepo.list(args);
    },
    getById: async (id) => {
        const entry = await finance_repo_1.financeRepo.findById(id);
        if (!entry) {
            throw new errors_1.AppError("Finance entry not found", 404);
        }
        return entry;
    },
    create: async (data, actor) => {
        if (!canManageFinance(actor)) {
            throw new errors_1.AppError("Only finance editors can create finance entries", 403);
        }
        await assertManagerEligibility(data.managerId);
        return finance_repo_1.financeRepo.create({
            title: data.title,
            type: data.type,
            amount: data.amount,
            source: data.source ?? null,
            purpose: data.purpose ?? null,
            usedBy: data.usedBy ?? null,
            status: data.status ?? "PENDING",
            transactionDate: normalizeDate(data.transactionDate),
            notes: data.notes ?? null,
            managerId: data.managerId ?? null,
            createdById: actor.id,
        });
    },
    update: async (id, data, actor) => {
        const entry = await finance_repo_1.financeRepo.findById(id);
        if (!entry) {
            throw new errors_1.AppError("Finance entry not found", 404);
        }
        if (!canManageEntry(actor, entry)) {
            throw new errors_1.AppError("Forbidden", 403);
        }
        if (actor.role !== "ADMIN" && data.managerId !== undefined) {
            throw new errors_1.AppError("Only admin can change manager", 403);
        }
        if (actor.role === "ADMIN" && data.managerId !== undefined) {
            await assertManagerEligibility(data.managerId);
        }
        return finance_repo_1.financeRepo.update(id, {
            title: data.title,
            type: data.type,
            amount: data.amount,
            source: data.source,
            purpose: data.purpose,
            usedBy: data.usedBy,
            status: data.status,
            transactionDate: normalizeDate(data.transactionDate),
            notes: data.notes,
            managerId: data.managerId,
        });
    },
    remove: async (id, actor) => {
        const entry = await finance_repo_1.financeRepo.findById(id);
        if (!entry) {
            throw new errors_1.AppError("Finance entry not found", 404);
        }
        if (!canManageEntry(actor, entry)) {
            throw new errors_1.AppError("Forbidden", 403);
        }
        await finance_repo_1.financeRepo.delete(id);
        return true;
    },
    summary: (actor, where) => {
        if (!canViewFinance(actor)) {
            throw new errors_1.AppError("Finance section is only for members", 403);
        }
        if (!canManageFinance(actor)) {
            return finance_repo_1.financeRepo.summary(mergeScopedWhere(where, actor.id));
        }
        return finance_repo_1.financeRepo.summary(where);
    },
};
