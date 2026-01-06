import { Response } from "express";
import { AuthRequest } from "../middleware/auth";
import {
  createSite,
  listSites,
  getSiteByPublicId,
  updateSite,
  deleteSite,
} from "../services/siteService";

/**
 * POST /api/sites
 * Create a new site
 * Requirements: 6.1-6.5
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
    const { name, url } = req.body;

    const site = await createSite(userId, { name, url });

    res.status(201).json({ site });
  } catch (error) {
    if (error instanceof Error) {
      const statusCode = (error as any).statusCode || 500;
      res.status(statusCode).json({
        error: statusCode === 400 ? "Bad Request" : "Internal Server Error",
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
 * GET /api/sites
 * List all sites for authenticated user
 * Requirements: 7.1-7.5
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
    const sites = await listSites(userId);

    res.status(200).json({ sites });
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
 * GET /api/sites/:siteId
 * Get site details by siteId
 * Requirements: 8.1-8.5
 */
export async function getById(req: AuthRequest, res: Response): Promise<void> {
  try {
    if (!req.user) {
      res.status(401).json({
        error: "Unauthorized",
        message: "Authentication required",
      });
      return;
    }

    const userId = parseInt(req.user.userId, 10);
    const siteId = req.params.siteId;

    if (!siteId) {
      res.status(400).json({
        error: "Bad Request",
        message: "Site ID is required",
      });
      return;
    }

    const site = await getSiteByPublicId(siteId, userId);

    res.status(200).json({ site });
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

/**
 * PUT /api/sites/:siteId
 * Update a site
 * Requirements: 9.1-9.5
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
    const siteId = req.params.siteId;

    if (!siteId) {
      res.status(400).json({
        error: "Bad Request",
        message: "Site ID is required",
      });
      return;
    }

    const { name, url, isActive } = req.body;

    const site = await updateSite(siteId, userId, { name, url, isActive });

    res.status(200).json({ site });
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
 * DELETE /api/sites/:siteId
 * Delete a site
 * Requirements: 10.1-10.5
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
    const siteId = req.params.siteId;

    if (!siteId) {
      res.status(400).json({
        error: "Bad Request",
        message: "Site ID is required",
      });
      return;
    }

    await deleteSite(siteId, userId);

    res.status(200).json({
      message: "Site deleted successfully",
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
