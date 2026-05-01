const Course = require("../models/Course");

//Get All Courses
module.exports.getAllCourse = async (req, res) => {
  try {
    const courses = await Course.find().sort({ id: 1 });
    res.json(courses);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Find Specific Course
module.exports.findCourse = async (req, res) => {
  try {
    const course = await Course.findOne({ id: Number(req.params.id) });
    if (!course) return res.status(404).json({ error: "Course not found." });
    res.json(course);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};