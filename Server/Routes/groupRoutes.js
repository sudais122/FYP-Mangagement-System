import express from "express";
import {
  createGroup,
  getMyGroup,
  getGroupsBySupervisor,
  getAllGroups,
  getGroupById,
  reassignSupervisor,
  addMemberToGroup,
  getNextTeamId,
} from "../controllers/groupController.js";
import {
  protect,
  studentOnly,
  supervisorOnly,
  adminOnly,
} from "../middleware/auth.js";

const router = express.Router();

router.post("/",               protect, studentOnly,    createGroup);
router.get ("/next-id",        protect, studentOnly,    getNextTeamId);
router.get ("/my",             protect, studentOnly,    getMyGroup);
router.get ("/supervisor",     protect, supervisorOnly, getGroupsBySupervisor);
router.get ("/all",            protect, adminOnly,      getAllGroups);
router.get ("/",               protect, adminOnly,      getAllGroups);
router.get ("/:id",            protect,                 getGroupById);
router.put ("/:id/reassign",   protect, adminOnly,      reassignSupervisor);
router.put ("/:id/add-member", protect, studentOnly,    addMemberToGroup);

export default router;