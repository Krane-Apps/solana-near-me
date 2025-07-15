import { APP_CONFIG } from './constants';

export enum LogLevel {
  DEBUG = 'DEBUG',
  INFO = 'INFO',
  WARN = 'WARN',
  ERROR = 'ERROR',
}

interface LogEntry {
  level: LogLevel;
  fileName: string;
  message: string;
  data?: any;
  timestamp: string;
}

class Logger {
  private isDev: boolean;

  constructor() {
    this.isDev = APP_CONFIG.DEV_MODE;
  }

  private formatLog(entry: LogEntry): string {
    return `[${entry.timestamp}] ${entry.level} ${entry.fileName}: ${entry.message}`;
  }

  private log(level: LogLevel, fileName: string, message: string, data?: any): void {
    if (!this.isDev) return;

    const entry: LogEntry = {
      level,
      fileName,
      message,
      data,
      timestamp: new Date().toISOString(),
    };

    const formattedMessage = this.formatLog(entry);

    switch (level) {
      case LogLevel.DEBUG:
        console.log(formattedMessage, data || '');
        break;
      case LogLevel.INFO:
        console.info(formattedMessage, data || '');
        break;
      case LogLevel.WARN:
        console.warn(formattedMessage, data || '');
        break;
      case LogLevel.ERROR:
        console.error(formattedMessage, data || '');
        break;
    }
  }

  debug(fileName: string, message: string, data?: any): void {
    this.log(LogLevel.DEBUG, fileName, message, data);
  }

  info(fileName: string, message: string, data?: any): void {
    this.log(LogLevel.INFO, fileName, message, data);
  }

  warn(fileName: string, message: string, data?: any): void {
    this.log(LogLevel.WARN, fileName, message, data);
  }

  error(fileName: string, message: string, data?: any): void {
    this.log(LogLevel.ERROR, fileName, message, data);
  }
}

export const logger = new Logger(); 