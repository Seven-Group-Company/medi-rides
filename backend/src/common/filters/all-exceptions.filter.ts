import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { QueryFailedError } from 'typeorm';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  private readonly logger = new Logger(AllExceptionsFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let error = 'Internal Server Error';
    let details: any = null;

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const response = exception.getResponse();
      
      if (typeof response === 'string') {
        message = response;
        error = response;
      } else if (typeof response === 'object') {
        message = (response as any).message || message;
        error = (response as any).error || error;
        details = (response as any).details || null;
      }
    } else if (exception instanceof QueryFailedError) {
      // Handle database errors
      status = HttpStatus.BAD_REQUEST;
      message = 'Database operation failed';
      error = 'Database Error';
      
      // Extract useful information from database errors
      const driverError = (exception as any).driverError;
      if (driverError?.code === '23505') {
        message = 'Duplicate entry found';
        error = 'Conflict';
        details = 'A record with this information already exists';
      } else if (driverError?.code === '23503') {
        message = 'Referenced record not found';
        error = 'Foreign Key Violation';
        details = 'The referenced record does not exist';
      } else if (driverError?.code === '23502') {
        message = 'Required field missing';
        error = 'NotNull Violation';
        details = 'A required field was not provided';
      }
    } else if (exception instanceof Error) {
      // Handle generic errors
      message = exception.message;
      error = exception.name;
      
      // Handle specific common errors
      if (exception.name === 'ValidationError') {
        status = HttpStatus.BAD_REQUEST;
        error = 'Validation Error';
      } else if (exception.name === 'UnauthorizedError') {
        status = HttpStatus.UNAUTHORIZED;
        error = 'Unauthorized';
      } else if (exception.name === 'ForbiddenError') {
        status = HttpStatus.FORBIDDEN;
        error = 'Forbidden';
      } else if (exception.name === 'NotFoundError') {
        status = HttpStatus.NOT_FOUND;
        error = 'Not Found';
      }
    }

    // Log the error with context
    this.logError(exception, request, status);

    // Construct error response
    const errorResponse = {
      success: false,
      message,
      error,
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      ...(details && { details }),
      ...(process.env.NODE_ENV === 'development' && {
        stack: exception instanceof Error ? exception.stack : undefined,
      }),
    };

    // Remove stack trace in production
    if (process.env.NODE_ENV !== 'development') {
      delete (errorResponse as any).stack;
    }

    response.status(status).json(errorResponse);
  }

  private logError(exception: unknown, request: Request, status: number) {
    const logContext = {
      timestamp: new Date().toISOString(),
      method: request.method,
      url: request.url,
      statusCode: status,
      userAgent: request.headers['user-agent'],
      ip: request.ip,
    };

    if (status >= 500) {
      // Server errors - log as error
      this.logger.error(
        `${request.method} ${request.url} ${status}`,
        exception instanceof Error ? exception.stack : String(exception),
        JSON.stringify(logContext),
      );
    } else if (status >= 400) {
      // Client errors - log as warn
      this.logger.warn(
        `${request.method} ${request.url} ${status} - ${exception instanceof Error ? exception.message : String(exception)}`,
        JSON.stringify(logContext),
      );
    } else {
      // Other errors - log as debug
      this.logger.debug(
        `${request.method} ${request.url} ${status}`,
        JSON.stringify(logContext),
      );
    }
  }
}