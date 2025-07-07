# API Reference

Comprehensive API documentation for the OpenAI Realtime Agents system.

## Table of Contents
- [Core Classes](#core-classes)
- [Hooks](#hooks)
- [Components](#components)
- [Tools API](#tools-api)
- [Events](#events)
- [Types](#types)

## Core Classes

### RealtimeAgent

The base class for creating conversational agents.

```typescript
class RealtimeAgent {
  constructor(config: {
    name: string;
    voice?: string;
    instructions: string;
    tools?: FunctionTool[];
    handoffs?: RealtimeAgent[];
    handoffDescription?: string;
  })
}
```

**Properties:**
- `name` (string, required): Unique identifier for the agent
- `voice` (string, optional): Voice profile to use (default: 'sage')
- `instructions` (string, required): Detailed prompt defining agent behavior
- `tools` (FunctionTool[], optional): Array of tools the agent can use
- `handoffs` (RealtimeAgent[], optional): Agents this agent can transfer to
- `handoffDescription` (string, optional): Brief description for handoff decisions

**Example:**
```typescript
const myAgent = new RealtimeAgent({
  name: 'helper',
  voice: 'sage',
  instructions: 'You are a helpful assistant...',
  tools: [myTool],
  handoffs: [otherAgent]
});
```

### RealtimeSession

Manages the WebRTC connection and agent interactions.

```typescript
class RealtimeSession {
  constructor(
    rootAgent: RealtimeAgent,
    options: {
      transport: OpenAIRealtimeWebRTC;
      model: string;
      config?: SessionConfig;
      outputGuardrails?: Guardrail[];
      context?: Record<string, any>;
    }
  )
  
  connect(options: { apiKey: string }): Promise<void>
  close(): void
  interrupt(): void
  sendMessage(text: string): void
  mute(muted: boolean): void
  on(event: string, handler: Function): void
}
```

**Methods:**
- `connect()`: Establishes connection with ephemeral key
- `close()`: Cleanly disconnects the session
- `interrupt()`: Interrupts current assistant response
- `sendMessage()`: Sends a text message to the assistant
- `mute()`: Controls audio stream muting
- `on()`: Registers event listeners

## Hooks

### useRealtimeSession

Primary hook for managing Realtime API sessions.

```typescript
function useRealtimeSession(callbacks?: {
  onConnectionChange?: (status: SessionStatus) => void;
  onAgentHandoff?: (agentName: string) => void;
}): {
  status: SessionStatus;
  connect: (options: ConnectOptions) => Promise<void>;
  disconnect: () => void;
  sendUserText: (text: string) => void;
  sendEvent: (event: any) => void;
  mute: (muted: boolean) => void;
  pushToTalkStart: () => void;
  pushToTalkStop: () => void;
  interrupt: () => void;
}
```

**Parameters:**
- `callbacks.onConnectionChange`: Called when connection status changes
- `callbacks.onAgentHandoff`: Called when agent handoff occurs

**Returns:**
- `status`: Current connection status ('DISCONNECTED' | 'CONNECTING' | 'CONNECTED')
- `connect`: Function to establish connection
- `disconnect`: Function to close connection
- `sendUserText`: Send text message to assistant
- `sendEvent`: Send raw event to transport
- `mute`: Control audio muting
- `pushToTalkStart/Stop`: PTT controls
- `interrupt`: Interrupt assistant

**Example:**
```typescript
const {
  status,
  connect,
  disconnect,
  sendUserText
} = useRealtimeSession({
  onConnectionChange: (status) => console.log('Status:', status),
  onAgentHandoff: (agent) => console.log('Handoff to:', agent)
});
```

### useTranscript

Manages conversation transcript state.

```typescript
function useTranscript(): {
  transcriptItems: TranscriptItem[];
  addTranscriptMessage: (
    id: string,
    role: 'user' | 'assistant',
    content: string,
    isPartial?: boolean
  ) => void;
  addTranscriptBreadcrumb: (
    title: string,
    data?: any
  ) => void;
  updateTranscriptItem: (
    id: string,
    updates: Partial<TranscriptItem>
  ) => void;
  toggleTranscriptItemExpand: (id: string) => void;
  clearTranscript: () => void;
}
```

### useEvent

Manages event logging and history.

```typescript
function useEvent(): {
  loggedEvents: LoggedEvent[];
  logClientEvent: (event: any, suffix?: string) => void;
  logServerEvent: (event: any) => void;
  toggleExpand: (id: string) => void;
  clearEvents: () => void;
}
```

### useAudioDownload

Handles audio recording and download functionality.

```typescript
function useAudioDownload(): {
  startRecording: (stream: MediaStream) => void;
  stopRecording: () => void;
  downloadRecording: () => void;
  isRecording: boolean;
}
```

## Components

### Transcript

Displays conversation history with messages and breadcrumbs.

```typescript
interface TranscriptProps {
  userText: string;
  setUserText: (text: string) => void;
  onSendMessage: () => void;
  canSend: boolean;
  downloadRecording: () => void;
}
```

**Props:**
- `userText`: Current input field value
- `setUserText`: Update input field
- `onSendMessage`: Handler for sending messages
- `canSend`: Whether sending is allowed
- `downloadRecording`: Function to download audio

### Events

Displays real-time event log.

```typescript
interface EventsProps {
  isExpanded: boolean;
}
```

### BottomToolbar

Control panel for connection, PTT, and settings.

```typescript
interface BottomToolbarProps {
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
  isPTTActive: boolean;
  setIsPTTActive: (active: boolean) => void;
  isPTTUserSpeaking: boolean;
  handleTalkButtonDown: () => void;
  handleTalkButtonUp: () => void;
  isEventsPaneExpanded: boolean;
  setIsEventsPaneExpanded: (expanded: boolean) => void;
  isAudioPlaybackEnabled: boolean;
  setIsAudioPlaybackEnabled: (enabled: boolean) => void;
  codec: string;
  onCodecChange: (codec: string) => void;
}
```

### GuardrailChip

Displays content moderation status.

```typescript
interface GuardrailChipProps {
  guardrailResult?: GuardrailResultType;
}
```

## Tools API

### Creating Tools

Use the `tool` function to create agent tools:

```typescript
function tool(config: {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute: (input: any, details?: ToolDetails) => Promise<any>;
}): FunctionTool
```

**Parameters:**
- `name`: Unique tool identifier
- `description`: Clear description for LLM
- `parameters`: JSON Schema for validation
- `execute`: Implementation function

**ToolDetails:**
```typescript
interface ToolDetails {
  context: {
    history: ConversationItem[];
    [key: string]: any;
  };
}
```

**Example:**
```typescript
const myTool = tool({
  name: 'calculate',
  description: 'Perform basic math calculations',
  parameters: {
    type: 'object',
    properties: {
      operation: {
        type: 'string',
        enum: ['add', 'subtract', 'multiply', 'divide']
      },
      a: { type: 'number' },
      b: { type: 'number' }
    },
    required: ['operation', 'a', 'b'],
    additionalProperties: false
  },
  execute: async (input) => {
    const { operation, a, b } = input;
    switch (operation) {
      case 'add': return { result: a + b };
      case 'subtract': return { result: a - b };
      case 'multiply': return { result: a * b };
      case 'divide': return { result: a / b };
    }
  }
});
```

## Events

### Client → Server Events

#### conversation.item.create
Create a new conversation item.

```typescript
{
  type: 'conversation.item.create',
  item: {
    id: string;
    type: 'message';
    role: 'user' | 'assistant';
    content: Array<{
      type: 'input_text' | 'text';
      text: string;
    }>;
  }
}
```

#### response.create
Request assistant response.

```typescript
{
  type: 'response.create',
  response?: {
    modalities?: ['text', 'audio'];
    instructions?: string;
  }
}
```

#### session.update
Update session configuration.

```typescript
{
  type: 'session.update',
  session: {
    turn_detection?: {
      type: 'server_vad' | null;
      threshold?: number;
      prefix_padding_ms?: number;
      silence_duration_ms?: number;
      create_response?: boolean;
    };
  }
}
```

#### input_audio_buffer.clear
Clear audio input buffer.

```typescript
{
  type: 'input_audio_buffer.clear'
}
```

#### input_audio_buffer.commit
Commit audio buffer for processing.

```typescript
{
  type: 'input_audio_buffer.commit'
}
```

### Server → Client Events

#### conversation.item.created
New conversation item created.

```typescript
{
  type: 'conversation.item.created',
  item: {
    id: string;
    object: 'realtime.item';
    type: 'message' | 'function_call';
    role: 'user' | 'assistant' | 'system';
    content: Array<ContentPart>;
    call_id?: string;
    name?: string;
    arguments?: string;
  }
}
```

#### response.audio.delta
Audio chunk received.

```typescript
{
  type: 'response.audio.delta',
  response_id: string;
  item_id: string;
  output_index: number;
  content_index: number;
  delta: string; // Base64 audio
}
```

#### response.function_call
Tool invocation.

```typescript
{
  type: 'response.function_call',
  response_id: string;
  item_id: string;
  output_index: number;
  call_id: string;
  name: string;
  arguments: string; // JSON string
}
```

#### agent_handoff
Agent transfer event.

```typescript
{
  type: 'agent_handoff',
  agent: string;
  context: {
    history: ConversationItem[];
  }
}
```

#### guardrail_tripped
Content moderation triggered.

```typescript
{
  type: 'guardrail_tripped',
  category: 'OFFENSIVE' | 'OFF_BRAND' | 'VIOLENCE' | 'NONE';
  message_id: string;
}
```

## Types

### Core Types

```typescript
type SessionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

interface TranscriptItem {
  itemId: string;
  createdAtMs: number;
  type: 'MESSAGE' | 'BREADCRUMB';
  role?: 'user' | 'assistant';
  title?: string;
  data?: any;
  expanded?: boolean;
  isHidden?: boolean;
  timestamp?: string;
  guardrailResult?: GuardrailResultType;
}

interface LoggedEvent {
  id: string;
  timestamp: string;
  direction: 'client' | 'server';
  eventName: string;
  eventData?: any;
  expanded: boolean;
}

interface GuardrailResultType {
  category: 'OFFENSIVE' | 'OFF_BRAND' | 'VIOLENCE' | 'NONE';
}
```

### Connect Options

```typescript
interface ConnectOptions {
  getEphemeralKey: () => Promise<string>;
  initialAgents: RealtimeAgent[];
  audioElement?: HTMLAudioElement;
  extraContext?: Record<string, any>;
  outputGuardrails?: any[];
}
```

### Tool Types

```typescript
interface FunctionTool {
  name: string;
  description: string;
  parameters: JSONSchema;
  execute: (input: any, details?: any) => Promise<any>;
}

interface ToolDetails {
  context: {
    history: ConversationItem[];
    [key: string]: any;
  };
}
```

### Audio Configuration

```typescript
type AudioFormat = 'pcm16' | 'g711_ulaw' | 'g711_alaw';

interface AudioConfig {
  inputAudioFormat: AudioFormat;
  outputAudioFormat: AudioFormat;
  inputAudioTranscription?: {
    model: string;
  };
}
```

## Error Handling

### Connection Errors

```typescript
try {
  await connect(options);
} catch (error) {
  if (error.message.includes('apiKey')) {
    // Handle authentication error
  } else if (error.message.includes('network')) {
    // Handle network error
  }
}
```

### Tool Execution Errors

```typescript
execute: async (input) => {
  try {
    const result = await someOperation(input);
    return { success: true, data: result };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      code: error.code
    };
  }
}
```

### Event Error Handling

```typescript
session.on('error', (error) => {
  console.error('Session error:', error);
  // Handle based on error type
});
```

## Best Practices

1. **Type Safety**: Use TypeScript types for all parameters
2. **Error Handling**: Always handle async errors in tools
3. **Event Cleanup**: Remove event listeners on unmount
4. **State Management**: Use provided hooks for state
5. **Tool Validation**: Use JSON Schema for parameters
6. **Context Usage**: Access conversation history when needed
7. **Memoization**: Memoize expensive computations