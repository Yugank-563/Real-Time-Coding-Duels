const errorHandler = (err, req, res, _next) => {
  let status = err.status || err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  const isValidationError =
    err.name === 'ZodError' || err.issues || (err.errors && Array.isArray(err.errors));

  if (isValidationError) {
    status = 400;
    const errors = err.issues || err.errors;
    if (Array.isArray(errors) && errors[0]) {
      const issue = errors[0];
      // Zod produces code:'invalid_type' with no 'received' key for missing required fields
      // Use the field name from the path to build a human-readable "X is required" message
      const isMissingField =
        issue.code === 'invalid_type' &&
        issue.path &&
        issue.path.length > 0 &&
        issue.message.includes('received undefined');

      if (isMissingField) {
        const fieldName = issue.path[issue.path.length - 1];
        message = `${fieldName.charAt(0).toUpperCase() + fieldName.slice(1)} is required`;
      } else {
        message = issue.message;
      }
    }
  }

  // Handle Mongoose / MongoDB errors
  if (err.name === 'CastError') {
    status = 400;
    message = `Invalid ${err.path}: ${err.value}`;
  } else if (err.code === 11000) {
    status = 409;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate field value entered for: ${field}. Please use another value.`;
  } else if (err.name === 'ValidationError') {
    status = 400;
    const messages = Object.values(err.errors).map((val) => val.message);
    message = messages.join('. ');
  }

  if (typeof message === 'string' && message.startsWith('[') && message.includes('"message":')) {
    try {
      const parsed = JSON.parse(message);
      if (Array.isArray(parsed) && parsed[0]?.message) {
        message = parsed[0].message;
      }
    } catch {
      // Not valid JSON or parsing failed, keep the original message
    }
  }

  // Determine error short message based on HTTP status code
  let errorTitle = "Internal Server Error";
  if (status === 400) errorTitle = "Bad Request";
  if (status === 401) errorTitle = "Unauthorized";
  if (status === 403) errorTitle = "Forbidden";
  if (status === 404) errorTitle = "Not Found";
  if (status === 409) errorTitle = "Conflict";
  if (status === 429) errorTitle = "Too Many Requests";

  if (status === 500 && process.env.NODE_ENV === 'production') {
    message = "An unexpected internal server error occurred.";
  }

  // Never expose stack traces or internal details in production
  if (process.env.NODE_ENV === 'development') {
    console.error(err.stack);
  }

  res.status(status).json({
    status: status,
    error: errorTitle,
    message: message,
    timestamp: new Date().toISOString()
  });
};

export default errorHandler;
