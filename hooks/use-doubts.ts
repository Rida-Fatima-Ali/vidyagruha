"use client";

import { useCallback, useEffect, useState } from "react";
import { doubtsService, type DoubtsQuery } from "@/services/api/doubts";
import type { AsyncResource } from "@/hooks/use-async-resource";
import { ApiError } from "@/services/api/client";
import type { AnswerDraft, DoubtDraft, DoubtsView } from "@/types/doubts";
import type { UserRole } from "@/types/auth";

/** Search, subject and status filters all re-query the thread list. */
export function useDoubts(
  role: UserRole,
  { q, code, filter }: DoubtsQuery,
): AsyncResource<DoubtsView> {
  const [data, setData] = useState<DoubtsView | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloads, setReloads] = useState(0);

  useEffect(() => {
    let cancelled = false;
    doubtsService
      .list(role, { q, code, filter })
      .then((result) => {
        if (cancelled) return;
        setData(result);
        setError(null);
        setLoading(false);
      })
      .catch(() => {
        if (cancelled) return;
        setError("Unable to load doubts. Please try again.");
        setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [role, q, code, filter, reloads]);

  const refresh = useCallback(async () => {
    setReloads((value) => value + 1);
  }, []);

  return { data, loading, error, refresh };
}

export interface DoubtActions {
  /** Id of the doubt or answer currently being acted on. */
  pendingId: string | null;
  busy: boolean;
  error: string | null;
  ask: (draft: DoubtDraft) => Promise<boolean>;
  answer: (draft: AnswerDraft) => Promise<boolean>;
  vote: (doubtId: string, answerId: string) => Promise<boolean>;
  verify: (doubtId: string, answerId: string) => Promise<boolean>;
}

function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export function useDoubtActions(role: UserRole): DoubtActions {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(
    async (id: string | null, action: () => Promise<unknown>, fallback: string) => {
      setBusy(true);
      setPendingId(id);
      setError(null);
      try {
        await action();
        return true;
      } catch (caught) {
        setError(messageFor(caught, fallback));
        return false;
      } finally {
        setBusy(false);
        setPendingId(null);
      }
    },
    [],
  );

  return {
    pendingId,
    busy,
    error,
    ask: (draft) =>
      run(null, () => doubtsService.ask(role, draft), "Unable to post your doubt."),
    answer: (draft) =>
      run(draft.doubtId, () => doubtsService.answer(role, draft), "Unable to post your answer."),
    vote: (doubtId, answerId) =>
      run(answerId, () => doubtsService.vote(role, doubtId, answerId), "Unable to record your vote."),
    verify: (doubtId, answerId) =>
      run(answerId, () => doubtsService.verify(role, doubtId, answerId), "Unable to verify this answer."),
  };
}
