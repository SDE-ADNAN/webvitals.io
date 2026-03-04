import { Router } from "express";
import {
  create,
  list,
  update,
  remove,
} from "../controllers/alertController";
import { authenticate } from "../middleware/auth";
import { validate } from "../middleware/validate";
import {
  createAlertSchema,
  updateAlertSchema,
} from "../validators/alertValidators";

const router = Router();

// All alert routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/alerts:
 *   post:
 *     summary: Create a new alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - siteId
 *               - metricType
 *               - condition
 *               - threshold
 *             properties:
 *               siteId:
 *                 type: string
 *                 description: Site ID to monitor
 *                 example: abc123xyz
 *               metricType:
 *                 type: string
 *                 enum: [lcp, fid, cls]
 *                 description: Metric type to monitor
 *                 example: lcp
 *               condition:
 *                 type: string
 *                 enum: [greater_than, less_than]
 *                 description: Alert condition
 *                 example: greater_than
 *               threshold:
 *                 type: number
 *                 description: Threshold value
 *                 example: 2500
 *     responses:
 *       201:
 *         description: Alert created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Alert'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/", validate(createAlertSchema), create);

/**
 * @swagger
 * /api/alerts:
 *   get:
 *     summary: List all alerts for authenticated user
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of alerts
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Alert'
 *             example:
 *               - id: 550e8400-e29b-41d4-a716-446655440000
 *                 siteId: abc123xyz
 *                 userId: 660e8400-e29b-41d4-a716-446655440000
 *                 metricType: lcp
 *                 condition: greater_than
 *                 threshold: 2500
 *                 isActive: true
 *                 createdAt: 2024-01-15T10:30:00.000Z
 *                 updatedAt: 2024-01-15T10:30:00.000Z
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/", list);

/**
 * @swagger
 * /api/alerts/{alertId}:
 *   put:
 *     summary: Update an alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Alert ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               threshold:
 *                 type: number
 *                 description: Threshold value
 *                 example: 3000
 *               condition:
 *                 type: string
 *                 enum: [greater_than, less_than]
 *                 description: Alert condition
 *                 example: greater_than
 *               isActive:
 *                 type: boolean
 *                 description: Whether the alert is active
 *                 example: true
 *     responses:
 *       200:
 *         description: Alert updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Alert'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.put("/:alertId", validate(updateAlertSchema), update);

/**
 * @swagger
 * /api/alerts/{alertId}:
 *   delete:
 *     summary: Delete an alert
 *     tags: [Alerts]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: alertId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: Alert ID
 *     responses:
 *       200:
 *         description: Alert deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Alert deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete("/:alertId", remove);

export default router;
