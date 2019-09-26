import { LogLevel } from 'src/config';
import * as std from 'tstl';
import { bool } from './types';

class LogEntry {
    private type: LogLevel;
    private data: any[];

    constructor (type: LogLevel, data: any[]) {
        this.type = type;
        this.data = data;
    }

    public log (): void {
        switch (this.type) {
            case LogLevel.LOG:
            case LogLevel.DEBUG:
            case LogLevel.INFO:
                console.log('[xts]', ...this.data);
                break;
            case LogLevel.WARN:
                console.warn('[xts]', ...this.data);
                break;
            case LogLevel.ERROR:
                console.error('[xts]', ...this.data);
                break;
        }
    }
};

export function warn(...args: any[]): void {
    console.warn(...args);
}

export class Logger {

    private static initialized: bool = false;
    private static logBuffer: bool = false;
    private static buffer: std.Vector<LogEntry> = new std.Vector<LogEntry>();
    private static logLevel: LogLevel;

    private static reset(): void {
        let config = require('../../config.json');
        switch (config.LOGLEVEL) {
            case 'DEBUG': Logger.logLevel = LogLevel.DEBUG; break;
            case 'LOG': Logger.logLevel = LogLevel.LOG; break;
            case 'WARN': Logger.logLevel = LogLevel.WARN; break;
            case 'ERROR': Logger.logLevel = LogLevel.ERROR; break;
            case 'INFO': default: Logger.logLevel = LogLevel.INFO; break;
        }
    }

    private static initialize(): void {
        if (Logger.initialized) return;
        Logger.reset();
        Logger.initialized = true;
    }

    public static setLogLevel(level: LogLevel): void {
        Logger.logLevel = level;
    }

    public static resetLogLevel(): void {
        Logger.reset();
    }

    public static flush(): void {
        Logger.initialize();
        if (!Logger.buffer.empty()) {
            for (let entry of Logger.buffer) {
                entry.log();
            }
            Logger.buffer.clear();
        }
    }

    public static bufferLength(): number {
        return Logger.buffer.size();
    }

    public static log (...args: any[]): void {
        Logger.initialize();
        const entry: LogEntry = new LogEntry(LogLevel.LOG, args);
        if (Logger.logBuffer) {
            Logger.buffer.push(entry);
            return;
        }
        entry.log();
    }

    public static assert (condition?: boolean | undefined, message?: string | undefined, ...data: any[]): void {
        console.assert(condition, message, ...data);
        if (!condition) {
            throw new Error(message);
        }
    }

    public static debug (...args: any[]): void {
        Logger.initialize();
        if (Logger.logLevel <= LogLevel.DEBUG) {
            const entry: LogEntry = new LogEntry(LogLevel.DEBUG, args);
            if (Logger.logBuffer) {
                Logger.buffer.push(entry);
                return;
            }
            entry.log();
        }
    }

    public static info (...args: any[]): void {
        Logger.initialize();
        if (Logger.logLevel <= LogLevel.INFO) {
            const entry: LogEntry = new LogEntry(LogLevel.INFO, args);
            if (Logger.logBuffer) {
                Logger.buffer.push(entry);
                return;
            }
            entry.log();
        }
    }

    public static warn (...args: any[]): void {
        Logger.initialize();
        if (Logger.logLevel <= LogLevel.WARN) {
            const entry: LogEntry = new LogEntry(LogLevel.WARN, args);
            if (Logger.logBuffer) {
                Logger.buffer.push(entry);
                return;
            }
            entry.log();
        }
    }

    public static error (...args: any[]): void {
        Logger.initialize();
        if (Logger.logLevel <= LogLevel.ERROR) {
            const entry: LogEntry = new LogEntry(LogLevel.ERROR, args);
            if (Logger.logBuffer) {
                Logger.buffer.push(entry);
                return;
            }
            entry.log();
        }
    }

    public static trace (...args: any[]): void {
        console.trace('[xts]', ...args);
    }
}