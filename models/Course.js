const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  id:          { type: Number, required: true, unique: true },
  title:       { type: String, required: true },
  subtitle:    String,
  level:       { type: String, enum: ["Beginner", "Intermediate", "Advanced"] },
  duration:    String,
  lessons:     Number,
  color:       String,
  icon:        String,
  description: String,
  topics:      [String],
  enrolled:    { type: Number, default: 0 },
  spots:       { type: Number, default: 30 },
});

module.exports = mongoose.model("Course", courseSchema);
