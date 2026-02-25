import { createApp } from "./app";
import { env } from "./config/env";

const start = async () => {
  const app = await createApp();
  app.listen(env.port, () => {
    console.log(`API listening on :${env.port}`);
  });
};

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
