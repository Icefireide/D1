"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnsetGameController = void 0;
const Controller_1 = require("./Controller");
class UnsetGameController extends Controller_1.Controller {
    async handle(event) {
        this.pluginContext.LPTE.emit({
            meta: {
                namespace: 'reply',
                type: event.meta.reply,
                version: 1
            }
        });
    }
}
exports.UnsetGameController = UnsetGameController;
//# sourceMappingURL=UnsetGameController.js.map