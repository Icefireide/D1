"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Plugin = exports.PluginContext = exports.PluginStatus = void 0;
const tslib_1 = require("tslib");
const path_1 = require("path");
const LPTEService_1 = tslib_1.__importDefault(require("../eventbus/LPTEService"));
const logging_1 = tslib_1.__importDefault(require("../logging"));
const progress_1 = tslib_1.__importDefault(require("../logging/progress"));
const semver_1 = require("semver");
class Module {
    constructor(packageJson, folder, asset) {
        this.packageJson = packageJson;
        this.folder = folder;
        this.asset = asset;
        if (this.asset?.version !== undefined) {
            this.updateAvailable = (0, semver_1.gt)(this.asset?.version, this.packageJson.version);
        }
        else {
            this.updateAvailable = false;
        }
    }
    getName() {
        return this.packageJson.name;
    }
    getVersion() {
        return this.packageJson.version;
    }
    getNewestVersion() {
        return this.asset?.version ?? '';
    }
    getAuthor() {
        return this.packageJson.author;
    }
    getConfig() {
        return this.packageJson.toolkit;
    }
    hasMode(mode) {
        return this.getConfig().modes.includes(mode);
    }
    hasPlugin() {
        return this.plugin !== undefined;
    }
    getPlugin() {
        return this.plugin;
    }
    getFolder() {
        return this.folder;
    }
    toJson(goDeep = true) {
        return {
            name: this.getName(),
            version: this.getVersion(),
            newestVersion: this.getNewestVersion(),
            author: this.getAuthor(),
            folder: this.getFolder(),
            config: this.getConfig(),
            plugin: goDeep ? this.getPlugin()?.toJson(false) : null
        };
    }
}
exports.default = Module;
var PluginStatus;
(function (PluginStatus) {
    PluginStatus["RUNNING"] = "RUNNING";
    PluginStatus["UNAVAILABLE"] = "UNAVAILABLE";
    PluginStatus["DEGRADED"] = "DEGRADED";
})(PluginStatus || (exports.PluginStatus = PluginStatus = {}));
class PluginContext {
    constructor(plugin) {
        this.log = (0, logging_1.default)(plugin.getModule().getName());
        this.require = (file) => require((0, path_1.join)(plugin.getModule().getFolder(), file));
        this.LPTE = LPTEService_1.default.forPlugin(plugin);
        this.plugin = plugin;
        this.progress = (0, progress_1.default)(plugin.module.getName());
    }
}
exports.PluginContext = PluginContext;
class Plugin {
    constructor(module) {
        this.isLoaded = false;
        this.status = PluginStatus.UNAVAILABLE;
        this.module = module;
        this.isLoaded = true;
    }
    getModule() {
        return this.module;
    }
    getPluginConfig() {
        return this.module.getConfig().plugin;
    }
    getMain() {
        return this.getPluginConfig().main;
    }
    toJson(goDeep = true) {
        return {
            pluginConfig: this.getPluginConfig(),
            main: this.getMain(),
            module: goDeep ? this.getModule().toJson(false) : null,
            isLoaded: this.isLoaded,
            status: this.status
        };
    }
    initialize() {
        // Craft context
        this.context = new PluginContext(this);
        const handleError = (e) => {
            ;
            this.context.log.error(`Uncaught error in ${this.module.getName()}: `, e);
            console.error(e);
            // Set plugin status to degraded, maybe functionality will not work anymore
            this.status = PluginStatus.DEGRADED;
        };
        const mainFile = this.getMain();
        let main;
        try {
            // eslint-disable-next-line
            main = require((0, path_1.join)(this.getModule().getFolder(), mainFile));
        }
        catch (e) {
            handleError(e);
            return;
        }
        // Execute main (and wrap it in a try / catch, so there cannot be an exception bubbling up)
        try {
            const response = main(this.context);
            if (response !== undefined && typeof response.catch === 'function') {
                response.catch((e) => handleError(e));
            }
        }
        catch (e) {
            handleError(e);
        }
    }
}
exports.Plugin = Plugin;
//# sourceMappingURL=Module.js.map