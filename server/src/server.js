import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';
import { router as restRouter } from './routes/rest.js';
import { graphqlHTTP } from 'express-graphql';
import { schema, rootValue } from './graphql/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function createApp() {
  const app = express();

  // Logging, body parsing
  app.use(morgan('dev'));
  app.use(express.json());

  // CORS
  const allowed = (process.env.ALLOWED_ORIGINS || '')
    .split(',')
    .map(s => s.trim())
    .filter(Boolean);
  app.use(
    cors({
      origin: (origin, cb) => {
        if (!origin) return cb(null, true); // allow curl/local
        if (allowed.length === 0 || allowed.includes(origin)) return cb(null, true);
        return cb(new Error('Not allowed by CORS'));
      },
      credentials: true,
    })
  );

  // Health check
  app.get('/health', (_req, res) => res.json({ ok: true }));

  // REST API
  app.use('/api', restRouter);

  // GraphQL (optional, for extra points)
  app.use(
    '/graphql',
    graphqlHTTP({
      schema,
      rootValue,
      graphiql: process.env.NODE_ENV !== 'production',
    })
  );

  // Serve client as static (optional convenience)
  const clientDir = path.resolve(__dirname, '../../client');
  app.use(express.static(clientDir));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/graphql')) return next();
    res.sendFile(path.join(clientDir, 'index.html'));
  });

  return app;
}

