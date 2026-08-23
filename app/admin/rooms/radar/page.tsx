"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, CheckCircle2, ChevronLeft, ChevronRight, X } from "lucide-react";
import { PageTransition } from "@/components/common/page-transition";
import { PageHeader } from "@/components/common/page-header";
import { Button } from "@/components/ui/button";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/utils/cn";

const ROOMS = ["Room 101", "Room 102", "Lab 201", "Lab 202", "Lab 204", "Seminar Hall"];
const SLOTS = ["9:00", "10:00", "11:00", "12:00", "13:00", "14:00", "15:00", "16:00"];

interface ClassSlot {
  subject: string;
  dept: string;
  div: string;
}

type Schedule = Record<string, Record<string, ClassSlot | null>>;

const BASE_SCHEDULE: Schedule = {
  "Room 101":    { "9:00": { subject: "Data Structures", dept: "CE", div: "A" }, "10:00": null, "11:00": { subject: "Computer Networks", dept: "IT", div: "B" }, "12:00": null, "13:00": null, "14:00": { subject: "Web Development", dept: "CE", div: "A" }, "15:00": null, "16:00": null },
  "Room 102":    { "9:00": null, "10:00": { subject: "DBMS", dept: "IT", div: "A" }, "11:00": null, "12:00": null, "13:00": { subject: "Algorithms", dept: "CE", div: "B" }, "14:00": null, "15:00": { subject: "Software Engg.", dept: "CE", div: "A" }, "16:00": null },
  "Lab 201":     { "9:00": null, "10:00": null, "11:00": null, "12:00": { subject: "Network Lab", dept: "CE", div: "A" }, "13:00": null, "14:00": null, "15:00": { subject: "OS Lab", dept: "IT", div: "B" }, "16:00": null },
  "Lab 202":     { "9:00": { subject: "Programming Lab", dept: "CE", div: "B" }, "10:00": null, "11:00": null, "12:00": null, "13:00": null, "14:00": { subject: "AI/ML Lab", dept: "CE", div: "A" }, "15:00": null, "16:00": null },
  "Lab 204":     { "9:00": null, "10:00": null, "11:00": { subject: "Microprocessor", dept: "CE", div: "B" }, "12:00": null, "13:00": null, "14:00": null, "15:00": null, "16:00": { subject: "Embedded Lab", dept: "CE", div: "A" } },
  "Seminar Hall":{ "9:00": null, "10:00": null, "11:00": null, "12:00": null, "13:00": { subject: "Guest Lecture", dept: "All", div: "—" }, "14:00": null, "15:00": null, "16:00": null },
};

interface SimulateState {
  room: string;
  slot: string;
  subject: string;
}

export default function RoomClashRadarPage() {
  const [schedule] = useState<Schedule>(BASE_SCHEDULE);
  const [simulate, setSimulate] = useState<SimulateState>({ room: "Lab 204", slot: "11:00", subject: "Operating Systems" });
  const [showPanel, setShowPanel] = useState(false);
  const [saved, setSaved] = useState(false);

  const simRoom = simulate.room;
  const simSlot = simulate.slot;
  const existingClass = schedule[simRoom]?.[simSlot];
  const isConflict = !!existingClass;

  function handleSave() {
    if (isConflict) return;
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <PageTransition>
      <div className="space-y-6">
        <PageHeader
          eyebrow="Admin · Rooms"
          title="Room Clash Radar"
          description="Weekly occupancy matrix with live conflict detection. Identify scheduling clashes before they happen."
          actions={
            <Button size="sm" onClick={() => setShowPanel(v => !v)}>
              {showPanel ? <X className="h-4 w-4" /> : null}
              {showPanel ? "Close" : "Simulate Reschedule"}
            </Button>
          }
        />

        <AnimatePresence>
          {showPanel && (
            <motion.div
              initial={{ opacity: 0, y: -8, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -8, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="rounded-xl border border-border bg-card p-5 space-y-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">Simulate a rescheduled lecture</p>
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Room</label>
                      <Select value={simulate.room} onChange={e => setSimulate(s => ({ ...s, room: e.target.value }))}>
                        {ROOMS.map(r => <option key={r}>{r}</option>)}
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-medium text-muted-foreground">Time Slot</label>
                      <Select value={simulate.slot} onChange={e => setSimulate(s => ({ ...s, slot: e.target.value }))}>
                        {SLOTS.map(sl => <option key={sl}>{sl}</option>)}
                      </Select>
                    </div>
                    <div className="space-y-1.5 sm:col-span-2">
                      <label className="text-xs font-medium text-muted-foreground">Subject</label>
                      <input
                        className="w-full rounded-lg border border-border bg-card px-3 py-2 text-sm outline-none focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                        value={simulate.subject}
                        onChange={e => setSimulate(s => ({ ...s, subject: e.target.value }))}
                        placeholder="Subject name"
                      />
                    </div>
                  </div>
                </div>
                <div className={cn(
                  "flex items-start gap-3 rounded-lg border px-4 py-3 text-sm",
                  isConflict
                    ? "border-destructive/30 bg-destructive/8 text-destructive"
                    : "border-success/30 bg-success/8 text-success"
                )}>
                  {isConflict ? (
                    <>
                      <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">Room conflict at {simSlot} in {simRoom}</p>
                        <p className="mt-0.5 text-xs opacity-80">
                          Already occupied by: <strong>{existingClass!.subject}</strong> — {existingClass!.dept} {existingClass!.div}
                        </p>
                        <p className="mt-1 text-xs opacity-70">Choose a different room or time slot before saving.</p>
                      </div>
                    </>
                  ) : (
                    <>
                      <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
                      <div>
                        <p className="font-semibold">{simRoom} is available at {simSlot}</p>
                        <p className="mt-0.5 text-xs opacity-80">No conflicts detected. You can save this lecture.</p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="ghost" size="sm" onClick={() => setShowPanel(false)}>Cancel</Button>
                  <Button size="sm" disabled={isConflict} onClick={handleSave} variant={saved ? "success" : "default"}>
                    {saved ? <><CheckCircle2 className="h-4 w-4" />Saved</> : "Save Lecture"}
                  </Button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-surface-2 border border-border" /> Available</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-primary/15 border border-primary/30" /> Occupied</span>
          <span className="flex items-center gap-1.5"><span className="h-3 w-3 rounded-sm bg-destructive/15 border border-destructive/30" /> Conflict</span>
        </div>

        {/* Matrix */}
        <div className="overflow-x-auto rounded-xl border border-border">
          <table className="w-full border-collapse text-sm" style={{ minWidth: 700 }}>
            <thead>
              <tr className="border-b border-border bg-surface-2/60">
                <th className="sticky left-0 bg-surface-2/80 backdrop-blur-sm px-4 py-2.5 text-left text-xs font-semibold text-muted-foreground w-32">Room</th>
                {SLOTS.map(slot => (
                  <th key={slot} className="px-2 py-2.5 text-center text-xs font-semibold text-muted-foreground w-[10%]">{slot}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROOMS.map((room, ri) => (
                <tr key={room} className={cn("border-b border-border/60 last:border-0", ri % 2 === 1 && "bg-surface-2/20")}>
                  <td className="sticky left-0 bg-card px-4 py-2 text-xs font-semibold border-r border-border/60" style={{ background: ri % 2 === 1 ? "var(--color-surface-2)" : "var(--color-card)" }}>
                    {room}
                  </td>
                  {SLOTS.map(slot => {
                    const cls = schedule[room]?.[slot];
                    const isSimCell = showPanel && room === simRoom && slot === simSlot;
                    const isClashCell = isSimCell && isConflict;
                    return (
                      <td key={slot} className="px-1.5 py-1.5 text-center align-top">
                        {cls ? (
                          <div className={cn(
                            "rounded-md border px-2 py-1.5 text-left",
                            isClashCell
                              ? "border-destructive/40 bg-destructive/12"
                              : "border-primary/25 bg-primary/10"
                          )}>
                            {isClashCell && (
                              <p className="text-[10px] font-semibold text-destructive flex items-center gap-0.5 mb-0.5">
                                <AlertTriangle className="h-3 w-3" /> Conflict
                              </p>
                            )}
                            <p className="text-[11px] font-semibold leading-tight text-foreground">{cls.subject}</p>
                            <p className="text-[10px] text-muted-foreground mt-0.5">{cls.dept} • {cls.div}</p>
                          </div>
                        ) : isSimCell && !isConflict ? (
                          <div className="rounded-md border border-success/30 bg-success/8 px-2 py-1.5 text-left">
                            <p className="text-[11px] font-semibold leading-tight text-success">{simulate.subject || "New Lecture"}</p>
                            <p className="text-[10px] text-success/70 mt-0.5">Simulated</p>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground/30">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PageTransition>
  );
}
