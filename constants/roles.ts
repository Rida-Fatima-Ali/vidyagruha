import type { UserRole } from "@/types/auth";

export const ROLE_LABEL: Record<UserRole, string> = {
  student: "Student",
  faculty: "Faculty",
  admin: "Administrator",
};

export const ROLE_DASHBOARD_PATH: Record<UserRole, string> = {
  student: "/student/dashboard",
  faculty: "/faculty/dashboard",
  admin: "/admin/dashboard",
};
