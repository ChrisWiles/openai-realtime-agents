# Architecture Overview

## Table of Contents
- [System Architecture](#system-architecture)
- [Core Components](#core-components)
- [Agent System](#agent-system)
- [WebRTC & Realtime API](#webrtc--realtime-api)
- [Data Flow](#data-flow)
- [Security Model](#security-model)

## System Architecture

The OpenAI Realtime Agents application is built with a modern, modular architecture that supports real-time voice interactions with AI agents. The system leverages WebRTC for low-latency audio streaming and the OpenAI Agents SDK for intelligent conversation management.

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│                 │     │                  │     │                 │
│  Next.js Client │◄────┤  Next.js API     │◄────┤  OpenAI API     │
│  (React + TS)   │     │  (Server)        │     │  (Realtime)     │
│                 │     │                  │     │                 │
└────────┬────────┘     └──────────────────┘     └─────────────────┘
         │                                                 ▲
         │                                                 │
         └─────────────── WebRTC Connection ───────────────┘
```

## Core Components

### 1. Frontend Layer (`src/app/`)
- **App.tsx**: Main application component orchestrating the UI
- **Components**: Modular UI components (Transcript, Events, BottomToolbar)
- **Hooks**: Custom React hooks for session management and audio handling
- **Contexts**: React contexts for state management (Event, Transcript)

### 2. API Layer (`src/app/api/`)
- **session/route.ts**: Generates ephemeral authentication tokens
- **responses/route.ts**: Handles content moderation for guardrails

### 3. Agent Configuration Layer (`src/app/agentConfigs/`)
- **Agent Definitions**: Modular agent configurations with specific behaviors
- **Tool Definitions**: Functions that agents can invoke
- **Guardrails**: Content moderation system

### 4. Integration Layer
- **OpenAI Agents SDK**: Provides the RealtimeAgent and RealtimeSession classes
- **WebRTC Transport**: Handles real-time audio streaming
- **Codec Support**: Opus (48kHz) and G.711 (8kHz) for telephony

## Agent System

### Agent Architecture

Agents are the core intelligent components that handle conversations. Each agent has:

```typescript
interface RealtimeAgent {
  name: string;                    // Unique identifier
  voice: string;                   // Voice profile (e.g., 'sage')
  instructions: string;            // Behavioral prompt
  tools: FunctionTool[];          // Available functions
  handoffs: RealtimeAgent[];      // Other agents it can transfer to
  handoffDescription: string;      // Description for handoff decisions
}
```

### Agent Patterns

#### 1. Simple Handoff Pattern
Linear progression between specialized agents:
```
User → Greeter Agent → Haiku Writer Agent
```

#### 2. Mesh Handoff Pattern
Full interconnectivity between agents:
```
       ┌─────────────┐
       │Authentication│
       └──────┬──────┘
              │
     ┌────────┴────────┐
     │                 │
┌────▼───┐      ┌─────▼────┐      ┌─────────┐
│Returns │◄─────┤  Sales   │◄─────┤  Human  │
└────────┘      └──────────┘      └─────────┘
```

#### 3. Supervisor Pattern
Hierarchical decision-making:
```
User ←→ Chat Agent ←→ Supervisor Agent (via tool)
```

### Tool System

Tools extend agent capabilities:

```typescript
const tool = {
  name: 'function_name',
  description: 'What this tool does',
  parameters: JSONSchema,  // Input validation
  execute: async (input) => { /* implementation */ }
};
```

## WebRTC & Realtime API

### Connection Flow

1. **Authentication**:
   ```
   Client → /api/session → OpenAI API
                  ↓
            Ephemeral Key
   ```

2. **WebRTC Setup**:
   ```
   Client creates RTCPeerConnection
        ↓
   Applies codec preferences
        ↓
   Exchanges SDP offer/answer
        ↓
   Establishes DataChannel
   ```

3. **Audio Streaming**:
   - Input: User microphone → WebRTC → OpenAI
   - Output: OpenAI → WebRTC → Audio element

### Session Management

The `useRealtimeSession` hook manages the entire lifecycle:

```typescript
const session = new RealtimeSession(rootAgent, {
  transport: new OpenAIRealtimeWebRTC({
    audioElement,
    changePeerConnection: codecConfig
  }),
  model: 'gpt-4o-realtime-preview-2025-06-03',
  config: audioConfig,
  outputGuardrails: [moderationGuardrail]
});
```

## Data Flow

### Message Flow
```
User Input → Transcript → WebRTC → OpenAI → Agent Processing
                                              ↓
UI Update ← Transcript ← WebRTC ← Response ← Tool Execution
```

### Event System

Events flow bidirectionally:

**Client → Server Events**:
- `conversation.item.create`: New message
- `response.create`: Request response
- `session.update`: Configuration change
- `input_audio_buffer.*`: Audio control

**Server → Client Events**:
- `conversation.item.created`: Message added
- `response.audio.delta`: Audio chunk
- `response.function_call`: Tool invocation
- `agent_handoff`: Agent transfer
- `guardrail_tripped`: Content violation

### State Management

1. **Transcript State**: Conversation history with messages and breadcrumbs
2. **Event Log**: Detailed client/server event history
3. **Session State**: Connection status and configuration
4. **Agent State**: Current active agent and handoff status

## Security Model

### Authentication
- Server-side API key protection
- Ephemeral key generation for client connections
- Short-lived tokens for each session

### Content Moderation
- Real-time guardrails checking assistant outputs
- Categories: OFFENSIVE, OFF_BRAND, VIOLENCE, NONE
- Automatic response filtering on violations

### Network Security
- WebRTC encryption for audio streams
- HTTPS for all API communications
- No sensitive data in client-side code

## Performance Considerations

### Optimizations
- Codec selection based on network conditions
- Audio muting to save bandwidth
- Event batching for UI updates
- React context optimization

### Scalability
- Stateless API design
- Client-side session management
- Modular agent system
- Independent tool execution

## Extension Points

The architecture supports several extension mechanisms:

1. **New Agents**: Add to `agentConfigs/` with standard structure
2. **Custom Tools**: Define functions with parameters and execution
3. **Guardrails**: Implement custom moderation logic
4. **UI Components**: React components with TypeScript interfaces
5. **Audio Codecs**: Extend codec support in `codecUtils.ts`

This architecture provides a robust foundation for building sophisticated voice AI applications while maintaining clarity, security, and extensibility.