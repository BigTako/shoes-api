import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
} from '@nestjs/common';
import { Response } from 'express';

interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string[];
}

/**
 * Global exception filter. Catches all exceptions and returns a formatted response.
 * In development mode also console log exceptions.
 */
@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    let res: ErrorResponse = {} as ErrorResponse;
    let status: number = 400;

    if (!(exception instanceof HttpException)) {
      res.error = 'Bad Request';
      res.statusCode = 400;
      if (exception.code === '23505') {
        // duplicate fields
        const regex = /\(([^)]+)\)=\(([^)]+)\)/;
        const match = exception.detail.match(regex);
        if (match) {
          const key = match[1]; // "email"
          const value = match[2]; // "van2@gmail.com"
          res.message = [`${key} ${value} already exists`];
        }
      } else {
        res.message = [
          `Error ${exception.status || 500}: ${
            exception.detail || exception.message
          }`,
        ];
      }
    } else {
      status = exception.getStatus();
      res = exception.getResponse() as ErrorResponse;
      res.message = Array.isArray(res.message) ? res.message : [res.message];
    }

    if (process.env.NODE_ENV !== 'development') {
      console.log(exception);
    }

    return response.status(status).json(res);
  }
}
