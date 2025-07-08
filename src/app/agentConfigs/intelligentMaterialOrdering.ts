import { RealtimeAgent, tool } from '@openai/agents/realtime';

/**
 * Defines a catalog of materials with their required and optional fields, and validation rules.
 * This catalog is used by the `intelligentMaterialOrderingAgent` to validate material requests.
 */
const MATERIAL_CATALOG = {
  pvc_pipe: {
    name: 'PVC Pipe',
    required_fields: ['diameter', 'length', 'quantity', 'pressure_rating'],
    optional_fields: ['color', 'fitting_type'],
    validation_rules: {
      diameter: {
        type: 'enum',
        values: [
          '1/2"',
          '3/4"',
          '1"',
          '1.25"',
          '1.5"',
          '2"',
          '3"',
          '4"',
          '6"',
          '8"',
        ],
        message: 'Diameter? (1/2", 3/4", 1", 2", 4")',
      },
      length: {
        type: 'enum',
        values: ['10ft', '20ft'],
        message: 'Length? (10ft or 20ft)',
      },
      quantity: {
        type: 'number',
        message: 'How many pieces?',
      },
      pressure_rating: {
        type: 'enum',
        values: ['Schedule 40', 'Schedule 80', 'DWV', 'Class 200', 'Class 315'],
        message: 'Pressure rating? (Schedule 40, 80, DWV)',
      },
    },
  },
  copper_pipe: {
    name: 'Copper Pipe',
    required_fields: ['diameter', 'length', 'quantity', 'type'],
    optional_fields: ['temper'],
    validation_rules: {
      diameter: {
        type: 'enum',
        values: [
          '1/4"',
          '3/8"',
          '1/2"',
          '5/8"',
          '3/4"',
          '7/8"',
          '1"',
          '1.125"',
          '1.25"',
          '1.375"',
          '1.625"',
          '2.125"',
        ],
        message: 'Diameter? (1/2", 3/4", 1")',
      },
      length: {
        type: 'enum',
        values: ['10ft', '20ft'],
        message: 'Length? (10ft or 20ft)',
      },
      quantity: {
        type: 'number',
        message: 'How many pieces?',
      },
      type: {
        type: 'enum',
        values: ['Type K', 'Type L', 'Type M', 'DWV'],
        message: 'Type? (K, L, M, DWV)',
      },
    },
  },
  electrical_wire: {
    name: 'Electrical Wire',
    required_fields: [
      'gauge',
      'length',
      'quantity',
      'conductor_count',
      'insulation_type',
    ],
    optional_fields: ['color', 'stranding'],
    validation_rules: {
      gauge: {
        type: 'enum',
        values: [
          '14 AWG',
          '12 AWG',
          '10 AWG',
          '8 AWG',
          '6 AWG',
          '4 AWG',
          '2 AWG',
          '1 AWG',
          '1/0 AWG',
          '2/0 AWG',
        ],
        message: 'Gauge? (12, 14, 10 AWG)',
      },
      length: {
        type: 'enum',
        values: ['250ft', '500ft', '1000ft', 'custom'],
        message: 'Length per roll? (250ft, 500ft, 1000ft)',
      },
      quantity: {
        type: 'number',
        message: 'How many rolls?',
      },
      conductor_count: {
        type: 'enum',
        values: [
          '2-conductor',
          '3-conductor',
          '4-conductor',
          'single conductor',
        ],
        message: 'Conductors? (single, 2, 3, 4)',
      },
      insulation_type: {
        type: 'enum',
        values: ['THHN', 'THWN', 'NM-B', 'UF-B', 'XHHW', 'USE-2'],
        message: 'Insulation? (THHN, THWN, NM-B)',
      },
    },
  },
  lumber: {
    name: 'Lumber',
    required_fields: ['dimensions', 'length', 'quantity', 'grade', 'species'],
    optional_fields: ['treatment', 'moisture_content'],
    validation_rules: {
      dimensions: {
        type: 'enum',
        values: [
          '2x4',
          '2x6',
          '2x8',
          '2x10',
          '2x12',
          '1x4',
          '1x6',
          '1x8',
          '1x10',
          '1x12',
          '4x4',
          '6x6',
        ],
        message: 'Size? (2x4, 2x6, 2x8)',
      },
      length: {
        type: 'enum',
        values: ['8ft', '10ft', '12ft', '14ft', '16ft', '20ft'],
        message: 'Length? (8ft, 10ft, 12ft, 16ft)',
      },
      quantity: {
        type: 'number',
        message: 'How many pieces?',
      },
      grade: {
        type: 'enum',
        values: [
          'Construction',
          'Standard',
          'Utility',
          'Stud',
          'Select Structural',
          'No. 1',
          'No. 2',
        ],
        message: 'Grade? (Construction, Stud, Standard)',
      },
      species: {
        type: 'enum',
        values: [
          'Douglas Fir',
          'Southern Pine',
          'Hem-Fir',
          'SPF',
          'Cedar',
          'Redwood',
          'Pressure Treated',
        ],
        message: 'Species? (Doug Fir, PT, Cedar)',
      },
    },
  },
  concrete: {
    name: 'Concrete',
    required_fields: ['mix_design', 'quantity', 'delivery_method'],
    optional_fields: ['additives', 'slump'],
    validation_rules: {
      mix_design: {
        type: 'enum',
        values: [
          '3000 PSI',
          '3500 PSI',
          '4000 PSI',
          '4500 PSI',
          '5000 PSI',
          'Fiber Mix',
          'High Early',
        ],
        message:
          'What concrete strength do you need? (3000 PSI, 4000 PSI, 5000 PSI, etc.)',
      },
      quantity: {
        type: 'number_with_unit',
        units: ['cubic yards', 'cy', 'cubic feet', 'cf', 'cubic meters', 'm3'],
        message:
          'How much concrete do you need? (e.g., "5 cubic yards", "3.5 cy")',
      },
      delivery_method: {
        type: 'enum',
        values: ['Ready Mix Truck', 'Pump Truck', 'Wheelbarrow', 'Conveyor'],
        message:
          'How should the concrete be delivered? (Ready Mix Truck, Pump Truck, etc.)',
      },
    },
  },
};

/**
 * Represents the current state of the shopping cart.
 * In a real system, this would typically be stored in a database.
 */
let CURRENT_CART: Array<{
  id: string;
  material_type: string;
  specifications: Record<string, any>;
  status: 'incomplete' | 'validated' | 'confirmed';
  missing_fields: string[];
  quantity?: number;
}> = [];

/**
 * Defines the intelligent material ordering agent for Kojo Technologies.
 * This agent is designed to be concise and efficient, parsing material requests,
 * identifying missing specifications, managing the cart, and submitting orders.
 */
export const intelligentMaterialOrderingAgent = new RealtimeAgent({
  name: 'intelligentMaterialOrdering',
  voice: 'coral',
  instructions: `
You are Kojo's material ordering assistant. Be concise and efficient.

# Core Tasks
- Parse material requests
- Identify missing specs
- Ask for required info
- Manage cart
- Submit orders

# Communication Style
- Be brief and direct
- One question at a time
- Skip pleasantries
- Use short sentences
- Get to the point

# Important Rules
- Pipes and lumber come in standard lengths (10ft, 20ft)
- Always ask for QUANTITY (number of pieces), not total length
- If user says "100 ft of pipe", clarify: "How many 10ft pieces?"
- Standard pipe length is 10ft unless specified

# Example Responses
User: "I need 10 ft of 2" Schedule 80 PVC"
You: "One 10ft piece of 2" Schedule 80 PVC?"

User: "No, I need 200 feet total"
You: "Length? (10ft or 20ft)"

User: "10ft"
You: "20 pieces of 10ft 2" Schedule 80 PVC. Add to cart?"

Another example:
User: "I need PVC pipe"
You: "Diameter? (1/2", 3/4", 1", 2", 4")"

User: "2 inch"
You: "Length? (10ft or 20ft)"

User: "10ft"
You: "How many pieces?"

User: "5"
You: "Pressure rating? (Schedule 40, 80, DWV)"

User: "Schedule 40"
You: "5 pieces of 10ft 2" Schedule 40 PVC. Add to cart?"

IMPORTANT: Keep responses under 20 words when possible. Be helpful but extremely concise.
`,

  tools: [
    /**
     * Tool to parse a natural language material request and identify the material type
     * and any provided specifications.
     */
    tool({
      name: 'parseMaterialRequest',
      description:
        'Parse a natural language material request and identify the material type and any provided specifications',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          user_request: {
            type: 'string',
            description: "The user's natural language material request",
          },
        },
        required: ['user_request'],
      },
      execute: async (input) => {
        const { user_request } = input as { user_request: string };

        // Simple keyword-based material type detection
        const request_lower = user_request.toLowerCase();
        let material_type = '';
        const detected_specs: Record<string, any> = {};

        // Detect material type
        if (request_lower.includes('pvc') && request_lower.includes('pipe')) {
          material_type = 'pvc_pipe';
        } else if (
          request_lower.includes('copper') &&
          request_lower.includes('pipe')
        ) {
          material_type = 'copper_pipe';
        } else if (
          request_lower.includes('wire') ||
          request_lower.includes('electrical')
        ) {
          material_type = 'electrical_wire';
        } else if (
          request_lower.includes('lumber') ||
          request_lower.includes('2x4') ||
          request_lower.includes('2x6') ||
          request_lower.includes('2x8')
        ) {
          material_type = 'lumber';
        } else if (request_lower.includes('concrete')) {
          material_type = 'concrete';
        }

        // Extract basic specifications if detected
        if (material_type) {
          // Extract dimensions for lumber
          const dimensionMatch = request_lower.match(
            /(2x4|2x6|2x8|2x10|2x12|1x4|1x6|1x8|4x4|6x6)/
          );
          if (dimensionMatch && material_type === 'lumber') {
            detected_specs.dimensions = dimensionMatch[1];
          }

          // Extract length patterns
          const lengthMatch = request_lower.match(
            /(\d+(?:\.\d+)?)\s*(feet|foot|ft|meters?|m)\s*(of)?/
          );
          if (lengthMatch) {
            detected_specs.length = `${lengthMatch[1]}ft`;
          }

          // Extract quantity patterns
          const quantityMatch = request_lower.match(
            /(\d+)\s*(pieces?|sticks?|rolls?|boards?)(?:\s+of)?/
          );
          if (quantityMatch) {
            detected_specs.quantity = parseInt(quantityMatch[1]);
          } else {
            // Check for simple number at start
            const simpleQtyMatch = request_lower.match(/^(\d+)\s+/);
            if (simpleQtyMatch) {
              detected_specs.quantity = parseInt(simpleQtyMatch[1]);
            }
          }

          // Extract diameter for pipes
          const diameterMatch = request_lower.match(
            /(\d+(?:\/\d+)?)\s*(?:inch|in|")/
          );
          if (
            diameterMatch &&
            (material_type === 'pvc_pipe' || material_type === 'copper_pipe')
          ) {
            detected_specs.diameter = `${diameterMatch[1]}"`;
          }

          // Extract wire gauge
          const gaugeMatch = request_lower.match(/(\d+)\s*(?:awg|gauge)/);
          if (gaugeMatch && material_type === 'electrical_wire') {
            detected_specs.gauge = `${gaugeMatch[1]} AWG`;
          }

          // Extract concrete strength
          const psiMatch = request_lower.match(/(\d+)\s*psi/);
          if (psiMatch && material_type === 'concrete') {
            detected_specs.mix_design = `${psiMatch[1]} PSI`;
          }
        }

        return {
          material_type,
          detected_specifications: detected_specs,
          confidence: material_type ? 'high' : 'low',
          original_request: user_request,
        };
      },
    }),

    /**
     * Tool to validate material specifications against catalog requirements and identify missing fields.
     */
    tool({
      name: 'validateMaterialSpecs',
      description:
        'Validate material specifications against catalog requirements and identify missing fields',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          material_type: {
            type: 'string',
            description: 'The type of material being ordered',
          },
          specifications: {
            type: 'object',
            description: 'The specifications provided so far',
          },
        },
        required: ['material_type', 'specifications'],
      },
      execute: async (input) => {
        const { material_type, specifications } = input as {
          material_type: string;
          specifications: Record<string, any>;
        };

        const catalog_item =
          MATERIAL_CATALOG[material_type as keyof typeof MATERIAL_CATALOG];
        if (!catalog_item) {
          return {
            is_valid: false,
            error: `Unknown material type: ${material_type}`,
            missing_fields: [],
            validation_messages: [],
          };
        }

        const missing_fields: string[] = [];
        const validation_messages: string[] = [];

        // Check required fields
        for (const field of catalog_item.required_fields) {
          if (!specifications[field]) {
            missing_fields.push(field);
            const rule = (catalog_item.validation_rules as any)[field];
            if (rule) {
              validation_messages.push(rule.message);
            }
          }
        }

        // Validate provided fields
        for (const [field, value] of Object.entries(specifications)) {
          const rule = (catalog_item.validation_rules as any)[field];
          if (rule && rule.type === 'enum') {
            if (!rule.values.includes(value)) {
              validation_messages.push(
                `Invalid ${field}: ${value}. Valid options: ${rule.values.join(', ')}`
              );
            }
          }
        }

        return {
          is_valid: missing_fields.length === 0,
          missing_fields,
          validation_messages,
          material_name: catalog_item.name,
          next_required_field: missing_fields[0] || null,
        };
      },
    }),

    /**
     * Tool to add a validated material item to the cart.
     */
    tool({
      name: 'addToCart',
      description: 'Add a validated material item to the cart',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          material_type: {
            type: 'string',
            description: 'The type of material',
          },
          specifications: {
            type: 'object',
            description: 'Complete and validated specifications',
          },
          quantity: {
            type: 'number',
            description: 'Quantity of items (default: 1)',
          },
        },
        required: ['material_type', 'specifications'],
      },
      execute: async (input) => {
        const {
          material_type,
          specifications,
          quantity = 1,
        } = input as {
          material_type: string;
          specifications: Record<string, any>;
          quantity?: number;
        };

        const item_id = `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

        const cart_item = {
          id: item_id,
          material_type,
          specifications,
          quantity,
          status: 'confirmed' as const,
          missing_fields: [],
        };

        CURRENT_CART.push(cart_item);

        const catalog_item =
          MATERIAL_CATALOG[material_type as keyof typeof MATERIAL_CATALOG];

        return {
          success: true,
          item_id,
          cart_item,
          material_name: catalog_item?.name || material_type,
          cart_total_items: CURRENT_CART.length,
          message: `Added ${quantity}x ${catalog_item?.name || material_type} to your cart`,
        };
      },
    }),

    /**
     * Tool to display current cart contents.
     */
    tool({
      name: 'viewCart',
      description: 'Display current cart contents',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {},
        required: [],
      },
      execute: async () => {
        const cart_summary = CURRENT_CART.map((item) => {
          const catalog_item =
            MATERIAL_CATALOG[
              item.material_type as keyof typeof MATERIAL_CATALOG
            ];
          return {
            id: item.id,
            material_name: catalog_item?.name || item.material_type,
            quantity: item.quantity || 1,
            specifications: item.specifications,
            status: item.status,
          };
        });

        return {
          cart_items: cart_summary,
          total_items: CURRENT_CART.length,
          total_line_items: CURRENT_CART.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0
          ),
          is_empty: CURRENT_CART.length === 0,
        };
      },
    }),

    /**
     * Tool to remove an item from the cart.
     */
    tool({
      name: 'removeFromCart',
      description: 'Remove an item from the cart',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          item_id: {
            type: 'string',
            description: 'The ID of the item to remove',
          },
        },
        required: ['item_id'],
      },
      execute: async (input) => {
        const { item_id } = input as { item_id: string };

        const initial_length = CURRENT_CART.length;
        CURRENT_CART = CURRENT_CART.filter((item) => item.id !== item_id);

        return {
          success: CURRENT_CART.length < initial_length,
          removed: CURRENT_CART.length < initial_length,
          remaining_items: CURRENT_CART.length,
        };
      },
    }),

    /**
     * Tool to submit the complete order for processing.
     */
    tool({
      name: 'submitOrder',
      description: 'Submit the complete order for processing',
      parameters: {
        type: 'object',
        additionalProperties: false,
        properties: {
          delivery_address: {
            type: 'string',
            description: 'Delivery address for the order',
          },
          delivery_date: {
            type: 'string',
            description: 'Requested delivery date',
          },
          special_instructions: {
            type: 'string',
            description: 'Any special delivery or handling instructions',
          },
        },
        required: ['delivery_address'],
      },
      execute: async (input) => {
        const { delivery_address, delivery_date, special_instructions } =
          input as {
            delivery_address: string;
            delivery_date?: string;
            special_instructions?: string;
          };

        if (CURRENT_CART.length === 0) {
          return {
            success: false,
            error: 'Cannot submit empty cart',
          };
        }

        // Generate order number
        const order_number = `KT-${Date.now()}`;

        // Create order summary
        const order_summary = {
          order_number,
          items: CURRENT_CART.map((item) => {
            const catalog_item =
              MATERIAL_CATALOG[
                item.material_type as keyof typeof MATERIAL_CATALOG
              ];
            return {
              material_name: catalog_item?.name || item.material_type,
              quantity: item.quantity || 1,
              specifications: item.specifications,
            };
          }),
          delivery_details: {
            address: delivery_address,
            requested_date: delivery_date,
            special_instructions,
          },
          total_line_items: CURRENT_CART.reduce(
            (sum, item) => sum + (item.quantity || 1),
            0
          ),
          submitted_at: new Date().toISOString(),
        };

        // Clear cart after successful submission
        CURRENT_CART = [];

        return {
          success: true,
          order_number,
          order_summary,
          message: `Order ${order_number} submitted successfully! You'll receive a confirmation email shortly.`,
        };
      },
    }),
  ],

  handoffs: [], // No handoffs for this specialized agent
});

/**
 * Defines the intelligent material ordering scenario.
 */
export const intelligentMaterialOrderingScenario = [
  intelligentMaterialOrderingAgent,
];

/**
 * The company name associated with the intelligent material ordering agent.
 */
export const intelligentMaterialOrderingCompanyName = 'Kojo Technologies';
