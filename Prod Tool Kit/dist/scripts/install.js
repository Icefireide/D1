"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAll = getAll;
exports.download = download;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const fs_1 = require("fs");
const util_1 = require("util");
const path_1 = require("path");
const child_process_1 = require("child_process");
const zip_lib_1 = require("zip-lib");
const fs_extra_1 = require("fs-extra");
const nanospinner_1 = require("nanospinner");
const semver_1 = require("semver");
const package_json_1 = require("../package.json");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
if (process.argv.includes('-plugins')) {
    ;
    void (async () => {
        await installPlugins();
        await run();
    })();
}
else if (process.argv.includes('-install')) {
    void run();
}
/**
 * get all available plugins modules and themes for the prod tool
 */
async function getAll() {
    let assets = [];
    try {
        const url = 'https://modules.prod-toolkit.com/';
        const req = await axios_1.default.get(url);
        if (req.status !== 200)
            return [];
        assets = req.data.filter((a) => a !== null);
    }
    catch (e) {
        console.log(e.data?.message);
    }
    return assets;
}
/**
 * downloads a single module plugin or theme
 * @param asset to download
 */
async function download(asset) {
    console.log(`Downloading ${asset.name}`);
    const spinner = (0, nanospinner_1.createSpinner)(`downloading ${asset.name}`);
    spinner.start();
    const url = asset.download_url;
    const dl = await axios_1.default.get(url, {
        responseType: 'stream'
    });
    if (dl.status !== 200) {
        spinner.error({ text: dl.statusText });
        console.log(`Downloading ${asset.name} failed: ${dl.statusText} - ${dl.data}`);
        return;
    }
    let cwd = (0, path_1.join)(__dirname, '..', '..', 'modules');
    if (asset.name.startsWith('theme')) {
        cwd = (0, path_1.join)(cwd, 'plugin-theming', 'themes');
    }
    const savePath = (0, path_1.join)(cwd, `${asset.name}.zip`);
    const folderPath = (0, path_1.join)(cwd, asset.name);
    const tmpPath = (0, path_1.join)(cwd, asset.name + '-tmp');
    const packagePath = (0, path_1.join)(tmpPath, 'package.json');
    await new Promise((resolve, reject) => {
        dl.data.pipe((0, fs_1.createWriteStream)(savePath));
        dl.data.on('end', async () => {
            spinner.update({
                text: `unpacking ${asset.name}`
            });
            await (0, zip_lib_1.extract)(savePath, tmpPath);
            let requiredVersion;
            if ((0, fs_1.existsSync)(packagePath)) {
                requiredVersion = (await (0, fs_extra_1.readJSON)(packagePath))?.toolkit?.toolkitVersion;
            }
            if (requiredVersion !== undefined &&
                !(0, semver_1.satisfies)(package_json_1.version, requiredVersion)) {
                spinner.error({
                    text: `${asset.name} could not be installed`
                });
                await (0, fs_extra_1.remove)(savePath);
                await (0, fs_extra_1.remove)(tmpPath);
                reject(new Error(`The prod-tool (v${package_json_1.version}) has not the required version ${requiredVersion}`));
            }
            else {
                await (0, zip_lib_1.extract)(savePath, folderPath);
                if (!asset.name.startsWith('theme')) {
                    spinner.update({ text: `installing dependency for ${asset.name}` });
                    await execPromise('npm i --production', { cwd: folderPath });
                }
                await (0, fs_extra_1.remove)(tmpPath);
                await (0, fs_extra_1.remove)(savePath);
                spinner.success({
                    text: `${asset.name} installed`
                });
                resolve(undefined);
            }
        });
    });
}
async function run() {
    const available = await getAll();
    const install = available.filter((a) => {
        return process.argv.includes(a.name);
    });
    for (const asset of install) {
        await download(asset);
    }
}
async function installPlugins() {
    const available = await getAll();
    for (const asset of available) {
        if (!asset.name.startsWith('plugin'))
            continue;
        await download(asset);
    }
}
//# sourceMappingURL=install.js.map