// Cover Request mock data & service

export type CoverStatus = "open" | "claimed" | "confirmed";

export interface CoverRequest {
  id: string;
  requestedBy: string;
  requestedByDept: string;
  subject: string;
  year: string;
  division: string;
  room: string;
  date: string; // "Today" | "Tomorrow" | ISO
  time: string;
  timeEnd: string;
  status: CoverStatus;
  claimedBy?: string;
  createdAt: string;
}

export interface EligibleFaculty {
  id: string;
  name: string;
  dept: string;
  designation: string;
  availableAt: string;
  subjects: string[];
  status: "available" | "in-class" | "busy";
}

export const ELIGIBLE_FACULTY: EligibleFaculty[] = [
  {
    id: "f1",
    name: "Dr. Ayesha Khan",
    dept: "Computer Engineering",
    designation: "Associate Professor",
    availableAt: "11:00 AM",
    subjects: ["Microprocessor", "Computer Architecture", "Embedded Systems"],
    status: "available",
  },
  {
    id: "f2",
    name: "Prof. Rajan Deshmukh",
    dept: "Computer Engineering",
    designation: "Assistant Professor",
    availableAt: "11:00 AM",
    subjects: ["Data Structures", "Algorithms", "Computer Networks"],
    status: "available",
  },
  {
    id: "f3",
    name: "Dr. Sunita Patil",
    dept: "Computer Engineering",
    designation: "Professor",
    availableAt: "12:00 PM",
    subjects: ["Microprocessor", "Digital Electronics", "VLSI"],
    status: "in-class",
  },
  {
    id: "f4",
    name: "Prof. Nikhil Sharma",
    dept: "Computer Engineering",
    designation: "Assistant Professor",
    availableAt: "11:00 AM",
    subjects: ["Web Development", "Database Management", "Software Engineering"],
    status: "busy",
  },
];

const initialRequests: CoverRequest[] = [
  {
    id: "cr1",
    requestedBy: "Prof. Vikram Joshi",
    requestedByDept: "Computer Engineering",
    subject: "Microprocessor",
    year: "Second Year",
    division: "Division B",
    room: "Lab 204",
    date: "Today",
    time: "11:00 AM",
    timeEnd: "12:00 PM",
    status: "open",
    createdAt: "2026-08-23T07:30:00Z",
  },
  {
    id: "cr2",
    requestedBy: "Dr. Priya Nair",
    requestedByDept: "Computer Engineering",
    subject: "Computer Networks",
    year: "Third Year",
    division: "Division A",
    room: "Room 301",
    date: "Tomorrow",
    time: "09:00 AM",
    timeEnd: "10:00 AM",
    status: "confirmed",
    claimedBy: "Prof. Rajan Deshmukh",
    createdAt: "2026-08-23T06:00:00Z",
  },
];

// In-memory store
let requests: CoverRequest[] = [...initialRequests];

export function getCoverRequests(): CoverRequest[] {
  return requests;
}

export function addCoverRequest(data: Omit<CoverRequest, "id" | "status" | "createdAt">): CoverRequest {
  const req: CoverRequest = {
    ...data,
    id: `cr${Date.now()}`,
    status: "open",
    createdAt: new Date().toISOString(),
  };
  requests = [req, ...requests];
  return req;
}

export function acceptCoverRequest(id: string, facultyName: string): CoverRequest | null {
  requests = requests.map((r) =>
    r.id === id ? { ...r, status: "confirmed", claimedBy: facultyName } : r
  );
  return requests.find((r) => r.id === id) ?? null;
}
