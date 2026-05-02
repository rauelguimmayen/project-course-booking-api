const express     = require("express");
const router      = express.Router();
const { requireAuth } = require("../middleware/auth");
const enrollmentsController = require("../controllers/enrollments");


// POST /api/courses/:id/enroll
router.post("/:id/enroll", requireAuth, enrollmentsController.enrollCourse);

// POST /api/courses/:id/unenroll
router.post("/:id/unenroll", requireAuth, enrollmentsController.unenrollCourse);

module.exports = router;