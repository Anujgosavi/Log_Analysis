type LogLevel = "info" | "error" | "warn" | "debug";

interface Logger {
  info: (message: string, ...args: any[]) => void;
  error: (message: string, ...args: any[]) => void;
  warn: (message: string, ...args: any[]) => void;
  debug: (message: string, ...args: any[]) => void;
}

const formatTimestamp = (): string => {
  const now = new Date();
  return now.toISOString();
};

const formatLogMessage = (level: LogLevel, message: string, ...args: any[]): string => {
  const timestamp = formatTimestamp();
  const levelUpper = level.toUpperCase().padEnd(5);
  
  let argsStr = "";
  if (args.length > 0) {
    try {
      argsStr = args
        .map((arg) => {
          if (arg instanceof Error) {
            return `${arg.name}: ${arg.message}${arg.stack ? `\n${arg.stack}` : ""}`;
          }
          return typeof arg === "object" ? JSON.stringify(arg, null, 2) : String(arg);
        })
        .join(" ");
      argsStr = ` ${argsStr}`;
    } catch {
      argsStr = ` ${args.map((arg) => String(arg)).join(" ")}`;
    }
  }
  
  return `[${timestamp}] [${levelUpper}] ${message}${argsStr}`;
};

const logger: Logger = {
  info: (message: string, ...args: any[]) => {
    console.log(formatLogMessage("info", message, ...args));
  },
  error: (message: string, ...args: any[]) => {
    console.error(formatLogMessage("error", message, ...args));
  },
  warn: (message: string, ...args: any[]) => {
    console.warn(formatLogMessage("warn", message, ...args));
  },
  debug: (message: string, ...args: any[]) => {
    if (process.env.NODE_ENV === "development") {
      console.debug(formatLogMessage("debug", message, ...args));
    }
  },
};

export default logger;

