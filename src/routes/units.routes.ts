import {
  createUnit,
  deleteUnit,
  getUnitById,
  getUnits,
  updateUnit,
} from "@/controllers/units.controllers";
import { checkPermission } from "@/middleware/permission";
import { validateParams, validateRequestBody } from "@/middleware/validation";
import { unitSchema } from "@/schemas/unit.schema";
import { Router } from "express";

const router = Router();

router.get("/", getUnits);
router.get("/:unitId", validateParams({ unitId: "number" }), getUnitById);
router.post(
  "/:userId",
  validateParams({ userId: "string" }),
  checkPermission,
  validateRequestBody(unitSchema),
  createUnit
);
router
  .route("/:userId/:unitId")
  .patch(
    validateParams({ unitId: "number", userId: "string" }),
    checkPermission,
    validateRequestBody(unitSchema.partial()),
    updateUnit
  )
  .delete(
    validateParams({ unitId: "number", userId: "string" }),
    checkPermission,
    deleteUnit
  );
export default router;
