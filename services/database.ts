/**
 * VidyaGruha Centralized In-Memory & Persistent Database
 * Contains exactly 63 student records, 4 faculty records, 1 admin record, and registration requests store.
 */

export interface DatabaseUser {
  id: string;
  displayName: string;
  username: string; // login identifier e.g. lakshyachoithani@somaiya.edu or admin01
  email: string;
  role: "student" | "faculty" | "admin";
  status: "active" | "inactive" | "pending";
  passwordHash?: string;
  department?: string;
  programme?: string;
  year?: string;
  rollNo?: string;
  group?: string;
  createdAt: string;
}

export interface RegistrationRequest {
  id: string;
  displayName: string;
  email: string;
  role: "student" | "faculty";
  passwordHash: string;
  status: "pending" | "approved" | "rejected";
  createdAt: string;
  reviewedBy?: string;
  reviewedAt?: string;
}

// ── 1. Seed 63 Student Records ───────────────────────────────────────────────
const NAMED_STUDENTS = [
  { rollNo: "01", name: "Lakshya Choithani", username: "lakshyachoithani@somaiya.edu", active: true },
  { rollNo: "02", name: "Gargi Thotam", username: "gargithotam@somaiya.edu", active: true },
  { rollNo: "03", name: "Rida Fatima", username: "ridafatima@somaiya.edu", active: true },
  { rollNo: "04", name: "Priyansh Bhan", username: "priyanshbhan@somaiya.edu", active: true },
  { rollNo: "05", name: "Tejas Nagare", username: "tejasnagare@somaiya.edu", active: true },
  { rollNo: "06", name: "Dheer Chheda", username: "dheerchheda@somaiya.edu", active: false },
];

const SEED_STUDENTS: DatabaseUser[] = [];

// Add the 6 specific named students
NAMED_STUDENTS.forEach((st, idx) => {
  SEED_STUDENTS.push({
    id: `stu-${String(idx + 1).padStart(3, "0")}`,
    displayName: st.name,
    username: st.username,
    email: st.username,
    role: "student",
    status: st.active ? "active" : "inactive",
    passwordHash: "kjsp@123",
    programme: "Computer Engineering",
    year: "Second Year",
    rollNo: st.rollNo,
    group: idx < 32 ? "CMPN-A · Sem 3" : "CMPN-B · Sem 3",
    createdAt: "2026-07-01T00:00:00.000Z",
  });
});

// Add remaining dummy students up to exactly 63 records (Student 007 through Student 063)
for (let i = 7; i <= 63; i++) {
  const roll = String(i).padStart(2, "0");
  const idStr = String(i).padStart(3, "0");
  SEED_STUDENTS.push({
    id: `stu-${idStr}`,
    displayName: `Student ${idStr}`,
    username: `student${idStr}@somaiya.edu`,
    email: `student${idStr}@somaiya.edu`,
    role: "student",
    status: "inactive",
    passwordHash: "kjsp@123",
    programme: "Computer Engineering",
    year: "Second Year",
    rollNo: roll,
    group: i <= 32 ? "CMPN-A · Sem 3" : "CMPN-B · Sem 3",
    createdAt: "2026-07-01T00:00:00.000Z",
  });
}

// ── 2. Seed 4 Faculty Records ────────────────────────────────────────────────
const SEED_FACULTY: DatabaseUser[] = [
  {
    id: "fac-001",
    displayName: "Varsha Kinge",
    username: "varshakinge@somaiya.edu",
    email: "varshakinge@somaiya.edu",
    role: "faculty",
    status: "active",
    passwordHash: "kjsp@123",
    department: "Computer Engineering",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "fac-002",
    displayName: "RNP",
    username: "rnp@somaiya.edu",
    email: "rnp@somaiya.edu",
    role: "faculty",
    status: "active",
    passwordHash: "kjsp@123",
    department: "Computer Engineering",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "fac-003",
    displayName: "NRP",
    username: "nrp@somaiya.edu",
    email: "nrp@somaiya.edu",
    role: "faculty",
    status: "active",
    passwordHash: "kjsp@123",
    department: "Information Technology",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
  {
    id: "fac-004",
    displayName: "Charu",
    username: "charu@somaiya.edu",
    email: "charu@somaiya.edu",
    role: "faculty",
    status: "active",
    passwordHash: "kjsp@123",
    department: "Computer Engineering",
    createdAt: "2026-06-01T00:00:00.000Z",
  },
];

// ── 3. Seed 1 Admin Record ──────────────────────────────────────────────────
const SEED_ADMIN: DatabaseUser[] = [
  {
    id: "adm-001",
    displayName: "System Administrator",
    username: "admin01",
    email: "admin01@vidyagruha.edu",
    role: "admin",
    status: "active",
    passwordHash: "kjsp@123",
    createdAt: "2026-01-01T00:00:00.000Z",
  },
];

// ── 4. Seed Initial Registration Requests ────────────────────────────────────
const SEED_REQUESTS: RegistrationRequest[] = [
  {
    id: "req-001",
    displayName: "Aarav Kulkarni",
    email: "aaravkulkarni@somaiya.edu",
    role: "student",
    passwordHash: "kjsp@123",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45m ago
  },
  {
    id: "req-002",
    displayName: "Dr. Sunita Deshmukh",
    email: "sunitadeshmukh@somaiya.edu",
    role: "faculty",
    passwordHash: "kjsp@123",
    status: "pending",
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(), // 3h ago
  },
];

// In-memory Database Store
class CentralDatabase {
  private users: Map<string, DatabaseUser> = new Map();
  private registrationRequests: Map<string, RegistrationRequest> = new Map();

  constructor() {
    this.init();
  }

  private init() {
    [...SEED_STUDENTS, ...SEED_FACULTY, ...SEED_ADMIN].forEach((u) => {
      this.users.set(u.id, { ...u });
    });
    SEED_REQUESTS.forEach((r) => {
      this.registrationRequests.set(r.id, { ...r });
    });
  }

  // Get all users
  public getAllUsers(): DatabaseUser[] {
    return Array.from(this.users.values());
  }

  // Get users by role
  public getUsersByRole(role: "student" | "faculty" | "admin"): DatabaseUser[] {
    return Array.from(this.users.values()).filter((u) => u.role === role);
  }

  // Find user by login identifier (username/email)
  public findUserByLogin(identifier: string): DatabaseUser | undefined {
    const clean = identifier.trim().toLowerCase();
    return Array.from(this.users.values()).find(
      (u) =>
        u.username.toLowerCase() === clean ||
        u.email.toLowerCase() === clean
    );
  }

  // Validate credentials and return user if correct and active
  public authenticate(
    identifier: string,
    passwordAttempt: string,
    expectedRole?: "student" | "faculty" | "admin"
  ): { success: boolean; user?: DatabaseUser; error?: string } {
    const user = this.findUserByLogin(identifier);
    if (!user) {
      return { success: false, error: "Invalid username or password." };
    }

    if (expectedRole && user.role !== expectedRole) {
      return { success: false, error: "Invalid account type for this user." };
    }

    if (user.status !== "active") {
      return {
        success: false,
        error:
          user.status === "pending"
            ? "Your account is pending administrator approval."
            : "Your account is inactive. Please contact the administrator.",
      };
    }

    if (user.passwordHash !== passwordAttempt) {
      return { success: false, error: "Invalid username or password." };
    }

    return { success: true, user };
  }

  // ── Registration Requests API ─────────────────────────────────────────────
  public getRegistrationRequests(): RegistrationRequest[] {
    return Array.from(this.registrationRequests.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getPendingRequestsCount(): number {
    return Array.from(this.registrationRequests.values()).filter(
      (r) => r.status === "pending"
    ).length;
  }

  public createRegistrationRequest(data: {
    displayName: string;
    email: string;
    role: "student" | "faculty";
    password: string;
  }): { success: boolean; request?: RegistrationRequest; error?: string } {
    const emailNorm = data.email.trim().toLowerCase();

    // Enforce @somaiya.edu domain validation
    if (!emailNorm.endsWith("@somaiya.edu")) {
      return {
        success: false,
        error: "Email must be a valid institutional address ending with @somaiya.edu",
      };
    }

    // Check if user or pending request already exists
    const existingUser = this.findUserByLogin(emailNorm);
    if (existingUser) {
      return {
        success: false,
        error: "An account with this email address already exists.",
      };
    }

    const existingReq = Array.from(this.registrationRequests.values()).find(
      (r) => r.email.toLowerCase() === emailNorm && r.status === "pending"
    );
    if (existingReq) {
      return {
        success: false,
        error: "A registration request for this email is already pending approval.",
      };
    }

    const newId = `req-${String(this.registrationRequests.size + 1).padStart(3, "0")}`;
    const newRequest: RegistrationRequest = {
      id: newId,
      displayName: data.displayName.trim(),
      email: emailNorm,
      role: data.role,
      passwordHash: data.password,
      status: "pending",
      createdAt: new Date().toISOString(),
    };

    this.registrationRequests.set(newId, newRequest);
    return { success: true, request: newRequest };
  }

  public approveRequest(
    requestId: string,
    adminName = "System Administrator"
  ): { success: boolean; user?: DatabaseUser; error?: string } {
    const req = this.registrationRequests.get(requestId);
    if (!req) return { success: false, error: "Request not found." };

    req.status = "approved";
    req.reviewedBy = adminName;
    req.reviewedAt = new Date().toISOString();

    // Create active user in database
    const newUserId = `${req.role.slice(0, 3)}-${String(this.users.size + 1).padStart(3, "0")}`;
    const newUser: DatabaseUser = {
      id: newUserId,
      displayName: req.displayName,
      username: req.email,
      email: req.email,
      role: req.role,
      status: "active",
      passwordHash: req.passwordHash,
      department: req.role === "faculty" ? "Computer Engineering" : undefined,
      programme: req.role === "student" ? "Computer Engineering" : undefined,
      year: req.role === "student" ? "Second Year" : undefined,
      createdAt: new Date().toISOString(),
    };

    this.users.set(newUserId, newUser);
    return { success: true, user: newUser };
  }

  public rejectRequest(
    requestId: string,
    adminName = "System Administrator"
  ): { success: boolean; error?: string } {
    const req = this.registrationRequests.get(requestId);
    if (!req) return { success: false, error: "Request not found." };

    req.status = "rejected";
    req.reviewedBy = adminName;
    req.reviewedAt = new Date().toISOString();
    return { success: true };
  }
}

// Global Singleton for database
export const db = new CentralDatabase();
