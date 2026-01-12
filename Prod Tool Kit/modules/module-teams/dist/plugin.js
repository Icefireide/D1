"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const util_1 = require("util");
const dayjs_1 = __importDefault(require("dayjs"));
const initialState = {
    state: 'NO_MATCH',
    teams: {},
    bestOf: 1,
    roundOf: 2,
    tournamentName: ''
};
module.exports = async (ctx) => {
    const namespace = ctx.plugin.module.getName();
    let gfxState = initialState;
    // Register new UI page
    ctx.LPTE.emit({
        meta: {
            type: 'add-pages',
            namespace: 'ui',
            version: 1
        },
        pages: [
            {
                name: `Teams`,
                frontend: 'frontend',
                id: `op-${namespace}`
            }
        ]
    });
    // Answer requests to get state
    ctx.LPTE.on(namespace, 'request-current', async (e) => {
        ctx.LPTE.emit({
            meta: {
                type: e.meta.reply,
                namespace: 'reply',
                version: 1
            },
            state: gfxState.state,
            teams: gfxState.teams,
            bestOf: gfxState.bestOf,
            roundOf: gfxState.roundOf,
            tournamentName: gfxState.tournamentName
        });
    });
    ctx.LPTE.on(namespace, 'request-matches-of-the-day', async (e) => {
        const res = await ctx.LPTE.request({
            meta: {
                type: 'request',
                namespace: 'plugin-database',
                version: 1
            },
            collection: 'match',
            filter: (match) => match.date >= (0, dayjs_1.default)(new Date()).startOf('day').valueOf() &&
                match.date <= (0, dayjs_1.default)(new Date()).endOf('day').valueOf(),
            sort: (a, b) => a - b
        });
        ctx.LPTE.emit({
            meta: {
                type: e.meta.reply,
                namespace: 'reply',
                version: 1
            },
            matches: res
        });
    });
    ctx.LPTE.on(namespace, 'set', async (e) => {
        var _a, _b, _c, _d;
        if ((0, util_1.isDeepStrictEqual)(gfxState.teams, e.teams) &&
            gfxState.bestOf == e.bestOf &&
            gfxState.roundOf == e.roundOf &&
            gfxState.tournamentName == e.tournamentName)
            return;
        if (((_a = gfxState.teams.blueTeam) === null || _a === void 0 ? void 0 : _a.name) == e.teams.redTeam.name &&
            ((_b = gfxState.teams.redTeam) === null || _b === void 0 ? void 0 : _b.name) == e.teams.blueTeam.name) {
            ctx.LPTE.emit({
                meta: {
                    type: 'updateOne',
                    namespace: 'plugin-database',
                    version: 1
                },
                collection: 'match',
                id: gfxState.id,
                data: {
                    teams: {
                        blueTeam: e.teams.redTeam,
                        redTeam: e.teams.blueTeam
                    },
                    bestOf: e.bestOf,
                    roundOf: e.roundOf,
                    tournamentName: e.tournamentName
                }
            });
        }
        else if (((_c = gfxState.teams.blueTeam) === null || _c === void 0 ? void 0 : _c.name) == e.teams.blueTeam.name &&
            ((_d = gfxState.teams.redTeam) === null || _d === void 0 ? void 0 : _d.name) == e.teams.redTeam.name) {
            ctx.LPTE.emit({
                meta: {
                    type: 'updateOne',
                    namespace: 'plugin-database',
                    version: 1
                },
                collection: 'match',
                id: gfxState.id,
                data: {
                    teams: {
                        blueTeam: e.teams.blueTeam,
                        redTeam: e.teams.redTeam
                    },
                    bestOf: e.bestOf,
                    roundOf: e.roundOf,
                    tournamentName: e.tournamentName
                }
            });
        }
        else {
            const response = await ctx.LPTE.request({
                meta: {
                    type: 'insertOne',
                    namespace: 'plugin-database',
                    version: 1
                },
                collection: 'match',
                data: {
                    teams: {
                        blueTeam: e.teams.blueTeam,
                        redTeam: e.teams.redTeam
                    },
                    bestOf: e.bestOf,
                    roundOf: e.roundOf,
                    tournamentName: e.tournamentName,
                    date: new Date().getTime()
                }
            });
            if (response === undefined || response.id === undefined) {
                return ctx.log.warn('match could not be inserted');
            }
            gfxState.id = response.id;
        }
        gfxState.state = 'READY';
        gfxState.teams = e.teams;
        gfxState.bestOf = e.bestOf;
        gfxState.roundOf = e.roundOf;
        gfxState.tournamentName = e.tournamentName;
        ctx.LPTE.emit({
            meta: {
                type: 'update',
                namespace,
                version: 1
            },
            state: gfxState.state,
            teams: gfxState.teams,
            bestOf: gfxState.bestOf,
            roundOf: gfxState.roundOf,
            tournamentName: gfxState.tournamentName
        });
    });
    ctx.LPTE.on(namespace, 'swop', (e) => {
        if (gfxState.state !== 'READY')
            return;
        if (!gfxState.teams.redTeam || !gfxState.teams.blueTeam)
            return;
        gfxState.teams = {
            blueTeam: gfxState.teams.redTeam,
            redTeam: gfxState.teams.blueTeam
        };
        ctx.LPTE.emit({
            meta: {
                type: 'update',
                namespace,
                version: 1
            },
            state: gfxState.state,
            teams: gfxState.teams,
            bestOf: gfxState.bestOf,
            roundOf: gfxState.roundOf,
            tournamentName: gfxState.tournamentName
        });
    });
    ctx.LPTE.on(namespace, 'unset', (e) => {
        gfxState = {
            state: 'NO_MATCH',
            teams: {},
            bestOf: 1,
            roundOf: 2,
            tournamentName: ''
        };
        ctx.LPTE.emit({
            meta: {
                type: 'update',
                namespace,
                version: 1
            },
            state: gfxState.state,
            teams: gfxState.teams,
            bestOf: gfxState.bestOf,
            roundOf: gfxState.roundOf,
            tournamentName: gfxState.tournamentName
        });
    });
    ctx.LPTE.on(namespace, 'clear-matches', (e) => {
        ctx.LPTE.emit({
            meta: {
                namespace: 'plugin-database',
                type: 'delete',
                version: 1
            },
            collection: 'match',
            filter: {}
        });
        gfxState = {
            state: 'NO_MATCH',
            teams: {},
            bestOf: 1,
            roundOf: 2,
            tournamentName: ''
        };
        ctx.LPTE.emit({
            meta: {
                type: 'update',
                namespace,
                version: 1
            },
            state: gfxState.state,
            teams: gfxState.teams,
            bestOf: gfxState.bestOf,
            roundOf: gfxState.roundOf,
            tournamentName: gfxState.tournamentName
        });
    });
    ctx.LPTE.on(namespace, 'delete-team', async (e) => {
        await ctx.LPTE.request({
            meta: {
                type: 'deleteOne',
                namespace: 'plugin-database',
                version: 1
            },
            collection: 'team',
            id: e.id
        });
        const res = await ctx.LPTE.request({
            meta: {
                type: 'request',
                namespace: 'plugin-database',
                version: 1
            },
            collection: 'team',
            limit: 30
        });
        if (res === undefined || res.data === undefined) {
            ctx.log.warn('teams could not be loaded');
        }
        ctx.LPTE.emit({
            meta: {
                type: 'update-teams-set',
                namespace,
                version: 1
            },
            teams: res === null || res === void 0 ? void 0 : res.data
        });
    });
    ctx.LPTE.on(namespace, 'add-team', async (e) => {
        await ctx.LPTE.request({
            meta: {
                type: 'insertOne',
                namespace: 'plugin-database',
                version: 1
            },
            collection: 'team',
            data: {
                logo: e.logo,
                name: e.name,
                tag: e.tag,
                color: e.color,
                standing: e.standing,
                coach: e.coach
            }
        });
        const res = await ctx.LPTE.request({
            meta: {
                type: 'request',
                namespace: 'plugin-database',
                version: 1
            },
            collection: 'team',
            limit: 30
        });
        if (res === undefined || res.data === undefined) {
            ctx.log.warn('teams could not be loaded');
        }
        ctx.LPTE.emit({
            meta: {
                type: 'update-teams-set',
                namespace,
                version: 1
            },
            teams: res === null || res === void 0 ? void 0 : res.data
        });
    });
    ctx.LPTE.on(namespace, 'update-team', async (e) => {
        await ctx.LPTE.request({
            meta: {
                type: 'updateOne',
                namespace: 'plugin-database',
                version: 1
            },
            collection: 'team',
            id: e.id,
            data: {
                logo: e.logo,
                name: e.name,
                tag: e.tag,
                color: e.color,
                standing: e.standing,
                coach: e.coach
            }
        });
        const res = await ctx.LPTE.request({
            meta: {
                type: 'request',
                namespace: 'plugin-database',
                version: 1
            },
            collection: 'team',
            limit: 30
        });
        if (res === undefined || res.data === undefined) {
            ctx.log.warn('teams could not be loaded');
        }
        ctx.LPTE.emit({
            meta: {
                type: 'update-teams-set',
                namespace,
                version: 1
            },
            teams: res === null || res === void 0 ? void 0 : res.data
        });
    });
    ctx.LPTE.on(namespace, 'request-teams', async (e) => {
        const res = await ctx.LPTE.request({
            meta: {
                type: 'request',
                namespace: 'plugin-database',
                version: 1
            },
            collection: 'team',
            limit: 30
        });
        if (res === undefined || res.data === undefined) {
            ctx.log.warn('teams could not be loaded');
        }
        ctx.LPTE.emit({
            meta: {
                type: e.meta.reply,
                namespace: 'reply',
                version: 1
            },
            teams: res === null || res === void 0 ? void 0 : res.data
        });
    });
    if (gfxState.state == 'NO_MATCH') {
        const res = await ctx.LPTE.request({
            meta: {
                type: 'request',
                namespace: 'plugin-database',
                version: 1
            },
            collection: 'match',
            filter: (match) => match.date >= (0, dayjs_1.default)(new Date()).startOf('day').valueOf() &&
                match.date <= (0, dayjs_1.default)(new Date()).endOf('day').valueOf(),
            sort: (a, b) => a - b,
            limit: 1
        });
        if (res === undefined || res.data === undefined) {
            return ctx.log.warn('matches could not be loaded');
        }
        if (res.data[0]) {
            gfxState.state = 'READY';
            gfxState.teams = res.data[0].teams;
            gfxState.bestOf = res.data[0].bestOf;
            gfxState.id = res.data[0].id;
            gfxState.roundOf = res.data[0].roundOf;
        }
    }
    ctx.LPTE.emit({
        meta: {
            namespace,
            type: 'teams-loaded',
            version: 1
        },
        state: gfxState.state,
        teams: gfxState.teams,
        bestOf: gfxState.bestOf,
        roundOf: gfxState.roundOf,
        tournamentName: gfxState.tournamentName
    });
    // Emit event that we're ready to operate
    ctx.LPTE.emit({
        meta: {
            type: 'plugin-status-change',
            namespace: 'lpt',
            version: 1
        },
        status: 'RUNNING'
    });
};
//# sourceMappingURL=plugin.js.map