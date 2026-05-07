// import express from "express";
// import {
//   submitProposal,
//   getMyProposal,
//   reviewProposal,
//   getProposalsBySupervisor,
// } from "../controllers/proposalController.js";
// import { protect, studentOnly, supervisorOnly } from "../middleware/auth.js";
// import { uploadProposal } from "../middleware/upload.js";

// const router = express.Router();

// router.post("/submit",    protect, studentOnly,    uploadProposal, submitProposal);
// router.get ("/my",        protect, studentOnly,    getMyProposal);
// router.put ("/:id/review",protect, supervisorOnly, reviewProposal);
// router.get ("/supervisor",protect, supervisorOnly, getProposalsBySupervisor);

// export default router;