"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ValoState = void 0;
const MatchInfo_1 = require("./MatchInfo");
const PreGame_1 = require("./PreGame");
const PostGame_1 = require("./PostGame");
class ValoState {
    constructor(ctx) {
        this.ctx = ctx;
        this.sessionLoopState = 'MENUS';
        this.gameSets = {};
        this.preGame = new PreGame_1.PreGame(ctx);
        this.matchInfo = new MatchInfo_1.MatchInfo(ctx);
        this.postGame = new PostGame_1.PostGame(ctx);
    }
    getState() {
        return {
            loopState: this.sessionLoopState,
            matchInfo: this.matchInfo.getState(),
            preGame: this.preGame.getState(),
            postGame: this.postGame.getState(),
            mvp: this.mvp
        };
    }
}
exports.ValoState = ValoState;
//# sourceMappingURL=ValoState.js.map