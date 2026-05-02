const express     = require("express");
const router      = express.Router();
const Course      = require("../models/Course");
const { requireAuth } = require("../middleware/auth");
const courseController = require("../controllers/courses");

// GET /api/courses
router.get("/", courseController.getAllCourse);

// GET /api/courses/:id
router.get("/:id", courseController.findCourse);

// POST /api/courses/:id/enroll
router.post("/:id/enroll", requireAuth, async (req, res) => {
  const courseId = Number(req.params.id);
  try {
    const course = await Course.findOne({ id: courseId });
    if (!course) return res.status(404).json({ error: "Course not found." });
    if (course.spots <= 0) return res.status(409).json({ error: "No spots left." });
    const user = req.user;
    if (user.enrolled.includes(courseId))
      return res.status(409).json({ error: "Already enrolled." });
    user.enrolled.push(courseId);
    await user.save();
    course.enrolled += 1;
    course.spots    -= 1;
    await course.save();
    res.json({ message: "Enrolled successfully!", enrolled: user.enrolled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/courses/:id/unenroll
router.post("/:id/unenroll", requireAuth, async (req, res) => {
  const courseId = Number(req.params.id);
  try {
    const course = await Course.findOne({ id: courseId });
    if (!course) return res.status(404).json({ error: "Course not found." });
    const user = req.user;
    if (!user.enrolled.includes(courseId))
      return res.status(409).json({ error: "Not enrolled in this course." });
    user.enrolled = user.enrolled.filter(id => id !== courseId);
    await user.save();
    course.enrolled = Math.max(0, course.enrolled - 1);
    course.spots   += 1;
    await course.save();
    res.json({ message: "Unenrolled.", enrolled: user.enrolled });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
