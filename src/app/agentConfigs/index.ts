import type { RealtimeAgent } from '@openai/agents/realtime';
import { chatSupervisorScenario } from './chatSupervisor';
import { customerServiceRetailScenario } from './customerServiceRetail';
import { materialOrderingScenario } from './materialOrdering';
import { simpleHandoffScenario } from './simpleHandoff';

// Map of scenario key -> array of RealtimeAgent objects
export const allAgentSets: Record<string, RealtimeAgent[]> = {
  simpleHandoff: simpleHandoffScenario,
  customerServiceRetail: customerServiceRetailScenario,
  chatSupervisor: chatSupervisorScenario,
  materialOrdering: materialOrderingScenario,
};

export const defaultAgentSetKey = 'chatSupervisor';
