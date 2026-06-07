# Data Flow

## Envío de mensaje

1. Usuario escribe mensaje.
2. Mensaje se agrega a messages.
3. Frontend llama a /api/chat.
4. /api/chat llama a Groq.
5. Groq devuelve respuesta.
6. Frontend agrega respuesta al chat.
7. Frontend actualiza métricas.
8. Frontend guarda estado.

---

## Datos enviados a Groq

messages[]

---

## Datos recibidos de Groq

message

usage:
- prompt_tokens
- completion_tokens
- total_tokens

model