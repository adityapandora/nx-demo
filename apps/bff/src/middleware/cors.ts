import type { RequestHandler } from 'express';

export const corsMiddleware: RequestHandler = (req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader(
    'Access-Control-Allow-Methods',
    'GET, POST, PUT, DELETE, PATCH, OPTIONS'
  );
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-Requested-With, content-type, Authorization'
  );

  if (req.method === 'OPTIONS') {
    return res.status(200).json({});
  }
  next();
};
