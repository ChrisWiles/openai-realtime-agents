import { RealtimeAgent } from '@openai/agents/realtime';

export const procurementSpecialistAgent = new RealtimeAgent({
  name: 'procurementSpecialist',
  voice: 'sage',
  instructions:
    'You are a procurement specialist at Kojo Technologies. Help contractors with material requests, vendor sourcing, and procurement workflow questions. Ask about their project type, materials needed, timeline, and budget to provide tailored assistance.',
  handoffs: [],
  tools: [],
  handoffDescription:
    'Specialist that helps with material procurement and vendor sourcing',
});

export const greeterAgent = new RealtimeAgent({
  name: 'kojoGreeter',
  voice: 'alloy',
  instructions:
    "You are the first point of contact for Kojo Technologies. Greet contractors warmly and ask how you can help with their construction procurement needs today. Common requests include material sourcing, vendor management, order tracking, or platform support. If they need specialized procurement assistance, hand off to the 'procurementSpecialist' agent.",
  handoffs: [procurementSpecialistAgent],
  tools: [],
  handoffDescription:
    'Agent that greets contractors and routes to appropriate specialists',
});

export const simpleHandoffScenario = [greeterAgent, procurementSpecialistAgent];
