"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const ModuleService_1 = tslib_1.__importDefault(require("../../modules/ModuleService"));
exports.default = (globalContext) => {
    const router = (0, express_1.Router)();
    router.get('/', (req, res) => {
        res.render('plugins', {
            ...globalContext,
            title: 'Plugins',
            plugins: ModuleService_1.default.activePlugins
        });
    });
    router.get('/api', (req, res) => {
        res.json(ModuleService_1.default.activePlugins.map((plugin) => plugin.toJson()));
    });
    return router;
};
//# sourceMappingURL=plugins.js.map