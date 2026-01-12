"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const LPTEService_1 = tslib_1.__importDefault(require("../../eventbus/LPTEService"));
exports.default = (globalContext) => {
    const router = (0, express_1.Router)();
    router.get('/', (req, res) => {
        res.render('events', {
            ...globalContext,
            title: 'Events',
            events: LPTEService_1.default.eventHistory
        });
    });
    router.get('/api', (req, res) => {
        res.json(LPTEService_1.default.eventHistory.map((evt) => JSON.stringify(evt)));
    });
    return router;
};
//# sourceMappingURL=events.js.map