'use client';
import type { RealtimeAgent } from '@openai/agents/realtime';
import Image from 'next/image';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
// Agent configs
import {
  allAgentSets,
  defaultAgentSetKey,
  scenarioConfigs,
} from '@/app/agentConfigs';
import {
  chatSupervisorCompanyName,
  chatSupervisorScenario,
} from '@/app/agentConfigs/chatSupervisor';
import {
  customerServiceRetailCompanyName,
  customerServiceRetailScenario,
} from '@/app/agentConfigs/customerServiceRetail';
import { createModerationGuardrail } from '@/app/agentConfigs/guardrails';
import {
  intelligentMaterialOrderingCompanyName,
  intelligentMaterialOrderingScenario,
} from '@/app/agentConfigs/intelligentMaterialOrdering';
import { simpleHandoffScenario } from '@/app/agentConfigs/simpleHandoff';
import { useEvent } from '@/app/contexts/EventContext';
// Context providers & hooks
import { useTranscript } from '@/app/contexts/TranscriptContext';
// Types
import type { SessionStatus } from '@/app/types';
import BottomToolbar from './components/BottomToolbar';
import Events from './components/Events';
// UI components
import Transcript from './components/Transcript';
import { useRealtimeSession } from './hooks/useRealtimeSession';

/**
 * A map used by the connection logic for scenarios defined via the SDK.
 * Each key represents a scenario, and its value is an array of RealtimeAgent instances.
 */
const sdkScenarioMap: Record<string, RealtimeAgent[]> = {
  simpleHandoff: simpleHandoffScenario,
  customerServiceRetail: customerServiceRetailScenario,
  chatSupervisor: chatSupervisorScenario,
  intelligentMaterialOrdering: intelligentMaterialOrderingScenario,
};

import useAudioDownload from './hooks/useAudioDownload';
import { useHandleSessionHistory } from './hooks/useHandleSessionHistory';

/**
 * The main application component for the Realtime API Agents Demo.
 * Manages session status, agent configurations, and UI interactions.
 */
function App() {
  const searchParams = useSearchParams()!;

  // ---------------------------------------------------------------------
  // Codec selector – lets you toggle between wide-band Opus (48 kHz)
  // and narrow-band PCMU/PCMA (8 kHz) to hear what the agent sounds like on
  // a traditional phone line and to validate ASR / VAD behaviour under that
  // constraint.
  //
  // We read the `?codec=` query-param and rely on the `changePeerConnection`
  // hook (configured in `useRealtimeSession`) to set the preferred codec
  // before the offer/answer negotiation.
  // ---------------------------------------------------------------------
  const urlCodec = searchParams.get('codec') || 'opus';

  // Agents SDK doesn't currently support codec selection so it is now forced
  // via global codecPatch at module load

  const { addTranscriptMessage, addTranscriptBreadcrumb } = useTranscript();
  const { logClientEvent, logServerEvent } = useEvent();

  const [selectedAgentName, setSelectedAgentName] = useState<string>('');
  const [selectedAgentConfigSet, setSelectedAgentConfigSet] = useState<
    RealtimeAgent[] | null
  >(null);

  const audioElementRef = useRef<HTMLAudioElement | null>(null);
  // Ref to identify whether the latest agent switch came from an automatic handoff
  const handoffTriggeredRef = useRef(false);

  const sdkAudioElement = React.useMemo(() => {
    if (typeof window === 'undefined') return undefined;
    const el = document.createElement('audio');
    el.autoplay = true;
    el.style.display = 'none';
    document.body.appendChild(el);
    return el;
  }, []);

  // Attach SDK audio element once it exists (after first render in browser)
  useEffect(() => {
    if (sdkAudioElement && !audioElementRef.current) {
      audioElementRef.current = sdkAudioElement;
    }
  }, [sdkAudioElement]);

  const { connect, disconnect, sendUserText, sendEvent, interrupt, mute } =
    useRealtimeSession({
      onConnectionChange: (s) => setSessionStatus(s as SessionStatus),
      onAgentHandoff: (agentName: string) => {
        handoffTriggeredRef.current = true;
        setSelectedAgentName(agentName);
      },
    });

  const [sessionStatus, setSessionStatus] =
    useState<SessionStatus>('DISCONNECTED');

  const [isEventsPaneExpanded, setIsEventsPaneExpanded] =
    useState<boolean>(true);
  const [userText, setUserText] = useState<string>('');
  const [isPTTActive, setIsPTTActive] = useState<boolean>(false);
  const [isPTTUserSpeaking, setIsPTTUserSpeaking] = useState<boolean>(false);
  const [isAudioPlaybackEnabled, setIsAudioPlaybackEnabled] = useState<boolean>(
    () => {
      if (typeof window === 'undefined') return true;
      const stored = localStorage.getItem('audioPlaybackEnabled');
      return stored ? stored === 'true' : true;
    }
  );

  const [voice, setVoice] = useState<string>(() => {
    if (typeof window === 'undefined') return 'alloy';
    const stored = localStorage.getItem('voice');
    return stored || 'alloy';
  });

  // Initialize the recording hook.
  const { startRecording, stopRecording, downloadRecording } =
    useAudioDownload();

  /**
   * Sends a client event and logs it.
   * @param eventObj The event object to send.
   * @param eventNameSuffix An optional suffix for the event name in logs.
   */
  const sendClientEvent = (eventObj: any, eventNameSuffix = '') => {
    try {
      sendEvent(eventObj);
      logClientEvent(eventObj, eventNameSuffix);
    } catch (err) {
      console.error('Failed to send via SDK', err);
    }
  };

  useHandleSessionHistory();

  /**
   * Effect to initialize the selected agent configuration based on URL parameters.
   * Redirects to a default agent config if none is specified or found.
   */
  useEffect(() => {
    let finalAgentConfig = searchParams.get('agentConfig');
    if (!finalAgentConfig || !allAgentSets[finalAgentConfig]) {
      finalAgentConfig = defaultAgentSetKey;
      const url = new URL(window.location.toString());
      url.searchParams.set('agentConfig', finalAgentConfig);
      window.location.replace(url.toString());
      return;
    }

    const agents = allAgentSets[finalAgentConfig];
    const agentKeyToUse = agents[0]?.name || '';

    setSelectedAgentName(agentKeyToUse);
    setSelectedAgentConfigSet(agents);
  }, [searchParams]);

  /**
   * Effect to connect to the Realtime session when an agent is selected and not already connected.
   */
  useEffect(() => {
    if (selectedAgentName && sessionStatus === 'DISCONNECTED') {
      connectToRealtime();
    }
  }, [selectedAgentName]);

  /**
   * Effect to update the session and add a transcript breadcrumb when the session is connected
   * and an agent configuration is selected.
   */
  useEffect(() => {
    if (
      sessionStatus === 'CONNECTED' &&
      selectedAgentConfigSet &&
      selectedAgentName
    ) {
      const currentAgent = selectedAgentConfigSet.find(
        (a) => a.name === selectedAgentName
      );
      addTranscriptBreadcrumb(`Agent: ${selectedAgentName}`, currentAgent);
      updateSession(!handoffTriggeredRef.current);
      // Reset flag after handling so subsequent effects behave normally
      handoffTriggeredRef.current = false;
    }
  }, [selectedAgentConfigSet, selectedAgentName, sessionStatus]);

  /**
   * Effect to update the session when push-to-talk (PTT) status changes.
   */
  useEffect(() => {
    if (sessionStatus === 'CONNECTED') {
      updateSession();
    }
  }, [isPTTActive]);

  /**
   * Fetches an ephemeral key from the API for session authentication.
   * @returns A Promise that resolves to the ephemeral key string, or null if an error occurs.
   */
  const fetchEphemeralKey = async (): Promise<string | null> => {
    logClientEvent({ url: '/session' }, 'fetch_session_token_request');
    const tokenResponse = await fetch('/api/session');
    const data = await tokenResponse.json();
    logServerEvent(data, 'fetch_session_token_response');

    if (!data.client_secret?.value) {
      logClientEvent(data, 'error.no_ephemeral_key');
      console.error('No ephemeral key provided by the server');
      setSessionStatus('DISCONNECTED');
      return null;
    }

    return data.client_secret.value;
  };

  /**
   * Connects to the Realtime session using the selected agent configuration.
   */
  const connectToRealtime = async () => {
    const agentSetKey = searchParams.get('agentConfig') || 'default';
    if (sdkScenarioMap[agentSetKey]) {
      if (sessionStatus !== 'DISCONNECTED') return;
      setSessionStatus('CONNECTING');

      try {
        const EPHEMERAL_KEY = await fetchEphemeralKey();
        if (!EPHEMERAL_KEY) return;

        // Ensure the selectedAgentName is first so that it becomes the root
        const reorderedAgents = [...sdkScenarioMap[agentSetKey]];
        const idx = reorderedAgents.findIndex(
          (a) => a.name === selectedAgentName
        );
        if (idx > 0) {
          const [agent] = reorderedAgents.splice(idx, 1);
          reorderedAgents.unshift(agent);
        }

        const companyName =
          agentSetKey === 'customerServiceRetail'
            ? customerServiceRetailCompanyName
            : agentSetKey === 'intelligentMaterialOrdering'
              ? intelligentMaterialOrderingCompanyName
              : chatSupervisorCompanyName;
        const guardrail = createModerationGuardrail(companyName);

        await connect({
          getEphemeralKey: async () => EPHEMERAL_KEY,
          initialAgents: reorderedAgents,
          audioElement: sdkAudioElement,
          outputGuardrails: [guardrail],
          extraContext: {
            addTranscriptBreadcrumb,
          },
          voice: voice,
        });
      } catch (err) {
        console.error('Error connecting via SDK:', err);
        setSessionStatus('DISCONNECTED');
      }
      return;
    }
  };

  /**
   * Disconnects from the Realtime session.
   */
  const disconnectFromRealtime = () => {
    disconnect();
    setSessionStatus('DISCONNECTED');
    setIsPTTUserSpeaking(false);
  };

  /**
   * Sends a simulated user message to the session.
   * @param text The text message to send.
   */
  const sendSimulatedUserMessage = (text: string) => {
    const id = uuidv4().slice(0, 32);
    addTranscriptMessage(id, 'user', text, true);

    sendClientEvent({
      type: 'conversation.item.create',
      item: {
        id,
        type: 'message',
        role: 'user',
        content: [{ type: 'input_text', text }],
      },
    });
    sendClientEvent(
      { type: 'response.create' },
      '(simulated user text message)'
    );
  };

  /**
   * Updates the session configuration, particularly for turn detection (VAD).
   * @param shouldTriggerResponse If true, sends an initial 'hi' message to trigger an agent response.
   */
  const updateSession = (shouldTriggerResponse: boolean = false) => {
    // Reflect Push-to-Talk UI state by (de)activating server VAD on the
    // backend. The Realtime SDK supports live session updates via the
    // `session.update` event.
    const turnDetection = isPTTActive
      ? null
      : {
          type: 'server_vad',
          threshold: 0.9,
          prefix_padding_ms: 300,
          silence_duration_ms: 500,
          create_response: true,
        };

    sendEvent({
      type: 'session.update',
      session: {
        turn_detection: turnDetection,
      },
    });

    // Send an initial 'hi' message to trigger the agent to greet the user
    if (shouldTriggerResponse) {
      sendSimulatedUserMessage('hi');
    }
    return;
  };

  /**
   * Handles sending a text message from the user input field.
   */
  const handleSendTextMessage = () => {
    if (!userText.trim()) return;
    interrupt();

    try {
      sendUserText(userText.trim());
    } catch (err) {
      console.error('Failed to send via SDK', err);
    }

    setUserText('');
  };

  /**
   * Handles the button down event for push-to-talk (PTT).
   * Clears the audio buffer and sets the PTT user speaking state.
   */
  const handleTalkButtonDown = () => {
    if (sessionStatus !== 'CONNECTED') return;
    interrupt();

    setIsPTTUserSpeaking(true);
    sendClientEvent({ type: 'input_audio_buffer.clear' }, 'clear PTT buffer');

    // No placeholder; we'll rely on server transcript once ready.
  };

  /**
   * Handles the button up event for push-to-talk (PTT).
   * Commits the audio buffer and triggers a response.
   */
  const handleTalkButtonUp = () => {
    if (sessionStatus !== 'CONNECTED' || !isPTTUserSpeaking) return;

    setIsPTTUserSpeaking(false);
    sendClientEvent({ type: 'input_audio_buffer.commit' }, 'commit PTT');
    sendClientEvent({ type: 'response.create' }, 'trigger response PTT');
  };

  /**
   * Toggles the connection status (connects or disconnects).
   */
  const onToggleConnection = () => {
    if (sessionStatus === 'CONNECTED' || sessionStatus === 'CONNECTING') {
      disconnectFromRealtime();
      setSessionStatus('DISCONNECTED');
    } else {
      connectToRealtime();
    }
  };

  /**
   * Handles changes in the selected agent configuration scenario.
   * Reloads the page with the new agent config URL parameter.
   * @param e The change event from the select element.
   */
  const handleAgentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newAgentConfig = e.target.value;
    const url = new URL(window.location.toString());
    url.searchParams.set('agentConfig', newAgentConfig);
    window.location.replace(url.toString());
  };

  /**
   * Handles changes in the selected agent within the current scenario.
   * Disconnects and reconnects the session with the newly selected agent as the root.
   * @param e The change event from the select element.
   */
  const handleSelectedAgentChange = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const newAgentName = e.target.value;
    // Reconnect session with the newly selected agent as root so that tool
    // execution works correctly.
    disconnectFromRealtime();
    setSelectedAgentName(newAgentName);
    // connectToRealtime will be triggered by effect watching selectedAgentName
  };

  /**
   * Handles changes in the audio codec.
   * Reloads the page with the new codec URL parameter.
   * @param newCodec The new codec string.
   */
  const handleCodecChange = (newCodec: string) => {
    const url = new URL(window.location.toString());
    url.searchParams.set('codec', newCodec);
    window.location.replace(url.toString());
  };

  /**
   * Handles changes in the agent's voice.
   * Updates local storage and reconnects the session if currently connected.
   * @param newVoice The new voice string.
   */
  const handleVoiceChange = (newVoice: string) => {
    setVoice(newVoice);
    localStorage.setItem('voice', newVoice);
    // Reconnect with new voice if currently connected
    if (sessionStatus === 'CONNECTED') {
      disconnectFromRealtime();
      // Connection will be re-established by useEffect watching selectedAgentName
      setTimeout(() => {
        connectToRealtime();
      }, 100);
    }
  };

  /**
   * Effect to load stored UI preferences from localStorage on component mount.
   */
  useEffect(() => {
    const storedPushToTalkUI = localStorage.getItem('pushToTalkUI');
    if (storedPushToTalkUI) {
      setIsPTTActive(storedPushToTalkUI === 'true');
    }
    const storedLogsExpanded = localStorage.getItem('logsExpanded');
    if (storedLogsExpanded) {
      setIsEventsPaneExpanded(storedLogsExpanded === 'true');
    }
    const storedAudioPlaybackEnabled = localStorage.getItem(
      'audioPlaybackEnabled'
    );
    if (storedAudioPlaybackEnabled) {
      setIsAudioPlaybackEnabled(storedAudioPlaybackEnabled === 'true');
    }
    const storedVoice = localStorage.getItem('voice');
    if (storedVoice) {
      setVoice(storedVoice);
    }
  }, []);

  /**
   * Effect to save push-to-talk (PTT) UI state to localStorage.
   */
  useEffect(() => {
    localStorage.setItem('pushToTalkUI', isPTTActive.toString());
  }, [isPTTActive]);

  /**
   * Effect to save events pane expanded state to localStorage.
   */
  useEffect(() => {
    localStorage.setItem('logsExpanded', isEventsPaneExpanded.toString());
  }, [isEventsPaneExpanded]);

  /**
   * Effect to save audio playback enabled state to localStorage.
   */
  useEffect(() => {
    localStorage.setItem(
      'audioPlaybackEnabled',
      isAudioPlaybackEnabled.toString()
    );
  }, [isAudioPlaybackEnabled]);

  /**
   * Effect to manage audio element muting and server-side audio stream mute
   * based on `isAudioPlaybackEnabled` state.
   */
  useEffect(() => {
    if (audioElementRef.current) {
      if (isAudioPlaybackEnabled) {
        audioElementRef.current.muted = false;
        audioElementRef.current.play().catch((err) => {
          console.warn('Autoplay may be blocked by browser:', err);
        });
      } else {
        // Mute and pause to avoid brief audio blips before pause takes effect.
        audioElementRef.current.muted = true;
        audioElementRef.current.pause();
      }
    }

    // Toggle server-side audio stream mute so bandwidth is saved when the
    // user disables playback.
    try {
      mute(!isAudioPlaybackEnabled);
    } catch (err) {
      console.warn('Failed to toggle SDK mute', err);
    }
  }, [isAudioPlaybackEnabled]);

  /**
   * Effect to ensure mute state is propagated to the transport right after connection
   * or when the SDK client reference becomes available.
   */
  useEffect(() => {
    if (sessionStatus === 'CONNECTED') {
      try {
        mute(!isAudioPlaybackEnabled);
      } catch (err) {
        console.warn('mute sync after connect failed', err);
      }
    }
  }, [sessionStatus, isAudioPlaybackEnabled]);

  /**
   * Effect to start and stop audio recording based on session connection status.
   */
  useEffect(() => {
    if (sessionStatus === 'CONNECTED' && audioElementRef.current?.srcObject) {
      // The remote audio stream from the audio element.
      const remoteStream = audioElementRef.current.srcObject as MediaStream;
      startRecording(remoteStream);
    }

    // Clean up on unmount or when sessionStatus is updated.
    return () => {
      stopRecording();
    };
  }, [sessionStatus]);

  const agentSetKey = searchParams.get('agentConfig') || 'default';

  return (
    <div className="text-base flex flex-col h-screen relative overflow-hidden">
      <div className="absolute inset-0 gradient-primary opacity-20"></div>
      <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 via-pink-500/10 to-red-500/10"></div>

      <div className="relative z-10 p-5 text-lg font-semibold flex justify-between items-center glass backdrop-blur-md border-b border-white/10">
        <div
          className="flex items-center cursor-pointer group"
          onClick={() => window.location.reload()}
        >
          <div className="transform transition-transform group-hover:scale-110">
            <Image
              src="/openai-logomark.svg"
              alt="OpenAI Logo"
              width={20}
              height={20}
              className="mr-2"
            />
          </div>
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Realtime API{' '}
            <span className="text-gray-600 dark:text-gray-400">Agents</span>
          </div>
        </div>
        <div className="flex items-center">
          <Link
            href="/how-to-use"
            className="mr-6 text-purple-600 hover:text-purple-800 transition-colors font-medium"
          >
            How to Use
          </Link>
          <div className="flex flex-col">
            <label className="flex items-center text-base gap-1 mr-2 font-medium mb-1">
              Scenario
            </label>
            <div className="relative inline-block">
              <select
                value={agentSetKey}
                onChange={handleAgentChange}
                className="appearance-none glass border border-white/20 rounded-lg text-base px-3 py-1.5 pr-8 cursor-pointer font-normal focus:outline-none focus:border-purple-400/50 transition-all hover:bg-white/10 min-w-[280px]"
              >
                {scenarioConfigs.map((scenario) => (
                  <option
                    key={scenario.key}
                    value={scenario.key}
                    className="bg-gray-900 text-white"
                    title={scenario.description}
                  >
                    {scenario.title}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-purple-600">
                <svg
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5.23 7.21a.75.75 0 011.06.02L10 10.44l3.71-3.21a.75.75 0 111.04 1.08l-4.25 3.65a.75.75 0 01-1.04 0L5.21 8.27a.75.75 0 01.02-1.06z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div className="text-xs text-gray-600 mt-1 max-w-[280px]">
              {scenarioConfigs.find((s) => s.key === agentSetKey)
                ?.description || ''}
            </div>
          </div>

          {agentSetKey && (
            <div className="flex items-center ml-6">
              <label className="flex items-center text-base gap-1 mr-2 font-medium">
                Agent
              </label>
              <div className="relative inline-block">
                <select
                  value={selectedAgentName}
                  onChange={handleSelectedAgentChange}
                  className="appearance-none glass border border-white/20 rounded-lg text-base px-3 py-1.5 pr-8 cursor-pointer font-normal focus:outline-none focus:border-purple-400/50 transition-all hover:bg-white/10"
                >
                  {selectedAgentConfigSet?.map((agent) => (
                    <option
                      key={agent.name}
                      value={agent.name}
                      className="bg-gray-900 text-white"
                    >
                      {agent.name}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2 text-purple-600">
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M5.23 7.21a.75.75 0 011.06.02L10 10.44l3.71-3.21a.75.75 0 111.04 1.08l-4.25 3.65a.75.75 0 01-1.04 0L5.21 8.27a.75.75 0 01.02-1.06z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-1 gap-4 p-4 overflow-hidden relative z-10">
        <Transcript
          userText={userText}
          setUserText={setUserText}
          onSendMessage={handleSendTextMessage}
          downloadRecording={downloadRecording}
          canSend={sessionStatus === 'CONNECTED'}
        />

        <Events isExpanded={isEventsPaneExpanded} />
      </div>

      <BottomToolbar
        sessionStatus={sessionStatus}
        onToggleConnection={onToggleConnection}
        isPTTActive={isPTTActive}
        setIsPTTActive={setIsPTTActive}
        isPTTUserSpeaking={isPTTUserSpeaking}
        handleTalkButtonDown={handleTalkButtonDown}
        handleTalkButtonUp={handleTalkButtonUp}
        isEventsPaneExpanded={isEventsPaneExpanded}
        setIsEventsPaneExpanded={setIsEventsPaneExpanded}
        isAudioPlaybackEnabled={isAudioPlaybackEnabled}
        setIsAudioPlaybackEnabled={setIsAudioPlaybackEnabled}
        codec={urlCodec}
        onCodecChange={handleCodecChange}
        voice={voice}
        onVoiceChange={handleVoiceChange}
      />
    </div>
  );
}

export default App;
