const assert = require('assert');
const QueryRunner = require('../src/query-runner');

describe('QueryRunner', function() {
    async function run(query) {
        const qr = new QueryRunner(query.split('\n'), 40);
        return qr.results();
    }

    async function assertRun(sql, expected) {
        const r = await run(sql);
        assert.equal(
            r.map((l) => l.trim()).join('\n').trim(),
            expected.trim().split('\n').map((l) => l.trim()).join('\n').trim()
       );

    }

    it('should format a result', async function() {
        await assertRun(`
            -->
            -- example of empty command: { "db": "default", "output": "vizualize" }
            DECLARE @temp TABLE (id int, value varchar(20))

            INSERT INTO @temp(id, value)
            VALUES (1, 'First'), (2, 'Second')

            SELECT * FROM @temp

            --> { "db": "anotherLabel", "output": "markdown", "title": "try Markdown" }

            SELECT 'First' col1, 'Second' col2

            --> { "db": "anotherLabel", "output": "csv", "title": "try CSV" }

            SELECT 'First' col1, 'Second' col2

            --> { "db": "anotherLabel", "output": "json", "title": "try JSON" }

            SELECT 'First' col1, 'Second' col2
        `, `
            === QUERY RESULT ===


             # id value
            -- -- -------
            #0 1  First
            #1 2  Second


            ### try Markdown

            col1 | col2
            :-- | :--
            First | Second


            === try CSV ===

            "col1","col2"
            "First","Second"


            /* === try JSON === */
            [
                {
                    "col1": "First",
                    "col2": "Second"
                }
            ]
        `);
    });

    it('should run multiple queries', async function() {
        await assertRun(`
            SELECT 'a' test1
            SELECT 'c' test1
            SELECT 'b' test2
            SELECT 'd' test1
        `, `
            === QUERY RESULT ===


             # test1
            -- -----
            #0 a
            #1 c

             # test2
            -- -----
            #0 b

             # test1
            -- -----
            #0 d
        `);
    });
});
