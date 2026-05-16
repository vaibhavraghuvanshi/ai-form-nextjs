# Social Support Application (Front-End Case Study)

A modern **Next.js 15** front-end for a fictional government social support portal featuring:

* Multi-step application wizard
* English / Arabic localization with RTL support
* Local draft persistence
* Accessible UI patterns
* Optional GPT-assisted writing support for narrative fields

---

# Prerequisites

* Node.js `18.18+`
* npm

---

# Getting Started

## Install dependencies

```bash
npm install
```

## Run development server

```bash
npm run dev
```

Open:

```txt
http://localhost:3000
```

Use the language switcher in the header to toggle between:

* English (LTR)
* Arabic (RTL)

Arabic translations are loaded from:

```txt
src/i18n/resources/ar.json
```

---

# Production Build

## Build application

```bash
npm run build
```

## Start production server

```bash
npm start
```

---

# Groq API Configuration

The browser never receives your Groq API key directly.

The application communicates through a secure Next.js Route Handler:

```txt
POST /api/compose
```

This endpoint forwards requests to Groq’s OpenAI-compatible API:

```txt
POST https://api.groq.com/openai/v1/chat/completions
```

Default model:

```txt
openai/gpt-oss-120b
```

---

# Environment Setup

## 1. Create `.env.local`

Create the file in the project root:

```txt
.env.local
```

Same level as:

```txt
package.json
```

---

## 2. Add your Groq API key

```env
GROQ_API_KEY=gsk_...
```

Get your API key from:

```txt
https://console.groq.com/keys
```

---

## 3. Optional — Override the default model

```env
GROQ_CHAT_MODEL=openai/gpt-oss-120b
```

---

## 4. Restart the development server

After updating `.env.local`, restart Next.js:

```bash
Ctrl + C
npm run dev
```

Next.js loads environment variables only during startup.

---

# Important Groq Notes

For the default model:

```txt
openai/gpt-oss-120b
```

The compose route automatically enables:

```txt
include_reasoning: false
reasoning_effort: low
```

This ensures responses are returned inside:

```txt
message.content
```

Without these flags, Groq may return:

* Empty `message.content`
* Reasoning inside `message.reasoning`

This can cause generic UI errors in compose fields.

Reference:

```txt
https://console.groq.com/docs/reasoning#gptoss-models
```

---

# Error Handling

## HTTP 429 — Rate Limit / Quota

Possible causes:

* Burst rate limits
* Account quota limits
* API usage restrictions

Check usage in the Groq console:

```txt
https://console.groq.com/
```

---

## HTTP 401 — Invalid API Key

Displayed as:

```txt
API key rejected
```

---

## Missing API Key

Displayed as:

```txt
missing_api_key
```

or

```txt
Not configured
```

---

# Whisper Model Note

Speech models such as:

```txt
whisper-large-v3-turbo
```

are intended for audio transcription only.

They are **not used** in the text compose route.

Supporting Whisper would require:

* Separate API endpoint
* Separate UI workflow

---

# Architecture Overview

| Area                 | Technology / Choice                |
| -------------------- | ---------------------------------- |
| Framework            | Next.js App Router (`src/app`)     |
| Styling              | Tailwind CSS v4                    |
| Forms                | `react-hook-form` + `FormProvider` |
| Internationalization | `react-i18next`                    |
| RTL Support          | `lang` + `dir` on `<html>`         |
| Draft Persistence    | `localStorage`                     |
| AI Integration       | Groq Chat Completions              |
| Submission API       | `POST /api/submit`                 |
| Validation           | Shared Zod schema                  |

---

# Routing

The original brief referenced React Router.

In this implementation:

* Next.js file-based routing replaces React Router
* The wizard is implemented as a single-page flow on:

```txt
/
```

---

# Project Structure

## Core Components

```txt
src/components/wizard/
```

Contains:

* Wizard UI
* Step components
* Progress bar
* AI suggestion dialog

---

## Providers

```txt
src/components/providers/AppProviders.tsx
```

Handles:

* i18n provider
* Language persistence
* RTL switching

---

## AI Compose API

```txt
src/app/api/compose/route.ts
```

Server-side Groq proxy.

Default model:

```txt
openai/gpt-oss-120b
```

---

## Submit API

```txt
src/app/api/submit/route.ts
```

Mock backend submission handler using shared Zod validation.

Returns:

```txt
SSP-{year}-{id}
```

Example:

```txt
SSP-2026-48392
```

---

## Validation Schema

```txt
src/lib/application-validation.ts
```

Contains:

* Shared validation rules
* Zod schemas
* Reusable field patterns

---

## Localization Resources

```txt
src/i18n/
```

Includes:

* i18n configuration
* English translations
* Arabic translations

---

# Validation Rules

## Client-side Validation

Implemented using:

```txt
react-hook-form
```

---

## Server-side Validation

Implemented in:

```txt
POST /api/submit
```

Validation schema:

```txt
applicationPayloadSchema
```

Invalid payloads return:

```txt
400 validation_failed
```

---

## Supported Validation Rules

### Text Fields

The following fields accept:

* Unicode letters
* Spaces only

Fields:

* Name
* City
* State
* Country

---

### National ID

Requirements:

* Alphanumeric
* Minimum length: `4`

---

### Additional Rules

* Email format validation
* Phone number validation
* Dependents range: `0–30`
* Step 3 narrative minimum length: `24`
* Enum validation aligned with select options

---

# Accessibility Features

Implemented accessibility improvements include:

* `role="progressbar"` for wizard progress
* Accessible modal dialog patterns
* `role="dialog"`
* `aria-modal`
* Focus management on open
* Escape key support
* Proper `htmlFor` and `id` mappings

---

# AI Writing Experience

The AI compose dialog supports:

* Loading states
* Accept suggestion
* Edit suggestion
* Discard suggestion

Accepted content updates form values using:

```txt
setValue()
```

with immediate validation.

---

# Future Production Improvements

If expanded into production, recommended enhancements include:

* Authentication & session management
* Secure server-side draft persistence
* API rate limiting
* Telemetry & monitoring
* Advanced automated testing
* Jest + React Testing Library coverage
* End-to-end testing
* Audit logging
* Role-based permissions

---

# License

```txt
Private / Assessment Use
```
