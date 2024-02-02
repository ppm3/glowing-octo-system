import { debug, error, info, log, warn } from "console";

export class LoggerUtils {
    level: string;

    constructor(
        level: string,
        private readonly clog = log,
        private readonly cinfo = info,
        private readonly cwarn = warn,
        private readonly cdebug = debug,
        private readonly cerror = error
    ) {
        this.level = level.toLowerCase();
    }

    log(message: unknown, ...args: unknown[]) {
        if (this.shouldLog("log")) {
            this.clog(message, ...args);
        }
    }

    info(message: unknown, ...args: unknown[]) {
        if (this.shouldLog("info")) {
            this.cinfo(message, ...args);
        }
    }

    warn(message: unknown, ...args: unknown[]) {
        if (this.shouldLog("warn")) {
            this.cwarn(message, ...args);
        }
    }

    debug(message: unknown, ...args: unknown[]) {
        if (this.shouldLog("debug")) {
            this.cdebug(message, ...args);
        }
    }

    error(message: unknown, ...args: unknown[]) {
        if (this.shouldLog("error")) {
            this.cerror(message, ...args);
        }
    }

    private shouldLog(logLevel: string) {
        const levels = ["log", "debug", "info", "warn", "error"];
        const logLevelIndex = levels.indexOf(logLevel);
        const currentLevelIndex = levels.indexOf(this.level);
        return currentLevelIndex >= logLevelIndex;
    }
}
