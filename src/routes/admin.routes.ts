import { getTeam, hasPermission, isAdmin, isStaff } from "@/controllers/admin.controllers";
import { Router } from "express";

const router = Router();

router.get("/:userId/is-admin", isAdmin);
router.get("/:userId/is-staff", isStaff);
router.get("/permission/has-permission", hasPermission);
router.get("/team", getTeam);

export default router;
