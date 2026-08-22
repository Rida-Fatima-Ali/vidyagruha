import type { AcademicSubject, WeeklySlot } from "@/types/academic";

/**
 * Base (reference) academic data for the prototype. These subject → faculty
 * relationships are canonical — dynamic mock data (attendance, assignments,
 * notifications, overrides) must reference these same codes and names.
 */
export const ACADEMIC_SUBJECTS: AcademicSubject[] = [
  {
    code: "CMPN302",
    name: "C++",
    facultyName: "Snehal Suryavanshi",
    defaultRoom: "Room 214",
    type: "lecture",
  },
  {
    code: "CMPN303",
    name: "CN (Computer Networks)",
    facultyName: "Rupali Patil",
    defaultRoom: "Room 206",
    type: "lecture",
  },
  {
    code: "CMPN304",
    name: "Microprocessor",
    facultyName: "Charulata Ingle",
    defaultRoom: "Room 201",
    type: "lecture",
  },
  {
    code: "CMPN305",
    name: "CL (Constitutional Learning)",
    facultyName: "Madhuri",
    defaultRoom: "Room 208",
    type: "lecture",
  },
  {
    code: "CMPN306",
    name: "C++ Lab",
    facultyName: "Snehal Suryavanshi",
    defaultRoom: "Lab 2 · Block B",
    type: "lab",
  },
  {
    code: "CMPN307",
    name: "LAN (Linux Administrator)",
    facultyName: "Niti Patel",
    defaultRoom: "Room 210",
    type: "lecture",
  },
  {
    code: "CMPN308",
    name: "LAN Lab",
    facultyName: "Niti Patel",
    defaultRoom: "Lab 2 · Block C",
    type: "lab",
  },
  {
    code: "CMPN309",
    name: "Python Lab",
    facultyName: "Varsha Kinge",
    defaultRoom: "Lab 3 · Block C",
    type: "lab",
  },
];

/**
 * Recurring weekly timetable (Sem 3 · CMPN-A). A session for a specific date is
 * derived from these slots plus any ScheduleOverride for that date.
 */
export const WEEKLY_TIMETABLE: WeeklySlot[] = [
  // Monday
  { id: "mon-1", weekday: 1, code: "CMPN302", room: "Room 214", start: "09:00", end: "09:50" },
  { id: "mon-2", weekday: 1, code: "CMPN303", room: "Room 206", start: "10:00", end: "10:50" },
  { id: "mon-3", weekday: 1, code: "CMPN304", room: "Room 201", start: "11:00", end: "11:50" },
  { id: "mon-4", weekday: 1, code: "CMPN309", room: "Lab 3 · Block C", start: "13:00", end: "14:40" },
  { id: "mon-5", weekday: 1, code: "CMPN307", room: "Room 210", start: "15:00", end: "15:50" },
  // Tuesday
  { id: "tue-1", weekday: 2, code: "CMPN306", room: "Lab 2 · Block B", start: "09:00", end: "10:40" },
  { id: "tue-2", weekday: 2, code: "CMPN307", room: "Room 210", start: "11:00", end: "11:50" },
  { id: "tue-3", weekday: 2, code: "CMPN308", room: "Lab 2 · Block C", start: "12:00", end: "13:40" },
  { id: "tue-4", weekday: 2, code: "CMPN305", room: "Room 208", start: "14:00", end: "14:50" },
  { id: "tue-5", weekday: 2, code: "CMPN309", room: "Lab 3 · Block C", start: "15:00", end: "16:40" },
  // Wednesday
  { id: "wed-1", weekday: 3, code: "CMPN302", room: "Room 214", start: "09:00", end: "09:50" },
  { id: "wed-2", weekday: 3, code: "CMPN304", room: "Room 201", start: "10:00", end: "10:50" },
  { id: "wed-3", weekday: 3, code: "CMPN307", room: "Room 210", start: "11:00", end: "11:50" },
  { id: "wed-4", weekday: 3, code: "CMPN309", room: "Lab 3 · Block C", start: "13:00", end: "14:40" },
  { id: "wed-5", weekday: 3, code: "CMPN305", room: "Room 208", start: "15:00", end: "15:50" },
  // Thursday
  { id: "thu-1", weekday: 4, code: "CMPN306", room: "Lab 2 · Block B", start: "09:00", end: "10:40" },
  { id: "thu-2", weekday: 4, code: "CMPN303", room: "Room 206", start: "11:00", end: "11:50" },
  { id: "thu-3", weekday: 4, code: "CMPN308", room: "Lab 2 · Block C", start: "12:00", end: "13:40" },
  { id: "thu-4", weekday: 4, code: "CMPN309", room: "Lab 3 · Block C", start: "14:00", end: "15:40" },
  { id: "thu-5", weekday: 4, code: "CMPN305", room: "Room 208", start: "16:00", end: "16:50" },
  // Friday
  { id: "fri-1", weekday: 5, code: "CMPN303", room: "Room 206", start: "09:00", end: "09:50" },
  { id: "fri-2", weekday: 5, code: "CMPN302", room: "Room 214", start: "10:00", end: "10:50" },
  { id: "fri-3", weekday: 5, code: "CMPN304", room: "Room 201", start: "11:00", end: "11:50" },
  { id: "fri-4", weekday: 5, code: "CMPN309", room: "Lab 3 · Block C", start: "13:00", end: "14:40" },
  { id: "fri-5", weekday: 5, code: "CMPN307", room: "Room 210", start: "15:00", end: "15:50" },
  // Saturday
  { id: "sat-1", weekday: 6, code: "CMPN302", room: "Room 214", start: "09:00", end: "09:50" },
  { id: "sat-2", weekday: 6, code: "CMPN303", room: "Room 206", start: "10:00", end: "10:50" },
  { id: "sat-3", weekday: 6, code: "CMPN304", room: "Room 201", start: "11:00", end: "11:50" },
  { id: "sat-4", weekday: 6, code: "CMPN307", room: "Room 210", start: "15:00", end: "15:50" },
  { id: "sat-5", weekday: 6, code: "CMPN308", room: "Lab 2 · Block C", start: "16:00", end: "17:00" },
];
