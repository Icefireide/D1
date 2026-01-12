"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PostGame = void 0;
class PostGame {
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
        this.data = data;
    }
    delete() {
        this.data = undefined;
        this._available = false;
        this._deleted = new Date().getTime();
    }
    getState() {
        return {
            _available: this._available,
            _created: this._created,
            _updated: this._updated,
            _deleted: this._deleted,
            ...this.data
        };
    }
}
exports.PostGame = PostGame;
//# sourceMappingURL=PostGame.js.map