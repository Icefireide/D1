"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const https_1 = require("https");
const fs_1 = require("fs");
const promises_1 = require("fs/promises");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const tar_1 = require("tar");
const https_2 = require("https");
class StaticData {
    /**
     * @param ctx Plugin Context
     * @param config
     */
    constructor(ctx, config) {
        this.ctx = ctx;
        this.config = config;
        this._finishedAdditionalFileDownloading = false;
        this._finishedDragonTail = false;
        this.versionIndex = 0;
        this._startUp();
    }
    async _startUp() {
        if (!this.config.gameVersion) {
            await this.setCurrentVersion();
        }
        else {
            this.version = this.config.gameVersion;
        }
        if (!this.config['last-downloaded-version']) {
            try {
                await this.getAdditionalFiles();
                await this.getDDragon();
            }
            catch (error) {
                this._errorReadyCheck();
                return;
            }
        }
        else if (this.config['last-downloaded-version'] !== this.version) {
            const continueUpdate = await this.ctx.LPTE.prompt({
                questions: {
                    type: 'confirm',
                    name: 'update',
                    message: `There are new static files available (${this.version})! Do you want to install them?`,
                    default: true
                }
            }, 1000 * 10);
            if (!continueUpdate.update) {
                this._finishedAdditionalFileDownloading = true;
                this._finishedDragonTail = true;
                if (this.readyHandler)
                    this.readyHandler();
            }
            else {
                try {
                    await this.getAdditionalFiles();
                    await this.getDDragon();
                }
                catch (error) {
                    this._errorReadyCheck();
                    return;
                }
            }
        }
        else {
            this._finishedAdditionalFileDownloading = true;
            this._finishedDragonTail = true;
            if (this.readyHandler)
                this.readyHandler();
        }
    }
    onReady(handler) {
        if (this._finishedDragonTail &&
            this._finishedAdditionalFileDownloading) {
            handler();
        }
        else {
            this.readyHandler = handler;
        }
    }
    _readyCheck() {
        if (!this.readyHandler)
            return;
        if (!this._finishedDragonTail ||
            !this._finishedAdditionalFileDownloading)
            return;
        this.readyHandler();
        this._setDownloadVersion();
    }
    _errorReadyCheck() {
        if (!this.readyHandler)
            return;
        if (!this.config['last-downloaded-version'] ||
            this.config['last-downloaded-version'] === '') {
            this.ctx.log.warn('The latest patch information could not be downloaded. Trying to get data from an earlier patch');
            this.versionIndex += 1;
            return this._startUp();
        }
        this.ctx.log.warn(`The latest patch information could not be downloaded, data from the previous patch (${this.config['last-downloaded-version']}) will be used`);
        this.readyHandler();
    }
    _setDownloadVersion() {
        this.ctx.LPTE.emit({
            meta: {
                type: 'set',
                namespace: 'plugin-config',
                version: 1
            },
            config: {
                'last-downloaded-version': this.version
            }
        });
    }
    async setCurrentVersion() {
        const gvRequest = await axios_1.default.get('https://ddragon.leagueoflegends.com/api/versions.json');
        const gvJson = gvRequest.data;
        return (this.version = gvJson[this.versionIndex]);
    }
    async getDDragon() {
        const tarFileName = `dragontail-${this.version}.tgz`;
        const tarFilePath = (0, path_1.join)(__dirname, '..', 'frontend', tarFileName);
        const tarURI = `https://ddragon.leagueoflegends.com/cdn/${tarFileName}`;
        const file = (0, fs_1.createWriteStream)(tarFilePath);
        this.ctx.log.info('start downloading dragontail.tgz');
        let progress;
        (0, https_2.get)(tarURI, (response) => {
            var _a;
            response.pipe(file);
            if (response.headers['content-length']) {
                var len = parseInt(response.headers['content-length'], 10);
                var cur = 0;
                var total = len / 1048576;
                if (progress === undefined) {
                    if (typeof ((_a = this.ctx.progress) === null || _a === void 0 ? void 0 : _a.create) === 'function') {
                        progress = this.ctx.progress.create(Math.round(total), 0, {
                            task: 'downloading DataDragon'
                        });
                    }
                    else if (typeof this.ctx.setProgressBar === 'function') {
                        this.ctx.setProgressBar(0, 'Downloading DataDragon');
                    }
                }
                response.on('data', (chunk) => {
                    cur += chunk.length;
                    if (progress !== undefined) {
                        progress.update(Math.round(cur / 1048576));
                    }
                    else if (typeof this.ctx.setProgressBar === 'function') {
                        this.ctx.setProgressBar(cur / 1048576 / total, 'Downloading DataDragon');
                    }
                });
            }
            file.on('finish', () => {
                this.ctx.log.info('\n finish downloading dragontail.tgz');
                file.close();
                progress === null || progress === void 0 ? void 0 : progress.stop();
                this.unpackDDragon();
            });
        }).on('error', async (err) => {
            progress === null || progress === void 0 ? void 0 : progress.stop(); // Handle errors
            try {
                await (0, fs_extra_1.remove)(tarFilePath);
                this.ctx.log.error(err.message);
                this._errorReadyCheck();
            }
            catch (error) {
                this.ctx.log.debug(`\n${tarFilePath}file removed`);
            }
        });
    }
    async unpackDDragon() {
        const tarFileName = `dragontail-${this.version}.tgz`;
        const tarFilePath = (0, path_1.join)(__dirname, '..', 'frontend', tarFileName);
        const stats = await (0, promises_1.stat)(tarFilePath);
        if (stats === undefined || stats.size <= 0) {
            return this._errorReadyCheck();
        }
        const dDragonPaths = [
            `${this.version}/img/champion`,
            `${this.version}/img/item`,
            `${this.version}/img/profileicon`,
            `${this.version}/data/en_US/map.json`,
            `${this.version}/data/en_US/runesReforged.json`,
            `${this.version}/data/en_US/champion.json`,
            `${this.version}/data/en_US/item.json`,
            `img/champion`,
            `img/perk-images/Styles`
        ];
        const dataPath = (0, path_1.join)(__dirname, '..', 'frontend');
        this.ctx.log.info('Unpacking dragontail.tgz...');
        (0, fs_1.createReadStream)(tarFilePath)
            .pipe((0, tar_1.x)({ cwd: dataPath, newer: true }, dDragonPaths)
            .on('finish', async () => {
            this.ctx.log.info('Finished unpacking dragontail.tgz');
            await (0, fs_extra_1.remove)(tarFilePath);
            this.copyDDragonFiles();
        })
            .on('error', (e) => {
            this.ctx.log.error(e);
            this._errorReadyCheck();
        }))
            .on('error', (e) => {
            this.ctx.log.error(e);
            this._errorReadyCheck();
        });
    }
    async copyDDragonFiles() {
        this.ctx.log.info('Moving files to frontend...');
        const dataPath = (0, path_1.join)(__dirname, '..', 'frontend');
        const versionDirPath = (0, path_1.join)(__dirname, '..', 'frontend', this.version);
        await (0, fs_extra_1.copy)(versionDirPath, dataPath);
        this.removeVersionDir();
        this.ctx.log.info('Finished moving files to frontend');
    }
    async removeVersionDir() {
        this.ctx.log.info('Deleting versioned folder...');
        const versionDirPath = (0, path_1.join)(__dirname, '..', 'frontend', this.version);
        await (0, fs_extra_1.remove)(versionDirPath);
        this._finishedDragonTail = true;
        this._readyCheck();
        this.ctx.log.info('Finished deleting versioned folder');
    }
    async getAdditionalFiles() {
        if (!this.version)
            return;
        this.ctx.log.info('Start downloading additional files...');
        try {
            await Promise.all([
                await this.getItemBin(),
                await this.getConstants('gameModes'),
                await this.getConstants('gameTypes'),
                await this.getConstants('queues'),
                await this.getConstants('seasons'),
                await this.getConstants('maps')
            ]);
            this._finishedAdditionalFileDownloading = true;
            this._readyCheck();
            this.ctx.log.info('Finished downloading additional files');
        }
        catch (error) {
            this.ctx.log.debug(error);
            throw new Error(error);
        }
    }
    async getConstants(name) {
        const base = (0, path_1.join)(__dirname, '..', 'frontend', 'data', 'constants');
        if (!(0, fs_1.existsSync)(base)) {
            await (0, promises_1.mkdir)(base);
        }
        const filePath = (0, path_1.join)(base, `${name}.json`);
        const uri = `https://static.developer.riotgames.com/docs/lol/${name}.json`;
        const res = await axios_1.default.get(uri, {
            httpsAgent: new https_1.Agent({ rejectUnauthorized: false })
        });
        const data = res.data;
        if (res.status !== 200) {
            this.ctx.log.debug(`${name} could not be downloaded`);
            throw new Error(res.statusText);
        }
        return (0, promises_1.writeFile)(filePath, JSON.stringify(data));
    }
    async getItemBin() {
        const base = (0, path_1.join)(__dirname, '..', 'frontend', 'data');
        if (!(0, fs_1.existsSync)(base)) {
            await (0, promises_1.mkdir)(base);
        }
        const filePath = (0, path_1.join)(base, 'item.bin.json');
        const url = `https://raw.communitydragon.org/latest/game/items.cdtb.bin.json`;
        let file = (0, fs_1.createWriteStream)(filePath);
        (0, https_2.get)(url, (response) => {
            response.pipe(file);
            file.on('finish', () => {
                file.close();
                this.ctx.log.debug(`Downloaded items.bin.json`);
                return Promise.resolve(true);
            });
        }).on('error', async (err) => {
            try {
                await (0, fs_extra_1.remove)(filePath);
                this.ctx.log.error(`Downloading item.bin.json failed: ${err}`);
                return Promise.reject(err);
            }
            catch (error) {
                this.ctx.log.error(error);
                return Promise.reject(error);
            }
        });
    }
}
exports.default = StaticData;
//# sourceMappingURL=StaticData.js.map