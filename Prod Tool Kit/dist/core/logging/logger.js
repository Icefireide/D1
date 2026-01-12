"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.eventbusTransport = exports.EventbusTransport = void 0;
const tslib_1 = require("tslib");
const winston_1 = tslib_1.__importDefault(require("winston"));
const winston_transport_1 = tslib_1.__importDefault(require("winston-transport"));
const customFormat = winston_1.default.format.printf(({ level, message, label, timestamp }) => `${timestamp} [${level.padEnd(15)}] ${`\u001b[95m${label}\u001b[39m`.padEnd(22)}: ${message}`);
class EventbusTransport extends winston_transport_1.default {
    constructor(opts = {}) {
        super(opts);
        this.log = this.log.bind(this);
    }
    log(info, callback) {
        if (info.level.includes('error') && this.lpte != null) {
            this.lpte.emit({
                meta: {
                    namespace: 'log',
                    type: 'message',
                    version: 1
                },
                log: info
            });
        }
        callback();
    }
}
exports.EventbusTransport = EventbusTransport;
exports.eventbusTransport = new EventbusTransport();
exports.eventbusTransport.setMaxListeners(100);
const createLogger = (label) => winston_1.default.createLogger({
    level: process.env.LOGLEVEL ?? 'info',
    defaultMeta: { label },
    transports: [
        new winston_1.default.transports.File({
            filename: 'logs/error.log',
            level: 'error',
            zippedArchive: true,
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(info => `${info.timestamp} [${info.level}] ${info.label}: ${info.message}`))
        }),
        new winston_1.default.transports.File({
            filename: 'logs/logs.log',
            zippedArchive: true,
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.printf(info => `${info.timestamp} [${info.level}] ${info.label}: ${info.message}`))
        }),
        new winston_1.default.transports.Console({
            format: winston_1.default.format.combine(winston_1.default.format.timestamp(), winston_1.default.format.colorize(), customFormat)
        }),
        exports.eventbusTransport
    ]
});
exports.default = (label) => createLogger(label);
//# sourceMappingURL=logger.js.map