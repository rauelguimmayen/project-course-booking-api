// ═══════════════ STATE ═══════════════
let currentUser    = null;
let currentPage    = "home";
let selectedCourse = null;
let activeFilter   = "All";
let COURSES        = [];

const LEVEL_COLOR = {
  Beginner:     { bg:"#dcfce7", text:"#166534" },
  Intermediate: { bg:"#fef3c7", text:"#92400e" },
  Advanced:     { bg:"#ede9fe", text:"#4c1d95" },
};

// ═══════════════ API HELPERS ═══════════════
async function api(path, options = {}) {
  const res = await fetch(path, {
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    ...options,
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw data;
  return data;
}

// ═══════════════ NOTIFICATION ═══════════════
function notify(msg, type = "success") {
  const el = document.getElementById("notif");
  el.textContent = msg;
  el.style.background = type === "success" ? "#0f172a" : type === "info" ? "#1e3a5f" : "#7f1d1d";
  el.style.display = "block";
  el.style.animation = "none"; void el.offsetWidth; el.style.animation = "";
  clearTimeout(el._t);
  el._t = setTimeout(() => { el.style.display = "none"; }, 3000);
}

// ═══════════════ NAVIGATION ═══════════════
function navigate(page) {
  document.querySelectorAll(".page").forEach(p => p.classList.remove("active"));
  currentPage = page;
  const el = document.getElementById("page-" + page);
  if (el) el.classList.add("active");
  renderNav();
  if (page === "courses")   renderCourses();
  if (page === "dashboard") renderDashboard();
  if (page === "profile")   renderProfile();
  if (page === "detail")    renderDetail();
  window.scrollTo(0, 0);
}

// ═══════════════ NAV ═══════════════
function renderNav() {
  const links = document.getElementById("nav-links");
  if (currentUser) {
    links.innerHTML = `
      <button class="nav-link${currentPage==='dashboard'?' active':''}" onclick="navigate('dashboard')">Dashboard</button>
      <button class="nav-link${currentPage==='courses'?' active':''}" onclick="navigate('courses')">Courses</button>
      <button class="nav-link${currentPage==='profile'?' active':''}" onclick="navigate('profile')">Profile</button>
      <button class="nav-logout" onclick="doLogout()">Sign Out</button>`;
  } else {
    links.innerHTML = `
      <button class="nav-link${currentPage==='courses'?' active':''}" onclick="navigate('courses')">Courses</button>
      <button class="nav-btn" onclick="navigate('login')">Log In</button>
      <button class="nav-cta" onclick="navigate('register')">Get Started</button>`;
  }
}

// ═══════════════ AUTH ═══════════════
async function doLogin() {
  const email = document.getElementById("login-email").value.trim();
  const pass  = document.getElementById("login-password").value;
  const errEl = document.getElementById("login-error");
  errEl.classList.remove("visible");
  try {
    currentUser = await api("/api/auth/login", { method: "POST", body: { email, password: pass } });
    notify(`Welcome back, ${currentUser.name}!`);
    navigate("dashboard");
  } catch (err) {
    showErr(errEl, err.error || "Login failed.");
  }
}
const { validateEmail } = require("./middleware/auth");
async function doRegister() {
  const name    = document.getElementById("reg-name").value.trim();
  const emailInput   = document.getElementById("reg-email").value.trim();
  const pass    = document.getElementById("reg-password").value;
  const confirm = document.getElementById("reg-confirm").value;
  const errEl   = document.getElementById("reg-error");
  errEl.classList.remove("visible");
  if (!name)            return showErr(errEl, "Please enter your name.");
  emailInput.addEventListener("input", () => {
    const isValid = validateEmail(emailInput.value);
    emailInput.style.borderColor = isValid ? "green" : "red";
  });
  if (pass.length < 6)  return showErr(errEl, "Password must be at least 6 characters.");
  if (pass !== confirm) return showErr(errEl, "Passwords don't match.");
  try {
    currentUser = await api("/api/auth/register", { method: "POST", body: { name, email, password: pass } });
    notify(`Account created! Welcome, ${currentUser.name}!`);
    navigate("dashboard");
  } catch (err) {
    showErr(errEl, err.error || "Registration failed.");
  }
}

async function doLogout() {
  await api("/api/auth/logout", { method: "POST" });
  currentUser = null;
  notify("You've been logged out.", "info");
  navigate("home");
}

function showErr(el, msg) { el.textContent = msg; el.classList.add("visible"); }

// ═══════════════ ENROLL / UNENROLL ═══════════════
async function enroll(courseId) {
  if (!currentUser) { navigate("login"); return; }
  try {
    const data = await api(`/api/courses/${courseId}/enroll`, { method: "POST" });
    currentUser.enrolled = data.enrolled;
    const c = COURSES.find(c => c.id === courseId);
    if (c) { c.enrolled += 1; c.spots -= 1; }
    notify("Enrolled successfully! 🎉");
    renderCourses();
    if (currentPage === "detail") renderDetail();
  } catch (err) {
    notify(err.error || "Could not enroll.", "error");
  }
}

async function unenroll(courseId) {
  try {
    const data = await api(`/api/courses/${courseId}/unenroll`, { method: "POST" });
    currentUser.enrolled = data.enrolled;
    const c = COURSES.find(c => c.id === courseId);
    if (c) { c.enrolled = Math.max(0, c.enrolled - 1); c.spots += 1; }
    notify("Unenrolled from course.", "info");
    navigate("courses");
  } catch (err) {
    notify(err.error || "Could not unenroll.", "error");
  }
}

// ═══════════════ COURSES PAGE ═══════════════
function renderCourses() {
  const filterEl = document.getElementById("level-filters");
  const levels = ["All", "Beginner", "Intermediate", "Advanced"];
  filterEl.innerHTML = levels.map(l =>
    `<button class="filter-btn${activeFilter===l?' active':''}" onclick="setFilter('${l}')">${l}</button>`
  ).join("");

  const grid = document.getElementById("courses-grid");
  const list = activeFilter === "All" ? COURSES : COURSES.filter(c => c.level === activeFilter);
  grid.innerHTML = list.map(c => courseCardHTML(c)).join("");
}

function setFilter(f) { activeFilter = f; renderCourses(); }

function courseCardHTML(c) {
  const isEnrolled = (currentUser?.enrolled || []).includes(c.id);
  const lc  = LEVEL_COLOR[c.level];
  const pct = Math.round(c.enrolled / (c.enrolled + c.spots) * 100);
  const actionBtn = isEnrolled
    ? `<span class="enrolled-badge">✓ Enrolled</span>`
    : `<button class="btn-primary" style="background:${c.color};" onclick="enroll(${c.id});event.stopPropagation()">Enroll Now</button>`;
  return `
    <div class="course-card" onclick="openDetail(${c.id})">
      <div class="card-top" style="background:${c.color}18">
        <div class="card-icon" style="background:${c.color}">${c.icon}</div>
        <span class="badge" style="background:${lc.bg};color:${lc.text}">${c.level}</span>
      </div>
      <div class="card-body">
        <h3 class="card-title">${c.title}</h3>
        <p class="card-sub">${c.subtitle}</p>
        <p class="card-desc">${c.description}</p>
        <div class="card-meta">
          <span>📅 ${c.duration}</span><span>📚 ${c.lessons} lessons</span><span>👥 ${c.enrolled}</span>
        </div>
        <div class="progress-wrap">
          <div class="progress-bar"><div class="progress-fill" style="width:${pct}%;background:${c.color}"></div></div>
          <span class="progress-label">${c.spots} spots left</span>
        </div>
        <div class="card-actions">
          <button class="btn-outline" onclick="openDetail(${c.id});event.stopPropagation()">View Details</button>
          ${actionBtn}
        </div>
      </div>
    </div>`;
}

function openDetail(id) {
  selectedCourse = COURSES.find(c => c.id === id);
  navigate("detail");
}

// ═══════════════ COURSE DETAIL ═══════════════
function renderDetail() {
  if (!selectedCourse) return;
  const c = selectedCourse;
  const isEnrolled = (currentUser?.enrolled || []).includes(c.id);
  const lc = LEVEL_COLOR[c.level];

  document.getElementById("detail-hero").innerHTML = `
    <div class="detail-icon" style="background:${c.color}">${c.icon}</div>
    <div>
      <span class="badge" style="background:${lc.bg};color:${lc.text};display:inline-block;margin-bottom:.5rem">${c.level}</span>
      <h1 class="detail-title">${c.title}</h1>
      <p class="detail-sub">${c.subtitle}</p>
    </div>`;
  document.getElementById("detail-hero").style.cssText +=
    `background:linear-gradient(135deg,${c.color}22,${c.color}08);border-bottom:3px solid ${c.color}`;

  document.getElementById("detail-main").innerHTML = `
    <h2 class="section-heading">About this course</h2>
    <p class="detail-desc">${c.description}</p>
    <h2 class="section-heading">What you'll learn</h2>
    <div class="topics-grid">${c.topics.map(t =>
      `<div class="topic"><span style="color:${c.color}">✓</span> ${t}</div>`).join("")}</div>`;

  const enrollArea = currentUser
    ? isEnrolled
      ? `<div class="enrolled-confirm">✓ You're enrolled!</div>
         <button class="unenroll-btn" onclick="unenroll(${c.id})">Leave course</button>`
      : `<button class="btn-primary" style="width:100%;margin-top:1rem;background:${c.color}" onclick="enroll(${c.id})">Enroll Now</button>`
    : `<button class="btn-primary" style="width:100%;margin-top:1rem" onclick="navigate('login')">Log in to Enroll</button>`;

  document.getElementById("detail-side").innerHTML = `
    <div class="detail-stat"><span>⏱</span><span>${c.duration}</span></div>
    <div class="detail-stat"><span>📚</span><span>${c.lessons} lessons</span></div>
    <div class="detail-stat"><span>👥</span><span>${c.enrolled} enrolled</span></div>
    <div class="detail-stat"><span>🎯</span><span>${c.spots} spots left</span></div>
    ${enrollArea}`;
}

// ═══════════════ DASHBOARD ═══════════════
function renderDashboard() {
  if (!currentUser) return;
  const firstName    = currentUser.name.split(" ")[0];
  const joinDate     = new Date(currentUser.joinedAt).toLocaleDateString("en-US", { month:"long", year:"numeric" });
  const enrolled     = COURSES.filter(c => (currentUser.enrolled || []).includes(c.id));
  const totalLessons = enrolled.reduce((a, c) => a + c.lessons, 0);

  document.getElementById("dash-greeting").textContent = `Hey, ${firstName} 👋`;
  document.getElementById("dash-joined").textContent   = `Member since ${joinDate}`;
  document.getElementById("dash-stats").innerHTML = `
    <div class="dash-stat"><div class="dash-stat-num">${enrolled.length}</div><div class="dash-stat-label">Courses enrolled</div></div>
    <div class="dash-stat"><div class="dash-stat-num">${totalLessons}</div><div class="dash-stat-label">Total lessons</div></div>
    <div class="dash-stat"><div class="dash-stat-num">${COURSES.length - enrolled.length}</div><div class="dash-stat-label">Courses available</div></div>`;

  const coursesEl = document.getElementById("dash-courses");
  if (enrolled.length === 0) {
    coursesEl.innerHTML = `<div class="empty-state"><div style="font-size:3rem">📚</div><h3>No courses yet</h3><p>Browse our catalog and enroll in your first course!</p><button class="btn-primary" style="margin-top:1rem" onclick="navigate('courses')">Explore Courses</button></div>`;
  } else {
    coursesEl.innerHTML = `<div class="courses-grid">${enrolled.map(c => `
      <div class="course-card" onclick="openDetail(${c.id})">
        <div class="card-top" style="background:${c.color}18">
          <div class="card-icon" style="background:${c.color}">${c.icon}</div>
          <span class="badge" style="background:#dcfce7;color:#166534">✓ Enrolled</span>
        </div>
        <div class="card-body">
          <h3 class="card-title">${c.title}</h3>
          <p class="card-sub">${c.subtitle}</p>
          <div class="card-meta"><span>📅 ${c.duration}</span><span>📚 ${c.lessons} lessons</span></div>
        </div>
      </div>`).join("")}</div>`;
  }
}

// ═══════════════ PROFILE ═══════════════
function renderProfile() {
  if (!currentUser) return;
  const enrolled     = COURSES.filter(c => (currentUser.enrolled || []).includes(c.id));
  const totalLessons = enrolled.reduce((a, c) => a + c.lessons, 0);
  const joinDate     = new Date(currentUser.joinedAt).toLocaleDateString("en-US", { month:"long", day:"numeric", year:"numeric" });
  const latest       = enrolled.length > 0 ? enrolled[enrolled.length - 1].level : "—";

  const coursesHTML = enrolled.length === 0
    ? `<div class="empty-state"><p>You haven't enrolled in any courses yet.</p><button class="btn-primary" style="margin-top:.75rem" onclick="navigate('courses')">Browse Courses</button></div>`
    : enrolled.map(c => `
        <div class="profile-course-row">
          <div class="profile-course-icon" style="background:${c.color}">${c.icon}</div>
          <div><div class="profile-course-title">${c.title}</div><div class="profile-course-sub">${c.level} · ${c.lessons} lessons</div></div>
          <div class="profile-course-right"><span class="badge" style="background:#dcfce7;color:#166534">✓ Enrolled</span></div>
        </div>`).join("");

  document.getElementById("profile-content").innerHTML = `
    <div class="profile-card">
      <div class="avatar">${currentUser.name.charAt(0).toUpperCase()}</div>
      <div>
        <h2 class="profile-name">${currentUser.name}</h2>
        <p class="profile-email">${currentUser.email}</p>
        <p class="profile-date">Member since ${joinDate}</p>
      </div>
    </div>
    <div class="profile-stats">
      <div class="profile-stat"><div class="dash-stat-num">${enrolled.length}</div><div class="dash-stat-label">Enrolled</div></div>
      <div class="profile-stat"><div class="dash-stat-num">${totalLessons}</div><div class="dash-stat-label">Lessons</div></div>
      <div class="profile-stat"><div class="dash-stat-num" style="font-size:1.1rem">${latest}</div><div class="dash-stat-label">Latest level</div></div>
    </div>
    <h2 class="section-heading" style="margin-bottom:1rem">Enrolled Courses</h2>
    ${coursesHTML}`;
}

// ═══════════════ HERO CARDS ═══════════════
function renderHeroCards() {
  const rotations = [-4, 0, 4];
  const positions = [{ left:"20px", top:"0px" }, { left:"60px", top:"60px" }, { left:"100px", top:"120px" }];
  document.getElementById("hero-cards").innerHTML = COURSES.slice(0, 3).map((c, i) => `
    <div class="hero-card" style="transform:rotate(${rotations[i]}deg);z-index:${3-i};left:${positions[i].left};top:${positions[i].top}">
      <div class="hero-card-icon" style="background:${c.color}">${c.icon}</div>
      <div class="hero-card-title">${c.title}</div>
      <div class="hero-card-level">${c.level}</div>
    </div>`).join("");
}

// ═══════════════ BOOT ═══════════════
document.addEventListener("DOMContentLoaded", async () => {
  // 1. Load courses from MongoDB
  try {
    COURSES = await api("/api/courses");
  } catch {
    console.error("Could not load courses. Is the server running?");
  }

  // 2. Restore session (cookie-based)
  try {
    currentUser = await api("/api/auth/me");
  } catch {
    currentUser = null;
  }

  // 3. Render
  renderHeroCards();
  renderNav();
  navigate(currentUser ? "dashboard" : "home");
});