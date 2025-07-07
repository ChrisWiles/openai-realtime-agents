import { RealtimeAgent, tool } from '@openai/agents/realtime';

// Material ordering agent with comprehensive validation
export const materialOrderingAgent = new RealtimeAgent({
  name: 'materialOrdering',
  voice: 'ballad',
  instructions: `
You're Kojo's material ordering specialist. Be brief and efficient.

# Tasks
- Validate orders
- Check availability
- Get delivery info
- Submit orders

# Communication
- Keep responses under 25 words
- One question at a time
- No fluff, just facts
- Direct and clear

# Examples
User: "Need 100 ft of 1/2 EMT"
You: "10 sticks (10ft each). Delivery address?"

User: "Order 500 ft of 12 AWG wire"
You: "Wire type? (THHN, Romex, XHHW)"

User: "THHN"
You: "500ft 12AWG THHN. When needed?"

# Missing Info Prompts
- Quantity: "How much?"
- Size: "What size?"
- Delivery: "Where and when?"
- Budget: "PO number?"

Be concise. Get orders done fast.
`,
  tools: [
    tool({
      name: 'validateMaterialOrder',
      description: 'Validate a material order for completeness and accuracy',
      parameters: {
        type: 'object',
        properties: {
          material_type: {
            type: 'string',
            description:
              'Type of material (e.g., "EMT conduit", "THHN wire", "copper pipe")',
          },
          specifications: {
            type: 'object',
            properties: {
              size: {
                type: 'string',
                description: 'Size specification (e.g., "1/2 inch", "12 AWG")',
              },
              grade: {
                type: 'string',
                description:
                  'Material grade or type (e.g., "THHN", "Schedule 40")',
              },
              rating: {
                type: 'string',
                description: 'Voltage, pressure, or other ratings',
              },
            },
          },
          quantity: {
            type: 'number',
            description: 'Quantity needed',
          },
          units: {
            type: 'string',
            description: 'Units (ft, pieces, rolls, etc.)',
          },
          project_info: {
            type: 'object',
            properties: {
              project_name: { type: 'string' },
              job_site_address: { type: 'string' },
              delivery_date: { type: 'string' },
              budget_code: { type: 'string' },
            },
          },
        },
        required: ['material_type', 'quantity', 'units'],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { material_type, specifications, quantity, project_info } =
          input as any;

        const validationResults = {
          isValid: true,
          warnings: [] as string[],
          suggestions: [] as string[],
          missing_fields: [] as string[],
        };

        // Check for missing specifications
        if (!specifications?.size) {
          validationResults.missing_fields.push('size specification');
          validationResults.isValid = false;
        }

        if (!project_info?.job_site_address) {
          validationResults.missing_fields.push('delivery address');
          validationResults.isValid = false;
        }

        if (!project_info?.delivery_date) {
          validationResults.missing_fields.push('delivery date');
          validationResults.isValid = false;
        }

        // Material-specific validations
        if (material_type.toLowerCase().includes('emt')) {
          if (quantity > 0 && quantity < 10) {
            validationResults.warnings.push(
              'EMT conduit comes in 10ft sticks. You may want to order 10ft minimum.'
            );
          }
          validationResults.suggestions.push(
            'EMT conduit is sold in 10-foot lengths. Consider ordering in multiples of 10.'
          );
        }

        if (material_type.toLowerCase().includes('wire')) {
          if (!specifications?.grade) {
            validationResults.missing_fields.push(
              'wire type (THHN, Romex, etc.)'
            );
            validationResults.isValid = false;
          }
          if (!specifications?.rating) {
            validationResults.missing_fields.push('voltage rating');
          }
        }

        return {
          validation_result: validationResults,
          estimated_cost: quantity * 15, // Mock pricing
          availability: 'In stock at 3 vendors',
        };
      },
    }),

    tool({
      name: 'checkMaterialAvailability',
      description:
        'Check availability and pricing for materials across vendors',
      parameters: {
        type: 'object',
        properties: {
          material_description: {
            type: 'string',
            description: 'Complete material description with specifications',
          },
          quantity: {
            type: 'number',
            description: 'Quantity needed',
          },
          zip_code: {
            type: 'string',
            description: 'Delivery zip code for vendor search',
          },
          urgency: {
            type: 'string',
            enum: ['standard', 'rush', 'emergency'],
            description: 'Delivery urgency level',
          },
        },
        required: ['material_description', 'quantity'],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { material_description, quantity, urgency } = input as any;

        // Mock vendor data
        const vendors = [
          {
            name: 'ABC Electrical Supply',
            price_per_unit: 14.5,
            in_stock: true,
            delivery_time: urgency === 'emergency' ? 'Same day' : '2-3 days',
            minimum_order: 10,
            distance: '2.3 miles',
          },
          {
            name: 'Metro Building Supply',
            price_per_unit: 13.75,
            in_stock: true,
            delivery_time: urgency === 'emergency' ? 'Next day' : '1-2 days',
            minimum_order: 5,
            distance: '4.1 miles',
          },
          {
            name: 'Professional Trade Supply',
            price_per_unit: 15.25,
            in_stock: false,
            delivery_time: '5-7 days',
            minimum_order: 1,
            distance: '1.8 miles',
            note: 'Can special order',
          },
        ];

        return {
          material: material_description,
          quantity: quantity,
          vendors: vendors,
          best_price: Math.min(
            ...vendors.filter((v) => v.in_stock).map((v) => v.price_per_unit)
          ),
          fastest_delivery: vendors.filter((v) => v.in_stock)[0].delivery_time,
        };
      },
    }),

    tool({
      name: 'createMaterialOrder',
      description: 'Create a purchase order for validated materials',
      parameters: {
        type: 'object',
        properties: {
          order_details: {
            type: 'object',
            properties: {
              material_description: { type: 'string' },
              quantity: { type: 'number' },
              unit_price: { type: 'number' },
              vendor_name: { type: 'string' },
              delivery_address: { type: 'string' },
              delivery_date: { type: 'string' },
              project_code: { type: 'string' },
            },
            required: [
              'material_description',
              'quantity',
              'vendor_name',
              'delivery_address',
            ],
          },
          approval_needed: {
            type: 'boolean',
            description: 'Whether order requires manager approval',
          },
        },
        required: ['order_details'],
        additionalProperties: false,
      },
      execute: async (input) => {
        const { order_details, approval_needed } = input as any;
        const po_number = `PO-${Date.now().toString().slice(-6)}`;

        return {
          purchase_order_number: po_number,
          status: approval_needed ? 'Pending Approval' : 'Confirmed',
          total_cost: order_details.quantity * (order_details.unit_price || 15),
          estimated_delivery: order_details.delivery_date,
          tracking_info: `Order ${po_number} created successfully`,
          next_steps: approval_needed
            ? 'Sent to project manager for approval'
            : 'Order sent to vendor, tracking will be provided',
        };
      },
    }),
  ],
  handoffs: [],
  handoffDescription:
    'Specialist for material ordering with comprehensive validation and vendor management',
});

// Emergency procurement agent for urgent orders
export const emergencyProcurementAgent = new RealtimeAgent({
  name: 'emergencyProcurement',
  voice: 'ash',
  instructions: `
You are an emergency procurement specialist at Kojo Technologies. You handle URGENT material needs when job sites are down or contractors need immediate materials.

# Emergency Protocol
1. **Assess Urgency**: Understand why this is urgent (job site down, safety issue, deadline)
2. **Fast Validation**: Get minimal required info quickly
3. **Immediate Search**: Find closest suppliers with stock
4. **Quick Decision**: Present best options for immediate pickup/delivery
5. **Express Order**: Create emergency PO and notify vendor immediately

# Priority Questions (ask quickly)
- "What exactly do you need right now?"
- "Where are you located?"
- "How urgent - can you wait 2 hours or do you need it now?"
- "Is this stopping work completely?"

# Speed Over Perfection
- Accept phone confirmations for specifications
- Use closest vendor even if slightly more expensive  
- Arrange pickup over delivery when faster
- Create emergency PO first, refine details later

Sample: "URGENT: I need a 100 amp breaker, job site is down!"
Response: "I'll find that immediately. What's your location? What brand panel is this for? I'll have options in 2 minutes."
`,
  tools: [
    tool({
      name: 'emergencyVendorSearch',
      description:
        'Find vendors with immediate availability for emergency orders',
      parameters: {
        type: 'object',
        properties: {
          material_needed: {
            type: 'string',
            description: 'What material is urgently needed',
          },
          location: {
            type: 'string',
            description: 'Job site or pickup location',
          },
          max_distance: {
            type: 'number',
            description: 'Maximum distance willing to travel (miles)',
          },
        },
        required: ['material_needed', 'location'],
        additionalProperties: false,
      },
      execute: async (_input) => {
        return {
          urgent_suppliers: [
            {
              name: 'QuickStop Electrical',
              distance: '1.2 miles',
              phone: '(555) 123-4567',
              has_item: true,
              pickup_ready: '15 minutes',
              price: '$89',
            },
            {
              name: '24/7 Supply Depot',
              distance: '3.4 miles',
              phone: '(555) 987-6543',
              has_item: true,
              pickup_ready: '30 minutes',
              price: '$95',
            },
          ],
          recommendation: 'QuickStop Electrical - closest and fastest',
        };
      },
    }),
  ],
  handoffs: [],
  handoffDescription:
    'Emergency procurement for urgent material needs and job site emergencies',
});

export const materialOrderingScenario = [
  materialOrderingAgent,
  emergencyProcurementAgent,
];
