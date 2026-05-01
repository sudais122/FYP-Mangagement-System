import express from "express";
import {
  createGroup,
  getMyGroup,
  getGroupsBySupervisor,
  getAllGroups,
  getGroupById,
  reassignSupervisor,
} from "../controllers/groupController.js";
import {
  protect,
  studentOnly,
  supervisorOnly,
  adminOnly,
} from "../middleware/auth.js";

const router = express.Router();

router.post("/",                   protect, studentOnly,    createGroup);
router.get ("/my",                 protect, studentOnly,    getMyGroup);
router.get ("/supervisor",         protect, supervisorOnly, getGroupsBySupervisor);
router.get ("/",                   protect, adminOnly,      getAllGroups);
router.get ("/:id",                protect,                 getGroupById);
router.put ("/:id/reassign",       protect, adminOnly,      reassignSupervisor);
router.post("/create", protect, createGroup);

export default router;