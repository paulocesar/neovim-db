const fs = require('fs');
const os = require('os');
const path = require('path');
const knex = require('knex');

const configFilename = path.resolve(os.homedir(), '.nvim-db.json');

const clients = [ 'mssql', 'mysql', 'pg', 'sqlite3', 'mysql2', 'oracledb' ];

class QueryRunner {
    constructor(nvimLines) {
        this.hasDbSettings = fs.existsSync(configFilename);

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
        return JSON.stringify(results, null, 4).split('\n');
    }
}

module.exports = QueryRunner;
