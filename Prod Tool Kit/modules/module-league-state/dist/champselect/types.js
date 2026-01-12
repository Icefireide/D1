"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Timer = exports.Spell = exports.Pick = exports.Champion = exports.Ban = exports.Team = exports.Summoner = exports.Session = exports.Cell = exports.Action = exports.ActionType = void 0;
var ActionType;
(function (ActionType) {
    ActionType["PICK"] = "pick";
    ActionType["BAN"] = "ban";
})(ActionType || (exports.ActionType = ActionType = {}));
class Action {
}
exports.Action = Action;
class Cell {
}
exports.Cell = Cell;
class Session {
    constructor() {
        this.myTeam = [];
        this.theirTeam = [];
        this.actions = [];
        this.timer = new Timer();
    }
}
exports.Session = Session;
class Summoner {
    constructor() {
        this.displayName = '';
        this.summonerId = 0;
    }
}
exports.Summoner = Summoner;
class Team {
    constructor() {
        this.bans = [];
        this.picks = [];
        this.isActive = false;
    }
}
exports.Team = Team;
class Ban {
    constructor() {
        this.champion = new Champion();
        this.isActive = false;
    }
}
exports.Ban = Ban;
class Champion {
    constructor() {
        this.id = 0;
        this.name = '';
        this.key = '';
        this.splashImg = '';
        this.splashCenteredImg = '';
        this.loadingImg = '';
        this.squareImg = '';
        this.idName = '';
    }
}
exports.Champion = Champion;
class Pick {
    constructor(id) {
        this.isActive = false;
        this.displayName = '';
        this.id = id;
    }
}
exports.Pick = Pick;
class Spell {
    constructor() {
        this.id = 0;
        this.icon = '';
    }
}
exports.Spell = Spell;
class Timer {
    constructor() {
        this.adjustedTimeLeftInPhase = 0;
        this.adjustedTimeLeftInPhaseInSec = 0;
        this.internalNowInEpochMs = 0;
        this.phase = '';
        this.timeLeftInPhase = 0;
        this.timeLeftInPhaseInSec = 0;
        this.totalTimeInPhase = 0;
    }
}
exports.Timer = Timer;
//# sourceMappingURL=types.js.map