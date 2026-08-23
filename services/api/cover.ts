import { ApiError, apiClient, registerMock } from "./client";
import {
  cancelCoverRequest,
  createCoverRequest,
  findCoverRequest,
  hasCoverRequest,
  markCoverAccepted,
} from "@/mocks/cover-requests";
import { addScheduleOverride } from "@/mocks/schedule-overrides";
import { MOCK_USERS } from "@/mocks/users";
import { pushActivityNotification } from "@/mocks/notifications";
import { canCover, coverBoard, withCandidates } from "@/services/cover";
import { ownedByFaculty } from "@/services/schedule";
import { DEMO_NOW } from "@/constants/demo";
import { formatDayLabel } from "@/utils/date";
import type { CoverBoardView, CoverRequestWithCandidates, CoverRequestDraft } from "@/types/cover";

/**
 * Cover-request endpoints. Accepting a request is the interesting one: it also
 * writes a `faculty_changed` schedule override, so the substitute shows up in
 * the student timetable and the notification feed in the same round-trip.
 */

function demoFaculty() {
  return MOCK_USERS.faculty;
}

registerMock("/api/faculty/cover", () => coverBoard(demoFaculty().name));

registerMock("/api/faculty/cover/request", (request) => {
  const user = demoFaculty();
  const draft = (request.body ?? {}) as CoverRequestDraft;
  if (!draft.code || !draft.date) {
    throw new ApiError("A session is required.", 400);
  }
  if (!draft.reason?.trim()) {
    throw new ApiError("Add a short reason so colleagues can prioritise.", 400);
  }
  if (!ownedByFaculty(draft.code, user.name)) {
    throw new ApiError("You can only request cover for your own lectures.", 403);
  }
  if (hasCoverRequest(draft.code, draft.date)) {
    throw new ApiError("A cover request for this session is already live.", 409);
  }
  const created = createCoverRequest(
    user.name,
    { ...draft, reason: draft.reason.trim() },
    DEMO_NOW.toISOString(),
  );
  pushActivityNotification({
    category: "academic",
    title: `Cover needed — ${created.subject}`,
    body: `${formatDayLabel(created.date)} · ${created.start} · ${created.requestedBy} (${created.reason})`,
    audience: "faculty",
    priority: "high",
    subjectCode: created.code,
    dedupeKey: `cover-${created.id}`,
  });
  return withCandidates(created);
});

registerMock("/api/faculty/cover/accept", (request) => {
  const user = demoFaculty();
  const id = (request.body as { id?: string } | undefined)?.id;
  const existing = id ? findCoverRequest(id) : undefined;
  if (!existing) {
    throw new ApiError("Cover request not found.", 404);
  }
  if (existing.status !== "open") {
    throw new ApiError("This request has already been taken.", 409);
  }
  if (!canCover(existing, user.name)) {
    throw new ApiError("You have a clashing lecture at that time.", 409);
  }
  const override = addScheduleOverride({
    date: existing.date,
    code: existing.code,
    kind: "faculty_changed",
    newFaculty: user.name,
    reason: `Cover accepted — ${existing.reason}`,
  });
  const accepted = markCoverAccepted(
    existing.id,
    user.name,
    DEMO_NOW.toISOString(),
    override.id,
  );
  if (!accepted) {
    throw new ApiError("This request has already been taken.", 409);
  }
  pushActivityNotification({
    category: "academic",
    title: `${accepted.subject} — cover confirmed`,
    body: `${formatDayLabel(accepted.date)} · ${accepted.start} · taken by ${user.name}`,
    audience: "all",
    priority: "normal",
    subjectCode: accepted.code,
    dedupeKey: `cover-${accepted.id}-accepted`,
  });
  return withCandidates(accepted);
});

registerMock("/api/faculty/cover/cancel", (request) => {
  const user = demoFaculty();
  const id = (request.body as { id?: string } | undefined)?.id;
  const existing = id ? findCoverRequest(id) : undefined;
  if (!existing) {
    throw new ApiError("Cover request not found.", 404);
  }
  if (existing.requestedBy !== user.name) {
    throw new ApiError("You can only withdraw your own requests.", 403);
  }
  const cancelled = cancelCoverRequest(existing.id);
  if (!cancelled) {
    throw new ApiError("This request can no longer be withdrawn.", 409);
  }
  return withCandidates(cancelled);
});

export const coverService = {
  getBoard: () => apiClient.get<CoverBoardView>("/api/faculty/cover"),

  request: (draft: CoverRequestDraft) =>
    apiClient.post<CoverRequestWithCandidates>("/api/faculty/cover/request", draft),

  accept: (id: string) =>
    apiClient.post<CoverRequestWithCandidates>("/api/faculty/cover/accept", { id }),

  cancel: (id: string) =>
    apiClient.post<CoverRequestWithCandidates>("/api/faculty/cover/cancel", { id }),
};
