// ─── Environment ──────────────────────────────────────────────
require('dotenv').config();
require('./middleware/validateEnv')();

// ─── Imports ──────────────────────────────────────────────────
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const { MongoStore } = require('connect-mongo');
const passport = require('passport');
const flash = require('connect-flash');
const methodOverride = require('method-override');
const helmet = require('helmet');
const mongoSanitize = require('@exortek/express-mongo-sanitize');
const connectDB = require('./config/db');

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
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
});

// ─── Routes ───────────────────────────────────────────────────
app.use('/', require('./routes/index'));
app.use('/projects', require('./routes/projects'));
app.use('/blogs', require('./routes/blogs'));
app.use('/experience', require('./routes/experience'));
app.use('/gallery', require('./routes/gallery'));
app.use('/contact', require('./routes/contact'));
app.use('/', require('./routes/auth'));
app.use('/admin', require('./routes/admin'));

// ─── 404 ──────────────────────────────────────────────────────
app.use((req, res) => {
    res.status(404).render('pages/error', { title: '404', status: 404, message: 'Page not found' });
});

// ─── Error Handler ────────────────────────────────────────────
app.use(require('./middleware/errorHandler'));

// ─── Start Server ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on http://localhost:${PORT}`));