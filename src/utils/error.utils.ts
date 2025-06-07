/**
 * Custom API Error class
 */
export class ApiError extends Error {
  statusCode: number;
  isOperational: boolean;

  constructor(statusCode: number, message: string, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Create a 404 Not Found error
 */
export const notFound = (message = 'Resource not found') => {
  return new ApiError(404, message);
};

/**
 * Create a 400 Bad Request error
 */
export const badRequest = (message = 'Bad request') => {
  return new ApiError(400, message);
};

/**
 * Create a 401 Unauthorized error
 */
export const unauthorized = (message = 'Unauthorized') => {
  return new ApiError(401, message);
};

/**
 * Create a 403 Forbidden error
 */
export const forbidden = (message = 'Forbidden') => {
  return new ApiError(403, message);
};

/**
 * Create a 500 Internal Server Error
 */
export const internal = (message = 'Internal server error') => {
  return new ApiError(500, message, false);
}; 