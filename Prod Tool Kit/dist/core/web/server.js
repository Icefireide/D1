"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runServer = exports.wsClients = exports.wss = void 0;
const tslib_1 = require("tslib");
const express_1 = tslib_1.__importDefault(require("express"));
const path_1 = require("path");
const http_1 = require("http");
const WebSocket = tslib_1.__importStar(require("ws"));
const cookie_parser_1 = tslib_1.__importDefault(require("cookie-parser"));
const logging_1 = tslib_1.__importDefault(require("../logging"));
const globalContext_1 = tslib_1.__importDefault(require("./globalContext"));
const controller_1 = tslib_1.__importDefault(require("./controller"));
const ws_1 = require("./ws");
const ModuleService_1 = tslib_1.__importDefault(require("../modules/ModuleService"));
const auth_1 = require("./auth");
const express_fileupload_1 = tslib_1.__importDefault(require("express-fileupload"));
const body_parser_1 = require("body-parser");
const express_rate_limit_1 = tslib_1.__importDefault(require("express-rate-limit"));
/**
 * App Variables
 */
const log = (0, logging_1.default)('server');
const app = (0, express_1.default)();
const port = process.env.PORT ?? '3003';
const server = (0, http_1.createServer)(app);
const limiter = (0, express_rate_limit_1.default)({
    windowMs: 1 * 60 * 1000,
    max: 500,
    standardHeaders: true,
    legacyHeaders: false
});
// Apply the rate limiting middleware to all requests
app.use(limiter);
/**
 * App Configuration
 */
app.set('views', (0, path_1.join)(__dirname, 'views'));
app.set('view engine', 'pug');
app.use('/static', express_1.default.static('dist/frontend'));
app.use('/vendor/bootstrap', express_1.default.static((0, path_1.join)(__dirname, '../../../node_modules/bootstrap/dist')));
app.use('/vendor/jquery', express_1.default.static((0, path_1.join)(__dirname, '../../../node_modules/jquery/dist')));
app.use('/vendor/jspath', express_1.default.static((0, path_1.join)(__dirname, '../../../node_modules/jspath')));
app.use('/vendor/toastr', express_1.default.static((0, path_1.join)(__dirname, '../../../node_modules/toastr/build')));
app.use('/vendor/jwt-decode', express_1.default.static((0, path_1.join)(__dirname, '../../../node_modules/jwt-decode/build')));
app.use(express_1.default.json());
app.use((0, body_parser_1.urlencoded)({ extended: true }));
app.use((0, cookie_parser_1.default)());
/**
 * Websocket Server
 */
exports.wss = new WebSocket.Server({
    server,
    path: '/eventbus'
});
exports.wsClients = [];
exports.wss.on('connection', (socket, _requests) => {
    exports.wsClients.push(socket);
    log.debug('Websocket client connected');
    socket.on('close', () => {
        exports.wsClients = exports.wsClients.filter((client) => client !== socket);
        log.debug('Websocket client disconnected');
    });
    (0, ws_1.handleClient)(socket);
});
/**
 * Uploads
 */
app.use((0, express_fileupload_1.default)({
    createParentPath: true
}));
app.post('/upload', async (req, res) => {
    if (req.files === undefined) {
        return res.status(401).send('no file found');
    }
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const file = req.files?.file;
    if (file === undefined) {
        return res.status(400).send();
    }
    if (!file.mimetype.startsWith('image')) {
        return res.status(400).send();
    }
    const filename = file.name;
    const uploadPath = (0, path_1.join)(__dirname, '..', '..', '..', 'modules', req.body.path, filename);
    const relativePath = (0, path_1.relative)(ModuleService_1.default.getModulePath(), uploadPath);
    if (relativePath.startsWith('..') || (0, path_1.isAbsolute)(relativePath)) {
        return res.status(403).send();
    }
    await file.mv(uploadPath);
    res.send({
        status: true,
        message: 'File is uploaded',
        data: {
            name: file.name,
            mimetype: file.mimetype,
            size: file.size
        }
    });
});
/**
 * Run server
 */
const runServer = async () => {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    await (0, auth_1.runAuth)(app, exports.wss);
    /**
     * Routes
     */
    for (const [key, value] of Object.entries((0, controller_1.default)(globalContext_1.default))) {
        app.use(key, value);
        log.debug(`Registered route: ${key}`);
    }
    server.listen(port, () => {
        log.info(`Listening for requests on http://localhost:${port}`);
    });
};
exports.runServer = runServer;
//# sourceMappingURL=server.js.map