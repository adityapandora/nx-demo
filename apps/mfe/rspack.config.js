const {
  ModuleFederationPlugin,
} = require('@module-federation/enhanced/rspack');
const {
  CssExtractRspackPlugin,
  DefinePlugin,
  HtmlRspackPlugin,
} = require('@rspack/core');
const { join } = require('node:path');

const isDev = process.env.NODE_ENV !== 'production';
const port = process.env.PORT || 5173;

/** @type {import('@rspack/core').Configuration} */
module.exports = {
  mode: isDev ? 'development' : 'production',
  context: __dirname,
  entry: './src/main.tsx',
  output: {
    path: join(__dirname, '../../dist/mfe'),
    filename: '[name].js',
    publicPath: 'auto',
    uniqueName: 'braceletEditor',
    clean: true,
  },
  resolve: {
    extensions: ['.tsx', '.ts', '.js'],
    tsConfig: { configFile: join(__dirname, 'tsconfig.app.json') },
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        loader: 'builtin:swc-loader',
        options: {
          jsc: {
            parser: { syntax: 'typescript', tsx: true },
            transform: { react: { runtime: 'automatic' } },
          },
        },
      },
      {
        test: /\.css$/,
        type: 'javascript/auto',
        use: [CssExtractRspackPlugin.loader, 'css-loader', 'postcss-loader'],
      },
      {
        test: /\.(png|jpe?g|gif|svg|ico)$/,
        type: 'asset/resource',
      },
    ],
  },
  plugins: [
    new DefinePlugin({
      __MFE_BASE_URL__: JSON.stringify(
        process.env.MFE_BASE_URL || `http://localhost:${port}`
      ),
    }),
    new HtmlRspackPlugin({ template: './src/index.html' }),
    new CssExtractRspackPlugin({ filename: '[name].css' }),
    new ModuleFederationPlugin({
      name: 'braceletEditor',
      filename: 'static/remoteEntry.js',
      library: { type: 'window', name: 'braceletEditor' },
      exposes: { './BraceletEditor': './src/BraceletEditor.tsx' },
      shared: {
        react: { singleton: true, eager: true, requiredVersion: '^18.3.1' },
        'react-dom': {
          singleton: true,
          eager: true,
          requiredVersion: '^18.3.1',
        },
      },
      dts: false,
    }),
  ],
  devtool: isDev ? 'eval-source-map' : false,
};
