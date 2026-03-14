export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'BetterMe — Admin Backend API',
    version: '1.0.0',
    description:
      'Admin API for managing the wellness quiz DAG (nodes, edges, offers) and the read-only Content Delivery API consumed by the user-facing frontend.',
  },
  servers: [{ url: 'http://localhost:3001', description: 'Local' }],
  tags: [
    { name: 'Graph',   description: 'Full DAG overview' },
    { name: 'Nodes',   description: 'Question and Info page nodes' },
    { name: 'Edges',   description: 'Directed edges with transition conditions' },
    { name: 'Offers',  description: 'Personalized wellness offers' },
    { name: 'Content', description: 'Read-only delivery API for user frontend' },
  ],

  components: {
    schemas: {
      NodeOption: {
        type: 'object',
        required: ['value', 'label'],
        properties: {
          value: { type: 'string', example: 'weight_loss' },
          label: { type: 'string', example: 'Lose Weight' },
          icon:  { type: 'string', example: '🔥' },
        },
      },

      SimpleCondition: {
        type: 'object',
        required: ['type', 'attribute', 'op', 'value'],
        properties: {
          type:      { type: 'string', enum: ['simple'] },
          attribute: { type: 'string', example: 'goal' },
          op: {
            type: 'string',
            enum: ['eq', 'neq', 'in', 'nin', 'contains', 'gt', 'lt', 'gte', 'lte'],
            example: 'eq',
          },
          value: {
            oneOf: [
              { type: 'string' },
              { type: 'number' },
              { type: 'array', items: { type: 'string' } },
            ],
            example: 'weight_loss',
          },
        },
      },

      CompoundCondition: {
        type: 'object',
        required: ['type', 'operator', 'conditions'],
        properties: {
          type:       { type: 'string', enum: ['compound'] },
          operator:   { type: 'string', enum: ['AND', 'OR'] },
          conditions: {
            type: 'array',
            items: { $ref: '#/components/schemas/Condition' },
          },
        },
      },

      Condition: {
        oneOf: [
          { $ref: '#/components/schemas/SimpleCondition' },
          { $ref: '#/components/schemas/CompoundCondition' },
        ],
        example: {
          type: 'compound',
          operator: 'AND',
          conditions: [
            { type: 'simple', attribute: 'goal',    op: 'eq', value: 'weight_loss' },
            { type: 'simple', attribute: 'context', op: 'eq', value: 'home' },
          ],
        },
      },

      Node: {
        type: 'object',
        properties: {
          id:            { type: 'string', format: 'uuid' },
          type:          { type: 'string', enum: ['question', 'info'] },
          title:         { type: 'string', example: 'What is your main wellness goal?' },
          description:   { type: 'string', nullable: true },
          question_type: {
            type: 'string',
            nullable: true,
            enum: ['single_choice', 'multi_choice', 'text_input', 'number_input'],
          },
          options: {
            type: 'array',
            nullable: true,
            items: { $ref: '#/components/schemas/NodeOption' },
          },
          attribute_key: { type: 'string', nullable: true, example: 'goal' },
          pos_x:         { type: 'number', example: 100 },
          pos_y:         { type: 'number', example: 250 },
          is_start:      { type: 'boolean', example: false },
          created_at:    { type: 'string', format: 'date-time' },
          updated_at:    { type: 'string', format: 'date-time' },
        },
      },

      CreateNodeBody: {
        type: 'object',
        required: ['type', 'title'],
        properties: {
          type:          { type: 'string', enum: ['question', 'info'] },
          title:         { type: 'string' },
          description:   { type: 'string' },
          question_type: {
            type: 'string',
            enum: ['single_choice', 'multi_choice', 'text_input', 'number_input'],
          },
          options: {
            type: 'array',
            items: { $ref: '#/components/schemas/NodeOption' },
          },
          attribute_key: { type: 'string' },
          pos_x:         { type: 'number' },
          pos_y:         { type: 'number' },
          is_start:      { type: 'boolean' },
        },
      },

      Edge: {
        type: 'object',
        properties: {
          id:             { type: 'string', format: 'uuid' },
          source_node_id: { type: 'string', format: 'uuid' },
          target_node_id: { type: 'string', format: 'uuid' },
          label:          { type: 'string', nullable: true, example: 'Weight loss at home' },
          conditions:     { $ref: '#/components/schemas/Condition', nullable: true },
          priority:       { type: 'integer', example: 10 },
          created_at:     { type: 'string', format: 'date-time' },
        },
      },

      CreateEdgeBody: {
        type: 'object',
        required: ['source_node_id', 'target_node_id'],
        properties: {
          source_node_id: { type: 'string', format: 'uuid' },
          target_node_id: { type: 'string', format: 'uuid' },
          label:          { type: 'string' },
          conditions:     { $ref: '#/components/schemas/Condition', nullable: true },
          priority:       { type: 'integer', default: 0 },
        },
      },

      Offer: {
        type: 'object',
        properties: {
          id:           { type: 'string', format: 'uuid' },
          name:         { type: 'string', example: 'Quick Fit Micro-Workouts' },
          slug:         { type: 'string', example: 'quick-fit-micro' },
          description:  { type: 'string', nullable: true },
          digital_plan: { type: 'string', nullable: true },
          physical_kit: { type: 'string', nullable: true },
          why_text:     { type: 'string', nullable: true },
          cta_text:     { type: 'string', example: 'Start My Quick Fit Plan' },
          conditions:   { $ref: '#/components/schemas/Condition', nullable: true },
          priority:     { type: 'integer', example: 110 },
          is_addon:     { type: 'boolean', example: false },
          created_at:   { type: 'string', format: 'date-time' },
        },
      },

      CreateOfferBody: {
        type: 'object',
        required: ['name', 'slug'],
        properties: {
          name:         { type: 'string' },
          slug:         { type: 'string' },
          description:  { type: 'string' },
          digital_plan: { type: 'string' },
          physical_kit: { type: 'string' },
          why_text:     { type: 'string' },
          cta_text:     { type: 'string', default: 'Start My Journey' },
          conditions:   { $ref: '#/components/schemas/Condition', nullable: true },
          priority:     { type: 'integer', default: 0 },
          is_addon:     { type: 'boolean', default: false },
        },
      },

      Graph: {
        type: 'object',
        properties: {
          nodes: { type: 'array', items: { $ref: '#/components/schemas/Node' } },
          edges: { type: 'array', items: { $ref: '#/components/schemas/Edge' } },
        },
      },

      ContentGraph: {
        type: 'object',
        properties: {
          nodes:  { type: 'array', items: { $ref: '#/components/schemas/Node' } },
          edges:  { type: 'array', items: { $ref: '#/components/schemas/Edge' } },
          offers: { type: 'array', items: { $ref: '#/components/schemas/Offer' } },
        },
      },

      Error: {
        type: 'object',
        properties: {
          error:  { type: 'string' },
          detail: { type: 'string' },
        },
      },
    },
  },

  paths: {
    // ── GRAPH ──────────────────────────────────────────────
    '/api/admin/graph': {
      get: {
        tags: ['Graph'],
        summary: 'Get full DAG',
        description: 'Returns all nodes and edges. Used by the Admin FE graph editor.',
        responses: {
          200: {
            description: 'Full DAG',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Graph' } } },
          },
          500: { description: 'Server error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    // ── NODES ──────────────────────────────────────────────
    '/api/admin/nodes': {
      get: {
        tags: ['Nodes'],
        summary: 'List all nodes',
        responses: {
          200: {
            description: 'Array of nodes',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Node' } } } },
          },
        },
      },
      post: {
        tags: ['Nodes'],
        summary: 'Create a node',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateNodeBody' },
              example: {
                type: 'question',
                title: 'How much time do you have daily?',
                question_type: 'single_choice',
                options: [
                  { value: '10-15', label: '10–15 minutes', icon: '⚡' },
                  { value: '20-30', label: '20–30 minutes', icon: '🕐' },
                ],
                attribute_key: 'time_available',
                pos_x: 300,
                pos_y: 500,
              },
            },
          },
        },
        responses: {
          201: { description: 'Created node', content: { 'application/json': { schema: { $ref: '#/components/schemas/Node' } } } },
          400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } } },
        },
      },
    },

    '/api/admin/nodes/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      get: {
        tags: ['Nodes'],
        summary: 'Get node by ID',
        responses: {
          200: { description: 'Node', content: { 'application/json': { schema: { $ref: '#/components/schemas/Node' } } } },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Nodes'],
        summary: 'Update a node',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateNodeBody' } } },
        },
        responses: {
          200: { description: 'Updated node', content: { 'application/json': { schema: { $ref: '#/components/schemas/Node' } } } },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Nodes'],
        summary: 'Delete a node',
        description: 'Cascades: all outgoing/incoming edges are deleted automatically.',
        responses: {
          204: { description: 'Deleted' },
          404: { description: 'Not found' },
        },
      },
    },

    // ── EDGES ──────────────────────────────────────────────
    '/api/admin/edges': {
      get: {
        tags: ['Edges'],
        summary: 'List all edges',
        responses: {
          200: {
            description: 'Array of edges ordered by priority DESC',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Edge' } } } },
          },
        },
      },
      post: {
        tags: ['Edges'],
        summary: 'Create an edge',
        description: 'Set `conditions: null` for an unconditional (default) edge. Higher `priority` = evaluated first.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateEdgeBody' },
              example: {
                source_node_id: '00000000-0000-0000-0000-000000000003',
                target_node_id: '00000000-0000-0000-0000-000000000004',
                label: 'Weight loss at home',
                conditions: {
                  type: 'compound',
                  operator: 'AND',
                  conditions: [
                    { type: 'simple', attribute: 'goal',    op: 'eq', value: 'weight_loss' },
                    { type: 'simple', attribute: 'context', op: 'eq', value: 'home' },
                  ],
                },
                priority: 10,
              },
            },
          },
        },
        responses: {
          201: { description: 'Created edge', content: { 'application/json': { schema: { $ref: '#/components/schemas/Edge' } } } },
          400: { description: 'Validation error' },
        },
      },
    },

    '/api/admin/edges/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      put: {
        tags: ['Edges'],
        summary: 'Update an edge',
        description: 'Patch any combination of label, conditions, priority, source/target.',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateEdgeBody' } } },
        },
        responses: {
          200: { description: 'Updated edge', content: { 'application/json': { schema: { $ref: '#/components/schemas/Edge' } } } },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Edges'],
        summary: 'Delete an edge',
        responses: {
          204: { description: 'Deleted' },
          404: { description: 'Not found' },
        },
      },
    },

    // ── OFFERS ─────────────────────────────────────────────
    '/api/admin/offers': {
      get: {
        tags: ['Offers'],
        summary: 'List all offers',
        responses: {
          200: {
            description: 'Array of offers ordered by priority DESC',
            content: { 'application/json': { schema: { type: 'array', items: { $ref: '#/components/schemas/Offer' } } } },
          },
        },
      },
      post: {
        tags: ['Offers'],
        summary: 'Create an offer',
        description: 'Set `is_addon: true` to make this a supplemental offer (e.g. Stress Reset addon). `conditions` define when the offer is shown.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/CreateOfferBody' },
              example: {
                name: 'Quick Fit Micro-Workouts',
                slug: 'quick-fit-micro',
                description: '10–15 min daily micro-workouts',
                digital_plan: '30-day micro-workout challenge...',
                physical_kit: 'Slider discs, mini loop bands, shaker bottle',
                why_text: 'With only 10–15 minutes a day you can still achieve real results.',
                cta_text: 'Start My Quick Fit Plan',
                conditions: {
                  type: 'compound',
                  operator: 'AND',
                  conditions: [
                    { type: 'simple', attribute: 'goal',           op: 'eq',  value: 'weight_loss' },
                    { type: 'simple', attribute: 'context',        op: 'eq',  value: 'home' },
                    { type: 'simple', attribute: 'time_available', op: 'eq',  value: '10-15' },
                  ],
                },
                priority: 110,
                is_addon: false,
              },
            },
          },
        },
        responses: {
          201: { description: 'Created offer', content: { 'application/json': { schema: { $ref: '#/components/schemas/Offer' } } } },
          400: { description: 'Validation error' },
        },
      },
    },

    '/api/admin/offers/{id}': {
      parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' } }],
      get: {
        tags: ['Offers'],
        summary: 'Get offer by ID',
        responses: {
          200: { description: 'Offer', content: { 'application/json': { schema: { $ref: '#/components/schemas/Offer' } } } },
          404: { description: 'Not found' },
        },
      },
      put: {
        tags: ['Offers'],
        summary: 'Update an offer',
        requestBody: {
          required: true,
          content: { 'application/json': { schema: { $ref: '#/components/schemas/CreateOfferBody' } } },
        },
        responses: {
          200: { description: 'Updated offer', content: { 'application/json': { schema: { $ref: '#/components/schemas/Offer' } } } },
          404: { description: 'Not found' },
        },
      },
      delete: {
        tags: ['Offers'],
        summary: 'Delete an offer',
        responses: {
          204: { description: 'Deleted' },
          404: { description: 'Not found' },
        },
      },
    },

    // ── CONTENT DELIVERY ───────────────────────────────────
    '/api/content/graph': {
      get: {
        tags: ['Content'],
        summary: 'Get full content graph (read-only)',
        description:
          'Used by the user-facing client frontend to fetch the entire DAG config (nodes + edges + offers) on startup. The client renders and navigates the quiz based on this data plus the User BE for session state.',
        responses: {
          200: {
            description: 'Full content graph',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/ContentGraph' } } },
          },
          500: { description: 'Server error' },
        },
      },
    },
  },
};
