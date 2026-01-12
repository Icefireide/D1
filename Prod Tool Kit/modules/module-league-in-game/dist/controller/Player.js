"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Player = void 0;
class Player {
    constructor(riotIdGameName, team, championName, championId, championKey) {
        this.nickname = '';
        this.level = 0;
        this.experience = 0;
        this.currentGold = 0;
        this.totalGold = 0;
        this.items = new Set();
        this.isDead = false;
        this.riotIdGameName = riotIdGameName;
        this.championName = championName;
        this.championId = championId;
        this.championKey = championKey;
        this.team = team === 'ORDER' ? 100 : 200;
    }
    addItem(item) {
        return this.items.add(item);
    }
    removeItem(item) {
        this.items.delete(item);
        return this.items;
    }
    updateItems(items) {
        return this.items = new Set(items);
    }
}
exports.Player = Player;
//# sourceMappingURL=Player.js.map