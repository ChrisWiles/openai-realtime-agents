# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

- **Development**: `npm run dev` - Start the development server with Turbopack at http://localhost:3000
- **Development (Debug)**: `npm run dev:inspect` - Start development server with Node.js inspector for debugging
- **Development (Alt Port)**: `npm run dev:port` - Start development server on port 3001
- **Build**: `npm run build` - Build the production version
- **Build (Analyze)**: `npm run build:analyze` - Build with bundle analyzer enabled
- **Start**: `npm run start` - Start the production server
- **Lint**: `npm run lint` - Run Biome to check and fix code style/formatting
- **Biome Check**: `npm run biome:check` - Check code without auto-fixing
- **Biome Fix**: `npm run biome:fix` - Check and auto-fix code issues
- **Type Check**: `npm run typecheck` - Run TypeScript type checking

Note: There are no test commands configured in this project.

### Pre-commit Hooks

This project uses Husky to run pre-commit hooks that automatically:
1. Run Biome checks for linting and formatting
2. Run TypeScript type checking

All code must pass these checks before commits are allowed.

## Architecture Overview

This is a Next.js application demonstrating advanced voice agent patterns using the OpenAI Realtime API and OpenAI Agents SDK.

### Core Components

1. **Agent System** (`src/app/agentConfigs/`)
   - Agents are defined using the `@openai/agents` SDK
   - Three main scenarios: `chatSupervisor`, `customerServiceRetail`, and `simpleHandoff`
   - Each agent has instructions, tools, and handoff capabilities
   - Agents can transfer control to other agents via tool calls

2. **Realtime Session Management** (`src/app/hooks/useRealtimeSession.ts`)
   - Manages WebRTC connections with OpenAI Realtime API
   - Handles agent handoffs and event routing
   - Supports different audio codecs (opus by default)

3. **API Routes**
   - `/api/session` - Creates ephemeral tokens for Realtime API connections
   - `/api/responses` - Handles guardrail checking for assistant messages

4. **UI Components** (`src/app/components/`)
   - `Transcript.tsx` - Displays conversation history with tool calls
   - `Events.tsx` - Shows real-time event logs
   - `GuardrailChip.tsx` - Indicates message safety status
   - `BottomToolbar.tsx` - Controls for connection and audio settings

### Key Patterns

1. **Chat-Supervisor Pattern**: A realtime chat agent handles basic interactions while deferring complex tasks to a more intelligent supervisor model (gpt-4.1)

2. **Sequential Handoff Pattern**: Specialized agents transfer users between them based on specific intents, using explicit agent graphs

### Environment Setup

- Requires `OPENAI_API_KEY` environment variable
- Uses Next.js App Router with TypeScript
- Tailwind CSS for styling
- Biome for linting and formatting with relaxed rules for `noExplicitAny` and `useExhaustiveDependencies`

### Development Notes

- When modifying agents, update the agent definitions in `src/app/agentConfigs/`
- Agent handoffs are managed through tool calls with `transferAgents` function
- Guardrails are implemented in `App.tsx` for message safety checking
- The default agent scenario is `chatSupervisor` (configurable in UI)