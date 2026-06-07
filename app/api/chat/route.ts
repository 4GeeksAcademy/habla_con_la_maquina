import { NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type ChatRequestBody = {
  messages?: ChatMessage[];
};

type GroqResponse = {
  model?: string;
  choices?: Array<{
    message?: {
      role?: string;
      content?: string;
    };
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
  error?: {
    message?: string;
  };
};

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const GROQ_MODEL = "llama-3.1-8b-instant";

export async function POST(request: Request) {
  const apiKey = process.env.GROQ_API_KEY;

  if (!apiKey) {
    return NextResponse.json(
      { error: "Falta configurar GROQ_API_KEY en el servidor." },
      { status: 500 },
    );
  }

  let body: ChatRequestBody;

  try {
    body = (await request.json()) as ChatRequestBody;
  } catch {
    return NextResponse.json(
      { error: "El cuerpo de la solicitud no es JSON valido." },
      { status: 400 },
    );
  }

  const { messages } = body;

  if (!Array.isArray(messages) || messages.length === 0) {
    return NextResponse.json(
      { error: "Debes enviar un arreglo messages con al menos un mensaje." },
      { status: 400 },
    );
  }

  const hasInvalidMessage = messages.some(
    (message) =>
      !message ||
      (message.role !== "user" && message.role !== "assistant") ||
      typeof message.content !== "string" ||
      message.content.trim().length === 0,
  );

  if (hasInvalidMessage) {
    return NextResponse.json(
      {
        error:
          "Cada mensaje debe tener role ('user' o 'assistant') y content no vacio.",
      },
      { status: 400 },
    );
  }

  try {
    const groqResponse = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: GROQ_MODEL,
        messages,
      }),
      cache: "no-store",
    });

    const data = (await groqResponse.json()) as GroqResponse;

    if (!groqResponse.ok) {
      const providerMessage = data?.error?.message;
      return NextResponse.json(
        {
          error:
            providerMessage ||
            "Groq devolvio un error al procesar la conversacion.",
        },
        { status: groqResponse.status },
      );
    }

    const assistantMessage = data.choices?.[0]?.message?.content?.trim();

    if (!assistantMessage) {
      return NextResponse.json(
        { error: "No se pudo obtener una respuesta valida de Groq." },
        { status: 502 },
      );
    }

    return NextResponse.json({
      assistantMessage,
      usage: data.usage ?? null,
      model: data.model ?? GROQ_MODEL,
    });
  } catch {
    return NextResponse.json(
      { error: "Error de red o servidor al comunicarse con Groq." },
      { status: 502 },
    );
  }
}
