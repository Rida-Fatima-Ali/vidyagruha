export type UserRole = "student" | "faculty" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  programme?: string;
  year?: string;
  department?: string;
  roleName?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (role: UserRole) => void;
  logout: () => void;
}
