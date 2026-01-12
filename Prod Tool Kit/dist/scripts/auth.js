"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const inquirer_1 = tslib_1.__importDefault(require("inquirer"));
const nanospinner_1 = require("nanospinner");
const crypto_1 = require("crypto");
const uuid_apikey_1 = tslib_1.__importDefault(require("uuid-apikey"));
const getAuth = async () => {
    const auth = await inquirer_1.default.prompt({
        type: 'confirm',
        name: 'enabled',
        message: 'Do you want to enable the authentication?',
        default: false
    });
    return auth.enabled;
};
const newFilePath = (0, path_1.join)(__dirname, '..', '..', 'modules', 'plugin-config', 'config.json');
// eslint-disable-next-line @typescript-eslint/no-var-requires
const file = require(newFilePath);
const askQuestions = async () => {
    const auth = await getAuth();
    /* file['plugin-database'] = database */
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
};
// eslint-disable-next-line @typescript-eslint/no-floating-promises
askQuestions();
//# sourceMappingURL=auth.js.map