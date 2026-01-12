"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LPTEService = void 0;
const tslib_1 = require("tslib");
const LPTE_1 = require("../core/eventbus/LPTE");
const jwt_decode_1 = tslib_1.__importDefault(require("jwt-decode"));
// Setup toasts
if (window.toastr !== undefined) {
    ;
    window.toastr.options = {
        timeOut: '0',
        extendedTimeOut: '0',
        showDuration: '0',
        hideDuration: '0',
        positionClass: 'toast-top-right'
    };
}
class FrontendRegistration extends LPTE_1.Registration {
    constructor() {
        super(...arguments);
        this.isOnce = false;
    }
    getSubscribeEvent() {
        return {
            meta: {
                namespace: 'lpte',
                type: this.isOnce ? 'subscribe-once' : 'subscribe',
                version: 1
            },
            to: {
                namespace: this.namespace,
                type: this.type
            }
        };
    }
}
function randomId() {
    const uint32 = window.crypto.getRandomValues(new Uint32Array(1))[0];
    return uint32.toString(16);
}
/**
 * This is the frontend library that is compatible with the backend syntax. It connects via websocket.
 */
class LPTEService {
    constructor(backend) {
        this.registrations = [];
        this.backend = backend;
        this.websocket = new WebSocket(backend);
        this._log = this._log.bind(this);
        this._onSocketOpen = this._onSocketOpen.bind(this);
        this._onSocketClose = this._onSocketClose.bind(this);
        this._onSocketError = this._onSocketError.bind(this);
        this._onSocketMessage = this._onSocketMessage.bind(this);
        this._reconnect = this._reconnect.bind(this);
        this._connect = this._connect.bind(this);
        this._connect();
    }
    _log(msg) {
        console.log(`[LPTE] ${msg}`);
    }
    _onSocketOpen() {
        this._log('Websocket connected');
        // redo any registrations, in case this is a reconnect
        this.registrations.forEach((reg) => { this.websocket.send(JSON.stringify(reg.getSubscribeEvent())); });
        if (this.readyHandler !== undefined) {
            this.readyHandler();
        }
    }
    _onSocketClose() {
        this._log('Websocket closed, attempting reconnect in 500ms');
        setTimeout(this._reconnect, 500);
    }
    _onSocketError(e) {
        this._log(`Websocket error: ${JSON.stringify(e)}`);
    }
    _onSocketMessage(e) {
        const event = JSON.parse(e.data);
        this.registrations
            .filter((reg) => reg.namespace === event.meta.namespace && reg.type === event.meta.type)
            .forEach((reg) => {
            reg.handle(event);
        });
    }
    _reconnect() {
        this.websocket = new WebSocket(this.backend);
        this._connect();
    }
    _connect() {
        this.websocket.onopen = this._onSocketOpen;
        this.websocket.onclose = this._onSocketClose;
        this.websocket.onerror = this._onSocketError;
        this.websocket.onmessage = this._onSocketMessage;
    }
    onready(handler) {
        if (this.websocket.readyState === this.websocket.OPEN) {
            handler();
        }
        else {
            this.readyHandler = handler;
        }
    }
    unregisterHandler(handler) {
        setTimeout(() => {
            this.registrations = this.registrations.filter((registration) => registration.handle !== handler);
        }, 1000);
    }
    on(namespace, type, handler, isOnce = false) {
        const registration = new FrontendRegistration(namespace, type, handler);
        registration.isOnce = isOnce;
        this.registrations.push(registration);
        this.websocket.send(JSON.stringify(registration.getSubscribeEvent()));
    }
    unregister(namespace, type) {
        this._log('Unregister is currently not supported');
    }
    emit(event) {
        this.websocket.send(JSON.stringify(event));
    }
    async request(event, timeout = 5000) {
        const reply = `${event.meta.type}-${randomId()}`;
        event.meta.reply = reply;
        event.meta.channelType = LPTE_1.EventType.REQUEST;
        setTimeout(() => {
            this.emit(event);
        }, 0);
        try {
            return await this.await('reply', reply, timeout);
        }
        catch {
            throw new Error('request timed out');
        }
    }
    async await(namespace, type, timeout = 5000) {
        return await new Promise((resolve, reject) => {
            let wasHandled = false;
            const handler = (e) => {
                if (wasHandled) {
                    return;
                }
                wasHandled = true;
                this.unregisterHandler(handler);
                resolve(e);
            };
            // Register handler
            this.on(namespace, type, handler, true);
            setTimeout(() => {
                if (wasHandled) {
                    return;
                }
                wasHandled = true;
                this.unregisterHandler(handler);
                reject(new Error('request timed out'));
            }, timeout);
        });
    }
    async prompt(prompt, timeout) {
        this._log('Unregister is currently not supported');
        return undefined;
    }
}
exports.LPTEService = LPTEService;
const apiKey = getApiKey();
const wsUrl = `ws${location.origin.startsWith('https://') ? 's' : ''}://${location.host}/eventbus`;
const backend = apiKey !== null ? `${wsUrl}?apikey=${apiKey}` : wsUrl;
function getApiKey() {
    if (getCookie('auth_disabled') === 'true') {
        return null;
    }
    const queryKey = new URLSearchParams(window.location.search).get('apikey');
    if (queryKey !== null)
        return queryKey;
    const cookieKey = getCookie('access_token');
    if (cookieKey !== '') {
        const decoded = (0, jwt_decode_1.default)(cookieKey);
        return decoded.apiKey;
    }
    return null;
}
/**
 *
 * @deprecated will be replaced with getServerURL for better use
 */
function getWebServerPort() {
    return `${location.host}`;
}
function getServerURL() {
    const protocol = location.protocol;
    const host = location.host;
    return `${protocol}//${host}`;
}
function getModuleURL() {
    const protocol = location.protocol;
    const host = location.host;
    const path = location.pathname;
    return `${protocol}//${host}${path}`;
}
async function getActionLink(namespace, type, params) {
    const protocol = location.protocol;
    const host = location.host;
    const urlParams = new URLSearchParams();
    for (const param in params) {
        urlParams.set(param, params[param]);
    }
    if (apiKey !== null) {
        urlParams.set('apikey', apiKey);
    }
    const url = `${protocol}//${host}/api/events/shortcut/ingest/${namespace}/${type}?${urlParams.toString()}`;
    await navigator.clipboard.writeText(url);
}
function getCookie(cname) {
    const name = `${cname}=`;
    const decodedCookie = decodeURIComponent(document.cookie);
    const ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return '';
}
window.LPTE = new LPTEService(backend);
window.apiKey = apiKey;
window.constants = {
    getApiKey,
    getServerURL,
    getModuleURL,
    getWebServerPort
};
window.getActionLink = getActionLink;
//# sourceMappingURL=frontend-lib.js.map