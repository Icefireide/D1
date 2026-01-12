"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Region = void 0;
exports.getRegionByServer = getRegionByServer;
const Server_1 = require("./Server");
var Region;
(function (Region) {
    Region["AMERICAS"] = "americas";
    Region["ASIA"] = "asia";
    Region["EUROPE"] = "europe";
})(Region || (exports.Region = Region = {}));
function getRegionByServer(server) {
    switch (server) {
        case Server_1.Server.NA:
        case Server_1.Server.BR:
        case Server_1.Server.LAN:
        case Server_1.Server.LAS:
        case Server_1.Server.OCE:
            return Region.AMERICAS;
        case Server_1.Server.KR:
        case Server_1.Server.JP:
            return Region.ASIA;
        case Server_1.Server.EUNE:
        case Server_1.Server.EUW:
        case Server_1.Server.TR:
        case Server_1.Server.RU:
            return Region.EUROPE;
        default:
            return Region.EUROPE;
    }
}
//# sourceMappingURL=Region.js.map