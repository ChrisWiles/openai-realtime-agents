'use client';

import { useEffect, useRef, useState } from 'react';
import { useEvent } from '@/app/contexts/EventContext';
import type { LoggedEvent } from '@/app/types';

/**
 * Props for the Events component.
 */
export interface EventsProps {
  /** Determines if the events pane is expanded or collapsed. */
  isExpanded: boolean;
}

/**
 * Displays a real-time log of client and server events.
 * Provides a visual representation of event flow and detailed event data.
 */
function Events({ isExpanded }: EventsProps) {
  const [prevEventLogs, setPrevEventLogs] = useState<LoggedEvent[]>([]);
  const eventLogsContainerRef = useRef<HTMLDivElement | null>(null);

  const { loggedEvents, toggleExpand } = useEvent();

  /**
   * Returns an arrow symbol and color based on the event direction.
   * @param direction The direction of the event ('client' or 'server').
   * @returns An object containing the symbol and its color.
   */
  const getDirectionArrow = (direction: string) => {
    if (direction === 'client') return { symbol: '▲', color: '#7f5af0' };
    if (direction === 'server') return { symbol: '▼', color: '#2cb67d' };
    return { symbol: '•', color: '#555' };
  };

  /**
   * Effect to scroll to the bottom of the event log when new events are added
   * and the pane is expanded.
   */
  useEffect(() => {
    const hasNewEvent = loggedEvents.length > prevEventLogs.length;

    if (isExpanded && hasNewEvent && eventLogsContainerRef.current) {
      eventLogsContainerRef.current.scrollTop =
        eventLogsContainerRef.current.scrollHeight;
    }

    setPrevEventLogs(loggedEvents);
  }, [loggedEvents, isExpanded]);

  return (
    <div
      className={
        (isExpanded ? 'w-1/2 overflow-auto' : 'w-0 overflow-hidden opacity-0') +
        ' transition-all rounded-2xl duration-200 ease-in-out flex-col glass backdrop-blur-lg shadow-2xl border border-white/20'
      }
      ref={eventLogsContainerRef}
    >
      {isExpanded && (
        <div>
          <div className="flex items-center justify-between px-6 py-4 sticky top-0 z-10 text-base glass backdrop-blur-md border-b border-white/10">
            <span className="font-semibold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Logs
            </span>
          </div>
          <div>
            {loggedEvents.map((log, idx) => {
              const arrowInfo = getDirectionArrow(log.direction);
              const isError =
                log.eventName.toLowerCase().includes('error') ||
                log.eventData?.response?.status_details?.error != null;

              return (
                <div
                  key={`${log.id}-${idx}`}
                  className="border-t border-white/10 py-3 px-6 font-mono hover:bg-white/5 transition-all"
                >
                  <div
                    onClick={() => toggleExpand(log.id)}
                    className="flex items-center justify-between cursor-pointer group"
                  >
                    <div className="flex items-center flex-1">
                      <span
                        style={{ color: arrowInfo.color }}
                        className="ml-1 mr-2 text-lg transform transition-transform group-hover:scale-125"
                      >
                        {arrowInfo.symbol}
                      </span>
                      <span
                        className={
                          'flex-1 text-sm ' +
                          (isError
                            ? 'text-red-500 font-semibold'
                            : 'text-gray-800 dark:text-gray-300 group-hover:text-gray-900 dark:group-hover:text-gray-100')
                        }
                      >
                        {log.eventName}
                      </span>
                    </div>
                    <div className="text-gray-700 dark:text-gray-400 ml-1 text-xs whitespace-nowrap">
                      {log.timestamp}
                    </div>
                  </div>

                  {log.expanded && log.eventData && (
                    <div className="text-gray-800 dark:text-gray-300 text-left mt-3">
                      <pre className="border-l-2 ml-1 border-blue-300 whitespace-pre-wrap break-words font-mono text-xs mb-2 mt-2 pl-3 glass backdrop-blur-sm p-3 rounded-lg">
                        {JSON.stringify(log.eventData, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default Events;
