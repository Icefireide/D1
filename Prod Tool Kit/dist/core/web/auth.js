"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.runAuth = runAuth;
const tslib_1 = require("tslib");
const LPTEService_1 = tslib_1.__importDefault(require("../eventbus/LPTEService"));
const uuid_apikey_1 = tslib_1.__importDefault(require("uuid-apikey"));
const logging_1 = tslib_1.__importDefault(require("../logging"));
const jsonwebtoken_1 = tslib_1.__importDefault(require("jsonwebtoken"));
const log = (0, logging_1.default)('auth');
const allowedKeys = new Set();
let config;
async function runAuth(server, wss) {
    const configReq = await LPTEService_1.default.request({
        meta: {
            type: 'request',
            namespace: 'plugin-config',
            version: 1,
            sender: {
                name: 'auth',
                version: '1.0.0',
                mode: "STANDALONE" /* ModuleType.STANDALONE */
            }
        }
    });
    config = configReq?.config;
    const authActive = config.enabled;
    if (!authActive) {
        server.all('*', (req, res, next) => {
            res.cookie('auth_disabled', true);
            next();
        });
        return;
    }
    log.info('=========================');
    log.info('Authentication is enabled');
    allowedKeys.add(config['super-api-key']);
    log.info(`Admin API key: ${config['super-api-key']}`);
    log.info('=========================');
    wss.options.verifyClient = verifyWSClient;
    server.all('*', verifyEPClient);
    server.get('/login', (_req, res) => {
        res.render('login', {
            title: 'Login',
            version: '0.0.1'
        });
    });
    server.post('/login', login);
    server.get('/logout', logout);
    await getKeys();
}
async function getKeys() {
    const keys = await LPTEService_1.default.request({
        meta: {
            type: 'request',
            namespace: 'plugin-database',
            version: 1
        },
        collection: 'key'
    });
    if (keys === undefined || keys.data?.length <= 0)
        return;
    const cDate = new Date().getTime();
    for (const key of keys.data) {
        if (key.expiring !== -1 && key.expiring < cDate)
            continue;
        allowedKeys.add(key.apiKey);
    }
}
LPTEService_1.default.on('auth', 'add-key', (e) => {
    const { apiKey } = uuid_apikey_1.default.create();
    LPTEService_1.default.emit({
        meta: {
            namespace: 'plugin-database',
            type: 'insertOne',
            version: 1
        },
        collection: 'key',
        data: {
            apiKey: 'RCVPT-' + apiKey,
            description: e.description,
            expiring: e.neverExpires
                ? -1
                : new Date(e.expiring).getTime()
        }
    });
    allowedKeys.add('RCVPT-' + apiKey);
    LPTEService_1.default.emit({
        meta: {
            namespace: 'auth',
            type: 'update',
            version: 1
        }
    });
});
LPTEService_1.default.on('auth', 'remove-key', (e) => {
    LPTEService_1.default.emit({
        meta: {
            namespace: 'plugin-database',
            type: 'deleteOne',
            version: 1
        },
        collection: 'key',
        id: e.id
    });
    allowedKeys.delete(e.apiKey);
    LPTEService_1.default.emit({
        meta: {
            namespace: 'auth',
            type: 'update',
            version: 1
        }
    });
});
function verifyWSClient(info, done) {
    if (!verify(info.req.url)) {
        done(false, 403, 'authentication failed');
        return;
    }
    done(true);
}
function verifyEPClient(req, res, next) {
    if (req.path.startsWith('/login')) {
        next();
        return;
    }
    if (req.path.endsWith('.js') ||
        req.path.endsWith('.css') ||
        req.path.endsWith('.png') ||
        req.path.endsWith('.jpg') ||
        req.path.endsWith('.svg') ||
        req.path.endsWith('.ttf')) {
        next();
        return;
    }
    if (!verify(req.url, req.cookies)) {
        res.status(403).redirect('/login');
        return;
    }
    next();
}
function verify(url, cookies) {
    const queryString = url?.split('?')[1];
    if (queryString !== undefined) {
        const query = new URLSearchParams(queryString);
        if (query.has('apikey') && allowedKeys.has(query.get('apikey'))) {
            return true;
        }
    }
    if (cookies?.access_token !== undefined) {
        try {
            const key = jsonwebtoken_1.default.verify(cookies.access_token, config.secreteKey);
            if (key.apiKey !== undefined && allowedKeys.has(key.apiKey)) {
                return true;
            }
            return false;
        }
        catch (e) {
            log.warn(e);
            return false;
        }
    }
    return false;
}
async function login(req, res) {
    const { apiKey } = req.body;
    if (apiKey === undefined) {
        res.send('key is missing in request').status(400);
        return;
    }
    const key = await LPTEService_1.default.request({
        meta: {
            type: 'request',
            namespace: 'plugin-database',
            version: 1
        },
        collection: 'key',
        filter: (k) => k.apiKey === apiKey
    });
    if ((key?.data === undefined || key.data.length <= 0) &&
        config['super-api-key'] !== apiKey) {
        res.send('key does not exists').status(403);
        return;
    }
    const cKey = key?.data[0] ?? {
        apiKey,
        description: 'Super-Key',
        expiring: -1
    };
    const cTime = new Date().getTime();
    if (cKey.expiring < cTime && cKey.expiring !== -1) {
        res.send('key is expired').status(403);
        return;
    }
    if (!allowedKeys.has(cKey.apiKey)) {
        res.send('key is not allowed').status(403);
        return;
    }
    const token = jsonwebtoken_1.default.sign(cKey, config.secreteKey, {
        expiresIn: cKey.expiring !== -1 ? cKey.expiring - cTime : '1d'
    });
    res
        .clearCookie('auth_disabled')
        .cookie('access_token', token)
        .status(200)
        .redirect('/');
}
function logout(req, res) {
    const decoded = jsonwebtoken_1.default.decode(req.cookies.access_token);
    if (decoded !== null && typeof decoded !== 'string') {
        allowedKeys.delete(decoded.apiKey);
    }
    res.clearCookie('access_token').status(200).redirect('/login');
}
//# sourceMappingURL=auth.js.map