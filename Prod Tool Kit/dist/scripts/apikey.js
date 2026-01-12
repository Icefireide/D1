"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const nanospinner_1 = require("nanospinner");
const newFilePath = (0, path_1.join)(__dirname, '..', '..', 'modules', 'plugin-config', 'config.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const file = require(newFilePath);
const getApiKey = async () => {
    const apiKey = await inquirer_1.default.prompt({
        type: 'input',
        name: 'apiKey',
        message: 'Enter your Riot-API-Key (RGAPI-SECRETKEY)',
        default: file['plugin-webapi'].apiKey ?? 'RGAPI-SECRETKEY'
    });
    return apiKey.apiKey;
};
const askQuestions = async () => {
    const apiKey = await getApiKey();
    file['plugin-webapi'].apiKey = apiKey;
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
};
// eslint-disable-next-line @typescript-eslint/no-floating-promises
askQuestions();
//# sourceMappingURL=apikey.js.map