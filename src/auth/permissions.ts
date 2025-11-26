// Note: Ideally in a real system, the roles and permissions mapping should be part of shared configuration of a library that can be imported on both backend and frontend.
export const PERMISSIONS = {
  SUBMIT_EXPENSE: "SUBMIT_EXPENSE",
  VIEW_TEAM_EXPENSES: "VIEW_TEAM_EXPENSES",
  APPROVE_EXPENSE: "APPROVE_EXPENSE",
  VIEW_ALL_EXPENSES: "VIEW_ALL_EXPENSES",
  EXPORT_REPORTS: "EXPORT_REPORTS",
  MANAGE_USERS: "MANAGE_USERS",
  MANAGE_CATEGORIES: "MANAGE_CATEGORIES",
  MANAGE_ROLES: "MANAGE_ROLES",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export type Role =
  | "EMPLOYEE"
  | "MANAGER"
  | "FINANCE"
  | "CA"
  | "HR"
  | "ADMIN"
  | "CEO"
  | "CTO"
  | "GUEST";
