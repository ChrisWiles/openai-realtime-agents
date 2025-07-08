'use client';

import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { LoggedEvent } from '@/app/types';

/**
 * Defines the shape of the value provided by the EventContext.
 */
type EventContextValue = {
  /** The array of logged events. */
  loggedEvents: LoggedEvent[];
  /**
   * Logs a client-side event.
   * @param eventObj The event object to log.
   * @param eventNameSuffix An optional suffix to append to the event name.
   */
  logClientEvent: (
    eventObj: Record<string, any>,
    eventNameSuffix?: string
  ) => void;
  /**
   * Logs a server-side event.
   * @param eventObj The event object to log.
   * @param eventNameSuffix An optional suffix to append to the event name.
   */
  logServerEvent: (
    eventObj: Record<string, any>,
    eventNameSuffix?: string
  ) => void;
  /**
   * Logs a history item as an event.
   * @param item The history item to log.
   */
  logHistoryItem: (item: any) => void;
  /**
   * Toggles the expanded state of a logged event.
   * @param id The ID of the event to toggle.
   */
  toggleExpand: (id: number | string) => void;
};

/**
 * React Context for managing application events and logs.
 */
const EventContext = createContext<EventContextValue | undefined>(undefined);

/**
 * Provides the EventContext to its children.
 * Manages the state and logic for logging and displaying various application events.
 */
export const EventProvider: FC<PropsWithChildren> = ({ children }) => {
  const [loggedEvents, setLoggedEvents] = useState<LoggedEvent[]>([]);

  /**
   * Adds a new event to the logged events list.
   * @param direction The direction of the event ('client' or 'server').
   * @param eventName The name of the event.
   * @param eventData The data associated with the event.
   */
  function addLoggedEvent(
    direction: 'client' | 'server',
    eventName: string,
    eventData: Record<string, any>
  ) {
    const id = eventData.event_id || uuidv4();
    setLoggedEvents((prev) => [
      ...prev,
      {
        id,
        direction,
        eventName,
        eventData,
        timestamp: new Date().toLocaleTimeString(),
        expanded: false,
      },
    ]);
  }

  /**
   * Logs a client-side event.
   * @param eventObj The event object to log.
   * @param eventNameSuffix An optional suffix to append to the event name.
   */
  const logClientEvent: EventContextValue['logClientEvent'] = (
    eventObj,
    eventNameSuffix = ''
  ) => {
    const name = `${eventObj.type || ''} ${eventNameSuffix || ''}`.trim();
    addLoggedEvent('client', name, eventObj);
  };

  /**
   * Logs a server-side event.
   * @param eventObj The event object to log.
   * @param eventNameSuffix An optional suffix to append to the event name.
   */
  const logServerEvent: EventContextValue['logServerEvent'] = (
    eventObj,
    eventNameSuffix = ''
  ) => {
    const name = `${eventObj.type || ''} ${eventNameSuffix || ''}`.trim();
    addLoggedEvent('server', name, eventObj);
  };

  /**
   * Logs a history item as an event.
   * @param item The history item to log.
   */
  const logHistoryItem: EventContextValue['logHistoryItem'] = (item) => {
    let eventName = item.type;
    if (item.type === 'message') {
      eventName = `${item.role}.${item.status}`;
    }
    if (item.type === 'function_call') {
      eventName = `function.${item.name}.${item.status}`;
    }
    addLoggedEvent('server', eventName, item);
  };

  /**
   * Toggles the expanded state of a logged event by its ID.
   * @param id The ID of the event to toggle.
   */
  const toggleExpand: EventContextValue['toggleExpand'] = (id) => {
    setLoggedEvents((prev) =>
      prev.map((log) => {
        if (log.id === id) {
          return { ...log, expanded: !log.expanded };
        }
        return log;
      })
    );
  };

  return (
    <EventContext.Provider
      value={{
        loggedEvents,
        logClientEvent,
        logServerEvent,
        logHistoryItem,
        toggleExpand,
      }}
    >
      {children}
    </EventContext.Provider>
  );
};

/**
 * Custom hook to consume the EventContext.
 * Throws an error if used outside of an EventProvider.
 * @returns The context value containing logged events and functions to manipulate them.
 * @throws Error if not used within an EventProvider.
 */
export function useEvent() {
  const context = useContext(EventContext);
  if (!context) {
    throw new Error('useEvent must be used within an EventProvider');
  }
  return context;
}
