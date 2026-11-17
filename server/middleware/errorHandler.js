/**
 * Centralized Error Handling Middleware
 * Intercepts errors and returns uniform JSON responses.
 */
const errorHandler = (err, req, res, next) => {
  console.error('[Error Details]', err);

  let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  let message = err.message || 'Internal Server Error';

  // 1. Mongoose Bad ObjectId (CastError)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = `Invalid format for field '${err.path}': '${err.value}' is not a valid ObjectId.`;
  }

  // 2. Mongoose Duplicate Key Error (E11000)
  if (err.code === 11000) {
    statusCode = 409;
    const duplicatedKeys = Object.keys(err.keyValue || {}).join(', ');
    message = `Duplicate field value entered: A resource already exists with the same ${duplicatedKeys}.`;
  }

  // 3. Mongoose Validation Error
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const validationErrors = Object.values(err.errors).map((e) => e.message);
    message = `Validation Failed: ${validationErrors.join('; ')}`;
  }

  // 4. Custom Cross-Tenant or Business Logic Errors
  if (err.message && err.message.includes('Cross-tenant')) {
    statusCode = 403;
  }

  res.status(statusCode).json({
    success: false,
    error: message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

module.exports = errorHandler;
