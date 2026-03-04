import swaggerJsdoc from "swagger-jsdoc";
import { env } from "./env";

const options: swaggerJsdoc.Options = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "WebVitals.io API",
      version: "1.0.0",
      description:
        "Backend API for WebVitals.io - A platform for monitoring and analyzing Core Web Vitals metrics",
      contact: {
        name: "WebVitals.io Team",
        url: "https://webvitals.io",
      },
      license: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: `http://localhost:${env.PORT}`,
        description: "Development server",
      },
      {
        url: "https://api.webvitals.io",
        description: "Production server",
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description: "JWT token obtained from /api/auth/login or /api/auth/register",
        },
        siteIdHeader: {
          type: "apiKey",
          in: "header",
          name: "X-Site-ID",
          description: "Site ID for metric submission (used by tracking SDK)",
        },
      },
      schemas: {
        User: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "User unique identifier",
            },
            email: {
              type: "string",
              format: "email",
              description: "User email address",
            },
            name: {
              type: "string",
              nullable: true,
              description: "User full name",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "User creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "User last update timestamp",
            },
          },
        },
        Site: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Site database ID",
            },
            siteId: {
              type: "string",
              description: "Unique site identifier for tracking SDK",
            },
            name: {
              type: "string",
              minLength: 3,
              maxLength: 50,
              description: "Site name",
            },
            url: {
              type: "string",
              format: "uri",
              description: "Site URL",
            },
            domain: {
              type: "string",
              description: "Extracted domain from URL",
            },
            isActive: {
              type: "boolean",
              description: "Whether the site is actively monitored",
            },
            userId: {
              type: "string",
              format: "uuid",
              description: "Owner user ID",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Site creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Site last update timestamp",
            },
          },
        },
        Metric: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Metric unique identifier",
            },
            siteId: {
              type: "string",
              description: "Associated site ID",
            },
            lcp: {
              type: "number",
              description: "Largest Contentful Paint in milliseconds",
            },
            fid: {
              type: "number",
              description: "First Input Delay in milliseconds",
            },
            cls: {
              type: "number",
              description: "Cumulative Layout Shift score",
            },
            ttfb: {
              type: "number",
              nullable: true,
              description: "Time to First Byte in milliseconds",
            },
            fcp: {
              type: "number",
              nullable: true,
              description: "First Contentful Paint in milliseconds",
            },
            tti: {
              type: "number",
              nullable: true,
              description: "Time to Interactive in milliseconds",
            },
            deviceType: {
              type: "string",
              enum: ["desktop", "mobile", "tablet"],
              description: "Device type",
            },
            browserName: {
              type: "string",
              description: "Browser name",
            },
            osName: {
              type: "string",
              nullable: true,
              description: "Operating system name",
            },
            timestamp: {
              type: "string",
              format: "date-time",
              description: "Metric collection timestamp",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Database creation timestamp",
            },
          },
        },
        Alert: {
          type: "object",
          properties: {
            id: {
              type: "string",
              format: "uuid",
              description: "Alert unique identifier",
            },
            siteId: {
              type: "string",
              description: "Associated site ID",
            },
            userId: {
              type: "string",
              format: "uuid",
              description: "Owner user ID",
            },
            metricType: {
              type: "string",
              enum: ["lcp", "fid", "cls"],
              description: "Metric type to monitor",
            },
            condition: {
              type: "string",
              enum: ["greater_than", "less_than"],
              description: "Alert condition",
            },
            threshold: {
              type: "number",
              description: "Threshold value",
            },
            isActive: {
              type: "boolean",
              description: "Whether the alert is active",
            },
            createdAt: {
              type: "string",
              format: "date-time",
              description: "Alert creation timestamp",
            },
            updatedAt: {
              type: "string",
              format: "date-time",
              description: "Alert last update timestamp",
            },
          },
        },
        Error: {
          type: "object",
          properties: {
            error: {
              type: "string",
              description: "Error type",
            },
            message: {
              type: "string",
              description: "Human-readable error message",
            },
            details: {
              type: "object",
              description: "Additional error details (validation errors)",
            },
          },
        },
      },
      responses: {
        BadRequest: {
          description: "Bad Request - Validation error or malformed request",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: "ValidationError",
                message: "Invalid input data",
                details: {
                  email: "Invalid email format",
                },
              },
            },
          },
        },
        Unauthorized: {
          description: "Unauthorized - Missing or invalid authentication token",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: "UnauthorizedError",
                message: "Authentication required",
              },
            },
          },
        },
        Forbidden: {
          description: "Forbidden - Valid auth but insufficient permissions",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: "ForbiddenError",
                message: "You do not have permission to access this resource",
              },
            },
          },
        },
        NotFound: {
          description: "Not Found - Resource doesn't exist",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: "NotFoundError",
                message: "Site not found",
              },
            },
          },
        },
        Conflict: {
          description: "Conflict - Duplicate resource",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: "ConflictError",
                message: "Email already registered",
              },
            },
          },
        },
        TooManyRequests: {
          description: "Too Many Requests - Rate limit exceeded",
          headers: {
            "Retry-After": {
              schema: {
                type: "integer",
              },
              description: "Number of seconds to wait before retrying",
            },
          },
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: "RateLimitError",
                message: "Too many requests from this IP, please try again later.",
              },
            },
          },
        },
        InternalServerError: {
          description: "Internal Server Error - Unexpected error",
          content: {
            "application/json": {
              schema: {
                $ref: "#/components/schemas/Error",
              },
              example: {
                error: "InternalServerError",
                message: "An unexpected error occurred",
              },
            },
          },
        },
      },
    },
    tags: [
      {
        name: "Authentication",
        description: "User authentication and registration endpoints",
      },
      {
        name: "Sites",
        description: "Site management endpoints (CRUD operations)",
      },
      {
        name: "Metrics",
        description: "Metrics collection and retrieval endpoints",
      },
      {
        name: "Alerts",
        description: "Alert management endpoints (CRUD operations)",
      },
      {
        name: "Health",
        description: "Health check and monitoring endpoints",
      },
    ],
  },
  apis: ["./src/routes/*.ts"], // Path to the API routes with JSDoc comments
};

export const swaggerSpec = swaggerJsdoc(options);
