import {
  CheckCircledIcon,
  ClockIcon,
  CrossCircledIcon,
} from '@radix-ui/react-icons';
import { useState } from 'react';
import type { GuardrailResultType } from '../types';

/**
 * Props for the ModerationChip component (deprecated, GuardrailChip is preferred).
 */
export interface ModerationChipProps {
  /** The moderation category. */
  moderationCategory: string;
  /** The rationale for the moderation decision. */
  moderationRationale: string;
}

/**
 * Formats a moderation category string for display.
 * Converts snake_case to Title Case.
 * @param category The moderation category string (e.g., 'OFF_BRAND').
 * @returns The formatted category string (e.g., 'Off Brand').
 */
function formatCategory(category: string): string {
  return category
    .split('_')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * A component that displays the result of a guardrail check.
 * It shows the status (Pending, Pass, Fail) and, when expanded, details about the moderation category and rationale.
 * @param guardrailResult The result object from a guardrail check.
 */
export function GuardrailChip({
  guardrailResult,
}: {
  guardrailResult: GuardrailResultType;
}) {
  const [expanded, setExpanded] = useState(false);

  // Consolidate state into a single variable: "PENDING", "PASS", or "FAIL"
  const state =
    guardrailResult.status === 'IN_PROGRESS'
      ? 'PENDING'
      : guardrailResult.category === 'NONE'
        ? 'PASS'
        : 'FAIL';

  // Variables for icon, label, and styling classes based on state
  let IconComponent;
  let label: string;
  let textColorClass: string;
  switch (state) {
    case 'PENDING':
      IconComponent = ClockIcon;
      label = 'Pending';
      textColorClass = 'text-gray-600';
      break;
    case 'PASS':
      IconComponent = CheckCircledIcon;
      label = 'Pass';
      textColorClass = 'text-green-600';
      break;
    case 'FAIL':
      IconComponent = CrossCircledIcon;
      label = 'Fail';
      textColorClass = 'text-red-500';
      break;
    default:
      IconComponent = ClockIcon;
      label = 'Pending';
      textColorClass = 'text-gray-600';
  }

  return (
    <div className="text-xs">
      <div
        onClick={() => {
          // Only allow toggling the expanded state for PASS/FAIL cases.
          if (state !== 'PENDING') {
            setExpanded(!expanded);
          }
        }}
        // Only add pointer cursor if clickable (PASS or FAIL state)
        className={`inline-flex items-center gap-1 rounded ${
          state !== 'PENDING' ? 'cursor-pointer' : ''
        }`}
      >
        Guardrail:
        <div className={`flex items-center gap-1 ${textColorClass}`}>
          <IconComponent /> {label}
        </div>
      </div>
      {/* Container for expandable content */}
      {state !== 'PENDING' &&
        guardrailResult.category &&
        guardrailResult.rationale && (
          <div
            className={`overflow-hidden transition-all duration-300 ${
              expanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="pt-2 text-xs">
              <strong>
                Moderation Category: {formatCategory(guardrailResult.category)}
              </strong>
              <div>{guardrailResult.rationale}</div>
              {guardrailResult.testText && (
                <blockquote className="mt-1 border-l-2 border-gray-300 pl-2 text-gray-400">
                  {guardrailResult.testText}
                </blockquote>
              )}
            </div>
          </div>
        )}
    </div>
  );
}
