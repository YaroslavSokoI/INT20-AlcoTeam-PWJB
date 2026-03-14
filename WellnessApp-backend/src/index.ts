import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './swagger.js';

import userRouter from './routes/user.routes.js';

const app = express();
const PORT = process.env.PORT ?? 3002;

app.use(cors());
app.use(express.json());

// Swagger UI
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument, {
  customSiteTitle: 'BetterMe Client API',
  swaggerOptions: { persistAuthorization: true },
}));

app.use('/api/user', userRouter);

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'client-backend' });
});

app.listen(PORT, () => {
  console.log(`Client backend running on port ${PORT}`);
});

export default app;
