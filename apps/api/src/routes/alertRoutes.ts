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

// POST /api/alerts - Create a new alert
router.post("/", validate(createAlertSchema), create);

// GET /api/alerts - List all alerts for authenticated user
router.get("/", list);

// PUT /api/alerts/:alertId - Update an alert
router.put("/:alertId", validate(updateAlertSchema), update);

// DELETE /api/alerts/:alertId - Delete an alert
router.delete("/:alertId", remove);

export default router;
