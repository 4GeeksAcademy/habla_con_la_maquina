# Architecture Document - Habla con la Máquina

## Objetivo técnico

Construir una aplicación Next.js que permita enviar mensajes a la API de Groq usando fetch, mostrar respuestas de IA, acumular métricas de tokens y persistir la conversación en localStorage.

---

## Estructura principal

### app/page.tsx

Responsable de la interfaz principal.

Contendrá:

- Sidebar
- Chat Area
- Metrics Panel
- Estado principal de la aplicación

---

### app/api/chat/route.ts

Responsable de comunicarse con Groq.

Contendrá:

- Lectura de GROQ_API_KEY desde .env.local
- Llamada fetch a la API de Groq
- Envío del historial completo de mensajes
- Retorno de respuesta y métricas al frontend

---

## Estado de la aplicación

La aplicación manejará los siguientes estados:

- messages
- input
- isLoading
- error
- metrics

---

## Modelo de mensaje

```ts
type Message = {
  role: "user" | "assistant";
  content: string;
};