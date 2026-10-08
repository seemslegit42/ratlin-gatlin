# Beepin (ΛΞVON OS / B.E.E.P) - Copilot Instructions

## 🌌 Project Overview

**Beepin** is an agentic Syndicate Resource Planning (SRP) platform integrated into a Conversational Heads-Up Display (C-HUD). It orchestrates AI business partners, manages complex workflows, and visualizes economic data through an immersive, diegetic interface.

Core Philosophy: **"Agentic Mythware"**—software that feels alive, responsive, and inhabited by semi-autonomous entities.

---

## 🚀 Quick Start

### Build & Run
```bash
# Development server (port 3000)
bun dev

# Production build
bun build

# Preview built assets
bun preview
```

### Environment Setup
Create `.env` in root:
```env
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=qwen2.5-coder
OLLAMA_CHAT_PATH=/api/chat
```

**Important**: Ensure Ollama allows CORS requests from your frontend origin.

---

## 🏗 Architecture

### 1. Tech Stack
- **Framework**: React 19 + TypeScript
- **Build**: Vite 6
- **Styling**: Tailwind CSS + Framer Motion (animations)
- **State**: Custom hooks + Appwrite + LocalStorage persistence
- **UI Effects**: Glassmorphism, Three.js (3D neural lattice), Draggable widgets
- **Backend**: Appwrite + Broadcast
- **Payments**: Stripe
- **AI**: Ollama (Qwen Coder via HTTP)

### 2. Directory Structure
Modules are **domain-isolated** (not by file type). Key folders:
- `components/` — React components organized by domain (admin, auth, crm, economy, finance, etc.)
  - `components/shared/` — Reusable UI atoms and molecules
  - `components/icons/` — Aetheric sigils (icons with internal glow effects)
- `hooks/` — Custom state management hooks (prefixed `use*`)
- `contexts/` — React Context providers (AuthContext, NotificationContext)
- `services/` — Backend integrations (Ollama, Appwrite)
- `utils/` — Utility functions
- `types.ts` — Global TypeScript interfaces

### 3. The Tri-Agentic Mind (AI Architecture)
Beepin uses a **Serialized Request Chain** pattern for stability:

1. **Mainframe Chat** — Context-aware C-HUD interaction (navigation, widget spawning, Q&A)
2. **Weaver Architect** — Specialized in JSON-based workflow graph synthesis
3. **Voice Link** — Optional live voice sessions (disabled by default for Ollama)

**Key Constraint**: All AI calls are serialized via a singleton `requestChain` to prevent concurrent API collisions and 429 rate limit errors.

### 4. State Management Pattern
- **Multi-Tenancy**: All state isolated by `syndicateId` (user/organization ID)
- **Persistence**: Real-time sync via Appwrite + Broadcast channels
- **Undo/Redo**: Stack-based history at the hook level (e.g., `useWorkflowState`)
- **LocalStorage**: Fallback for offline-first features

### 5. Execution Engine (Weaver Studio)
1. **Topological Analysis** — Determines agent dependency order
2. **Input Hydration** — Injects upstream JSON into downstream prompts (`{{prompts}}`)
3. **Aegis Verification** — Security compliance interception before execution

---

## 🎨 Design System (Verdigris Interface Protocol™)

### Color Palette (Triadic)
| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Imperial Purple | `#6A0DAD` | Brand, leadership, AI core |
| Secondary | Patina Green | `#3EB991` | Success, safety, growth |
| Accent | Roman Aqua | `#20B2AA` | Interactive, data flow, active states |
| Warning | Gilded Accent | `#FFD700` | Alerts, wealth, attention |
| Background | Obsidian Black | `#000000` | Deep contrast |

### Typography
- **Headers**: Comfortaa (rounded, friendly)
- **Body/UI**: Lexend (legibility-optimized)
- **Data/Code**: Martian Mono (technical precision)

### Glassmorphism Guidelines
```css
background: rgba(20, 20, 20, 0.6);
backdrop-filter: blur(20px);
border: 1px solid rgba(255, 255, 255, 0.1);
box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.5);
```

### Motion Principles
- Use **spring physics** (Framer Motion) over linear easing
- Entrances: drift in (`y: 10→0`, `opacity: 0→1`)
- Interactions: glow, pulse, or color shifts to simulate energy transfer
- Philosophy: **Digital Wabi-Sabi** — organic, not robotic

### Iconography ("Aetheric Sigils")
- Icons are carved glyphs with subtle internal glow (`drop-shadow`)
- Active states: color shift (Grey → triadic color) + pulsing animation

---

## 🛠 Development Conventions

### 1. Component Structure
- **Atoms** (`components/shared/`) — Reusable UI primitives (buttons, cards, etc.)
- **Molecules** (`components/shared/widgets/`) — Multi-atom compositions
- **Organisms** (`components/`) — Full domain views (e.g., `Weaver.tsx`, `Simulacrum.tsx`)
- **Pages** (`MainView.tsx`, `TenantLogin.tsx`) — Top-level routes

### 2. Hook Naming & State
All custom hooks follow `use*` convention and manage domain-specific state:
- `useWorkflowState(syndicateId)` — Weaver Studio state (agents, connections, undo/redo)
- `useStreamingChat(...)` — Chat interface (Markdown rendering, tool execution)
- `useGossip(agents)` — Swarm intelligence (ambient logs, diegetic moods)
- `useMicroAppForgeState(...)` — Forge view state
- `useCRMState(...)`, `useEconomyState(...)` — Domain-specific states

**Key Pattern**: Hooks persist to LocalStorage and sync via Appwrite Broadcast for multiplayer.

### 3. Service Layer
- **`services/ollamaService.ts`** — Ollama HTTP bridge
  - `enqueueRequest()` — Serializes all AI calls
  - `runMainframeChat()`, `runChatAgent()`, `runCognitiveCore()`
  - Implements exponential backoff for 429 errors
- **`services/appwriteClient.ts`** — Appwrite SDK + Realtime
  - Session healing (auth reconciliation)
  - Broadcast channels for cursors, state sync

### 4. TypeScript Path Alias
```typescript
// Use @ to import from root
import { useWorkflowState } from '@/hooks/useWorkflowState';
import { MyComponent } from '@/components/MyComponent';
```

### 5. Styling
- **Tailwind CSS** for utility-first styling
- **Framer Motion** for animations (prefer `spring` physics over `ease`)
- Keep glassmorphism utilities in reusable classes
- Dark mode is default (no light mode toggle needed)

---

## ⚠️ Critical Pitfalls & Solutions

### 1. **Ollama Rate Limiting (429 Errors)**
**Problem**: Concurrent AI requests hit Ollama's rate limit.
**Solution**: 
- All AI calls MUST use `enqueueRequest()` in `ollamaService.ts`
- Never call Ollama directly from components
- Set `OLLAMA_MODEL` env var; only override per-agent if necessary
- Use exponential backoff (4s, 8s, 16s) for retries

### 2. **Multi-Tenancy& State Isolation**
**Problem**: User data leaks between syndicates.
**Solution**:
- Always scope state queries/mutations to `syndicateId`
- Pass `syndicateId` as a parameter to hooks and services
- Verify `syndicateId` matches authenticated user before allowing access

### 3. **CORS Configuration**
**Problem**: Browser can't reach Ollama from frontend.
**Solution**:
- Configure Ollama to allow origin of frontend (usually `http://localhost:3000`)
- Or proxy Ollama requests through your Appwrite Cloud Functions
- Use `OLLAMA_BASE_URL` env var to point to correct endpoint

### 4. **Environment Variables**
**Problem**: Build fails or Ollama unreachable.
**Solution**:
- Create `.env` in root with `OLLAMA_BASE_URL`, `OLLAMA_MODEL`, `OLLAMA_CHAT_PATH`
- Vite loads these via `loadEnv()` in `vite.config.ts`
- Variables must be read at build time (not runtime) for SSG compatibility

### 5. **LocalStorage Persistence**
**Problem**: State lost on page refresh.
**Solution**:
- Hooks serialize state to LocalStorage (e.g., `useWorkflowState` snapshots)
- On mount, hooks restore from LocalStorage then sync with Appwrite
- Avoid storing sensitive data (auth tokens) in LocalStorage; use Appwrite session

---

## 🎯 Key Files to Understand

| File | Purpose |
|------|---------|
| `App.tsx` | Main router and layout |
| `MainView.tsx` | C-HUD cockpit (central dashboard) |
| `components/Weaver.tsx` | Node-based workflow editor |
| `components/Simulacrum.tsx` | Agent swarm visualization |
| `components/MicroAppForgeView.tsx` | Custom tool builder |
| `hooks/useWorkflowState.ts` | Weaver state orchestrator |
| `hooks/useStreamingChat.ts` | Chat interface controller |
| `services/ollamaService.ts` | AI request serialization |
| `services/appwriteClient.ts` | Backend bridge |
| `DESIGN_SYSTEM.md` | Verdigris aesthetic guidelines |
| `ARCHITECTURE.md` | Technical deep-dives |
| `types.ts` | Global TypeScript interfaces |

---

## 📍 Debugging Tips

### 1. Check Ollama Health
```bash
curl http://localhost:11434/api/tags
```

### 2. Inspect Appwrite Connection
- Open browser DevTools → Application → IndexedDB
- Look for `appwrite` entries (auth, settings)

### 3. Monitor Request Queue
- Add `console.log()` in `ollamaService.ts` inside `enqueueRequest()`
- Verify serialization: should see one request at a time, not concurrent

### 4. CSS Debugging
- Use browser DevTools to inspect computed styles
- Check that glassmorphism values (`backdrop-filter`, `rgba`) are applied
- Verify custom fonts (Comfortaa, Lexend, Martian Mono) are loading

---

## 🔗 Common Workflow Patterns

### Adding a New Domain Module
1. Create folder in `components/{domainName}/`
2. Add `use{DomainName}State()` hook in `hooks/`
3. Register hook in `contexts/` if sharing across app
4. Import and use in component via domain-specific hook

### Creating a New AI Agent in Weaver
1. Define agent schema in `types.ts` (e.g., `CognitiveCore`, `APICall`)
2. Add handler in `services/ollamaService.ts` (e.g., `runCognitiveCore()`)
3. Connect to topological executor in `useWorkflowState.ts`
4. Test with sample workflow in Weaver Studio

### Adding Realtime Multiplayer Sync
1. Use Appwrite Broadcast channel (e.g., `channel-${syndicateId}`)
2. Subscribe in hook's `useEffect()`
3. Dispatch action on incoming message
4. Unsubscribe on cleanup

---

## 📚 Additional Resources

- **README.md** — System overview and quick start
- **ARCHITECTURE.md** — Technical deep-dives on all subsystems
- **DOCUMENTATION.md** — Function reference and service API
- **DESIGN_SYSTEM.md** — Aesthetic guidelines and color specs
- **APPWRITE_SETUP.md** — Database schema and setup steps

---

*"Silence is the sound of automation."* 🔇
