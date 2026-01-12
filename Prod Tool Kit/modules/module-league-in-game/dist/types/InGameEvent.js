"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TeamType = exports.StructureType = exports.MobType = exports.EventType = void 0;
var EventType;
(function (EventType) {
    EventType["DragonKill"] = "OnKillDragon_Spectator";
    EventType["HeraldKill"] = "OnKillRiftHerald_Spectator";
    EventType["BaronKill"] = "OnKillWorm_Spectator";
    EventType["StructureKill"] = "OnStructureKill";
    EventType["TurretPlateDestroyed"] = "OnTurretPlateDestroyed";
    EventType["HeraldSummon"] = "OnSummonRiftHerald";
})(EventType || (exports.EventType = EventType = {}));
var MobType;
(function (MobType) {
    MobType["HextechDragon"] = "SRU_Dragon_Hextech";
    MobType["ChemtechDragon"] = "SRU_Dragon_Chemtech";
    MobType["CloudDragon"] = "SRU_Dragon_Air";
    MobType["ElderDragon"] = "SRU_Dragon_Elder";
    MobType["InfernalDragon"] = "SRU_Dragon_Fire";
    MobType["OceanDragon"] = "SRU_Dragon_Water";
    MobType["MountainDragon"] = "SRU_Dragon_Earth";
    MobType["Herald"] = "SRU_Herald";
    MobType["Baron"] = "SRU_Baron";
})(MobType || (exports.MobType = MobType = {}));
var StructureType;
(function (StructureType) {
    /* Deprecated
    Turret_T2_R_03_A = 'Turret_T2_R_03_A',
    Turret_T2_C_03_A = 'Turret_T2_C_03_A',
    Turret_T2_L_03_A = 'Turret_T2_L_03_A'
    */
    StructureType["Turret_T200_L0_P3_ID"] = "Turret_T200_L0_P3_ID";
    StructureType["Turret_T200_L1_P3_ID"] = "Turret_T200_L1_P3_ID";
    StructureType["Turret_T200_L2_P3_ID"] = "Turret_T200_L2_P3_ID";
})(StructureType || (exports.StructureType = StructureType = {}));
var TeamType;
(function (TeamType) {
    TeamType["Neutral"] = "Neutral";
    TeamType["Order"] = "Order";
    TeamType["Chaos"] = "Chaos";
})(TeamType || (exports.TeamType = TeamType = {}));
//# sourceMappingURL=InGameEvent.js.map