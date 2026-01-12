"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const twisted_1 = require("twisted");
const constants_1 = require("twisted/dist/constants");
const account_1 = require("twisted/dist/apis/riot/account/account");
const sleep = async (ms) => new Promise((resolve) => setTimeout(resolve, ms));
function getRegionByServer(server) {
    switch (server) {
        case 'PBE1':
            return constants_1.Regions.PBE;
        case 'OC1':
        case 'PH2':
        case 'SG2':
        case 'TH2':
        case 'TW2':
        case 'VN2':
            return constants_1.Regions.OCEANIA;
        case 'NA1':
            return constants_1.Regions.AMERICA_NORTH;
        case 'LA1':
            return constants_1.Regions.LAT_NORTH;
        case 'LA2':
            return constants_1.Regions.LAT_SOUTH;
        case 'BR1':
            return constants_1.Regions.BRAZIL;
        case 'KR':
            return constants_1.Regions.KOREA;
        case 'JP1':
            return constants_1.Regions.JAPAN;
        case 'EUW1':
            return constants_1.Regions.EU_WEST;
        case 'EUN1':
            return constants_1.Regions.EU_EAST;
        case 'TR1':
            return constants_1.Regions.TURKEY;
        case 'RU':
            return constants_1.Regions.RUSSIA;
        case 'TR1':
            return constants_1.Regions.TURKEY;
        default:
            return constants_1.Regions.EU_EAST;
    }
}
function getRegionGroupByServer(server) {
    switch (server) {
        case 'OC1':
        case 'PH2':
        case 'SG2':
        case 'TH2':
        case 'TW2':
        case 'VN2':
            return constants_1.RegionGroups.SEA;
        case 'NA1':
        case 'BR1':
        case 'LA1':
        case 'LA2':
            return constants_1.RegionGroups.AMERICAS;
        case 'KR':
        case 'JP1':
            return constants_1.RegionGroups.ASIA;
        case 'EUN1':
        case 'EUW1':
        case 'TR1':
        case 'RU':
            return constants_1.RegionGroups.EUROPE;
        default:
            return constants_1.RegionGroups.EUROPE;
    }
}
module.exports = async (ctx) => {
    const namespace = ctx.plugin.module.getName();
    const configRes = await ctx.LPTE.request({
        meta: {
            type: 'request',
            namespace: 'plugin-config',
            version: 1
        }
    });
    if (configRes === undefined) {
        ctx.log.warn('config could not be loaded');
    }
    let config = Object.assign({
        apiKey: 'RGAPI-SECRETKEY',
        server: 'EUW1'
    }, configRes === null || configRes === void 0 ? void 0 : configRes.config);
    const key = config.apiKey;
    const server = (config.server || 'EUW1');
    const region = getRegionByServer(server);
    const regionGroup = getRegionGroupByServer(server);
    const api = new twisted_1.LolApi({
        /**
        * If api response is 429 (rate limits) try reattempt after needed time (default true)
        */
        rateLimitRetry: true,
        /**
         * Number of time to retry after rate limit response (default 1)
         */
        rateLimitRetryAttempts: 1,
        /**
         * Concurrency calls to riot (default infinity)
         * Concurrency per method (example: summoner api, match api, etc)
         */
        concurrency: undefined,
        /**
         * Riot games api key
         */
        key
    });
    const accApi = new account_1.AccountV1Api({
        /**
        * If api response is 429 (rate limits) try reattempt after needed time (default true)
        */
        rateLimitRetry: true,
        /**
         * Number of time to retry after rate limit response (default 1)
         */
        rateLimitRetryAttempts: 1,
        /**
         * Concurrency calls to riot (default infinity)
         * Concurrency per method (example: summoner api, match api, etc)
         */
        concurrency: undefined,
        /**
         * Riot games api key
         */
        key
    });
    ctx.LPTE.on(namespace, 'fetch-livegame', async (e) => {
        ctx.log.info(`Fetching livegame data for summoner=${e.summonerName}`);
        let retries = 0;
        const desiredRetries = e.retries !== undefined ? e.retries : 3;
        const replyMeta = {
            type: e.meta.reply,
            namespace: 'reply',
            version: 1
        };
        let summonerInfo;
        try {
            summonerInfo = await accApi.getByRiotId(e.gameName, e.tagLine, regionGroup);
        }
        catch (error) {
            ctx.log.error(`Failed to get information for summoner=${e.summonerName}. Maybe this summoner does not exist? error=${error}`);
            ctx.LPTE.emit({
                meta: replyMeta,
                failed: true
            });
            return;
        }
        let gameInfo;
        while (retries <= desiredRetries) {
            retries++;
            try {
                gameInfo = await api.SpectatorV5.activeGame(summonerInfo.response.puuid, region);
            }
            catch (error) {
                ctx.log.warn(`Failed to get spectator game information for summoner=${e.summonerName}, encryptedId=${summonerInfo.response.puuid}. Maybe this summoner is not ingame currently? Retrying. error=${error}`);
                await sleep(2000);
            }
        }
        if (gameInfo === undefined || 'message' in gameInfo) {
            ctx.log.error(`Failed to get spectator game information for summoner=${e.summonerName}, encryptedId=${summonerInfo.response.puuid}, after retries.`);
            ctx.LPTE.emit({
                meta: replyMeta,
                failed: true
            });
            return;
        }
        ctx.log.info(`Fetched livegame for summoner=${e.summonerName}, gameId=${gameInfo.response.gameId}`);
        ctx.LPTE.emit({
            meta: replyMeta,
            game: gameInfo.response,
            failed: false
        });
    });
    ctx.LPTE.on(namespace, 'fetch-match', async (e) => {
        ctx.log.info(`Fetching match data for matchid=${region}_${e.matchId}`);
        const replyMeta = {
            type: e.meta.reply,
            namespace: 'reply',
            version: 1
        };
        let gameData;
        try {
            gameData = await api.MatchV5.get(`${region}_${e.matchId}`, regionGroup);
        }
        catch (error) {
            ctx.log.error(`Failed to get match information for matchId=${region}_${e.matchId}. Maybe the match is not over yet? error=${error}`);
            ctx.LPTE.emit({
                meta: replyMeta,
                failed: true
            });
            return;
        }
        let timelineData;
        try {
            timelineData = await api.MatchV5.timeline(`${region}_${e.matchId}`, regionGroup);
        }
        catch (error) {
            ctx.log.warn(`Failed to get match timeline for matchId=${region}_${e.matchId}. Maybe the match is not over yet? Since this is optional, it will be skipped. error=${error}`);
            return;
        }
        ctx.log.info(`Fetched match for matchId=${region}_${e.matchId}, gameId=${gameData.response.info.gameId}`);
        ctx.LPTE.emit({
            meta: replyMeta,
            match: gameData.response,
            timeline: timelineData.response,
            failed: false
        });
    });
    ctx.LPTE.on(namespace, 'fetch-league', async (e) => {
        ctx.log.info(`Fetching League information for summonerName=${e.summonerName}`);
        const replyMeta = {
            type: e.meta.reply,
            namespace: 'reply',
            version: 1
        };
        let acc;
        try {
            acc = await accApi.getByRiotId(e.gameName, e.tagLine, regionGroup);
        }
        catch (error) {
            ctx.log.error(`Failed to get summoner information for summonerName=${e.summonerName}. error=${error}`);
            ctx.LPTE.emit({
                meta: replyMeta,
                failed: true
            });
            return;
        }
        let summoner;
        try {
            summoner = await api.Summoner.getByPUUID(acc.response.puuid, region);
        }
        catch (error) {
            ctx.log.error(`Failed to get summoner information for summonerName=${acc.response.puuid}. error=${error}`);
            ctx.LPTE.emit({
                meta: replyMeta,
                failed: true
            });
            return;
        }
        let data;
        try {
            data = await api.League.bySummoner(summoner.response.id, region);
        }
        catch (error) {
            ctx.log.warn(`Failed to get league information for summoner=${summoner.response.id}. Maybe the summoner is not ranked yet? error=${error}`);
            ctx.LPTE.emit({
                meta: replyMeta,
                failed: true
            });
            return;
        }
        ctx.log.info(`Fetched League information for summonerName=${e.summonerName}, summonerID=${summoner.response.id}`);
        ctx.LPTE.emit({
            meta: replyMeta,
            data: data.response,
            server,
            failed: false
        });
    });
    ctx.LPTE.on(namespace, 'fetch-location', async (e) => {
        ctx.LPTE.emit({
            meta: {
                type: e.meta.reply,
                namespace: 'reply',
                version: 1
            },
            server,
            region,
            regionGroup
        });
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