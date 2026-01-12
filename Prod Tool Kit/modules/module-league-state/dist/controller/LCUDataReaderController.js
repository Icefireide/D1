"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LCUDataReaderController = exports.PickBanPhase = void 0;
const Controller_1 = require("./Controller");
const LeagueState_1 = require("../LeagueState");
const convertState_1 = require("../champselect/convertState");
const plugin_1 = require("../plugin");
var PickBanPhase;
(function (PickBanPhase) {
    PickBanPhase["GAME_STARTING"] = "GAME_STARTING";
    PickBanPhase["FINALIZATION"] = "FINALIZATION";
})(PickBanPhase || (exports.PickBanPhase = PickBanPhase = {}));
class LCUDataReaderController extends Controller_1.Controller {
    constructor(pluginContext, recordChampselect) {
        super(pluginContext);
        this.recordChampselect = recordChampselect;
        this.replayIsPlaying = false;
        this.replayPlayer = [];
        this.recording = [];
        this.emitChampSelectUpdate = this.emitChampSelectUpdate.bind(this);
    }
    emitChampSelectUpdate() {
        this.pluginContext.LPTE.emit({
            meta: {
                namespace: this.pluginContext.plugin.module.getName(),
                type: 'champselect-update',
                version: 1
            },
            data: {
                ...(0, convertState_1.convertState)(LeagueState_1.state, LeagueState_1.state.lcu.champselect, plugin_1.leagueStatic),
                showSummoners: LeagueState_1.state.lcu.champselect.showSummoners
            },
            order: LeagueState_1.state.lcu.champselect.order !== undefined
                ? {
                    ...(0, convertState_1.convertState)(LeagueState_1.state, LeagueState_1.state.lcu.champselect.order, plugin_1.leagueStatic)
                }
                : undefined,
            isActive: LeagueState_1.state.lcu.champselect._available
        });
    }
    emitLobbyUpdate() {
        this.pluginContext.LPTE.emit({
            meta: {
                namespace: this.pluginContext.plugin.module.getName(),
                type: 'lobby-update',
                version: 1
            },
            data: LeagueState_1.state.lcu.lobby
        });
    }
    replayChampselect() {
        if (this.recording.length <= 0)
            return;
        this.replayIsPlaying = true;
        for (let i = 0; i < this.recording.length; i++) {
            const event = this.recording[i];
            this.replayPlayer.push(setTimeout(() => {
                this.pluginContext.LPTE.emit({
                    meta: {
                        namespace: this.pluginContext.plugin.module.getName(),
                        type: 'champselect-update',
                        version: 1
                    },
                    data: {
                        ...event,
                        showSummoners: event.phase !== PickBanPhase.GAME_STARTING &&
                            event.phase === PickBanPhase.GAME_STARTING
                    },
                    isActive: i >= this.recording.length
                });
                if (this.refreshTask) {
                    clearInterval(this.refreshTask);
                    this.refreshTask = undefined;
                }
                this.refreshTask = setInterval(() => {
                    if (event.timer > 0) {
                        event.timer -= 1;
                    }
                    this.pluginContext.LPTE.emit({
                        meta: {
                            namespace: this.pluginContext.plugin.module.getName(),
                            type: 'champselect-update',
                            version: 1
                        },
                        data: {
                            ...event
                        },
                        isActive: i >= this.recording.length
                    });
                }, 1000);
                if (i >= this.recording.length - 1) {
                    this.replayIsPlaying = false;
                    if (this.refreshTask) {
                        clearInterval(this.refreshTask);
                        this.refreshTask = undefined;
                    }
                }
            }, event.timeAfterStart));
        }
    }
    stopReplay() {
        this.replayIsPlaying = false;
        if (this.refreshTask)
            clearInterval(this.refreshTask);
        this.refreshTask = undefined;
        this.replayPlayer.forEach((r) => {
            clearTimeout(r);
        });
    }
    addOrUpdatePlayer(player) {
        var _a, _b;
        if (player.isSpectator)
            return;
        const teamId = LeagueState_1.state.lcu.lobby.gameConfig.customTeam100.findIndex((p) => p.puuid === player.puuid) >= 0 ? 100 : 200;
        const team = teamId === 100 ? LeagueState_1.state.lcu.lobby.gameConfig.customTeam100 : LeagueState_1.state.lcu.lobby.gameConfig.customTeam200;
        const i = team.findIndex((p) => p.puuid === player.puuid);
        const member = LeagueState_1.state.lcu.lobby.members.find((m) => m && m.puuid === player.puuid);
        const lcuPosition = teamId === 100
            ? i
            : i + LeagueState_1.state.lcu.lobby.gameConfig.customTeam100.length;
        if (LeagueState_1.state.lcu.lobby.playerOrder.has(player.summonerName)) {
            if (i !== LeagueState_1.state.lcu.lobby.playerOrder.get(player.summonerName)[2]) {
                LeagueState_1.state.lcu.lobby.playerOrder.get(player.summonerName)[1] = i;
                LeagueState_1.state.lcu.lobby.playerOrder.get(player.summonerName)[2] = i;
                return {
                    nickname: (_a = member === null || member === void 0 ? void 0 : member.nickname) !== null && _a !== void 0 ? _a : player.summonerName,
                    ...player,
                    lcuPosition,
                    sortedPosition: i,
                    elo: team[i].elo,
                    teamId
                };
            }
            else {
                return {
                    nickname: (_b = member === null || member === void 0 ? void 0 : member.nickname) !== null && _b !== void 0 ? _b : player.summonerName,
                    ...player,
                    lcuPosition,
                    sortedPosition: LeagueState_1.state.lcu.lobby.playerOrder.get(player.summonerName)[2],
                    elo: team[i].elo,
                    teamId
                };
            }
        }
        else {
            LeagueState_1.state.lcu.lobby.playerOrder.set(player.summonerName, [
                teamId,
                lcuPosition,
                lcuPosition
            ]);
            return {
                nickname: player.summonerName,
                ...player,
                lcuPosition,
                sortedPosition: lcuPosition,
                elo: team[i].elo,
                teamId
            };
        }
    }
    async handle(event) {
        var _a;
        // Lobby
        if (event.meta.type === 'lcu-lobby-create') {
            LeagueState_1.state.lcu.lobby = { ...LeagueState_1.state.lcu.lobby, ...event.data };
            LeagueState_1.state.lcu.lobby._available = true;
            LeagueState_1.state.lcu.lobby._created = new Date();
            LeagueState_1.state.lcu.lobby._updated = new Date();
            LeagueState_1.state.lcu.lobby.playerOrder = new Map();
            LeagueState_1.state.lcu.lobby.members = event.data.members
                .map((player) => {
                return this.addOrUpdatePlayer(player);
            })
                .sort((a, b) => {
                return a.sortedPosition < b.sortedPosition
                    ? -1
                    : a.sortedPosition > b.sortedPosition
                        ? 1
                        : 0;
            });
            this.pluginContext.log.info('Flow: lobby - active');
            this.emitLobbyUpdate();
        }
        if (event.meta.type === 'lcu-lobby-update') {
            LeagueState_1.state.lcu.lobby = Object.assign(LeagueState_1.state.lcu.lobby, event.data, { members: LeagueState_1.state.lcu.lobby.members });
            LeagueState_1.state.lcu.lobby._available = true;
            LeagueState_1.state.lcu.lobby._updated = new Date();
            if (LeagueState_1.state.lcu.lobby.playerOrder === undefined) {
                LeagueState_1.state.lcu.lobby.playerOrder = new Map();
            }
            const members = event.data.members
                .map((player) => {
                return this.addOrUpdatePlayer(player);
            })
                .sort((a, b) => {
                return a.sortedPosition < b.sortedPosition
                    ? -1
                    : a.sortedPosition > b.sortedPosition
                        ? 1
                        : 0;
            });
            LeagueState_1.state.lcu.lobby.members = members;
            this.emitLobbyUpdate();
        }
        if (event.meta.type === 'lcu-lobby-delete') {
            LeagueState_1.state.lcu.lobby._available = false;
            LeagueState_1.state.lcu.lobby._deleted = new Date();
            LeagueState_1.state.lcu.lobby.playerOrder = new Map();
            this.pluginContext.log.info('Flow: lobby - inactive');
            this.emitLobbyUpdate();
        }
        // Champ select
        if (event.meta.type === 'lcu-champ-select-create') {
            LeagueState_1.state.lcu.champselect = { ...LeagueState_1.state.lcu.champselect, ...event.data };
            LeagueState_1.state.lcu.champselect._available = true;
            LeagueState_1.state.lcu.champselect._created = new Date();
            LeagueState_1.state.lcu.champselect._updated = new Date();
            this.recording = [];
            if (!this.refreshTask) {
                this.refreshTask = setInterval(this.emitChampSelectUpdate, 500);
            }
            if (this.recordChampselect) {
                this.recording.push((0, convertState_1.convertState)(LeagueState_1.state, LeagueState_1.state.lcu.champselect, plugin_1.leagueStatic));
            }
            if (!this.replayIsPlaying) {
                this.emitChampSelectUpdate();
            }
            this.pluginContext.log.info('Flow: champselect - active');
        }
        if (event.meta.type === 'lcu-champ-select-update') {
            if (event.data.timer.phase !== PickBanPhase.GAME_STARTING &&
                LeagueState_1.state.lcu.champselect.showSummoners) {
                LeagueState_1.state.lcu.champselect.showSummoners = false;
                this.pluginContext.log.info('Flow: champselect - reset summoners to not show');
            }
            if (!LeagueState_1.state.lcu.champselect._available) {
                LeagueState_1.state.lcu.champselect._available = true;
                LeagueState_1.state.lcu.champselect._created = new Date();
                LeagueState_1.state.lcu.champselect._updated = new Date();
                this.recording = [];
            }
            // Only trigger if event changes, to only load game once
            if (LeagueState_1.state.lcu.champselect &&
                LeagueState_1.state.lcu.champselect.timer &&
                LeagueState_1.state.lcu.champselect.timer.phase !== PickBanPhase.GAME_STARTING &&
                event.data.timer.phase === PickBanPhase.GAME_STARTING) {
                this.pluginContext.log.info('Flow: champselect - game started (spectator delay)');
                LeagueState_1.state.lcu.champselect.showSummoners = true;
                // Continue in flow
                this.pluginContext.LPTE.emit({
                    meta: {
                        namespace: this.pluginContext.plugin.module.getName(),
                        type: 'set-game',
                        version: 1
                    },
                    by: 'summonerName',
                    summonerName: (_a = LeagueState_1.state.lcu.lobby.members) === null || _a === void 0 ? void 0 : _a[0].summonerName
                });
            }
            // Only trigger if we're now in finalization, save order
            if (LeagueState_1.state.lcu.champselect &&
                LeagueState_1.state.lcu.champselect.timer &&
                LeagueState_1.state.lcu.champselect.timer.phase !== PickBanPhase.FINALIZATION &&
                event.data.timer.phase === PickBanPhase.FINALIZATION) {
                LeagueState_1.state.lcu.champselect.order = event.data;
            }
            let summonerState = LeagueState_1.state.lcu.champselect.showSummoners;
            LeagueState_1.state.lcu.champselect = { ...LeagueState_1.state.lcu.champselect, ...event.data };
            LeagueState_1.state.lcu.champselect.showSummoners = summonerState;
            LeagueState_1.state.lcu.champselect._available = true;
            LeagueState_1.state.lcu.champselect._updated = new Date();
            if (!this.refreshTask) {
                this.refreshTask = setInterval(this.emitChampSelectUpdate, 500);
            }
            if (this.recordChampselect) {
                this.recording.push((0, convertState_1.convertState)(LeagueState_1.state, LeagueState_1.state.lcu.champselect, plugin_1.leagueStatic));
            }
            if (!this.replayIsPlaying) {
                this.emitChampSelectUpdate();
            }
        }
        if (event.meta.type === 'lcu-champ-select-delete') {
            LeagueState_1.state.lcu.champselect._available = false;
            LeagueState_1.state.lcu.champselect._deleted = new Date();
            if (this.refreshTask) {
                clearInterval(this.refreshTask);
                this.refreshTask = undefined;
            }
            if (this.recordChampselect) {
                this.recording.push((0, convertState_1.convertState)(LeagueState_1.state, LeagueState_1.state.lcu.champselect, plugin_1.leagueStatic));
            }
            if (!this.replayIsPlaying) {
                this.emitChampSelectUpdate();
            }
            this.pluginContext.log.info('Flow: champselect - inactive');
        }
        // End of game
        if (event.meta.type === 'lcu-end-of-game-create') {
            LeagueState_1.state.lcu.eog = event.data;
            LeagueState_1.state.lcu.eog._available = true;
            // Also make sure post game is loaded
            this.pluginContext.LPTE.emit({
                meta: {
                    namespace: this.pluginContext.plugin.module.getName(),
                    type: 'set-game',
                    version: 1
                },
                by: 'gameId',
                gameId: event.data.gameId
            });
        }
        if (event.meta.type === 'lcu-end-of-game-update') {
            LeagueState_1.state.lcu.eog = event.data;
            LeagueState_1.state.lcu.eog._available = true;
            this.pluginContext.log.info('Flow: end of game - active');
            // Also make sure post game is loaded
            this.pluginContext.LPTE.emit({
                meta: {
                    namespace: this.pluginContext.plugin.module.getName(),
                    type: 'set-game',
                    version: 1
                },
                by: 'gameId',
                gameId: event.data.gameId
            });
        }
        if (event.meta.type === 'lcu-end-of-game-delete') {
            LeagueState_1.state.lcu.eog._available = false;
        }
    }
}
exports.LCUDataReaderController = LCUDataReaderController;
//# sourceMappingURL=LCUDataReaderController.js.map