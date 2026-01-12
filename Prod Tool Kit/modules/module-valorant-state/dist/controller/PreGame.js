"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PreGame = void 0;
class PreGame {
    constructor(ctx) {
        this.ctx = ctx;
        this._available = false;
        this._created = 0;
        this._updated = 0;
        this._deleted = 0;
        this.timeLeftUntil = 0;
    }
    init(data) {
        this._available = true;
        this._created = new Date().getTime();
        this._updated = new Date().getTime();
        this.timeLeftUntil = data.timer.timeLeftUntil;
        this.phase = data.timer.phase;
        this.teams = data.teams;
    }
    update(data) {
        this._updated = new Date().getTime();
        this.phase = data.PregameState;
        this.teams = data.Teams;
    }
    delete(data) {
        /* this._available = false
        this._deleted = new Date().getTime()
        this._updated = new Date().getTime()
        this.phase = data.PregameState
        this.teams = data.Teams */
    }
    getState() {
        return {
            _available: this._available,
            _created: this._created,
            _updated: this._updated,
            _deleted: this._deleted,
            teams: this.teams,
            timer: {
                phase: this.phase,
                timeLeftUntil: this.timeLeftUntil
            }
        };
    }
}
exports.PreGame = PreGame;
//# sourceMappingURL=PreGame.js.map