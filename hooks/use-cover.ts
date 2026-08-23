"use client";

import { useCallback, useState } from "react";
import { coverService } from "@/services/api/cover";
import { useAsyncResource, type AsyncResource } from "@/hooks/use-async-resource";
import { ApiError } from "@/services/api/client";
import type { CoverBoardView, CoverRequestDraft } from "@/types/cover";

export function useCoverBoard(): AsyncResource<CoverBoardView> {
  return useAsyncResource(
    coverService.getBoard,
    "Unable to load the cover board. Please try again.",
  );
}

export interface CoverActions {
  /** Id of the request currently being acted on, if any. */
  pendingId: string | null;
  busy: boolean;
  error: string | null;
  request: (draft: CoverRequestDraft) => Promise<boolean>;
  accept: (id: string) => Promise<boolean>;
  cancel: (id: string) => Promise<boolean>;
}

function messageFor(error: unknown, fallback: string): string {
  return error instanceof ApiError ? error.message : fallback;
}

export function useCoverActions(): CoverActions {
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
    request: (draft) =>
      run(null, () => coverService.request(draft), "Unable to post the cover request."),
    accept: (id) =>
      run(id, () => coverService.accept(id), "Unable to accept this request."),
    cancel: (id) =>
      run(id, () => coverService.cancel(id), "Unable to withdraw this request."),
  };
}
