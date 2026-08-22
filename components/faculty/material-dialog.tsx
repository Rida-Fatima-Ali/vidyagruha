"use client";

import { useState } from "react";
import { LoaderCircle } from "lucide-react";
import { Modal } from "@/components/common/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import type { FacultyMaterialDraft, MaterialKind } from "@/types/faculty";

export interface MaterialDialogProps {
  open: boolean;
  subjects: { code: string; subject: string }[];
  busy: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (input: FacultyMaterialDraft) => Promise<boolean>;
}

const KINDS: { value: MaterialKind; label: string }[] = [
  { value: "notes", label: "Notes" },
  { value: "slides", label: "Slides" },
  { value: "question-paper", label: "Question paper" },
  { value: "lab-manual", label: "Lab manual" },
  { value: "assignment", label: "Assignment" },
  { value: "reference", label: "Reference" },
];

export function MaterialDialog({
  open,
  subjects,
  busy,
  error,
  onClose,
  onSubmit,
}: MaterialDialogProps) {
  const [code, setCode] = useState(subjects[0]?.code ?? "");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [kind, setKind] = useState<MaterialKind>("notes");
  const [fileName, setFileName] = useState("");
  const [sizeKb, setSizeKb] = useState(256);
  const [pages, setPages] = useState(8);
  const [formError, setFormError] = useState<string | null>(null);

  async function handleSubmit(): Promise<void> {
    setFormError(null);
    if (!code || !title.trim() || !fileName.trim()) {
      setFormError("Choose a subject, add a title and a file name.");
      return;
    }
    const ok = await onSubmit({
      code,
      title: title.trim(),
      description: description.trim(),
      kind,
      fileName: fileName.trim(),
      sizeKb: Math.max(1, Math.round(sizeKb)),
      pages: Math.max(1, Math.round(pages)),
    });
    if (ok) {
      setTitle("");
      setDescription("");
      setFileName("");
      setFormError(null);
      onClose();
    }
  }

  return (
    <Modal
      open={open}
      title="Upload material"
      eyebrow="Share with your class"
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
            Upload
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <div className="space-y-1.5">
          <Label htmlFor="mat-subject">Subject</Label>
          <Select
            id="mat-subject"
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
          <Label htmlFor="mat-title">Title</Label>
          <Input
            id="mat-title"
            placeholder="e.g. Unit 2 — Lists & Tuples notes"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="mat-description">Description (optional)</Label>
          <textarea
            id="mat-description"
            rows={3}
            placeholder="What does this cover?"
            value={description}
            onChange={(event) => setDescription(event.target.value)}
            className="flex w-full resize-none rounded-lg border border-input bg-card px-3 py-2 text-sm text-foreground shadow-[inset_0_1px_2px_rgb(0_0_0/0.08)] transition-colors duration-150 placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="mat-kind">Kind</Label>
            <Select
              id="mat-kind"
              value={kind}
              onChange={(event) => setKind(event.target.value as MaterialKind)}
            >
              {KINDS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mat-file">File name</Label>
            <Input
              id="mat-file"
              placeholder="python-lab-manual.pdf"
              value={fileName}
              onChange={(event) => setFileName(event.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5">
            <Label htmlFor="mat-size">Size (KB)</Label>
            <Input
              id="mat-size"
              type="number"
              min={1}
              value={sizeKb}
              onChange={(event) => setSizeKb(Number(event.target.value))}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="mat-pages">Pages</Label>
            <Input
              id="mat-pages"
              type="number"
              min={1}
              value={pages}
              onChange={(event) => setPages(Number(event.target.value))}
            />
          </div>
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
