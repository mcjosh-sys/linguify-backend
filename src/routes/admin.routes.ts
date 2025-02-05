import { getTeam, isAdmin, isStaff } from "@/controllers/admin.controllers";
import { validateParams } from "@/middleware/validation";
import { Router } from "express";

const router = Router();

router.get("/:userId/is-admin", validateParams({userId: "string"}), isAdmin);
router.get("/:userId/is-staff", validateParams({ userId: "string" }), isStaff);
router.get("/team", getTeam);

export default router;
