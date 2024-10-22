import { createUnit, deleteUnit, getUnitById, getUnits, updateUnit } from "@/controllers/units.controllers";
import { Router } from "express";


const router = Router();

router.get("/", getUnits);
router.get("/:unitId", getUnitById);
router.post("/:userId", createUnit);
router.route("/:userId/:unitId").delete(deleteUnit).patch(updateUnit);
export default router;
