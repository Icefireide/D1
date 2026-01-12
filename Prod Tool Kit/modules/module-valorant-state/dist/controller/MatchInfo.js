"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MatchInfo = void 0;
class MatchInfo {
    constructor(ctx) {
        this.ctx = ctx;
        this._available = false;
        this._created = 0;
        this._updated = 0;
        this._deleted = 0;
    }
    init(data) {
        this._available = true;
        this._created = new Date().getTime();
        this._updated = new Date().getTime();
        this.id = data.ID;
        this.participants = data.participants;
        this.teams = data.teams;
        this.map = data.map;
        this.gameMode = data.gameMode;
        this.gameType = data.gameType;
    }
    updateTeam(teams) {
        this._updated = new Date().getTime();
        this.teams = teams;
    }
    delete() {
        this.id = undefined;
        this.participants = undefined;
        this.teams = undefined;
        this.map = undefined;
        this.gameMode = undefined;
        this.gameType = undefined;
        this._available = false;
        this._deleted = new Date().getTime();
    }
    getState() {
        return {
            _available: this._available,
            _created: this._created,
            _updated: this._updated,
            _deleted: this._deleted,
            id: this.id,
            participants: this.participants,
            teams: this.teams,
            map: this.map,
            gameMode: this.gameMode,
            gameType: this.gameType
        };
    }
}
exports.MatchInfo = MatchInfo;
//# sourceMappingURL=MatchInfo.js.map