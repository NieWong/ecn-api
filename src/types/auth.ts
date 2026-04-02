import type { MembershipLevel, Role } from "@prisma/client";

export type AuthUser = {
  id: string;
  email: string;
  role: Role;
  membershipLevel: MembershipLevel;
  isAccountant: boolean;
};
