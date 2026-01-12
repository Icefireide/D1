"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const modules_1 = tslib_1.__importDefault(require("./modules"));
const home_1 = tslib_1.__importDefault(require("./home"));
const plugins_1 = tslib_1.__importDefault(require("./plugins"));
const events_1 = tslib_1.__importDefault(require("./events"));
const api_1 = tslib_1.__importDefault(require("./api"));
const pages_1 = tslib_1.__importDefault(require("./pages"));
const serve_1 = tslib_1.__importDefault(require("./serve"));
const keys_1 = tslib_1.__importDefault(require("./keys"));
exports.default = (globalContext) => ({
    '/': (0, home_1.default)(globalContext),
    '/modules': (0, modules_1.default)(globalContext),
    '/plugins': (0, plugins_1.default)(globalContext),
    '/events': (0, events_1.default)(globalContext),
    '/keys': (0, keys_1.default)(globalContext),
    '/pages': (0, pages_1.default)(globalContext),
    '/api': api_1.default,
    '/serve': (0, serve_1.default)(globalContext)
});
//# sourceMappingURL=index.js.map