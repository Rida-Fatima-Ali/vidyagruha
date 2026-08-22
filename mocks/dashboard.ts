import type { UserRole } from "@/types/auth";

export interface MockSpotlight {
  eyebrow: string;
  title: string;
  meta: string;
  body: string;
}

export const MOCK_SPOTLIGHT: Record<UserRole, MockSpotlight> = {
  student: {
    eyebrow: "Up next on campus",
    title: "SIH 2026 internal round — registrations open",
    meta: "Aug 18 · 5:00 PM · Innovation Lab",
    body: "Build, demo and pitch your solution. Teams of up to six.",
  },
  faculty: {
    eyebrow: "Faculty spotlight",
    title: "Finalise IA 1 marks before Friday",
    meta: "Deadline · Aug 18 · 5:00 PM",
    body: "Internal assessment marks are due before the departmental review.",
  },
  admin: {
    eyebrow: "Institution pulse",
    title: "New academic year planning",
    meta: "Board review · Aug 20",
    body: "Programme intake and faculty allocations open for review.",
  },
};
