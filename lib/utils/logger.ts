enum LogLevel {
  DEBUG = "DEBUG",
  INFO = "INFO",
  WARN = "WARN",
  ERROR = "ERROR",
}

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  userId?: string;
  surveyId?: string;
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === "development";

  private formatLog(entry: LogEntry): string {
    const prefix = `[${entry.timestamp}] [${entry.level}]`;
    const contextParts = [];

    if (entry.userId) contextParts.push(`userId:${entry.userId}`);
    if (entry.surveyId) contextParts.push(`surveyId:${entry.surveyId}`);

    const context = contextParts.length > 0 ? ` {${contextParts.join(", ")}}` : "";

    return `${prefix}${context} ${entry.message}`;
  }

  private log(level: LogLevel, message: string, data?: any, userId?: string, surveyId?: string) {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      userId,
      surveyId,
    };

    const formatted = this.formatLog(entry);

    if (this.isDevelopment || level === LogLevel.ERROR) {
      console.log(formatted);
      if (data) console.log(data);
    }

    // TODO: Send to external logging service (e.g., Sentry, LogRocket)
  }

  debug(message: string, data?: any, userId?: string, surveyId?: string) {
    this.log(LogLevel.DEBUG, message, data, userId, surveyId);
  }

  info(message: string, data?: any, userId?: string, surveyId?: string) {
    this.log(LogLevel.INFO, message, data, userId, surveyId);
  }

  warn(message: string, data?: any, userId?: string, surveyId?: string) {
    this.log(LogLevel.WARN, message, data, userId, surveyId);
  }

  error(message: string, error?: Error | any, userId?: string, surveyId?: string) {
    this.log(LogLevel.ERROR, message, error, userId, surveyId);
  }
}

export const logger = new Logger();
