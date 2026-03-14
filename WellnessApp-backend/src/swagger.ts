export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'BetterMe — Client Backend API',
    version: '1.0.0',
    description:
      'User-facing API: creates quiz sessions, processes answers step-by-step using the rule engine, and resolves personalized wellness offers upon quiz completion.',
  },
  servers: [{ url: 'http://localhost:3002', description: 'Local' }],
  tags: [
    { name: 'Sessions', description: 'Quiz session lifecycle and answer submission' },
  ],

  components: {
    schemas: {
      NodeOption: {
        type: 'object',
        properties: {
          value: { type: 'string', example: 'weight_loss' },
          label: { type: 'string', example: 'Lose Weight' },
          icon: { type: 'string', example: '🔥' },
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
        },
      },

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

      Offer: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string', example: 'Quick Fit Micro-Workouts' },
          slug: { type: 'string', example: 'quick-fit-micro' },
          description: { type: 'string', nullable: true },
          digital_plan: { type: 'string', nullable: true },
          physical_kit: { type: 'string', nullable: true },
          why_text: { type: 'string', nullable: true, description: 'Personalized explanation of why this offer matches the user.' },
          cta_text: { type: 'string', example: 'Start My Quick Fit Plan' },
          is_addon: { type: 'boolean' },
          priority: { type: 'integer' },
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

      Error: {
        type: 'object',
        properties: {
          error: { type: 'string' },
          detail: { type: 'string' },
        },
      },
    },
  },

  paths: {
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
        description: `Submit the user's answer for the current node.

**Backend processing:**
1. Stores the answer in \`answers\` table
2. Merges \`{attribute_key: value}\` into \`session.attributes\`
3. Runs the rule engine on all outgoing edges from this node
4. Returns the next node (branched based on accumulated attributes) or \`completed: true\`

**For info nodes:** pass \`value: "viewed"\` and omit \`attribute_key\` — the backend simply advances to the next node.

**Branching example:** after answering \`goal=weight_loss\` and \`context=home\`, the backend will route to the "time per day" node instead of the "injuries" node.`,
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
        description: `Available only after the quiz is completed (\`completed: true\`).

**Offer resolution logic:**
- Loads all offers ordered by \`priority DESC\`
- Evaluates each offer's \`conditions\` against the session's accumulated \`attributes\`
- **Primary offers** (\`is_addon=false\`): all matching offers returned (usually 1)
- **Addon offer** (\`is_addon=true\`): first matching supplemental offer (e.g. Stress Reset when \`stress_level=high\`)`,
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
  },
};
