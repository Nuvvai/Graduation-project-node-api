import { NextFunction, Request, Response } from 'express';

/**
 * Represents a custom error with an optional status code.
 * 
 * @interface CustomError
 * @extends {Error}
 * 
 * @property {number} [statusCode] - Optional HTTP status code associated with the error.
 * 
 * @HazemSabry
 */
interface CustomError extends Error {
  /**
   * Optional HTTP status code associated with the error.
   */
  statusCode?: number;
}

/**
 * middleware Server error Handler.
 * 
 * @param err  the cached error.
 * @returns A promise that resolves to the cached error object with the error message and status code returned from the server error handler.
 * 
 * @HazemSabry
 */
const errorHandler = async (err: CustomError, req: Request, res: Response, next:NextFunction): Promise<void> => {
  if (!err) {
    next();
  }
  // Log the error to the console for debugging purposes
  console.error(err.stack);

  const statusCode:number = err.statusCode || 500;

  const message: string = statusCode === 500
    ? 'Internal Server Error'
    : err.message;

  res.status(statusCode).json({
    success: false,
    message: message,
    // Include stack trace in development mode for debugging
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
}

export default errorHandler;