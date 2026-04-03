type LogLevel = 'error' | 'info' | 'warn';

interface LogContext {
  [key: string]: any;
}

export class Logger {
  private context: string;

  constructor(context: string) {
    this.context = context;
  }

  error(message: string, error?: Error | unknown, data?: LogContext) {
    this.log('error', message, {
      ...data,
      error: error instanceof Error
        ? {
            message: error.message,
            name: error.name,
            stack: error.stack,
          }
        : error,
    });
  }

  info(message: string, data?: LogContext) {
    this.log('info', message, data);
  }

  warn(message: string, data?: LogContext) {
    this.log('warn', message, data);
  }

  private log(level: LogLevel, message: string, data?: LogContext) {
    const timestamp = new Date().toISOString();
    const logData = {
      context: this.context,
      level,
      message,
      timestamp,
      ...data,
    };

    if (import.meta.env.PROD) {
      console[level](JSON.stringify(logData));
    }
    else {
      console[level](
        `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`,
        message,
        data || '',
      );
    }
  }
}

export const apiLogger = new Logger('API');
export const dbLogger = new Logger('Database');
export const appLogger = new Logger('Application');
