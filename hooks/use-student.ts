"use client";

import { useAsyncResource } from "@/hooks/use-async-resource";
import { studentService } from "@/services/api/student";
import type {
  ScheduleSlot,
  StudentAssignment,
  StudentDashboardData,
  StudentEvent,
  StudentNotice,
  StudyMaterial,
  SubjectAttendance,
} from "@/types/student";

export function useStudentDashboard(): ReturnType<
  typeof useAsyncResource<StudentDashboardData>
> {
  return useAsyncResource(
    studentService.getDashboard,
    "Unable to load your dashboard. Please try again.",
  );
}

export function useSchedule(): ReturnType<typeof useAsyncResource<ScheduleSlot[]>> {
  return useAsyncResource(studentService.getSchedule, "Unable to load today's schedule.");
}

export function useAttendance(): ReturnType<typeof useAsyncResource<SubjectAttendance[]>> {
  return useAsyncResource(studentService.getAttendance, "Unable to load your attendance.");
}

export function useAssignments(): ReturnType<typeof useAsyncResource<StudentAssignment[]>> {
  return useAsyncResource(studentService.getAssignments, "Unable to load your assignments.");
}

export function useMaterials(): ReturnType<typeof useAsyncResource<StudyMaterial[]>> {
  return useAsyncResource(studentService.getMaterials, "Unable to load study materials.");
}

export function useNotices(): ReturnType<typeof useAsyncResource<StudentNotice[]>> {
  return useAsyncResource(studentService.getNotices, "Unable to load notices.");
}

export function useEvents(): ReturnType<typeof useAsyncResource<StudentEvent[]>> {
  return useAsyncResource(studentService.getEvents, "Unable to load events.");
}
