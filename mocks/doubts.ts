import { ACADEMIC_SUBJECTS } from "@/mocks/academic";
import { DEMO_NOW } from "@/constants/demo";
import type { AnswerDraft, Doubt, DoubtAnswer, DoubtDraft } from "@/types/doubts";
import type { AuthUser } from "@/types/auth";

/**
 * Runtime doubt store. Threads are Stack Overflow shaped — many answers, peer
 * upvotes, and at most one faculty-verified answer that turns the thread into a
 * reusable knowledge-base entry.
 */

function subjectName(code: string): string {
  return ACADEMIC_SUBJECTS.find((subject) => subject.code === code)?.name ?? code;
}

function iso(minutesAgo: number): string {
  return new Date(DEMO_NOW.getTime() - minutesAgo * 60_000).toISOString();
}

let answerSeq = 0;

function answer(
  author: string,
  authorRole: DoubtAnswer["authorRole"],
  body: string,
  minutesAgo: number,
  votes: number,
  verified?: { by: string; minutesAgo: number },
): DoubtAnswer {
  answerSeq += 1;
  return {
    id: `ans-${String(answerSeq).padStart(3, "0")}`,
    author,
    authorRole,
    body,
    createdAt: iso(minutesAgo),
    votes,
    votedByMe: false,
    verified: Boolean(verified),
    verifiedBy: verified?.by,
    verifiedAt: verified ? iso(verified.minutesAgo) : undefined,
  };
}

const DOUBTS: Doubt[] = [
  {
    id: "dbt-001",
    code: "CMPN304",
    subject: subjectName("CMPN304"),
    title: "Why does the 8086 need a segment register at all?",
    body: "Sir explained segmentation in today's lecture but I still don't get why a 16-bit register can't just hold the whole address. What breaks if we drop segments?",
    author: "Ananya Deshpande",
    authorRole: "student",
    createdAt: iso(320),
    tags: ["8086", "memory", "segmentation"],
    views: 84,
    resolved: true,
    answers: [
      answer(
        "Rohan Kulkarni",
        "student",
        "Because a 16-bit register can only address 64 KB. The 8086 has a 20-bit address bus (1 MB), so it builds the physical address as segment × 16 + offset.",
        300,
        7,
      ),
      answer(
        "Varsha Kinge",
        "faculty",
        "Exactly right, and one addition worth remembering for the exam: physical address = (segment << 4) + offset. Segments also let the same program be loaded anywhere in memory without recompiling — relocation comes for free.",
        280,
        14,
        { by: "Varsha Kinge", minutesAgo: 275 },
      ),
      answer(
        "Kunal Patil",
        "student",
        "Draw the 20-bit sum on paper once, it clicks immediately.",
        240,
        2,
      ),
    ],
  },
  {
    id: "dbt-002",
    code: "CMPN303",
    subject: subjectName("CMPN303"),
    title: "TCP vs UDP — which one for the streaming assignment?",
    body: "The assignment says 'choose an appropriate transport protocol and justify'. Is UDP always the answer for video?",
    author: "Kabir Shah",
    authorRole: "student",
    createdAt: iso(190),
    tags: ["transport-layer", "assignment"],
    views: 51,
    resolved: false,
    answers: [
      answer(
        "Divya Rao",
        "student",
        "UDP for the media stream because retransmitting a late frame is useless, but you still need TCP (or a control channel) for signalling. Say both in the justification.",
        150,
        5,
      ),
      answer(
        "Aditya Sharma",
        "student",
        "I wrote only UDP last year and lost marks for ignoring congestion control.",
        120,
        1,
      ),
    ],
  },
  {
    id: "dbt-003",
    code: "CMPN302",
    subject: subjectName("CMPN302"),
    title: "Deep copy vs shallow copy in the copy constructor",
    body: "My program crashes on exit when the class has a char* member. It works fine if I remove the copy constructor.",
    author: "Ishita Verma",
    authorRole: "student",
    createdAt: iso(95),
    tags: ["c++", "constructors", "memory"],
    views: 37,
    resolved: false,
    answers: [
      answer(
        "Siddharth Joshi",
        "student",
        "Double free. The default copy constructor copies the pointer, so both objects delete the same buffer. Allocate a new buffer and strcpy into it.",
        70,
        4,
      ),
    ],
  },
  {
    id: "dbt-004",
    code: "CMPN307",
    subject: subjectName("CMPN307"),
    title: "chmod 755 vs 644 — when do I use which?",
    body: "For the lab submission, which permission should the script and the config file have?",
    author: "Neha Bhatt",
    authorRole: "student",
    createdAt: iso(45),
    tags: ["linux", "permissions", "lab"],
    views: 22,
    resolved: false,
    answers: [],
  },
];

export function getDoubts(): Doubt[] {
  return DOUBTS.map((doubt) => ({ ...doubt, answers: doubt.answers.map((a) => ({ ...a })) }));
}

export function findDoubt(id: string): Doubt | undefined {
  return DOUBTS.find((doubt) => doubt.id === id);
}

export function createDoubt(user: AuthUser, draft: DoubtDraft): Doubt {
  const doubt: Doubt = {
    id: `dbt-${Date.now().toString(36)}`,
    code: draft.code,
    subject: subjectName(draft.code),
    title: draft.title,
    body: draft.body,
    author: user.name,
    authorRole: user.role === "faculty" ? "faculty" : "student",
    createdAt: DEMO_NOW.toISOString(),
    tags: draft.tags ?? [],
    views: 0,
    answers: [],
    resolved: false,
  };
  DOUBTS.unshift(doubt);
  return doubt;
}

export function addAnswer(user: AuthUser, draft: AnswerDraft): Doubt | undefined {
  const doubt = findDoubt(draft.doubtId);
  if (!doubt) return undefined;
  answerSeq += 1;
  doubt.answers.push({
    id: `ans-${String(answerSeq).padStart(3, "0")}`,
    author: user.name,
    authorRole: user.role === "faculty" ? "faculty" : "student",
    body: draft.body,
    createdAt: DEMO_NOW.toISOString(),
    votes: 0,
    votedByMe: false,
    verified: false,
  });
  return doubt;
}

/** Toggling is idempotent per demo user — one vote each, take-backs allowed. */
export function toggleVote(doubtId: string, answerId: string): Doubt | undefined {
  const doubt = findDoubt(doubtId);
  const target = doubt?.answers.find((item) => item.id === answerId);
  if (!doubt || !target) return undefined;
  target.votedByMe = !target.votedByMe;
  target.votes += target.votedByMe ? 1 : -1;
  return doubt;
}

/** Marks one answer as the verified one; any previous verification is cleared. */
export function verifyAnswer(
  doubtId: string,
  answerId: string,
  facultyName: string,
): Doubt | undefined {
  const doubt = findDoubt(doubtId);
  const target = doubt?.answers.find((item) => item.id === answerId);
  if (!doubt || !target) return undefined;
  const wasVerified = target.verified;
  for (const item of doubt.answers) {
    item.verified = false;
    item.verifiedBy = undefined;
    item.verifiedAt = undefined;
  }
  if (!wasVerified) {
    target.verified = true;
    target.verifiedBy = facultyName;
    target.verifiedAt = DEMO_NOW.toISOString();
  }
  doubt.resolved = doubt.answers.some((item) => item.verified);
  return doubt;
}
