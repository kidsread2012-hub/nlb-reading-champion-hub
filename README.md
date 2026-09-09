# NLB Reading Champion Hub

An all-in-one training platform for NLB kidsREAD reading volunteers: self-paced
learning modules, a student assessment tool, and a personalised AI coach.

Built on [Base44](https://base44.com) (React + Tailwind + Vite). The codebase is
structured so the app can be exported and deployed on another platform with
minimal changes — all Base44-specific code is isolated behind a service adapter.

---

## Directory structure

```
src/
  api/
    base44Client.js        # Base44 SDK instance (used only by the service adapter)
  data/                    # All programme CONTENT as plain, serialisable files
    letterSounds.js        #   letter → phoneme + audio clip mapping
    resources.js           #   resource library (links, videos, placeholders)
    assessmentConfig.js     #   assessment section definitions (client-side)
    namePool.js             #   child names for guided-practice scenarios
    segments.js             #   learning segment visual/metadata config
  services/                # Data-access & integration layer (the abstraction)
    index.js                #   public API — pages import from here
    base44Adapter.js        #   Base44 implementation (the ONLY file using the SDK)
    localProgress.js        #   device-local progress store (localStorage)
  lib/                     # Framework utilities (auth, routing, query client)
  hooks/                   # React hooks (gamification, accessibility)
  components/              # Reusable UI components
    ui/                     #   shadcn/ui primitives
    learning/               #   module reader, checkpoints, letter sounds
    coach/                  #   coach conversation history
    resources/              #   resource cards
  pages/                   # Route-level page components

base44/
  entities/                # Database entity schemas (JSON)
  functions/               # Backend functions (HTTP handlers)
    chatWithCoach/          #   AI coach conversation
    generateCheckpointOptions/  # pop-quiz option generator
    ingestCoachKnowledge/  #   admin: ingest a document into the knowledge base
    processAssessment/      #   score a completed assessment
  shared/                  # Framework-agnostic logic shared across functions
    assessmentConfig.ts     #   assessment sections + scoring logic
    coachPrompts.ts         #   coach system-prompt builder (pure function)
    checkpointPrompts.ts    #   checkpoint prompt builder (pure function)
  workflows/               # Automated workflows (JSON)
  agents/                  # In-app AI agent configs (JSON)
```

---

## Where content lives

| Content                 | Location                          | Notes                                  |
| ----------------------- | --------------------------------- | -------------------------------------- |
| Letter sounds & audio   | `src/data/letterSounds.js`        | Audio clips hosted on Base44 storage   |
| Resource links/videos   | `src/data/resources.js`           | Edit here to add/remove resources      |
| Assessment sections     | `src/data/assessmentConfig.js`   | Client display; scoring in `shared/`   |
| Learning modules        | `LearningModule` entity (DB)      | Created/edited as database records     |
| Coach knowledge base    | `CoachKnowledge` entity (DB)      | Ingested via `ingestCoachKnowledge`    |
| Volunteer progress      | `src/services/localProgress.js`   | localStorage (prototype, device-local)|
| Coach conversations     | `src/services/localProgress.js`   | localStorage (prototype, device-local)|

---

## The service layer (how the app stays portable)

Pages and components **never** import the Base44 SDK directly. They import from
`@/services`, which re-exports a small, stable surface:

```js
import { content, ai, assessment, getModuleCompletions } from '@/services';

const modules = await content.listModules('order', 50);
const coachReply = await ai.chatWithCoach({ message, conversation_history });
const result = await assessment.process({ test_type, child_name, answers });
```

The surface is:

- **`content`** — `listModules`, `listClubs`, `listAssessments`
- **`ai`** — `chatWithCoach`, `generateCheckpointOptions`
- **`assessment`** — `process`
- **`files`** — `upload`, `uploadPrivate`, `signedUrl`
- **progress** — `getModuleCompletions`, `setModuleStatus`, `getModuleProgressMap`,
  `getQuizStats`, `setQuizStats`, `getAssessments`, `addAssessment`,
  `getCoachSessions`, `addCoachSession`, `deleteCoachSession`,
  `getCoachConversation`, `addCoachMessage`, `clearAllProgress`

### Swapping the backend

`src/services/index.js` re-exports from `./base44Adapter`. To deploy elsewhere:

1. Write a new adapter (e.g. `src/services/customAdapter.js`) implementing the
   same surface (`content`, `ai`, `assessment`, `files`) against your backend.
2. Point `src/services/index.js` at it. No page code changes.

The progress store (`localProgress.js`) is similarly swappable — replace the
re-export in `index.js` with a server-backed store implementing the same
function signatures.

---

## Backend function portability

Each backend function's **core logic** lives in `base44/shared/` as a pure
function with no SDK or HTTP dependencies:

- `shared/coachPrompts.ts` → `buildCoachSystemPrompt()`
- `shared/checkpointPrompts.ts` → `buildCheckpointPrompt()` + response schema
- `shared/assessmentConfig.ts` → `calculateAssessmentResults()`

The `entry.ts` in each function folder is a **thin Base44 wrapper** that parses
the request, calls the shared logic, invokes the LLM/entity via the SDK, and
returns a `Response`. To run the same logic on another platform (Express,
Vercel, etc.), write a new thin wrapper that calls the shared module — the
logic itself moves unchanged.

---

## Auth

Authentication runs through `src/lib/AuthContext.jsx`, which uses the Base44
SDK directly (`base44.auth.me()`, `logout`, `redirectToLogin`). This is the one
remaining Base44-coupled module. The app currently runs in prototype mode with
no auth gate; to use a different auth provider, replace `AuthContext` with an
implementation exposing the same context shape (`user`, `isAuthenticated`,
`isLoadingAuth`, `isLoadingPublicSettings`, `authError`, `logout`,
`navigateToLogin`).

---

## Running locally

```bash
npm install
npm run dev
```

The app expects Base44 environment variables (`VITE_BASE44_APP_ID`, etc.) to be
present, injected by the Base44 platform at build time.