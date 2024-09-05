const fs = require('fs');
const os = require('os');
const path = require('path');
const knex = require('knex');

const configFilename = path.resolve(os.homedir(), '.nvim-db.json');

const clients = ['mssql', 'mysql', 'pg', 'sqlite3', 'mysql2', 'oracledb'];

class QueryRunner {
    constructor(nvimLines, width) {
        this.hasDbSettings = fs.existsSync(configFilename);
        this.width = width;

        if (!this.hasDbSettings) { return; }

        this.loadSettings();
        if (!this.hasGoodSettings) { return; }

        const lines = nvimLines.map((l) => l.trim()).filter((l) => l);

        this.queries = [ ];
        let query = { sql: '', settings: this.buildSettingsForQuery() };

        for (const line of lines) {
            const isSettings = line.startsWith('-->');

            if (isSettings) {
                if (query.sql) {
                    this.queries.push(query);
                    query = { sql: '' };
                }
                query.settings = this.buildSettingsForQuery(line);
            }

            query.sql = `${query.sql}\n${line}`.trim();
        }

        if (query.sql) { this.queries.push(query); }
    }

    loadSettings() {
        try {
            this.dbSettings = JSON.parse(fs.readFileSync(configFilename));
        } catch (ex) {
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

            s.connection.multipleStatements = true;
        }
    }


    buildSettingsForQuery(line) {
        const outputs = {
            visualize: (t, r) => this.toVisualizationTable(t, r),
            json: (t, r) => this.toJson(t, r),
            markdown: (t, r) => this.toMarkdown(t, r),
            md: (t, r) => this.toMarkdown(t, r),
            csv: (t, r) => this.toCsv(t, r)
        };

        const settings = { output: outputs.visualize,
            db: this.dbSettings.default, title: 'QUERY RESULT' };

        if (!line) { return settings; }

        try {
            const json = JSON.parse(line.replace('-->', '').trim());
            if (json.db) {
                settings.db = this.dbSettings[json.db] ||
                    this.dbSettings.default;
            }
            if (json.output) {
                settings.output = outputs[json.output] ||
                    outputs.visualize;
            }
            if (json.title) { settings.title = json.title || 'QUERY RESULT'; }
        } catch (ex) {
            return settings;
        }

        return settings;
    }

    async results() {
        if (!this.hasDbSettings) {
            return this.errorResults(
                'Please create a .nvim-db.json file in your home folder');
        }

        if (!this.hasGoodSettings) {
            return this.errorResults('~/.nvim-db.json has a bad configuration');
        }

        let lines = [ ];
        for (const q of this.queries) {
            try {
                const { sql, settings } = q;

                const db = knex(settings.db);
                const results = await db.raw(sql);

                const formatted = settings.output(settings.title, results);
                lines = lines.concat(formatted).concat(['', '']);
            } catch (ex) {
                lines = lines.concat(ex.toString().split('\n'))
                    .concat(['', '']);
            }
        }

        return lines;
    }

    errorResults(msg) {
        return [
            msg, '', 'for more information: ' +
                'https://github.com/paulocesar/neovim-db'
        ];
    }

    toJson(title, results) {
        const lines = [ ];
        if (title) { lines.push(`/* === ${title} === */`); }

        return lines.concat(JSON.stringify(results, null, 4).split('\n'));
    }

    toMarkdown(title, results) {
        let displayLines = [ ];

        const addLine = (l) => displayLines.push(l);

        if (title) {
            addLine(`### ${title}`);
        }

        if (!results.length) {
            addLine('empty');
            return displayLines;
        }

        const resultGroups = [ ];
        let lastKeys = [ ];

        for (const r of results) {
            const cols = Object.keys(r);

            if (lastKeys.join('|') !== cols.join('|')) {
                resultGroups.push([ ]);
                lastKeys = cols;
            }

            const lastGroup = resultGroups[resultGroups.length - 1];
            lastGroup.push(r);
        }

        for (const g of resultGroups) {
            displayLines = displayLines.concat('')
                .concat(this._buildMarkdown(g));
        }

        return displayLines;
    }

    _buildMarkdown(results) {
        const lines = [ ];
        const keys = Object.keys(results[0]);

        lines.push(keys.join(' | '));

        const splitter = `:--${' | :--'.repeat(keys.length - 1)}`;
        lines.push(splitter);

        for (const r of results) {
            lines.push(Object.values(r).join(' | '));
        }

        return lines;
    }

    toCsv(title, results) {
        let displayLines = [ ];

        const addLine = (l) => displayLines.push(l);

        if (title) {
            addLine(`=== ${title} ===`);
        }

        if (!results.length) {
            addLine('"empty"');
            return displayLines;
        }

        const resultGroups = [ ];
        let lastKeys = [ ];

        for (const r of results) {
            const cols = Object.keys(r);

            if (lastKeys.join('|') !== cols.join('|')) {
                resultGroups.push([ ]);
                lastKeys = cols;
            }

            const lastGroup = resultGroups[resultGroups.length - 1];
            lastGroup.push(r);
        }

        for (const g of resultGroups) {
            displayLines = displayLines.concat('')
                .concat(this._buildCsv(g));
        }

        return displayLines;
    }

    _buildCsv(results) {
        const lines = [ ];

        function format(v) {
            const f = `${v}`.replace(/"/g, '');
            return `"${f}"`;
        }

        const keys = Object.keys(results[0]);
        lines.push(keys.map(format).join(','));

        for (const r of results) {
            lines.push(Object.values(r).map(format).join(','));
        }

        return lines;
    }

    toVisualizationTable(title, results) {
        let displayLines = [ ];

        const addLine = (l) => displayLines.push(l);

        if (title) {
            addLine(`=== ${title} ===`);
        }

        if (!results.length) {
            addLine('(empty)');
            return displayLines;
        }

        const resultGroups = [ ];
        let lastKeys = [ ];

        for (const r of results) {
            const cols = Object.keys(r);

            if (lastKeys.join('|') !== cols.join('|')) {
                resultGroups.push([ ]);
                lastKeys = cols;
            }

            const lastGroup = resultGroups[resultGroups.length - 1];
            lastGroup.push(r);
        }

        for (const g of resultGroups) {
            displayLines = displayLines.concat('')
                .concat(this._buildVisualizationTable(g));
        }

        return displayLines;
    }

    _buildVisualizationTable(results) {
        let displayLines = [ ];

        const countLen = `${results.length}`.length;
        const cols = [ ];

        for (const col of Object.keys(results[0])) {
            let maxLen = col.length;
            for (const r of results) {
                const colLen = `${r[col]}`.length + 1;
                if (colLen > maxLen) { maxLen = colLen; }
            }

            cols.push({ name: col, length: maxLen });
        }

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
                    lines[Number(idx) + 2] = `${' '.repeat(repeatCol)}#${idx} `;
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
