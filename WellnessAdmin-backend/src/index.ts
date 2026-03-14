import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger.js';

import nodesRouter from './routes/nodes.routes.js';
import edgesRouter from './routes/edges.routes.js';
import offersRouter from './routes/offers.routes.js';
import contentRouter from './routes/content.routes.js';

const app = express();
const PORT = process.env.PORT ?? 3001;

app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'BetterMe Admin API',
  swaggerOptions: { persistAuthorization: true },
}));

// Admin API
app.use('/api/admin/nodes', nodesRouter);
app.use('/api/admin/edges', edgesRouter);
app.use('/api/admin/offers', offersRouter);

// Admin graph convenience endpoint
app.get('/api/admin/graph', async (_req, res) => {
  try {
    const { getFullGraph } = await import('./services/graph.service.js');
    const graph = await getFullGraph();
    res.json(graph);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch graph', detail: String(err) });
  }
});

// Content delivery API (read-only, for user-facing app)
app.use('/api/content', contentRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'admin-backend' });
});

app.listen(PORT, () => {
  console.log(`Admin backend running on port ${PORT}`);
});

export default app;
