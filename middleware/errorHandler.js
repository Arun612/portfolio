module.exports = (err, req, res, next) => {
    const status = err.status || 500;
    const message = err.message || 'Something went wrong';
    console.error(err.stack);
    res.status(status).render('pages/error', { title: 'Error', status, message });
};