import type React from 'react';
import type { SessionStatus } from '@/app/types';

interface BottomToolbarProps {
  sessionStatus: SessionStatus;
  onToggleConnection: () => void;
  isPTTActive: boolean;
  setIsPTTActive: (val: boolean) => void;
  isPTTUserSpeaking: boolean;
  handleTalkButtonDown: () => void;
  handleTalkButtonUp: () => void;
  isEventsPaneExpanded: boolean;
  setIsEventsPaneExpanded: (val: boolean) => void;
  isAudioPlaybackEnabled: boolean;
  setIsAudioPlaybackEnabled: (val: boolean) => void;
  codec: string;
  onCodecChange: (newCodec: string) => void;
}

function BottomToolbar({
  sessionStatus,
  onToggleConnection,
  isPTTActive,
  setIsPTTActive,
  isPTTUserSpeaking,
  handleTalkButtonDown,
  handleTalkButtonUp,
  isEventsPaneExpanded,
  setIsEventsPaneExpanded,
  isAudioPlaybackEnabled,
  setIsAudioPlaybackEnabled,
  codec,
  onCodecChange,
}: BottomToolbarProps) {
  const isConnected = sessionStatus === 'CONNECTED';
  const isConnecting = sessionStatus === 'CONNECTING';

  const handleCodecChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCodec = e.target.value;
    onCodecChange(newCodec);
  };

  function getConnectionButtonLabel() {
    if (isConnected) return 'Disconnect';
    if (isConnecting) return 'Connecting...';
    return 'Connect';
  }

  function getConnectionButtonClasses() {
    const baseClasses =
      'text-white text-base px-6 py-2.5 w-36 rounded-xl h-full transition-all transform hover:scale-105 shadow-lg font-medium';
    const cursorClass = isConnecting ? 'cursor-not-allowed' : 'cursor-pointer';

    if (isConnected) {
      // Connected -> label "Disconnect" -> red gradient
      return `gradient-secondary ${cursorClass} ${baseClasses}`;
    }
    // Disconnected or connecting -> label is either "Connect" or "Connecting" -> primary gradient
    return `gradient-primary ${cursorClass} ${baseClasses}`;
  }

  return (
    <div className="relative z-10 p-4 flex flex-row items-center justify-center gap-x-8 glass backdrop-blur-md border-t border-white/10">
      <button
        type="button"
        onClick={onToggleConnection}
        className={getConnectionButtonClasses()}
        disabled={isConnecting}
      >
        {getConnectionButtonLabel()}
      </button>

      <div className="flex flex-row items-center gap-3">
        <input
          id="push-to-talk"
          type="checkbox"
          checked={isPTTActive}
          onChange={(e) => setIsPTTActive(e.target.checked)}
          disabled={!isConnected}
          className="w-4 h-4 accent-purple-600"
        />
        <label
          htmlFor="push-to-talk"
          className="flex items-center cursor-pointer text-gray-700 hover:text-purple-600 transition-colors"
        >
          Push to talk
        </label>
        <button
          type="button"
          onMouseDown={handleTalkButtonDown}
          onMouseUp={handleTalkButtonUp}
          onTouchStart={handleTalkButtonDown}
          onTouchEnd={handleTalkButtonUp}
          disabled={!isPTTActive}
          className={
            (isPTTUserSpeaking
              ? 'gradient-accent'
              : 'glass border border-white/20') +
            ' py-2 px-6 cursor-pointer rounded-xl transition-all transform hover:scale-105 shadow-md text-white font-medium' +
            (!isPTTActive ? ' opacity-50 cursor-not-allowed' : '')
          }
        >
          Talk
        </button>
      </div>

      <div className="flex flex-row items-center gap-2">
        <input
          id="audio-playback"
          type="checkbox"
          checked={isAudioPlaybackEnabled}
          onChange={(e) => setIsAudioPlaybackEnabled(e.target.checked)}
          disabled={!isConnected}
          className="w-4 h-4 accent-purple-600"
        />
        <label
          htmlFor="audio-playback"
          className="flex items-center cursor-pointer text-gray-700 hover:text-purple-600 transition-colors"
        >
          Audio playback
        </label>
      </div>

      <div className="flex flex-row items-center gap-2">
        <input
          id="logs"
          type="checkbox"
          checked={isEventsPaneExpanded}
          onChange={(e) => setIsEventsPaneExpanded(e.target.checked)}
          className="w-4 h-4 accent-purple-600"
        />
        <label
          htmlFor="logs"
          className="flex items-center cursor-pointer text-gray-700 hover:text-purple-600 transition-colors"
        >
          Logs
        </label>
      </div>

      <div className="flex flex-row items-center gap-2">
        <div className="text-gray-700">Codec:</div>
        {/*
          Codec selector – Lets you force the WebRTC track to use 8 kHz 
          PCMU/PCMA so you can preview how the agent will sound 
          (and how ASR/VAD will perform) when accessed via a 
          phone network.  Selecting a codec reloads the page with ?codec=...
          which our App-level logic picks up and applies via a WebRTC monkey
          patch (see codecPatch.ts).
        */}
        <select
          id="codec-select"
          value={codec}
          onChange={handleCodecChange}
          className="glass border border-white/20 rounded-lg px-3 py-1.5 focus:outline-none cursor-pointer hover:bg-white/10 transition-all text-gray-700"
        >
          <option value="opus" className="bg-gray-900 text-white">
            Opus (48 kHz)
          </option>
          <option value="pcmu" className="bg-gray-900 text-white">
            PCMU (8 kHz)
          </option>
          <option value="pcma" className="bg-gray-900 text-white">
            PCMA (8 kHz)
          </option>
        </select>
      </div>
    </div>
  );
}

export default BottomToolbar;
