"use client";

import { useEffect, useMemo, useState } from "react";
import {
  LoaderCircle,
  Megaphone,
  Pin,
  Plus,
  Send,
  Archive,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Panel } from "@/components/common/panel";
import { ErrorState } from "@/components/common/error-state";
import { EmptyState } from "@/components/common/empty-state";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { useAdminNotices, useAdminNoticeManager } from "@/hooks/use-admin";
import { formatDayLabel } from "@/utils/date";
import { cn } from "@/utils/cn";
import type {
  AdminNotice,
  AdminNoticeAudience,
  AdminNoticeDraft,
  AdminNoticeStatus,
} from "@/types/admin";
import type { NoticeCategory } from "@/types/student";

type StatusFilter = AdminNoticeStatus | "all";

const STATUS_LABEL: Record<AdminNoticeStatus, string> = {
  draft: "Draft",
  published: "Published",
  scheduled: "Scheduled",
  archived: "Archived",
};

const STATUS_VARIANT: Record<AdminNoticeStatus, "outline" | "success" | "info" | "secondary"> = {
  draft: "outline",
  published: "success",
  scheduled: "info",
  archived: "secondary",
};

const CATEGORY_LABEL: Record<NoticeCategory, string> = {
  important: "Important",
  academic: "Academic",
  general: "General",
  event: "Event",
};

const AUDIENCE_LABEL: Record<AdminNoticeAudience, string> = {
  institution: "Whole institution",
  department: "Department",
  class: "Class",
  students: "Students only",
  faculty: "Faculty only",
};

const PRIORITY_VARIANT: Record<AdminNotice["priority"], "destructive" | "secondary" | "outline"> = {
  high: "destructive",
  normal: "secondary",
  low: "outline",
};

export function NoticesManager() {
  const { data, loading, error, refresh } = useAdminNotices();
  const [filter, setFilter] = useState<StatusFilter>("all");
  const [editing, setEditing] = useState<AdminNotice | null>(null);
  const [creating, setCreating] = useState(false);

  const notices = useMemo(() => data ?? [], [data]);
  const filtered = useMemo(
    () => (filter === "all" ? notices : notices.filter((notice) => notice.status === filter)),
    [notices, filter],
  );

  return (
    <Panel
      title="Notices"
      description="Publish and manage notices across the institution"
      flush
      action={
        <div className="flex flex-wrap items-center gap-2">
          <SegmentedControl<StatusFilter>
            ariaLabel="Filter notices by status"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              { value: "draft", label: "Drafts" },
              { value: "published", label: "Published" },
              { value: "scheduled", label: "Scheduled" },
              { value: "archived", label: "Archived" },
            ]}
          />
          <Button size="sm" onClick={() => setCreating(true)}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            New notice
          </Button>
        </div>
      }
    >
      {loading ? (
        <ListSkeleton rows={5} />
      ) : error ? (
        <ErrorState className="m-5" description={error} onRetry={() => void refresh()} />
      ) : filtered.length === 0 ? (
        <div className="p-5">
          <EmptyState
            icon={<Megaphone className="h-5 w-5" aria-hidden="true" />}
            title="No notices here"
            description="Create a notice to keep the campus informed."
          />
        </div>
      ) : (
        <ul className="divide-y divide-border">
          {filtered.map((notice) => (
            <li key={notice.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:gap-4">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
                  <span className="truncate">{notice.title}</span>
                  {notice.pinned ? <Pin className="h-3.5 w-3.5 text-warning" aria-label="Pinned" /> : null}
                  <Badge variant={STATUS_VARIANT[notice.status]}>{STATUS_LABEL[notice.status]}</Badge>
                </p>
                <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
                  <Badge variant="outline" className="px-1.5">{CATEGORY_LABEL[notice.category]}</Badge>
                  <span>{AUDIENCE_LABEL[notice.audience]}</span>
                  <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
                  <span className="tabular">{formatDayLabel(notice.publishAt)}</span>
                  <Badge variant={PRIORITY_VARIANT[notice.priority]} className="px-1.5 capitalize">
                    {notice.priority}
                  </Badge>
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {notice.status === "draft" || notice.status === "scheduled" ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(notice)}>
                    <Send className="h-3.5 w-3.5" aria-hidden="true" />
                    Publish
                  </Button>
                ) : notice.status === "published" ? (
                  <Button variant="outline" size="sm" onClick={() => setEditing(notice)}>
                    <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                    Archive
                  </Button>
                ) : null}
                <Button variant="ghost" size="sm" onClick={() => setEditing(notice)}>
                  Edit
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {editing || creating ? (
        <AdminNoticeDialog
          key={editing?.id ?? "create"}
          notice={editing}
          onClose={() => {
            setEditing(null);
            setCreating(false);
          }}
          onSaved={() => {
            setEditing(null);
            setCreating(false);
            void refresh();
          }}
        />
      ) : null}
    </Panel>
  );
}

function AdminNoticeDialog({
  notice,
  onClose,
  onSaved,
}: {
  notice: AdminNotice | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const manager = useAdminNoticeManager();
  const [title, setTitle] = useState(notice?.title ?? "");
  const [body, setBody] = useState(notice?.body ?? "");
  const [category, setCategory] = useState<NoticeCategory>(notice?.category ?? "general");
  const [audience, setAudience] = useState<AdminNoticeAudience>(notice?.audience ?? "institution");
  const [priority, setPriority] = useState<AdminNotice["priority"]>(notice?.priority ?? "normal");
  const [pinned, setPinned] = useState(notice?.pinned ?? false);
  const [status, setStatus] = useState<AdminNoticeStatus>(notice?.status ?? "draft");
  const [publishAt, setPublishAt] = useState(
    notice?.publishAt ? notice.publishAt.slice(0, 16) : "2026-08-15T09:00",
  );
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = originalOverflow;
    };
  }, [onClose]);

  async function handleSave(): Promise<void> {
    setFormError(null);
    if (!title.trim()) {
      setFormError("A notice title is required.");
      return;
    }
    const draft: AdminNoticeDraft = {
      id: notice?.id,
      title: title.trim(),
      body: body.trim() || undefined,
      category,
      audience,
      priority,
      pinned,
      status,
      publishAt,
    };
    const ok = await manager.save(draft);
    if (ok) onSaved();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="presentation">
      <div className="absolute inset-0 bg-black/45 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="notice-dialog-title"
        className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-lifted"
      >
        <header className="flex items-start justify-between gap-4 border-b border-border/90 px-5 py-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
              {notice ? "Edit notice" : "New notice"}
            </p>
            <h2 id="notice-dialog-title" className="mt-1 font-heading text-lg font-semibold tracking-tight">
              {notice ? notice.title : "Draft a campus notice"}
            </h2>
          </div>
          <Button variant="ghost" size="icon" className="shrink-0 -mr-1 -mt-1" onClick={onClose} aria-label="Close">
            <X className="h-5 w-5" aria-hidden="true" />
          </Button>
        </header>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <div className="space-y-1.5">
            <Label htmlFor="notice-title">Title</Label>
            <Input id="notice-title" value={title} onChange={(event) => setTitle(event.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="notice-body">Body</Label>
            <textarea
              id="notice-body"
              value={body}
              onChange={(event) => setBody(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none transition-colors placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
              placeholder="Details students should know…"
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="notice-category">Category</Label>
              <Select id="notice-category" value={category} onChange={(event) => setCategory(event.target.value as NoticeCategory)}>
                {(Object.keys(CATEGORY_LABEL) as NoticeCategory[]).map((key) => (
                  <option key={key} value={key}>
                    {CATEGORY_LABEL[key]}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notice-audience">Audience</Label>
              <Select id="notice-audience" value={audience} onChange={(event) => setAudience(event.target.value as AdminNoticeAudience)}>
                {(Object.keys(AUDIENCE_LABEL) as AdminNoticeAudience[]).map((key) => (
                  <option key={key} value={key}>
                    {AUDIENCE_LABEL[key]}
                  </option>
                ))}
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="notice-priority">Priority</Label>
              <Select id="notice-priority" value={priority} onChange={(event) => setPriority(event.target.value as AdminNotice["priority"])}>
                <option value="high">High</option>
                <option value="normal">Normal</option>
                <option value="low">Low</option>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="notice-status">Status</Label>
              <Select id="notice-status" value={status} onChange={(event) => setStatus(event.target.value as AdminNoticeStatus)}>
                <option value="draft">Draft</option>
                <option value="published">Published</option>
                <option value="scheduled">Scheduled</option>
              </Select>
            </div>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="notice-publish">Publish time</Label>
              <Input id="notice-publish" type="datetime-local" value={publishAt} onChange={(event) => setPublishAt(event.target.value)} />
            </div>
            <div className="flex items-end">
              <button
                type="button"
                aria-pressed={pinned}
                onClick={() => setPinned((value) => !value)}
                className={cn(
                  "inline-flex h-9 w-full items-center justify-center gap-1.5 rounded-lg border text-sm font-medium transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                  pinned
                    ? "border-warning/40 bg-warning/10 text-warning"
                    : "border-border bg-card/60 text-muted-foreground hover:bg-surface-2/60",
                )}
              >
                <Pin className="h-4 w-4" aria-hidden="true" />
                {pinned ? "Pinned" : "Pin notice"}
              </button>
            </div>
          </div>

          {formError || manager.error ? (
            <p className="text-sm font-medium text-destructive" role="alert">
              {formError ?? manager.error}
            </p>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-1">
            <Button variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button size="sm" disabled={manager.busy} onClick={() => void handleSave()}>
              {manager.busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
              {notice ? "Save changes" : "Create notice"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
