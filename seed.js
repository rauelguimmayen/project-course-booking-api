// Run once to populate MongoDB with courses:
//   node seed.js

require("dotenv").config();
const mongoose = require("mongoose");
const Course   = require("./models/Course");

const COURSES = [
  { id:1, title:"HTML Foundations",      subtitle:"The skeleton of the web",   level:"Beginner",     duration:"4 weeks",  lessons:12, color:"#FF6B35", icon:"⟨/⟩", description:"Learn the building blocks of every website. Structure content, work with semantic HTML5 elements, forms, tables, and accessibility best practices.", topics:["Document structure","Semantic tags","Forms & inputs","Accessibility"], enrolled:342, spots:30 },
  { id:2, title:"CSS Mastery",           subtitle:"Style with precision",       level:"Beginner",     duration:"5 weeks",  lessons:15, color:"#3B82F6", icon:"#",    description:"From box model basics to advanced animations. Master Flexbox, Grid, custom properties, and responsive design patterns.",                          topics:["Flexbox & Grid","Animations","Custom properties","Responsive design"], enrolled:289, spots:25 },
  { id:3, title:"JavaScript Essentials", subtitle:"Make things move",           level:"Intermediate", duration:"8 weeks",  lessons:24, color:"#F59E0B", icon:"JS",   description:"Core JavaScript concepts from variables and functions to DOM manipulation, async programming, and modern ES6+ syntax.",                            topics:["DOM manipulation","Async/Await","ES6+ syntax","APIs & fetch"], enrolled:415, spots:20 },
  { id:4, title:"React Development",     subtitle:"Component-driven UIs",       level:"Intermediate", duration:"10 weeks", lessons:30, color:"#06B6D4", icon:"⚛",   description:"Build modern, reactive user interfaces. Components, hooks, state management, routing, and deploying production apps.",                             topics:["Components & hooks","State management","React Router","Deployment"], enrolled:201, spots:18 },
  { id:5, title:"Node.js & APIs",        subtitle:"Server-side JavaScript",     level:"Advanced",     duration:"8 weeks",  lessons:22, color:"#10B981", icon:"⬡",   description:"Build robust backends with Node.js and Express. REST APIs, authentication, databases, and deploying to the cloud.",                               topics:["Express.js","REST APIs","Authentication","Database integration"], enrolled:178, spots:15 },
  { id:6, title:"TypeScript Pro",        subtitle:"Type-safe JavaScript",       level:"Advanced",     duration:"6 weeks",  lessons:18, color:"#8B5CF6", icon:"TS",   description:"Add static typing to your JavaScript projects. Generics, interfaces, advanced types, and integrating TypeScript into real projects.",              topics:["Types & interfaces","Generics","Utility types","TS + React"], enrolled:134, spots:20 },
];

(async () => {
  await mongoose.connect(process.env.MONGODB_STRING);
  await Course.deleteMany({});
  await Course.insertMany(COURSES);
  console.log(`✅ Seeded ${COURSES.length} courses.`);
  process.exit(0);
})();
