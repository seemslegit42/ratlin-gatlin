# B.E.E.P (Behavioral Event & Execution Processor)

> **ΛΞVON OS: The Verdigris Interface**

B.E.E.P is an agentic Syndicate Resource Planning (SRP) platform integrated into a Conversational Heads-Up Display (C-HUD). It serves as the primary interface for "Sovereigns" (users) to orchestrate AI business partners, manage complex workflows, and visualize economic data through an immersive, diegetic interface.

![License](https://img.shields.io/badge/license-Proprietary-critical)
![Status](https://img.shields.io/badge/system-OPERATIONAL-success)

## 🌌 Core Philosophy

B.E.E.P is built upon the **Verdigris Interface Protocol™**, merging "Ancient Roman Glass" aesthetics with high-fidelity sci-fi functionalism. It rejects static software paradigms in favor of **"Agentic Mythware"**—software that feels alive, responsive, and inhabited by semi-autonomous entities.

## 🚀 Key Modules

### 1. The C-HUD (Main View)
The central cockpit. It features:
- **Command Stream**: A chat interface for communicating with BEEP (powered by Ollama + Qwen Coder). Supports text and file attachments. Voice requires an external provider.
- **Vitals HUD**: Real-time monitoring of Swarm Integrity, Financial Pulse, and System Resources.
- **Widgets**: Interactive, draggable glass panels for tasks, security alerts, and cash flow visualization.

### 2. Weaver Studio
A node-based visual programming environment for constructing agentic workflows.
- **Architect Mode**: Drag-and-drop agents (Cognitive Core, API Call, etc.) and connect them with logic cables.
- **Live Mode**: Watch data packets flow through the graph in real-time.
- **Blueprints**: Save and instantiate complex multi-agent structures.

### 3. Simulacrum (The Glasshouse)
A spatial visualization of the agent swarm's "social life."
- **Gossip Ticker**: Eavesdrop on inter-agent communications.
- **Living Glyphs**: Agents represented as geometric entities that pulse and change color based on their operational mood (Ebullient, Pensive, Faltering).

### 4. The \Xi Economy
A comprehensive financial engine simulating an internal tokenized economy.
- **Drivers**: Sensitivity analysis for Ad Spend, Churn, and Grant Funding.
- **Sankey Flow**: Visualizing value transmutation from Fiat to internal \Xi tokens.
- **Governance**: Managing economic constants like the "Xi Floor".

### 5. Micro-App Forge
A "switchboard" interface for building custom tools.
- **Patching**: Connect input/output jacks physically to route data between modules.
- **Publishing**: Convert forged tools into reusable Agents for the Weaver Studio.

## 🛠 Technical Stack

- **Framework**: React 19 + TypeScript
- **Runtime & package manager**: [Bun](https://bun.com/docs) (`bun install`, `bun test`, `bun run …`)
- **App bundler (browser)**: [Vite](https://vitejs.dev/) (see also [Bun’s bundler](https://bun.com/docs/bundler) for standalone bundles)
- **Styling**: Tailwind CSS + Framer Motion (Animations)
- **AI Core**: Ollama (Qwen Coder) via local HTTP
- **State Management**: Custom Hooks + LocalStorage Persistence (`useWorkflowState`, `useMicroAppForgeState`)
- **Drag & Drop**: `react-draggable` (Widgets, Nodes)

## ⚡ Setup & Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/levon-os/beep.git
    cd beep
    ```

2.  **Install dependencies** ([`bun install`](https://bun.com/docs/pm/cli/install))
    ```bash
    bun install
    ```

3.  **Environment Configuration**
    Create a `.env` file in the root directory with your Ollama connection details.
    ```env
    OLLAMA_BASE_URL=http://localhost:11434
    OLLAMA_MODEL=qwen2.5-coder
    # Optional override if your Ollama server uses a non-standard path
    OLLAMA_CHAT_PATH=/api/chat
    ```
    Ensure your Ollama server allows browser requests from this origin (CORS), or proxy requests through your backend.

4.  **Run the app (Vite dev server + Postman MCP bridge)**
    ```bash
    bun run dev
    ```
    This starts Vite on port 3000 and the Postman/MCP backend on port 3100. For Postman API access, add to `.env`:
    ```env
    POSTMAN_API_KEY=PMAK-your-key-here
    ```
    Generate a key at [Postman API Keys](https://postman.postman.co/settings/me/api-keys). Proxied routes: `/api/postman/*` (REST) and `/mcp` (Model Context Protocol). See `mcp.json` for Cursor MCP client configuration (hosted Postman MCP + local bridge).

5.  **Run tests** ([`bun test`](https://bun.com/docs/test))
    ```bash
    bun test
    ```

## 🧠 AI Capabilities

B.E.E.P utilizes the **Tri-Agentic Mind** architecture:
*   **Mainframe Chat**: Context-aware C-HUD interaction. Handles navigation, widget spawning, and general Q&A.
*   **Weaver Architect**: Specialized in constructing JSON-based workflow graphs from natural language prompts.
*   **Voice Link**: Optional live voice session. Not enabled by default for Ollama builds.

## 🎨 Design System

The UI follows strict guidelines defined in `DESIGN_SYSTEM.md`:
*   **Colors**: Imperial Purple, Roman Aqua, Patina Green (Triadic Palette).
*   **Typography**: Comfortaa (Headers), Lexend (UI), Martian Mono (Data).
*   **Glassmorphism**: Heavy use of `backdrop-blur`, translucent borders, and inner shadows to simulate aged glass.

---

*"Silence is the sound of automation."*
