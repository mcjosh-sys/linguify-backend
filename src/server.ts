import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import fs from "fs";
import helmet from "helmet";
import morgan from "morgan";
import onFinished from "on-finished";
import path from "path";
import { fileURLToPath } from "url";
import logger from "./lib/uitls/logger";
import router from "./routes";

dotenv.config();

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const logStream = fs.createWriteStream(
  path.join(__dirname, "..", "access.log"),
  { flags: "a" }
);

const app = express();

app.use((req, res, next) => {
  if (req.headers["stripe-signature"] || req.headers["svix-signature"]) {
    logger.info(
      `Webhook received: ${
        req.headers["stripe-signature"] || req.headers["svix-signature"]
      }`
    );
    express.raw({ type: "application/json", limit: "30mb" })(req, res, next);
  } else {
    express.json({ limit: "30mb" })(req, res, next);
  }
});
app.use(express.urlencoded({ limit: "30mb", extended: true }));
app.use(
  cors({
    origin: process.env.ALLOWED_ORIGIN?.split(",") || [],
  })
);
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use((req, _res, next) => {
  req.time = new Date();
  next();
});
app.use(morgan("combined", { stream: logStream }));

app.get("/", (req, res, next) => {
  console.log("working"), res.json("working...");
  next();
});

app.use("/api", router);

app.use((req, res, next) => {
  onFinished(res, () => {
    logger.info(
      {
        req: {
          method: req.method,
          url: req.url,
          headers: {
            host: req.headers.host,
            "user-agent": req.headers["user-agent"],
          },
          remoteAddress: req.ip,
        },
        res: {
          statusCode: res.statusCode,
          header: res.header,
          responseTime: new Date().toLocaleString(),
        },
        requestTime: req.time.toLocaleString(),
        latency: `${new Date().getTime() - req.time.getTime()} ms`,
      },
      `${req.ip} - - [${req.time.toLocaleString()}] "${req.method} ${
        req.headers["user-agent"]
      }"`
    );
  });

  next();
});

const PORT = parseInt(process.env.PORT!) || 3400;
const server = app.listen(PORT, "0.0.0.0", () =>
  logger.info(`[APP] server is running on port: ${PORT} 🚀...`)
);

// Handle unhandled rejections and exceptions
process.on("unhandledRejection", (reason, promise) => {
  logger.error(`Unhandled Rejection at: ${promise}, reason: ${reason}`);
});
process.on("uncaughtException", (error) => {
  logger.error(`Uncaught Exception: ${error.message}`);
  process.exit(1); // Exit with failure code
});

// Graceful shutdown on SIGTERM signal
process.on("SIGTERM", () => {
  logger.info("SIGTERM received. Shutting down gracefully.");
  server.close(() => {
    logger.info("Closed out remaining connections.");
    process.exit(0);
  });
});
