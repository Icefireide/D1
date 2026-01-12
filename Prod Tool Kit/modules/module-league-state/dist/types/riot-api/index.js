"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
__exportStar(require("./Request/League-V4/EntryRequest"), exports);
__exportStar(require("./Request/Match-V5/MatchlistRequest"), exports);
__exportStar(require("./Request/Match-V5/MatchRequest"), exports);
__exportStar(require("./Request/Summoner-V4/SummonerRequests"), exports);
__exportStar(require("./Response/League-V4/Entries"), exports);
__exportStar(require("./Response/Match-V5/Match"), exports);
__exportStar(require("./Response/Match-V5/MatchList"), exports);
__exportStar(require("./Response/Match-V5/MatchTimeline"), exports);
__exportStar(require("./Response/Match-V5/Metadata"), exports);
__exportStar(require("./Response/Summoner-V4/Summoner"), exports);
__exportStar(require("./Buildings"), exports);
__exportStar(require("./Coordinates"), exports);
__exportStar(require("./Lanes"), exports);
__exportStar(require("./Monster"), exports);
__exportStar(require("./Ranked"), exports);
__exportStar(require("./Region"), exports);
__exportStar(require("./Server"), exports);
//# sourceMappingURL=index.js.map