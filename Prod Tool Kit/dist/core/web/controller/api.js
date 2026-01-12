"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const LPTEService_1 = tslib_1.__importDefault(require("../../eventbus/LPTEService"));
const router = (0, express_1.Router)();
router.post('/events/ingest', (req, res) => {
    LPTEService_1.default.emit(req.body);
    res.status(200).send({});
});
router.get('/events/shortcut/ingest/:namespace/:type', (req, res) => {
    LPTEService_1.default.emit({
        meta: {
            namespace: req.params.namespace,
            type: req.params.type,
            version: 1
        },
        ...req.query
    });
    res.status(200).send({});
});
router.post('/events/shortcut/ingest/:namespace/:type', (req, res) => {
    LPTEService_1.default.emit({
        meta: {
            namespace: req.params.namespace,
            type: req.params.type,
            version: 1
        },
        ...req.body
    });
    res.status(200).send({});
});
router.post('/events/request', async (req, res) => {
    const response = await LPTEService_1.default.request(req.body);
    if (response != null) {
        return res.status(200).send(response);
    }
    return res.status(500).send({
        error: 'request timed out'
    });
});
router.get('/events/shortcut/request/:namespace/:type', async (req, res) => {
    const response = await LPTEService_1.default.request({
        meta: {
            namespace: req.params.namespace,
            type: req.params.type,
            version: 1
        }
    }, isNaN(parseInt(req.query.timeout))
        ? 1000
        : parseInt(req.query.timeout));
    if (response != null) {
        return res.status(200).send(response);
    }
    return res.status(500).send({
        error: 'request timed out'
    });
});
exports.default = router;
//# sourceMappingURL=api.js.map