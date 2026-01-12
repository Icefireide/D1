"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.InGameState = void 0;
const Items_1 = require("../types/Items");
const InGameEvent_1 = require("../types/InGameEvent");
const crypto_1 = require("crypto");
const Player_1 = require("./Player");
class InGameState {
    constructor(namespace, ctx, config, state, statics) {
        var _a;
        this.namespace = namespace;
        this.ctx = ctx;
        this.config = config;
        this.state = state;
        this.statics = statics;
        this.gameData = [];
        this.farsightDataArray = [];
        this.actions = new Map();
        this.itemEpicness = (_a = this.config.items) === null || _a === void 0 ? void 0 : _a.map((i) => Items_1.ItemEpicness[i]);
        this.gameState = {
            gameTime: 0,
            currentPlayer: '',
            showLeaderBoard: false,
            scoreboard: true,
            targetFrameCover: false,
            towers: {
                100: {
                    L2: {},
                    L1: {},
                    L0: {}
                },
                200: {
                    L2: {},
                    L1: {},
                    L0: {}
                }
            },
            platings: {
                showPlatings: false,
                100: {
                    L2: 0,
                    L1: 0,
                    L0: 0
                },
                200: {
                    L2: 0,
                    L1: 0,
                    L0: 0
                }
            },
            showInhibitors: null,
            inhibitors: {
                100: {
                    L2: {
                        alive: true,
                        respawnAt: 0,
                        respawnIn: 0,
                        percent: 0,
                        time: 0
                    },
                    L1: {
                        alive: true,
                        respawnAt: 0,
                        respawnIn: 0,
                        percent: 0,
                        time: 0
                    },
                    L0: {
                        alive: true,
                        respawnAt: 0,
                        respawnIn: 0,
                        percent: 0,
                        time: 0
                    }
                },
                200: {
                    L2: {
                        alive: true,
                        respawnAt: 0,
                        respawnIn: 0,
                        percent: 0,
                        time: 0
                    },
                    L1: {
                        alive: true,
                        respawnAt: 0,
                        respawnIn: 0,
                        percent: 0,
                        time: 0
                    },
                    L0: {
                        alive: true,
                        respawnAt: 0,
                        respawnIn: 0,
                        percent: 0,
                        time: 0
                    }
                }
            },
            player: [],
            gold: {
                100: 0,
                200: 0
            },
            kills: {
                100: 0,
                200: 0
            },
            goldGraph: {},
            objectives: {
                100: [],
                200: []
            }
        };
        this.ctx.LPTE.emit({
            meta: {
                namespace: this.namespace,
                type: 'update',
                version: 1
            },
            state: this.convertGameState()
        });
        this.ctx.LPTE.emit({
            meta: {
                namespace: this.namespace,
                type: 'pp-update',
                version: 1
            },
            type: 'Baron',
            ongoing: false,
            percent: 0,
            respawnIn: 0
        });
        this.ctx.LPTE.emit({
            meta: {
                namespace: this.namespace,
                type: 'pp-update',
                version: 1
            },
            type: 'Dragon',
            ongoing: false,
            percent: 0,
            respawnIn: 0
        });
        this.updateState();
    }
    convertGameState() {
        return {
            ...this.gameState,
            gameTime: this.gameState.gameTime + (this.config.delay / 1000),
            player: Object.values(this.gameState.player).map((p) => {
                return {
                    ...p,
                    items: [...p.items.values()]
                };
            })
        };
    }
    updateState() {
        this.ctx.LPTE.emit({
            meta: {
                namespace: 'module-league-state',
                type: 'save-live-game-stats',
                version: 1
            },
            gameState: this.convertGameState()
        });
    }
    handelData(allGameData) {
        if (this.gameData.length > 0) {
            let previousGameData = this.gameData[this.gameData.length - 1];
            if (allGameData.gameData.gameTime < previousGameData.gameData.gameTime) {
                this.gameData = this.gameData.filter((gd) => gd.gameData.gameTime < allGameData.gameData.gameTime);
                if (this.gameData.length <= 0)
                    return;
                previousGameData = this.gameData[this.gameData.length - 1];
            }
            this.gameState.gameTime = allGameData.gameData.gameTime;
            allGameData.allPlayers.forEach((p, i) => {
                if (this.gameState.player.find(pl => pl.riotIdGameName === p.riotIdGameName) !== undefined)
                    return;
                const champ = this.statics.champions.find((c) => c.name === p.championName);
                this.gameState.player.splice(i, 0, new Player_1.Player(p.riotIdGameName, p.team, p.championName, champ.id, champ.key));
            });
            setTimeout(() => {
                this.checkPlayerUpdate(allGameData);
                this.checkEventUpdate(allGameData, previousGameData);
                for (const [id, func] of this.actions.entries()) {
                    func(allGameData, id);
                }
            }, this.config.delay / 2);
        }
        this.gameData.push(allGameData);
    }
    handelReplayData(replayData) {
        if (replayData.selectionName === '' || replayData.selectionName === undefined) {
            if (this.config.autoTargetFrameCover && !this.gameState.targetFrameCover) {
                this.gameState.targetFrameCover = true;
                this.ctx.LPTE.emit({
                    meta: {
                        namespace: this.namespace,
                        type: 'show-target-frame-cover',
                        version: 1
                    }
                });
            }
        }
        if (replayData.interfaceScoreboard !== this.gameState.scoreboard) {
            this.gameState.scoreboard = replayData.interfaceScoreboard;
            this.ctx.LPTE.emit({
                meta: {
                    namespace: this.namespace,
                    type: 'player-cams-lol',
                    version: 1
                },
                visibilty: replayData.interfaceScoreboard
            });
        }
        setTimeout(() => {
            var _a, _b, _c, _d;
            if (replayData.selectionName === this.gameState.currentPlayer && this.gameState.currentPlayer !== '') {
                if (this.config.autoTargetFrameCover && this.gameState.targetFrameCover) {
                    this.gameState.targetFrameCover = false;
                    this.ctx.LPTE.emit({
                        meta: {
                            namespace: this.namespace,
                            type: 'hide-target-frame-cover',
                            version: 1
                        }
                    });
                }
                return;
            }
            this.gameState.currentPlayer = replayData.selectionName;
            const playerIndex = this.gameState.player.findIndex(p => p.riotIdGameName === replayData.selectionName);
            if (playerIndex === -1 || this.gameState.player[playerIndex].isDead) {
                return;
            }
            if (this.config.autoTargetFrameCover && this.gameState.targetFrameCover) {
                this.gameState.targetFrameCover = false;
                this.ctx.LPTE.emit({
                    meta: {
                        namespace: this.namespace,
                        type: 'hide-target-frame-cover',
                        version: 1
                    }
                });
            }
            const firstPlayerIndex = playerIndex < 5 ? playerIndex : playerIndex - 5;
            const secondPlayerIndex = firstPlayerIndex + 5;
            this.ctx.LPTE.emit({
                meta: {
                    namespace: this.namespace,
                    type: 'player-change-lol',
                    version: 1
                },
                player1: (_b = (_a = this.gameState.player[firstPlayerIndex]) === null || _a === void 0 ? void 0 : _a.riotIdGameName) !== null && _b !== void 0 ? _b : '',
                player2: (_d = (_c = this.gameState.player[secondPlayerIndex]) === null || _c === void 0 ? void 0 : _c.riotIdGameName) !== null && _d !== void 0 ? _d : '',
            });
        }, this.config.delay / 2);
    }
    handelFarsightData(farsightData) {
        if (farsightData.champions === undefined || !Array.isArray(farsightData.champions) || farsightData.champions.length <= 0)
            return;
        if (this.farsightDataArray.length > 0) {
            let previousFarsightData = this.farsightDataArray[this.farsightDataArray.length - 1];
            if (farsightData.gameTime < (previousFarsightData === null || previousFarsightData === void 0 ? void 0 : previousFarsightData.gameTime)) {
                this.farsightDataArray = this.farsightDataArray.filter((gd) => gd.gameTime < farsightData.gameTime);
                if (this.farsightDataArray.length <= 0)
                    return;
                previousFarsightData = this.farsightDataArray[this.farsightDataArray.length - 1];
            }
        }
        this.farsightDataArray.push(farsightData);
        let gold100 = 0;
        let gold200 = 0;
        const champions = farsightData.champions.filter((c, i, a) => {
            return a.findIndex(ci => ci.displayName === c.displayName) === i;
        });
        for (const champion of champions) {
            for (const player in this.gameState.player) {
                if (this.gameState.player[player].riotIdGameName !== champion.displayName && this.gameState.player[player].championName !== champion.name && this.gameState.player[player].championId !== champion.name)
                    continue;
                this.gameState.player[player].experience = champion.experience;
                this.gameState.player[player].currentGold = champion.currentGold;
                this.gameState.player[player].totalGold = champion.totalGold;
            }
            if (champion.team === 100) {
                gold100 += champion.totalGold;
            }
            else if (champion.team === 200) {
                gold200 += champion.totalGold;
            }
        }
        this.gameState.goldGraph[Math.round(farsightData.gameTime)] = gold100 - gold200;
        this.gameState.gold[100] = gold100;
        this.gameState.gold[200] = gold200;
        const state = this.convertGameState();
        setTimeout(() => {
            this.ctx.LPTE.emit({
                meta: {
                    namespace: this.namespace,
                    type: 'update',
                    version: 1
                },
                state
            });
        }, this.config.delay / 2);
    }
    handelEvent(event) {
        if (!Object.values(InGameEvent_1.EventType).includes(event.eventname))
            return;
        if (event.eventname === InGameEvent_1.EventType.StructureKill)
            return;
        setTimeout(() => {
            var _a, _b, _c, _d, _e;
            const team = event.sourceTeam === InGameEvent_1.TeamType.Order ? 100 : 200;
            const time = (_b = (_a = this.gameData[this.gameData.length - 1]) === null || _a === void 0 ? void 0 : _a.gameData.gameTime) !== null && _b !== void 0 ? _b : 0;
            if (event.eventname === InGameEvent_1.EventType.TurretPlateDestroyed) {
                const split = event.other.split('_');
                const lane = split[2];
                this.gameState.platings[team][lane] += 1;
                this.ctx.LPTE.emit({
                    meta: {
                        namespace: this.namespace,
                        type: 'platings-update',
                        version: 1
                    },
                    platings: this.gameState.platings
                });
                return;
            }
            this.gameState.objectives[team].push({
                type: event.eventname,
                mob: event.other,
                time
            });
            this.updateState();
            if (event.eventname === InGameEvent_1.EventType.DragonKill &&
                ((_c = this.config.events) === null || _c === void 0 ? void 0 : _c.includes('Dragons'))) {
                if (event.other === InGameEvent_1.MobType.ElderDragon) {
                    this.elderKill(event);
                }
                this.ctx.LPTE.emit({
                    meta: {
                        namespace: this.namespace,
                        type: 'event',
                        version: 1
                    },
                    name: 'Dragon',
                    type: this.convertDragon(event.other),
                    team,
                    time
                });
            }
            else if (event.eventname === InGameEvent_1.EventType.BaronKill &&
                ((_d = this.config.events) === null || _d === void 0 ? void 0 : _d.includes('Barons'))) {
                this.baronKill(event);
            }
            else if (event.eventname === InGameEvent_1.EventType.HeraldKill &&
                ((_e = this.config.events) === null || _e === void 0 ? void 0 : _e.includes('Heralds'))) {
                this.ctx.LPTE.emit({
                    meta: {
                        namespace: this.namespace,
                        type: 'event',
                        version: 1
                    },
                    name: 'Herald',
                    type: 'Herald',
                    team,
                    time
                });
            }
        }, this.config.delay);
    }
    convertDragon(dragon) {
        switch (dragon) {
            case InGameEvent_1.MobType.HextechDragon:
                return 'Hextech';
            case InGameEvent_1.MobType.ChemtechDragon:
                return 'Chemtech';
            case InGameEvent_1.MobType.CloudDragon:
                return 'Cloud';
            case InGameEvent_1.MobType.ElderDragon:
                return 'Elder';
            case InGameEvent_1.MobType.InfernalDragon:
                return 'Infernal';
            case InGameEvent_1.MobType.MountainDragon:
                return 'Mountain';
            case InGameEvent_1.MobType.OceanDragon:
                return 'Ocean';
            default:
                return 'Air';
        }
    }
    baronKill(event) {
        var _a;
        const cAllGameData = this.gameData[this.gameData.length - 1];
        const team = event.sourceTeam === InGameEvent_1.TeamType.Order ? 100 : 200;
        const time = Math.round(((_a = cAllGameData === null || cAllGameData === void 0 ? void 0 : cAllGameData.gameData) === null || _a === void 0 ? void 0 : _a.gameTime) || 0);
        const type = 'Baron';
        this.ctx.LPTE.emit({
            meta: {
                namespace: this.namespace,
                type: 'event',
                version: 1
            },
            name: 'Baron',
            type,
            team,
            time
        });
        if (!this.config.ppTimer)
            return;
        const respawnAt = time + 60 * 3;
        const data = {
            time,
            ongoing: true,
            goldDiff: 1500,
            goldBaseBlue: this.gameState.gold[100],
            goldBaseRed: this.gameState.gold[200],
            alive: cAllGameData.allPlayers
                .filter((p) => !p.isDead &&
                (team === 100 ? p.team === 'ORDER' : p.team === 'CHAOS'))
                .map((p) => p.riotIdGameName),
            dead: cAllGameData.allPlayers
                .filter((p) => p.isDead && (team === 100 ? p.team === 'ORDER' : p.team === 'CHAOS'))
                .map((p) => p.riotIdGameName),
            team,
            respawnAt: respawnAt,
            respawnIn: 60 * 3,
            percent: 100
        };
        this.ctx.LPTE.emit({
            meta: {
                namespace: this.namespace,
                type: 'pp-update',
                version: 1
            },
            type,
            team,
            goldDiff: data.goldDiff,
            ongoing: data.ongoing,
            percent: data.percent,
            respawnIn: data.respawnIn,
            respawnAt: data.respawnAt
        });
        this.actions.set(type + '-' + (0, crypto_1.randomUUID)(), (allGameData, i) => {
            const gameState = allGameData.gameData;
            const diff = respawnAt - Math.round(gameState.gameTime);
            const percent = Math.round((diff * 100) / (60 * 3));
            const goldDifBlue = this.gameState.gold[100] - data.goldBaseBlue;
            const goldDifRed = this.gameState.gold[200] - data.goldBaseRed;
            const goldDiff = team === 100 ? 1500 + goldDifBlue - goldDifRed : 1500 + goldDifRed - goldDifBlue;
            data.alive = allGameData.allPlayers
                .filter((p) => !p.isDead &&
                (team === 100 ? p.team === 'ORDER' : p.team === 'CHAOS') &&
                !data.dead.includes(p.riotIdGameName))
                .map((p) => p.riotIdGameName);
            data.dead = [
                ...data.dead,
                ...allGameData.allPlayers
                    .filter((p) => p.isDead &&
                    (team === 100 ? p.team === 'ORDER' : p.team === 'CHAOS'))
                    .map((p) => p.riotIdGameName)
            ];
            this.ctx.LPTE.emit({
                meta: {
                    namespace: this.namespace,
                    type: 'pp-update',
                    version: 1
                },
                type: 'Baron',
                team,
                goldDiff,
                ongoing: data.ongoing,
                percent,
                respawnIn: diff
            });
            if (diff <= 0 ||
                data.alive.length <= 0 ||
                time > gameState.gameTime + this.config.delay / 1000) {
                data.ongoing = false;
                this.ctx.LPTE.emit({
                    meta: {
                        namespace: this.namespace,
                        type: 'pp-update',
                        version: 1
                    },
                    type: 'Baron',
                    team,
                    goldDiff,
                    ongoing: data.ongoing,
                    percent: 100,
                    respawnIn: 60 * 3
                });
                this.actions.delete(i);
            }
        });
    }
    elderKill(event) {
        var _a;
        const cAllGameData = this.gameData[this.gameData.length - 1];
        const team = event.sourceTeam === InGameEvent_1.TeamType.Order ? 100 : 200;
        const time = Math.round(((_a = cAllGameData === null || cAllGameData === void 0 ? void 0 : cAllGameData.gameData) === null || _a === void 0 ? void 0 : _a.gameTime) || 0);
        const type = 'Dragon';
        this.ctx.LPTE.emit({
            meta: {
                namespace: this.namespace,
                type: 'event',
                version: 1
            },
            name: 'Elder',
            type,
            team,
            time
        });
        if (!this.config.ppTimer)
            return;
        const respawnAt = time + 60 * 3;
        const data = {
            time,
            ongoing: true,
            goldDiff: 1500,
            goldBaseBlue: this.gameState.gold[100],
            goldBaseRed: this.gameState.gold[200],
            alive: cAllGameData.allPlayers
                .filter((p) => !p.isDead &&
                (team === 100 ? p.team === 'ORDER' : p.team === 'CHAOS'))
                .map((p) => p.riotIdGameName),
            dead: cAllGameData.allPlayers
                .filter((p) => p.isDead && (team === 100 ? p.team === 'ORDER' : p.team === 'CHAOS'))
                .map((p) => p.riotIdGameName),
            team,
            respawnAt: respawnAt,
            respawnIn: 60 * 3,
            percent: 100
        };
        this.ctx.LPTE.emit({
            meta: {
                namespace: this.namespace,
                type: 'pp-update',
                version: 1
            },
            type,
            team,
            goldDiff: data.goldDiff,
            ongoing: data.ongoing,
            percent: data.percent,
            respawnIn: data.respawnIn,
            respawnAt: data.respawnAt
        });
        this.actions.set(type + '-' + (0, crypto_1.randomUUID)(), (allGameData, i) => {
            const gameState = allGameData.gameData;
            const diff = respawnAt - Math.round(gameState.gameTime);
            const percent = Math.round((diff * 100) / (60 * 3));
            const goldDifBlue = this.gameState.gold[100] - data.goldBaseBlue;
            const goldDifRed = this.gameState.gold[200] - data.goldBaseRed;
            const goldDiff = team === 100 ? 1500 + goldDifBlue - goldDifRed : 1500 + goldDifRed - goldDifBlue;
            data.alive = allGameData.allPlayers
                .filter((p) => !p.isDead &&
                (team === 100 ? p.team === 'ORDER' : p.team === 'CHAOS') &&
                !data.dead.includes(p.riotIdGameName))
                .map((p) => p.riotIdGameName);
            data.dead = [
                ...data.dead,
                ...allGameData.allPlayers
                    .filter((p) => p.isDead &&
                    (team === 100 ? p.team === 'ORDER' : p.team === 'CHAOS'))
                    .map((p) => p.riotIdGameName)
            ];
            this.ctx.LPTE.emit({
                meta: {
                    namespace: this.namespace,
                    type: 'pp-update',
                    version: 1
                },
                type: 'Dragon',
                team,
                goldDiff,
                ongoing: data.ongoing,
                percent,
                respawnIn: diff
            });
            if (diff <= 0 ||
                data.alive.length <= 0 ||
                time > gameState.gameTime + this.config.delay / 1000) {
                data.ongoing = false;
                this.ctx.LPTE.emit({
                    meta: {
                        namespace: this.namespace,
                        type: 'pp-update',
                        version: 1
                    },
                    type: 'Dragon',
                    team,
                    goldDiff,
                    ongoing: data.ongoing,
                    percent: 100,
                    respawnIn: 60 * 3
                });
                this.actions.delete(i);
            }
        });
    }
    checkPlayerUpdate(allGameData) {
        if (allGameData.allPlayers.length === 0)
            return;
        this.gameState.kills[100] = allGameData.allPlayers.filter(p => p.team === "ORDER").reduce((v, c) => v + c.scores.kills, 0);
        this.gameState.kills[200] = allGameData.allPlayers.filter(p => p.team === "CHAOS").reduce((v, c) => v + c.scores.kills, 0);
        allGameData.allPlayers.forEach((player, i) => {
            this.checkNameUpdate(player, i);
            this.checkLevelUpdate(player, i);
            this.checkItemUpdate(player, i);
            this.checkAliveUpdate(player, i);
        });
    }
    checkNameUpdate(currentPlayerState, id) {
        var _a, _b, _c, _d;
        if (this.gameState.player[id] === undefined || ((_a = this.gameState.player[id]) === null || _a === void 0 ? void 0 : _a.riotIdGameName) === currentPlayerState.riotIdGameName)
            return;
        this.gameState.player[id].riotIdGameName = currentPlayerState.riotIdGameName;
        const member = (_c = (_b = this.state.lcu.lobby) === null || _b === void 0 ? void 0 : _b.members) === null || _c === void 0 ? void 0 : _c.find((m) => m.riotIdGameName === currentPlayerState.riotIdGameName);
        this.gameState.player[id].nickname =
            (_d = member === null || member === void 0 ? void 0 : member.nickname) !== null && _d !== void 0 ? _d : currentPlayerState.riotIdGameName;
        this.updateState();
        this.ctx.LPTE.emit({
            meta: {
                type: 'name-update',
                namespace: this.namespace,
                version: 1
            },
            team: currentPlayerState.team === 'ORDER' ? 100 : 200,
            player: id,
            nickname: this.gameState.player[id].nickname
        });
    }
    checkLevelUpdate(currentPlayerState, id) {
        var _a;
        if (this.gameState.player[id] === undefined || currentPlayerState.isDead === ((_a = this.gameState.player[id]) === null || _a === void 0 ? void 0 : _a.isDead))
            return;
        this.gameState.player[id].isDead = currentPlayerState.isDead;
        this.updateState();
        this.ctx.LPTE.emit({
            meta: {
                type: 'is-dead-update',
                namespace: this.namespace,
                version: 1
            },
            team: currentPlayerState.team === 'ORDER' ? 100 : 200,
            player: id,
            isDead: currentPlayerState.isDead
        });
    }
    checkAliveUpdate(currentPlayerState, id) {
        var _a;
        if (this.gameState.player[id] === undefined || currentPlayerState.level <= ((_a = this.gameState.player[id]) === null || _a === void 0 ? void 0 : _a.level))
            return;
        this.gameState.player[id].level = currentPlayerState.level;
        this.updateState();
        if (!this.config.level.includes(currentPlayerState.level.toString()))
            return;
        this.ctx.LPTE.emit({
            meta: {
                type: 'level-update',
                namespace: this.namespace,
                version: 1
            },
            team: currentPlayerState.team === 'ORDER' ? 100 : 200,
            player: id,
            level: currentPlayerState.level
        });
    }
    checkItemUpdate(currentPlayerState, id) {
        if (this.gameState.player[id] === undefined)
            return;
        const previousItems = this.gameState.player[id].items;
        if (previousItems.has(3513)) {
            if (!currentPlayerState.items.find((i) => i.itemID === 3513)) {
                previousItems.delete(3513);
            }
        }
        for (const item of currentPlayerState.items) {
            const itemID = item.itemID;
            if (previousItems.has(itemID))
                continue;
            const itemBinFind = this.statics.itemBin.find((i) => i.itemID === itemID);
            if (itemBinFind === undefined)
                continue;
            if (itemID === 3513) {
                this.handelEvent({
                    eventname: InGameEvent_1.EventType.HeraldKill,
                    other: InGameEvent_1.MobType.Herald,
                    otherTeam: InGameEvent_1.TeamType.Neutral,
                    source: currentPlayerState.riotIdGameName,
                    sourceID: id,
                    sourceTeam: currentPlayerState.team === 'CHAOS'
                        ? InGameEvent_1.TeamType.Chaos
                        : InGameEvent_1.TeamType.Order
                });
                this.gameState.player[id].items.add(itemID);
                return;
            }
            if (!this.itemEpicness.includes(itemBinFind.epicness))
                continue;
            if (itemBinFind.epicness !== 7 && item.consumable)
                continue;
            this.gameState.player[id].items.add(itemID);
            this.updateState();
            this.ctx.LPTE.emit({
                meta: {
                    type: 'item-update',
                    namespace: this.namespace,
                    version: 1
                },
                team: currentPlayerState.team === 'ORDER' ? 100 : 200,
                player: id,
                item: itemID
            });
        }
    }
    checkEventUpdate(allGameData, previousGameData) {
        if (allGameData.events.Events.length === 0)
            return;
        const newEvents = allGameData.events.Events.slice(previousGameData.events.Events.length || 0);
        newEvents.forEach((event) => {
            if (event.EventName === 'InhibKilled') {
                this.handleInhibEvent(event, allGameData);
            }
            else if (event.EventName === 'TurretKilled') {
                this.handleTowerEvent(event, allGameData);
            }
            else if (event.EventName === 'ChampionKill') {
                this.handleKillEvent(event, allGameData);
            }
        });
    }
    handleInhibEvent(event, allGameData) {
        var _a;
        const split = event.InhibKilled.split('_');
        const team = split[1] === 'TOrder' ? 100 : 200;
        const lane = split[2];
        const respawnAt = Math.round(event.EventTime) + 60 * 5;
        const time = event.EventTime;
        if (!this.gameState.inhibitors[team][lane].alive)
            return;
        this.gameState.inhibitors[team][lane] = {
            alive: false,
            respawnAt: respawnAt,
            respawnIn: 60 * 5,
            percent: 100,
            time
        };
        this.updateState();
        this.actions.set(event.InhibKilled, (allGameData, i) => {
            const gameState = allGameData.gameData;
            const diff = respawnAt - Math.round(gameState.gameTime);
            const percent = Math.round((diff * 100) / (60 * 5));
            this.gameState.inhibitors[team][lane] = {
                alive: false,
                respawnAt: respawnAt,
                respawnIn: diff,
                percent: 100,
                time: this.gameState.inhibitors[team][lane].time
            };
            this.ctx.LPTE.emit({
                meta: {
                    namespace: this.namespace,
                    type: 'inhib-update',
                    version: 1
                },
                team,
                lane,
                percent,
                respawnIn: diff
            });
            if (diff <= 0 || time > gameState.gameTime) {
                this.gameState.inhibitors[team][lane] = {
                    alive: true,
                    respawnAt: 0,
                    respawnIn: 0,
                    percent: 0,
                    time: 0
                };
                this.updateState();
                this.actions.delete(i);
            }
        });
        if (this.config.killfeed) {
            this.ctx.LPTE.emit({
                meta: {
                    namespace: this.namespace,
                    type: 'kill-update',
                    version: 1
                },
                assists: event.Assisters.map((a) => {
                    var _a;
                    return (_a = allGameData.allPlayers
                        .find((p) => {
                        return p.riotIdGameName === a;
                    })) === null || _a === void 0 ? void 0 : _a.rawChampionName.split('_')[3];
                }),
                other: 'Inhib',
                source: event.KillerName.startsWith('Minion')
                    ? 'Minion'
                    : event.KillerName.startsWith('SRU_Herald')
                        ? 'Herald'
                        : // TODO Thats for all other creeps for now until we have some better icons for them
                            event.KillerName.startsWith('SRU')
                                ? 'Minion'
                                : (_a = allGameData.allPlayers
                                    .find((p) => {
                                    return p.riotIdGameName === event.KillerName;
                                })) === null || _a === void 0 ? void 0 : _a.rawChampionName.split('_')[3],
                team: team === 100 ? 200 : 100
            });
        }
    }
    handleTowerEvent(event, allGameData) {
        var _a;
        if (event.TurretKilled === 'Obelisk')
            return;
        const split = event.TurretKilled.split('_');
        const team = split[1] === 'TOrder' ? 100 : 200;
        const lane = split[2];
        const turret = split[3];
        if (this.config.killfeed) {
            this.ctx.LPTE.emit({
                meta: {
                    namespace: this.namespace,
                    type: 'kill-update',
                    version: 1
                },
                assists: event.Assisters.map((a) => {
                    var _a;
                    return (_a = allGameData.allPlayers
                        .find((p) => {
                        return p.riotIdGameName === a;
                    })) === null || _a === void 0 ? void 0 : _a.rawChampionName.split('_')[3];
                }),
                other: 'Turret',
                source: event.KillerName.startsWith('Minion')
                    ? 'Minion'
                    : event.KillerName.startsWith('SRU_Herald')
                        ? 'Herald'
                        : // TODO Thats for all other creeps for now until we have some better icons for them
                            event.KillerName.startsWith('SRU')
                                ? 'Minion'
                                : (_a = allGameData.allPlayers
                                    .find((p) => {
                                    return p.riotIdGameName === event.KillerName;
                                })) === null || _a === void 0 ? void 0 : _a.rawChampionName.split('_')[3],
                team: team === 100 ? 200 : 100
            });
        }
        if (this.gameState.towers[team][lane][turret] === false)
            return;
        this.gameState.towers[team][lane][turret] = false;
        this.updateState();
        this.ctx.LPTE.emit({
            meta: {
                namespace: this.namespace,
                type: 'tower-update',
                version: 1
            },
            team,
            lane,
            turret
        });
    }
    handleKillEvent(event, allGameData) {
        var _a, _b, _c;
        if (!this.config.killfeed)
            return;
        this.ctx.LPTE.emit({
            meta: {
                namespace: this.namespace,
                type: 'kill-update',
                version: 1
            },
            assists: event.Assisters.map((a) => {
                var _a;
                return (_a = allGameData.allPlayers
                    .find((p) => {
                    return p.riotIdGameName === a;
                })) === null || _a === void 0 ? void 0 : _a.rawChampionName.split('_')[3];
            }),
            other: (_a = allGameData.allPlayers
                .find((p) => {
                return p.riotIdGameName === event.VictimName;
            })) === null || _a === void 0 ? void 0 : _a.rawChampionName.split('_')[3],
            source: event.KillerName.startsWith('Minion')
                ? 'Minion'
                : event.KillerName.startsWith('Turret')
                    ? 'Turret'
                    : event.KillerName.startsWith('SRU_Baron')
                        ? 'Baron'
                        : event.KillerName.startsWith('SRU_Herald')
                            ? 'Herald'
                            : event.KillerName.startsWith('SRU_Dragon')
                                ? 'Dragon'
                                : // TODO Thats for all other creeps for now until we have some better icons for them
                                    event.KillerName.startsWith('SRU')
                                        ? 'Minion'
                                        : (_b = allGameData.allPlayers
                                            .find((p) => {
                                            return p.riotIdGameName === event.KillerName;
                                        })) === null || _b === void 0 ? void 0 : _b.rawChampionName.split('_')[3],
            team: ((_c = allGameData.allPlayers.find((p) => {
                return p.riotIdGameName === event.VictimName;
            })) === null || _c === void 0 ? void 0 : _c.team) === 'CHAOS'
                ? 100
                : 200
        });
    }
}
exports.InGameState = InGameState;
//# sourceMappingURL=InGameState.js.map