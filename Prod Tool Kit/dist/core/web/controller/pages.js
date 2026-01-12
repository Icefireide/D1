"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const path_1 = require("path");
const send_1 = tslib_1.__importDefault(require("send"));
const ModuleService_1 = tslib_1.__importDefault(require("../../modules/ModuleService"));
const promises_1 = require("fs/promises");
const fs_extra_1 = require("fs-extra");
const escape_1 = tslib_1.__importDefault(require("validator/lib/escape"));
exports.default = (globalContext) => {
    const router = (0, express_1.Router)();
    router.get('/:page*', async (req, res) => {
        const anyParams = req.params;
        const page = globalContext.module_pages.find((p) => p.id === anyParams?.page);
        if (page === undefined) {
            return res
                .status(404)
                .send(`No page found with name ${(0, escape_1.default)(anyParams?.page)}`);
        }
        const relativePath = anyParams?.[0] !== '' ? anyParams?.[0] : '/';
        const absolutePath = (0, path_1.join)(page.sender.path, page.frontend, relativePath);
        const relativeCheck = (0, path_1.relative)(ModuleService_1.default.getModulePath(), absolutePath);
        if (relativeCheck.startsWith('..') || (0, path_1.isAbsolute)(relativeCheck)) {
            return res.status(400).send();
        }
        if (!(await (0, fs_extra_1.pathExists)(absolutePath))) {
            return res.status(404).send();
        }
        if (relativePath === '/') {
            let fileContent;
            try {
                fileContent = await (0, promises_1.readFile)((0, path_1.join)(absolutePath, 'index.html'), {
                    encoding: 'utf8'
                });
            }
            catch (e) {
                res.status(500).send(e.message);
                console.error(e);
                return;
            }
            res.render('page_template', {
                ...globalContext,
                fileContent,
                title: page.name,
                pageName: page.id
            });
        }
        else {
            (0, send_1.default)(req, absolutePath).pipe(res);
        }
    });
    return router;
};
//# sourceMappingURL=pages.js.map