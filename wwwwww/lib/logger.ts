// Advanced logging system
// In production, use a proper logging service like Winston, Pino, or Sentry

export enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug',
}

interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
  error?: Error;
  requestId?: string;
  userId?: string;
  sessionId?: string;
}

interface PerformanceMetrics {
  duration: number;
  memoryUsage?: NodeJS.MemoryUsage;
  cpuUsage?: NodeJS.CpuUsage;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development';
  private isProduction = process.env.NODE_ENV === 'production';
  private logBuffer: LogEntry[] = [];
  private maxBufferSize = 1000;

  private formatMessage(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
    requestId?: string,
    userId?: string
  ): LogEntry {
    return {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      error: error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : undefined,
      requestId,
      userId,
    };
  }

  private log(
    level: LogLevel,
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
    requestId?: string,
    userId?: string
  ): void {
    const logEntry = this.formatMessage(level, message, context, error, requestId, userId);

    // Dodaj do bufora
    this.logBuffer.push(logEntry);
    if (this.logBuffer.length > this.maxBufferSize) {
      this.logBuffer.shift();
    }

    // Console output for development
    if (this.isDevelopment) {
      const consoleMethod =
        level === LogLevel.ERROR
          ? 'error'
          : level === LogLevel.WARN
            ? 'warn'
            : level === LogLevel.INFO
              ? 'info'
              : 'log';

      const logMessage = `[${logEntry.timestamp}] ${level.toUpperCase()}: ${message}`;
      const logData = {
        context: logEntry.context,
        error: logEntry.error,
        requestId: logEntry.requestId,
        userId: logEntry.userId,
      };

      console[consoleMethod](logMessage, logData);
    }

    // In production, you would send logs to a logging service
    if (this.isProduction) {
      this.sendToLoggingService(logEntry);
    }
  }

  private async sendToLoggingService(logEntry: LogEntry): Promise<void> {
    try {
      // Configure Pino transport for production logging
      if (this.isProduction && process.env.LOG_TRANSPORT === 'pino') {
        await this.sendToPino(logEntry);
      } else if (this.isProduction && process.env.LOG_TRANSPORT === 'sentry') {
        await this.sendToSentry(logEntry);
      } else {
        // Fallback to basic external service
        if (logEntry.level === LogLevel.ERROR) {
          await this.sendCriticalError(logEntry);
        } else if (logEntry.level === LogLevel.WARN) {
          await this.sendWarning(logEntry);
        }
      }
    } catch (error) {
      console.error('Failed to send log to external service:', error);
    }
  }

  private async sendToPino(logEntry: LogEntry): Promise<void> {
    // Pino configuration for structured logging
    // In production, this would be configured with proper transports
    const pinoLog = {
      level: logEntry.level,
      time: logEntry.timestamp,
      msg: logEntry.message,
      ...logEntry.context,
      ...(logEntry.error && { err: logEntry.error }),
      ...(logEntry.requestId && { requestId: logEntry.requestId }),
      ...(logEntry.userId && { userId: logEntry.userId }),
      service: 'pigeon-auction-platform',
      environment: process.env.NODE_ENV,
    };

    // Send to Pino transport (would be configured in production)
    if (process.env.PINO_TRANSPORT_URL) {
      try {
        await fetch(process.env.PINO_TRANSPORT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(pinoLog),
        });
      } catch (error) {
        console.error('Failed to send to Pino transport:', error);
      }
    }
  }

  private async sendToSentry(logEntry: LogEntry): Promise<void> {
    // Sentry integration for error tracking
    if (logEntry.level === LogLevel.ERROR && process.env.SENTRY_DSN) {
      try {
        await fetch(process.env.SENTRY_DSN, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...logEntry,
            level: 'error',
            tags: {
              service: 'pigeon-auction-platform',
              environment: process.env.NODE_ENV,
            },
          }),
        });
      } catch (error) {
        console.error('Failed to send to Sentry:', error);
      }
    }
  }

  private async sendCriticalError(logEntry: LogEntry): Promise<void> {
    if (process.env.ERROR_REPORTING_URL) {
      try {
        await fetch(process.env.ERROR_REPORTING_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.ERROR_REPORTING_TOKEN}`,
          },
          body: JSON.stringify({
            ...logEntry,
            severity: 'critical',
            service: 'pigeon-auction-platform',
            environment: process.env.NODE_ENV,
          }),
        });
      } catch (error) {
        console.error('Failed to send critical error report:', error);
      }
    }
  }

  private async sendWarning(logEntry: LogEntry): Promise<void> {
    if (process.env.WARNING_REPORTING_URL) {
      try {
        await fetch(process.env.WARNING_REPORTING_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...logEntry,
            severity: 'warning',
            service: 'pigeon-auction-platform',
          }),
        });
      } catch (error) {
        console.error('Failed to send warning report:', error);
      }
    }
  }

  // Basic logging methods
  error(
    message: string,
    context?: Record<string, unknown>,
    error?: Error,
    requestId?: string,
    userId?: string
  ): void {
    this.log(LogLevel.ERROR, message, context, error, requestId, userId);
  }

  warn(
    message: string,
    context?: Record<string, unknown>,
    requestId?: string,
    userId?: string
  ): void {
    this.log(LogLevel.WARN, message, context, undefined, requestId, userId);
  }

  info(
    message: string,
    context?: Record<string, unknown>,
    requestId?: string,
    userId?: string
  ): void {
    this.log(LogLevel.INFO, message, context, undefined, requestId, userId);
  }

  debug(
    message: string,
    context?: Record<string, unknown>,
    requestId?: string,
    userId?: string
  ): void {
    this.log(LogLevel.DEBUG, message, context, undefined, requestId, userId);
  }

  // Specialized logging methods
  apiRequest(
    method: string,
    url: string,
    statusCode: number,
    duration: number,
    context?: Record<string, unknown>,
    requestId?: string,
    userId?: string
  ): void {
    const level =
      statusCode >= 400 ? LogLevel.ERROR : statusCode >= 300 ? LogLevel.WARN : LogLevel.INFO;

    this.log(
      level,
      `API ${method} ${url} - ${statusCode} (${duration}ms)`,
      {
        method,
        url,
        statusCode,
        duration,
        ...context,
      },
      undefined,
      requestId,
      userId
    );
  }

  userAction(
    userId: string,
    action: string,
    context?: Record<string, unknown>,
    requestId?: string
  ): void {
    this.info(
      `User action: ${action}`,
      {
        userId,
        action,
        ...context,
      },
      requestId,
      userId
    );
  }

  databaseQuery(
    query: string,
    duration: number,
    context?: Record<string, unknown>,
    requestId?: string
  ): void {
    const level = duration > 1000 ? LogLevel.WARN : LogLevel.DEBUG;

    this.log(
      level,
      `Database query executed in ${duration}ms`,
      {
        query: query.substring(0, 100) + (query.length > 100 ? '...' : ''),
        duration,
        ...context,
      },
      undefined,
      requestId
    );
  }

  authenticationEvent(
    event: string,
    userId?: string,
    context?: Record<string, unknown>,
    requestId?: string
  ): void {
    this.info(
      `Authentication: ${event}`,
      {
        userId,
        event,
        ...context,
      },
      requestId,
      userId
    );
  }

  businessEvent(
    event: string,
    context?: Record<string, unknown>,
    requestId?: string,
    userId?: string
  ): void {
    this.info(`Business event: ${event}`, context, requestId, userId);
  }

  performanceMetrics(
    operation: string,
    metrics: PerformanceMetrics,
    context?: Record<string, unknown>,
    requestId?: string
  ): void {
    this.info(
      `Performance: ${operation}`,
      {
        operation,
        ...metrics,
        ...context,
      },
      requestId
    );
  }

  securityEvent(
    event: string,
    context?: Record<string, unknown>,
    requestId?: string,
    userId?: string
  ): void {
    this.warn(
      `Security event: ${event}`,
      {
        event,
        ...context,
      },
      requestId,
      userId
    );
  }

  // Utility methods
  getLogBuffer(): LogEntry[] {
    return [...this.logBuffer];
  }

  clearLogBuffer(): void {
    this.logBuffer = [];
  }

  getStats(): { totalLogs: number; errors: number; warnings: number; info: number; debug: number } {
    const stats = {
      totalLogs: this.logBuffer.length,
      errors: 0,
      warnings: 0,
      info: 0,
      debug: 0,
    };

    for (const log of this.logBuffer) {
      switch (log.level) {
        case LogLevel.ERROR:
          stats.errors++;
          break;
        case LogLevel.WARN:
          stats.warnings++;
          break;
        case LogLevel.INFO:
          stats.info++;
          break;
        case LogLevel.DEBUG:
          stats.debug++;
          break;
      }
    }

    return stats;
  }
}

// Export singleton instance
export const logger = new Logger();

// Helper functions for common logging patterns
export const logError = (
  message: string,
  error?: Error,
  context?: Record<string, unknown>,
  requestId?: string,
  userId?: string
) => {
  logger.error(message, context, error, requestId, userId);
};

export const logApiRequest = (
  method: string,
  url: string,
  statusCode: number,
  duration: number,
  context?: Record<string, unknown>,
  requestId?: string,
  userId?: string
) => {
  logger.apiRequest(method, url, statusCode, duration, context, requestId, userId);
};

export const logUserAction = (
  userId: string,
  action: string,
  context?: Record<string, unknown>,
  requestId?: string
) => {
  logger.userAction(userId, action, context, requestId);
};

export const logDatabaseQuery = (
  query: string,
  duration: number,
  context?: Record<string, unknown>,
  requestId?: string
) => {
  logger.databaseQuery(query, duration, context, requestId);
};

export const logAuthenticationEvent = (
  event: string,
  userId?: string,
  context?: Record<string, unknown>,
  requestId?: string
) => {
  logger.authenticationEvent(event, userId, context, requestId);
};

export const logBusinessEvent = (
  event: string,
  context?: Record<string, unknown>,
  requestId?: string,
  userId?: string
) => {
  logger.businessEvent(event, context, requestId, userId);
};

export const logPerformanceMetrics = (
  operation: string,
  metrics: PerformanceMetrics,
  context?: Record<string, unknown>,
  requestId?: string
) => {
  logger.performanceMetrics(operation, metrics, context, requestId);
};

export const logSecurityEvent = (
  event: string,
  context?: Record<string, unknown>,
  requestId?: string,
  userId?: string
) => {
  logger.securityEvent(event, context, requestId, userId);
};
