import { Router } from "express";
import {
  create,
  list,
  getById,
  update,
  remove,
} from "../controllers/siteController";
import { authenticate } from "../middleware/auth";
import { validate, validateParams } from "../middleware/validate";
import {
  createSiteSchema,
  updateSiteSchema,
  siteIdParamSchema,
} from "../validators/siteValidators";

const router = Router();

// All site routes require authentication
router.use(authenticate);

/**
 * @swagger
 * /api/sites:
 *   post:
 *     summary: Create a new site
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - url
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: Site name
 *                 example: My Awesome Website
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: Site URL
 *                 example: https://example.com
 *     responses:
 *       201:
 *         description: Site created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Site'
 *       400:
 *         $ref: '#/components/responses/BadRequest'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.post("/", validate(createSiteSchema), create);

/**
 * @swagger
 * /api/sites:
 *   get:
 *     summary: List all sites for authenticated user
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of sites
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Site'
 *             example:
 *               - id: 550e8400-e29b-41d4-a716-446655440000
 *                 siteId: abc123xyz
 *                 name: My Awesome Website
 *                 url: https://example.com
 *                 domain: example.com
 *                 isActive: true
 *                 userId: 660e8400-e29b-41d4-a716-446655440000
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
 * /api/sites/{siteId}:
 *   get:
 *     summary: Get site details
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: siteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Site ID
 *     responses:
 *       200:
 *         description: Site details
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Site'
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.get("/:siteId", validateParams(siteIdParamSchema), getById);

/**
 * @swagger
 * /api/sites/{siteId}:
 *   put:
 *     summary: Update a site
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: siteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Site ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 3
 *                 maxLength: 50
 *                 description: Site name
 *                 example: Updated Website Name
 *               url:
 *                 type: string
 *                 format: uri
 *                 description: Site URL
 *                 example: https://updated-example.com
 *               isActive:
 *                 type: boolean
 *                 description: Whether the site is actively monitored
 *                 example: true
 *     responses:
 *       200:
 *         description: Site updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Site'
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
router.put(
  "/:siteId",
  validateParams(siteIdParamSchema),
  validate(updateSiteSchema),
  update
);

/**
 * @swagger
 * /api/sites/{siteId}:
 *   delete:
 *     summary: Delete a site
 *     tags: [Sites]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: siteId
 *         required: true
 *         schema:
 *           type: string
 *         description: Site ID
 *     responses:
 *       200:
 *         description: Site deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: Site deleted successfully
 *       401:
 *         $ref: '#/components/responses/Unauthorized'
 *       403:
 *         $ref: '#/components/responses/Forbidden'
 *       404:
 *         $ref: '#/components/responses/NotFound'
 *       500:
 *         $ref: '#/components/responses/InternalServerError'
 */
router.delete("/:siteId", validateParams(siteIdParamSchema), remove);

export default router;
