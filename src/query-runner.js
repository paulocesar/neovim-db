const fs = require('fs');
const os = require('os');
const path = require('path');
const knex = require('knex');

const configFilename = path.resolve(os.homedir(), '.nvim-db.json');

const clients = [ 'mssql', 'mysql', 'pg', 'sqlite3', 'mysql2', 'oracledb' ];

class QueryRunner {
    constructor(nvimLines, width) {
        this.hasDbSettings = fs.existsSync(configFilename);
        this.width = width;

        if (!this.hasDbSettings) { return; }

        this.loadSettins();
        if (!this.hasGoodSettings) { return; }

        let firstLine = nvimLines.filter((l) => l.trim())[0];

        let commands = [];
        if (firstLine && firstLine.startsWith('-->')) {
            commands = firstLine.replace('-->', '').trim().split(/\s+/g);
        }

        this.currentSettings = this.dbSettings[commands[0]] ||
            this.dbSettings.default;
        this.currentSettings.multipleStatements = true;

        this.sql = nvimLines.join('\n');
    }

    loadSettins() {
        try {
            this.dbSettings = JSON.parse(fs.readFileSync(configFilename));
        } catch(ex) {
            this.hasGoodSettings = false;
            return;
        }

        this.hasGoodSettings = true;

        for (const s of Object.values(this.dbSettings)) {
            const isGood = s.client && clients.includes(s.client) &&
                s.connection && s.connection.host &&
                s.connection.user && s.connection.password &&
                s.connection.database;

            if (!isGood) {
                this.hasGoodSettings = false;
                break;
            }
        }
    }

    async results() {
        if (!this.hasDbSettings) {
            return this.errorResults(
                'Please create a .nvim-db.json file in your home folder');
        }

        if (!this.hasGoodSettings) {
            return this.errorResults('~/.nvim-db.json has a bad configuration');
        }

        try {
            const db = knex(this.currentSettings);
            const results = await db.raw(this.sql);
            return this.formatResults(results);
        } catch(ex) {
            return ex.toString().split('\n');
        }
    }

    errorResults(msg) {
        return [
            msg, '', 'for more information. visit: ' +
                'https://github.com/paulocesar/neovim-db'
        ];
    }

    formatResults(results) {
        if (!results.length) { return [ ]; }
        return this.toVisualizationTable(results);
    }

    toJson(results) {
        return JSON.stringify(results, null, 4).split('\n');
    }

    toVisualizationTable(results) {
        const countLen = `${results.length}`.length;
        const cols = [ ];

        for (const col of Object.keys(results[0])) {
            let maxLen = col.length;
            for (const r of results) {
                const colLen = `${r[col]}`.length + 1;
                if (colLen > maxLen) { maxLen = colLen };
            }

            cols.push({ name: col, length: maxLen });
        }

        let displayLines = [ ];

        let lines = [ ];
        for (const col of cols) {
            if (lines[0] && lines[0].length + col.length > this.width - 1) {
                displayLines = displayLines.concat(lines).concat([ '', '' ]);
                lines = [ ];
            }

            if (!lines[0]) {
                lines[0] = `${' '.repeat(countLen)}# `;
                lines[1] = `${'-'.repeat(countLen + 1)} `;

                for (const idx in results) {
                    const repeatCol = countLen - (idx.toString().length);
                    lines[Number(idx) + 2] = `${' '.repeat(repeatCol)}#${idx} `
                }
            }

            lines[0] +=
                `${col.name}${' '.repeat(col.length - col.name.length)} `;
            lines[1] += `${'-'.repeat(col.length)} `;
            for (const idx in results) {
                const r = results[idx];
                const value = `${r[col.name]}`;
                const whitespace = ' '.repeat(col.length - value.length + 1);
                lines[Number(idx) + 2] += `${value}${whitespace}`;
            }
        }

        if (lines[0] && lines[0].length) {
            displayLines = displayLines.concat(lines);
        }

        return displayLines;
    }
}

module.exports = QueryRunner;
