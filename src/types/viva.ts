export type VivaDifficulty =
  | "Easy"
  | "Medium"
  | "Hard";

export type VivaAnswerQuality =
  | "Correct"
  | "Partially Correct"
  | "Incorrect"
  | "Not Evaluated";

export interface VivaQuestion {
  id: string;
  experimentId: string;
  question: string;
  difficulty: VivaDifficulty;
  expectedConcepts: string[];
  followUpQuestion?: string;
}

export interface VivaAnswer {
  questionId: string;
  answer: string;
  quality: VivaAnswerQuality;
  score: number;
  feedback: string;
}

export interface VivaSession {
  id: string;
  experimentId: string;
  startedAt: string;
  endedAt?: string;
  currentQuestionIndex: number;
  totalQuestions: number;
  answers: VivaAnswer[];
  score: number;
  maxScore: number;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

export interface VivaRubric {
  conceptualAccuracy: number;
  reasoning: number;
  terminology: number;
  clarity: number;
  overall: number;
}