"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LPTEService = exports.isValidEvent = void 0;
const tslib_1 = require("tslib");
const LPTE_1 = require("./LPTE");
const logging_1 = tslib_1.__importDefault(require("../logging"));
const server_1 = require("../web/server");
const uniqid_1 = tslib_1.__importDefault(require("uniqid"));
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const timeoutPrompt_1 = require("../logging/timeoutPrompt");
const log = (0, logging_1.default)('lpte-svc');
inquirer_1.default.registerPrompt('timeout-confirm', timeoutPrompt_1.TimeoutConfirmPrompt);
const isValidEvent = (event) => {
    if (event.meta === undefined ||
        event.meta.namespace === undefined ||
        event.meta.type === undefined) {
        return false;
    }
    return true;
};
exports.isValidEvent = isValidEvent;
class LPTEService {
    constructor() {
        this.registrations = [];
        this.eventHistory = [];
        this.await = this.await.bind(this);
    }
    initialize() {
        log.info('Initialized event bus.');
    }
    on(namespace, type, handler) {
        const registration = new LPTE_1.Registration(namespace, type, handler);
        this.registrations.push(registration);
        log.debug(`New event handler registered: namespace=${namespace}, type=${type}`);
    }
    once(namespace, type, handler) {
        const wrappedHandler = (e) => {
            log.debug(`Wrapped handler called for ${namespace}/${type}`);
            this.unregisterHandler(wrappedHandler);
            handler(e);
        };
        this.on(namespace, type, wrappedHandler);
    }
    async request(event, timeout = 5000) {
        const reply = event.meta.reply ?? `${event.meta.type}-${(0, uniqid_1.default)()}`;
        event.meta.reply = reply;
        event.meta.channelType = LPTE_1.EventType.REQUEST;
        event.replay = (data) => {
            this.emit({
                meta: {
                    type: reply,
                    namespace: 'reply',
                    version: 1
                },
                ...data
            });
        };
        this.emit(event);
        try {
            return await this.await('reply', reply, timeout);
        }
        catch {
            log.error(`Request timed out after ${timeout}ms. Request meta=${JSON.stringify(event.meta)}`);
            return undefined;
        }
    }
    async await(namespace, type, timeout = 5000) {
        return await new Promise((resolve, reject) => {
            let wasHandled = false;
            timeout = timeout > 60000 ? 60000 : timeout < 1000 ? 1000 : timeout;
            const handler = (e) => {
                if (wasHandled) {
                    return;
                }
                wasHandled = true;
                this.unregisterHandler(handler);
                resolve(e);
            };
            // Register handler
            this.on(namespace, type, handler);
            setTimeout(() => {
                if (wasHandled) {
                    return;
                }
                wasHandled = true;
                this.unregisterHandler(handler);
                log.warn(`Awaiting event timed out. namespace=${namespace}, type=${type}, timeout=${timeout}`);
                reject(new Error('request timed out'));
            }, timeout);
        });
    }
    unregister(namespace, type) {
        this.registrations = this.registrations.filter((registration) => registration.namespace !== namespace && registration.type !== type);
    }
    unregisterHandler(handler) {
        setTimeout(() => {
            this.registrations = this.registrations.filter((registration) => registration.handle !== handler);
        }, 1000);
    }
    emit(event) {
        if (!(0, exports.isValidEvent)(event)) {
            return;
        }
        setTimeout(() => {
            // Find matching handlers
            const handlers = this.registrations.filter((registration) => registration.namespace === event.meta.namespace &&
                registration.type === event.meta.type);
            log.debug(`Found ${handlers.length} matching handlers for ${event.meta.namespace}/${event.meta.type}`);
            handlers.forEach((handler) => {
                try {
                    handler.handle(event);
                }
                catch (e) {
                    log.error('Uncaught error in handler: ', e);
                    console.error(e);
                }
            });
            if (handlers.length === 0 &&
                event.meta.channelType === LPTE_1.EventType.REQUEST) {
                log.warn(`Request was sent, but no handler was executed. This will result in a timeout. Meta=${JSON.stringify(event.meta)}`);
            }
            // Push to websockets (currently only for logs)
            if (event.meta.namespace === 'log') {
                server_1.wsClients.forEach((socket) => {
                    socket.send(JSON.stringify(event));
                });
            }
            // Push to history
            // this.eventHistory.push(event)
        }, 0);
    }
    async prompt(prompt, timeout) {
        if (timeout === undefined) {
            return await inquirer_1.default.prompt(prompt.questions, prompt.initialAnswers);
        }
        else {
            // @ts-expect-error custom type not implemented
            return await inquirer_1.default.prompt({
                ...prompt.questions,
                timeout,
                type: 'timeout-confirm'
            }, prompt.initialAnswers);
        }
    }
    forPlugin(plugin) {
        const enrichEvent = (event) => {
            return {
                ...event,
                meta: {
                    channelType: LPTE_1.EventType.BROADCAST,
                    ...event.meta,
                    sender: {
                        name: plugin.getModule().getName(),
                        version: plugin.getModule().getVersion(),
                        mode: "PLUGIN" /* ModuleType.PLUGIN */,
                        path: plugin.getModule().getFolder()
                    }
                }
            };
        };
        return {
            ...this,
            emit: (event) => {
                // Enrich with sender information
                this.emit(enrichEvent(event));
            },
            on: this.on,
            unregister: this.unregister,
            request: async (event, timeout) => {
                // Enrich with sender information
                return await this.request(enrichEvent(event), timeout);
            },
            await: this.await,
            prompt: this.prompt
        };
    }
}
exports.LPTEService = LPTEService;
const svc = new LPTEService();
exports.default = svc;
//# sourceMappingURL=LPTEService.js.map