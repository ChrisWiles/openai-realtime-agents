# Agent Development Guide

This guide covers everything you need to know about creating and configuring agents for the OpenAI Realtime API.

## Table of Contents
- [Agent Basics](#agent-basics)
- [Creating Your First Agent](#creating-your-first-agent)
- [Agent Instructions Best Practices](#agent-instructions-best-practices)
- [Tool Development](#tool-development)
- [Handoff Patterns](#handoff-patterns)
- [Advanced Patterns](#advanced-patterns)
- [Testing Agents](#testing-agents)

## Agent Basics

### What is an Agent?

An agent is an AI assistant with specific capabilities, personality, and behavior. Agents can:
- Handle conversations with users
- Execute tools (functions) to perform actions
- Transfer conversations to other specialized agents
- Maintain context throughout the interaction

### Agent Structure

```typescript
import { RealtimeAgent } from '@openai/agents/realtime';

export const myAgent = new RealtimeAgent({
  name: 'myAgent',                          // Unique identifier
  voice: 'sage',                            // Voice profile
  instructions: 'Your detailed prompt...',   // Behavior definition
  tools: [],                                // Available functions
  handoffs: [],                             // Other agents to transfer to
  handoffDescription: 'What this agent does' // Used by other agents
});
```

## Creating Your First Agent

### Step 1: Define the Agent

Create a new file in `src/app/agentConfigs/`:

```typescript
// src/app/agentConfigs/myScenario/weatherAgent.ts
import { RealtimeAgent, tool } from '@openai/agents/realtime';

export const weatherAgent = new RealtimeAgent({
  name: 'weatherAgent',
  voice: 'sage',
  handoffDescription: 'Agent that provides weather information',
  instructions: `
You are a friendly weather assistant. Your role is to:
- Provide current weather information
- Give weather forecasts
- Suggest clothing based on weather
- Be conversational and helpful

Always:
- Speak naturally and conversationally
- Keep responses concise (1-2 sentences)
- Use the get_weather tool when asked about weather
- Offer additional helpful context when appropriate
`,
  tools: [
    tool({
      name: 'get_weather',
      description: 'Get current weather for a location',
      parameters: {
        type: 'object',
        properties: {
          location: {
            type: 'string',
            description: 'City name or zip code'
          }
        },
        required: ['location'],
        additionalProperties: false
      },
      execute: async (input: any) => {
        // Simulated weather data
        const { location } = input;
        return {
          location,
          temperature: 72,
          conditions: 'Partly cloudy',
          humidity: 65,
          wind_speed: 10
        };
      }
    })
  ],
  handoffs: []
});
```

### Step 2: Create the Scenario

```typescript
// src/app/agentConfigs/myScenario/index.ts
import { weatherAgent } from './weatherAgent';

export const myScenario = [weatherAgent];
```

### Step 3: Register the Scenario

Add to `src/app/agentConfigs/index.ts`:

```typescript
import { myScenario } from './myScenario';

export const allAgentSets: Record<string, RealtimeAgent[]> = {
  // ... existing scenarios
  myScenario: myScenario,
};
```

## Agent Instructions Best Practices

### 1. Be Clear and Specific

```typescript
// ❌ Poor
instructions: "You are a helpful assistant."

// ✅ Good
instructions: `
You are a customer service agent for TechStore. You help customers with:
- Product inquiries
- Order status checks
- Return processing
- Technical support

Always:
- Greet customers warmly
- Ask clarifying questions when needed
- Offer to check order status when relevant
- Transfer to technical support for complex issues
`
```

### 2. Voice-First Design

```typescript
instructions: `
You are a voice assistant. Keep these principles in mind:

- Speak naturally, as if in a phone conversation
- Keep responses brief (1-2 sentences max)
- Use acknowledgments like "Got it" or "I understand"
- Avoid long lists - offer 2-3 options max
- Use filler words sparingly: "um", "well", "you know"
- Pause naturally between thoughts
`
```

### 3. State Management

For complex flows, use state machines:

```typescript
instructions: `
You follow this conversation flow:

STATE: greeting
- Greet the user warmly
- Ask how you can help
- Listen for their intent
- Transition to: identify_need

STATE: identify_need
- Understand what the user wants
- Ask clarifying questions if needed
- Once clear, transition to: provide_solution

STATE: provide_solution
- Address their need directly
- Use tools if necessary
- Confirm satisfaction
- Transition to: closing

Always track your current state and follow the flow.
`
```

## Tool Development

### Basic Tool Structure

```typescript
tool({
  name: 'tool_name',
  description: 'Clear description for the LLM to understand when to use this',
  parameters: {
    type: 'object',
    properties: {
      param1: {
        type: 'string',
        description: 'What this parameter is for'
      },
      param2: {
        type: 'number',
        minimum: 0,
        maximum: 100
      }
    },
    required: ['param1'],
    additionalProperties: false
  },
  execute: async (input: any, details?: any) => {
    // Tool implementation
    const { param1, param2 } = input;
    
    // Access conversation context if needed
    const context = details?.context;
    
    // Perform action
    const result = await someAsyncOperation(param1, param2);
    
    // Return structured data
    return {
      success: true,
      data: result
    };
  }
});
```

### Tool Best Practices

1. **Clear Descriptions**: Help the LLM understand when to use the tool
2. **Input Validation**: Use JSON Schema for parameter validation
3. **Error Handling**: Return clear error messages
4. **Context Access**: Use `details.context` for conversation history
5. **Async Operations**: Support async/await for external calls

### Example: Database Query Tool

```typescript
tool({
  name: 'query_customer_orders',
  description: 'Look up customer orders by email or order ID',
  parameters: {
    type: 'object',
    properties: {
      email: {
        type: 'string',
        format: 'email'
      },
      order_id: {
        type: 'string',
        pattern: '^ORD-[0-9]{6}$'
      }
    },
    oneOf: [
      { required: ['email'] },
      { required: ['order_id'] }
    ],
    additionalProperties: false
  },
  execute: async (input: any) => {
    try {
      // Simulate database query
      if (input.email) {
        return {
          orders: [
            {
              order_id: 'ORD-123456',
              status: 'Shipped',
              total: 99.99,
              items: ['Widget Pro', 'Widget Case']
            }
          ]
        };
      } else {
        return {
          order: {
            order_id: input.order_id,
            status: 'Delivered',
            tracking: '1Z999AA1234567890'
          }
        };
      }
    } catch (error) {
      return {
        error: 'Failed to query orders',
        details: error.message
      };
    }
  }
});
```

## Handoff Patterns

### Simple Linear Handoff

```typescript
// Agent A can only go to Agent B
agentA.handoffs = [agentB];

// Agent B can go back to A or forward to C
agentB.handoffs = [agentA, agentC];
```

### Full Mesh Handoff

```typescript
// All agents can transfer to any other agent
const agents = [authAgent, salesAgent, supportAgent];

agents.forEach(agent => {
  agent.handoffs = agents.filter(a => a !== agent);
});
```

### Conditional Handoff

In agent instructions:

```typescript
instructions: `
Determine the user's need and transfer accordingly:

- If they want to make a purchase → Transfer to salesAgent
- If they have a technical issue → Transfer to supportAgent  
- If they want to return something → Transfer to returnsAgent
- If you cannot help → Transfer to humanAgent

Say "Let me connect you with [specialist]" before transferring.
`
```

## Advanced Patterns

### 1. Supervisor Pattern

Create a junior agent that delegates complex tasks:

```typescript
const juniorAgent = new RealtimeAgent({
  name: 'junior',
  instructions: 'Handle basic queries. For anything complex, use the ask_supervisor tool.',
  tools: [
    tool({
      name: 'ask_supervisor',
      description: 'Get help from a senior agent',
      parameters: {
        type: 'object',
        properties: {
          question: { type: 'string' },
          context: { type: 'string' }
        },
        required: ['question'],
        additionalProperties: false
      },
      execute: async (input) => {
        // Call GPT-4.1 or another model
        const response = await callSupervisorModel(input);
        return { guidance: response };
      }
    })
  ]
});
```

### 2. Multi-Step Flows

Use tools to maintain flow state:

```typescript
tool({
  name: 'update_flow_state',
  description: 'Track progress through multi-step processes',
  parameters: {
    type: 'object',
    properties: {
      step: {
        type: 'string',
        enum: ['started', 'verified', 'processing', 'completed']
      },
      data: { type: 'object' }
    },
    required: ['step'],
    additionalProperties: false
  },
  execute: async (input, details) => {
    // Store state in context or external system
    const flowId = details.context.flow_id || generateId();
    await storeFlowState(flowId, input.step, input.data);
    return { flow_id: flowId, step: input.step };
  }
})
```

### 3. External Integrations

```typescript
tool({
  name: 'send_sms',
  description: 'Send SMS confirmation to user',
  parameters: {
    type: 'object',
    properties: {
      phone: {
        type: 'string',
        pattern: '^\\+1[0-9]{10}$'
      },
      message: {
        type: 'string',
        maxLength: 160
      }
    },
    required: ['phone', 'message'],
    additionalProperties: false
  },
  execute: async (input) => {
    // Integration with SMS service
    const result = await twilioClient.messages.create({
      to: input.phone,
      from: process.env.TWILIO_PHONE,
      body: input.message
    });
    return {
      sent: true,
      message_id: result.sid
    };
  }
})
```

## Testing Agents

### 1. Test Conversations

Create test scenarios:

```typescript
// tests/weatherAgent.test.ts
const testConversations = [
  {
    user: "What's the weather in New York?",
    expectedTool: "get_weather",
    expectedParams: { location: "New York" }
  },
  {
    user: "Will I need an umbrella today in Seattle?",
    expectedTool: "get_weather",
    expectedParams: { location: "Seattle" }
  }
];
```

### 2. Tool Testing

```typescript
// Test tool execution directly
const result = await weatherAgent.tools[0].execute({
  location: "Boston"
});

expect(result).toHaveProperty('temperature');
expect(result.location).toBe('Boston');
```

### 3. Handoff Testing

Test handoff triggers:

```typescript
const handoffPhrases = [
  "I want to buy something",        // → salesAgent
  "My device isn't working",         // → supportAgent
  "I need to return an item",        // → returnsAgent
];
```

### 4. Edge Cases

Consider:
- Invalid tool parameters
- Network failures in tool execution
- Ambiguous user requests
- Multiple valid handoff options
- Context loss during handoffs

## Tips for Success

1. **Start Simple**: Begin with a basic agent and add complexity gradually
2. **Test Voice Interactions**: Actually speak to your agent to test naturalness
3. **Monitor Tool Usage**: Log tool calls to understand agent behavior
4. **Iterate on Instructions**: Refine based on real conversations
5. **Handle Errors Gracefully**: Always have fallback responses
6. **Document Tool Behavior**: Help future developers understand your tools
7. **Use TypeScript**: Leverage types for better tool parameter validation

## Common Pitfalls

1. **Over-Engineering**: Don't create complex state machines for simple tasks
2. **Verbose Responses**: Remember this is voice-first - keep it brief
3. **Too Many Tools**: Agents perform better with focused tool sets
4. **Unclear Handoffs**: Users should understand why they're being transferred
5. **Missing Context**: Always pass relevant context during handoffs

## Next Steps

- Explore the example agents in `src/app/agentConfigs/`
- Try modifying an existing agent before creating new ones
- Test your agents with real voice interactions
- Review the [Voice Agent Metaprompt](../src/app/agentConfigs/voiceAgentMetaprompt.txt) for prompt engineering tips