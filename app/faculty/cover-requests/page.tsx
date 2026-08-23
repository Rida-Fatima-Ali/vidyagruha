"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight, Calendar, CheckCircle2, Clock, Filter,
  LayoutGrid, MapPin, Plus, Users, X
} from "lucide-react";
import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { Panel } from "@/components/common/panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Avatar } from "@/components/ui/avatar";
import { cn } from "@/utils/cn";
import {
  getCoverRequests, addCoverRequest, acceptCoverRequest,
  ELIGIBLE_FACULTY,
  type CoverRequest, type CoverStatus, type EligibleFaculty
} from "@/services/cover-requests";

const FILTERS = [
  { id: "all", label: "All" },
  { id: "today", label: "Today" },
  { id: "tomorrow", label: "Tomorrow" },
  { id: "open", label: "Open" },
  { id: "mine", label: "My Requests" },
] as const;

const STATUS_MAP: Record<CoverStatus, { label: string; variant: "success" | "warning" | "secondary" }> = {
  open: { label: "Open", variant: "warning" },
  claimed: { label: "Claimed", variant: "secondary" },
  confirmed: { label: "Confirmed", variant: "success" },
};

const STATUS_DOT: Record<EligibleFaculty["status"], string> = {
  available: "bg-success",
  "in-class": "bg-warning",
  busy: "bg-muted-foreground",
};

function StatusBadge({ status }: { status: CoverStatus }) {
  const { label, variant } = STATUS_MAP[status];
  return <Badge variant={variant}>{label}</Badge>;
}

function FacultyCard({
  faculty, requestId, onAccept,
}: {
  faculty: EligibleFaculty;
  requestId: string;
  onAccept: (fName: string) => void;
}) {
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3">
      <div className="relative shrink-0">
        <Avatar name={faculty.name} size="sm" />
        <span
          className={cn("absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full ring-2 ring-card", STATUS_DOT[faculty.status])}
          title={faculty.status}
        />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium leading-tight">{faculty.name}</p>
        <p className="mt-0.5 text-xs text-muted-foreground">{faculty.designation} · {faculty.dept}</p>
        <div className="mt-1 flex flex-wrap gap-1">
          {faculty.subjects.slice(0, 2).map((s) => (
            <span key={s} className="rounded bg-surface-2 px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">{s}</span>
          ))}
        </div>
      </div>
      <div className="shrink-0 text-right">
        <p className="text-xs text-muted-foreground mb-1.5">Free at {faculty.availableAt}</p>
        {faculty.status === "available" ? (
          <Button
            size="sm"
            variant={confirming ? "success" : "default"}
            onClick={() => {
              setConfirming(true);
              setTimeout(() => onAccept(faculty.name), 400);
            }}
            disabled={confirming}
          >
            {confirming ? <CheckCircle2 className="h-3.5 w-3.5" /> : null}
            Accept Cover
          </Button>
        ) : (
          <span className="text-xs text-muted-foreground italic">Unavailable</span>
        )}
      </div>
    </div>
  );
}

function CoverRequestCard({
  req, onAccept
}: { req: CoverRequest; onAccept: (id: string, name: string) => void }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div
        className="flex items-start gap-3 px-4 py-3.5 cursor-pointer hover:bg-surface-2/40 transition-colors"
        onClick={() => setExpanded(v => !v)}
      >
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="text-sm font-semibold">{req.subject}</p>
            <StatusBadge status={req.status} />
            {req.status === "open" && (
              <span className="flex h-1.5 w-1.5 rounded-full bg-warning animate-pulse" />
            )}
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">
            {req.requestedBy} · {req.year} · {req.division}
          </p>
          <div className="mt-1.5 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{req.time}–{req.timeEnd}</span>
            <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{req.room}</span>
            <span className="flex items-center gap-1"><Calendar className="h-3.5 w-3.5" />{req.date}</span>
          </div>
          {req.claimedBy && (
            <p className="mt-1.5 text-xs font-medium text-success flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5" />
              {req.claimedBy} covering this
            </p>
          )}
        </div>
        <ArrowRight className={cn("h-4 w-4 text-muted-foreground shrink-0 mt-0.5 transition-transform", expanded && "rotate-90")} />
      </div>

      <AnimatePresence>
        {expanded && req.status === "open" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="overflow-hidden border-t border-border"
          >
            <div className="px-4 py-3 space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">Available faculty in your department</p>
              {ELIGIBLE_FACULTY.map(f => (
                <FacultyCard
                  key={f.id}
                  faculty={f}
                  requestId={req.id}
                  onAccept={(name) => onAccept(req.id, name)}
                />
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function PostCoverForm({ onCancel, onPost }: { onCancel: () => void; onPost: () => void }) {
  const [subject, setSubject] = useState("");
  const [year, setYear] = useState("Second Year");
  const [division, setDivision] = useState("Division A");
  const [room, setRoom] = useState("");
  const [date, setDate] = useState("Today");
  const [time, setTime] = useState("11:00 AM");
  const [timeEnd, setTimeEnd] = useState("12:00 PM");
  const [posted, setPosted] = useState(false);

  function handlePost() {
    if (!subject.trim() || !room.trim()) return;
    addCoverRequest({ subject, year, division, room, date, time, timeEnd, requestedBy: "Prof. Vikram Joshi", requestedByDept: "Computer Engineering" });
    setPosted(true);
    setTimeout(() => { onPost(); }, 1500);
  }

  if (posted) {
    return (
      <div className="flex flex-col items-center justify-center py-8 gap-3 text-center">
        <CheckCircle2 className="h-8 w-8 text-success" />
        <p className="font-semibold text-sm">Cover request is live</p>
        <p className="text-xs text-muted-foreground">Eligible faculty from your department have been notified.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 p-1">
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label htmlFor="cr-subject">Subject</Label>
          <Input id="cr-subject" placeholder="e.g. Microprocessor" value={subject} onChange={e => setSubject(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cr-room">Room</Label>
          <Input id="cr-room" placeholder="e.g. Lab 204" value={room} onChange={e => setRoom(e.target.value)} />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cr-year">Year</Label>
          <Select id="cr-year" value={year} onChange={e => setYear(e.target.value)}>
            <option>Second Year</option>
            <option>Third Year</option>
            <option>Final Year</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cr-division">Division</Label>
          <Select id="cr-division" value={division} onChange={e => setDivision(e.target.value)}>
            <option>Division A</option>
            <option>Division B</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="cr-date">Date</Label>
          <Select id="cr-date" value={date} onChange={e => setDate(e.target.value)}>
            <option>Today</option>
            <option>Tomorrow</option>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label>Time</Label>
          <div className="flex items-center gap-2">
            <Select value={time} onChange={e => setTime(e.target.value)} className="flex-1">
              {["08:00 AM","09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM"].map(t => <option key={t}>{t}</option>)}
            </Select>
            <span className="text-xs text-muted-foreground">to</span>
            <Select value={timeEnd} onChange={e => setTimeEnd(e.target.value)} className="flex-1">
              {["09:00 AM","10:00 AM","11:00 AM","12:00 PM","01:00 PM","02:00 PM","03:00 PM","04:00 PM","05:00 PM"].map(t => <option key={t}>{t}</option>)}
            </Select>
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end gap-2 pt-2">
        <Button variant="ghost" size="sm" onClick={onCancel}>Cancel</Button>
        <Button size="sm" onClick={handlePost} disabled={!subject.trim() || !room.trim()}>
          Post Cover Request
        </Button>
      </div>
    </div>
  );
}

export default function CoverRequestsPage() {
  const [requests, setRequests] = useState<CoverRequest[]>([]);
  const [activeFilter, setActiveFilter] = useState<string>("all");
  const [showForm, setShowForm] = useState(false);

  function refresh() {
    setRequests(getCoverRequests());
  }

  useEffect(() => { refresh(); }, []);

  function handleAccept(id: string, name: string) {
    acceptCoverRequest(id, name);
    refresh();
  }

  const filtered = requests.filter(r => {
    if (activeFilter === "today") return r.date === "Today";
    if (activeFilter === "tomorrow") return r.date === "Tomorrow";
    if (activeFilter === "open") return r.status === "open";
    if (activeFilter === "mine") return r.requestedBy.includes("Vikram");
    return true;
  });

  const openCount = requests.filter(r => r.status === "open").length;

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Faculty · Cover Requests"
          title="Cover Request Marketplace"
          description="Post a cover request and find available colleagues from your department in seconds."
          actions={
            <div className="flex items-center gap-2">
              {openCount > 0 && <Badge variant="warning">{openCount} open</Badge>}
              <Button size="sm" onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4" />
                Post Cover Request
              </Button>
            </div>
          }
        />

        <AnimatePresence>
          {showForm && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <Panel title="New Cover Request" description="Fill in your lecture details. Eligible faculty from your department will be shown.">
                <div className="p-5">
                  <PostCoverForm onCancel={() => setShowForm(false)} onPost={() => { setShowForm(false); refresh(); }} />
                </div>
              </Panel>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
          <Filter className="h-4 w-4 text-muted-foreground shrink-0" />
          {FILTERS.map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={cn(
                "shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors",
                activeFilter === f.id
                  ? "bg-primary text-primary-foreground"
                  : "text-muted-foreground hover:bg-surface-2 hover:text-foreground"
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <div className="rounded-xl border border-border bg-card px-5 py-10 text-center">
              <LayoutGrid className="mx-auto h-8 w-8 text-muted-foreground/40 mb-3" />
              <p className="text-sm font-medium">No requests found</p>
              <p className="mt-1 text-xs text-muted-foreground">Post a new request to get started.</p>
            </div>
          ) : (
            filtered.map(req => (
              <CoverRequestCard key={req.id} req={req} onAccept={handleAccept} />
            ))
          )}
        </div>
      </div>
    </PageTransition>
  );
}
