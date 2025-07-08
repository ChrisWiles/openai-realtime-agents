import type { RealtimeAgent } from '@openai/agents/realtime';
import { chatSupervisorScenario } from './chatSupervisor';
import { customerServiceRetailScenario } from './customerServiceRetail';
import { intelligentMaterialOrderingScenario } from './intelligentMaterialOrdering';
import { materialOrderingScenario } from './materialOrdering';
import { simpleHandoffScenario } from './simpleHandoff';

/**
 * Defines the configuration for a single agent scenario.
 */
export interface ScenarioConfig {
  /** A unique key for the scenario. */
  key: string;
  /** The title of the scenario, displayed in the UI. */
  title: string;
  /** A brief description of what the scenario demonstrates. */
  description: string;
  /** An array of RealtimeAgent instances participating in this scenario. */
  agents: RealtimeAgent[];
}

/**
 * An array of all available agent scenario configurations.
 */
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

/**
 * A map of scenario keys to arrays of RealtimeAgent objects.
 * This is primarily for backwards compatibility.
 */
export const allAgentSets: Record<string, RealtimeAgent[]> = {
  simpleHandoff: simpleHandoffScenario,
  customerServiceRetail: customerServiceRetailScenario,
  chatSupervisor: chatSupervisorScenario,
  materialOrdering: materialOrderingScenario,
  intelligentMaterialOrdering: intelligentMaterialOrderingScenario,
};

/**
 * The key of the default agent set to be loaded when the application starts.
 */
export const defaultAgentSetKey = 'chatSupervisor';
