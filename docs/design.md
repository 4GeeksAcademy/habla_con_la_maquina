# Design Document - Habla con la Máquina

## Objetivo

Construir una aplicación web en Next.js que permita conversar con un modelo de IA mediante la API de Groq.

La aplicación debe mostrar la conversación, métricas de uso de tokens y mantener la sesión entre recargas de página.

---

# Inspiración visual

Referencia visual obtenida mediante Google Stitch.

Características deseadas:

* Tema oscuro
* Estilo glassmorphism
* Diseño tipo SaaS moderno
* Bordes redondeados
* Paneles separados visualmente
* Interfaz inspirada en herramientas de IA modernas

---

# Layout General

La interfaz estará dividida en tres secciones principales.

## Sidebar

Responsabilidades:

* Nuevo chat
* Historial de conversaciones
* Borrar conversación

Objetivo:

Permitir la navegación y administración de sesiones.

---

## Chat Area

Responsabilidades:

* Mostrar mensajes del usuario
* Mostrar respuestas de la IA
* Campo de texto
* Botón enviar
* Indicador de carga

Objetivo:

Ser la zona principal de interacción con la IA.

---

## Metrics Panel

Responsabilidades:

* Mostrar modelo utilizado
* Mostrar prompt tokens
* Mostrar completion tokens
* Mostrar total tokens
* Mostrar tiempo de respuesta

Objetivo:

Dar visibilidad al consumo de la API y al rendimiento de la aplicación.

---

# Requerimientos Funcionales

## Conversación

El usuario debe poder:

* Escribir mensajes
* Enviar mensajes
* Ver respuestas de la IA
* Ver el historial completo de la conversación

---

## API

La aplicación debe:

* Utilizar fetch
* Consumir la API de Groq
* Utilizar un modelo Llama 3 disponible en Groq
* Enviar el historial completo de la conversación

---

## Estado

La aplicación utilizará useState para:

* Lista de mensajes
* Input del usuario
* Estado de carga
* Métricas

---

## Persistencia

La aplicación utilizará localStorage para:

* Guardar historial
* Recuperar historial al recargar
* Eliminar historial cuando el usuario lo solicite

---

# Métricas Requeridas

La aplicación mostrará:

* Prompt Tokens
* Completion Tokens
* Total Tokens
* Modelo utilizado
* Tiempo de respuesta

---

# Objetivo Final

Crear un prototipo funcional que permita visualizar claramente:

* Conversación
* Consumo de tokens
* Rendimiento de la IA
* Persistencia de sesión

Todo dentro de una interfaz moderna y fácil de usar.
