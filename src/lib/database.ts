import { supabase } from "@/lib/supabase";

export interface StudentRecord {
  id: string;
  name: string;
  email: string | null;
  roll_number: string | null;
  created_at: string;
}

export interface ExperimentRecord {
  id: string;
  code: string;
  title: string;
  category: string | null;
  created_at: string;
}

export interface ExperimentSessionRecord {
  id: string;
  student_id: string;
  experiment_id: string;
  inputs: Record<string, number>;
  expected_outputs: Record<string, number>;
  observed_outputs: Record<string, number>;
  status: "started" | "completed" | "fault";
  score: number | null;
  notes: string | null;
  started_at: string;
  completed_at: string | null;
}

export interface DiagnosticSessionRecord {
  id: string;
  student_id: string;
  experiment_session_id: string | null;
  experiment_id: string | null;
  stimulus_vector: string | null;
  expected_outputs: Record<string, number>;
  observed_outputs: Record<string, number>;
  severity: string | null;
  overall_status: string | null;
  confidence_score: number | null;
  active_faults: unknown[];
  hypotheses: unknown[];
  checklist: unknown[];
  ai_analysis: string | null;
  created_at: string;
}

export interface VivaSessionRecord {
  id: string;
  student_id: string;
  experiment_id: string | null;
  question_number: number;
  question: string;
  answer: string | null;
  topic: string | null;
  difficulty: string | null;
  score: number | null;
  max_score: number | null;
  correct: boolean | null;
  feedback: string | null;
  missing_concepts: unknown[];
  ideal_answer: string | null;
  created_at: string;
}

export interface LabReportRecord {
  id: string;
  student_id: string;
  experiment_id: string | null;
  title: string | null;
  content_markdown: string;
  metadata: Record<string, unknown>;
  created_at: string;
}

export interface DashboardStats {
  student: StudentRecord | null;
  totalSessions: number;
  completedSessions: number;
  faultSessions: number;
  averageScore: number;
  recentSessions: ExperimentSessionRecord[];
}

export interface AnalyticsStats {
  totalExperiments: number;
  completedExperiments: number;
  totalExperimentSessions: number;
  averageExperimentScore: number;

  totalDiagnostics: number;
  resolvedDiagnostics: number;
  diagnosticSuccessRate: number;

  totalVivaQuestions: number;
  averageVivaScore: number;

  totalReports: number;

  overallMastery: number;

  skillMastery: {
    digitalLogic: number;
    circuitAnalysis: number;
    troubleshooting: number;
    vivaReadiness: number;
    labProcedure: number;
  };

  vivaTrend: number[];

  experimentPerformance: Array<{
    code: string;
    title: string;
    completion: number;
    score: number;
    status: "Completed" | "In Progress";
  }>;
}

/* --------------------------------------------------
   STUDENT
-------------------------------------------------- */

export async function getDemoStudent(): Promise<StudentRecord | null> {
  const { data, error } = await supabase
    .from("students")
    .select("*")
    .eq("email", "demo@labmind.local")
    .maybeSingle();

  if (error) {
    throw new Error(`Failed to load student: ${error.message}`);
  }

  return data;
}

/* --------------------------------------------------
   EXPERIMENTS
-------------------------------------------------- */

export async function getStoredExperiments(): Promise<
  ExperimentRecord[]
> {
  const { data, error } = await supabase
    .from("experiments")
    .select("*")
    .order("code", { ascending: true });

  if (error) {
    throw new Error(
      `Failed to load experiments: ${error.message}`,
    );
  }

  return data ?? [];
}

/* --------------------------------------------------
   EXPERIMENT SESSIONS
-------------------------------------------------- */

export async function saveExperimentSession({
  experimentId,
  inputs,
  expectedOutputs,
  observedOutputs,
  notes,
}: {
  experimentId: string;
  inputs: Record<string, number>;
  expectedOutputs: Record<string, number>;
  observedOutputs: Record<string, number>;
  notes?: string;
}): Promise<ExperimentSessionRecord> {
  const student = await getDemoStudent();

  if (!student) {
    throw new Error("Demo student not found.");
  }

  const hasMismatch = Object.entries(expectedOutputs).some(
    ([name, expected]) => expected !== observedOutputs[name],
  );

  const { data, error } = await supabase
    .from("experiment_sessions")
    .insert({
      student_id: student.id,
      experiment_id: experimentId,
      inputs,
      expected_outputs: expectedOutputs,
      observed_outputs: observedOutputs,
      status: hasMismatch ? "fault" : "completed",
      score: hasMismatch ? 0 : 100,
      notes: notes ?? null,
      completed_at: new Date().toISOString(),
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to save experiment session: ${error.message}`,
    );
  }

  return data;
}

/* --------------------------------------------------
   DIAGNOSTICS
-------------------------------------------------- */

export async function saveDiagnosticSession({
  experimentId,
  stimulusVector,
  expectedOutputs,
  observedOutputs,
  severity,
  overallStatus,
  confidenceScore,
  activeFaults,
  hypotheses,
  checklist,
  aiAnalysis,
}: {
  experimentId: string;
  stimulusVector: string;
  expectedOutputs: Record<string, number>;
  observedOutputs: Record<string, number>;
  severity: string;
  overallStatus: string;
  confidenceScore: number;
  activeFaults: unknown[];
  hypotheses: unknown[];
  checklist: unknown[];
  aiAnalysis?: string | null;
}): Promise<DiagnosticSessionRecord> {
  const student = await getDemoStudent();

  if (!student) {
    throw new Error("Demo student not found.");
  }

  const { data, error } = await supabase
    .from("diagnostic_sessions")
    .insert({
      student_id: student.id,
      experiment_id: experimentId,
      stimulus_vector: stimulusVector,
      expected_outputs: expectedOutputs,
      observed_outputs: observedOutputs,
      severity,
      overall_status: overallStatus,
      confidence_score: confidenceScore,
      active_faults: activeFaults,
      hypotheses,
      checklist,
      ai_analysis: aiAnalysis ?? null,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to save diagnostic session: ${error.message}`,
    );
  }

  return data;
}

/* --------------------------------------------------
   VIVA
-------------------------------------------------- */

export async function saveVivaSession({
  experimentId,
  questionNumber,
  question,
  answer,
  topic,
  difficulty,
  score,
  maxScore,
  correct,
  feedback,
  missingConcepts,
  idealAnswer,
}: {
  experimentId: string;
  questionNumber: number;
  question: string;
  answer: string;
  topic: string;
  difficulty: string;
  score: number;
  maxScore: number;
  correct: boolean;
  feedback: string;
  missingConcepts: string[];
  idealAnswer: string;
}): Promise<VivaSessionRecord> {
  const student = await getDemoStudent();

  if (!student) {
    throw new Error("Demo student not found.");
  }

  const { data, error } = await supabase
    .from("viva_sessions")
    .insert({
      student_id: student.id,
      experiment_id: experimentId,
      question_number: questionNumber,
      question,
      answer,
      topic,
      difficulty,
      score,
      max_score: maxScore,
      correct,
      feedback,
      missing_concepts: missingConcepts,
      ideal_answer: idealAnswer,
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to save viva session: ${error.message}`,
    );
  }

  return data;
}

/* --------------------------------------------------
   REPORTS
-------------------------------------------------- */

export async function saveLabReport({
  experimentId,
  title,
  contentMarkdown,
  metadata,
}: {
  experimentId: string;
  title: string;
  contentMarkdown: string;
  metadata?: Record<string, unknown>;
}): Promise<LabReportRecord> {
  const student = await getDemoStudent();

  if (!student) {
    throw new Error("Demo student not found.");
  }

  const { data, error } = await supabase
    .from("lab_reports")
    .insert({
      student_id: student.id,
      experiment_id: experimentId,
      title,
      content_markdown: contentMarkdown,
      metadata: metadata ?? {},
    })
    .select("*")
    .single();

  if (error) {
    throw new Error(
      `Failed to save lab report: ${error.message}`,
    );
  }

  return data;
}

/* --------------------------------------------------
   DASHBOARD
-------------------------------------------------- */

export async function getDashboardStats(): Promise<DashboardStats> {
  const student = await getDemoStudent();

  if (!student) {
    return {
      student: null,
      totalSessions: 0,
      completedSessions: 0,
      faultSessions: 0,
      averageScore: 0,
      recentSessions: [],
    };
  }

  const { data, error } = await supabase
    .from("experiment_sessions")
    .select("*")
    .eq("student_id", student.id)
    .order("started_at", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error(
      `Failed to load dashboard data: ${error.message}`,
    );
  }

  const sessions = (data ?? []) as ExperimentSessionRecord[];

  const completedSessions = sessions.filter(
    (session) => session.status === "completed",
  ).length;

  const faultSessions = sessions.filter(
    (session) => session.status === "fault",
  ).length;

  const scoredSessions = sessions.filter(
    (session) => typeof session.score === "number",
  );

  const averageScore =
    scoredSessions.length > 0
      ? Math.round(
          scoredSessions.reduce(
            (sum, session) => sum + (session.score ?? 0),
            0,
          ) / scoredSessions.length,
        )
      : 0;

  return {
    student,
    totalSessions: sessions.length,
    completedSessions,
    faultSessions,
    averageScore,
    recentSessions: sessions.slice(0, 5),
  };
}

/* --------------------------------------------------
   COUNTS
-------------------------------------------------- */

export async function getDiagnosticSessionCount(): Promise<number> {
  const student = await getDemoStudent();

  if (!student) {
    return 0;
  }

  const { count, error } = await supabase
    .from("diagnostic_sessions")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("student_id", student.id);

  if (error) {
    throw new Error(
      `Failed to load diagnostic session count: ${error.message}`,
    );
  }

  return count ?? 0;
}

export async function getVivaSessionCount(): Promise<number> {
  const student = await getDemoStudent();

  if (!student) {
    return 0;
  }

  const { count, error } = await supabase
    .from("viva_sessions")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("student_id", student.id);

  if (error) {
    throw new Error(
      `Failed to load viva session count: ${error.message}`,
    );
  }

  return count ?? 0;
}

export async function getLabReportCount(): Promise<number> {
  const student = await getDemoStudent();

  if (!student) {
    return 0;
  }

  const { count, error } = await supabase
    .from("lab_reports")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("student_id", student.id);

  if (error) {
    throw new Error(
      `Failed to load lab report count: ${error.message}`,
    );
  }

  return count ?? 0;
}

export async function getExperimentSessionCount(): Promise<number> {
  const student = await getDemoStudent();

  if (!student) {
    return 0;
  }

  const { count, error } = await supabase
    .from("experiment_sessions")
    .select("*", {
      count: "exact",
      head: true,
    })
    .eq("student_id", student.id);

  if (error) {
    throw new Error(
      `Failed to load experiment session count: ${error.message}`,
    );
  }

  return count ?? 0;
}

/* --------------------------------------------------
   ANALYTICS
-------------------------------------------------- */

export async function getAnalyticsStats(): Promise<AnalyticsStats> {
  const student = await getDemoStudent();

  const experiments = await getStoredExperiments();

  if (!student) {
    return {
      totalExperiments: experiments.length,
      completedExperiments: 0,
      totalExperimentSessions: 0,
      averageExperimentScore: 0,
      totalDiagnostics: 0,
      resolvedDiagnostics: 0,
      diagnosticSuccessRate: 0,
      totalVivaQuestions: 0,
      averageVivaScore: 0,
      totalReports: 0,
      overallMastery: 0,
      skillMastery: {
        digitalLogic: 0,
        circuitAnalysis: 0,
        troubleshooting: 0,
        vivaReadiness: 0,
        labProcedure: 0,
      },
      vivaTrend: [],
      experimentPerformance: [],
    };
  }

  const [
    experimentResponse,
    diagnosticResponse,
    vivaResponse,
    reportResponse,
  ] = await Promise.all([
    supabase
      .from("experiment_sessions")
      .select("*")
      .eq("student_id", student.id)
      .order("started_at", { ascending: true }),

    supabase
      .from("diagnostic_sessions")
      .select("*")
      .eq("student_id", student.id)
      .order("created_at", { ascending: true }),

    supabase
      .from("viva_sessions")
      .select("*")
      .eq("student_id", student.id)
      .order("created_at", { ascending: true }),

    supabase
      .from("lab_reports")
      .select("*")
      .eq("student_id", student.id)
      .order("created_at", { ascending: true }),
  ]);

  if (experimentResponse.error) {
    throw new Error(
      `Failed to load experiment analytics: ${experimentResponse.error.message}`,
    );
  }

  if (diagnosticResponse.error) {
    throw new Error(
      `Failed to load diagnostic analytics: ${diagnosticResponse.error.message}`,
    );
  }

  if (vivaResponse.error) {
    throw new Error(
      `Failed to load viva analytics: ${vivaResponse.error.message}`,
    );
  }

  if (reportResponse.error) {
    throw new Error(
      `Failed to load report analytics: ${reportResponse.error.message}`,
    );
  }

  const experimentSessions =
    (experimentResponse.data ?? []) as ExperimentSessionRecord[];

  const diagnosticSessions =
    (diagnosticResponse.data ?? []) as DiagnosticSessionRecord[];

  const vivaSessions =
    (vivaResponse.data ?? []) as VivaSessionRecord[];

  const reports = reportResponse.data ?? [];

  const completedExperimentIds = new Set(
    experimentSessions
      .filter((session) => session.status === "completed")
      .map((session) => session.experiment_id),
  );

  const scoredExperimentSessions = experimentSessions.filter(
    (session) => typeof session.score === "number",
  );

  const averageExperimentScore =
    scoredExperimentSessions.length > 0
      ? Math.round(
          scoredExperimentSessions.reduce(
            (sum, session) => sum + (session.score ?? 0),
            0,
          ) / scoredExperimentSessions.length,
        )
      : 0;

  const resolvedDiagnostics = diagnosticSessions.filter(
    (session) =>
      session.overall_status === "PASS",
  ).length;

  const diagnosticSuccessRate =
    diagnosticSessions.length > 0
      ? Math.round(
          (resolvedDiagnostics / diagnosticSessions.length) *
            100,
        )
      : 0;

  const vivaScores = vivaSessions.filter(
    (session) =>
      typeof session.score === "number" &&
      typeof session.max_score === "number" &&
      (session.max_score ?? 0) > 0,
  );

  const averageVivaScore =
    vivaScores.length > 0
      ? Math.round(
          vivaScores.reduce(
            (sum, session) =>
              sum +
              ((session.score ?? 0) /
                (session.max_score ?? 10)) *
                100,
            0,
          ) / vivaScores.length,
        )
      : 0;

  const experimentCompletion =
    experiments.length > 0
      ? Math.round(
          (completedExperimentIds.size /
            experiments.length) *
            100,
        )
      : 0;

  /*
   * These are derived educational indicators, not
   * psychometric measurements.
   */
  const digitalLogic =
    averageExperimentScore > 0
      ? averageExperimentScore
      : experimentCompletion;

  const circuitAnalysis =
    experimentSessions.length > 0
      ? Math.round(
          experimentSessions.filter(
            (session) => session.status === "completed",
          ).length /
            experimentSessions.length *
            100,
        )
      : 0;

  const troubleshooting = diagnosticSuccessRate;
  const vivaReadiness = averageVivaScore;

  const labProcedure = experimentCompletion;

  const availableSkillValues = [
    digitalLogic,
    circuitAnalysis,
    troubleshooting,
    vivaReadiness,
    labProcedure,
  ].filter((value) => value > 0);

  const overallMastery =
    availableSkillValues.length > 0
      ? Math.round(
          availableSkillValues.reduce(
            (sum, value) => sum + value,
            0,
          ) / availableSkillValues.length,
        )
      : 0;

  const vivaTrend = vivaScores
    .slice(-5)
    .map((session) =>
      Math.round(
        ((session.score ?? 0) /
          (session.max_score ?? 10)) *
          100,
      ),
    );

  const experimentPerformance = experiments.map(
    (experiment) => {
      const sessionsForExperiment =
        experimentSessions.filter(
          (session) =>
            session.experiment_id === experiment.id,
        );

      const completed =
        sessionsForExperiment.filter(
          (session) => session.status === "completed",
        ).length > 0;

      const scored =
        sessionsForExperiment.filter(
          (session) => typeof session.score === "number",
        );

      const score =
        scored.length > 0
          ? Math.round(
              scored.reduce(
                (sum, session) =>
                  sum + (session.score ?? 0),
                0,
              ) / scored.length,
            )
          : 0;

      return {
        code: experiment.code,
        title: experiment.title,
        completion: completed ? 100 : 0,
        score,
        status: completed
          ? ("Completed" as const)
          : ("In Progress" as const),
      };
    },
  );

  return {
    totalExperiments: experiments.length,
    completedExperiments: completedExperimentIds.size,
    totalExperimentSessions: experimentSessions.length,
    averageExperimentScore,
    totalDiagnostics: diagnosticSessions.length,
    resolvedDiagnostics,
    diagnosticSuccessRate,
    totalVivaQuestions: vivaSessions.length,
    averageVivaScore,
    totalReports: reports.length,
    overallMastery,
    skillMastery: {
      digitalLogic,
      circuitAnalysis,
      troubleshooting,
      vivaReadiness,
      labProcedure,
    },
    vivaTrend,
    experimentPerformance,
  };
}