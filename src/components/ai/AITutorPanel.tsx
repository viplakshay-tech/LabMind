"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, Loader2, Send, Sparkles, User, X } from "lucide-react";

import type { Experiment } from "@/types/experiment";

interface AITutorPanelProps {
  experiment: Experiment;
  currentInputs: Record<string, number>;
  expectedOutputs: Record<string, number>;
  observedOutputs: Record<string, number>;
  activeFault?: string | null;
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function AITutorPanel({
  experiment,
  currentInputs,
  expectedOutputs,
  observedOutputs,
  activeFault = null,
}: AITutorPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async (question?: string) => {
    const message = (question ?? input).trim();

    if (!message || loading) {
      return;
    }

    setMessages((previous) => [
      ...previous,
      {
        role: "user",
        content: message,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          experimentContext: {
            id: experiment.id,
            code: experiment.code,
            title: experiment.title,
            objective: experiment.objective,
            theory: experiment.theory,
            apparatus: experiment.apparatus,
            commonMistakes: experiment.commonMistakes,
            currentInputs,
            expectedOutputs,
            observedOutputs,
            activeFault,
          },
        }),
      });

      const data = await response.json();

      console.log("AI Tutor API response:", data);

      if (!response.ok) {
        throw new Error(
          data?.error || `Request failed with status ${response.status}`
        );
      }

      const aiResponse =
        data?.response ??
        data?.text ??
        data?.message ??
        data?.answer;

      if (
        typeof aiResponse !== "string" ||
        aiResponse.trim().length === 0
      ) {
        console.error("Unexpected Gemini response:", data);
        throw new Error("I did not receive a response from the AI.");
      }

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: aiResponse,
        },
      ]);
    } catch (error) {
      console.error("AI Tutor error:", error);

      const errorMessage =
        error instanceof Error
          ? error.message
          : "Something went wrong while contacting the AI.";

      setMessages((previous) => [
        ...previous,
        {
          role: "assistant",
          content: `⚠️ ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
  };

  const quickQuestions = [
    "Explain this experiment in simple language.",
    "Why do my current outputs have these values?",
    "What common mistakes should I check?",
  ];

  return (
    <div className="lab-panel overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/30 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10">
            <Bot className="h-4 w-4 text-violet-300" />
          </div>

          <div>
            <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">
              AI ASSISTANT
            </div>

            <h2 className="text-lg font-semibold text-white">
              LabMind AI Tutor
            </h2>
          </div>
        </div>

        {messages.length > 0 && (
          <button
            type="button"
            onClick={clearChat}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-700/40 px-3 py-2 text-xs text-slate-400 transition hover:text-white"
          >
            <X className="h-3.5 w-3.5" />
            Clear
          </button>
        )}
      </div>

      {/* Chat Area */}
      <div className="min-h-[260px] space-y-4 p-5">
        {messages.length === 0 ? (
          <div>
            <div className="rounded-xl border border-violet-500/10 bg-violet-500/5 p-4">
              <div className="flex gap-3">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-violet-300" />

                <div>
                  <p className="text-sm leading-6 text-slate-300">
                    Ask me about the current experiment, circuit behavior,
                    outputs, theory, or common mistakes.
                  </p>

                  <p className="mt-2 text-xs text-slate-500">
                    Experiment: {experiment.title}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {quickQuestions.map((question) => (
                <button
                  key={question}
                  type="button"
                  onClick={() => sendMessage(question)}
                  className="rounded-lg border border-slate-700/40 bg-surface-low px-3 py-2 text-xs text-slate-400 transition hover:border-violet-400/30 hover:text-white"
                >
                  {question}
                </button>
              ))}
            </div>
          </div>
        ) : (
          messages.map((message, index) => (
            <div
              key={`${message.role}-${index}`}
              className={`flex gap-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10">
                  <Bot className="h-4 w-4 text-violet-300" />
                </div>
              )}

              <div
  className={`max-w-[85%] rounded-xl px-4 py-3 text-sm ${
    message.role === "user"
      ? "bg-primary/10 text-slate-200"
      : "border border-slate-700/30 bg-surface-low text-slate-300"
  }`}
>
  {message.role === "assistant" ? (
    <div className="space-y-3 leading-6">
      <ReactMarkdown
        components={{
          h2: ({ children }) => (
            <h2 className="mt-4 text-base font-semibold text-white first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="mt-4 text-sm font-semibold text-violet-200 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="leading-7 text-slate-300">{children}</p>
          ),
          ul: ({ children }) => (
            <ul className="ml-5 list-disc space-y-1 text-slate-300">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="ml-5 list-decimal space-y-1 text-slate-300">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="pl-1">{children}</li>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-white">
              {children}
            </strong>
          ),
          code: ({ children }) => (
            <code className="rounded bg-slate-800/70 px-1.5 py-0.5 font-mono text-xs text-primary">
              {children}
            </code>
          ),
          table: ({ children }) => (
            <div className="my-3 overflow-x-auto rounded-lg border border-slate-700/40">
              <table className="min-w-full text-left text-xs">
                {children}
              </table>
            </div>
          ),
          th: ({ children }) => (
            <th className="border-b border-slate-700/40 bg-slate-800/40 px-3 py-2 font-semibold text-white">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="border-b border-slate-800/40 px-3 py-2 text-slate-300">
              {children}
            </td>
          ),
        }}
      >
        {message.content}
      </ReactMarkdown>
    </div>
  ) : (
    <div className="whitespace-pre-wrap leading-6">
      {message.content}
    </div>
  )}
</div>

              {message.role === "user" && (
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                  <User className="h-4 w-4 text-primary" />
                </div>
              )}
            </div>
          ))
        )}

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-violet-400/20 bg-violet-500/10">
              <Bot className="h-4 w-4 text-violet-300" />
            </div>

            <div className="flex items-center gap-2 rounded-xl border border-slate-700/30 bg-surface-low px-4 py-3 text-sm text-slate-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              LabMind is thinking...
            </div>
          </div>
        )}
      </div>

      {/* Input */}
      <div className="border-t border-slate-700/30 p-4">
        <div className="flex gap-2">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                sendMessage();
              }
            }}
            placeholder="Ask about this experiment..."
            disabled={loading}
            className="min-w-0 flex-1 rounded-lg border border-slate-700/40 bg-surface-low px-4 py-3 text-sm text-white outline-none placeholder:text-slate-600 focus:border-primary/40"
          />

          <button
            type="button"
            onClick={() => sendMessage()}
            disabled={loading || !input.trim()}
            className="inline-flex items-center justify-center rounded-lg bg-primary px-4 py-3 text-primary-foreground transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}