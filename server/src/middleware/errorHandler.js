// Centralised error handling: every AppError thrown by a service carries
// its own HTTP status; anything unexpected falls back to 500 and is
// logged server-side without leaking internals to the client.
function errorHandler(err, req, res, next) {
    const statusCode = err.statusCode || 500;
    if (statusCode === 500) {
        console.error(err);
    }
    res.status(statusCode).json({
        error: statusCode === 500 ? 'Internal server error.' : err.message
    });
}

function notFoundHandler(req, res) {
    res.status(404).json({ error: `No route for ${req.method} ${req.originalUrl}` });
}

module.exports = { errorHandler, notFoundHandler };
