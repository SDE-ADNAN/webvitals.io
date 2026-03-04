import { Router } from "express";
import { submit, list, getSummary } from "../controllers/metricController";
import { validate, validateQuery } from "../middleware/validate";
import { metricSchema, metricsQuerySchema } from "../validators/metricValidators";
import { authenticate } from "../middleware/auth";

const router = Router();

/**
 * @swagger
 * /api/metrics:
 *   post:
 *     summary: Submit a new metric (used by tracking SDK)
 *     tags: [Metrics]
 *     security:
 *       - siteIdHeader: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - lcp
 *               - fid
 *               - cls
 *               - deviceType
 *               - browserName
 *             properties:
 *               lcp:
 *                 type: number
 *                 description: Largest Contentful Paint in milliseconds
 *                 example: 2500
 *               fid:
 *                 type: number
 *                 description: First Input Delay in milliseconds
 *                 example: 100
 *               cls:
 *                 type: number
 *                 description: Cumulative Layout Shift score
 *                 example: 0.1
 *               ttfb:
 *                 type: number
 *                 description: Time to First Byte in milliseconds (optional)
 *                 example: 600
 *               fcp:
 *                 type: number
 *                 description: First Contentful Paint in milliseconds (optional)
 *                 example: 1800
 *               tti:
 *                 type: number
 *                 description: Time to Interactive in milliseconds (optional)
 *                 example: 3500
 *               deviceType:
 *                 type: string
 *                 enum: [desktop, mobile, tablet]
 *                 description: Device type
 *                 example: desktop
 *               browserName:
 *                 type: string
 *                 description: Browser name
 *                 example: Chrome
 *               osName:
 *                 type: string
 *                 description: Operating system name (optional)
 *                 example: Windows
 *               timestamp:
 *                 type: string
 *                 format: date-time
 *                 description: Metric collection timestamp (optional, defaults to current time)
 *                 example: 2024-01-15T10:30:00.000Z
 *     responses:
 *       201:
 *         description: Metric submitted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Metric submitted successfully
 *                 metricId:
 *                   type: string
 *                   format: uuid
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/", validate(metricSchema), submit);

/**
 * @swagger
 * /api/metrics/{siteId}/summary:
 *   get:
 *     summary: Get metrics summary for a site
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: siteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Site ID
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [24h, 7d, 30d]
 *           default: 7d
 *         description: Time range for metrics
 *       - in: query
 *         name: deviceType
 *         schema:
 *           type: string
 *           enum: [desktop, mobile, tablet]
 *         description: Filter by device type
 *       - in: query
 *         name: browserName
 *         schema:
 *           type: string
 *         description: Filter by browser name
 *     responses:
 *       200:
 *         description: Metrics summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 lcp:
 *                   type: object
 *                   properties:
 *                     avg:
 *                       type: number
 *                       example: 2500
 *                     p95:
 *                       type: number
 *                       example: 3200
 *                 fid:
 *                   type: object
 *                   properties:
 *                     avg:
 *                       type: number
 *                       example: 100
 *                     p95:
 *                       type: number
 *                       example: 150
 *                 cls:
 *                   type: object
 *                   properties:
 *                     avg:
 *                       type: number
 *                       example: 0.1
 *                     p95:
 *                       type: number
 *                       example: 0.15
 *                 count:
 *                   type: number
 *                   example: 1000
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/:siteId/summary", authenticate, validateQuery(metricsQuerySchema), getSummary);

/**
 * @swagger
 * /api/metrics/{siteId}:
 *   get:
 *     summary: Get metrics for a site with filters
 *     tags: [Metrics]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: siteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Site ID
 *       - in: query
 *         name: timeRange
 *         schema:
 *           type: string
 *           enum: [24h, 7d, 30d]
 *           default: 7d
 *         description: Time range for metrics
 *       - in: query
 *         name: deviceType
 *         schema:
 *           type: string
 *           enum: [desktop, mobile, tablet]
 *         description: Filter by device type
 *       - in: query
 *         name: browserName
 *         schema:
 *           type: string
 *         description: Filter by browser name
 *     responses:
 *       200:
 *         description: List of metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Metric'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/:siteId", authenticate, validateQuery(metricsQuerySchema), list);

export default router;
