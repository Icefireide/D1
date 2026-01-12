"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RequestController = void 0;
const Controller_1 = require("./Controller");
const LeagueState_1 = require("../LeagueState");
const convertState_1 = require("../champselect/convertState");
const plugin_1 = require("../plugin");
class RequestController extends Controller_1.Controller {
    async handle(event) {
        this.pluginContext.LPTE.emit({
            meta: {
                type: event.meta.reply,
                namespace: 'reply',
                version: 1
            },
            state: {
                ...LeagueState_1.state,
                lcu: {
                    ...LeagueState_1.state.lcu,
                    lobby: LeagueState_1.state.lcu.lobby,
                    champselect: {
                        ...LeagueState_1.state.lcu.champselect,
                        order: LeagueState_1.state.lcu.champselect.order !== undefined
                            ? {
                                ...(0, convertState_1.convertState)(LeagueState_1.state, LeagueState_1.state.lcu.champselect.order, plugin_1.leagueStatic)
                            }
                            : undefined
                    }
                }
            }
        });
    }
}
exports.RequestController = RequestController;
//# sourceMappingURL=RequestController.js.map