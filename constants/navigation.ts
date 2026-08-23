import type { UserRole } from "@/types/auth";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  Bell,
  BookOpen,
  Bot,
  CalendarCheck,
  CalendarDays,
  ClipboardList,
  DoorOpen,
  FolderOpen,
  GraduationCap,
  Handshake,
  Inbox,
  LayoutDashboard,
  MapPin,
  MessagesSquare,
  Network,
  PenLine,
  Presentation,
  Settings,
  Shield,
  Sparkles,
  TriangleAlert,
  Upload,
  User,
  Users,
} from "lucide-react";

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  /** Set when the destination page is not implemented yet. */
  comingSoon?: boolean;
  /** Marks features planned for the later SIH phase (AI, alumni, groups). */
  phase?: "sih";
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const studentNavigation: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/student/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Academics",
    items: [
      { title: "Academics", href: "/student/academics", icon: BookOpen, comingSoon: true },
      { title: "Attendance", href: "/student/attendance", icon: CalendarCheck },
      { title: "Assignments", href: "/student/assignments", icon: ClipboardList },
      { title: "Submissions", href: "/student/submissions", icon: Upload },
      { title: "Materials", href: "/student/materials", icon: FolderOpen },
      { title: "Quizzes", href: "/student/quizzes", icon: PenLine, comingSoon: true },
    ],
  },
  {
    label: "Campus Life",
    items: [
      { title: "Calendar", href: "/student/calendar", icon: CalendarDays },
      { title: "Notices", href: "/student/notices", icon: Bell },
      { title: "Events & Opportunities", href: "/student/events", icon: Sparkles },
      { title: "Campus", href: "/student/campus", icon: MapPin, comingSoon: true },
      { title: "Doubts", href: "/student/doubts", icon: MessagesSquare },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Profile", href: "/student/profile", icon: User, comingSoon: true }],
  },
  {
    label: "Future",
    items: [
      { title: "Groups", href: "/groups", icon: Users, comingSoon: true, phase: "sih" },
      { title: "Alumni Network", href: "/alumni", icon: Network, comingSoon: true, phase: "sih" },
      { title: "AI Academic Assistant", href: "/ai", icon: Bot, comingSoon: true, phase: "sih" },
    ],
  },
];

const facultyNavigation: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/faculty/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Teaching",
    items: [
      { title: "Classes", href: "/faculty/classes", icon: Presentation },
      { title: "Attendance", href: "/faculty/attendance", icon: CalendarCheck },
      { title: "Assignments", href: "/faculty/assignments", icon: ClipboardList },
      { title: "Submissions", href: "/faculty/submissions", icon: Inbox },
      { title: "Materials", href: "/faculty/materials", icon: FolderOpen },
      { title: "Students", href: "/faculty/students", icon: Users },
      { title: "Cover requests", href: "/faculty/cover-requests", icon: Handshake },
      { title: "Quizzes", href: "/faculty/quizzes", icon: PenLine, comingSoon: true },
    ],
  },
  {
    label: "Campus",
    items: [
      { title: "Notices", href: "/faculty/notices", icon: Bell, comingSoon: true },
      { title: "Events", href: "/faculty/events", icon: Sparkles, comingSoon: true },
      { title: "Doubts", href: "/faculty/doubts", icon: MessagesSquare },
    ],
  },
  {
    label: "Account",
    items: [{ title: "Profile", href: "/faculty/profile", icon: User, comingSoon: true }],
  },
];

const adminNavigation: NavGroup[] = [
  {
    label: "Overview",
    items: [{ title: "Dashboard", href: "/admin/dashboard", icon: LayoutDashboard }],
  },
  {
    label: "Academic",
    items: [
      { title: "Students", href: "/admin/students", icon: GraduationCap },
      { title: "Faculty", href: "/admin/faculty", icon: Users },
      { title: "Departments", href: "/admin/departments", icon: Network },
      { title: "Classes", href: "/admin/classes", icon: Presentation },
      { title: "Subjects", href: "/admin/subjects", icon: BookOpen },
    ],
  },
  {
    label: "Operations",
    items: [
      { title: "Schedule", href: "/admin/schedule", icon: CalendarCheck },
      { title: "Rooms", href: "/admin/rooms", icon: DoorOpen },
      { title: "Notices", href: "/admin/notices", icon: Bell },
      { title: "Events", href: "/admin/events", icon: Sparkles },
      { title: "Approvals", href: "/admin/approvals", icon: Inbox },
    ],
  },
  {
    label: "Analytics",
    items: [
      { title: "Analytics", href: "/admin/analytics", icon: BarChart3 },
      { title: "Attendance Risk", href: "/admin/risk", icon: TriangleAlert },
    ],
  },
  {
    label: "System",
    items: [{ title: "Settings", href: "/admin/settings", icon: Settings, comingSoon: true }],
  },
];

const navigationByRole: Record<UserRole, NavGroup[]> = {
  student: studentNavigation,
  faculty: facultyNavigation,
  admin: adminNavigation,
};

export function getNavigationForRole(role: UserRole): NavGroup[] {
  return navigationByRole[role];
}

export const ROLE_AVATAR_ICON: Record<UserRole, LucideIcon> = {
  student: GraduationCap,
  faculty: Presentation,
  admin: Shield,
};
