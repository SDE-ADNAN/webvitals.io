import express from "express";
import cors from "cors";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import { env } from "./config/env";
import { swaggerSpec } from "./config/swagger";
import {
  connectDatabase,
  disconnectDatabase,
} from "./lib/prisma";
import authRoutes from "./routes/authRoutes";
import siteRoutes from "./routes/siteRoutes";
import metricRoutes from "./routes/metricRoutes";
import alertRoutes from "./routes/alertRoutes";
import healthRoutes from "./routes/healthRoutes";
import { errorHandler } from "./middleware/errorHandler";

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
const windowMs = 15 * 60 * 1000; // 15 minutes
const limiter = rateLimit({
  windowMs,
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: "RateLimitError",
    message: "Too many requests from this IP, please try again later."
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  // Include Retry-After header when rate limit exceeded
  handler: (req, res) => {
    const retryAfter = Math.ceil(windowMs / 1000); // Convert to seconds
    res.set('Retry-After', retryAfter.toString());
    res.status(429).json({
      error: "RateLimitError",
      message: "Too many requests from this IP, please try again later."
    });
  },
  // Exclude health check from rate limiting
  skip: (req) => req.url === "/api/health",
});

// Apply rate limiting to all routes
app.use(limiter);

// API Documentation
app.use("/api/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customCss: '.swagger-ui .topbar { display: none }',
  customSiteTitle: "WebVitals.io API Documentation",
}));

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/sites", siteRoutes);
app.use("/api/metrics", metricRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/health", healthRoutes);

// Global error handler (must be last middleware)
app.use(errorHandler);

// Graceful shutdown handler
const gracefulShutdown = async (signal: string) => {
  console.log(`\n${signal} received. Starting graceful shutdown...`);
  
  try {
    // Close database connections
    await disconnectDatabase();
    console.log("✅ Graceful shutdown completed successfully");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error during graceful shutdown:", error);
    process.exit(1);
  }
};

// Register shutdown handlers
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
process.on("SIGINT", () => gracefulShutdown("SIGINT"));

// Handle uncaught exceptions
process.on("uncaughtException", (error) => {
  console.error("❌ Uncaught Exception:", error);
  gracefulShutdown("UNCAUGHT_EXCEPTION");
});

// Handle unhandled promise rejections
process.on("unhandledRejection", (reason, promise) => {
  console.error("❌ Unhandled Rejection at:", promise, "reason:", reason);
  gracefulShutdown("UNHANDLED_REJECTION");
});

// Start server with database connection
async function startServer() {
  try {
    // Connect to database
    await connectDatabase();

    // Start Express server
    app.listen(env.PORT, () => {
      console.log(`🚀 API server listening on port ${env.PORT}`);
      console.log(`📝 Environment: ${env.NODE_ENV}`);
      console.log(`🌐 CORS enabled for: ${env.FRONTEND_URL}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

startServer();
