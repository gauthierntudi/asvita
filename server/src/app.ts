import cors from 'cors';
import express from 'express';
import { env } from './config/env.js';
import { errorHandler } from './middleware/errorHandler.js';
import { prisma } from './lib/prisma.js';
import cardsRouter from './routes/cards.js';
import paymentsRouter from './routes/payments.js';
import supportersRouter from './routes/supporters.js';
import webhooksRouter from './routes/webhooks.js';
import smsTestRouter from './routes/sms-test.js';

const app = express();

app.use(cors({ origin: env.webUrl }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/api/health', async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ ok: true, service: 'asvita-api' });
  } catch {
    res.status(503).json({ ok: false, service: 'asvita-api', database: 'unavailable' });
  }
});

app.use('/api/supporters', supportersRouter);
app.use('/api/cards', cardsRouter);
app.use('/api/payments', paymentsRouter);
app.use('/api/webhooks', webhooksRouter);

if (env.smsTest.enabled) {
  app.use('/api/sms-test', smsTestRouter);
}

app.use(errorHandler);

export default app;
