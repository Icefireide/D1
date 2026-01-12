"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tabletojson_1 = require("tabletojson");
const string_strip_html_1 = require("string-strip-html");
module.exports = async (ctx) => {
    const namespace = ctx.plugin.module.getName();
    let teams = [];
    // Register new UI page
    ctx.LPTE.emit({
        meta: {
            type: 'add-pages',
            namespace: 'ui',
            version: 1
        },
        pages: [
            {
                name: `LoL: PRM Tables`,
                frontend: 'frontend',
                id: `op-${namespace}`
            }
        ]
    });
    ctx.LPTE.on(namespace, 'request-table', async (e) => {
        const tables = await tabletojson_1.Tabletojson.convertUrl(e.link, { stripHtmlFromCells: false });
        teams = tables[0].map((t) => {
            const bilanz = (0, string_strip_html_1.stripHtml)(t.Bilanz).result.split('-');
            const team = (0, string_strip_html_1.stripHtml)(t.Teilnehmer).result.split('\n');
            return {
                place: parseInt((0, string_strip_html_1.stripHtml)('#').result),
                logo: t.Teilnehmer.match(/(?<=img data-src=").*?(?=")/)[0],
                name: team[0],
                country: team[1],
                wins: parseInt(bilanz[0]),
                losses: parseInt(bilanz[1]),
            };
        });
        ctx.LPTE.emit({
            meta: {
                type: 'update',
                namespace,
                version: 1
            },
            teams
        });
    });
    ctx.LPTE.on(namespace, 'request', (e) => {
        ctx.LPTE.emit({
            meta: {
                type: e.meta.reply,
                namespace: 'reply',
                version: 1
            },
            teams
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