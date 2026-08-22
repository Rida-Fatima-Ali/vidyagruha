import type { AuthUser, UserRole } from "@/types/auth";

export const MOCK_USERS: Record<UserRole, AuthUser> = {
  student: {
    id: "stu-001",
    name: "Lakshya Choithani",
    role: "student",
    email: "lakshya.choithani@somaiya.edu",
    programme: "Computer Engineering",
    year: "Second Year",
  },
  faculty: {
    id: "fac-001",
    name: "Varsha Kinge",
    role: "faculty",
    email: "varsha.kinge@somaiya.edu",
    department: "Computer Engineering",
  },
  admin: {
    id: "adm-001",
    name: "Admin Portal",
    role: "admin",
    email: "admin@somaiya.edu",
    roleName: "System Administrator",
  },
};
