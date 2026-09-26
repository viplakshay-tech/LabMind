export interface StudentProfile {
  id: string;
  name: string;
  rollNumber: string;
  branch: string;
  year: number;
  semester: number;
  avatarInitials: string;
}

export interface StudentMetric {
  label: string;
  value: string;
  unit?: string;
  trend?: number;
  trendLabel?: string;
}

export interface MasteryDomain {
  id: string;
  name: string;
  score: number;
  maxScore: number;
}

export interface ExperimentProgress {
  experimentId: string;
  completed: boolean;
  attempts: number;
  lastScore?: number;
  lastAttemptAt?: string;
}