import { Router } from "express";
import { submit, list, getSummary } from "../controllers/metricController";
import { validate, validateQuery } from "../middleware/validate";
import { metricSchema, metricsQuerySchema } from "../validators/metricValidators";
import { authenticate } from "../middleware/auth";

const router = Router();

// POST /api/metrics - Submit a new metric (public endpoint, authenticated via X-Site-ID header)
// Requirements: 11.1-11.5
router.post("/", validate(metricSchema), submit);

// GET /api/metrics/:siteId/summary - Get metrics summary for a site (protected)
// Requirements: 13.1-13.5
// Note: This route must be defined before /:siteId to avoid conflicts
router.get("/:siteId/summary", authenticate, validateQuery(metricsQuerySchema), getSummary);

// GET /api/metrics/:siteId - Get metrics for a site with filters (protected)
// Requirements: 12.1-12.5
router.get("/:siteId", authenticate, validateQuery(metricsQuerySchema), list);

export default router;
