import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import multer from "multer";

import { authenticate } from "./middleware/auth";
import { notFound } from "./middleware/notFound";
import { errorHandler } from "./middleware/errorHandler";
import routes from "./routes/index";
import { env } from "./config/env";

const security = helmet();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: env.uploadMaxMb * 1024 * 1024,
    files: 5,
  },
});

export const createApp = async () => {
  const app = express();
  app.use(security);
  app.use(cors());
  app.use(morgan("dev"));
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ extended: true }));

  app.use(authenticate);

  app.get("/health", (_req, res) => {
    res.status(200).json({ status: "ok" });
  });

  app.use("/api", routes);

  app.post("/api/files", upload.single("file"), async (req, res, next) => {
    const { uploadFile } = await import("./controllers/file.controller");
    const handlers = uploadFile as unknown as any[];
    handlers[1](req, res, next);
  });

  app.use(notFound);

  app.use(errorHandler);

  return app;
};