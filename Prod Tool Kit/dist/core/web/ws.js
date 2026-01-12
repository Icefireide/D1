"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleClient = void 0;
const tslib_1 = require("tslib");
const LPTE_1 = require("../eventbus/LPTE");
const LPTEService_1 = tslib_1.__importStar(require("../eventbus/LPTEService"));
const logging_1 = tslib_1.__importDefault(require("../logging"));
const logger = (0, logging_1.default)('ws');
const handleClient = (socket) => {
    socket.on('message', async (e) => {
        const event = JSON.parse(e);
        if (!(0, LPTEService_1.isValidEvent)(event)) {
            logger.debug('received invalid event: ' + JSON.stringify(event));
            return;
        }
        // Check if it's a subscribe event
        if (event.meta.namespace === 'lpte' && event.meta.type === 'subscribe') {
            if (event.to.type !== undefined && event.to.namespace !== undefined) {
                LPTEService_1.default.on(event.to.namespace, event.to.type, (listenedEvent) => {
                    logger.debug(`Proxy response to WS for ${event.to.namespace} / ${event.to.type}`);
                    socket.send(JSON.stringify(listenedEvent));
                });
                return;
            }
        }
        if (event.meta.namespace === 'lpte' &&
            event.meta.type === 'subscribe-once') {
            if (event.to.type !== undefined && event.to.namespace !== undefined) {
                LPTEService_1.default.once(event.to.namespace, event.to.type, (listenedEvent) => {
                    logger.debug(`Proxy response to WS for ${event.to.namespace}/${event.to.type}`);
                    socket.send(JSON.stringify(listenedEvent));
                });
                return;
            }
        }
        if (event.meta.channelType === LPTE_1.EventType.REQUEST) {
            return await LPTEService_1.default.request(event);
        }
        LPTEService_1.default.emit(event);
    });
};
exports.handleClient = handleClient;
//# sourceMappingURL=ws.js.map