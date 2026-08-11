const Message = require('../models/Message');
const catchAsync = require('../middleware/catchAsync');
const { sendContactNotification } = require('../utils/sendEmail');

exports.index = (req, res) => {
    res.render('pages/contact', { title: 'Contact' });
};

exports.create = catchAsync(async (req, res) => {
    const { name, email, message } = req.body;

    if (!name || !email || !message) {
        req.flash('error', 'Please fill in all fields.');
        return res.redirect('/contact');
    }

    await Message.create({ name, email, message });

    try {
        await sendContactNotification({ name, email, message });
    } catch (err) {
        console.error('Email send failed (message still saved to DB):', err.message);
    }

    req.flash('success', 'Message sent! I\'ll get back to you soon.');
    res.redirect('/contact');
});