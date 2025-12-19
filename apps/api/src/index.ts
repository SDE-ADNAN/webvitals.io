import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import { env } from "./config/env";

const app = express();

// Configure CORS for frontend origin
app.use(
  cors({
    origin: env.FRONTEND_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Site-ID"],
  })
);

// Body parser middleware
app.use(express.json());

// HTTP request logging with Morgan
// Use 'dev' format for development, 'combined' format for production
const morganFormat = env.NODE_ENV === "production" ? "combined" : "dev";
app.use(
  morgan(morganFormat, {
    // Exclude health check endpoint from logs to reduce noise
    skip: (req) => req.url === "/api/health",
  })
);

// Rate limiting: 100 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Exclude health check from rate limiting
  skip: (req) => req.url === "/api/health",
});

// Apply rate limiting to all routes
app.use(limiter);

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "ok",
    message: "API server is running",
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

// Start server
app.listen(env.PORT, () => {
  console.log(`🚀 API server listening on port ${env.PORT}`);
  console.log(`📝 Environment: ${env.NODE_ENV}`);
  console.log(`🌐 CORS enabled for: ${env.FRONTEND_URL}`);
});
