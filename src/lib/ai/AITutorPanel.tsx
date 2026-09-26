"use client";

import { useMemo, useState } from "react";
import {
  Bot,
  Loader2,
  Send,
  Sparkles,
  Trash2,
  User,
} from "lucide-react";

import type { Experiment } from "@/types/experiment";

interface AITutorPanelProps {
  experiment: Experiment;
  currentInputs?: Record<string, number>;
  expectedOutputs?: Record<string, number>;
  observedOutputs?: Record<string, number>;
  activeFault?: string | null;
}

interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export default function AITutorPanel({
  experiment,
  currentInputs = {},
  expectedOutputs = {},
  observedOutputs = {},
  activeFault = null,
}: AITutorPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: `I'm LabMind AI for ${experiment.title}. Ask me about the theory, logic, outputs, or current experiment state.`,
    },
  ]);

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const suggestions = useMemo(
    () => [
      "Explain this experiment simply",
      "Why is this output produced?",
      "Explain the Boolean equation",
      "What should I check?",
    ],
    [],
  );

  async function sendMessage(text?: string) {
    const userMessage = (text ?? message).trim();

    if (!userMessage || loading) {
      return;
    }

    setMessage("");

    const newUserMessage: ChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      content: userMessage,
    };

    setMessages((current) => [
      ...current,
      newUserMessage,
    ]);

    setLoading(true);

    try {
      const response = await fetch("/api/gemini", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userMessage,
          experimentContext: {
            experiment,
            currentInputs,
            expectedOutputs,
            observedOutputs,
            activeFault,
          },
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.error || "Gemini request failed.",
        );
      }

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          content: data.reply || "No response received.",
        },
      ]);
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Unable to contact LabMind AI.";

      setMessages((current) => [
        ...current,
        {
          id: `${Date.now()}-error`,
          role: "assistant",
          content: `I couldn't process that request right now. ${errorMessage}`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function clearConversation() {
    setMessages([
      {
        id: "welcome-reset",
        role: "assistant",
        content: `Conversation cleared. I'm ready to help with ${experiment.title}.`,
      },
    ]);
  }

  return (
    <section className="lab-panel flex h-full min-h-[560px] flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-700/30 px-5 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">
            <Bot className="h-4 w-4 text-violet-300" />
          </div>

          <div>
            <div className="lab-mono text-[10px] uppercase tracking-[0.18em] text-violet-300">
              LABMIND AI
            </div>

            <h2 className="text-sm font-semibold text-white">
              Experiment Copilot
            </h2>
          </div>
        </div>

        <button
          type="button"
          onClick={clearConversation}
          className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-surface-low hover:text-slate-200"
          title="Clear conversation"
          aria-label="Clear conversation"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      {/* Context */}
      <div className="border-b border-slate-700/20 bg-violet-500/[0.03] px-5 py-3">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-violet-500/20 bg-violet-500/5 px-2.5 py-1 lab-mono text-[9px] text-violet-300">
            {experiment.shortTitle}
          </span>

          {Object.entries(currentInputs).map(
            ([key, value]) => (
              <span
                key={key}
                className="rounded-full border border-slate-700/30 bg-surface-low px-2.5 py-1 lab-mono text-[9px] text-slate-400"
              >
                {key}={value}
              </span>
            ),
          )}

          {activeFault && (
            <span className="rounded-full border border-rose-500/20 bg-rose-500/5 px-2.5 py-1 lab-mono text-[9px] text-rose-300">
              FAULT: {activeFault}
            </span>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5">
        {messages.map((item) => {
          const isUser = item.role === "user";

          return (
            <div
              key={item.id}
              className={`flex gap-3 ${
                isUser ? "justify-end" : "justify-start"
              }`}
            >
              {!isUser && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">
                  <Sparkles className="h-3.5 w-3.5 text-violet-300" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-xl border px-4 py-3 text-sm leading-6 ${
                  isUser
                    ? "border-primary/20 bg-primary/10 text-slate-200"
                    : "border-slate-700/30 bg-surface-low text-slate-300"
                }`}
              >
                {item.content}
              </div>

              {isUser && (
                <div className="mt-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-primary/20 bg-primary/10">
                  <User className="h-3.5 w-3.5 text-primary" />
                </div>
              )}
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10">
              <Sparkles className="h-3.5 w-3.5 text-violet-300" />
            </div>

            <div className="rounded-xl border border-slate-700/30 bg-surface-low px-4 py-3">
              <div className="flex items-center gap-2 text-xs text-slate-500">
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                LabMind is thinking...
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Suggestions */}
      <div className="border-t border-slate-700/20 px-5 pt-4">
        <div className="mb-2 lab-mono text-[9px] uppercase tracking-[0.18em] text-slate-600">
          QUICK QUESTIONS
        </div>

        <div className="flex gap-2 overflow-x-auto pb-3">
          {suggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => sendMessage(suggestion)}
              disabled={loading}
              className="whitespace-nowrap rounded-full border border-slate-700/40 bg-surface-low px-3 py-2 text-[10px] text-slate-400 transition hover:border-violet-500/20 hover:text-violet-300 disabled:opacity-40"
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t border-slate-700/30 p-4">
        <div className="flex gap-2">
          <input
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void sendMessage();
              }
            }}
            placeholder="Ask about this experiment..."
            className="min-w-0 flex-1 rounded-lg border border-slate-700/40 bg-surface-low px-4 py-3 text-sm text-white placeholder:text-slate-600 outline-none transition focus:border-violet-500/30"
            disabled={loading}
          />

          <button
            type="button"
            onClick={() => void sendMessage()}
            disabled={loading || !message.trim()}
            className="flex w-12 shrink-0 items-center justify-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-300 transition hover:bg-violet-500/15 disabled:cursor-not-allowed disabled:opacity-30"
            aria-label="Send message"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>
    </section>
  );
}