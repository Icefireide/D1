"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const LPTEService_1 = tslib_1.__importDefault(require("../../eventbus/LPTEService"));
exports.default = (globalContext) => {
    const router = (0, express_1.Router)();
    const getKeys = async () => {
        const res = await LPTEService_1.default.request({
            meta: {
                type: 'request',
                namespace: 'plugin-database',
                version: 1
            },
            collection: 'key',
            limit: 30
        });
        if (res === undefined)
            return [];
        return res.data;
    };
    router.get('/', async (req, res) => {
        res.render('keys', {
            ...globalContext,
            title: 'Api Keys',
            keys: await getKeys()
        });
    });
    router.get('/api', (req, res) => {
        res.json(async () => await getKeys());
    });
    return router;
};
//# sourceMappingURL=keys.js.map