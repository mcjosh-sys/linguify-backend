import cors from "cors";
import dotenv from "dotenv";
import express from "express";

import fs from "fs";
import helmet from "helmet";
import morgan from "morgan";
import onFinished from "on-finished";
import path from "path";
import { uptime } from "process";
import { fileURLToPath } from "url";
import { formatSecondsToHHMMSS } from "./lib/utils";
import logger from "./lib/utils/logger";
import { errorHandler } from "./middleware/error-handler";
import router from "./routes";

dotenv.config();

// @ts-ignore
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const startTime = new Date();
let totalRequests = 0;
let totalResponseTime = 0;

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
    origin: process.env.ALLOWED_ORIGINS?.split(",") || [],
  })
);
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("combined", { stream: logStream }));
app.use((req, _res, next) => {
  req.time = new Date();
  totalRequests++;
  next();
});
app.use((req, res, next) => {
  onFinished(res, () => {
    const responseTime = new Date().getTime() - req.time.getTime();
    // let upTime = new Date().getTime() - startTime.getTime()
    totalResponseTime += responseTime;
    logger.info(
      {
        req: {
          method: req.method,
          url: req.originalUrl || req.url,
          headers: {
            host: req.headers.host,
            userAgent: req.headers["user-agent"],
          },
          remoteAddress: req.ip,
        },
        res: {
          statusCode: res.statusCode,
        },
        requestTime: req.time.toLocaleString(),
        responseTime: new Date().toLocaleString(),
        latency: `${new Date().getTime() - req.time.getTime()} ms`,
        totalRequests,
        averageResponseTime: `${Math.ceil(
          totalResponseTime / totalRequests
        )} ms`,
        upTime: formatSecondsToHHMMSS(uptime()),
      },
      `${req.ip} - - [${req.time.toLocaleString()}] "${req.method} ${
        req.headers["user-agent"]
      }"`
    );
  });
  next();
});

// app.get("/", (req, res, next) => {
//   console.log("working");
//   res.json("working...");
//   next();
// });

app.use("/api", router);

app.use(errorHandler);



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
