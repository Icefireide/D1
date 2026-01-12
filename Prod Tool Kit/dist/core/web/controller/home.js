"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const package_json_1 = require("../../../package.json");
exports.default = (globalContext) => {
    const router = (0, express_1.Router)();
    router.get('/', (req, res) => {
        res.render('index', {
            ...globalContext,
            title: 'Home',
            version: package_json_1.version
        });
    });
    return router;
};
//# sourceMappingURL=home.js.map