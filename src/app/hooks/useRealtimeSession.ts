import {
  OpenAIRealtimeWebRTC,
  type RealtimeAgent,
  RealtimeSession,
} from '@openai/agents/realtime';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useEvent } from '../contexts/EventContext';
import { applyCodecPreferences, audioFormatForCodec } from '../lib/codecUtils';
import type { SessionStatus } from '../types';
import { useHandleSessionHistory } from './useHandleSessionHistory';

/**
 * Callbacks for RealtimeSession events.
 */
export interface RealtimeSessionCallbacks {
  /**
   * Callback function invoked when the connection status changes.
   * @param status The new session status.
   */
  onConnectionChange?: (status: SessionStatus) => void;
  /**
   * Callback function invoked when an agent handoff occurs.
   * @param agentName The name of the agent being handed off to.
   */
  onAgentHandoff?: (agentName: string) => void;
}

/**
 * Options for connecting to a RealtimeSession.
 */
export interface ConnectOptions {
  /**
   * A function that returns a Promise resolving to an ephemeral API key.
   */
  getEphemeralKey: () => Promise<string>;
  /**
   * An array of initial RealtimeAgent configurations.
   */
  initialAgents: RealtimeAgent[];
  /**
   * Optional HTMLAudioElement to play the audio output.
   */
  audioElement?: HTMLAudioElement;
  /**
   * Optional extra context to be sent with the session.
   */
  extraContext?: Record<string, any>;
  /**
   * Optional array of output guardrails to apply.
   */
  outputGuardrails?: any[];
  /**
   * Optional voice to use for the agent's responses.
   */
  voice?: string;
}

/**
 * A React hook for managing a RealtimeSession with an AI agent.
 * Provides functions to connect, disconnect, send messages, and control audio.
 *
 * @param callbacks Optional callbacks for session events like connection status changes and agent handoffs.
 * @returns An object containing the session status and control functions.
 */
export function useRealtimeSession(callbacks: RealtimeSessionCallbacks = {}) {
  const sessionRef = useRef<RealtimeSession | null>(null);
  const [status, setStatus] = useState<SessionStatus>('DISCONNECTED');
  const { logClientEvent } = useEvent();

  /**
   * Updates the session status and triggers the onConnectionChange callback.
   * @param s The new session status.
   */
  const updateStatus = useCallback(
    (s: SessionStatus) => {
      setStatus(s);
      callbacks.onConnectionChange?.(s);
      logClientEvent({}, s);
    },
    [callbacks]
  );

  const { logServerEvent } = useEvent();

  const historyHandlers = useHandleSessionHistory().current;

  /**
   * Handles various transport events from the RealtimeSession.
   * @param event The transport event object.
   */
  function handleTransportEvent(event: any) {
    // Handle additional server events that aren't managed by the session
    switch (event.type) {
      case 'conversation.item.input_audio_transcription.completed': {
        historyHandlers.handleTranscriptionCompleted(event);
        break;
      }
      case 'response.audio_transcript.done': {
        historyHandlers.handleTranscriptionCompleted(event);
        break;
      }
      case 'response.audio_transcript.delta': {
        historyHandlers.handleTranscriptionDelta(event);
        break;
      }
      default: {
        logServerEvent(event);
        break;
      }
    }
  }

  const codecParamRef = useRef<string>(
    (typeof window !== 'undefined'
      ? (new URLSearchParams(window.location.search).get('codec') ?? 'opus')
      : 'opus'
    ).toLowerCase()
  );

  /**
   * Callback to apply codec preferences to a PeerConnection.
   * @param pc The RTCPeerConnection to modify.
   */
  const applyCodec = useCallback(
    (pc: RTCPeerConnection) => applyCodecPreferences(pc, codecParamRef.current),
    []
  );

  /**
   * Handles agent handoff events, extracting the new agent's name and triggering the onAgentHandoff callback.
   * @param item The event item containing handoff details.
   */
  const handleAgentHandoff = (item: any) => {
    const history = item.context.history;
    const lastMessage = history[history.length - 1];
    const agentName = lastMessage.name.split('transfer_to_')[1];
    callbacks.onAgentHandoff?.(agentName);
  };

  /**
   * Sets up event listeners for the RealtimeSession instance.
   * This effect runs once when the sessionRef.current is initialized.
   */
  useEffect(() => {
    if (sessionRef.current) {
      // Log server errors
      sessionRef.current.on('error', (...args: any[]) => {
        logServerEvent({
          type: 'error',
          message: args[0],
        });
      });

      // history events
      sessionRef.current.on('agent_handoff', handleAgentHandoff);
      sessionRef.current.on(
        'agent_tool_start',
        historyHandlers.handleAgentToolStart
      );
      sessionRef.current.on(
        'agent_tool_end',
        historyHandlers.handleAgentToolEnd
      );
      sessionRef.current.on(
        'history_updated',
        historyHandlers.handleHistoryUpdated
      );
      sessionRef.current.on(
        'history_added',
        historyHandlers.handleHistoryAdded
      );
      sessionRef.current.on(
        'guardrail_tripped',
        historyHandlers.handleGuardrailTripped
      );

      // additional transport events
      sessionRef.current.on('transport_event', handleTransportEvent);
    }
  }, [sessionRef.current]);

  /**
   * Connects to the RealtimeSession.
   * @param options Connection options including ephemeral key, initial agents, and audio element.
   */
  const connect = useCallback(
    async ({
      getEphemeralKey,
      initialAgents,
      audioElement,
      extraContext,
      outputGuardrails,
      voice = 'alloy',
    }: ConnectOptions) => {
      if (sessionRef.current) return; // already connected

      updateStatus('CONNECTING');

      const ek = await getEphemeralKey();
      const rootAgent = initialAgents[0];

      // This lets you use the codec selector in the UI to force narrow-band (8 kHz) codecs to
      //  simulate how the voice agent sounds over a PSTN/SIP phone call.
      const codecParam = codecParamRef.current;
      const audioFormat = audioFormatForCodec(codecParam);

      sessionRef.current = new RealtimeSession(rootAgent, {
        transport: new OpenAIRealtimeWebRTC({
          audioElement,
          // Set preferred codec before offer creation
          changePeerConnection: async (pc: RTCPeerConnection) => {
            applyCodec(pc);
            return pc;
          },
        }),
        model: 'gpt-4o-realtime-preview-2025-06-03',
        config: {
          inputAudioFormat: audioFormat,
          outputAudioFormat: audioFormat,
          inputAudioTranscription: {
            model: 'gpt-4o-mini-transcribe',
          },
          voice: voice,
        },
        outputGuardrails: outputGuardrails ?? [],
        context: extraContext ?? {},
      });

      await sessionRef.current.connect({ apiKey: ek });
      updateStatus('CONNECTED');
    },
    [callbacks, updateStatus]
  );

  /**
   * Disconnects from the RealtimeSession.
   */
  const disconnect = useCallback(() => {
    sessionRef.current?.close();
    sessionRef.current = null;
    updateStatus('DISCONNECTED');
  }, [updateStatus]);

  /**
   * Asserts that the RealtimeSession is currently connected.
   * @throws Error if the session is not connected.
   */
  const assertconnected = () => {
    if (!sessionRef.current) throw new Error('RealtimeSession not connected');
  };

  /* ----------------------- message helpers ------------------------- */

  /**
   * Interrupts the current agent's speech.
   */
  const interrupt = useCallback(() => {
    sessionRef.current?.interrupt();
  }, []);

  /**
   * Sends user text input to the RealtimeSession.
   * @param text The text message to send.
   */
  const sendUserText = useCallback((text: string) => {
    assertconnected();
    sessionRef.current?.sendMessage(text);
  }, []);

  /**
   * Sends a custom event to the RealtimeSession's transport.
   * @param ev The event object to send.
   */
  const sendEvent = useCallback((ev: any) => {
    sessionRef.current?.transport.sendEvent(ev);
  }, []);

  /**
   * Mutes or unmutes the audio input.
   * @param m True to mute, false to unmute.
   */
  const mute = useCallback((m: boolean) => {
    sessionRef.current?.mute(m);
  }, []);

  /**
   * Starts push-to-talk mode, clearing any buffered audio.
   */
  const pushToTalkStart = useCallback(() => {
    if (!sessionRef.current) return;
    sessionRef.current.transport.sendEvent({
      type: 'input_audio_buffer.clear',
    } as any);
  }, []);

  /**
   * Stops push-to-talk mode, committing the buffered audio and triggering a response.
   */
  const pushToTalkStop = useCallback(() => {
    if (!sessionRef.current) return;
    sessionRef.current.transport.sendEvent({
      type: 'input_audio_buffer.commit',
    } as any);
    sessionRef.current.transport.sendEvent({ type: 'response.create' } as any);
  }, []);

  return {
    status,
    connect,
    disconnect,
    sendUserText,
    sendEvent,
    mute,
    pushToTalkStart,
    pushToTalkStop,
    interrupt,
  } as const;
}
