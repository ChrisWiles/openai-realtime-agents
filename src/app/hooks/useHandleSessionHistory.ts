'use client';

import { useRef } from 'react';
import { useEvent } from '@/app/contexts/EventContext';
import { useTranscript } from '@/app/contexts/TranscriptContext';

/**
 * A React hook that provides handlers for various session history events,
 * integrating with the EventContext and TranscriptContext to manage UI state.
 */
export function useHandleSessionHistory() {
  const {
    transcriptItems,
    addTranscriptBreadcrumb,
    addTranscriptMessage,
    updateTranscriptMessage,
    updateTranscriptItem,
  } = useTranscript();

  const { logServerEvent } = useEvent();

  /* ----------------------- helpers ------------------------- */

  /**
   * Extracts and concatenates text content from a message's content array.
   * @param content An array of content parts, potentially including text and audio transcriptions.
   * @returns The combined text content as a string.
   */
  const extractMessageText = (content: any[] = []): string => {
    if (!Array.isArray(content)) return '';

    return content
      .map((c) => {
        if (!c || typeof c !== 'object') return '';
        if (c.type === 'input_text') return c.text ?? '';
        if (c.type === 'audio') return c.transcript ?? '';
        return '';
      })
      .filter(Boolean)
      .join('\n');
  };

  /**
   * Finds a function call by its name within a content array.
   * @param name The name of the function call to find.
   * @param content An array of content parts.
   * @returns The found function call object, or undefined if not found.
   */
  const extractFunctionCallByName = (
    name: string,
    content: any[] = []
  ): any => {
    if (!Array.isArray(content)) return undefined;
    return content.find(
      (c: any) => c.type === 'function_call' && c.name === name
    );
  };

  /**
   * Attempts to parse a string as JSON. If parsing fails, returns the original value.
   * @param val The value to attempt to parse.
   * @returns The parsed JSON object, or the original value if parsing fails.
   */
  const maybeParseJson = (val: any) => {
    if (typeof val === 'string') {
      try {
        return JSON.parse(val);
      } catch {
        console.warn('Failed to parse JSON:', val);
        return val;
      }
    }
    return val;
  };

  /**
   * Extracts the last assistant message from a history array.
   * @param history An array of history items.
   * @returns The last assistant message object, or undefined if not found.
   */
  const extractLastAssistantMessage = (history: any[] = []): any => {
    if (!Array.isArray(history)) return undefined;
    return history
      .reverse()
      .find((c: any) => c.type === 'message' && c.role === 'assistant');
  };

  /**
   * Recursively extracts moderation details from an object.
   * @param obj The object to extract moderation from.
   * @returns The moderation object, or undefined if not found.
   */
  const extractModeration = (obj: any) => {
    if ('moderationCategory' in obj) return obj;
    if ('outputInfo' in obj) return extractModeration(obj.outputInfo);
    if ('output' in obj) return extractModeration(obj.output);
    if ('result' in obj) return extractModeration(obj.result);
  };

  /**
   * Sketchily detects a guardrail message from text content.
   * This is a temporary helper until the SDK provides a more robust mechanism.
   * @param text The text content to check.
   * @returns The JSON string of failure details if a guardrail message is detected, otherwise undefined.
   */
  const sketchilyDetectGuardrailMessage = (text: string) => {
    return text.match(/Failure Details: (\{.*?\})/)?.[1];
  };

  /* ----------------------- event handlers ------------------------- */

  /**
   * Handles the 'agent_tool_start' event, adding a breadcrumb to the transcript.
   * @param details Event details, including context history.
   * @param _agent The agent object (unused).
   * @param functionCall The function call details.
   */
  function handleAgentToolStart(details: any, _agent: any, functionCall: any) {
    const lastFunctionCall = extractFunctionCallByName(
      functionCall.name,
      details?.context?.history
    );
    const function_name = lastFunctionCall?.name;
    const function_args = lastFunctionCall?.arguments;

    addTranscriptBreadcrumb(`function call: ${function_name}`, function_args);
  }

  /**
   * Handles the 'agent_tool_end' event, adding a breadcrumb to the transcript with the tool result.
   * @param details Event details, including context history.
   * @param _agent The agent object (unused).
   * @param _functionCall The function call details (unused).
   * @param result The result of the tool call.
   */
  function handleAgentToolEnd(
    details: any,
    _agent: any,
    _functionCall: any,
    result: any
  ) {
    const lastFunctionCall = extractFunctionCallByName(
      _functionCall.name,
      details?.context?.history
    );
    addTranscriptBreadcrumb(
      `function call result: ${lastFunctionCall?.name}`,
      maybeParseJson(result)
    );
  }

  /**
   * Handles the 'history_added' event, adding new messages to the transcript.
   * @param item The history item that was added.
   */
  function handleHistoryAdded(item: any) {
    console.log('[handleHistoryAdded] ', item);
    if (!item || item.type !== 'message') return;

    const { itemId, role, content = [] } = item;
    if (itemId && role) {
      const isUser = role === 'user';
      let text = extractMessageText(content);

      if (isUser && !text) {
        text = '[Transcribing...]';
      }

      // If the guardrail has been tripped, this message is a message that gets sent to the
      // assistant to correct it, so we add it as a breadcrumb instead of a message.
      const guardrailMessage = sketchilyDetectGuardrailMessage(text);
      if (guardrailMessage) {
        const failureDetails = JSON.parse(guardrailMessage);
        addTranscriptBreadcrumb('Output Guardrail Active', {
          details: failureDetails,
        });
      } else {
        addTranscriptMessage(itemId, role, text);
      }
    }
  }

  /**
   * Handles the 'history_updated' event, updating existing messages in the transcript.
   * @param items An array of history items that were updated.
   */
  function handleHistoryUpdated(items: any[]) {
    console.log('[handleHistoryUpdated] ', items);
    items.forEach((item: any) => {
      if (!item || item.type !== 'message') return;

      const { itemId, content = [] } = item;

      const text = extractMessageText(content);

      if (text) {
        updateTranscriptMessage(itemId, text, false);
      }
    });
  }

  /**
   * Handles the 'response.audio_transcript.delta' event, updating the transcript with partial transcriptions.
   * @param item The event item containing the delta transcription.
   */
  function handleTranscriptionDelta(item: any) {
    const itemId = item.item_id;
    const deltaText = item.delta || '';
    if (itemId) {
      updateTranscriptMessage(itemId, deltaText, true);
    }
  }

  /**
   * Handles the 'conversation.item.input_audio_transcription.completed' or 'response.audio_transcript.done' event,
   * finalizing the transcription and updating the transcript item status.
   * @param item The event item containing the completed transcription.
   */
  function handleTranscriptionCompleted(item: any) {
    // History updates don't reliably end in a completed item,
    // so we need to handle finishing up when the transcription is completed.
    const itemId = item.item_id;
    const finalTranscript =
      !item.transcript || item.transcript === '\n'
        ? '[inaudible]'
        : item.transcript;
    if (itemId) {
      updateTranscriptMessage(itemId, finalTranscript, false);
      // Use the ref to get the latest transcriptItems
      const transcriptItem = transcriptItems.find((i) => i.itemId === itemId);
      updateTranscriptItem(itemId, { status: 'DONE' });

      // If guardrailResult still pending, mark PASS.
      if (transcriptItem?.guardrailResult?.status === 'IN_PROGRESS') {
        updateTranscriptItem(itemId, {
          guardrailResult: {
            status: 'DONE',
            category: 'NONE',
            rationale: '',
          },
        });
      }
    }
  }

  /**
   * Handles the 'guardrail_tripped' event, updating the transcript with moderation results.
   * @param details Event details.
   * @param _agent The agent object (unused).
   * @param guardrail The guardrail details.
   */
  function handleGuardrailTripped(details: any, _agent: any, guardrail: any) {
    console.log('[guardrail tripped]', details, _agent, guardrail);
    const moderation = extractModeration(guardrail.result.output.outputInfo);
    logServerEvent({ type: 'guardrail_tripped', payload: moderation });

    // find the last assistant message in details.context.history
    const lastAssistant = extractLastAssistantMessage(
      details?.context?.history
    );

    if (lastAssistant && moderation) {
      const category = moderation.moderationCategory ?? 'NONE';
      const rationale = moderation.moderationRationale ?? '';
      const offendingText: string | undefined = moderation?.testText;

      updateTranscriptItem(lastAssistant.itemId, {
        guardrailResult: {
          status: 'DONE',
          category,
          rationale,
          testText: offendingText,
        },
      });
    }
  }

  const handlersRef = useRef({
    handleAgentToolStart,
    handleAgentToolEnd,
    handleHistoryUpdated,
    handleHistoryAdded,
    handleTranscriptionDelta,
    handleTranscriptionCompleted,
    handleGuardrailTripped,
  });

  return handlersRef;
}
