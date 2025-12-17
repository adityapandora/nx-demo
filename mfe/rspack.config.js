const { NxAppRspackPlugin } = require('@nx/rspack/app-plugin');
const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/rspack');
const { NxReactRspackPlugin } = require('@nx/rspack/react-plugin');
const { join } = require('node:path');

module.exports = {
  output: {
    path: join(__dirname, '../dist/mfe'),
    publicPath: 'auto',
    uniqueName: 'braceletEditor',
    clean: true,
  },
  optimization: {
    moduleIds: 'deterministic',
    runtimeChunk: false,
    splitChunks: false,
  },
  devServer: {
    port: 5173,
    host: 'localhost',
    open: true,
    liveReload: true,
    historyApiFallback: {
      index: '/index.html',
      disableDotRule: true,
      htmlAcceptHeaders: ['text/html', 'application/xhtml+xml'],
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers':
        'X-Requested-With, content-type, Authorization',
    },
    proxy: [
      {
        context: ['/api'],
        target: 'http://localhost:3000',
        changeOrigin: true,
        logLevel: 'debug',
        onProxyReq: (proxyReq, req, res) => {
          console.log(
            `[BFF PROXY] ${req.method} ${req.url} -> http://localhost:3000${req.url}`
          );
        },
        onProxyRes: (proxyRes, req, res) => {
          console.log(
            `[BFF PROXY] Response: ${proxyRes.statusCode} ${req.url}`
          );
        },
        onError: (err, req, res) => {
          console.error('[BFF PROXY] Error:', err.message);
        },
      },
    ],
  },

  plugins: [
    new NxAppRspackPlugin({
      tsConfig: './tsconfig.app.json',
      main: './src/main.tsx',
      index: './src/index.html',
      baseHref: '/',
      styles: ['./src/styles.css'],
      outputHashing: process.env['NODE_ENV'] === 'production' ? 'all' : 'none',
      optimization: process.env['NODE_ENV'] === 'production',
    }),
    new NxReactRspackPlugin({}),
    new ModuleFederationPlugin({
      name: 'braceletEditor',
      filename: 'static/remoteEntry.js',
      library: { type: 'window', name: 'braceletEditor' },
      exposes: {
        './BraceletEditor': './src/BraceletEditor.tsx',
      },
      shared: {
        react: {
          singleton: true,
          eager: true,
          requiredVersion: '^18.3.1',
        },
        'react-dom': {
          singleton: true,
          eager: true,
          requiredVersion: '^18.3.1',
        },
      },
    }),
  ],
};
