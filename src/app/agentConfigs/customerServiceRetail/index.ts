import { authenticationAgent } from './authentication';
import { returnsAgent } from './returns';
import { salesAgent } from './sales';
import { simulatedHumanAgent } from './simulatedHuman';

// Cast to `any` to satisfy TypeScript until the core types make RealtimeAgent
// assignable to `Agent<unknown>` (current library versions are invariant on
// the context type).

/**
 * Configures the handoff relationships for the authentication agent.
 * The authentication agent can hand off to the returns, sales, and simulated human agents.
 */
(authenticationAgent.handoffs as any).push(
  returnsAgent,
  salesAgent,
  simulatedHumanAgent
);

/**
 * Configures the handoff relationships for the returns agent.
 * The returns agent can hand off to the authentication, sales, and simulated human agents.
 */
(returnsAgent.handoffs as any).push(
  authenticationAgent,
  salesAgent,
  simulatedHumanAgent
);

/**
 * Configures the handoff relationships for the sales agent.
 * The sales agent can hand off to the authentication, returns, and simulated human agents.
 */
(salesAgent.handoffs as any).push(
  authenticationAgent,
  returnsAgent,
  simulatedHumanAgent
);

/**
 * Configures the handoff relationships for the simulated human agent.
 * The simulated human agent can hand off to the authentication, returns, and sales agents.
 */
(simulatedHumanAgent.handoffs as any).push(
  authenticationAgent,
  returnsAgent,
  salesAgent
);

/**
 * Defines the customer service retail scenario, including all participating agents.
 */
export const customerServiceRetailScenario = [
  authenticationAgent,
  returnsAgent,
  salesAgent,
  simulatedHumanAgent,
];

/**
 * The name of the company represented by this agent set. Used by guardrails.
 */
export const customerServiceRetailCompanyName = 'Kojo Technologies';
