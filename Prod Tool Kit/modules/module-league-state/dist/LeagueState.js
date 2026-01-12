"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.state = exports.LeagueState = exports.LeagueStateLive = exports.LeagueStateLCU = exports.LeagueStateWeb = void 0;
class LeagueStateWeb {
    constructor() {
        this.live = {
            _available: false
        };
        this.match = {
            _available: false
        };
        this.timeline = {
            _available: false
        };
    }
}
exports.LeagueStateWeb = LeagueStateWeb;
class LeagueStateLCU {
    constructor() {
        this.lobby = {
            _available: false
        };
        this.champselect = {
            _available: false
        };
        this.eog = {
            _available: false
        };
    }
}
exports.LeagueStateLCU = LeagueStateLCU;
class LeagueStateLive {
    constructor() {
        this._available = false;
        this.objectives = {
            100: [],
            200: []
        };
    }
}
exports.LeagueStateLive = LeagueStateLive;
class LeagueState {
    constructor() {
        this.web = new LeagueStateWeb();
        this.lcu = new LeagueStateLCU();
        this.live = new LeagueStateLive();
    }
}
exports.LeagueState = LeagueState;
exports.state = new LeagueState();
//# sourceMappingURL=LeagueState.js.map