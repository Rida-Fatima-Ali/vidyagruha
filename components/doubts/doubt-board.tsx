"use client";

import { useState } from "react";
import {
  BadgeCheck,
  ChevronDown,
  ChevronUp,
  LoaderCircle,
  MessagesSquare,
  Plus,
  Search,
  ShieldCheck,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { SegmentedControl } from "@/components/ui/segmented-control";
import { Modal } from "@/components/common/modal";
import { Panel } from "@/components/common/panel";
import { EmptyState } from "@/components/common/empty-state";
import { ErrorState } from "@/components/common/error-state";
import { ListSkeleton } from "@/components/common/list-skeleton";
import { useToast } from "@/components/ui/toast";
import { useDoubtActions, useDoubts } from "@/hooks/use-doubts";
import { formatRelativeTime } from "@/utils/date";
import { cn } from "@/utils/cn";
import type { DoubtsQuery } from "@/services/api/doubts";
import type { Doubt, DoubtAnswer } from "@/types/doubts";
import type { UserRole } from "@/types/auth";

type Filter = NonNullable<DoubtsQuery["filter"]>;

/**
 * Stack Overflow-shaped doubt threads: peers upvote, faculty verify exactly one
 * answer, and everything stays searchable so the board becomes a knowledge base
 * rather than a chat log.
 */
export function DoubtBoard({ role }: { role: UserRole }) {
  const [search, setSearch] = useState("");
  const [code, setCode] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [asking, setAsking] = useState(false);

  const { data, loading, error, refresh } = useDoubts(role, {
    q: search,
    code: code || undefined,
    filter,
  });
  const actions = useDoubtActions(role);
  const { toast } = useToast();

  const doubts = data?.doubts ?? [];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-3">
        <StatCard label="Threads" value={data?.stats.total ?? 0} />
        <StatCard label="Verified answers" value={data?.stats.verified ?? 0} tone="success" />
        <StatCard label="Awaiting an answer" value={data?.stats.awaiting ?? 0} tone="warning" />
      </div>

      <Panel
        title="Doubts"
        description="Search first — a verified answer probably already exists."
        flush
        action={
          <Button size="sm" onClick={() => setAsking(true)}>
            <Plus className="h-3.5 w-3.5" aria-hidden="true" />
            Ask a doubt
          </Button>
        }
      >
        <div className="flex flex-col gap-3 border-b border-border px-5 py-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              aria-label="Search doubts"
              placeholder="Search questions, answers and tags…"
              className="pl-9"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
          <Select
            aria-label="Filter by subject"
            className="lg:w-56"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          >
            <option value="">All subjects</option>
            {(data?.subjects ?? []).map((subject) => (
              <option key={subject.code} value={subject.code}>
                {subject.name}
              </option>
            ))}
          </Select>
          <SegmentedControl<Filter>
            ariaLabel="Filter doubts"
            value={filter}
            onChange={setFilter}
            options={[
              { value: "all", label: "All" },
              { value: "verified", label: "Verified" },
              { value: "unanswered", label: "Unanswered" },
            ]}
          />
        </div>

        {loading ? (
          <ListSkeleton rows={4} />
        ) : error ? (
          <ErrorState className="m-5" description={error} onRetry={() => void refresh()} />
        ) : doubts.length === 0 ? (
          <div className="p-5">
            <EmptyState
              icon={<MessagesSquare className="h-5 w-5" aria-hidden="true" />}
              title="No doubts match"
              description="Try a different search, or ask the question yourself."
            />
          </div>
        ) : (
          <ul className="divide-y divide-border">
            {doubts.map((doubt) => (
              <DoubtThread
                key={doubt.id}
                doubt={doubt}
                role={role}
                actions={actions}
                onChanged={() => void refresh()}
                onVerified={(answer) =>
                  toast({
                    title: answer.verified ? "Answer verified" : "Verification removed",
                    description: answer.verified
                      ? `${answer.author}'s answer now carries your verified badge.`
                      : "Students will no longer see a verified badge on this thread.",
                    tone: answer.verified ? "success" : "default",
                  })
                }
              />
            ))}
          </ul>
        )}
      </Panel>

      {asking ? (
        <AskDialog
          subjects={data?.subjects ?? []}
          busy={actions.busy}
          error={actions.error}
          onClose={() => setAsking(false)}
          onSubmit={async (draft) => {
            const ok = await actions.ask(draft);
            if (ok) {
              setAsking(false);
              await refresh();
              toast({
                title: "Doubt posted",
                description: "Faculty and classmates for that subject have been notified.",
                tone: "success",
              });
            }
          }}
        />
      ) : null}
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone?: "success" | "warning";
}) {
  return (
    <div className="rounded-xl border border-border bg-card/60 px-4 py-3">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p
        className={cn(
          "tabular text-2xl font-semibold",
          tone === "success" && "text-success",
          tone === "warning" && "text-warning",
        )}
      >
        {value}
      </p>
    </div>
  );
}

function DoubtThread({
  doubt,
  role,
  actions,
  onChanged,
  onVerified,
}: {
  doubt: Doubt;
  role: UserRole;
  actions: ReturnType<typeof useDoubtActions>;
  onChanged: () => void;
  onVerified: (answer: DoubtAnswer) => void;
}) {
  const [open, setOpen] = useState(doubt.answers.length === 0);
  const [reply, setReply] = useState("");
  const verified = doubt.answers.find((answer) => answer.verified);

  async function handleVote(answer: DoubtAnswer): Promise<void> {
    if (await actions.vote(doubt.id, answer.id)) onChanged();
  }

  async function handleVerify(answer: DoubtAnswer): Promise<void> {
    if (await actions.verify(doubt.id, answer.id)) {
      onVerified({ ...answer, verified: !answer.verified });
      onChanged();
    }
  }

  async function handleReply(): Promise<void> {
    if (!reply.trim()) return;
    if (await actions.answer({ doubtId: doubt.id, body: reply })) {
      setReply("");
      onChanged();
    }
  }

  return (
    <li className="px-5 py-4">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-start gap-3 text-left"
        aria-expanded={open}
      >
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2 text-sm font-medium">
            <span className="truncate">{doubt.title}</span>
            {doubt.resolved ? (
              <Badge variant="success" className="gap-1 px-1.5">
                <BadgeCheck className="h-3 w-3" aria-hidden="true" />
                Verified
              </Badge>
            ) : doubt.answers.length === 0 ? (
              <Badge variant="outline" className="px-1.5">
                Unanswered
              </Badge>
            ) : null}
          </p>
          <p className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-muted-foreground">
            <Badge variant="outline" className="px-1.5">
              {doubt.subject}
            </Badge>
            <span>
              {doubt.author} · {formatRelativeTime(doubt.createdAt)}
            </span>
            <span aria-hidden="true" className="h-0.5 w-0.5 rounded-full bg-muted-foreground/60" />
            <span>
              {doubt.answers.length} {doubt.answers.length === 1 ? "answer" : "answers"}
            </span>
            {doubt.tags.map((tag) => (
              <span key={tag} className="rounded bg-surface-2/70 px-1.5 py-0.5 text-[0.6875rem]">
                #{tag}
              </span>
            ))}
          </p>
          {!open && verified ? (
            <p className="mt-2 line-clamp-2 rounded-lg bg-success/8 px-3 py-2 text-xs text-muted-foreground">
              <span className="font-medium text-success">Verified: </span>
              {verified.body}
            </p>
          ) : null}
        </div>
        {open ? (
          <ChevronUp className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        ) : (
          <ChevronDown className="mt-1 h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        )}
      </button>

      {open ? (
        <div className="mt-3 space-y-3">
          <p className="rounded-lg bg-surface-2/50 px-3 py-2 text-sm text-muted-foreground">
            {doubt.body}
          </p>

          <ul className="space-y-2">
            {doubt.answers.map((answer) => (
              <AnswerRow
                key={answer.id}
                answer={answer}
                role={role}
                pending={actions.pendingId === answer.id}
                onVote={() => void handleVote(answer)}
                onVerify={() => void handleVerify(answer)}
              />
            ))}
          </ul>

          <div className="flex flex-col gap-2 sm:flex-row">
            <Input
              aria-label={`Answer ${doubt.title}`}
              placeholder={role === "faculty" ? "Answer as faculty…" : "Share what you know…"}
              value={reply}
              onChange={(event) => setReply(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") void handleReply();
              }}
            />
            <Button
              variant="outline"
              disabled={!reply.trim() || actions.busy}
              onClick={() => void handleReply()}
            >
              Post answer
            </Button>
          </div>
          {actions.error ? (
            <p className="text-xs font-medium text-destructive" role="alert">
              {actions.error}
            </p>
          ) : null}
        </div>
      ) : null}
    </li>
  );
}

function AnswerRow({
  answer,
  role,
  pending,
  onVote,
  onVerify,
}: {
  answer: DoubtAnswer;
  role: UserRole;
  pending: boolean;
  onVote: () => void;
  onVerify: () => void;
}) {
  return (
    <li
      className={cn(
        "flex gap-3 rounded-xl border px-3 py-3",
        answer.verified ? "border-success/40 bg-success/8" : "border-border bg-card/50",
      )}
    >
      <button
        type="button"
        onClick={onVote}
        aria-pressed={answer.votedByMe}
        aria-label={answer.votedByMe ? "Remove upvote" : "Upvote this answer"}
        className={cn(
          "flex h-fit w-9 shrink-0 flex-col items-center rounded-lg border px-1 py-1 text-xs font-medium transition-colors",
          answer.votedByMe
            ? "border-primary/50 bg-primary/12 text-primary"
            : "border-border text-muted-foreground hover:border-primary/40 hover:text-primary",
        )}
      >
        <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
        <span className="tabular">{answer.votes}</span>
      </button>

      <div className="min-w-0 flex-1">
        <p className="flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
          <span className="font-medium text-foreground">{answer.author}</span>
          {answer.authorRole === "faculty" ? (
            <Badge variant="info" className="px-1.5">
              Faculty
            </Badge>
          ) : null}
          {answer.verified ? (
            <Badge variant="success" className="gap-1 px-1.5">
              <BadgeCheck className="h-3 w-3" aria-hidden="true" />
              Verified{answer.verifiedBy ? ` by ${answer.verifiedBy}` : ""}
            </Badge>
          ) : null}
          <span>{formatRelativeTime(answer.createdAt)}</span>
        </p>
        <p className="mt-1 text-sm">{answer.body}</p>

        {role === "faculty" ? (
          <button
            type="button"
            onClick={onVerify}
            disabled={pending}
            className={cn(
              "mt-2 inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs font-medium transition-colors",
              answer.verified
                ? "text-muted-foreground hover:text-foreground"
                : "text-success hover:bg-success/10",
            )}
          >
            {pending ? (
              <LoaderCircle className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
            ) : (
              <ShieldCheck className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {answer.verified ? "Remove verification" : "Mark as verified"}
          </button>
        ) : null}
      </div>
    </li>
  );
}

function AskDialog({
  subjects,
  busy,
  error,
  onClose,
  onSubmit,
}: {
  subjects: { code: string; name: string }[];
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (draft: { code: string; title: string; body: string; tags: string[] }) => void;
}) {
  const [code, setCode] = useState(subjects[0]?.code ?? "");
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [tags, setTags] = useState("");

  return (
    <Modal
      open
      onClose={onClose}
      eyebrow="Doubts"
      title="Ask a doubt"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button
            disabled={busy || !code || !title.trim() || !body.trim()}
            onClick={() =>
              onSubmit({
                code,
                title,
                body,
                tags: tags
                  .split(",")
                  .map((tag) => tag.trim().toLowerCase())
                  .filter(Boolean),
              })
            }
          >
            {busy ? <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
            Post doubt
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="doubt-subject">Subject</Label>
          <Select
            id="doubt-subject"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          >
            {subjects.map((subject) => (
              <option key={subject.code} value={subject.code}>
                {subject.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doubt-title">Question</Label>
          <Input
            id="doubt-title"
            placeholder="Why does the 8086 need a segment register?"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doubt-body">Details</Label>
          <textarea
            id="doubt-body"
            rows={4}
            value={body}
            onChange={(event) => setBody(event.target.value)}
            placeholder="What have you tried, and where exactly are you stuck?"
            className="w-full rounded-lg border border-border bg-card/60 px-3 py-2 text-sm outline-none focus-visible:border-primary/50 focus-visible:ring-2 focus-visible:ring-ring/30"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="doubt-tags">Tags</Label>
          <Input
            id="doubt-tags"
            placeholder="8086, memory, segmentation"
            value={tags}
            onChange={(event) => setTags(event.target.value)}
          />
        </div>
        {error ? (
          <p className="text-sm font-medium text-destructive" role="alert">
            {error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
