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

// POST /api/sites - Create a new site
router.post("/", validate(createSiteSchema), create);

// GET /api/sites - List all sites for authenticated user
router.get("/", list);

// GET /api/sites/:siteId - Get site details
router.get("/:siteId", validateParams(siteIdParamSchema), getById);

// PUT /api/sites/:siteId - Update a site
router.put(
  "/:siteId",
  validateParams(siteIdParamSchema),
  validate(updateSiteSchema),
  update
);

// DELETE /api/sites/:siteId - Delete a site
router.delete("/:siteId", validateParams(siteIdParamSchema), remove);

export default router;
