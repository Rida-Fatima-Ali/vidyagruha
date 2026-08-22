"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { FacultyAssignmentDraft, FacultyMaterial } from "@/types/faculty";

export interface AssignmentDialogProps {
  open: boolean;
  subjects: { code: string; subject: string }[];
  materials: FacultyMaterial[];
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: FacultyAssignmentDraft) => Promise<boolean>;
}

export function AssignmentDialog({
  open,
  subjects,
  materials,
  busy,
  error,
  onClose,
  onSubmit,
}: AssignmentDialogProps) {
  const [code, setCode] = useState(subjects[0]?.code ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("2026-08-18T17:00");
  const [maxMarks, setMaxMarks] = useState(10);
  const [attachedMaterial, setAttachedMaterial] = useState("");
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(): Promise<void> {
    setFormError(null);
    if (!code || !title.trim() || !dueDate) {
      setFormError("Choose a subject, add a title and pick a deadline.");
      return;
    }
    const ok = await onSubmit({
      code,
      title: title.trim(),
      description: description.trim(),
      dueDate,
      attachedMaterial: attachedMaterial || undefined,
      maxMarks,
    });
    if (ok) {
      setTitle("");
      setDescription("");
      setFormError(null);
      onClose();
    }
  }

  return (
    <Modal
      open={open}
      title="New assignment"
      eyebrow="Publish to your class"
      onClose={onClose}
      footer={
        <>
          <Button variant="ghost" size="sm" onClick={onClose} disabled={busy}>
            Cancel
          </Button>
          <Button size="sm" disabled={busy} onClick={() => void handleSubmit()}>
            {busy ? (
              <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : null}
            Publish
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="asg-code">Subject</Label>
          <Select
            id="asg-code"
            value={code}
            onChange={(event) => setCode(event.target.value)}
          >
            {subjects.map((subject) => (
              <option key={subject.code} value={subject.code}>
                {subject.subject} · {subject.code}
              </option>
            ))}
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="asg-title">Title</Label>
          <Input
            id="asg-title"
            placeholder="e.g. Experiment 7 — Exception Handling"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="asg-description">Brief (optional)</Label>
          <textarea
            id="asg-description"
            rows={3}
            placeholder="What should students submit?"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="flex w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-[inset_0_1px_2px_rgb(0_0_0/0.08)] transition-colors duration-150 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="asg-due">Deadline</Label>
            <Input
              id="asg-due"
              type="datetime-local"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="asg-marks">Max marks</Label>
            <Input
              id="asg-marks"
              type="number"
              min={1}
              value={maxMarks}
              onChange={(event) => setMaxMarks(Number(event.target.value))}
            />
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="asg-material">Attach a material (optional)</Label>
          <Select
            id="asg-material"
            value={attachedMaterial}
            onChange={(event) => setAttachedMaterial(event.target.value)}
          >
            <option value="">None</option>
            {materials.map((material) => (
              <option key={material.id} value={material.id}>
                {material.title}
              </option>
            ))}
          </Select>
        </div>

        {formError ?? error ? (
          <p className="text-sm font-medium text-destructive" role="alert">
            {formError ?? error}
          </p>
        ) : null}
      </div>
    </Modal>
  );
}
