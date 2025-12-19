import type { Express, Response } from 'express';
import express from 'express';
import fs from 'fs';
import path from 'path';

/** Matches exact locale pattern like /en-IE, /it-IT (no nested paths) */
const isLocaleRoute = (url: string) => /^\/[a-z]{2}-[A-Z]{2}\/?$/.test(url);

/** Script injected into HTML for automatic browser reload on rebuild */
const LIVE_RELOAD_SCRIPT = `<script>new EventSource('/__livereload').onmessage=()=>location.reload();console.log('[LiveReload] connected')</script></body>`;

type RspackCompiler = ReturnType<typeof import('@rspack/core').rspack>;
type HtmlReader = (callback: (err: Error | null, content: Buffer) => void) => void;

/**
 * Creates SSE endpoint that broadcasts reload signals when rspack finishes compiling
 * @param app - Express application instance
 * @param compiler - Rspack compiler instance with hooks
 */
function setupLiveReload(app: Express, compiler: RspackCompiler) {
  const clients = new Set<Response>();

  compiler.hooks.done.tap('LiveReload', () =>
    clients.forEach((client) => client.write('data: reload\n\n'))
  );

  app.get('/__livereload', (req, res) => {
    res
      .set({ 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' })
      .flushHeaders();
    clients.add(res);
    req.on('close', () => clients.delete(res));
  });
}

/**
 * Registers route handler for locale URLs (e.g., /en-IE) serving MFE index.html
 * @param app - Express application instance
 * @param readHtml - Function to read index.html from filesystem (in-memory or disk)
 * @param injectLiveReload - Whether to inject live reload script (dev only)
 */
function setupLocaleRoutes(app: Express, readHtml: HtmlReader, injectLiveReload: boolean) {
  app.get('/:siteId(*)', (req, res, next) => {
    if (!isLocaleRoute(req.originalUrl)) return next();
    readHtml((err, content) => {
      if (err) return next(err);
      const html = injectLiveReload
        ? content.toString().replace('</body>', LIVE_RELOAD_SCRIPT)
        : content.toString();
      res.type('html').send(html);
    });
  });
}

/**
 * Configures MFE serving for the Express application.
 *
 * @description
 * **Development mode:**
 * - Compiles MFE on-the-fly using webpack-dev-middleware with rspack
 * - Serves assets from in-memory filesystem for fast rebuilds
 * - Enables SSE-based live reload for automatic browser refresh
 *
 * **Production mode:**
 * - Serves pre-built static files from dist/mfe directory
 *
 * @param app - Express application instance
 * @param workspaceRoot - Absolute path to the monorepo root
 */
export async function setupMfe(app: Express, workspaceRoot: string) {
  const isDev = process.env.NODE_ENV !== 'production';
  const mfePath = path.resolve(workspaceRoot, isDev ? 'apps/mfe' : 'dist/mfe');

  if (isDev) {
    const { rspack } = await import('@rspack/core');
    const webpackDevMiddleware = (await import('webpack-dev-middleware')).default;
    const config = require(path.resolve(mfePath, 'rspack.config.js'));
    const compiler = rspack(config);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const devMiddleware = webpackDevMiddleware(compiler as any, { writeToDisk: false });

    setupLiveReload(app, compiler);
    app.use(devMiddleware);
    setupLocaleRoutes(
      app,
      (cb) => devMiddleware.context.outputFileSystem.readFile(path.join(config.output.path, 'index.html'), cb),
      true
    );
  } else {
    app.use(express.static(mfePath));
    setupLocaleRoutes(app, (cb) => fs.readFile(path.join(mfePath, 'index.html'), cb), false);
  }
}
