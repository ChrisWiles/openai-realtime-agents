import type { RealtimeAgent } from '@openai/agents/realtime';
import { chatSupervisorScenario } from './chatSupervisor';
import { customerServiceRetailScenario } from './customerServiceRetail';
import { intelligentMaterialOrderingScenario } from './intelligentMaterialOrdering';
import { materialOrderingScenario } from './materialOrdering';
import { simpleHandoffScenario } from './simpleHandoff';

// Scenario configuration with metadata
export interface ScenarioConfig {
  key: string;
  title: string;
  description: string;
  agents: RealtimeAgent[];
}

// Available scenarios with descriptions
export const scenarioConfigs: ScenarioConfig[] = [
  {
    key: 'chatSupervisor',
    title: 'Chat Supervisor',
    description:
      'Realtime chat agent with intelligent supervisor for complex tasks',
    agents: chatSupervisorScenario,
  },
  {
    key: 'intelligentMaterialOrdering',
    title: 'Intelligent Material Ordering',
    description:
      'AI assistant that validates and clarifies material orders with smart prompting',
    agents: intelligentMaterialOrderingScenario,
  },
  {
    key: 'customerServiceRetail',
    title: 'Customer Service Retail',
    description:
      'Multi-agent customer service flow with authentication and returns',
    agents: customerServiceRetailScenario,
  },
  {
    key: 'materialOrdering',
    title: 'Material Ordering',
    description: 'Construction material ordering and vendor management',
    agents: materialOrderingScenario,
  },
  {
    key: 'simpleHandoff',
    title: 'Simple Handoff',
    description: 'Basic demonstration of agent-to-agent handoffs',
    agents: simpleHandoffScenario,
  },
];

// Map of scenario key -> array of RealtimeAgent objects (for backwards compatibility)
export const allAgentSets: Record<string, RealtimeAgent[]> = {
  simpleHandoff: simpleHandoffScenario,
  customerServiceRetail: customerServiceRetailScenario,
  chatSupervisor: chatSupervisorScenario,
  materialOrdering: materialOrderingScenario,
  intelligentMaterialOrdering: intelligentMaterialOrderingScenario,
};

export const defaultAgentSetKey = 'chatSupervisor';
