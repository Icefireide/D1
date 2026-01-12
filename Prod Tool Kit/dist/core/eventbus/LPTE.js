"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Registration = exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType["BROADCAST"] = "BROADCAST";
    EventType["REQUEST"] = "REQUEST";
    EventType["REPLY"] = "REPLY";
})(EventType || (exports.EventType = EventType = {}));
class Registration {
    constructor(namespace, type, handler) {
        this.namespace = namespace;
        this.type = type;
        this.handle = handler;
    }
}
exports.Registration = Registration;
//# sourceMappingURL=LPTE.js.map