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
GROQ_API_KEY=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
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

# Testing

## Setup

Jest is configured with the Next.js transformer via `next/jest.js`. The full setup includes:

**`jest.config.ts`** — root config

* Uses `createJestConfig` from `next/jest.js` for SWC transforms and path alias resolution (`@/*` → `src/*`)
* `testEnvironment`: `jsdom`
* `setupFilesAfterEnv`: `jest.setup.ts`
* Module name mappers for CSS (`identity-obj-proxy`), static assets, and Lottie JSON files
* `transformIgnorePatterns` allows `lottie-react` to be transformed

**`jest.setup.ts`** — global test environment

* Imports `@testing-library/jest-dom` for extended matchers (`toBeInTheDocument`, `toHaveTextContent`, etc.)
* Stubs browser APIs not available in jsdom: `window.matchMedia`, `ResizeObserver`, `IntersectionObserver`, `window.scrollTo`, `Element.prototype.scrollIntoView`
* Inline `localStorage` / `sessionStorage` mock using `jest.fn()` backed by an in-memory store
* Web API polyfills for `Request` and `Response` (required by Next.js App Router route handlers)
* `beforeEach` resets all mock state between tests

## npm Scripts

| Script | Command |
| --- | --- |
| Run tests | `npm test` |
| Watch mode | `npm run test:watch` |
| Coverage report | `npm run test:coverage` |

## Mocks

### Global mocks (`__mocks__/`)

| File | Purpose |
| --- | --- |
| `__mocks__/axios.ts` | Full axios mock — `get`, `post`, `put`, `patch`, `delete`, `create`, interceptors, `isAxiosError` |
| `__mocks__/react-i18next.tsx` | `useTranslation` returns `t = key => key` passthrough; `I18nextProvider` is a passthrough; `initReactI18next` stub |
| `__mocks__/lottie-react.tsx` | Returns `<div data-testid="lottie-animation" />` |
| `__mocks__/lucide-react.tsx` | Each named icon renders `<svg data-testid="icon-{Name}" />`; Proxy catch-all for any unlisted icon |
| `__mocks__/next/server.ts` | `NextResponse.json()` mock — avoids full Next.js runtime dependency in route handler tests |
| `__mocks__/fileMock.ts` | Static asset stub — returns `"test-file-stub"` |
| `__mocks__/lottieMock.ts` | Minimal Lottie JSON fixture |

### Source-level mocks (`src/__mocks__/`)

| File | Purpose |
| --- | --- |
| `src/__mocks__/components/providers/AppProviders.ts` | `useLanguage` jest.fn returning `{ language: 'en', setLanguage: jest.fn() }`; `AppProviders` passthrough |
| `src/__mocks__/lib/draft-storage.ts` | `loadDraft`, `saveDraft`, `clearDraft` all jest.fn; default `loadDraft` returns `null` |
| `src/__mocks__/hooks/usePrefersReducedMotion.ts` | Returns `false` by default |
| `src/__mocks__/lib/application-validation.ts` | `applicationPayloadSchema.safeParse` jest.fn returning `{ success: true, data }` |
| `src/__mocks__/types/application.ts` | Re-exports real types and constants |
| `src/__mocks__/i18n/client.ts` | Full i18n stub with `changeLanguage`, `t`, `dir`, `on`, `off` |
| `src/__mocks__/components/wizard/*.ts` | Lightweight stub renders for `ProgressBar`, `StepPersonal`, `StepFamily`, `StepSituation`, `AiSuggestionDialog` |

## Test Files

| Test File | Source File Covered |
| --- | --- |
| `src/__tests__/setup.smoke.test.ts` | Jest + jsdom environment sanity check |
| `src/__tests__/hooks/usePrefersReducedMotion.test.ts` | `hooks/usePrefersReducedMotion.ts` |
| `src/__tests__/lib/draft-storage.test.ts` | `lib/draft-storage.ts` |
| `src/__tests__/lib/application-validation.test.ts` | `lib/application-validation.ts` |
| `src/__tests__/i18n/client.test.ts` | `i18n/client.ts` |
| `src/__tests__/app/page.test.tsx` | `app/page.tsx` |
| `src/__tests__/app/api/submit.test.ts` | `app/api/submit/route.ts` |
| `src/__tests__/app/api/compose.test.ts` | `app/api/compose/route.ts` |
| `src/__tests__/components/wizard/ProgressBar.test.tsx` | `components/wizard/ProgressBar.tsx` |
| `src/__tests__/components/wizard/FormField.test.tsx` | `components/wizard/FormField.tsx` |
| `src/__tests__/components/wizard/StepPersonal.test.tsx` | `components/wizard/StepPersonal.tsx` |
| `src/__tests__/components/wizard/StepFamily.test.tsx` | `components/wizard/StepFamily.tsx` |
| `src/__tests__/components/wizard/StepSituation.test.tsx` | `components/wizard/StepSituation.tsx` |
| `src/__tests__/components/providers/AppProviders.test.tsx` | `components/providers/AppProviders.tsx` |
| `src/__tests__/components/wizard/AiSuggestionDialog.test.tsx` | `components/wizard/AiSuggestionDialog.tsx` |
| `src/__tests__/components/wizard/ApplicationWizard.test.tsx` | `components/wizard/ApplicationWizard.tsx` |

## Coverage Summary

Results from `npm run test:coverage` (239 tests across 16 test suites):

| File | Statements | Branches | Functions | Lines |
| --- | --- | --- | --- | --- |
| **All files** | **98.10%** | **94.42%** | **96.87%** | **99.74%** |
| app/page.tsx | 100% | 100% | 100% | 100% |
| app/api/compose/route.ts | 97.18% | 93.10% | 71.42% | 100% |
| app/api/submit/route.ts | 93.75% | 75.00% | 100% | 93.75% |
| components/providers/AppProviders.tsx | 100% | 100% | 100% | 100% |
| components/wizard/AiSuggestionDialog.tsx | 100% | 100% | 100% | 100% |
| components/wizard/ApplicationWizard.tsx | 100% | 93.67% | 100% | 100% |
| components/wizard/FormField.tsx | 100% | 100% | 100% | 100% |
| components/wizard/ProgressBar.tsx | 100% | 100% | 100% | 100% |
| components/wizard/StepFamily.tsx | 93.33% | 94.44% | 100% | 100% |
| components/wizard/StepPersonal.tsx | 100% | 100% | 100% | 100% |
| components/wizard/StepSituation.tsx | 100% | 100% | 100% | 100% |
| hooks/usePrefersReducedMotion.ts | 100% | 100% | 100% | 100% |
| i18n/client.ts | 92.85% | 83.33% | 100% | 100% |
| lib/application-validation.ts | 100% | 100% | 100% | 100% |
| lib/draft-storage.ts | 86.95% | 76.92% | 100% | 100% |
| types/application.ts | 100% | 100% | 100% | 100% |

> Note: The remaining branch gaps in `draft-storage.ts` and `i18n/client.ts` are `typeof window === 'undefined'` and `i18n.isInitialized` SSR guards that are not reachable in a jsdom test environment by design.

---

# License

```txt
Private / Assessment Use
```
