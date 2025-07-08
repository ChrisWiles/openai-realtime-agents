import { zodTextFormat } from 'openai/helpers/zod';
import { type GuardrailOutput, GuardrailOutputZod } from '@/app/types';

/**
 * Validates the realtime output according to moderation policies by calling the /api/responses endpoint.
 * This function prevents the realtime model from responding in undesired ways by sending it a corrective message.
 *
 * @param message The message to be classified.
 * @param companyName The name of the company, used for context in classification. Defaults to 'newTelco'.
 * @returns A Promise that resolves to a GuardrailOutput indicating the moderation result.
 * @throws {Error} If there's an error with the API response or parsing the guardrail output.
 */
export async function runGuardrailClassifier(
  message: string,
  companyName: string = 'newTelco'
): Promise<GuardrailOutput> {
  const messages = [
    {
      role: 'user',
      content: `You are an expert at classifying text according to moderation policies. Consider the provided message, analyze potential classes from output_classes, and output the best classification. Output json, following the provided schema. Keep your analysis and reasoning short and to the point, maximum 2 sentences.

      <info>
      - Company name: ${companyName}
      </info>

      <message>
      ${message}
      </message>

      <output_classes>
      - OFFENSIVE: Content that includes hate speech, discriminatory language, insults, slurs, or harassment.
      - OFF_BRAND: Content that discusses competitors in a disparaging way.
      - VIOLENCE: Content that includes explicit threats, incitement of harm, or graphic descriptions of physical injury or violence.
      - NONE: If no other classes are appropriate and the message is fine.
      </output_classes>
      `,
    },
  ];

  const response = await fetch('/api/responses', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      input: messages,
      text: {
        format: zodTextFormat(GuardrailOutputZod, 'output_format'),
      },
    }),
  });

  if (!response.ok) {
    console.warn('Server returned an error:', response);
    return Promise.reject('Error with runGuardrailClassifier.');
  }

  const data = await response.json();

  try {
    const output = GuardrailOutputZod.parse(data.output_parsed);
    return {
      ...output,
      testText: message,
    };
  } catch (error) {
    console.error(
      'Error parsing the message content as GuardrailOutput:',
      error
    );
    return Promise.reject('Failed to parse guardrail output.');
  }
}

/**
 * Represents the result of a realtime output guardrail check.
 */
export interface RealtimeOutputGuardrailResult {
  /** Indicates whether a tripwire was triggered. */
  tripwireTriggered: boolean;
  /** Additional information about the output, typically the GuardrailOutput. */
  outputInfo: any;
}

/**
 * Arguments for a realtime output guardrail execution.
 */
export interface RealtimeOutputGuardrailArgs {
  /** The agent's output message to be checked. */
  agentOutput: string;
  /** The agent object (optional). */
  agent?: any;
  /** Additional context (optional). */
  context?: any;
}

/**
 * Creates a moderation guardrail bound to a specific company name for output moderation purposes.
 *
 * @param companyName The name of the company to bind the guardrail to.
 * @returns An object representing the moderation guardrail with an `execute` method.
 */
export function createModerationGuardrail(companyName: string) {
  return {
    name: 'moderation_guardrail',

    async execute({
      agentOutput,
    }: RealtimeOutputGuardrailArgs): Promise<RealtimeOutputGuardrailResult> {
      try {
        const res = await runGuardrailClassifier(agentOutput, companyName);
        const triggered = res.moderationCategory !== 'NONE';
        return {
          tripwireTriggered: triggered,
          outputInfo: res,
        };
      } catch {
        return {
          tripwireTriggered: false,
          outputInfo: { error: 'guardrail_failed' },
        };
      }
    },
  } as const;
}
