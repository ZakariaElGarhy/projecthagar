import app from "./app";
import { logger } from "./lib/logger";
import { ensureAdminUser } from "./lib/auth";
import { seedPosts } from "./lib/seed";

// Run one-time setup (admin user + seed data) on both local and serverless cold starts.
const setupPromise = Promise.all([ensureAdminUser(), seedPosts()]).catch((err: unknown) => {
  logger.error({ err }, "Failed to initialize database");
});

// On Vercel, we never call app.listen() — Vercel's Node runtime invokes
// the exported handler directly per-request. Locally (and on Railway/Render/etc),
// process.env.VERCEL is not set, so we start a normal persistent server.
if (!process.env["VERCEL"]) {
  const rawPort = process.env["PORT"];

  if (!rawPort) {
    throw new Error(
      "PORT environment variable is required but was not provided.",
    );
  }

  const port = Number(rawPort);

  if (Number.isNaN(port) || port <= 0) {
    throw new Error(`Invalid PORT value: "${rawPort}"`);
  }

  setupPromise.then(() => {
    app.listen(port, (err) => {
      if (err) {
        logger.error({ err }, "Error listening on port");
        process.exit(1);
      }

      logger.info({ port }, "Server listening");
    });
  });
}

export default app;