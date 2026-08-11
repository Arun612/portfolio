const rateLimit = require('express-rate-limit');

module.exports = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // max 5 submissions per IP per hour
    message: 'Too many messages sent. Please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});