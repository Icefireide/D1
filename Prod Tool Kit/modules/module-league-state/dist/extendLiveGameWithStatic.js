"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const getFlatPerks = (perks) => {
    const result = perks
        .map((perk) => perk.slots.map((slot) => slot.runes).flat())
        .flat();
    // console.log(result)
    return result;
};
exports.default = (state, constants) => ({
    ...state,
    gameQueueConstants: constants.queues.filter((q) => q.queueId === state.gameQueueConfigId)[0],
    gameModeConstants: constants.gameModes.filter((gm) => gm.gameMode === state.gameMode)[0],
    gameTypeConstants: constants.gameTypes.filter((gt) => gt.gametype === state.gameType)[0],
    mapConstants: constants.maps.data[state.mapId],
    participants: state.participants.map((p) => ({
        ...p,
        champion: constants.champions.filter((champion) => parseInt(champion.key) === p.championId)[0],
        perks: {
            ...p.perks,
            perkConstants: p.perks.perkIds.map((perkId) => getFlatPerks(constants.perks).find((perk) => perk.id === perkId))
        }
    }))
});
//# sourceMappingURL=extendLiveGameWithStatic.js.map