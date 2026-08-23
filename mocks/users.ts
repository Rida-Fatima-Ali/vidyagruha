import type { AuthUser, UserRole } from "@/types/auth";

export const MOCK_USERS: Record<UserRole, AuthUser> = {
  student: {
    id: "stu-001",
    name: "Lakshya Choithani",
    displayName: "Lakshya Choithani",
    role: "student",
    username: "lakshyachoithani@somaiya.edu",
    email: "lakshyachoithani@somaiya.edu",
    programme: "Computer Engineering",
    year: "Second Year",
  },
  faculty: {
    id: "fac-001",
    name: "Varsha Kinge",
    displayName: "Varsha Kinge",
    role: "faculty",
    username: "varshakinge@somaiya.edu",
    email: "varshakinge@somaiya.edu",
    department: "Computer Engineering",
  },
  admin: {
    id: "adm-001",
    name: "System Administrator",
    displayName: "System Administrator",
    role: "admin",
    username: "admin01",
    email: "admin01@vidyagruha.edu",
    roleName: "System Administrator",
  },
};
