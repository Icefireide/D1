"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeoutConfirmPrompt = void 0;
const tslib_1 = require("tslib");
const confirm_1 = tslib_1.__importDefault(require("inquirer/lib/prompts/confirm"));
class TimeoutConfirmPrompt extends confirm_1.default {
    constructor(...args) {
        // @ts-expect-error arg spread
        super(...args);
        this.timeout = 0;
        this.opt.timeoutTips = t => `(${t}s)`;
        this.opt.timeout = this.opt.timeout !== undefined ? this.opt.timeout / 1000 : 10;
    }
    _run(cb) {
        this.timeout = this.opt.timeout !== undefined ? this.opt.timeout : 10;
        const timerId = setInterval(() => {
            this.timeout -= 1;
            if (this.timeout === 0) {
                clearInterval(timerId);
                this.onEnd(this.opt.default === 'Y/n' ? 'Yes' : 'No');
            }
            else {
                this.render();
            }
        }, 1000);
        /* eslint-disable-next-line */
        return super._run((...args) => {
            clearInterval(timerId);
            // eslint-disable-next-line n/no-callback-literal
            cb(...args);
        });
    }
    render(answer) {
        let message = this.getQuestion();
        if (this.timeout !== 0 && answer === undefined) {
            message += this.opt.timeoutTips(this.timeout ?? 10);
        }
        if (typeof answer === 'boolean') {
            message += answer ? 'Yes' : 'No';
        }
        else {
            message += this.rl.line;
        }
        this.screen.render(message, '');
        return this;
    }
}
exports.TimeoutConfirmPrompt = TimeoutConfirmPrompt;
//# sourceMappingURL=timeoutPrompt.js.map