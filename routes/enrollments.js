const express     = require("express");
const router      = express.Router();
const { requireAuth } = require("../middleware/auth");
const enrollmentsController = require("./app");


// POST /api/courses/:id/enroll
router.post("/:id/enroll", requireAuth, enrollmentsController.enroll);

// POST /api/courses/:id/unenroll
router.post("/:id/unenroll", requireAuth, enrollmentsController.unenroll);

module.exports = router;