import { Router } from 'express';

const isDev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 5173;

export const apiRouter = Router();

// Get asset URL for module federation
apiRouter.get('/get-asset-url/*', (req, res) => {
  const baseUrl = isDev
    ? `http://localhost:${port}`
    : process.env.BASE_URL || `http://localhost:${port}`;

  const response = {
    assetUrl: `${baseUrl}/static/remoteEntry.js`,
    baseUrl: `${baseUrl}/static`,
  } as const;

  return res.json(response);
});

// General API endpoint
apiRouter.get('/api', (req, res) => {
  res.json({
    charmName: 'Testing Charm',
  });
});
