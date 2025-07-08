'use-client';

import { ClipboardCopyIcon, DownloadIcon } from '@radix-ui/react-icons';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import { useTranscript } from '@/app/contexts/TranscriptContext';
import type { TranscriptItem } from '@/app/types';
import { GuardrailChip } from './GuardrailChip';

/**
 * Props for the Transcript component.
 */
export interface TranscriptProps {
  /** The current text input by the user. */
  userText: string;
  /** Callback to update the user's text input. */
  setUserText: (val: string) => void;
  /** Callback to send the current message. */
  onSendMessage: () => void;
  /** Indicates whether messages can currently be sent. */
  canSend: boolean;
  /** Callback to trigger the audio recording download. */
  downloadRecording: () => void;
}

/**
 * Displays the conversation transcript, including user messages, agent responses,
 * tool calls, and guardrail indicators. Provides input for sending messages
 * and options for copying the transcript or downloading audio.
 */
function Transcript({
  userText,
  setUserText,
  onSendMessage,
  canSend,
  downloadRecording,
}: TranscriptProps) {
  const { transcriptItems, toggleTranscriptItemExpand } = useTranscript();
  const transcriptRef = useRef<HTMLDivElement | null>(null);
  const [prevLogs, setPrevLogs] = useState<TranscriptItem[]>([]);
  const [justCopied, setJustCopied] = useState(false);
  const inputRef = useRef<HTMLInputElement | null>(null);

  /**
   * Scrolls the transcript to the bottom.
   */
  function scrollToBottom() {
    if (transcriptRef.current) {
      transcriptRef.current.scrollTop = transcriptRef.current.scrollHeight;
    }
  }

  /**
   * Effect to scroll to the bottom when new messages or updates occur.
   */
  useEffect(() => {
    const hasNewMessage = transcriptItems.length > prevLogs.length;
    const hasUpdatedMessage = transcriptItems.some((newItem, index) => {
      const oldItem = prevLogs[index];
      return (
        oldItem &&
        (newItem.title !== oldItem.title || newItem.data !== oldItem.data)
      );
    });

    if (hasNewMessage || hasUpdatedMessage) {
      scrollToBottom();
    }

    setPrevLogs(transcriptItems);
  }, [transcriptItems]);

  /**
   * Effect to autofocus on the text input box when messages can be sent.
   */
  useEffect(() => {
    if (canSend && inputRef.current) {
      inputRef.current.focus();
    }
  }, [canSend]);

  /**
   * Handles copying the transcript content to the clipboard.
   */
  const handleCopyTranscript = async () => {
    if (!transcriptRef.current) return;
    try {
      await navigator.clipboard.writeText(transcriptRef.current.innerText);
      setJustCopied(true);
      setTimeout(() => setJustCopied(false), 1500);
    } catch (error) {
      console.error('Failed to copy transcript:', error);
    }
  };

  return (
    <div className="flex flex-col flex-1 glass backdrop-blur-lg min-h-0 rounded-2xl shadow-2xl border border-white/20 overflow-hidden">
      <div className="flex flex-col flex-1 min-h-0">
        <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 text-base glass backdrop-blur-md border-b border-white/10">
          <span className="font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
            Transcript
          </span>
          <div className="flex gap-x-2">
            <button
              type="button"
              onClick={handleCopyTranscript}
              className="w-24 text-sm px-3 py-1.5 rounded-lg glass border border-white/20 hover:bg-white/20 flex items-center justify-center gap-x-1 transition-all transform hover:scale-105"
            >
              <ClipboardCopyIcon />
              {justCopied ? 'Copied!' : 'Copy'}
            </button>
            <button
              type="button"
              onClick={downloadRecording}
              className="w-40 text-sm px-3 py-1.5 rounded-lg glass border border-white/20 hover:bg-white/20 flex items-center justify-center gap-x-1 transition-all transform hover:scale-105"
            >
              <DownloadIcon />
              <span>Download Audio</span>
            </button>
          </div>
        </div>

        {/* Transcript Content */}
        <div
          ref={transcriptRef}
          className="overflow-auto p-4 flex flex-col gap-y-4 h-full"
        >
          {[...transcriptItems]
            .sort((a, b) => a.createdAtMs - b.createdAtMs)
            .map((item) => {
              const {
                itemId,
                type,
                role,
                data,
                expanded,
                timestamp,
                title = '',
                isHidden,
                guardrailResult,
              } = item;

              if (isHidden) {
                return null;
              }

              if (type === 'MESSAGE') {
                const isUser = role === 'user';
                const containerClasses = `flex justify-end flex-col ${
                  isUser ? 'items-end' : 'items-start'
                }`;
                const bubbleBase = `max-w-lg p-4 shadow-lg ${
                  isUser
                    ? 'gradient-primary text-white'
                    : 'glass backdrop-blur-md text-gray-900 dark:text-gray-100 border border-white/20'
                }`;
                const isBracketedMessage =
                  title.startsWith('[') && title.endsWith(']');
                const messageStyle = isBracketedMessage
                  ? 'italic text-gray-500 dark:text-gray-400'
                  : '';
                const displayTitle = isBracketedMessage
                  ? title.slice(1, -1)
                  : title;

                return (
                  <div key={itemId} className={containerClasses}>
                    <div className="max-w-lg">
                      <div
                        className={`${bubbleBase} rounded-t-xl ${
                          guardrailResult ? '' : 'rounded-b-xl'
                        }`}
                      >
                        <div
                          className={`text-xs ${
                            isUser
                              ? 'text-white/70'
                              : 'text-gray-700 dark:text-gray-400'
                          } font-mono`}
                        >
                          {timestamp}
                        </div>
                        <div className={`whitespace-pre-wrap ${messageStyle}`}>
                          <ReactMarkdown>{displayTitle}</ReactMarkdown>
                        </div>
                      </div>
                      {guardrailResult && (
                        <div className="bg-gray-200 px-3 py-2 rounded-b-xl">
                          <GuardrailChip guardrailResult={guardrailResult} />
                        </div>
                      )}
                    </div>
                  </div>
                );
              } else if (type === 'BREADCRUMB') {
                return (
                  <div
                    key={itemId}
                    className="flex flex-col justify-start items-start text-gray-600 text-sm glass backdrop-blur-sm p-3 rounded-lg border border-white/10"
                  >
                    <span className="text-xs font-mono text-purple-600">
                      {timestamp}
                    </span>
                    <div
                      className={`whitespace-pre-wrap flex items-center font-mono text-sm text-gray-800 dark:text-gray-300 ${
                        data
                          ? 'cursor-pointer hover:text-purple-600 transition-colors'
                          : ''
                      }`}
                      onClick={() => data && toggleTranscriptItemExpand(itemId)}
                    >
                      {data && (
                        <span
                          className={`text-purple-500 mr-1 transform transition-transform duration-200 select-none font-mono ${
                            expanded ? 'rotate-90' : 'rotate-0'
                          }`}
                        >
                          ▶
                        </span>
                      )}
                      {title}
                    </div>
                    {expanded && data && (
                      <div className="text-gray-800 dark:text-gray-300 text-left mt-2">
                        <pre className="border-l-2 ml-1 border-purple-300 whitespace-pre-wrap break-words font-mono text-xs mb-2 mt-2 pl-2 glass backdrop-blur-sm p-2 rounded">
                          {JSON.stringify(data, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                );
              } else {
                // Fallback if type is neither MESSAGE nor BREADCRUMB
                return (
                  <div
                    key={itemId}
                    className="flex justify-center text-gray-500 text-sm italic font-mono"
                  >
                    Unknown item type: {type}{' '}
                    <span className="ml-2 text-xs">{timestamp}</span>
                  </div>
                );
              }
            })}
        </div>
      </div>

      <div className="p-4 flex items-center gap-x-2 flex-shrink-0 border-t border-white/10 glass backdrop-blur-md">
        <input
          ref={inputRef}
          type="text"
          value={userText}
          onChange={(e) => setUserText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && canSend) {
              onSendMessage();
            }
          }}
          className="flex-1 px-4 py-3 focus:outline-none glass backdrop-blur-sm rounded-xl border border-white/20 focus:border-purple-400/50 transition-all placeholder-gray-500"
          placeholder="Type a message..."
          style={{ color: 'var(--foreground)' }}
        />
        <button
          type="button"
          onClick={onSendMessage}
          disabled={!canSend || !userText.trim()}
          className="gradient-primary text-white rounded-xl px-3 py-3 disabled:opacity-50 transition-all transform hover:scale-105 shadow-lg"
        >
          <Image src="arrow.svg" alt="Send" width={24} height={24} />
        </button>
      </div>
    </div>
  );
}

export default Transcript;
