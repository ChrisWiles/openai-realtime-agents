'use client';

import {
  createContext,
  type FC,
  type PropsWithChildren,
  useContext,
  useState,
} from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { TranscriptItem } from '@/app/types';

/**
 * Defines the shape of the value provided by the TranscriptContext.
 */
type TranscriptContextValue = {
  /** The array of transcript items. */
  transcriptItems: TranscriptItem[];
  /**
   * Adds a new message to the transcript.
   * @param itemId A unique ID for the transcript item.
   * @param role The role of the speaker ('user' or 'assistant').
   * @param text The content of the message.
   * @param isHidden Optional. If true, the message will be hidden from the main view.
   */
  addTranscriptMessage: (
    itemId: string,
    role: 'user' | 'assistant',
    text: string,
    isHidden?: boolean
  ) => void;
  /**
   * Updates an existing message in the transcript.
   * @param itemId The ID of the message to update.
   * @param text The new text content.
   * @param isDelta If true, the new text will be appended to the existing text.
   */
  updateTranscriptMessage: (
    itemId: string,
    text: string,
    isDelta: boolean
  ) => void;
  /**
   * Adds a breadcrumb (non-message event) to the transcript.
   * @param title The title of the breadcrumb.
   * @param data Optional. Additional data associated with the breadcrumb.
   */
  addTranscriptBreadcrumb: (title: string, data?: Record<string, any>) => void;
  /**
   * Toggles the expanded state of a transcript item.
   * @param itemId The ID of the item to toggle.
   */
  toggleTranscriptItemExpand: (itemId: string) => void;
  /**
   * Updates specific properties of a transcript item.
   * @param itemId The ID of the item to update.
   * @param updatedProperties An object containing the properties to update.
   */
  updateTranscriptItem: (
    itemId: string,
    updatedProperties: Partial<TranscriptItem>
  ) => void;
};

/**
 * React Context for managing the conversation transcript.
 */
const TranscriptContext = createContext<TranscriptContextValue | undefined>(
  undefined
);

/**
 * Provides the TranscriptContext to its children.
 * Manages the state and logic for adding, updating, and interacting with transcript items.
 */
export const TranscriptProvider: FC<PropsWithChildren> = ({ children }) => {
  const [transcriptItems, setTranscriptItems] = useState<TranscriptItem[]>([]);

  /**
   * Generates a formatted timestamp string with milliseconds.
   * @returns A string representing the current time in HH:MM:SS.ms format.
   */
  function newTimestampPretty(): string {
    const now = new Date();
    const time = now.toLocaleTimeString([], {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
    const ms = now.getMilliseconds().toString().padStart(3, '0');
    return `${time}.${ms}`;
  }

  /**
   * Adds a new message to the transcript. If a message with the same itemId already exists,
   * it will be skipped to prevent duplicates.
   * @param itemId A unique ID for the transcript item.
   * @param role The role of the speaker ('user' or 'assistant').
   * @param text The content of the message. Defaults to an empty string.
   * @param isHidden Optional. If true, the message will be hidden from the main view. Defaults to false.
   */
  const addTranscriptMessage: TranscriptContextValue['addTranscriptMessage'] = (
    itemId,
    role,
    text = '',
    isHidden = false
  ) => {
    setTranscriptItems((prev) => {
      if (prev.some((log) => log.itemId === itemId && log.type === 'MESSAGE')) {
        console.warn(
          `[addTranscriptMessage] skipping; message already exists for itemId=${itemId}, role=${role}, text=${text}`
        );
        return prev;
      }

      const newItem: TranscriptItem = {
        itemId,
        type: 'MESSAGE',
        role,
        title: text,
        expanded: false,
        timestamp: newTimestampPretty(),
        createdAtMs: Date.now(),
        status: 'IN_PROGRESS',
        isHidden,
      };

      return [...prev, newItem];
    });
  };

  /**
   * Updates an existing message in the transcript. If `append` is true, the new text
   * will be concatenated to the existing message title.
   * @param itemId The ID of the message to update.
   * @param newText The new text content.
   * @param append If true, appends `newText` to the existing message title. Otherwise, replaces it.
   */
  const updateTranscriptMessage: TranscriptContextValue['updateTranscriptMessage'] =
    (itemId, newText, append = false) => {
      setTranscriptItems((prev) =>
        prev.map((item) => {
          if (item.itemId === itemId && item.type === 'MESSAGE') {
            return {
              ...item,
              title: append ? (item.title ?? '') + newText : newText,
            };
          }
          return item;
        })
      );
    };

  /**
   * Adds a breadcrumb (non-message event) to the transcript.
   * Breadcrumbs are typically used for logging tool calls or other significant events.
   * @param title The title of the breadcrumb.
   * @param data Optional. Additional data associated with the breadcrumb.
   */
  const addTranscriptBreadcrumb: TranscriptContextValue['addTranscriptBreadcrumb'] =
    (title, data) => {
      setTranscriptItems((prev) => [
        ...prev,
        {
          itemId: `breadcrumb-${uuidv4()}`,
          type: 'BREADCRUMB',
          title,
          data,
          expanded: false,
          timestamp: newTimestampPretty(),
          createdAtMs: Date.now(),
          status: 'DONE',
          isHidden: false,
        },
      ]);
    };

  /**
   * Toggles the `expanded` state of a specific transcript item.
   * @param itemId The ID of the transcript item to toggle.
   */
  const toggleTranscriptItemExpand: TranscriptContextValue['toggleTranscriptItemExpand'] =
    (itemId) => {
      setTranscriptItems((prev) =>
        prev.map((log) =>
          log.itemId === itemId ? { ...log, expanded: !log.expanded } : log
        )
      );
    };

  /**
   * Updates specific properties of an existing transcript item.
   * @param itemId The ID of the transcript item to update.
   * @param updatedProperties An object containing the properties to update on the item.
   */
  const updateTranscriptItem: TranscriptContextValue['updateTranscriptItem'] = (
    itemId,
    updatedProperties
  ) => {
    setTranscriptItems((prev) =>
      prev.map((item) =>
        item.itemId === itemId ? { ...item, ...updatedProperties } : item
      )
    );
  };

  return (
    <TranscriptContext.Provider
      value={{
        transcriptItems,
        addTranscriptMessage,
        updateTranscriptMessage,
        addTranscriptBreadcrumb,
        toggleTranscriptItemExpand,
        updateTranscriptItem,
      }}
    >
      {children}
    </TranscriptContext.Provider>
  );
};

/**
 * Custom hook to consume the TranscriptContext.
 * Throws an error if used outside of a TranscriptProvider.
 * @returns The context value containing transcript items and functions to manipulate them.
 * @throws Error if not used within a TranscriptProvider.
 */
export function useTranscript() {
  const context = useContext(TranscriptContext);
  if (!context) {
    throw new Error('useTranscript must be used within a TranscriptProvider');
  }
  return context;
}
