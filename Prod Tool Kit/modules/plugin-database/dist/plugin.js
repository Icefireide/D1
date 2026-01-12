"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_json_db_1 = require("node-json-db");
const JsonDBConfig_1 = require("node-json-db/dist/lib/JsonDBConfig");
const uniqid_1 = __importDefault(require("uniqid"));
module.exports = async (ctx) => {
    const namespace = ctx.plugin.module.getName();
    const dbPath = process.env.DBPATH || `modules/plugin-database/data/league-prod-toolkit`;
    const config = new JsonDBConfig_1.Config(dbPath, true, false, '/');
    const client = new node_json_db_1.JsonDB(config);
    // Answer requests to get state
    ctx.LPTE.on(namespace, 'request', async (e) => {
        if (!e.collection) {
            return ctx.log.warn('no collection passed for request');
        }
        try {
            const filter = e.filter;
            const sort = e.sort;
            const limit = e.limit || 10;
            const url = `/${e.collection}${e.id !== undefined ? '/' + e.id : ''}`;
            const data = await client.getObject(url);
            let array = Object.values(data);
            if (filter !== undefined) {
                array = array.filter(filter);
            }
            if (sort !== undefined) {
                array = array.sort(sort);
            }
            if (limit !== undefined) {
                array = array.slice(0, limit);
            }
            ctx.LPTE.emit({
                meta: {
                    type: e.meta.reply,
                    namespace: 'reply',
                    version: 1
                },
                data: e.id !== undefined ? data : array || []
            });
        }
        catch (err) {
            ctx.log.debug(err.message);
            ctx.LPTE.emit({
                meta: {
                    type: e.meta.reply,
                    namespace: 'reply',
                    version: 1
                },
                data: e.id !== undefined ? undefined : []
            });
        }
    });
    ctx.LPTE.on(namespace, 'insertOne', async (e) => {
        if (!e.collection) {
            return ctx.log.warn('no collection passed for insertOne');
        }
        try {
            const id = (0, uniqid_1.default)();
            client.push(`/${e.collection}/${id}`, { id: id, ...e.data }, true);
            ctx.LPTE.emit({
                meta: {
                    type: e.meta.reply,
                    namespace: 'reply',
                    version: 1
                },
                id
            });
        }
        catch (err) {
            ctx.log.debug(err.message);
        }
    });
    ctx.LPTE.on(namespace, 'updateOne', async (e) => {
        if (!e.collection || !e.id) {
            return ctx.log.warn('no collection or id passed for updateOne');
        }
        try {
            client.push(`/${e.collection}/${e.id}`, e.data, false);
            ctx.LPTE.emit({
                meta: {
                    type: e.meta.reply,
                    namespace: 'reply',
                    version: 1
                }
            });
        }
        catch (err) {
            ctx.log.debug(err.message);
        }
    });
    ctx.LPTE.on(namespace, 'delete', async (e) => {
        if (!e.collection) {
            return ctx.log.warn('no collection passed for delete');
        }
        try {
            client.delete(`/${e.collection}`);
        }
        catch (err) {
            ctx.log.debug(err.message);
        }
    });
    ctx.LPTE.on(namespace, 'deleteOne', async (e) => {
        if (!e.collection || !e.id) {
            return ctx.log.warn('no collection or id passed for deleteOne');
        }
        try {
            client.delete(`/${e.collection}/${e.id}`);
            ctx.LPTE.emit({
                meta: {
                    type: e.meta.reply,
                    namespace: 'reply',
                    version: 1
                }
            });
        }
        catch (err) {
            ctx.log.debug(err.message);
        }
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