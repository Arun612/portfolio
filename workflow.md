# Portfolio — Implementation Workflow
### Exactly what to do, in what order, step by step

---

> [!IMPORTANT]
> **Ground rules before you start**
> - Work through phases in order. Don't skip ahead.
> - After every step, test in the browser before moving to the next.
> - Commit to Git at the end of every phase.
> - If something breaks, fix it before continuing — technical debt compounds fast.

---

## Before You Write a Single Line of Code

### Tool Setup Checklist
Make sure these are installed on your machine:

| Tool | Check with | Install from |
|---|---|---|
| Node.js (v18+) | `node -v` | nodejs.org |
| npm | `npm -v` | comes with Node |
| Git | `git --version` | git-scm.com |
| VS Code | — | code.visualstudio.com |
| MongoDB Compass | — | mongodb.com/compass (optional, for visual DB inspection) |

### VS Code Extensions to Install Now
- **EJS Language Support** — syntax highlighting for `.ejs` files
- **Tailwind CSS IntelliSense** — autocomplete for Tailwind classes
- **Prettier** — auto-format on save
- **ESLint** — catch JS errors as you type
- **GitLens** — see git history inline

---

# PHASE 1 — Foundation
*Goal: A running Express server with EJS, Tailwind, and MongoDB connected*

---

### Step 1.1 — Create the project folder and initialize Git

```bash
# Navigate to where you want the project
cd "D:\OneDrive\Desktop"

# Create the folder
mkdir Portfolio
cd Portfolio

# Initialize Git
git init

# Initialize npm (accept all defaults)
npm init -y
```

---

### Step 1.2 — Install all dependencies at once

Run this once. Don't install packages one by one later.

```bash
# Production dependencies
npm install express ejs express-ejs-layouts mongoose dotenv ^
  express-session connect-mongo passport passport-local bcrypt ^
  multer cloudinary multer-storage-cloudinary marked isomorphic-dompurify ^
  method-override express-rate-limit nodemailer helmet express-mongo-sanitize ^
  connect-flash slugify

# Dev dependencies
npm install -D tailwindcss @tailwindcss/typography nodemon concurrently
```

---

### Step 1.3 — Create the full folder structure

Run this in your terminal (PowerShell):

```powershell
# Create all folders at once
New-Item -ItemType Directory -Force -Path `
  config, controllers, models, routes, middleware, utils, seeds, `
  "views/layouts", "views/partials", "views/pages/projects", `
  "views/pages/blogs", "views/pages/admin/projects", "views/pages/admin/blogs", `
  "views/pages/admin/skills", "views/pages/admin/certificates", `
  "views/pages/admin/experience", "views/pages/admin/gallery", `
  "views/pages/admin/messages", `
  "public/css", "public/js", "public/images"
```

Then create these empty files (you'll fill them in order):

```powershell
New-Item -ItemType File -Force -Path `
  app.js, .env, ".env.example", ".gitignore", `
  "config/db.js", "config/cloudinary.js", "config/passport.js", "config/mailer.js", `
  "middleware/isLoggedIn.js", "middleware/isAdmin.js", `
  "middleware/catchAsync.js", "middleware/errorHandler.js", "middleware/validateEnv.js", `
  "utils/slugify.js", "utils/renderMarkdown.js", "utils/sendEmail.js", `
  "models/User.js", "models/Project.js", "models/Blog.js", `
  "models/Skill.js", "models/Certificate.js", "models/Experience.js", `
  "models/Gallery.js", "models/Message.js", `
  "routes/index.js", "routes/projects.js", "routes/blogs.js", `
  "routes/experience.js", "routes/gallery.js", "routes/contact.js", `
  "routes/auth.js", "routes/admin.js", `
  "controllers/homeController.js", "controllers/projectController.js", `
  "controllers/blogController.js", "controllers/experienceController.js", `
  "controllers/galleryController.js", "controllers/contactController.js", `
  "controllers/adminController.js", `
  "views/layouts/main.ejs", `
  "views/partials/head.ejs", "views/partials/navbar.ejs", `
  "views/partials/footer.ejs", "views/partials/flash.ejs", `
  "views/pages/home.ejs", "views/pages/about.ejs", `
  "views/pages/experience.ejs", "views/pages/gallery.ejs", `
  "views/pages/contact.ejs", "views/pages/error.ejs", `
  "views/pages/projects/index.ejs", "views/pages/projects/show.ejs", `
  "views/pages/blogs/index.ejs", "views/pages/blogs/show.ejs", `
  "views/pages/admin/login.ejs", "views/pages/admin/dashboard.ejs", `
  "views/pages/admin/messages/index.ejs", `
  "public/css/input.css", `
  "public/js/main.js", "public/js/darkMode.js", `
  "public/js/cursor.js", "public/js/animations.js", `
  "seeds/seed.js", "tailwind.config.js"
```

✅ **Your folder structure is now created. Open VS Code: `code .`**

---

### Step 1.4 — Set up .gitignore

Open `.gitignore` and add:

```
node_modules/
.env
public/css/output.css
uploads/
.DS_Store
```

---

### Step 1.5 — Set up .env

Open `.env` and add (fill in real values as you get them):

```
PORT=3000
NODE_ENV=development
MONGO_URI=
SESSION_SECRET=pick_any_long_random_string_here_like_xkq92mvp1lz
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=
EMAIL_PASS=
ADMIN_EMAIL=
```

Open `.env.example` and add the same keys but with empty values (this file is safe to commit).

---

### Step 1.6 — Set up Tailwind CSS

Open `tailwind.config.js`:

```js
module.exports = {
  content: ['./views/**/*.ejs', './public/js/**/*.js'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        accent: '#6c63ff',
      },
      fontFamily: {
        display: ['"Space Grotesk"', 'sans-serif'],
        sans: ['"Inter"', 'sans-serif'],
      },
    },
  },
  plugins: [require('@tailwindcss/typography')],
};
```

Open `public/css/input.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

Open `package.json` and update the scripts section:

```json
"scripts": {
  "start":     "node app.js",
  "dev":       "concurrently \"nodemon app.js\" \"npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css --watch\"",
  "build:css": "npx tailwindcss -i ./public/css/input.css -o ./public/css/output.css --minify"
}
```

---

### Step 1.7 — Write config/db.js

```js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected');
  } catch (err) {
    console.error('❌ MongoDB connection failed:', err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
```

---

### Step 1.8 — Write middleware/validateEnv.js

```js
const required = [
  'MONGO_URI',
  'SESSION_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

module.exports = () => {
  const missing = required.filter((key) => !process.env[key]);
  if (missing.length) {
    console.error(`\n❌ Missing environment variables:\n  ${missing.join('\n  ')}\n`);
    process.exit(1);
  }
};
```

---

### Step 1.9 — Write middleware/catchAsync.js

```js
module.exports = (fn) => (req, res, next) => fn(req, res, next).catch(next);
```

---

### Step 1.10 — Write middleware/errorHandler.js

```js
module.exports = (err, req, res, next) => {
  const status  = err.status  || 500;
  const message = err.message || 'Something went wrong';
  console.error(err.stack);
  res.status(status).render('pages/error', { title: 'Error', status, message });
};
```

---

### Step 1.11 — Write app.js (the core)

This is the heart of your application. Write it carefully:

```js
// ─── Environment ──────────────────────────────────────────────
require('dotenv').config();
require('./middleware/validateEnv')();

// ─── Imports ──────────────────────────────────────────────────
const express        = require('express');
const expressLayouts = require('express-ejs-layouts');
const session        = require('express-session');
const MongoStore     = require('connect-mongo');
const passport       = require('passport');
const flash          = require('connect-flash');
const methodOverride = require('method-override');
const helmet         = require('helmet');
const mongoSanitize  = require('express-mongo-sanitize');
const connectDB      = require('./config/db');

// ─── App Init ─────────────────────────────────────────────────
const app = express();
connectDB();

// ─── Security Middleware ──────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false })); // CSP off for now (Tailwind CDN compat)
app.use(mongoSanitize());

// ─── Body Parsing ─────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));

// ─── Static Files ─────────────────────────────────────────────
app.use(express.static('public'));

// ─── View Engine ──────────────────────────────────────────────
app.use(expressLayouts);
app.set('view engine', 'ejs');
app.set('views', './views');
app.set('layout', 'layouts/main');

// ─── Sessions ─────────────────────────────────────────────────
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl: process.env.MONGO_URI }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }, // 7 days
}));

// ─── Passport ─────────────────────────────────────────────────
require('./config/passport');
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

// ─── Global template variables ────────────────────────────────
app.use((req, res, next) => {
  res.locals.currentUser = req.user || null;
  res.locals.success      = req.flash('success');
  res.locals.error        = req.flash('error');
  next();
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/',           require('./routes/index'));
app.use('/projects',   require('./routes/projects'));
app.use('/blogs',      require('./routes/blogs'));
app.use('/experience', require('./routes/experience'));
app.use('/gallery',    require('./routes/gallery'));
app.use('/contact',    require('./routes/contact'));
app.use('/',           require('./routes/auth'));
app.use('/admin',      require('./routes/admin'));

// ─── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).render('pages/error', { title: '404', status: 404, message: 'Page not found' });
});

// ─── Error Handler ────────────────────────────────────────────
app.use(require('./middleware/errorHandler'));

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));
```

---

### Step 1.12 — Write a stub route to test everything

Open `routes/index.js`:

```js
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.send('Server is working!'); // temporary, replace in Phase 2
});

module.exports = router;
```

---

### Step 1.13 — Write a stub layout and test

Open `views/layouts/main.ejs`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Portfolio</title>
  <link rel="stylesheet" href="/css/output.css" />
</head>
<body>
  <%- body %>
</body>
</html>
```

---

### ✅ Phase 1 Checkpoint

Run: `npm run dev`

You should see:
- Terminal: `✅ MongoDB connected` and `🚀 Server running on http://localhost:3000`
- Browser at `localhost:3000`: "Server is working!"
- No errors in terminal

**If MongoDB fails:** Check your `MONGO_URI` in `.env`. Make sure you've created an Atlas cluster and added your IP to the whitelist.

**Commit before moving on:**
```bash
git add .
git commit -m "Phase 1: Foundation — Express, EJS, Tailwind, MongoDB connected"
```

---

# PHASE 2 — Frontend Shell
*Goal: All pages exist, design system is in place, navbar/footer working, dark mode working*

**Write these files in this order:**

### Step 2.1 — MongoDB Atlas Setup (if not done)
1. Go to [mongodb.com/atlas](https://mongodb.com/atlas) → Create free account
2. Create a free M0 cluster (any region close to you)
3. Create a database user: Database Access → Add New Database User
4. Whitelist your IP: Network Access → Add IP Address → `0.0.0.0/0`
5. Get connection string: Connect → Drivers → copy the string
6. Replace `<password>` with your DB user password
7. Add `/portfolio` before the `?` (this is the DB name)
8. Paste into `.env` as `MONGO_URI`

---

### Step 2.2 — Design system in input.css

Add your CSS variables and base styles to `public/css/input.css`:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --accent:     #6c63ff;
    --accent-glow: rgba(108, 99, 255, 0.3);
  }

  html {
    scroll-behavior: smooth;
  }

  *, *::before, *::after {
    cursor: none; /* custom cursor */
  }
}
```

---

### Step 2.3 — Write views/partials/head.ejs

This partial handles dynamic SEO meta tags. Every route passes `title` and `description`:

```html
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="description" content="<%= typeof description !== 'undefined' ? description : 'Portfolio of a full-stack developer' %>" />
<meta property="og:title" content="<%= typeof title !== 'undefined' ? title : 'Portfolio' %>" />
<meta property="og:description" content="<%= typeof description !== 'undefined' ? description : '' %>" />
<meta property="og:image" content="<%= typeof ogImage !== 'undefined' ? ogImage : '/images/og-default.jpg' %>" />
<title><%= typeof title !== 'undefined' ? title + ' | Your Name' : 'Your Name — Portfolio' %></title>
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;500;600&family=JetBrains+Mono&display=swap" rel="stylesheet" />
<link rel="stylesheet" href="/css/output.css" />
```

---

### Step 2.4 — Write the main layout (views/layouts/main.ejs)

Replace the stub with the full layout once you have partials ready.

---

### Step 2.5 — Write stub controllers for all routes

For every controller file, write a basic stub so no route crashes:

```js
// controllers/homeController.js
exports.home = (req, res) => {
  res.render('pages/home', {
    title: 'Home',
    description: 'Welcome to my portfolio'
  });
};
```

Do the same pattern for `projectController.js`, `blogController.js`, etc.

---

### Step 2.6 — Wire all routes to their controllers

Open `routes/index.js`:

```js
const express    = require('express');
const router     = express.Router();
const controller = require('../controllers/homeController');
const path       = require('path');

router.get('/',      controller.home);
router.get('/about', controller.about);
router.get('/resume', (req, res) => {
  res.download(path.join(__dirname, '../public/images/resume.pdf'));
});

module.exports = router;
```

Do the same for all other route files. **Test each route in the browser as you add it.**

---

### Step 2.7 — Write stub EJS pages

For every `.ejs` page file, write a minimum stub:

```html
<!-- views/pages/home.ejs -->
<div class="min-h-screen">
  <h1 class="text-4xl font-display text-white">Home Page</h1>
  <p>Content coming soon</p>
</div>
```

This ensures every route renders without crashing.

---

### Step 2.8 — Dark mode JS

Write `public/js/darkMode.js` (refer to concepts guide Section 30).

---

### ✅ Phase 2 Checkpoint

- Visit every route: `/`, `/about`, `/projects`, `/blogs`, `/experience`, `/gallery`, `/contact`
- None should crash (stubs are fine)
- Dark mode toggle works
- Google Fonts are loading (check Network tab in DevTools)

```bash
git commit -m "Phase 2: Frontend shell — all routes, stubs, dark mode, design system"
```

---

# PHASE 3 — Projects + Blog (Database Layer)
*Goal: Real projects and blog posts render from MongoDB*

### Step 3.1 — Write models/Project.js

Write the full Mongoose schema from the implementation plan. Refer to concepts guide Section 9.

---

### Step 3.2 — Write models/Blog.js

Same pattern as Project.

---

### Step 3.3 — Write seeds/seed.js

```js
require('dotenv').config();
const mongoose = require('mongoose');
const Project  = require('../models/Project');

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Project.deleteMany();
  await Project.insertMany([
    {
      title: 'RentChat RAG Chatbot',
      slug:  'rentchat-rag-chatbot',
      summary: 'A RAG-based chatbot for rental queries using LangChain and MongoDB.',
      category: 'AI/ML',
      techStack: ['Python', 'LangChain', 'MongoDB', 'FastAPI'],
      featured: true,
    },
    // Add all your real projects here
  ]);
  console.log('✅ Seeded');
  process.exit();
}).catch(err => { console.error(err); process.exit(1); });
```

Run it: `node seeds/seed.js`

Check MongoDB Compass or Atlas → your projects collection should have data.

---

### Step 3.4 — Write projectController.js

```js
const Project    = require('../models/Project');
const catchAsync = require('../middleware/catchAsync');

exports.listProjects = catchAsync(async (req, res) => {
  const filter = {};
  if (req.query.category) filter.category = req.query.category;

  const projects = await Project.find(filter).sort({ createdAt: -1 });
  res.render('pages/projects/index', {
    title: 'Projects',
    projects,
    currentCategory: req.query.category || 'All'
  });
});

exports.showProject = catchAsync(async (req, res) => {
  const project = await Project.findOneAndUpdate(
    { slug: req.params.slug },
    { $inc: { views: 1 } },
    { new: true }
  );
  if (!project) {
    const err = new Error('Project not found');
    err.status = 404;
    throw err;
  }
  res.render('pages/projects/show', { title: project.title, project });
});
```

---

### Step 3.5 — Write project EJS views

In `views/pages/projects/index.ejs` — loop through `projects` and render cards.
In `views/pages/projects/show.ejs` — display all project fields.

Use `<%- renderMarkdown(project.description) %>` for markdown content.

---

### Step 3.6 — Write utils/renderMarkdown.js

```js
const { marked }       = require('marked');
const createDOMPurify  = require('isomorphic-dompurify');

module.exports = (content) => {
  if (!content) return '';
  const raw   = marked(content);
  const clean = createDOMPurify.sanitize(raw);
  return clean;
};
```

Make this available in all views by adding to `app.js` global locals:

```js
const renderMarkdown = require('./utils/renderMarkdown');
app.use((req, res, next) => {
  res.locals.renderMarkdown = renderMarkdown;
  // ... other locals
  next();
});
```

---

### Step 3.7 — Do the same for Blog

Follow the exact same pattern: model → seed → controller → views.

---

### ✅ Phase 3 Checkpoint

- `/projects` shows your seeded projects from the DB
- `/projects/rentchat-rag-chatbot` shows the detail page
- Refreshing the detail page increments the view count (check Atlas)
- `/blogs` and `/blogs/:slug` work

```bash
git commit -m "Phase 3: Projects + Blog — dynamic DB rendering, markdown, view counters"
```

---

# PHASE 4 — All Other Models
*Goal: Skills, Certificates, Experience, Gallery pages render from DB*

Follow the exact same pattern for each model:
1. Write the model (`models/Skill.js`, etc.)
2. Add data to `seeds/seed.js` and re-run it
3. Write the controller
4. Update the route to use the controller
5. Write the EJS view
6. Test in browser

**Order:** Skill → Certificate → Experience → Gallery

---

### ✅ Phase 4 Checkpoint

- `/experience` shows your internships/hackathons from DB
- `/gallery` shows images from DB
- About page skills section renders from DB

```bash
git commit -m "Phase 4: All models — Experience, Gallery, Skills, Certificates from DB"
```

---

# PHASE 5 — Contact Form + Authentication
*Goal: Contact form works and emails you. Admin login works.*

### Step 5.1 — Write models/Message.js

### Step 5.2 — Write utils/sendEmail.js

Refer to concepts guide Section 21. Test by submitting the contact form.

### Step 5.3 — Write contactController.js

```js
const Message    = require('../models/Message');
const sendEmail  = require('../utils/sendEmail');
const catchAsync = require('../middleware/catchAsync');
const rateLimit  = require('express-rate-limit');

exports.contactLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 10 });

exports.showContact = (req, res) => {
  res.render('pages/contact', { title: 'Contact' });
};

exports.submitContact = catchAsync(async (req, res) => {
  const { name, email, subject, message } = req.body;
  await Message.create({ name, email, subject, message });
  await sendEmail({ name, email, subject, message });
  req.flash('success', 'Message sent! I\'ll get back to you soon.');
  res.redirect('/contact');
});
```

### Step 5.4 — Add rate limiter to contact route

```js
// routes/contact.js
router.post('/', controller.contactLimiter, controller.submitContact);
```

### Step 5.5 — Set up Gmail App Password

1. Google Account → Security → 2-Step Verification (enable if not already)
2. Google Account → Security → App Passwords
3. Generate → select "Mail" → copy the 16-char password
4. Add to `.env` as `EMAIL_PASS`

### Step 5.6 — Write models/User.js

### Step 5.7 — Add admin user to seeds/seed.js

```js
const User   = require('../models/User');
const bcrypt = require('bcrypt');

// Inside the seed function:
await User.deleteMany();
await User.create({
  username:     'admin',
  email:        'your@email.com',
  passwordHash: await bcrypt.hash('your_strong_password', 12),
  role:         'admin'
});
```

Re-run: `node seeds/seed.js`

### Step 5.8 — Write config/passport.js

Refer to concepts guide Section 13.

### Step 5.9 — Write middleware/isLoggedIn.js and isAdmin.js

```js
// middleware/isLoggedIn.js
module.exports = (req, res, next) => {
  if (req.isAuthenticated()) return next();
  req.flash('error', 'You must be logged in');
  res.redirect('/login');
};

// middleware/isAdmin.js
module.exports = (req, res, next) => {
  if (req.isAuthenticated() && req.user.role === 'admin') return next();
  res.status(403).render('pages/error', { title: 'Forbidden', status: 403, message: 'Access denied' });
};
```

### Step 5.10 — Write routes/auth.js

```js
const passport = require('passport');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({ windowMs: 15 * 60 * 1000, max: 5 });

router.get('/login', (req, res) => res.render('pages/admin/login', { title: 'Login' }));

router.post('/login', loginLimiter, passport.authenticate('local', {
  successRedirect: '/admin',
  failureRedirect: '/login',
  failureFlash:    true,
}));

router.post('/logout', (req, res) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect('/');
  });
});
```

---

### ✅ Phase 5 Checkpoint

- Submitting the contact form saves to DB AND sends you an email
- Visiting `/login` shows the login form
- Logging in with wrong credentials shows a flash error
- Logging in correctly redirects to `/admin`
- Visiting `/admin` without login redirects to `/login`

```bash
git commit -m "Phase 5: Contact form + Auth — Passport, sessions, rate limiting, Nodemailer"
```

---

# PHASE 6 — Admin Dashboard (CRUD)
*Goal: You can create, edit, delete all content from the browser — no code changes needed*

### Step 6.1 — Set up Cloudinary

1. Create free account at [cloudinary.com](https://cloudinary.com)
2. Go to Dashboard → copy Cloud Name, API Key, API Secret
3. Add to `.env`

Write `config/cloudinary.js` — refer to concepts guide Section 19.

### Step 6.2 — Build admin routes in this order

For each model (Project → Blog → Skill → Certificate → Experience → Gallery → Messages):

```
1. Add controller methods: list, showNew, create, showEdit, update, delete
2. Add routes in routes/admin.js with isLoggedIn + isAdmin guards
3. Build the admin EJS forms
4. Test each CRUD operation
```

**Admin routes template:**

```js
// routes/admin.js
const express    = require('express');
const router     = express.Router();
const isLoggedIn = require('../middleware/isLoggedIn');
const isAdmin    = require('../middleware/isAdmin');
const controller = require('../controllers/adminController');
const { storage }= require('../config/cloudinary');
const multer     = require('multer');
const upload     = multer({ storage });

// Protect all admin routes
router.use(isLoggedIn, isAdmin);

router.get('/', controller.dashboard);

// Projects
router.get('/projects',          controller.listProjects);
router.get('/projects/new',      controller.newProject);
router.post('/projects',         upload.single('coverImage'), controller.createProject);
router.get('/projects/:id/edit', controller.editProject);
router.put('/projects/:id',      upload.single('coverImage'), controller.updateProject);
router.delete('/projects/:id',   controller.deleteProject);

// ... same pattern for blogs, skills, certificates, experience, gallery, messages

module.exports = router;
```

### Step 6.3 — Admin dashboard overview

In `controllers/adminController.js`:

```js
exports.dashboard = catchAsync(async (req, res) => {
  const [projectCount, blogCount, unreadCount, recentMessages] = await Promise.all([
    Project.countDocuments(),
    Blog.countDocuments(),
    Message.countDocuments({ read: false }),
    Message.find({ read: false }).sort({ createdAt: -1 }).limit(5),
  ]);
  res.render('pages/admin/dashboard', {
    title: 'Dashboard',
    projectCount, blogCount, unreadCount, recentMessages
  });
});
```

---

### ✅ Phase 6 Checkpoint

- Log in as admin and create a new project with an image → it appears at `/projects`
- Edit the project title → change is reflected on public page
- Delete a project → it's gone from public page
- Same for blog posts
- Admin can view and mark messages as read

```bash
git commit -m "Phase 6: Admin dashboard — full CRUD for all models, Cloudinary uploads"
```

---

# PHASE 7 — Polish
*Goal: Animations, performance, SEO, and final UX touches*

### Step 7.1 — GSAP Animations
*(Hand off to design layer — I'll write this for you)*

### Step 7.2 — Lenis Smooth Scrolling
*(Hand off to design layer)*

### Step 7.3 — Custom Cursor
*(Hand off to design layer)*

### Step 7.4 — Skeleton Loaders
Add `animate-pulse` Tailwind classes as placeholders that show before content loads.

### Step 7.5 — Search
Add a search handler in `projectController.js`:
```js
if (req.query.search) {
  filter.title = { $regex: req.query.search, $options: 'i' };
}
```

### Step 7.6 — Scroll Progress Bar
*(Hand off to design layer)*

### Step 7.7 — Error pages
Flesh out `views/pages/error.ejs` to look good.

### Step 7.8 — Mobile responsive pass
Test every page at 375px (iPhone SE) width using DevTools. Fix any layout breaks.

---

### ✅ Phase 7 Checkpoint

- All animations work without janking
- Site looks good on mobile
- Search filters projects and blogs
- Error pages are styled

```bash
git commit -m "Phase 7: Polish — animations, responsive, search, error pages"
```

---

# PHASE 8 — Deploy

### Step 8.1 — Final pre-deploy checks
- [ ] `.env` is in `.gitignore` (double-check: `git status` should NOT show `.env`)
- [ ] `output.css` is in `.gitignore`
- [ ] No hardcoded passwords or API keys anywhere in code
- [ ] `seeds/seed.js` does NOT auto-run on server start

### Step 8.2 — Push to GitHub
```bash
git add .
git commit -m "Phase 8: Production ready"
git remote add origin https://github.com/yourusername/portfolio.git
git push -u origin main
```

### Step 8.3 — Deploy on Render
1. Go to [render.com](https://render.com) → New → Web Service
2. Connect your GitHub repository
3. **Build Command:** `npm install && npm run build:css`
4. **Start Command:** `node app.js`
5. **Environment Variables:** Add every key from your `.env`
6. Click **Deploy**

### Step 8.4 — MongoDB Atlas production setup
- Network Access → Add IP `0.0.0.0/0` (allow all — required for Render's dynamic IPs)
- Run your seed script once with the production `MONGO_URI`

### Step 8.5 — Test production URL
Test every route on the live Render URL. Common issues:
- Images not showing → check Cloudinary URLs in DB are full HTTPS URLs
- Session not persisting → check `SESSION_SECRET` is set in Render env vars
- DB connection failing → check `MONGO_URI` exactly matches, with the DB name

---

## The Division of Work — Quick Reference

| Phase | You Code | I Handle |
|---|---|---|
| 1 — Foundation | app.js, db.js, validateEnv, catchAsync, errorHandler | — |
| 2 — Frontend Shell | All routes, controllers, stub EJS pages | Navbar, footer, layout design, dark mode implementation |
| 3 — Projects + Blog | Models, seed script, controllers, views structure | Project card design, blog typography |
| 4 — Other Models | Models, controllers, views structure | Experience timeline design, gallery grid |
| 5 — Contact + Auth | Contact controller, Passport, auth routes, session setup | Contact form design, login page design |
| 6 — Admin Dashboard | All CRUD controllers + admin routes + form wiring | Admin sidebar, dashboard design, form styling |
| 7 — Polish | Search, mobile fixes | GSAP animations, Lenis, cursor, scroll bar, skeleton loaders |
| 8 — Deploy | Git, Render setup | — |

---

> [!TIP]
> **When to call me in:** Whenever you finish a phase's logic and need the design layer done, paste your controller output and EJS structure and say "Design this". I'll write the Tailwind/GSAP code for that section.
