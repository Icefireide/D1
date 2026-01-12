"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const path_1 = require("path");
const promises_1 = require("fs/promises");
const fs_extra_1 = require("fs-extra");
const sass_1 = require("sass");
let themes;
const getThemes = async (ctx) => {
    const themesPath = (0, path_1.join)(__dirname, '../themes');
    const themes = [];
    const dir = await (0, promises_1.opendir)(themesPath);
    for await (const folder of dir) {
        if (!folder.isDirectory())
            continue;
        const themePath = (0, path_1.join)(themesPath, folder.name);
        let themeConfig;
        let scss;
        try {
            themeConfig = require((0, path_1.join)(themePath, 'theme.json'));
            scss = await (0, promises_1.readFile)((0, path_1.join)(themePath, 'index.scss'), 'utf-8');
        }
        catch (e) {
            ctx.log.warn(`Failed to load theme in ${themePath}`, e);
            continue;
        }
        const theme = {
            config: themeConfig,
            folder: themePath,
            scss,
            id: folder.name
        };
        themes.push(theme);
    }
    return themes;
};
/**
 * Returns the currently active theme, by reading the 'id' file on the file system,
 * or null if there currently is no theme active
 */
const getActiveTheme = async () => {
    const idFilePath = (0, path_1.join)(__dirname, '../frontend/active/id');
    try {
        await (0, promises_1.stat)(idFilePath);
    }
    catch (e) {
        return null;
    }
    const activeTheme = (await (0, promises_1.readFile)(idFilePath, 'utf-8')).trim();
    return activeTheme;
};
module.exports = async (ctx) => {
    const namespace = ctx.plugin.module.getName();
    // Register new UI page
    ctx.LPTE.emit({
        meta: {
            type: 'add-pages',
            namespace: 'ui',
            version: 1
        },
        pages: [
            {
                name: 'Theming',
                frontend: 'frontend',
                id: `op-${namespace}`
            }
        ]
    });
    let activeTheme = await getActiveTheme();
    // Emit event that we're ready to operate
    ctx.LPTE.emit({
        meta: {
            type: 'plugin-status-change',
            namespace: 'lpt',
            version: 1
        },
        status: 'RUNNING'
    });
    themes = await getThemes(ctx);
    ctx.LPTE.on(namespace, 'get-themes', (event) => {
        ctx.LPTE.emit({
            meta: {
                type: event.meta.reply,
                namespace: 'reply',
                version: 1
            },
            themes,
            activeTheme
        });
    });
    ctx.LPTE.on(namespace, 'reload-themes', async (event) => {
        themes = await getThemes(ctx);
        ctx.LPTE.emit({
            meta: {
                type: event.meta.reply,
                namespace: 'reply',
                version: 1
            },
            themes,
            activeTheme
        });
    });
    ctx.LPTE.on(namespace, 'activate-theme', async (event) => {
        activeTheme = event.theme;
        const themePath = (0, path_1.join)(__dirname, '../themes/', activeTheme);
        const activePath = (0, path_1.join)(__dirname, '../frontend/active');
        const idFilePath = (0, path_1.join)(activePath, 'id');
        const gitKeepFilePath = (0, path_1.join)(activePath, '.gitkeep');
        try {
            await (0, fs_extra_1.emptyDir)(activePath);
            await (0, fs_extra_1.copy)(themePath, activePath);
            await (0, promises_1.writeFile)(idFilePath, activeTheme);
            await (0, promises_1.writeFile)(gitKeepFilePath, '');
        }
        catch (e) {
            ctx.log.error('Applying theme failed', e);
        }
        try {
            const result = await (0, sass_1.compileAsync)((0, path_1.join)(activePath, 'index.scss'));
            await (0, promises_1.writeFile)((0, path_1.join)(activePath, 'index.css'), result.css);
        }
        catch (error) {
            ctx.log.error('Failed to compile scss', error);
        }
        ctx.LPTE.emit({
            meta: {
                type: event.meta.reply,
                namespace: 'reply',
                version: 1
            },
            themes,
            activeTheme
        });
    });
};
//# sourceMappingURL=plugin.js.map