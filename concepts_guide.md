# Portfolio Project — Web Dev Concepts Guide
### Every concept you'll use, explained clearly before you write the code

---

## How to Use This Document

Read the section for a concept **before** you start coding that phase.
This is not a tutorial — it explains the **why**, not just the how.
The implementation plan tells you what to build. This tells you what you're actually doing when you build it.

---

# PART 1 — THE SERVER

## 1. Node.js

**What it is:** JavaScript running on your computer (the server), not in a browser.

Before Node.js, JavaScript could only run in browsers. Node.js took the V8 engine (the thing Chrome uses to run JS) and made it run anywhere — your laptop, a server, a Raspberry Pi.

**Why this matters for your project:**
Your portfolio server needs to listen for requests, talk to MongoDB, send emails, and serve HTML pages. Node.js is the runtime that makes all of this possible with the same language you already know.

**Key concept — the event loop:**
Node.js is single-threaded but non-blocking. Instead of waiting for one thing to finish before doing the next (like reading a file or querying a DB), it registers a callback and moves on. This is why you'll see a lot of `async/await` — it's how you handle these async operations cleanly.

```js
// Without async/await — callback hell
db.findOne({ slug: 'my-project' }, function(err, project) {
  res.render('show', { project });
});

// With async/await — clean and readable
const project = await Project.findOne({ slug: 'my-project' });
res.render('show', { project });
```

---

## 2. Express.js

**What it is:** A minimal web framework that sits on top of Node.js.

Node.js alone can handle HTTP requests, but it's verbose. Express wraps it with a clean API for routing, middleware, and responses.

**The three things Express does for you:**

1. **Routing** — Maps a URL + HTTP method to a function
2. **Middleware** — Runs functions on every request before it hits your route
3. **Response helpers** — `res.json()`, `res.render()`, `res.redirect()`, `res.download()`

```js
const express = require('express');
const app = express();

// Route: when a GET request hits '/', run this function
app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000);
```

**`req` and `res` — understand these deeply:**
- `req` (request) — everything the client sent: URL, query params, body, cookies, session
- `res` (response) — what you send back: HTML, JSON, a redirect, a file

```js
app.get('/projects', (req, res) => {
  console.log(req.query);    // ?category=AI → { category: 'AI' }
  console.log(req.params);   // /:slug → { slug: 'rentchat' }
  console.log(req.body);     // POST body after parsing middleware
  console.log(req.session);  // session data (after express-session setup)
});
```

---

## 3. MVC Architecture (Model — View — Controller)

**What it is:** A way of organizing code so each file has one job.

Most beginners put everything in one file. MVC separates concerns:

| Layer | File location | Responsibility |
|---|---|---|
| **Model** | `models/Project.js` | Defines the data shape, talks to the database |
| **View** | `views/pages/projects/show.ejs` | Displays the data as HTML |
| **Controller** | `controllers/projectController.js` | Handles the request, calls the model, picks a view |

**The flow of a request in MVC:**
```
Browser sends GET /projects/rentchat
        ↓
Route (routes/projects.js) — matches the URL, calls controller
        ↓
Controller (projectController.js) — queries DB via Model
        ↓
Model (Project.js) — fetches data from MongoDB
        ↓
Controller — passes data to View
        ↓
View (show.ejs) — renders HTML with the data
        ↓
Express sends the HTML back to the browser
```

**Why this matters:**
Without MVC, your `app.js` becomes 1000 lines of spaghetti. With MVC, if the blog page breaks, you look in `blogController.js`. You know exactly where to go.

---

## 4. Routing

**What it is:** Connecting a URL + HTTP method to a function that handles it.

HTTP has several methods (verbs). For a portfolio app you'll use four:

| Method | Meaning | Example Use |
|---|---|---|
| `GET` | Fetch/read something | Show a project page |
| `POST` | Create something new | Submit contact form |
| `PUT` | Update an existing thing | Edit a project |
| `DELETE` | Remove something | Delete a blog post |

**Browser forms only support GET and POST.** This is why you need `method-override` — it lets you fake PUT and DELETE by adding a `?_method=PUT` query string.

```html
<!-- In your EJS admin form to update a project -->
<form method="POST" action="/admin/projects/<%= project._id %>?_method=PUT">
```

```js
// routes/projects.js
const express = require('express');
const router = express.Router();
const { showProject, listProjects } = require('../controllers/projectController');

router.get('/', listProjects);
router.get('/:slug', showProject);

module.exports = router;
```

```js
// app.js — mount the router
app.use('/projects', require('./routes/projects'));
// Now GET /projects → listProjects, GET /projects/rentchat → showProject
```

**Route parameters vs Query strings:**
```
/projects/rentchat       → req.params.slug = 'rentchat'  (for specific resources)
/projects?category=AI    → req.query.category = 'AI'     (for filtering/searching)
```

---

## 5. Middleware

**What it is:** Functions that run between receiving a request and sending a response.

Think of middleware as a conveyor belt. Every request passes through each piece of middleware in order before hitting the route handler.

```
Request → [bodyParser] → [session] → [passport] → [isAdmin] → Route Handler → Response
```

Each middleware function has the signature `(req, res, next)`:
- `req` — the request object (middleware can add properties to it)
- `res` — the response object (middleware can end the request here)
- `next` — call this to pass control to the next middleware

```js
// middleware/isAdmin.js
module.exports = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') {
    return next(); // ✅ let them through
  }
  res.redirect('/login'); // ❌ not allowed
};
```

**Middleware you'll use and what each does:**

| Package | What it does |
|---|---|
| `express.json()` | Parses JSON bodies so `req.body` works for JSON |
| `express.urlencoded()` | Parses HTML form bodies so `req.body` works for forms |
| `method-override` | Fakes PUT/DELETE from HTML forms |
| `express-session` | Attaches a `req.session` object to every request |
| `passport.initialize()` | Wires Passport into Express |
| `passport.session()` | Restores user from session on each request |
| `connect-flash` | Adds `req.flash()` for one-time success/error messages |
| `helmet` | Sets secure HTTP headers automatically |
| `express-rate-limit` | Limits how many requests one IP can make |
| `express-mongo-sanitize` | Strips `$` and `.` from `req.body` (prevents NoSQL injection) |

**`catchAsync` — the most important custom middleware you'll write:**

Every async route that touches MongoDB can throw an error. Without handling it, your server crashes. `catchAsync` wraps your async controllers so errors automatically go to Express's error handler:

```js
// middleware/catchAsync.js
module.exports = (fn) => {
  return (req, res, next) => {
    fn(req, res, next).catch(next); // catch any error and send to errorHandler
  };
};
```

```js
// Usage in a controller
const catchAsync = require('../middleware/catchAsync');

exports.showProject = catchAsync(async (req, res) => {
  const project = await Project.findOne({ slug: req.params.slug });
  if (!project) throw new Error('Project not found'); // goes to errorHandler
  res.render('pages/projects/show', { project });
});
```

---

# PART 2 — TEMPLATING

## 6. EJS (Embedded JavaScript)

**What it is:** A templating engine that lets you write HTML with JavaScript inside it.

Express can't send React components — it sends HTML strings. EJS lets you generate those HTML strings dynamically by embedding JS in your HTML files.

**EJS tags:**
```ejs
<%= value %>        — Outputs the value (HTML-escaped, safe)
<%- value %>        — Outputs raw HTML (use only for trusted content like rendered markdown)
<% code %>          — Runs JS code, outputs nothing
<%- include('path') %> — Includes another EJS file
```

**Example — projects listing:**
```ejs
<% if (projects.length === 0) { %>
  <p>No projects yet.</p>
<% } else { %>
  <% projects.forEach(project => { %>
    <div class="card">
      <h2><%= project.title %></h2>
      <p><%= project.summary %></p>
      <a href="/projects/<%= project.slug %>">Read More</a>
    </div>
  <% }) %>
<% } %>
```

**Passing data from controller to view:**
```js
// controller
res.render('pages/projects/index', {
  title: 'Projects',      // available as <%= title %>
  projects: projectsArray // available as projects in EJS
});
```

---

## 7. express-ejs-layouts

**What it is:** A package that adds layout support to EJS, so you don't repeat navbar/footer on every page.

Without layouts, every EJS file needs the full `<html>`, `<head>`, navbar, footer. With layouts, you define one `main.ejs` layout and every page just provides its own content.

```ejs
<!-- views/layouts/main.ejs -->
<!DOCTYPE html>
<html lang="en">
<head>
  <%- include('../partials/head') %>
</head>
<body>
  <%- include('../partials/navbar') %>
  <main>
    <%- body %>  <!-- ← each page's content goes here -->
  </main>
  <%- include('../partials/footer') %>
</body>
</html>
```

```js
// app.js setup
const expressLayouts = require('express-ejs-layouts');
app.use(expressLayouts);
app.set('layout', 'layouts/main'); // default layout for all views
app.set('view engine', 'ejs');
```

---

# PART 3 — DATABASE

## 8. MongoDB

**What it is:** A NoSQL database that stores data as JSON-like documents.

Instead of rows and columns (SQL), MongoDB stores **documents** (JavaScript objects) in **collections** (like arrays of objects).

**SQL vs MongoDB analogy:**
```
SQL:      Database → Table  → Rows       → Columns
MongoDB:  Database → Collection → Documents → Fields
```

**Why MongoDB for this project:**
- Your project data is naturally object-shaped (`techStack: []`, `images: []`)
- Embedded arrays eliminate the need for JOIN tables
- The JS-like query syntax feels natural after learning JS
- MongoDB Atlas has a generous free tier

**A document looks like:**
```json
{
  "_id": "64f2abc...",
  "title": "RentChat RAG Chatbot",
  "slug": "rentchat-rag",
  "techStack": ["Python", "LangChain", "MongoDB"],
  "featured": true
}
```

---

## 9. Mongoose

**What it is:** An ODM (Object Document Mapper) that gives you schemas, validation, and helper methods on top of raw MongoDB.

MongoDB itself doesn't enforce any structure — you could store anything. Mongoose adds structure:

**Schema — define the shape of a document:**
```js
// models/Project.js
const mongoose = require('mongoose');

const projectSchema = new mongoose.Schema({
  title:   { type: String, required: true },
  slug:    { type: String, required: true, unique: true },
  views:   { type: Number, default: 0 },
  featured: { type: Boolean, default: false },
  techStack: [String],
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Project', projectSchema);
```

**Model — a class that lets you query the collection:**
```js
const Project = require('../models/Project');

// CRUD operations
const all      = await Project.find();
const one      = await Project.findOne({ slug: 'rentchat' });
const byId     = await Project.findById(req.params.id);
const created  = await Project.create({ title: 'New', slug: 'new' });
const updated  = await Project.findByIdAndUpdate(id, { title: 'Updated' }, { new: true });
const deleted  = await Project.findByIdAndDelete(id);

// Increment a field atomically
await Project.findByIdAndUpdate(id, { $inc: { views: 1 } });

// Filter + sort
const aiProjects = await Project.find({ category: 'AI/ML' }).sort({ createdAt: -1 });
```

**`$inc` — the atomic increment operator:**
When two people load a project page at the same time, you don't want them both reading `views: 5`, adding 1, and both writing `views: 6`. `$inc` tells MongoDB to add 1 directly in the database atomically, so the result is correctly `views: 7`.

---

## 10. Slugs

**What it is:** A URL-friendly version of a title.

Instead of `/projects/64f2abc123` (ugly MongoDB ID), you get `/projects/rentchat-rag-chatbot` (readable, SEO-friendly).

```js
// utils/slugify.js — or use the 'slugify' npm package
const slugify = require('slugify');

const slug = slugify('RentChat RAG Chatbot', {
  lower: true,
  strict: true   // removes special chars
});
// → 'rentchat-rag-chatbot'
```

**You generate the slug when creating a project and store it in the DB.** Never regenerate it — if you change the title, the slug stays the same (or old links break).

---

# PART 4 — AUTHENTICATION

## 11. How Authentication Works (Conceptually)

**Authentication = proving who you are**
**Authorization = proving you're allowed to do something**

For this project: You (admin) need to log in before you can create/edit/delete projects. Visitors can only read.

**The session-based auth flow:**

```
1. You POST /login with username + password
2. Server checks: does username exist? does password match the hash?
3. If yes: server creates a SESSION (a record stored server-side)
4. Server sends a SESSION ID back to browser as a cookie
5. On every future request, browser automatically sends the cookie
6. Server looks up the session ID, finds your user data, attaches it to req.user
7. Your isAdmin middleware checks req.user.role === 'admin'
```

The browser never stores your password. It only stores the session ID (a random string). The actual session data lives on the server (in MongoDB via `connect-mongo`).

---

## 12. bcrypt — Password Hashing

**Never store passwords as plain text.** If your DB is ever leaked, every user's password is exposed.

Hashing = one-way transformation. You can't reverse a hash back to the original password.
Bcrypt = a slow hashing algorithm (slow = good, makes brute force attacks take years).

```js
const bcrypt = require('bcrypt');

// When creating the admin user (in your seed.js):
const passwordHash = await bcrypt.hash('your_password', 12);
// 12 = "salt rounds" — how slow the hash is. 10-12 is standard.

// When logging in (in passport strategy):
const isMatch = await bcrypt.compare(enteredPassword, storedHash);
// Returns true or false — never decrypts the hash
```

---

## 13. Passport.js

**What it is:** An authentication middleware that handles login strategies.

Passport supports 500+ strategies (Google OAuth, GitHub, local username/password, etc.). You'll use the **local strategy** — username and password from a form.

```js
// config/passport.js
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const User = require('../models/User');
const bcrypt = require('bcrypt');

passport.use(new LocalStrategy(async (username, password, done) => {
  const user = await User.findOne({ username });
  if (!user) return done(null, false, { message: 'User not found' });

  const match = await bcrypt.compare(password, user.passwordHash);
  if (!match) return done(null, false, { message: 'Wrong password' });

  return done(null, user); // ✅ success
}));

// How to store user in session (only save the ID, not the whole object)
passport.serializeUser((user, done) => done(null, user.id));

// How to restore user from session ID on each request
passport.deserializeUser(async (id, done) => {
  const user = await User.findById(id);
  done(null, user); // attached to req.user
});
```

---

## 14. Express Session + connect-mongo

**What it is:** Stores session data server-side so users stay logged in across requests.

HTTP is stateless — every request is independent. Sessions give it memory.

```js
const session = require('express-session');
const MongoStore = require('connect-mongo');

app.use(session({
  secret: process.env.SESSION_SECRET,  // used to sign the cookie
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI })
  // Without MongoStore, sessions live in memory — lost on every server restart
}));
```

**`connect-mongo`** saves sessions in a MongoDB collection called `sessions`. This means even if Render restarts your server, logged-in users stay logged in.

---

## 15. connect-flash

**What it is:** One-time messages that survive exactly one redirect.

After creating a project, you redirect to `/admin/projects`. You want to show "Project created successfully!" but only once. Flash messages disappear after being displayed.

```js
const flash = require('connect-flash');
app.use(flash());

// Make flash messages available in every EJS view
app.use((req, res, next) => {
  res.locals.success = req.flash('success');
  res.locals.error   = req.flash('error');
  next();
});
```

```js
// In a controller
req.flash('success', 'Project created!');
res.redirect('/admin/projects');
```

```ejs
<!-- In a partial, shown on the next page, then gone -->
<% if (success.length) { %>
  <div class="alert-success"><%= success %></div>
<% } %>
```

---

# PART 5 — ENVIRONMENT & CONFIGURATION

## 16. Environment Variables (.env)

**What it is:** A way to store secrets outside your code.

You never hardcode database passwords or API keys in your JS files. If you did, anyone who sees your GitHub repo can access your database.

`.env` file (never committed to Git):
```
MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/portfolio
SESSION_SECRET=some_long_random_string
```

```js
// At the very top of app.js, before anything else:
require('dotenv').config();

// Now anywhere in your code:
process.env.MONGO_URI        // the full MongoDB connection string
process.env.SESSION_SECRET   // your session secret
```

**`.env.example`** — a template you DO commit, with the keys but no values:
```
MONGO_URI=
SESSION_SECRET=
CLOUDINARY_CLOUD_NAME=
```
Anyone cloning your repo knows which env vars to set up.

---

## 17. Environment Validation (validateEnv.js)

**What it is:** A startup check that crashes your app loudly if a required env var is missing.

Without this, your app starts fine but crashes midway through a request with a confusing error like "Cannot read property of undefined."

```js
// middleware/validateEnv.js
const required = ['MONGO_URI', 'SESSION_SECRET', 'CLOUDINARY_CLOUD_NAME'];

module.exports = () => {
  const missing = required.filter(key => !process.env[key]);
  if (missing.length) {
    console.error(`Missing env vars: ${missing.join(', ')}`);
    process.exit(1); // crash immediately with a clear message
  }
};
```

```js
// app.js — first thing
require('dotenv').config();
require('./middleware/validateEnv')();
```

---

# PART 6 — FILE UPLOADS

## 18. Multer

**What it is:** Middleware that handles `multipart/form-data` — the encoding used when uploading files from forms.

Normal form data is text. When you add a file input, the form uses a different encoding that includes binary data. Multer intercepts this and gives you `req.file` or `req.files`.

```js
// Without Cloudinary (saving locally — don't do this in production):
const multer = require('multer');
const upload = multer({ dest: 'public/uploads/' });

router.post('/admin/projects', upload.single('coverImage'), controller);
// req.file is now available in the controller
```

---

## 19. Cloudinary

**What it is:** A cloud service for storing and serving images.

You don't store images on your Render server. Render's file system is ephemeral (resets on restart/redeploy). Cloudinary stores them permanently and gives you a URL.

The pipeline: `Form submission → Multer → Cloudinary → Store URL in MongoDB`

```js
// config/cloudinary.js
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: { folder: 'portfolio/projects', allowed_formats: ['jpg', 'png', 'webp'] }
});

module.exports = { cloudinary, storage };
```

```js
// In your admin route
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage }); // Multer now uploads directly to Cloudinary

router.post('/admin/projects', upload.single('coverImage'), createProject);
// req.file.path = the Cloudinary URL — save this to MongoDB
```

---

# PART 7 — CONTENT

## 20. Markdown

**What it is:** A lightweight syntax for writing formatted text that converts to HTML.

Your blog posts and project descriptions are stored as Markdown in MongoDB. On the detail page, you convert it to HTML before rendering.

```markdown
# Project Title
This is **bold** and this is *italic*.
- Feature one
- Feature two
```

```js
// utils/renderMarkdown.js
const { marked } = require('marked');
const createDOMPurify = require('isomorphic-dompurify');

module.exports = (markdownString) => {
  const rawHTML   = marked(markdownString);       // convert to HTML
  const cleanHTML = createDOMPurify.sanitize(rawHTML); // remove XSS scripts
  return cleanHTML;
};
```

```ejs
<!-- Use <%- (raw) not <%= (escaped) because it's already HTML -->
<%- renderMarkdown(blog.content) %>
```

**Why DOMPurify?** Without sanitization, someone could write `<script>alert('hacked')</script>` in the admin editor and it would run for every visitor. DOMPurify strips dangerous tags while keeping valid HTML.

---

## 21. Nodemailer

**What it is:** A Node.js package for sending emails programmatically.

When someone submits your contact form, you get an email notification. Much better than checking the admin dashboard manually.

```js
// utils/sendEmail.js
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS   // Gmail App Password (not your real password)
  }
});

module.exports = async ({ name, email, message }) => {
  await transporter.sendMail({
    from:    process.env.EMAIL_USER,
    to:      process.env.ADMIN_EMAIL,
    subject: `Portfolio contact from ${name}`,
    html:    `<p>${message}</p><p>Reply to: ${email}</p>`
  });
};
```

> **Gmail App Password:** Go to Google Account → Security → 2FA → App Passwords. Generate one for "Mail". Use this in `.env`, not your real Gmail password.

---

# PART 8 — SECURITY

## 22. Helmet

**What it is:** Sets secure HTTP response headers automatically.

HTTP headers tell the browser how to behave. Insecure defaults allow clickjacking, MIME-type sniffing, cross-site scripting via iframes. Helmet fixes all of this in one line.

```js
const helmet = require('helmet');
app.use(helmet());
```

What it sets: `X-Frame-Options`, `Content-Security-Policy`, `X-Content-Type-Options`, etc. You don't need to know them all — just use the package.

---

## 23. express-rate-limit

**What it is:** Limits how many requests one IP can make in a time window.

Without this, a bot can submit your contact form 10,000 times in a minute, fill your DB, and spam your inbox. Or attempt 10,000 login guesses.

```js
const rateLimit = require('express-rate-limit');

const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 10,                    // max 10 submissions per 15 min per IP
  message: 'Too many submissions. Try again later.'
});

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5   // 5 login attempts per 15 min per IP
});

router.post('/contact', contactLimiter, handleContact);
router.post('/login',   loginLimiter,   passport.authenticate('local'));
```

---

## 24. express-mongo-sanitize

**What it is:** Prevents NoSQL injection attacks.

MongoDB queries use operators like `$gt`, `$where`, `$eq`. A malicious user could submit `{ "username": { "$gt": "" } }` as form data, which would match any user. `express-mongo-sanitize` strips these from `req.body`, `req.params`, and `req.query`.

```js
const mongoSanitize = require('express-mongo-sanitize');
app.use(mongoSanitize());  // that's it — runs on every request
```

---

# PART 9 — FRONTEND

## 25. Tailwind CSS

**What it is:** A utility-first CSS framework — instead of writing CSS, you apply small single-purpose classes directly in HTML.

```html
<!-- Traditional CSS -->
<div class="card">

<!-- Tailwind -->
<div class="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl">
```

**Key Tailwind concepts for this project:**

**Responsive prefixes** — `md:`, `lg:`, etc. apply only at that breakpoint:
```html
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
```

**Dark mode with `dark:` prefix** (requires `darkMode: 'class'` in config):
```html
<body class="bg-white dark:bg-gray-950 text-gray-900 dark:text-gray-100">
```

**Hover, focus, active states:**
```html
<button class="bg-violet-600 hover:bg-violet-500 active:scale-95 transition-all duration-200">
```

**Arbitrary values** (when you need a specific value not in the default scale):
```html
<div class="w-[420px] mt-[72px]">
```

**`@tailwindcss/typography`** — adds a `prose` class that beautifully styles markdown-generated HTML:
```html
<article class="prose prose-invert prose-lg max-w-none">
  <%- renderedMarkdown %>
</article>
```

---

## 26. CSS Variables (Custom Properties)

**What they are:** Variables in CSS, defined once and reused everywhere.

```css
/* input.css */
:root {
  --accent: #6c63ff;
  --bg:     #0a0a0f;
}

/* Usage */
.btn-primary {
  background-color: var(--accent);
}
```

**Why this matters for dark mode:** You can define two sets of variables and switch between them by toggling a class:

```css
:root         { --bg: #ffffff; --text: #0a0a0f; }
:root.dark    { --bg: #0a0a0f; --text: #e2e8f0; }
```

Toggle `.dark` on `<html>` in JS → entire site switches colors.

---

## 27. GSAP (GreenSock Animation Platform)

**What it is:** The most powerful JavaScript animation library. Smooth, performant, fine-grained control.

**Why not CSS animations?** CSS `transition` and `@keyframes` are fine for simple hover effects. But for complex sequences, scroll-triggered animations, and text effects, GSAP gives you control CSS can't.

**Core concepts:**

```js
// Tween — animate one thing
gsap.to('.hero-title', {
  opacity: 1,
  y: 0,
  duration: 1,
  ease: 'power3.out'
});

// From — start from these values, animate to current CSS values
gsap.from('.card', {
  opacity: 0,
  y: 60,
  stagger: 0.1  // each card animates 0.1s after the previous
});

// Timeline — sequence multiple animations
const tl = gsap.timeline();
tl.from('.logo', { opacity: 0, duration: 0.5 })
  .from('.nav-links', { opacity: 0, x: -20, stagger: 0.1 })
  .from('.hero-text', { opacity: 0, y: 40 });
```

**ScrollTrigger** — trigger animations based on scroll position:
```js
gsap.registerPlugin(ScrollTrigger);

gsap.from('.project-card', {
  scrollTrigger: {
    trigger: '.projects-section',
    start: 'top 80%',   // when top of section hits 80% of viewport
  },
  opacity: 0,
  y: 60,
  stagger: 0.15
});
```

---

## 28. Lenis — Smooth Scrolling

**What it is:** A library that overrides native browser scroll with a smooth, momentum-based scroll.

Native browser scroll is instant and mechanical. Lenis makes it feel like you're scrolling on butter.

```js
import Lenis from '@studio-freight/lenis';

const lenis = new Lenis({
  lerp: 0.1,    // lower = smoother/slower (0.0–1.0)
  smooth: true,
});

// Connect Lenis to GSAP's ticker for synchronized animations
gsap.ticker.add((time) => {
  lenis.raf(time * 1000);
});
gsap.ticker.lagSmoothing(0);
```

**`lerp` (Linear Interpolation):** The scroll position moves toward the target position by 10% each frame. This creates the easing effect. At `lerp: 0.1`, if you're 100px away from target, you move 10px this frame, 9px next, 8.1px after — decelerating naturally.

---

## 29. Intersection Observer API

**What it is:** A browser API that fires a callback when an element enters or leaves the viewport.

This is what powers scroll-triggered animations without GSAP (or you can use it alongside GSAP):

```js
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target); // stop watching once revealed
    }
  });
}, {
  threshold: 0.1  // fire when 10% of the element is visible
});

document.querySelectorAll('[data-reveal]').forEach(el => observer.observe(el));
```

---

## 30. Dark Mode — The Full Pattern

**Step 1 — Tailwind config:**
```js
// tailwind.config.js
module.exports = {
  darkMode: 'class', // apply dark mode via a CSS class, not OS preference
  // ...
}
```

**Step 2 — JS toggle:**
```js
// public/js/darkMode.js
const toggle = document.getElementById('theme-toggle');
const html   = document.documentElement;

// On load — restore preference
if (localStorage.theme === 'dark') html.classList.add('dark');

// On click — toggle + save
toggle.addEventListener('click', () => {
  html.classList.toggle('dark');
  localStorage.theme = html.classList.contains('dark') ? 'dark' : 'light';
});
```

**Step 3 — Use `dark:` prefix in Tailwind:**
```html
<body class="bg-white dark:bg-[#0a0a0f]">
<p class="text-gray-900 dark:text-gray-100">
```

---

## 31. Custom Cursor

**What it is:** Replacing the browser's default cursor with a custom animated one.

```css
/* Hide default cursor */
*, *::before, *::after { cursor: none; }

.cursor {
  position: fixed;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--accent);
  pointer-events: none;
  z-index: 9999;
  transition: transform 0.2s ease;
}

.cursor--hover {
  transform: scale(3);
  background: transparent;
  border: 1.5px solid var(--accent);
}
```

```js
// public/js/cursor.js
const cursor = document.querySelector('.cursor');

document.addEventListener('mousemove', e => {
  gsap.to(cursor, { x: e.clientX - 6, y: e.clientY - 6, duration: 0.15 });
});

document.querySelectorAll('a, button').forEach(el => {
  el.addEventListener('mouseenter', () => cursor.classList.add('cursor--hover'));
  el.addEventListener('mouseleave', () => cursor.classList.remove('cursor--hover'));
});
```

---

## 32. Scroll Progress Bar

**What it is:** A thin bar at the top of the page that fills as the user scrolls.

```js
window.addEventListener('scroll', () => {
  const scrollTop    = document.documentElement.scrollTop;
  const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
  const progress     = (scrollTop / scrollHeight) * 100;
  document.getElementById('scroll-bar').style.width = progress + '%';
});
```

```html
<div id="scroll-bar" class="fixed top-0 left-0 h-[3px] bg-violet-500 z-50 transition-all"></div>
```

---

# PART 10 — DEPLOYMENT

## 33. MongoDB Atlas

**What it is:** MongoDB hosted in the cloud — your database runs on their servers, not your laptop.

1. Create account at mongodb.com/atlas
2. Create a free M0 cluster
3. Create a database user (username + password)
4. Whitelist IPs: `0.0.0.0/0` (allow all — required for Render)
5. Get the connection string: `mongodb+srv://username:password@cluster.../portfolio`
6. Put this string in your `.env` as `MONGO_URI`

---

## 34. Render

**What it is:** A cloud platform that runs your Node.js app (like Heroku, but free tier still exists).

1. Push your code to GitHub
2. Create a new "Web Service" on Render → connect your GitHub repo
3. Build command: `npm install && npm run build:css`
4. Start command: `node app.js`
5. Add all your `.env` variables in the Render dashboard → Environment
6. Deploy — Render gives you a URL like `your-portfolio.onrender.com`

**Important:** Render's free tier spins down after 15 minutes of inactivity. First request after that takes ~30 seconds. For a portfolio, this is acceptable. For production apps, use a paid tier or add a cron health-check ping.

---

## 35. Git & .gitignore

**What to NEVER commit:**
```
# .gitignore
node_modules/
.env
public/css/output.css    ← generate this during build, don't commit
uploads/
```

**What to always commit:**
- `.env.example` (template without values)
- `public/css/input.css` (your Tailwind source)
- `tailwind.config.js`
- All your actual code

---

# PART 11 — ADMIN ARCHITECTURE

## 36. Seed Script

**What it is:** A script you run once to populate your database with initial data.

Instead of manually creating projects through the admin panel during development, write a seed script:

```js
// seeds/seed.js
require('dotenv').config();
const mongoose = require('mongoose');
const Project  = require('../models/Project');
const User     = require('../models/User');
const bcrypt   = require('bcrypt');

const run = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Project.deleteMany();

  await Project.create([
    {
      title: 'RentChat RAG Chatbot',
      slug:  'rentchat-rag-chatbot',
      category: 'AI/ML',
      featured: true,
      // ...
    }
  ]);

  // Create admin user
  await User.deleteMany();
  await User.create({
    username:     'admin',
    passwordHash: await bcrypt.hash('your_strong_password', 12)
  });

  console.log('Seeded successfully');
  process.exit();
};

run();
```

Run with: `node seeds/seed.js`

---

## 37. Error Handling — The Full Pattern

```js
// middleware/catchAsync.js
module.exports = fn => (req, res, next) => fn(req, res, next).catch(next);

// middleware/errorHandler.js
module.exports = (err, req, res, next) => {
  const status  = err.status || 500;
  const message = err.message || 'Something went wrong';

  console.error(err.stack);

  res.status(status).render('pages/error', { status, message });
};
```

```js
// app.js — after all routes
app.use((req, res) => res.status(404).render('pages/error', { status: 404, message: 'Page not found' }));
app.use(require('./middleware/errorHandler'));
```

Every async controller wraps with `catchAsync`. Any thrown error falls through to `errorHandler`. Clean, consistent, no crashes.

---

# QUICK REFERENCE — Concept to Phase Mapping

| Phase | Concepts You'll Use |
|---|---|
| Phase 1 — Foundation | Node.js, Express, EJS, express-ejs-layouts, dotenv, validateEnv, Tailwind CLI |
| Phase 2 — Frontend Shell | EJS partials, Tailwind utilities, dark mode (CSS vars + localStorage), Lenis, GSAP basics, custom cursor |
| Phase 3 — Projects + Blog | Mongoose schemas, CRUD operations, slugs, `$inc` views, marked + DOMPurify, catchAsync |
| Phase 4 — All Models | More Mongoose models, MVC pattern solidified, query filtering |
| Phase 5 — Contact + Auth | Nodemailer, express-rate-limit, Passport.js, bcrypt, express-session, connect-mongo, connect-flash |
| Phase 6 — Admin | method-override, Multer → Cloudinary, isAdmin middleware, validation middleware, errorHandler |
| Phase 7 — Polish | GSAP ScrollTrigger, Intersection Observer, skeleton loaders, SEO meta tags, helmet, express-mongo-sanitize |
| Phase 8 — Deploy | MongoDB Atlas, Render, .gitignore, build commands |

---

> [!TIP]
> **Learning strategy:** Don't memorize this document. Use it as a lookup when you hit a concept in the implementation plan. Ask yourself: "What is this doing?" — then find it here. Understanding the why is more valuable than memorizing the how.
