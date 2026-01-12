"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const LPTEService_1 = tslib_1.__importDefault(require("../eventbus/LPTEService"));
const context = {
    module_pages: [],
    module_serves: []
};
LPTEService_1.default.on('ui', 'add-pages', (e) => {
    const newPages = e.pages;
    newPages.forEach((page) => {
        context.module_pages = context.module_pages.filter((p) => p.id !== page.id);
        context.module_pages.push({
            ...page,
            sender: e.meta.sender
        });
    });
    context.module_pages.sort((a, b) => {
        if (!a.name.startsWith('LoL') &&
            !a.name.startsWith('Valo') &&
            (b.name.startsWith('LoL') || b.name.startsWith('Valo'))) {
            return -1;
        }
        if ((a.name.startsWith('LoL') || a.name.startsWith('Valo')) &&
            !b.name.startsWith('LoL') &&
            !b.name.startsWith('Valo')) {
            return 1;
        }
        else if (a.name > b.name)
            return 1;
        else if (a.name < b.name)
            return -1;
        return 0;
    });
});
LPTEService_1.default.on('ui', 'add-serves', (e) => {
    const newServes = e.serves;
    newServes.forEach((serve) => {
        context.module_serves = context.module_serves.filter((s) => s.id !== serve.id);
        context.module_serves.push({
            ...serve,
            sender: e.meta.sender
        });
    });
});
exports.default = context;
//# sourceMappingURL=globalContext.js.map