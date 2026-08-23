export type DoubtAuthorRole = "student" | "faculty";

export interface DoubtAnswer {
  id: string;
  author: string;
  authorRole: DoubtAuthorRole;
  body: string;
  createdAt: string;
  votes: number;
  /** Whether the signed-in demo user has upvoted this answer. */
  votedByMe: boolean;
  /** Faculty-verified answer — at most one per thread. */
  verified: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
}

export interface Doubt {
  id: string;
  code: string;
  subject: string;
  title: string;
  body: string;
  author: string;
  authorRole: DoubtAuthorRole;
  createdAt: string;
  tags: string[];
  views: number;
  answers: DoubtAnswer[];
  /** True once an answer carries the verified badge. */
  resolved: boolean;
}

export interface DoubtDraft {
  code: string;
  title: string;
  body: string;
  tags?: string[];
}

export interface AnswerDraft {
  doubtId: string;
  body: string;
}

export interface DoubtsView {
  doubts: Doubt[];
  subjects: { code: string; name: string }[];
  stats: {
    total: number;
    verified: number;
    awaiting: number;
  };
}
