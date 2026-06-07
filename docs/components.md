# Components

## Sidebar

Responsabilidades:
- Nuevo chat
- Historial
- Borrar conversación

Props esperadas:
- conversations
- onNewChat
- onClearConversation

---

## ChatWindow

Responsabilidades:
- Mostrar mensajes
- Mostrar loading
- Scroll de conversación

Props esperadas:
- messages
- isLoading

---

## ChatInput

Responsabilidades:
- Capturar mensaje
- Enviar mensaje

Props esperadas:
- input
- setInput
- onSend

---

## MetricsPanel

Responsabilidades:
- Mostrar métricas

Props esperadas:
- promptTokens
- completionTokens
- totalTokens
- model
- responseTime