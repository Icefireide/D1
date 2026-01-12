"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
module.exports = async (ctx) => {
    const namespace = ctx.plugin.module.getName();
    const staticData = {};
    ctx.LPTE.emit({
        meta: {
            type: 'add-serves',
            namespace: 'ui',
            version: 1
        },
        serves: [
            {
                frontend: 'frontend',
                id: namespace
            }
        ]
    });
    const versionResponse = await axios_1.default.get('https://valorant-api.com/v1/version');
    staticData.versionData = versionResponse.data.data;
    const splitVersion = staticData.versionData.version.split('.');
    const niceVersion = splitVersion.length >= 2 ? splitVersion[0] + '.' + splitVersion[1] : '';
    staticData.versionData.niceVersion = niceVersion;
    const mapData = await axios_1.default.get('https://valorant-api.com/v1/maps');
    staticData.mapData = mapData.data.data;
    const agentData = await axios_1.default.get('https://valorant-api.com/v1/agents');
    staticData.agentData = agentData.data.data;
    const mapDisplayIconFolder = path_1.default.join(__dirname, '../frontend/map-displayicon');
    const mapSplashFolder = path_1.default.join(__dirname, '../frontend/map-splash');
    staticData.mapData.forEach(async (map) => {
        if (map.displayIcon)
            axios_1.default
                .get(map.displayIcon, { responseType: 'stream' })
                .then((response) => response.data.pipe(fs_1.default.createWriteStream(path_1.default.join(mapDisplayIconFolder, `${map.uuid}.png`))));
        if (map.splash)
            axios_1.default
                .get(map.splash, { responseType: 'stream' })
                .then((response) => response.data.pipe(fs_1.default.createWriteStream(path_1.default.join(mapSplashFolder, `${map.uuid}.png`))));
    });
    const agentBustFolder = path_1.default.join(__dirname, '../frontend/agent-bust');
    staticData.agentData.forEach(async (agent) => {
        if (agent.bustPortrait)
            axios_1.default
                .get(agent.bustPortrait, { responseType: 'stream' })
                .then((response) => response.data.pipe(fs_1.default.createWriteStream(path_1.default.join(agentBustFolder, `${agent.uuid}.png`))));
    });
    ctx.LPTE.on(namespace, 'request-constants', (e) => {
        ctx.LPTE.emit({
            meta: {
                type: e.meta.reply,
                namespace: 'reply',
                version: 1,
                reply: e.meta.reply
            },
            constants: staticData
        });
    });
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