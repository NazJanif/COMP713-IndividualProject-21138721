// A small typed error so services can express what went wrong and the
// controller layer can translate it into the right HTTP status code
// instead of every layer knowing about HTTP
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);
        this.statusCode = statusCode;
    }
}

module.exports = AppError;
