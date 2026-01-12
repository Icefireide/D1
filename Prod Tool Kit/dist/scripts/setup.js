"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const path_1 = require("path");
const fs_extra_1 = require("fs-extra");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const nanospinner_1 = require("nanospinner");
const crypto_1 = require("crypto");
const install_1 = require("./install");
const uuid_apikey_1 = tslib_1.__importDefault(require("uuid-apikey"));
const getApiKey = async () => {
    const apiKey = await inquirer_1.default.prompt({
        type: 'input',
        name: 'apiKey',
        message: 'Enter your Riot-API-Key (RGAPI-SECRETKEY)',
        default: 'RGAPI-SECRETKEY'
    });
    return apiKey.apiKey;
};
const getServer = async () => {
    const server = await inquirer_1.default.prompt({
        type: 'list',
        name: 'server',
        message: 'Enter your server',
        default: 'EUW1',
        choices: [
            'BR1',
            'EUN1',
            'EUW1',
            'JP1',
            'KR',
            'LA1',
            'LA2',
            'NA1',
            'TR1',
            'RU',
            'OC1',
            'PH2',
            'SG2',
            'TH2',
            'TW2',
            'VN2'
        ]
    });
    return server.server;
};
const getAuth = async () => {
    const auth = await inquirer_1.default.prompt({
        type: 'confirm',
        name: 'enabled',
        message: 'Do you want to enable the authentication?',
        default: false
    });
    return auth.enabled;
};
const getInstallAssets = async () => {
    const install = await inquirer_1.default.prompt({
        type: 'confirm',
        name: 'enabled',
        message: 'Do you want to install Modules and Themes now?',
        default: true
    });
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (!install.enabled)
        return [];
    const type = await inquirer_1.default.prompt({
        type: 'list',
        name: 'type',
        message: 'Do you want to install single modules/themes or all for a specific game',
        default: 'Game',
        choices: ['Game', 'Single']
    });
    if (type.type === 'Game')
        return await getGameSelection();
    else if (type.type === 'Single')
        return await getModuleSelection();
    return [];
};
const getModuleSelection = async () => {
    const assets = await (0, install_1.getAll)();
    const choices = await inquirer_1.default.prompt({
        type: 'checkbox',
        name: 'assets',
        choices: assets.map((a) => a.name)
    });
    if (choices.assets.length <= 0) {
        console.warn('! Please select at least one Asset');
        return await getModuleSelection();
    }
    const selection = assets.filter((a) => {
        return choices.assets.includes((i) => i.name === a.name);
    });
    return selection;
};
const getGameSelection = async () => {
    const choices = await inquirer_1.default.prompt({
        type: 'checkbox',
        name: 'games',
        choices: ['League of Legends', 'Valorant']
    });
    if (choices.games.length <= 0) {
        console.warn('! Please select at least one game');
        return await getGameSelection();
    }
    const assets = await (0, install_1.getAll)();
    const selection = [];
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (choices.games.includes('League of Legends')) {
        assets.forEach((a) => {
            if (a.name.includes('league')) {
                selection.push(a);
            }
        });
    }
    // eslint-disable-next-line @typescript-eslint/strict-boolean-expressions
    if (choices.games.includes('Valorant')) {
        assets.forEach((a) => {
            if (a.name.includes('valo')) {
                selection.push(a);
            }
        });
    }
    const teams = assets.find((a) => a.name === 'module-teams');
    if (teams !== undefined)
        selection.push(teams);
    const caster = assets.find((a) => a.name === 'module-caster');
    if (caster !== undefined)
        selection.push(caster);
    return selection;
};
const filePath = (0, path_1.join)(__dirname, '..', '..', 'modules', 'plugin-config', 'config.dist.json');
const newFilePath = (0, path_1.join)(__dirname, '..', '..', 'modules', 'plugin-config', 'config.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const file = require(filePath);
const askQuestions = async () => {
    const apiKey = await getApiKey();
    const server = await getServer();
    const auth = await getAuth();
    file['plugin-webapi'].apiKey = apiKey;
    file['plugin-webapi'].server = server;
    file.auth = {
        enabled: auth,
        secreteKey: auth ? (0, crypto_1.randomBytes)(48).toString('hex') : '',
        'super-api-key': auth ? 'RCVPT-' + uuid_apikey_1.default.create().apiKey : ''
    };
    const spinner = (0, nanospinner_1.createSpinner)('Saving config');
    try {
        await (0, fs_extra_1.writeJSON)(newFilePath, file, { spaces: 2 });
        spinner.success({
            text: 'config saved'
        });
    }
    catch (err) {
        spinner.error({
            text: err.message
        });
    }
    await installAssets();
};
const installAssets = async () => {
    try {
        const assets = await getInstallAssets();
        for (const asset of assets) {
            await (0, install_1.download)(asset);
        }
    }
    catch (error) {
        console.log(error);
    }
};
// eslint-disable-next-line @typescript-eslint/no-floating-promises
askQuestions();
//# sourceMappingURL=setup.js.map