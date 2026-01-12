"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const express_1 = require("express");
const ModuleService_1 = tslib_1.__importDefault(require("../../modules/ModuleService"));
exports.default = (globalContext) => {
    const router = (0, express_1.Router)();
    router.get('/', async (req, res) => {
        res.render('modules', {
            ...globalContext,
            title: 'Modules',
            moduleCount: ModuleService_1.default.modules.length,
            installedModules: {
                Plugins: ModuleService_1.default.modules.filter((m) => m.getName().startsWith('plugin')),
                'League Modules': ModuleService_1.default.modules.filter((m) => m.getName().includes('league')),
                'Valo Modules': ModuleService_1.default.modules.filter((m) => m.getName().includes('valo')),
                Other: ModuleService_1.default.modules.filter((m) => !m.getName().startsWith('theme') &&
                    !m.getName().includes('valo') &&
                    !m.getName().includes('league') &&
                    !m.getName().startsWith('plugin'))
            },
            availableModuleCount: ModuleService_1.default.assets.length,
            availableModules: {
                Plugins: ModuleService_1.default.assets.filter((m) => m.name.startsWith('plugin')),
                'League Modules': ModuleService_1.default.assets.filter((m) => m.name.includes('league')),
                'Valo Modules': ModuleService_1.default.assets.filter((m) => m.name.includes('valo')),
                Other: ModuleService_1.default.assets.filter((m) => !m.name.startsWith('theme') &&
                    !m.name.includes('valo') &&
                    !m.name.includes('league') &&
                    !m.name.startsWith('plugin'))
            }
        });
    });
    router.get('/api', (req, res) => {
        res.json(ModuleService_1.default.modules.map((module) => module.toJson()));
    });
    return router;
};
//# sourceMappingURL=modules.js.map