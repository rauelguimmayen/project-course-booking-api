const Course = require("../models/Course");


module.exports.enrollCourse = async (req, res) => {
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
};

module.exports.unenrollCourse = async (req, res) => {
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
};