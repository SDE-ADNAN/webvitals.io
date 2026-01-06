import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  createAlert,
  listAlerts,
  updateAlert,
  deleteAlert,
} from "../services/alertService";

/**
 * POST /api/alerts
 * Create a new alert
 * Requirements: 14.1-14.5
 */
export async function create(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const userId = parseInt(req.user.userId, 10);
    const { siteId, metricType, threshold, condition } = req.body;

    const alert = await createAlert(userId, {
      siteId,
      metricType,
      threshold,
      condition,
    });

    res.status(201).json({ alert });
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;
      const errorType =
        statusCode === 404
          ? "Not Found"
          : statusCode === 403
          ? "Forbidden"
          : statusCode === 400
          ? "Bad Request"
          : "Internal Server Error";

      res.status(statusCode).json({
        error: errorType,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}

/**
 * GET /api/alerts
 * List all alerts for authenticated user
 * Requirements: 15.1-15.5
 */
export async function list(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const userId = parseInt(req.user.userId, 10);
    const alerts = await listAlerts(userId);

    res.status(200).json({ alerts });
  } catch (error) {
    if (error instanceof Error) {
      res.status(500).json({
        error: "Internal Server Error",
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}

/**
 * PUT /api/alerts/:alertId
 * Update an alert
 * Requirements: 16.1-16.5
 */
export async function update(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const userId = parseInt(req.user.userId, 10);
    const alertIdParam = req.params.alertId as string;
    const alertId = parseInt(alertIdParam, 10);

    if (isNaN(alertId)) {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid alert ID",
      });
      return;
    }

    const { threshold, condition, isActive } = req.body;

    const alert = await updateAlert(alertId, userId, {
      threshold,
      condition,
      isActive,
    });

    res.status(200).json({ alert });
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;
      const errorType =
        statusCode === 404
          ? "Not Found"
          : statusCode === 403
          ? "Forbidden"
          : statusCode === 400
          ? "Bad Request"
          : "Internal Server Error";

      res.status(statusCode).json({
        error: errorType,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}

/**
 * DELETE /api/alerts/:alertId
 * Delete an alert
 * Requirements: 17.1-17.5
 */
export async function remove(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const userId = parseInt(req.user.userId, 10);
    const alertIdParam = req.params.alertId as string;
    const alertId = parseInt(alertIdParam, 10);

    if (isNaN(alertId)) {
      res.status(400).json({
        error: "Bad Request",
        message: "Invalid alert ID",
      });
      return;
    }

    await deleteAlert(alertId, userId);

    res.status(200).json({
      message: "Alert deleted successfully",
    });
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;
      const errorType =
        statusCode === 404
          ? "Not Found"
          : statusCode === 403
          ? "Forbidden"
          : "Internal Server Error";

      res.status(statusCode).json({
        error: errorType,
        message: error.message,
      });
      return;
    }

    res.status(500).json({
      error: "Internal Server Error",
      message: "An unexpected error occurred",
    });
  }
}
