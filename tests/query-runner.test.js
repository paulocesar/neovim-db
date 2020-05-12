const assert = require('assert');
const QueryRunner = require('../src/query-runner');

describe('QueryRunner', function() {
    it('should format a result', async function() {
        const nvimLines = [
            '--> default',
            'select top 5 zDealerID, zMenuID, zVIN, zCustomerLastName',
            'from tblMenu where zDealerID = 1750'
        ];
        const qr = new QueryRunner(nvimLines, 40);
        const r = await qr.results();
        console.log(r);
        assert(r.length > 0, 'should return a result');
    });
});
