"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MapPosition = exports.Lane = exports.Role = exports.Position = exports.LaneType = void 0;
var LaneType;
(function (LaneType) {
    LaneType["BOT_LANE"] = "BOT_LANE";
    LaneType["MID_LANE"] = "MID_LANE";
    LaneType["TOP_LANE"] = "TOP_LANE";
})(LaneType || (exports.LaneType = LaneType = {}));
var Position;
(function (Position) {
    Position["TOP"] = "TOP";
    Position["JUNGLE"] = "JUNGLE";
    Position["MIDDLE"] = "MIDDLE";
    Position["BOTTOM"] = "BOTTOM";
    Position["UTILITY"] = "UTILITY";
    Position["NONE"] = "NONE";
})(Position || (exports.Position = Position = {}));
var Role;
(function (Role) {
    Role["NONE"] = "NONE";
    Role["SOLO"] = "SOLO";
    Role["CARRY"] = "CARRY";
    Role["SUPPORT"] = "SUPPORT";
})(Role || (exports.Role = Role = {}));
var Lane;
(function (Lane) {
    Lane["TOP"] = "TOP";
    Lane["JUNGLE"] = "JUNGLE";
    Lane["MIDDLE"] = "MIDDLE";
    Lane["BOTTOM"] = "BOTTOM";
})(Lane || (exports.Lane = Lane = {}));
var MapPosition;
(function (MapPosition) {
    MapPosition["TOP"] = "TOP";
    MapPosition["JUNGLE"] = "JUNGLE";
    MapPosition["MIDDLE"] = "MIDDLE";
    MapPosition["BOTTOM"] = "BOTTOM";
    MapPosition["RIVER"] = "RIVER";
    MapPosition["SPAWN"] = "SPAWN";
})(MapPosition || (exports.MapPosition = MapPosition = {}));
//# sourceMappingURL=Lanes.js.map