import { z } from 'zod';

/**
 * Defines the allowed moderation categories for content.
 */
export const MODERATION_CATEGORIES = [
  'OFFENSIVE',
  'OFF_BRAND',
  'VIOLENCE',
  'NONE',
] as const;

/**
 * Represents a category for content moderation.
 */
export type ModerationCategory = (typeof MODERATION_CATEGORIES)[number];

/**
 * Zod schema for validating ModerationCategory.
 */
export const ModerationCategoryZod = z.enum([...MODERATION_CATEGORIES]);

/**
 * Represents the connection status of a session.
 */
export type SessionStatus = 'DISCONNECTED' | 'CONNECTING' | 'CONNECTED';

/**
 * Defines the properties of a tool parameter.
 */
export interface ToolParameterProperty {
  /** The data type of the parameter (e.g., 'string', 'number', 'boolean', 'object', 'array'). */
  type: string;
  /** A description of the parameter's purpose. */
  description?: string;
  /** An array of allowed values for the parameter, if it's an enum. */
  enum?: string[];
  /** A regular expression pattern for string validation. */
  pattern?: string;
  /** For 'object' types, defines the properties of the object. */
  properties?: Record<string, ToolParameterProperty>;
  /** An array of required property names for 'object' types. */
  required?: string[];
  /** Indicates if additional properties are allowed for 'object' types. */
  additionalProperties?: boolean;
  /** For 'array' types, defines the properties of the array items. */
  items?: ToolParameterProperty;
}

/**
 * Defines the parameters for a tool.
 */
export interface ToolParameters {
  /** The data type of the parameters (typically 'object'). */
  type: string;
  /** A map of parameter names to their definitions. */
  properties: Record<string, ToolParameterProperty>;
  /** An array of required parameter names. */
  required?: string[];
  /** Indicates if additional properties are allowed for the parameters object. */
  additionalProperties?: boolean;
}

/**
 * Represents a tool that an agent can use.
 */
export interface Tool {
  /** The type of the tool, typically 'function'. */
  type: 'function';
  /** The name of the tool. */
  name: string;
  /** A description of what the tool does. */
  description: string;
  /** The parameters that the tool accepts. */
  parameters: ToolParameters;
}

/**
 * Defines the configuration for an agent.
 */
export interface AgentConfig {
  /** The unique name of the agent. */
  name: string;
  /** A public description of the agent, used for agent transfer tools. */
  publicDescription: string;
  /** Instructions for the agent's behavior. */
  instructions: string;
  /** An array of tools that the agent can use. */
  tools: Tool[];
  /**
   * A record of functions that implement the logic for each tool.
   * @param args - The arguments passed to the tool function.
   * @param transcriptLogsFiltered - Filtered transcript logs.
   * @param addTranscriptBreadcrumb - Optional function to add a breadcrumb to the transcript.
   */
  toolLogic?: Record<
    string,
    (
      args: any,
      transcriptLogsFiltered: TranscriptItem[],
      addTranscriptBreadcrumb?: (title: string, data?: any) => void
    ) => Promise<any> | any
  >;
  /**
   * An array of agents that this agent can transfer to, or objects with their name and public description.
   */
  downstreamAgents?:
    | AgentConfig[]
    | { name: string; publicDescription: string }[];
}

/**
 * A record of all available agent configurations, keyed by scenario name.
 */
export type AllAgentConfigsType = Record<string, AgentConfig[]>;

/**
 * Represents the result of a guardrail check.
 */
export interface GuardrailResultType {
  /** The status of the guardrail check ('IN_PROGRESS' or 'DONE'). */
  status: 'IN_PROGRESS' | 'DONE';
  /** Optional text that was tested by the guardrail. */
  testText?: string;
  /** The moderation category identified by the guardrail. */
  category?: ModerationCategory;
  /** A rationale for the guardrail's decision. */
  rationale?: string;
}

/**
 * Represents an item in the conversation transcript.
 */
export interface TranscriptItem {
  /** A unique identifier for the transcript item. */
  itemId: string;
  /** The type of the transcript item ('MESSAGE' or 'BREADCRUMB'). */
  type: 'MESSAGE' | 'BREADCRUMB';
  /** The role of the speaker ('user' or 'assistant'), if it's a message. */
  role?: 'user' | 'assistant';
  /** The title of the transcript item, especially for breadcrumbs. */
  title?: string;
  /** Additional data associated with the transcript item. */
  data?: Record<string, any>;
  /** Indicates if the item is expanded in the UI. */
  expanded: boolean;
  /** The timestamp when the item was created. */
  timestamp: string;
  /** The creation timestamp in milliseconds. */
  createdAtMs: number;
  /** The status of the message ('IN_PROGRESS' or 'DONE'). */
  status: 'IN_PROGRESS' | 'DONE';
  /** Indicates if the item should be hidden from the UI. */
  isHidden: boolean;
  /** The result of any guardrail checks on this item. */
  guardrailResult?: GuardrailResultType;
}

/**
 * Represents a log entry in the event log.
 * @deprecated Use `LoggedEvent` instead for more detailed event logging.
 */
export interface Log {
  /** A unique identifier for the log entry. */
  id: number;
  /** The timestamp of the log entry. */
  timestamp: string;
  /** The direction of the event ('client' or 'server'). */
  direction: string;
  /** The name of the event. */
  eventName: string;
  /** The data associated with the event. */
  data: any;
  /** Indicates if the log entry is expanded in the UI. */
  expanded: boolean;
  /** The type of the log entry. */
  type: string;
}

/**
 * Represents a server-side event received from the Realtime API.
 */
export interface ServerEvent {
  /** The type of the server event. */
  type: string;
  /** Optional unique identifier for the event. */
  event_id?: string;
  /** Optional unique identifier for the conversation item. */
  item_id?: string;
  /** Optional transcript content. */
  transcript?: string;
  /** Optional delta content for streaming responses. */
  delta?: string;
  /** Session-related information. */
  session?: {
    /** The session ID. */
    id?: string;
  };
  /** Conversation item details. */
  item?: {
    /** The item ID. */
    id?: string;
    /** The object type of the item. */
    object?: string;
    /** The type of the item. */
    type?: string;
    /** The status of the item. */
    status?: string;
    /** The name of the item (e.g., for tool calls). */
    name?: string;
    /** Arguments for tool calls. */
    arguments?: string;
    /** The role of the speaker ('user' or 'assistant'). */
    role?: 'user' | 'assistant';
    /** Content of the conversation item. */
    content?: {
      /** The type of content. */
      type?: string;
      /** Transcript content. */
      transcript?: string | null;
      /** Text content. */
      text?: string;
    }[];
  };
  /** Response details from the server. */
  response?: {
    /** Array of output objects. */
    output?: {
      /** Output ID. */
      id: string;
      /** Output type. */
      type?: string;
      /** Output name. */
      name?: string;
      /** Output arguments. */
      arguments?: any;
      /** Call ID. */
      call_id?: string;
      /** Output role. */
      role: string;
      /** Output content. */
      content?: any;
    }[];
    /** Metadata associated with the response. */
    metadata: Record<string, any>;
    /** Details about the status, including errors. */
    status_details?: {
      /** Error object, if any. */
      error?: any;
    };
  };
}

/**
 * Represents a logged event with more detailed information.
 */
export interface LoggedEvent {
  /** A unique identifier for the logged event. */
  id: number;
  /** The direction of the event ('client' or 'server'). */
  direction: 'client' | 'server';
  /** Indicates if the log entry is expanded in the UI. */
  expanded: boolean;
  /** The timestamp of the event. */
  timestamp: string;
  /** The name of the event. */
  eventName: string;
  /** The data associated with the event. */
  eventData: Record<string, any>;
}

/**
 * Zod schema for validating GuardrailOutput.
 */
export const GuardrailOutputZod = z.object({
  /** The rationale for the moderation decision. */
  moderationRationale: z.string(),
  /** The category of moderation. */
  moderationCategory: ModerationCategoryZod,
  /** Optional text that was tested. */
  testText: z.string().optional(),
});

/**
 * Represents the output of a guardrail check.
 */
export type GuardrailOutput = z.infer<typeof GuardrailOutputZod>;
