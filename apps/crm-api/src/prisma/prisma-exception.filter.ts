import type { ArgumentsHost, ExceptionFilter } from '@nestjs/common';
import { Catch, HttpStatus } from '@nestjs/common';
import {
  PrismaClientInitializationError,
  PrismaClientKnownRequestError,
} from '@prisma/client/runtime/library';
import type { Response } from 'express';

@Catch(PrismaClientKnownRequestError, PrismaClientInitializationError)
export class PrismaExceptionFilter implements ExceptionFilter {
  catch(
    exception: PrismaClientKnownRequestError | PrismaClientInitializationError,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const prismaCode =
      exception instanceof PrismaClientKnownRequestError
        ? exception.code
        : exception.errorCode;
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = 'DATABASE_ERROR';
    let message = 'The database request could not be completed';

    if (
      exception instanceof PrismaClientInitializationError ||
      ['P1000', 'P1001', 'P1002', 'P1008', 'P1017', 'P2024'].includes(
        prismaCode ?? '',
      )
    ) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      code = 'DATABASE_UNAVAILABLE';
      message =
        'The database is unavailable. Check the API database connection.';
    } else if (['P2021', 'P2022'].includes(prismaCode ?? '')) {
      status = HttpStatus.SERVICE_UNAVAILABLE;
      code = 'DATABASE_SCHEMA_NOT_READY';
      message =
        'The database schema has not been initialized for this application version.';
    } else if (prismaCode === 'P2002') {
      status = HttpStatus.CONFLICT;
      code = 'RECORD_EXISTS';
      message = 'A record with these details already exists';
    } else if (prismaCode === 'P2025') {
      status = HttpStatus.NOT_FOUND;
      code = 'RECORD_NOT_FOUND';
      message = 'The requested record was not found';
    }

    response.status(status).json({
      statusCode: status,
      code,
      message,
    });
  }
}
