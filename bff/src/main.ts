import express from 'express';

const app = express();
app.use(express.json());

// ---- CORS ----
app.use((req, res, next) => {
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
});

app.use('/api/get-asset-url', (req, res) => {
  const response = {
    assetUrl: `http://localhost:5173/static/remoteEntry.js`,
    baseUrl: `http://localhost:5173/static`,
  } as const;
  return res.json(response);
});

app.use('/api', (req, res, next) => {
  res.json({
    charmName: 'Testing Charm',
  });
  next();
});

// ---- Start server ----
const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`✅ BFF running on http://localhost:${port}`);
});
