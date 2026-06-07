"use client";

import { FormEvent, useState } from "react";

type Message = {
  id: number;
  role: "user" | "assistant";
  content: string;
};

const mockMetrics = {
  model: "llama-3.1-8b-instant",
  promptTokens: 248,
  completionTokens: 137,
  totalTokens: 385,
  responseTime: "1.18s",
};

const initialMessages: Message[] = [
  {
    id: 1,
    role: "assistant",
    content:
      "Hola, soy tu asistente. Puedo ayudarte a diseñar prompts y estructurar ideas.",
  },
  {
    id: 2,
    role: "user",
    content: "Quiero crear una landing para una startup de IA.",
  },
  {
    id: 3,
    role: "assistant",
    content:
      "Perfecto. Empecemos por la propuesta de valor y tres beneficios concretos.",
  },
];

export default function Home() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState("");

  const handleSend = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedMessage = input.trim();
    if (!trimmedMessage) return;

    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: trimmedMessage,
    };

    setMessages((prevMessages) => [...prevMessages, userMessage]);
    setInput("");
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
            className="mt-4 rounded-xl border border-rose-200/20 bg-rose-500/10 px-3 py-2 text-sm text-rose-200 transition hover:bg-rose-500/20"
          >
            Borrar conversacion
          </button>
        </aside>

        <section className="flex min-h-[60vh] w-full flex-col rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl md:flex-1 md:p-5">
          <div className="mb-4 flex items-center justify-between border-b border-white/10 pb-3">
            <div>
              <p className="text-sm text-slate-300">Asistente IA</p>
              <p className="text-xs text-slate-400">Sesion local mock</p>
            </div>
            <span className="rounded-full border border-emerald-300/30 bg-emerald-400/10 px-2.5 py-1 text-xs text-emerald-200">
              En linea
            </span>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto pr-1">
            {messages.map((message) => (
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
            ))}
          </div>

          <form onSubmit={handleSend} className="mt-4 flex gap-3">
            <input
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Escribe tu mensaje aqui..."
              className="w-full rounded-2xl border border-white/10 bg-slate-900/70 px-4 py-3 text-sm text-white outline-none placeholder:text-slate-500 focus:border-cyan-300/45"
            />
            <button
              type="submit"
              className="rounded-2xl border border-cyan-300/40 bg-cyan-400/20 px-5 py-3 text-sm font-medium text-cyan-100 transition hover:bg-cyan-400/30"
            >
              Enviar
            </button>
          </form>
        </section>

        <aside className="w-full rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur-xl md:w-72">
          <h2 className="text-sm uppercase tracking-[0.16em] text-slate-300">Metricas</h2>
          <div className="mt-4 space-y-2">
            <MetricCard label="Modelo" value={mockMetrics.model} />
            <MetricCard
              label="Prompt tokens"
              value={String(mockMetrics.promptTokens)}
            />
            <MetricCard
              label="Completion tokens"
              value={String(mockMetrics.completionTokens)}
            />
            <MetricCard label="Total tokens" value={String(mockMetrics.totalTokens)} />
            <MetricCard label="Tiempo respuesta" value={mockMetrics.responseTime} />
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
