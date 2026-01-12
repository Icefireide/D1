"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Lane = exports.Role = exports.LaneType = void 0;
var LaneType;
(function (LaneType) {
    LaneType["BOT_LANE"] = "BOT_LANE";
    LaneType["MID_LANE"] = "MID_LANE";
    LaneType["TOP_LANE"] = "TOP_LANE";
})(LaneType || (exports.LaneType = LaneType = {}));
var Role;
(function (Role) {
    Role["TopLane"] = "toplane";
    Role["Jungle"] = "jungle";
    Role["MidLane"] = "midlane";
    Role["ADC"] = "adc";
    Role["Support"] = "support";
})(Role || (exports.Role = Role = {}));
var Lane;
(function (Lane) {
    Lane["TopLane"] = "toplane";
    Lane["MidLane"] = "midlane";
    Lane["BotLane"] = "botlane";
})(Lane || (exports.Lane = Lane = {}));
//# sourceMappingURL=Lanes.js.map