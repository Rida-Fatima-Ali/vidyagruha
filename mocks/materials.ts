import type { FacultyMaterial, FacultyMaterialDraft, MaterialKind } from "@/types/faculty";
import type { StudyMaterial, MaterialKind as StudentMaterialKind } from "@/types/student";
import { ownedByFaculty, subjectName } from "@/services/schedule";
import { DEMO_NOW } from "@/constants/demo";

/**
 * Shared course-materials store. Faculty uploads write here; the student
 * materials page derives from here (student kinds map onto the smaller union).
 */

const MATERIALS: FacultyMaterial[] = [
  {
    id: "m-1",
    title: "Unit 2 — Network Models",
    description: "OSI vs TCP/IP, addressing and encapsulation.",
    kind: "notes",
    code: "CMPN303",
    subject: "CN (Computer Networks)",
    uploadedBy: "Rupali Patil",
    uploadedAt: "2026-08-13T11:00:00",
    fileName: "cn_unit2_network_models.pdf",
    sizeKb: 840,
    pages: 42,
  },
  {
    id: "m-2",
    title: "Unit 3 — Inheritance & Polymorphism",
    description: "Slides for the C++ Unit 3 lectures.",
    kind: "slides",
    code: "CMPN302",
    subject: "C++",
    uploadedBy: "Snehal Suryavanshi",
    uploadedAt: "2026-08-12T09:30:00",
    fileName: "cpp_unit3_inheritance.pdf",
    sizeKb: 610,
    pages: 28,
  },
  {
    id: "m-3",
    title: "8086 Instruction Set Reference",
    description: "Quick reference for the 8086 instruction set.",
    kind: "notes",
    code: "CMPN304",
    subject: "Microprocessor",
    uploadedBy: "Charulata Ingle",
    uploadedAt: "2026-08-11T14:00:00",
    fileName: "8086_instruction_set.pdf",
    sizeKb: 720,
    pages: 36,
  },
  {
    id: "m-4",
    title: "Sem 3 IA 1 Question Paper (2025)",
    description: "Previous year IA paper for practice.",
    kind: "question-paper",
    code: "CMPN302",
    subject: "C++",
    uploadedBy: "Department Office",
    uploadedAt: "2026-08-10T10:00:00",
    fileName: "ia1_cpp_2025.pdf",
    sizeKb: 210,
    pages: 4,
  },
  {
    id: "m-5",
    title: "Python Lab Manual — Cycle 2",
    description: "Cycle 2 experiments 5–8 with expected outputs.",
    kind: "lab-manual",
    code: "CMPN309",
    subject: "Python Lab",
    uploadedBy: "Varsha Kinge",
    uploadedAt: "2026-08-08T16:00:00",
    fileName: "python_lab_cycle2_manual.pdf",
    sizeKb: 390,
    pages: 18,
  },
  {
    id: "m-6",
    title: "Linux Administration — Command Reference",
    description: "Shell + system admin command cheatsheet.",
    kind: "notes",
    code: "CMPN307",
    subject: "LAN (Linux Administrator)",
    uploadedBy: "Niti Patel",
    uploadedAt: "2026-08-06T12:00:00",
    fileName: "lan_command_reference.pdf",
    sizeKb: 540,
    pages: 24,
  },
  {
    id: "m-7",
    title: "Constitution of India — Unit 1 & 2 Notes",
    description: "Notes covering preamble, rights and duties.",
    kind: "notes",
    code: "CMPN305",
    subject: "CL (Constitutional Learning)",
    uploadedBy: "Madhuri",
    uploadedAt: "2026-08-05T10:00:00",
    fileName: "cl_units_1_2_notes.pdf",
    sizeKb: 460,
    pages: 20,
  },
];

export function getFacultyMaterials(facultyName: string): FacultyMaterial[] {
  return MATERIALS.filter((material) => ownedByFaculty(material.code, facultyName)).map(
    (material) => ({ ...material }),
  );
}

export function getStudentMaterials(): StudyMaterial[] {
  return MATERIALS.map((material) => ({
    id: material.id,
    title: material.title,
    kind: toStudentKind(material.kind),
    subject: material.subject,
    code: material.code,
    uploadedBy: material.uploadedBy,
    uploadedAt: material.uploadedAt,
    pages: material.pages,
    sizeKb: material.sizeKb,
  }));
}

export function createMaterial(
  input: FacultyMaterialDraft,
  facultyName: string,
): FacultyMaterial {
  const material: FacultyMaterial = {
    id: `m-${Date.now().toString(36)}`,
    title: input.title.trim(),
    description: input.description.trim(),
    kind: input.kind,
    code: input.code,
    subject: subjectName(input.code) ?? input.code,
    uploadedBy: facultyName,
    uploadedAt: DEMO_NOW.toISOString(),
    fileName: input.fileName.trim(),
    sizeKb: input.sizeKb,
    pages: input.pages,
  };
  MATERIALS.unshift(material);
  return { ...material };
}

function toStudentKind(kind: MaterialKind): StudentMaterialKind {
  if (kind === "reference" || kind === "assignment") return "notes";
  return kind;
}
