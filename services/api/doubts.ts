import { apiClient, ApiError, registerMock } from "./client";
import {
  addAnswer,
  createDoubt,
  findDoubt,
  getDoubts,
  toggleVote,
  verifyAnswer,
} from "@/mocks/doubts";
import { MOCK_USERS } from "@/mocks/users";
import { ACADEMIC_SUBJECTS } from "@/mocks/academic";
import { pushActivityNotification } from "@/mocks/notifications";
import type { AnswerDraft, Doubt, DoubtDraft, DoubtsView } from "@/types/doubts";
import type { AuthUser, UserRole } from "@/types/auth";

/**
 * Doubt threads. Answers are ordered verified-first, then by upvotes, so the
 * trustworthy answer is always the one a student reads first.
 */

function userFor(role: string | undefined): AuthUser {
  if (role === "faculty") return MOCK_USERS.faculty;
  if (role === "admin") return MOCK_USERS.admin;
  return MOCK_USERS.student;
}

function rank(doubt: Doubt): Doubt {
  return {
    ...doubt,
    answers: [...doubt.answers].sort((a, b) => {
      if (a.verified !== b.verified) return a.verified ? -1 : 1;
      if (a.votes !== b.votes) return b.votes - a.votes;
      return a.createdAt.localeCompare(b.createdAt);
    }),
  };
}

function view(query: Record<string, string | undefined>): DoubtsView {
  const search = (query.q ?? "").trim().toLowerCase();
  const code = query.code;
  const filter = query.filter ?? "all";

  const all = getDoubts().map(rank);
  const doubts = all.filter((doubt) => {
    if (code && doubt.code !== code) return false;
    if (filter === "verified" && !doubt.resolved) return false;
    if (filter === "unanswered" && doubt.answers.length > 0) return false;
    if (!search) return true;
    const haystack = [doubt.title, doubt.body, doubt.subject, ...doubt.tags]
      .concat(doubt.answers.map((answer) => answer.body))
      .join(" ")
      .toLowerCase();
    return haystack.includes(search);
  });

  return {
    doubts,
    subjects: ACADEMIC_SUBJECTS.map((subject) => ({
      code: subject.code,
      name: subject.name,
    })),
    stats: {
      total: all.length,
      verified: all.filter((doubt) => doubt.resolved).length,
      awaiting: all.filter((doubt) => doubt.answers.length === 0).length,
    },
  };
}

registerMock("/api/doubts", (request) => view(request.query));

registerMock("/api/doubts/ask", (request) => {
  const user = userFor(request.query.role);
  const draft = (request.body ?? {}) as DoubtDraft;
  if (!draft.code || !draft.title?.trim() || !draft.body?.trim()) {
    throw new ApiError("A subject, title and question are required.", 400);
  }
  const doubt = createDoubt(user, {
    ...draft,
    title: draft.title.trim(),
    body: draft.body.trim(),
  });
  pushActivityNotification({
    category: "academic",
    title: `New doubt — ${doubt.subject}`,
    body: doubt.title,
    audience: "faculty",
    priority: "normal",
    subjectCode: doubt.code,
    dedupeKey: `doubt-${doubt.id}`,
  });
  return rank(doubt);
});

registerMock("/api/doubts/answer", (request) => {
  const user = userFor(request.query.role);
  const draft = (request.body ?? {}) as AnswerDraft;
  if (!draft.doubtId || !draft.body?.trim()) {
    throw new ApiError("An answer cannot be empty.", 400);
  }
  const doubt = addAnswer(user, { ...draft, body: draft.body.trim() });
  if (!doubt) throw new ApiError("That doubt no longer exists.", 404);
  return rank(doubt);
});

registerMock("/api/doubts/vote", (request) => {
  const payload = (request.body ?? {}) as { doubtId?: string; answerId?: string };
  if (!payload.doubtId || !payload.answerId) {
    throw new ApiError("An answer is required.", 400);
  }
  const doubt = toggleVote(payload.doubtId, payload.answerId);
  if (!doubt) throw new ApiError("That answer no longer exists.", 404);
  return rank(doubt);
});

registerMock("/api/doubts/verify", (request) => {
  const user = userFor(request.query.role);
  if (user.role !== "faculty") {
    throw new ApiError("Only faculty can verify an answer.", 403);
  }
  const payload = (request.body ?? {}) as { doubtId?: string; answerId?: string };
  if (!payload.doubtId || !payload.answerId) {
    throw new ApiError("An answer is required.", 400);
  }
  const existing = findDoubt(payload.doubtId);
  const doubt = verifyAnswer(payload.doubtId, payload.answerId, user.name);
  if (!doubt || !existing) throw new ApiError("That answer no longer exists.", 404);
  if (doubt.resolved) {
    pushActivityNotification({
      category: "academic",
      title: `Verified answer — ${doubt.subject}`,
      body: `${user.name} verified an answer to "${doubt.title}"`,
      audience: "students",
      priority: "normal",
      subjectCode: doubt.code,
      dedupeKey: `doubt-verified-${doubt.id}`,
    });
  }
  return rank(doubt);
});

export interface DoubtsQuery {
  q?: string;
  code?: string;
  filter?: "all" | "verified" | "unanswered";
}

function queryString(role: UserRole, query: DoubtsQuery = {}): string {
  const params = new URLSearchParams({ role });
  if (query.q) params.set("q", query.q);
  if (query.code) params.set("code", query.code);
  if (query.filter && query.filter !== "all") params.set("filter", query.filter);
  return params.toString();
}

export const doubtsService = {
  list: (role: UserRole, query: DoubtsQuery = {}) =>
    apiClient.get<DoubtsView>(`/api/doubts?${queryString(role, query)}`),

  ask: (role: UserRole, draft: DoubtDraft) =>
    apiClient.post<Doubt>(`/api/doubts/ask?role=${role}`, draft),

  answer: (role: UserRole, draft: AnswerDraft) =>
    apiClient.post<Doubt>(`/api/doubts/answer?role=${role}`, draft),

  vote: (role: UserRole, doubtId: string, answerId: string) =>
    apiClient.post<Doubt>(`/api/doubts/vote?role=${role}`, { doubtId, answerId }),

  verify: (role: UserRole, doubtId: string, answerId: string) =>
    apiClient.post<Doubt>(`/api/doubts/verify?role=${role}`, { doubtId, answerId }),
};
