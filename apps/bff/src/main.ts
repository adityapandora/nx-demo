import express from 'express';
import { corsMiddleware } from './middleware/cors';
import { setupMfe } from './middleware/mfe';
import { apiRouter } from './routes/api';

const app = express();
const isDev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 5173;
const workspaceRoot = process.cwd();
const DEFAULT_SITE_ID = 'it-IT';

// Middleware
app.use(express.json());
app.use(corsMiddleware);

// API Routes
app.use(apiRouter);

// Redirect root to default siteId
app.get('/', (_req, res) => {
  res.redirect(`/${DEFAULT_SITE_ID}`);
});

// Start Server
async function startServer() {
  await setupMfe(app, workspaceRoot);

  // 404 handler - must be last
  app.use((_req, res) => {
    res.status(404).json({ error: 'Not Found' });
  });

  app.listen(port, () => {
    const mode = isDev ? 'development' : 'production';
    console.log(`Server running on http://localhost:${port} [${mode}]`);
    console.log(`  API:       http://localhost:${port}/api`);
    console.log(`  Asset URL: http://localhost:${port}/get-asset-url`);
    console.log(`  Frontend:  http://localhost:${port}/${DEFAULT_SITE_ID}`);
  });
}

startServer().catch(console.error);
