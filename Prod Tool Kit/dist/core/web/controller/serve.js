"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const ModuleService_1 = tslib_1.__importDefault(require("../../modules/ModuleService"));
const send_1 = tslib_1.__importDefault(require("send"));
const escape_1 = tslib_1.__importDefault(require("validator/lib/escape"));
exports.default = (globalContext) => {
    const router = (0, express_1.Router)();
    router.get('/:serve*', async (req, res) => {
        const anyParams = req.params;
        const serve = globalContext.module_serves.filter((p) => p.id === anyParams?.serve)[0];
        if (serve === undefined) {
            return res
                .status(404)
                .send(`No serve found with name ${(0, escape_1.default)(anyParams?.serve)}`);
        }
        const relativePath = anyParams?.[0] !== '' ? anyParams?.[0] : '/';
        const absolutePath = (0, path_1.join)(serve.sender.path, serve.frontend, relativePath);
        const relativeCheck = (0, path_1.relative)(ModuleService_1.default.getModulePath(), absolutePath);
        if (relativeCheck.startsWith('..') || (0, path_1.isAbsolute)(relativeCheck)) {
            return res.status(400).send();
        }
        if (!(await (0, fs_extra_1.pathExists)(absolutePath))) {
            return res.status(404).send();
        }
        (0, send_1.default)(req, absolutePath).pipe(res);
    });
    return router;
};
//# sourceMappingURL=serve.js.map