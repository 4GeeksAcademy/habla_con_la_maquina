"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

type Metrics = {
  model: string;
  promptTokens: number;
  completionTokens: number;
  totalTokens: number;
  responseTime: string;
};

type ChatApiResponse = {
  assistantMessage?: string;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  } | null;
  model?: string;
  error?: string;
};

const initialMetrics: Metrics = {
  model: "llama-3.1-8b-instant",
  promptTokens: 0,
  completionTokens: 0,
  totalTokens: 0,
  responseTime: "0.00s",
};

const MESSAGES_STORAGE_KEY = "habla-maquina-messages";
const METRICS_STORAGE_KEY = "habla-maquina-metrics";

function isInitialMetrics(metrics: Metrics) {
  return (
    metrics.model === initialMetrics.model &&
    metrics.promptTokens === initialMetrics.promptTokens &&
    metrics.completionTokens === initialMetrics.completionTokens &&
    metrics.totalTokens === initialMetrics.totalTokens &&
    metrics.responseTime === initialMetrics.responseTime
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [metrics, setMetrics] = useState<Metrics>(initialMetrics);
  const [hasHydratedStorage, setHasHydratedStorage] = useState(false);
  const skipHydrationRestoreRef = useRef(false);

  useEffect(() => {
    let nextMessages: Message[] | null = null;
    let nextMetrics: Metrics | null = null;

    try {
      const storedMessages = window.localStorage.getItem(MESSAGES_STORAGE_KEY);
      if (storedMessages) {
        const parsedMessages = JSON.parse(storedMessages) as unknown;
        if (Array.isArray(parsedMessages)) {
          const validMessages = parsedMessages.filter(
            (message): message is Message =>
              typeof message === "object" &&
              message !== null &&
              typeof (message as Message).id === "number" &&
              ((message as Message).role === "user" ||
                (message as Message).role === "assistant") &&
              typeof (message as Message).content === "string",
          );

          if (validMessages.length > 0 || parsedMessages.length === 0) {
            nextMessages = validMessages;
          }
        }
      }

      const storedMetrics = window.localStorage.getItem(METRICS_STORAGE_KEY);
      if (storedMetrics) {
        const parsedMetrics = JSON.parse(storedMetrics) as unknown;
        if (
          typeof parsedMetrics === "object" &&
          parsedMetrics !== null &&
          typeof (parsedMetrics as Metrics).model === "string" &&
          typeof (parsedMetrics as Metrics).promptTokens === "number" &&
          typeof (parsedMetrics as Metrics).completionTokens === "number" &&
          typeof (parsedMetrics as Metrics).totalTokens === "number" &&
          typeof (parsedMetrics as Metrics).responseTime === "string"
        ) {
          nextMetrics = parsedMetrics as Metrics;
        }
      }
    } catch {
      window.localStorage.removeItem(MESSAGES_STORAGE_KEY);
      window.localStorage.removeItem(METRICS_STORAGE_KEY);
    }

    const hydrationTimer = window.setTimeout(() => {
      if (skipHydrationRestoreRef.current) {
        setHasHydratedStorage(true);
        return;
      }

      if (nextMessages !== null) {
        setMessages(nextMessages);
      }
      if (nextMetrics !== null) {
        setMetrics(nextMetrics);
      }
      setHasHydratedStorage(true);
    }, 0);

    return () => {
      window.clearTimeout(hydrationTimer);
    };
  }, []);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    if (messages.length === 0) {
      window.localStorage.removeItem(MESSAGES_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages));
  }, [messages, hasHydratedStorage]);

  useEffect(() => {
    if (!hasHydratedStorage) return;
    if (isInitialMetrics(metrics)) {
      window.localStorage.removeItem(METRICS_STORAGE_KEY);
      return;
    }
    window.localStorage.setItem(METRICS_STORAGE_KEY, JSON.stringify(metrics));
  }, [metrics, hasHydratedStorage]);

  const handleClearConversation = () => {
    skipHydrationRestoreRef.current = true;
    setMessages([]);
    setMetrics(initialMetrics);
    setError("");
    window.localStorage.removeItem(MESSAGES_STORAGE_KEY);
    window.localStorage.removeItem(METRICS_STORAGE_KEY);
  };

  const handleSend = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (isLoading) return;

    const trimmedMessage = input.trim();
    if (!trimmedMessage) return;

    setError("");

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedMessage,
    };

    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");

    try {
      setIsLoading(true);
      const startedAt = Date.now();

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: updatedMessages.map(({ role, content }) => ({ role, content })),
        }),
      });

      const data = (await response.json()) as ChatApiResponse;

      if (!response.ok) {
        throw new Error(data.error || "No se pudo obtener respuesta de la IA.");
      }

      if (!data.assistantMessage) {
        throw new Error("La API no devolvio un mensaje del asistente valido.");
      }

      const assistantReply: Message = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.assistantMessage,
      };

      setMessages((prevMessages) => [...prevMessages, assistantReply]);

      const responseSeconds = (Date.now() - startedAt) / 1000;
      const promptTokens = data.usage?.prompt_tokens ?? 0;
      const completionTokens = data.usage?.completion_tokens ?? 0;
      const totalTokens = data.usage?.total_tokens ?? 0;

      setMetrics((prevMetrics) => ({
        model: data.model || prevMetrics.model,
        promptTokens: prevMetrics.promptTokens + promptTokens,
        completionTokens: prevMetrics.completionTokens + completionTokens,
        totalTokens: prevMetrics.totalTokens + totalTokens,
        responseTime: `${responseSeconds.toFixed(2)}s`,
      }));
    } catch (sendError) {
      setError(
        sendError instanceof Error
          ? sendError.message
          : "Error inesperado al enviar el mensaje.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-slate-950 text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(56,189,248,0.16),transparent_30%),radial-gradient(circle_at_85%_10%,rgba(34,197,94,0.16),transparent_35%),radial-gradient(circle_at_50%_85%,rgba(14,116,144,0.2),transparent_40%)]" />

      <main className="relative mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-4 p-4 md:flex-row md:gap-5 md:p-6">
        <aside className="flex w-full flex-col rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl md:w-72">
          <div className="mb-5">
            <p className="text-xs uppercase tracking-[0.2em] text-cyan-300/80">
              Habla con la Maquina
            </p>
            <h1 className="mt-2 text-xl font-semibold text-white">Panel de chat</h1>
          </div>

          <button
            type="button"
            className="mb-5 rounded-xl border border-cyan-300/35 bg-cyan-400/15 px-4 py-2.5 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/25"
          >
            + Nuevo chat
          </button>

          <div className="flex-1 space-y-2">
            <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Historial</p>
            <button
              type="button"
              className="w-full rounded-xl border border-white/10 bg-slate-900/65 px-3 py-2 text-left text-sm text-slate-200 transition hover:border-cyan-200/40"
            >
              Brief de campana de marketing
            </button>
            <button
              type="button"
              className="w-full rounded-xl border border-white/10 bg-slate-900/40 px-3 py-2 text-left text-sm text-slate-300 transition hover:border-cyan-200/40"
            >
              Estructura de pagina de ventas
            </button>
          </div>

          <button
            type="button"
            onClick={handleClearConversation}
            className="mt-4 rounded-xl border border-rose-200/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20"
          >
            Borrar conversacion
          </button>
        </aside>

        <section className="flex min-h-[60vh] w-full flex-col rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl md:flex-1 md:p-5">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="text-sm text-slate-300">Asistente IA</p>
              <p className="text-xs text-slate-400">
                {isLoading ? "Generando respuesta..." : "Conectado con /api/chat"}
              </p>
            </div>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-200">
              {isLoading ? "Respondiendo" : "En linea"}
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.length === 0 ? (
              <p className="rounded-2xl border border-dashed border-white/15 bg-slate-900/30 px-4 py-5 text-sm text-slate-400">
                No hay mensajes en esta conversacion.
              </p>
            ) : (
              messages.map((message) => (
                <article
                  key={message.id}
                  className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm leading-6 shadow-lg ${
                    message.role === "user"
                      ? "ml-auto border-cyan-300/35 bg-cyan-500/15 text-cyan-50"
                      : "border-white/10 bg-slate-900/70 text-slate-100"
                  }`}
                >
                  <p className="mb-1 text-[11px] uppercase tracking-[0.16em] text-slate-400">
                    {message.role === "user" ? "Tu" : "Asistente"}
                  </p>
                  <p>{message.content}</p>
                </article>
              ))
            )}
          </div>

          <form onSubmit={handleSend} className="mt-4 flex gap-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              disabled={isLoading}
              placeholder="Escribe tu mensaje aqui..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/45"
            />
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-2xl border border-cyan-300/40 bg-cyan-400/20 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/30 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isLoading ? "Enviando..." : "Enviar"}
            </button>
          </form>

          {error && (
            <p className="mt-3 rounded-xl border border-rose-300/30 bg-rose-500/10 px-3 py-2 text-sm text-rose-200">
              {error}
            </p>
          )}
        </section>

        <aside className="w-full rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl md:w-72">
          <h2 className="text-sm uppercase tracking-[0.16em] text-slate-300">Metricas</h2>
          <div className="mt-4 space-y-2">
            <MetricCard label="Modelo" value={metrics.model} />
            <MetricCard
              label="Prompt tokens"
              value={String(metrics.promptTokens)}
            />
            <MetricCard
              label="Completion tokens"
              value={String(metrics.completionTokens)}
            />
            <MetricCard label="Total tokens" value={String(metrics.totalTokens)} />
            <MetricCard label="Tiempo respuesta" value={metrics.responseTime} />
          </div>
        </aside>
      </main>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-slate-900/55 px-3 py-2.5">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-100">{value}</p>
    </div>
  );
}
