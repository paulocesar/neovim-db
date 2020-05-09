const path = require('path');
const QueryRunner = require('./src/query-runner');

module.exports = (plugin) => {
    const extension = '.txt';
    const defaultFilename = 'DbRunQuery_result';
    const { nvim } = plugin;

    async function createWindow() {
        nvim.command(`split ${defaultFilename}${extension}`);
        const windows = await nvim.windows;

        const window = await windows[windows.length - 1];
        const buffer = await window.buffer;
        buffer.name = defaultFilename;

        return window;
    }

    async function resolveWindowResult() {
        const windows = await nvim.windows;

        for (const window of windows) {
            const filepath = await window.buffer.name;
            const name = path.basename(filepath, extension);

            if (name === defaultFilename) { return window; }
        }

        return createWindow();
    }

    async function runQuery(windowQuery, windowResult) {
        const queryBuffer = await windowQuery.buffer;
        const queryLines = await queryBuffer.lines;
        const r = new QueryRunner(queryLines.join('\n'));

        nvim.window = windowResult;
        await nvim.command('1,$d');
        await windowResult.buffer.insert(await r.results(), 0);
    }

    plugin.setOptions({ dev: true });
    plugin.registerCommand('DbRunQuery', async() => {
        const windowQuery = await nvim.window;
        const windowResult = await resolveWindowResult();

        await runQuery(windowQuery, windowResult);

        nvim.window = windowQuery;
    }, { sync: false });
}
