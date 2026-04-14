import type { AuthUser } from "../types/auth";
import { AppError } from "../utils/errors";
import { financeRepo } from "../repositories/finance.repo";
import { userRepo } from "../repositories/user.repo";
import type {
  CreateFinanceEntryInput,
  UpdateFinanceEntryInput,
} from "../validation/schemas/finance.schema";

const canViewFinance = (actor: AuthUser) => {
  if (actor.role === "ADMIN") return true;
  if (actor.isAccountant) return true;
  return actor.membershipLevel !== "REGULAR_USER";
};

const canManageFinance = (actor: AuthUser) => {
  return actor.role === "ADMIN" || actor.isAccountant;
};

const canManageEntry = (actor: AuthUser, entry: { managerId: string | null }) => {
  return canManageFinance(actor) || entry.managerId === actor.id;
};

const assertManagerEligibility = async (managerId: string | null | undefined) => {
  if (!managerId) return;
  const manager = await userRepo.findById(managerId);
  if (!manager) {
    throw new AppError("Assigned manager not found", 404);
  }
  if (!manager.isActive) {
    throw new AppError("Assigned manager must be active", 400);
  }
  if (manager.membershipLevel === "REGULAR_USER") {
    throw new AppError("Assigned manager must be a member", 400);
  }
};

const normalizeDate = (value?: Date | string) => {
  if (!value) return undefined;
  if (value instanceof Date) return value;
  return new Date(value);
};

export const financeService = {
  list: (
    actor: AuthUser,
    args?: {
      where?: Record<string, unknown>;
      orderBy?: Record<string, unknown>;
      skip?: number;
      take?: number;
    }
  ) => {
    if (!canViewFinance(actor)) {
      throw new AppError("Finance section is only for members", 403);
    }

    return financeRepo.list(args);
  },

  getById: async (id: string) => {
    const entry = await financeRepo.findById(id);
    if (!entry) {
      throw new AppError("Finance entry not found", 404);
    }
    return entry;
  },

  create: async (
    data: CreateFinanceEntryInput,
    actor: AuthUser
  ) => {
    if (!canManageFinance(actor)) {
      throw new AppError("Only finance editors can create finance entries", 403);
    }

    await assertManagerEligibility(data.managerId);

    return financeRepo.create({
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

  update: async (
    id: string,
    data: UpdateFinanceEntryInput,
    actor: AuthUser
  ) => {
    const entry = await financeRepo.findById(id);
    if (!entry) {
      throw new AppError("Finance entry not found", 404);
    }

    if (!canManageEntry(actor, entry)) {
      throw new AppError("Forbidden", 403);
    }

    if (actor.role !== "ADMIN" && data.managerId !== undefined) {
      throw new AppError("Only admin can change manager", 403);
    }

    if (actor.role === "ADMIN" && data.managerId !== undefined) {
      await assertManagerEligibility(data.managerId);
    }

    return financeRepo.update(id, {
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

  remove: async (id: string, actor: AuthUser) => {
    const entry = await financeRepo.findById(id);
    if (!entry) {
      throw new AppError("Finance entry not found", 404);
    }

    if (!canManageEntry(actor, entry)) {
      throw new AppError("Forbidden", 403);
    }

    await financeRepo.delete(id);
    return true;
  },

  summary: (actor: AuthUser, where?: Record<string, unknown>) => {
    if (!canViewFinance(actor)) {
      throw new AppError("Finance section is only for members", 403);
    }

    return financeRepo.summary(where);
  },
};
