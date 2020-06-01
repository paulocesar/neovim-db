const path = require('path');
const QueryRunner = require('./query-runner');

module.exports = (plugin) => {
    const extension = '.txt';
    const defaultFilename = 'DbRunQuery_result';
    const { nvim } = plugin;

    async function createWindow() {
        let windows = await nvim.windows;
        const lastWindow = await windows[windows.length - 1];
        nvim.window = lastWindow;
        await nvim.command(`split ${defaultFilename}${extension}`);

        windows = await nvim.windows;
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
        const width = await windowResult.width;
        const r = new QueryRunner(queryLines, width);

        nvim.window = windowResult;
        await nvim.command('1,$d');
        const lines = await r.results()

        await windowResult.buffer.append(lines, 0);
        await nvim.command('1');
    }

    plugin.registerCommand('DbRunQuery', async function() {
        const windowQuery = await nvim.window;
        const windowResult = await resolveWindowResult();

        await runQuery(windowQuery, windowResult);

        nvim.window = windowQuery;
    }, { sync: false });
}
