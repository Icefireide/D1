"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ModuleService = void 0;
const tslib_1 = require("tslib");
const promises_1 = require("fs/promises");
const path_1 = require("path");
const LPTEService_1 = tslib_1.__importDefault(require("../eventbus/LPTEService"));
const logging_1 = tslib_1.__importDefault(require("../logging"));
const Module_1 = tslib_1.__importStar(require("./Module"));
const LPTE_1 = require("../eventbus/LPTE");
const install_1 = require("../../scripts/install");
const readdirPromise = promises_1.readdir;
const statPromise = promises_1.stat;
const log = (0, logging_1.default)('module-svc');
class ModuleService {
    constructor() {
        this.modules = [];
        this.assets = [];
        this.activePlugins = [];
    }
    async initialize() {
        log.info('Initializing module service.');
        // Register event handlers
        LPTEService_1.default.on('lpt', 'plugin-status-change', (event) => {
            // Get the plugin
            const plugin = this.activePlugins.filter((plugin) => plugin.getModule().getName() === event.meta.sender.name)[0];
            // Check if we need to adapt the status here
            if (plugin.status !== event.status) {
                log.info(`Plugin status changed: plugin=${plugin.getModule().getName()}, old=${plugin.status}, new=${event.status}`);
                plugin.status = event.status;
            }
            // Check if all plugins are ready now
            if (this.activePlugins.filter((plugin) => plugin.status === Module_1.PluginStatus.UNAVAILABLE).length === 0) {
                // Loading complete
                LPTEService_1.default.emit({
                    meta: {
                        namespace: 'lpt',
                        type: 'ready',
                        version: 1,
                        channelType: LPTE_1.EventType.BROADCAST
                    }
                });
                log.debug('All plugins ready.');
            }
        });
        LPTEService_1.default.on('lpt', 'update-plugin', async (e) => {
            const activeIndex = this.activePlugins.findIndex((a) => a.module.getName() === e.name);
            const moduleIndex = this.modules.findIndex((a) => a.getName() === e.name);
            const active = this.activePlugins[activeIndex];
            if (active.module.asset !== undefined) {
                this.activePlugins.splice(activeIndex, 1);
                this.modules.splice(moduleIndex, 1);
                await this.install(active.module.asset);
                log.info(`plugin ${e.name} was updated`);
                return LPTEService_1.default.emit({
                    meta: {
                        namespace: 'lpt',
                        type: 'plugin-updated',
                        version: 1
                    },
                    name: e.name
                });
            }
            return LPTEService_1.default.emit({
                meta: {
                    namespace: 'lpt',
                    type: 'plugin updated failed',
                    version: 1
                },
                error: 'no plugin could be found with that name'
            });
        });
        LPTEService_1.default.on('lpt', 'install-plugin', async (e) => {
            const asset = this.assets.find((a) => a.name === e.name);
            if (asset !== undefined) {
                try {
                    await this.install(asset);
                    return LPTEService_1.default.emit({
                        meta: {
                            namespace: 'lpt',
                            type: 'plugin-installed',
                            version: 1
                        },
                        name: e.name
                    });
                }
                catch (_e) { }
            }
            return LPTEService_1.default.emit({
                meta: {
                    namespace: 'lpt',
                    type: 'plugin install failed',
                    version: 1
                },
                error: 'no asset could be found with that name'
            });
        });
        const modulePath = this.getModulePath();
        log.debug(`Modules path: ${modulePath}`);
        this.assets = await this.getAssets();
        // load dir and make sure plugins start loading first
        const data = (await readdirPromise(modulePath)).sort((a, b) => {
            if (a < b)
                return 1;
            else if (a > b)
                return -1;
            return 0;
        });
        const allModules = await Promise.all(data.map(async (folderName) => await this.handleFolder((0, path_1.join)(modulePath, folderName))));
        this.modules = allModules.filter((module) => module);
        log.info(`Initialized ${this.modules.length} module(s). Now loading plugins.`);
        log.debug(`Modules initialized: ${this.modules
            .map((module) => `${module.getName()}/${module.getVersion()} [${module
            .getConfig()
            .modes.join(', ')}]`)
            .join(', ')}`);
        this.activePlugins = await this.loadPlugins();
        log.info(`Loaded ${this.activePlugins.length} plugin(s).`);
        log.debug(`Plugins loaded: ${this.activePlugins
            .map((plugin) => plugin.getModule().getName())
            .join(', ')}`);
        // Launch plugins
        this.activePlugins.forEach((plugin) => {
            plugin.initialize();
        });
    }
    async getAssets() {
        return await (0, install_1.getAll)();
    }
    getModulePath() {
        return (0, path_1.join)(__dirname, '../../../modules');
    }
    async loadPlugins() {
        const possibleModules = this.modules.filter((module) => module.hasMode("PLUGIN" /* ModuleType.PLUGIN */));
        return await Promise.all(possibleModules.map(async (module) => await this.loadPlugin(module)));
    }
    async loadPlugin(module) {
        const plugin = new Module_1.Plugin(module);
        module.plugin = plugin;
        return plugin;
    }
    async handleFolder(folder) {
        const statData = await statPromise(folder);
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!statData.isDirectory()) {
            log.debug(`Expected ${folder} to be a directory, but it wasn't. Skipping.`);
            return null;
        }
        return await this.handleModule(folder);
    }
    async handleModule(folder) {
        const packageJsonPath = (0, path_1.join)(folder, 'package.json');
        let packageJsonStat;
        try {
            packageJsonStat = await statPromise(packageJsonPath);
        }
        catch {
            log.debug(`Expected ${packageJsonPath} to exist, but it didn't. Skipping.`);
            return null;
        }
        // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
        if (!packageJsonStat.isFile()) {
            log.debug(`Expected ${packageJsonPath} to be a file, but it wasn't. Skipping.`);
            return null;
        }
        // eslint-disable-next-line @typescript-eslint/no-var-requires
        const packageJson = require(packageJsonPath);
        const index = this.assets.findIndex((a) => a.name === packageJson.name);
        let asset;
        if (index !== -1) {
            asset = this.assets[index];
            this.assets.splice(index, 1);
        }
        return new Module_1.default(packageJson, folder, asset);
    }
    async install(asset) {
        try {
            await (0, install_1.download)(asset);
            const module = await this.handleFolder((0, path_1.join)(this.getModulePath(), asset.name));
            if (module === null)
                throw Error('Module could not be loaded');
            const dependencies = module.getConfig().dependencies;
            if (dependencies !== undefined && dependencies.length > 0) {
                for await (const dependency of dependencies) {
                    const activeModule = this.modules.find((m) => m.getName() === dependency);
                    if (activeModule === undefined) {
                        const asset = this.assets.find((a) => a.name === dependency);
                        log.info(`Dependency ${dependency} is not installed, therefore will be installed now`);
                        if (asset === undefined) {
                            log.error(`Dependency ${dependency} could not be installed`);
                        }
                        else {
                            await this.install(asset);
                        }
                    }
                }
            }
            const plugin = await this.loadPlugin(module);
            this.activePlugins.push(plugin);
            plugin.initialize();
            this.assets.slice(this.assets.findIndex((a) => a.name === asset.name), 1);
            module.asset = asset;
            this.modules.push(module);
            log.info(`${asset.name} was successfully installed`);
        }
        catch (error) {
            log.error(`Module ${asset.name} could not be installed: ${error.message}`);
        }
    }
}
exports.ModuleService = ModuleService;
const svc = new ModuleService();
exports.default = svc;
//# sourceMappingURL=ModuleService.js.map