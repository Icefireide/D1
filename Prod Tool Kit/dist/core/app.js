"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const minimist_1 = tslib_1.__importDefault(require("minimist"));
const semver_1 = require("semver");
const package_json_1 = require("../package.json");
const logging_1 = tslib_1.__importStar(require("./logging"));
const server_1 = require("./web/server");
const ModuleService_1 = tslib_1.__importDefault(require("./modules/ModuleService"));
const LPTEService_1 = tslib_1.__importDefault(require("./eventbus/LPTEService"));
const axios_1 = tslib_1.__importDefault(require("axios"));
const argv = (0, minimist_1.default)(process.argv.slice(2));
if (argv.loglevel !== undefined) {
    process.env.LOGLEVEL = argv.loglevel;
}
const log = (0, logging_1.default)('main');
log.info(' _          _       _____           _ _    _ _   ');
log.info('| |    ___ | |     |_   _|__   ___ | | | _(_) |_ ');
log.info('| |   / _ \\| |       | |/ _ \\ / _ \\| | |/ / | __|');
log.info('| |__| (_) | |___    | | (_) | (_) | |   <| | |_ ');
log.info('|_____\\___/|_____|   |_|\\___/ \\___/|_|_|\\_\\_|\\__|');
log.info('');
const checkVersion = async () => {
    const res = await axios_1.default.get('https://prod-toolkit-latest.himyu.workers.dev/', {
        headers: { 'Accept-Encoding': 'gzip,deflate,compress' }
    });
    if (res.status !== 200) {
        return log.warn('The current version could not be checked');
    }
    if ((0, semver_1.lt)(package_json_1.version, res.data.tag_name)) {
        log.info('='.repeat(50));
        log.info(`There is a new version available: ${res.data.tag_name}`);
        log.info('='.repeat(50));
        log.info('');
    }
};
const main = async () => {
    await checkVersion();
    LPTEService_1.default.initialize();
    logging_1.eventbusTransport.lpte = LPTEService_1.default;
    await ModuleService_1.default.initialize();
    LPTEService_1.default.once('lpt', 'ready', async () => {
        await (0, server_1.runServer)();
    });
};
main()
    .then(() => log.info('LoL Toolkit started up successfully.'))
    .catch((e) => {
    log.error('Startup failed, critical error: ', e);
    process.exit(1);
});
//# sourceMappingURL=app.js.map