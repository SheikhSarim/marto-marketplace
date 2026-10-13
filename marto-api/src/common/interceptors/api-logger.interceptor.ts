import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class ApiLoggerInterceptor implements NestInterceptor {
  private readonly logger = new Logger('API');

  // Project root /logs
  private readonly logDirectory = path.resolve(
    process.cwd(),
    'logs',
  );

  constructor() {
    // logs folder automatically create karega
    if (!fs.existsSync(this.logDirectory)) {
      fs.mkdirSync(this.logDirectory, {
        recursive: true,
      });
    }
  }

  intercept(
    context: ExecutionContext,
    next: CallHandler,
  ): Observable<any> {
    const request =
      context.switchToHttp().getRequest<Request>();

    const response =
      context.switchToHttp().getResponse<Response>();

    const startTime = Date.now();

    const method = request.method;
    const url = request.originalUrl || request.url;
    const ip = request.ip;

    return next.handle().pipe(
      finalize(() => {
        const duration = Date.now() - startTime;
        const statusCode = response.statusCode;

        const log = this.createLog({
          timestamp: new Date(),
          method,
          url,
          statusCode,
          duration,
          ip,
          query: request.query,
          params: request.params,
          body: request.body,
          user: (request as any).user,
        });

        // Console
        if (statusCode >= 500) {
          this.logger.error(log);
        } else if (statusCode >= 400) {
          this.logger.warn(log);
        } else {
          this.logger.log(log);
        }

        // File
        this.writeToFile(log);
      }),
    );
  }

  private createLog(data: {
    timestamp: Date;
    method: string;
    url: string;
    statusCode: number;
    duration: number;
    ip?: string;
    query?: any;
    params?: any;
    body?: any;
    user?: any;
  }): string {
    const {
      timestamp,
      method,
      url,
      statusCode,
      duration,
      ip,
      query,
      params,
      body,
      user,
    } = data;

    let status = 'SUCCESS';

    if (statusCode >= 500) {
      status = 'ERROR';
    } else if (statusCode >= 400) {
      status = 'WARNING';
    }

    const safeBody = this.sanitize(body);

    const safeUser = user
      ? {
          id: user.id,
          email: user.email,
          role: user.role,
        }
      : null;

    return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
                    API REQUEST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Time       : ${timestamp.toLocaleString()}
Method     : ${method}
URL        : ${url}
Status     : ${statusCode} (${status})
Duration   : ${duration}ms
IP         : ${ip || 'unknown'}

User       : ${JSON.stringify(safeUser, null, 2)}

Query      : ${JSON.stringify(query || {}, null, 2)}

Params     : ${JSON.stringify(params || {}, null, 2)}

Body       : ${JSON.stringify(safeBody || {}, null, 2)}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
`.trim();
  }

  /**
   * Sensitive data ko logs mein save hone se rokta hai
   */
  private sanitize(data: any): any {
    if (!data || typeof data !== 'object') {
      return data;
    }

    const sensitiveFields = [
      'password',
      'confirmPassword',
      'currentPassword',
      'newPassword',
      'token',
      'accessToken',
      'refreshToken',
      'authorization',
      'cookie',
      'secret',
    ];

    const result = Array.isArray(data)
      ? [...data]
      : { ...data };

    for (const key of Object.keys(result)) {
      if (
        sensitiveFields.includes(
          key.toLowerCase(),
        )
      ) {
        result[key] = '[REDACTED]';
      } else if (
        result[key] &&
        typeof result[key] === 'object'
      ) {
        result[key] = this.sanitize(result[key]);
      }
    }

    return result;
  }

  /**
   * Daily log file create karega
   *
   * Example:
   * logs/api-2026-08-16.log
   */
  private writeToFile(log: string): void {
    const date = new Date()
      .toISOString()
      .split('T')[0];

    const fileName = `api-${date}.log`;

    const filePath = path.join(
      this.logDirectory,
      fileName,
    );

    fs.appendFile(
      filePath,
      `${log}\n\n`,
      'utf8',
      (error) => {
        if (error) {
          console.error(
            '❌ Failed to write API log:',
            error,
          );
        }
      },
    );
  }
}