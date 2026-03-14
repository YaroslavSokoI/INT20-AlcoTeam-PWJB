export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'BetterMe — Full API (App + Admin)',
    version: '1.0.0',
    description:
      'Combined API documentation. Includes User-facing API (quiz sessions, answers, offers), Admin API (managing the graph), and Content Delivery API (reading the graph).',
  },
  servers: [
    { url: 'http://localhost:3002', description: 'App Backend (Local)' },
    { url: 'http://localhost:3001', description: 'Admin Backend (Local)' }
  ],
  tags: [
    { name: 'Sessions', description: 'Quiz session lifecycle and answer submission (App Backend)' },
    { name: 'Graph', description: 'Full DAG overview (Admin Backend)' },
    { name: 'Nodes', description: 'Question and Info page nodes (Admin Backend)' },
    { name: 'Edges', description: 'Directed edges with transition conditions (Admin Backend)' },
    { name: 'Offers', description: 'Personalized wellness offers (Admin Backend)' },
    { name: 'Content', description: 'Read-only delivery API for user frontend (Admin Backend)' },
  ],

  components: {
    schemas: {
      // ── SHARED / COMMON ──────────────────────────────────────
      NodeOption: {
        type: 'object',
        properties: {
          value: { type: 'string', example: 'weight_loss' },
          label: { type: 'string', example: 'Lose Weight' },
          icon: { type: 'string', example: '🔥' },
        },
      },
      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          detail: { type: 'string' },
        },
      },

      // ── ADMIN SCHEMAS (From Admin Backend) ───────────────────
      SimpleCondition: {
        type: 'object',
        required: ['type', 'attribute', 'op', 'value'],
        properties: {
          type: { type: 'string', enum: ['simple'] },
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
          type: { type: 'string', enum: ['compound'] },
          operator: { type: 'string', enum: ['AND', 'OR'] },
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
            { type: 'simple', attribute: 'goal', op: 'eq', value: 'weight_loss' },
            { type: 'simple', attribute: 'context', op: 'eq', value: 'home' },
          ],
        },
      },
      Node: {
        type: 'object',
        description: 'A quiz node — either a question to answer or an info page to display.',
        properties: {
          id: { type: 'string', format: 'uuid' },
          type: { type: 'string', enum: ['question', 'info'], example: 'question' },
          title: { type: 'string', example: 'What is your main wellness goal?' },
          description: { type: 'string', nullable: true, example: "We'll build a program tailored specifically to what you want to achieve." },
          question_type: {
            type: 'string',
            nullable: true,
            enum: ['single_choice', 'multi_choice', 'text_input', 'number_input'],
            description: 'Null for info nodes.',
          },
          options: {
            type: 'array',
            nullable: true,
            description: 'Answer options for single_choice / multi_choice nodes. Null for info and input nodes.',
            items: { $ref: '#/components/schemas/NodeOption' },
          },
          attribute_key: {
            type: 'string',
            nullable: true,
            example: 'goal',
            description: 'The user attribute key this answer maps to. Send this back in the answer body.',
          },
          is_start: { type: 'boolean' },
          pos_x: { type: 'number' },
          pos_y: { type: 'number' },
          created_at: { type: 'string', format: 'date-time' },
          updated_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateNodeBody: {
        type: 'object',
        required: ['type', 'title'],
        properties: {
          type: { type: 'string', enum: ['question', 'info'] },
          title: { type: 'string' },
          description: { type: 'string' },
          question_type: {
            type: 'string',
            enum: ['single_choice', 'multi_choice', 'text_input', 'number_input'],
          },
          options: {
            type: 'array',
            items: { $ref: '#/components/schemas/NodeOption' },
          },
          attribute_key: { type: 'string' },
          pos_x: { type: 'number' },
          pos_y: { type: 'number' },
          is_start: { type: 'boolean' },
        },
      },
      Edge: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          source_node_id: { type: 'string', format: 'uuid' },
          target_node_id: { type: 'string', format: 'uuid' },
          label: { type: 'string', nullable: true, example: 'Weight loss at home' },
          conditions: { $ref: '#/components/schemas/Condition', nullable: true },
          priority: { type: 'integer', example: 10 },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateEdgeBody: {
        type: 'object',
        required: ['source_node_id', 'target_node_id'],
        properties: {
          source_node_id: { type: 'string', format: 'uuid' },
          target_node_id: { type: 'string', format: 'uuid' },
          label: { type: 'string' },
          conditions: { $ref: '#/components/schemas/Condition', nullable: true },
          priority: { type: 'integer', default: 0 },
        },
      },
      Offer: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Quick Fit Micro-Workouts' },
          slug: { type: 'string', example: 'quick-fit-micro' },
          description: { type: 'string', nullable: true },
          digital_plan: { type: 'string', nullable: true },
          physical_kit: { type: 'string', nullable: true },
          why_text: { type: 'string', nullable: true },
          cta_text: { type: 'string', example: 'Start My Quick Fit Plan' },
          conditions: { $ref: '#/components/schemas/Condition', nullable: true },
          priority: { type: 'integer', example: 110 },
          is_addon: { type: 'boolean', example: false },
          created_at: { type: 'string', format: 'date-time' },
        },
      },
      CreateOfferBody: {
        type: 'object',
        required: ['name', 'slug'],
        properties: {
          name: { type: 'string' },
          slug: { type: 'string' },
          description: { type: 'string' },
          digital_plan: { type: 'string' },
          physical_kit: { type: 'string' },
          why_text: { type: 'string' },
          cta_text: { type: 'string', default: 'Start My Journey' },
          conditions: { $ref: '#/components/schemas/Condition', nullable: true },
          priority: { type: 'integer', default: 0 },
          is_addon: { type: 'boolean', default: false },
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
          nodes: { type: 'array', items: { $ref: '#/components/schemas/Node' } },
          edges: { type: 'array', items: { $ref: '#/components/schemas/Edge' } },
          offers: { type: 'array', items: { $ref: '#/components/schemas/Offer' } },
        },
      },

      // ── APP SCHEMAS (From App Backend) ───────────────────────
      Session: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          current_node_id: { type: 'string', format: 'uuid', nullable: true },
          attributes: {
            type: 'object',
            description: 'Accumulated user attributes from all previous answers.',
            additionalProperties: true,
            example: { goal: 'weight_loss', context: 'home', level: 'beginner' },
          },
          completed: { type: 'boolean' },
          created_at: { type: 'string', format: 'date-time' },
          completed_at: { type: 'string', format: 'date-time', nullable: true },
        },
      },
      CreateSessionResponse: {
        type: 'object',
        properties: {
          sessionId: { type: 'string', format: 'uuid', description: 'Store this in localStorage — sent with every subsequent request.' },
          currentNode: { $ref: '#/components/schemas/Node' },
        },
      },
      GetSessionResponse: {
        type: 'object',
        properties: {
          session: { $ref: '#/components/schemas/Session' },
          currentNode: { $ref: '#/components/schemas/Node', nullable: true },
        },
      },
      SubmitAnswerBody: {
        type: 'object',
        required: ['node_id', 'value'],
        properties: {
          node_id: {
            type: 'string',
            format: 'uuid',
            description: 'ID of the node being answered (from currentNode.id).',
          },
          attribute_key: {
            type: 'string',
            nullable: true,
            description: 'The attribute key from currentNode.attribute_key. Omit (or pass null) for info nodes.',
            example: 'goal',
          },
          value: {
            description: 'The answer value. For single_choice: a string. For multi_choice: array of strings. For number_input: number. For info nodes: pass "viewed".',
            oneOf: [
              { type: 'string' },
              { type: 'number' },
              { type: 'array', items: { type: 'string' } },
            ],
            example: 'weight_loss',
          },
        },
      },
      SubmitAnswerResponse: {
        type: 'object',
        properties: {
          completed: {
            type: 'boolean',
            description: 'True when there are no more nodes — quiz is finished. Call GET /offer next.',
          },
          nextNode: {
            $ref: '#/components/schemas/Node',
            nullable: true,
            description: 'The next node to render. Null when completed=true.',
          },
        },
      },
      OfferResponse: {
        type: 'object',
        properties: {
          primary: {
            type: 'array',
            items: { $ref: '#/components/schemas/Offer' },
            description: 'One or more primary offers matching the user profile.',
          },
          addon: {
            $ref: '#/components/schemas/Offer',
            nullable: true,
            description: 'Supplemental offer (e.g. Stress Reset) added when stress_level=high.',
          },
        },
        example: {
          primary: [{
            id: '10000000-0000-0000-0000-000000000007',
            name: 'Quick Fit Micro-Workouts',
            slug: 'quick-fit-micro',
            description: '10–15 min daily micro-workouts for busy people who want to lose weight at home',
            digital_plan: '30-day micro-workout challenge: science-backed HIIT circuits...',
            physical_kit: 'Micro-Workout Kit: slider discs, mini loop bands, shaker bottle',
            why_text: 'With only 10–15 minutes a day, you can still achieve real fat loss results.',
            cta_text: 'Start My Quick Fit Plan',
            is_addon: false,
            priority: 110,
          }],
          addon: {
            id: '10000000-0000-0000-0000-000000000016',
            name: 'Stress Reset Add-on',
            slug: 'stress-reset-addon',
            description: 'Stress management module to complement your main program',
            why_text: "We noticed you're dealing with high stress. We've added our Stress Reset module.",
            cta_text: 'Add Stress Relief Module',
            is_addon: true,
            priority: 50,
          },
        },
      },
    },
  },

  paths: {
    // ── APP BACKEND PATHS ────────────────────────────────────
    '/api/user/sessions': {
      post: {
        tags: ['Sessions'],
        summary: 'Start a new quiz session',
        description:
          'Creates a session and returns the first (start) node. The returned `sessionId` must be stored client-side and passed in the URL for all subsequent requests.',
        responses: {
          201: {
            description: 'Session created',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateSessionResponse' },
                example: {
                  sessionId: 'a1b2c3d4-0000-0000-0000-000000000000',
                  currentNode: {
                    id: '00000000-0000-0000-0000-000000000001',
                    type: 'question',
                    title: 'What is your main wellness goal?',
                    description: "We'll build a program tailored specifically to what you want to achieve.",
                    question_type: 'single_choice',
                    options: [
                      { value: 'weight_loss', label: 'Lose Weight', icon: '🔥' },
                      { value: 'strength', label: 'Build Strength', icon: '💪' },
                      { value: 'flexibility', label: 'Get Flexible', icon: '🧘' },
                      { value: 'stress_relief', label: 'Reduce Stress', icon: '🌿' },
                      { value: 'endurance', label: 'Boost Endurance', icon: '🏃' },
                    ],
                    attribute_key: 'goal',
                    is_start: true,
                  },
                },
              },
            },
          },
          500: { description: 'No start node configured or DB error' },
        },
      },
    },

    '/api/user/sessions/{id}': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Session ID' },
      ],
      get: {
        tags: ['Sessions'],
        summary: 'Get session state',
        description: 'Returns current session attributes and the current node. Use to resume a quiz after page reload.',
        responses: {
          200: {
            description: 'Session state',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/GetSessionResponse' } } },
          },
          404: { description: 'Session not found' },
        },
      },
    },

    '/api/user/sessions/{id}/answer': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Session ID' },
      ],
      post: {
        tags: ['Sessions'],
        summary: 'Submit an answer',
        description: `Submit the user's answer for the current node.\n\n**Backend processing:**\n1. Stores the answer in \`answers\` table\n2. Merges \`{attribute_key: value}\` into \`session.attributes\`\n3. Runs the rule engine on all outgoing edges from this node\n4. Returns the next node (branched based on accumulated attributes) or \`completed: true\`\n\n**For info nodes:** pass \`value: "viewed"\` and omit \`attribute_key\` — the backend simply advances to the next node.\n\n**Branching example:** after answering \`goal=weight_loss\` and \`context=home\`, the backend will route to the "time per day" node instead of the "injuries" node.`,
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: { $ref: '#/components/schemas/SubmitAnswerBody' },
              examples: {
                single_choice: {
                  summary: 'Single choice answer',
                  value: { node_id: '00000000-0000-0000-0000-000000000001', attribute_key: 'goal', value: 'weight_loss' },
                },
                multi_choice: {
                  summary: 'Multi choice answer',
                  value: { node_id: '00000000-0000-0000-0000-000000000099', attribute_key: 'barriers', value: ['no_time', 'fatigue'] },
                },
                info_node: {
                  summary: 'Info node (no attribute)',
                  value: { node_id: '00000000-0000-0000-0000-000000000010', value: 'viewed' },
                },
              },
            },
          },
        },
        responses: {
          200: {
            description: 'Next node or completion signal',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/SubmitAnswerResponse' },
                examples: {
                  next_node: {
                    summary: 'Quiz continues',
                    value: {
                      completed: false,
                      nextNode: {
                        id: '00000000-0000-0000-0000-000000000002',
                        type: 'question',
                        title: 'Where do you prefer to work out?',
                        question_type: 'single_choice',
                        options: [
                          { value: 'home', label: 'At Home', icon: '🏠' },
                          { value: 'gym', label: 'At the Gym', icon: '🏋️' },
                          { value: 'outdoor', label: 'Outdoors', icon: '🌳' },
                        ],
                        attribute_key: 'context',
                      },
                    },
                  },
                  completed: {
                    summary: 'Quiz completed',
                    value: { completed: true, nextNode: null },
                  },
                },
              },
            },
          },
          400: {
            description: 'Missing fields or session already completed',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          404: { description: 'Session not found' },
          500: { description: 'Server error' },
        },
      },
    },

    '/api/user/sessions/{id}/back': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Session ID' },
      ],
      post: {
        tags: ['Sessions'],
        summary: 'Go back to previous node',
        description: `Reverts the session state to the previous node by deleting the most recent answer and re-evaluating session attributes to match the state before that answer.`,
        responses: {
          200: {
            description: 'Previous node',
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: { currentNode: { $ref: '#/components/schemas/Node', nullable: true } }
                }
              }
            }
          },
          400: { description: 'Already at the beginning, cannot go back' },
          404: { description: 'Session not found' },
          500: { description: 'Server error' }
        }
      }
    },

    '/api/user/sessions/{id}/offer': {
      parameters: [
        { name: 'id', in: 'path', required: true, schema: { type: 'string', format: 'uuid' }, description: 'Session ID' },
      ],
      get: {
        tags: ['Sessions'],
        summary: 'Get personalized offer',
        description: `Available only after the quiz is completed (\`completed: true\`).\n\n**Offer resolution logic:**\n- Loads all offers ordered by \`priority DESC\`\n- Evaluates each offer's \`conditions\` against the session's accumulated \`attributes\`\n- **Primary offers** (\`is_addon=false\`): all matching offers returned (usually 1)\n- **Addon offer** (\`is_addon=true\`): first matching supplemental offer (e.g. Stress Reset when \`stress_level=high\`)`,
        responses: {
          200: {
            description: 'Personalized offer result',
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/OfferResponse' },
              },
            },
          },
          400: {
            description: 'Session not yet completed',
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Error' } } },
          },
          404: { description: 'Session not found' },
        },
      },
    },


    // ── ADMIN BACKEND PATHS ──────────────────────────────────
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
                    { type: 'simple', attribute: 'goal', op: 'eq', value: 'weight_loss' },
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
                    { type: 'simple', attribute: 'goal', op: 'eq', value: 'weight_loss' },
                    { type: 'simple', attribute: 'context', op: 'eq', value: 'home' },
                    { type: 'simple', attribute: 'time_available', op: 'eq', value: '10-15' },
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
