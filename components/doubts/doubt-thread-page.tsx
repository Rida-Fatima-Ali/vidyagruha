"use client";

import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, ChevronDown, ChevronRight, ThumbsUp, ShieldCheck, Clock, SortAsc } from "lucide-react";
import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/utils/cn";
import { useAuth } from "@/hooks/use-auth";

interface Answer {
  id: string;
  author: string;
  role: "faculty" | "student";
  dept?: string;
  body: string;
  helpful: number;
  verified: boolean;
  userHelpful: boolean;
  createdAt: string;
}

interface DoubtQuestion {
  id: string;
  title: string;
  subject: string;
  author: string;
  createdAt: string;
  answers: Answer[];
  expanded: boolean;
}

const INITIAL_DOUBTS: DoubtQuestion[] = [
  {
    id: "d1",
    title: "Why does the 8086 use segment registers?",
    subject: "Microprocessor",
    author: "Priya Sharma",
    createdAt: "2h ago",
    expanded: true,
    answers: [
      {
        id: "a1", author: "Dr. Rahul Mehta", role: "faculty", dept: "Computer Engineering",
        body: "Segment registers in the 8086 allow a 20-bit physical address to be generated using 16-bit registers. The address is computed as Segment × 16 + Offset, enabling access to 1 MB of memory with only 16-bit registers. This technique is called segmented memory architecture.",
        helpful: 24, verified: true, userHelpful: false, createdAt: "1h ago",
      },
      {
        id: "a2", author: "Akash Kulkarni", role: "student", dept: undefined,
        body: "The 8086 is a 16-bit processor but needs to address 20-bit memory. The segment:offset scheme solves this without expanding the register size.",
        helpful: 8, verified: false, userHelpful: false, createdAt: "45m ago",
      },
      {
        id: "a3", author: "Sneha Patil", role: "student", dept: undefined,
        body: "Also worth noting: there are four segment registers — CS, DS, SS, ES — each dedicated to code, data, stack, and extra segments respectively.",
        helpful: 5, verified: false, userHelpful: false, createdAt: "30m ago",
      },
    ],
  },
  {
    id: "d2",
    title: "What is the difference between 1NF, 2NF and 3NF in database normalisation?",
    subject: "Database Management System",
    author: "Rohan Desai",
    createdAt: "5h ago",
    expanded: false,
    answers: [
      {
        id: "a4", author: "Prof. Anita Joshi", role: "faculty", dept: "Computer Engineering",
        body: "1NF eliminates repeating groups (atomic values). 2NF removes partial dependencies on composite keys. 3NF eliminates transitive dependencies. Each normal form builds upon the previous one and reduces data redundancy.",
        helpful: 31, verified: true, userHelpful: false, createdAt: "4h ago",
      },
      {
        id: "a5", author: "Nikhil Bane", role: "student",
        body: "A simple way to remember: 1NF = no repeating columns, 2NF = no partial key dependency, 3NF = no non-key dependency.",
        helpful: 12, verified: false, userHelpful: false, createdAt: "3h ago",
      },
    ],
  },
];

type SortMode = "helpful" | "verified" | "newest";

function AnswerCard({
  answer, canVerify, onVerify, onHelpful,
}: {
  answer: Answer;
  canVerify: boolean;
  onVerify: (id: string) => void;
  onHelpful: (id: string) => void;
}) {
  return (
    <div className={cn(
      "rounded-lg border px-4 py-3.5",
      answer.verified
        ? "border-success/30 bg-success/5"
        : "border-border bg-card"
    )}>
      <div className="flex items-start gap-3">
        <Avatar name={answer.author} size="sm" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 mb-1">
            <p className="text-sm font-semibold">{answer.author}</p>
            {answer.role === "faculty" && (
              <span className="text-xs text-muted-foreground">Faculty · {answer.dept}</span>
            )}
            {answer.verified && (
              <span className="flex items-center gap-1 text-xs font-medium text-success">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Verified Answer
              </span>
            )}
            <span className="text-xs text-muted-foreground ml-auto">{answer.createdAt}</span>
          </div>
          <p className="text-sm text-foreground leading-relaxed">{answer.body}</p>
          <div className="mt-3 flex items-center gap-3">
            <button
              onClick={() => onHelpful(answer.id)}
              className={cn(
                "flex items-center gap-1.5 text-xs font-medium rounded-md px-2.5 py-1.5 transition-colors",
                answer.userHelpful
                  ? "bg-primary/12 text-primary"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <ThumbsUp className="h-3.5 w-3.5" />
              Helpful {answer.helpful}
            </button>
            {canVerify && !answer.verified && (
              <button
                onClick={() => onVerify(answer.id)}
                className="flex items-center gap-1.5 text-xs font-medium rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-success/10 hover:text-success transition-colors"
              >
                <ShieldCheck className="h-3.5 w-3.5" />
                Mark as Verified
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function DoubtThread({ doubt, canVerify, onVerify, onHelpful, onToggle }: {
  doubt: DoubtQuestion;
  canVerify: boolean;
  onVerify: (dId: string, aId: string) => void;
  onHelpful: (dId: string, aId: string) => void;
  onToggle: (dId: string) => void;
}) {
  const [sort, setSort] = useState<SortMode>("verified");

  const sortedAnswers = [...doubt.answers].sort((a, b) => {
    if (sort === "verified") return (b.verified ? 1 : 0) - (a.verified ? 1 : 0);
    if (sort === "helpful") return b.helpful - a.helpful;
    return 0; // newest = original order
  });

  const verifiedCount = doubt.answers.filter(a => a.verified).length;
  const totalHelpful = doubt.answers.reduce((s, a) => s + a.helpful, 0);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <button
        className="w-full flex items-start gap-3 px-4 py-4 text-left hover:bg-surface-2/30 transition-colors"
        onClick={() => onToggle(doubt.id)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className="text-[11px]">{doubt.subject}</Badge>
            {verifiedCount > 0 && <Badge variant="success" className="text-[11px]">✓ Verified</Badge>}
          </div>
          <p className="mt-1.5 text-sm font-semibold leading-snug">{doubt.title}</p>
          <p className="mt-0.5 text-xs text-muted-foreground">
            Asked by {doubt.author} · {doubt.createdAt} · {doubt.answers.length} answers · {totalHelpful} helpful votes
          </p>
        </div>
        <div className="shrink-0 mt-0.5">
          {doubt.expanded ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
        </div>
      </button>

      <AnimatePresence>
        {doubt.expanded && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border"
          >
            <div className="px-4 py-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{doubt.answers.length} Answers</p>
                <div className="flex items-center gap-0.5">
                  {(["helpful", "verified", "newest"] as SortMode[]).map(s => (
                    <button
                      key={s}
                      onClick={() => setSort(s)}
                      className={cn(
                        "px-2.5 py-1 rounded-md text-xs font-medium capitalize transition-colors",
                        sort === s ? "bg-surface-3 text-foreground" : "text-muted-foreground hover:bg-surface-2"
                      )}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
              {sortedAnswers.map(answer => (
                <AnswerCard
                  key={answer.id}
                  answer={answer}
                  canVerify={canVerify}
                  onVerify={(aId) => onVerify(doubt.id, aId)}
                  onHelpful={(aId) => onHelpful(doubt.id, aId)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export default function DoubtsPage() {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState<DoubtQuestion[]>(INITIAL_DOUBTS);
  const isFaculty = user?.role === "faculty";

  function handleToggle(dId: string) {
    setDoubts(prev => prev.map(d => d.id === dId ? { ...d, expanded: !d.expanded } : d));
  }

  function handleVerify(dId: string, aId: string) {
    setDoubts(prev => prev.map(d =>
      d.id === dId
        ? { ...d, answers: d.answers.map(a => a.id === aId ? { ...a, verified: true } : a) }
        : d
    ));
  }

  function handleHelpful(dId: string, aId: string) {
    setDoubts(prev => prev.map(d =>
      d.id === dId
        ? {
          ...d, answers: d.answers.map(a =>
            a.id === aId
              ? { ...a, helpful: a.userHelpful ? a.helpful - 1 : a.helpful + 1, userHelpful: !a.userHelpful }
              : a
          )
        }
        : d
    ));
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow={isFaculty ? "Faculty · Doubts" : "Student · Doubts"}
          title="Doubt Threads"
          description={isFaculty
            ? "Answer student questions and mark the best responses as verified."
            : "Ask questions and upvote helpful answers. Verified answers appear at the top."}
          actions={!isFaculty && (
            <Button size="sm">Ask a Question</Button>
          )}
        />
        <div className="space-y-4">
          {doubts.map(doubt => (
            <DoubtThread
              key={doubt.id}
              doubt={doubt}
              canVerify={isFaculty}
              onVerify={handleVerify}
              onHelpful={handleHelpful}
              onToggle={handleToggle}
            />
          ))}
        </div>
      </div>
    </PageTransition>
  );
}
