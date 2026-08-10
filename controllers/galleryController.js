const Gallery = require('../models/Gallery');
const catchAsync = require('../middleware/catchAsync');

exports.index = catchAsync(async (req, res) => {
    const images = await Gallery.find({}).sort({ createdAt: -1 });
    res.render('pages/gallery', { title: 'Gallery', images });
});