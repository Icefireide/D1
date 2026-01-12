"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const path_1 = require("path");
module.exports = (ctx) => {
    const configLocation = process.env.CONFIG || (0, path_1.join)(__dirname, '..', 'config.json');
    const rawConfig = (0, fs_1.readFileSync)(configLocation);
    const config = JSON.parse(rawConfig.toString());
    const namespace = ctx.plugin.module.getName();
    ctx.LPTE.on(namespace, 'request', (e) => {
        ctx.LPTE.emit({
            meta: {
                type: e.meta.reply,
                namespace: 'reply',
                version: 1
            },
            config: config[e.meta.sender.name]
        });
    });
    ctx.LPTE.on(namespace, 'set', async (e) => {
        if (config[e.meta.sender.name] === undefined) {
            config[e.meta.sender.name] = e.config;
        }
        else {
            for (const key of Object.keys(e.config)) {
                config[e.meta.sender.name][key] = e.config[key];
            }
        }
        try {
            await (0, promises_1.writeFile)(configLocation, JSON.stringify(config, null, 2));
            ctx.log.info('config for ' + e.meta.sender.name + ' saved!');
        }
        catch (error) {
            ctx.log.error('config for ' + e.meta.sender.name + ` could not be saved! ${error}`);
        }
    });
    // Emit event that we're ready to operate
    ctx.LPTE.emit({
        meta: {
            type: 'plugin-status-change',
            namespace: 'lpt',
            version: 1
        },
        status: 'RUNNING'
    });
};
//# sourceMappingURL=plugin.js.map