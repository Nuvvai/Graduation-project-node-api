import { Request, Response, NextFunction } from 'express';

interface CustomError extends Error {
  statusCode?: number;
}

function errorHandler(err:CustomError, req:Request, res:Response, next:NextFunction):void {
  // Log the error to the console for debugging purposes
  console.error(err.stack);

  const statusCode:number = err.statusCode || 500;

  const message = statusCode === 500
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