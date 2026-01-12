"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const package_json_1 = require("../package.json");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const fs_1 = require("fs");
const path_1 = require("path");
const zip_lib_1 = require("zip-lib");
const fs_extra_1 = require("fs-extra");
const nanospinner_1 = require("nanospinner");
const semver_1 = require("semver");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execPromise = (0, util_1.promisify)(child_process_1.exec);
const checkVersion = async () => {
    const res = await axios_1.default.get('https://prod-toolkit-latest.himyu.workers.dev/', {
        headers: { 'Accept-Encoding': 'gzip,deflate,compress' }
    });
    if (res.status !== 200) {
        console.warn('The current version could not be checked');
        return;
    }
    if ((0, semver_1.lt)(package_json_1.version, res.data.tag_name)) {
        return res.data;
    }
};
const installUpdateConfirm = async () => {
    const install = await inquirer_1.default.prompt({
        type: 'confirm',
        name: 'install',
        message: 'Do you want to install the newest version?',
        default: true
    });
    return install.install;
};
async function installUpdate(version) {
    const spinner = (0, nanospinner_1.createSpinner)(`Downloading ${version.tag_name}`);
    spinner.start();
    const url = version.assets[0].browser_download_url;
    const dl = await axios_1.default.get(url, {
        responseType: 'stream'
    });
    if (dl.status !== 200) {
        spinner.error({ text: dl.statusText });
        console.log(`Downloading ${version.tag_name} failed: ${dl.statusText} - ${dl.data}`);
        return;
    }
    const cwd = (0, path_1.join)(__dirname, '..', '..');
    const savePath = (0, path_1.join)(cwd, `${version.assets[0].name}.zip`);
    const folderPath = cwd;
    await new Promise((resolve, reject) => {
        dl.data.pipe((0, fs_1.createWriteStream)(savePath));
        dl.data.on('end', async () => {
            spinner.update({
                text: `unpacking ${version.assets[0].name}`
            });
            await (0, zip_lib_1.extract)(savePath, folderPath);
            await (0, fs_extra_1.remove)(savePath);
            spinner.success({
                text: `${version.tag_name} installed`
            });
            resolve(undefined);
        });
        dl.data.on('error', (e) => {
            reject(e);
        });
    });
}
async function run() {
    const updateAvailable = await checkVersion();
    if (updateAvailable === undefined) {
        console.log('There is no new version available');
        return;
    }
    console.log('='.repeat(50));
    console.log(`There is a new version available: ${updateAvailable.tag_name}`);
    console.log('='.repeat(50));
    console.log('');
    const confirm = await installUpdateConfirm();
    if (!confirm) {
        console.log('Update declined ending process');
        return;
    }
    try {
        await installUpdate(updateAvailable);
    }
    catch (error) {
        console.error(error);
        return;
    }
    try {
        const output = await execPromise('npm i --production');
        console.log(output.stdout);
        if (output.stderr !== '') {
            console.error(output.stderr);
        }
    }
    catch (error) {
        console.error(error);
    }
}
void run();
//# sourceMappingURL=toolUpdate.js.map