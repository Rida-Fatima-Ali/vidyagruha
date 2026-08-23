export type UserRole = "student" | "faculty" | "admin";

export interface AuthUser {
  id: string;
  name: string;
  displayName: string;
  role: UserRole;
  email: string;
  username: string;
  programme?: string;
  year?: string;
  department?: string;
  roleName?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  ready: boolean;
  login: (roleOrIdentifier: UserRole | string, password?: string, role?: UserRole) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}
