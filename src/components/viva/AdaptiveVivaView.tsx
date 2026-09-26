"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  ArrowLeft,
  Award,
  Bot,
  CheckCircle2,
  ChevronRight,
  FlaskConical,
  Loader2,
  MessageCircleQuestion,
  RotateCcw,
  Sparkles,
  Target,
  XCircle,
} from "lucide-react";

import { experiments } from "@/data/experimentsData";
import { saveVivaSession } from "@/lib/database";

type Difficulty = "easy" | "medium" | "hard";

interface VivaQuestion {
  question: string;
  topic: string;
  difficulty: Difficulty;
  expectedConcept: string;
}

interface VivaEvaluation {
  score: number;
  maxScore: number;
  correct: boolean;
  feedback: string;
  missingConcepts: string[];
  idealAnswer: string;
  nextDifficulty: Difficulty;
}

interface VivaAnswerRecord {
  question: string;
  answer: string;
  score: number;
  maxScore: number;
}

const TOTAL_QUESTIONS = 5;

export default function AdaptiveVivaView() {
  const [experimentId, setExperimentId] = useState(
    experiments[0]?.id ?? "",
  );

  const [difficulty, setDifficulty] =
    useState<Difficulty>("medium");

  const [started, setStarted] = useState(false);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [question, setQuestion] =
    useState<VivaQuestion | null>(null);

  const [answer, setAnswer] = useState("");
  const [evaluation, setEvaluation] =
    useState<VivaEvaluation | null>(null);

  const [history, setHistory] = useState<VivaAnswerRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [finished, setFinished] = useState(false);
  const [error, setError] = useState("");

  const selectedExperiment = useMemo(
    () =>
      experiments.find(
        (experiment) => experiment.id === experimentId,
      ) ?? experiments[0],
    [experimentId],
  );

  const totalScore = history.reduce(
    (sum, item) => sum + item.score,
    0,
  );

  const totalMaxScore = history.reduce(
    (sum, item) => sum + item.maxScore,
    0,
  );

  const percentage =
    totalMaxScore > 0
      ? Math.round((totalScore / totalMaxScore) * 100)
      : 0;

  const generateQuestion = async (
    nextDifficulty: Difficulty,
    nextNumber: number,
    previousQuestion = "",
  ) => {
    if (!selectedExperiment) {
      return;
    }

    setLoading(true);
    setError("");
    setEvaluation(null);
    setAnswer("");

    try {
      const response = await fetch("/api/viva", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "generate",
          difficulty: nextDifficulty,
          questionNumber: nextNumber,
          previousQuestion,
          experimentContext: {
            id: selectedExperiment.id,
            code: selectedExperiment.code,
            title: selectedExperiment.title,
            objective: selectedExperiment.objective,
            theory: selectedExperiment.theory,
            apparatus: selectedExperiment.apparatus,
            commonMistakes: selectedExperiment.commonMistakes,
          },
        }),
      });

      const data = await response.json();

      console.log("Viva question response:", data);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Request failed with status ${response.status}`,
        );
      }

      const generated = data?.result as VivaQuestion | undefined;

      if (
        !generated ||
        typeof generated.question !== "string"
      ) {
        throw new Error(
          "The AI returned an invalid viva question.",
        );
      }

      setQuestion(generated);
      setQuestionNumber(nextNumber);
      setStarted(true);
    } catch (err) {
      console.error("Viva question error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to generate the viva question.",
      );
    } finally {
      setLoading(false);
    }
  };

  const startViva = async () => {
    setHistory([]);
    setFinished(false);
    setQuestion(null);
    setEvaluation(null);
    setAnswer("");
    setQuestionNumber(0);
    setError("");

    await generateQuestion(difficulty, 1);
  };

  const submitAnswer = async () => {
    if (!question || !answer.trim() || !selectedExperiment) {
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/viva", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "evaluate",
          studentAnswer: answer,
          previousQuestion: question.question,
          experimentContext: {
            id: selectedExperiment.id,
            code: selectedExperiment.code,
            title: selectedExperiment.title,
            objective: selectedExperiment.objective,
            theory: selectedExperiment.theory,
            apparatus: selectedExperiment.apparatus,
            commonMistakes: selectedExperiment.commonMistakes,
          },
        }),
      });

      const data = await response.json();

      console.log("Viva evaluation response:", data);

      if (!response.ok) {
        throw new Error(
          data?.error ||
            `Request failed with status ${response.status}`,
        );
      }

      const evaluated = data?.result as VivaEvaluation | undefined;

      if (
        !evaluated ||
        typeof evaluated.score !== "number"
      ) {
        throw new Error(
          "The AI returned an invalid evaluation.",
        );
      }

      setEvaluation(evaluated);

      const currentAnswer = answer;

      setHistory((previous) => [
        ...previous,
        {
          question: question.question,
          answer: currentAnswer,
          score: evaluated.score,
          maxScore: evaluated.maxScore,
        },
      ]);

      try {
        await saveVivaSession({
          experimentId: selectedExperiment.id,
          questionNumber,
          question: question.question,
          answer: currentAnswer,
          topic: question.topic,
          difficulty: question.difficulty,
          score: evaluated.score,
          maxScore: evaluated.maxScore,
          correct: evaluated.correct,
          feedback: evaluated.feedback,
          missingConcepts: evaluated.missingConcepts,
          idealAnswer: evaluated.idealAnswer,
        });

        console.log("Viva session saved to Supabase.");
      } catch (saveError) {
        console.error(
          "Viva persistence error:",
          saveError,
        );
      }
    } catch (err) {
      console.error("Viva evaluation error:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Unable to evaluate the viva answer.",
      );
    } finally {
      setLoading(false);
    }
  };

  const nextQuestion = async () => {
    if (!evaluation || !question) {
      return;
    }

    if (questionNumber >= TOTAL_QUESTIONS) {
      setFinished(true);
      return;
    }

    await generateQuestion(
      evaluation.nextDifficulty,
      questionNumber + 1,
      question.question,
    );
  };

  const restartViva = () => {
    setStarted(false);
    setFinished(false);
    setQuestion(null);
    setEvaluation(null);
    setAnswer("");
    setHistory([]);
    setQuestionNumber(0);
    setError("");
  };

  return (
    <section className="lab-grid min-h-[calc(100vh-4rem)] p-4 md:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        <Link
          href="/experiments"
          className="mb-5 inline-flex items-center gap-2 text-xs text-slate-500 transition hover:text-primary"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Experiment Library
        </Link>

        <div className="lab-panel mb-6 p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-end">
            <div>
              <div className="lab-mono text-[10px] uppercase tracking-[0.22em] text-violet-300">
                ADAPTIVE ASSESSMENT · AI VIVA
              </div>

              <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white md:text-4xl">
                Adaptive AI Viva
              </h1>

              <p className="mt-3 max-w-3xl text-sm leading-7 text-slate-400">
                LabMind generates experiment-specific viva questions,
                evaluates your answers, adjusts difficulty, and stores your
                viva performance.
              </p>
            </div>

            <div className="flex items-center gap-2 rounded-full border border-violet-500/20 bg-violet-500/10 px-3 py-2">
              <Bot className="h-4 w-4 text-violet-300" />
              <span className="lab-mono text-[10px] uppercase tracking-wider text-violet-200">
                AI EXAMINER
              </span>
            </div>
          </div>
        </div>

        {!started && !finished && (
          <div className="mx-auto max-w-3xl">
            <div className="lab-panel p-6 md:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-primary/15 bg-primary/10">
                  <FlaskConical className="h-5 w-5 text-primary" />
                </div>

                <div>
                  <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    VIVA SETUP
                  </div>

                  <h2 className="text-xl font-semibold text-white">
                    Configure Your Viva
                  </h2>
                </div>
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Experiment
                  </label>

                  <select
                    value={experimentId}
                    onChange={(event) =>
                      setExperimentId(event.target.value)
                    }
                    className="w-full rounded-lg border border-slate-700/40 bg-surface-low px-4 py-3 text-sm text-white outline-none focus:border-primary/40"
                  >
                    {experiments.map((experiment) => (
                      <option
                        key={experiment.id}
                        value={experiment.id}
                      >
                        {experiment.code} — {experiment.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Starting Difficulty
                  </label>

                  <div className="grid grid-cols-3 gap-2">
                    {(["easy", "medium", "hard"] as Difficulty[]).map(
                      (level) => (
                        <button
                          key={level}
                          type="button"
                          onClick={() => setDifficulty(level)}
                          className={`rounded-lg border px-4 py-3 text-sm capitalize transition ${
                            difficulty === level
                              ? "border-violet-400/40 bg-violet-500/15 text-violet-200"
                              : "border-slate-700/40 bg-surface-low text-slate-400 hover:text-white"
                          }`}
                        >
                          {level}
                        </button>
                      ),
                    )}
                  </div>
                </div>

                {selectedExperiment && (
                  <div className="rounded-xl border border-slate-700/30 bg-surface-low p-4">
                    <div className="lab-mono text-[10px] uppercase tracking-wider text-primary">
                      {selectedExperiment.code}
                    </div>

                    <div className="mt-2 text-sm font-medium text-white">
                      {selectedExperiment.title}
                    </div>

                    <p className="mt-2 text-xs leading-6 text-slate-500">
                      {selectedExperiment.objective}
                    </p>
                  </div>
                )}

                {error && (
                  <div className="rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm leading-6 text-danger">
                    {error}
                  </div>
                )}

                <button
                  type="button"
                  onClick={startViva}
                  disabled={loading || !selectedExperiment}
                  className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Preparing Viva...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Start Adaptive Viva
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}

        {started && !finished && question && (
          <div className="grid gap-6 lg:grid-cols-[1fr_0.75fr]">
            <div className="space-y-6">
              <div className="lab-panel p-6 md:p-8">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-primary">
                    QUESTION {questionNumber} / {TOTAL_QUESTIONS}
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="rounded-full border border-violet-500/25 bg-violet-500/10 px-3 py-1 text-[10px] uppercase tracking-wider text-violet-200">
                      {question.difficulty}
                    </span>

                    <span className="rounded-full border border-slate-700/40 px-3 py-1 text-[10px] uppercase tracking-wider text-slate-500">
                      {question.topic}
                    </span>
                  </div>
                </div>

                <div className="mt-8">
                  <h2 className="text-2xl font-semibold leading-9 text-white">
                    {question.question}
                  </h2>
                </div>

                <div className="mt-8">
                  <label className="mb-2 block text-xs font-medium text-slate-400">
                    Your Answer
                  </label>

                  <textarea
                    value={answer}
                    onChange={(event) =>
                      setAnswer(event.target.value)
                    }
                    disabled={loading || !!evaluation}
                    placeholder="Explain your answer in your own words..."
                    rows={7}
                    className="w-full resize-none rounded-xl border border-slate-700/40 bg-surface-low px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-slate-600 focus:border-primary/40 disabled:opacity-70"
                  />
                </div>

                {!evaluation && (
                  <button
                    type="button"
                    onClick={submitAnswer}
                    disabled={loading || !answer.trim()}
                    className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-5 py-3.5 text-sm font-medium text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Evaluating Answer...
                      </>
                    ) : (
                      <>
                        Submit Answer
                        <ChevronRight className="h-4 w-4" />
                      </>
                    )}
                  </button>
                )}

                {evaluation && (
                  <div className="mt-6 rounded-xl border border-slate-700/30 bg-surface-low p-5">
                    <div className="flex items-center gap-3">
                      {evaluation.correct ? (
                        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                      ) : (
                        <XCircle className="h-5 w-5 text-danger" />
                      )}

                      <div>
                        <div className="text-sm font-semibold text-white">
                          {evaluation.correct
                            ? "Conceptually Correct"
                            : "Needs Improvement"}
                        </div>

                        <div className="mt-1 text-xs text-slate-500">
                          Score:{" "}
                          <span className="text-white">
                            {evaluation.score}/{evaluation.maxScore}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-5">
                      <div className="lab-mono text-[10px] uppercase tracking-wider text-violet-300">
                        AI FEEDBACK
                      </div>

                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {evaluation.feedback}
                      </p>
                    </div>

                    {evaluation.missingConcepts.length > 0 && (
                      <div className="mt-5">
                        <div className="lab-mono text-[10px] uppercase tracking-wider text-amber-400">
                          CONCEPTS TO REVIEW
                        </div>

                        <ul className="mt-2 space-y-2">
                          {evaluation.missingConcepts.map(
                            (concept) => (
                              <li
                                key={concept}
                                className="text-sm leading-6 text-slate-400"
                              >
                                • {concept}
                              </li>
                            ),
                          )}
                        </ul>
                      </div>
                    )}

                    <div className="mt-5 rounded-lg border border-primary/15 bg-primary/5 p-4">
                      <div className="lab-mono text-[10px] uppercase tracking-wider text-primary">
                        IDEAL ANSWER
                      </div>

                      <p className="mt-2 text-sm leading-7 text-slate-300">
                        {evaluation.idealAnswer}
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={nextQuestion}
                      className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg border border-violet-500/25 bg-violet-500/10 px-5 py-3.5 text-sm font-medium text-violet-200 transition hover:bg-violet-500/15"
                    >
                      {questionNumber >= TOTAL_QUESTIONS ? (
                        <>
                          Finish Viva
                          <Award className="h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Next Adaptive Question
                          <ChevronRight className="h-4 w-4" />
                        </>
                      )}
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-6">
              <div className="lab-panel p-6">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10">
                    <Target className="h-4 w-4 text-violet-300" />
                  </div>

                  <div>
                    <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">
                      LIVE ASSESSMENT
                    </div>

                    <h2 className="text-lg font-semibold text-white">
                      Progress
                    </h2>
                  </div>
                </div>

                <div className="mt-6">
                  <div className="flex items-end justify-between">
                    <span className="text-3xl font-semibold text-white">
                      {totalScore}
                    </span>

                    <span className="lab-mono text-xs text-slate-500">
                      / {totalMaxScore}
                    </span>
                  </div>

                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-surface-high">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-violet-500 to-primary transition-all"
                      style={{
                        width: `${percentage}%`,
                      }}
                    />
                  </div>

                  <div className="mt-2 flex justify-between text-[10px] uppercase tracking-wider text-slate-500">
                    <span>{percentage}%</span>
                    <span>
                      {history.length}/{TOTAL_QUESTIONS}
                    </span>
                  </div>
                </div>
              </div>

              <div className="lab-panel p-6">
                <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                  ADAPTIVE ENGINE
                </div>

                <div className="mt-4 space-y-3">
                  <div className="rounded-lg border border-slate-700/30 bg-surface-low p-4">
                    <div className="text-xs text-slate-500">
                      Current difficulty
                    </div>

                    <div className="mt-1 text-sm font-medium capitalize text-white">
                      {question.difficulty}
                    </div>
                  </div>

                  <div className="rounded-lg border border-slate-700/30 bg-surface-low p-4">
                    <div className="text-xs text-slate-500">
                      Next difficulty
                    </div>

                    <div className="mt-1 text-sm font-medium capitalize text-violet-200">
                      {evaluation?.nextDifficulty ??
                        question.difficulty}
                    </div>
                  </div>
                </div>
              </div>

              {history.length > 0 && (
                <div className="lab-panel p-6">
                  <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-slate-500">
                    ANSWER HISTORY
                  </div>

                  <div className="mt-4 space-y-2">
                    {history.map((item, index) => (
                      <div
                        key={`${item.question}-${index}`}
                        className="flex items-center justify-between gap-3 rounded-lg border border-slate-700/30 bg-surface-low px-3 py-3"
                      >
                        <span className="lab-mono text-xs text-slate-500">
                          Q{index + 1}
                        </span>

                        <span className="text-xs text-slate-300">
                          {item.score}/{item.maxScore}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {finished && (
          <div className="mx-auto max-w-3xl">
            <div className="lab-panel p-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl border border-emerald-500/20 bg-emerald-500/10">
                <Award className="h-8 w-8 text-emerald-400" />
              </div>

              <div className="lab-mono mt-6 text-[10px] uppercase tracking-[0.2em] text-emerald-400">
                VIVA COMPLETED
              </div>

              <h2 className="mt-2 text-3xl font-semibold text-white">
                {totalScore} / {totalMaxScore}
              </h2>

              <p className="mt-2 text-sm text-slate-400">
                Overall Score: {percentage}%
              </p>

              <div className="mt-8 grid gap-3 sm:grid-cols-3">
                <div className="lab-panel-low p-4">
                  <div className="text-2xl font-semibold text-white">
                    {history.length}
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                    Questions
                  </div>
                </div>

                <div className="lab-panel-low p-4">
                  <div className="text-2xl font-semibold text-white">
                    {percentage}%
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                    Accuracy
                  </div>
                </div>

                <div className="lab-panel-low p-4">
                  <div className="text-2xl font-semibold text-violet-200">
                    Adaptive
                  </div>
                  <div className="mt-1 text-[10px] uppercase tracking-wider text-slate-500">
                    Mode
                  </div>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-2 sm:flex-row">
                <button
                  type="button"
                  onClick={restartViva}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-violet-500/25 bg-violet-500/10 px-5 py-3 text-sm font-medium text-violet-200 transition hover:bg-violet-500/15"
                >
                  <RotateCcw className="h-4 w-4" />
                  Start New Viva
                </button>

                <Link
                  href="/experiments"
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-lg border border-slate-700/40 bg-surface-low px-5 py-3 text-sm text-slate-300 transition hover:border-primary/30 hover:text-white"
                >
                  <FlaskConical className="h-4 w-4" />
                  Experiment Library
                </Link>
              </div>
            </div>
          </div>
        )}

        {error && started && !finished && (
          <div className="mt-6 rounded-lg border border-danger/25 bg-danger/10 px-4 py-3 text-sm leading-6 text-danger">
            {error}
          </div>
        )}
      </div>
    </section>
  );
}