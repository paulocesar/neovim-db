const assert = require('assert');
const QueryRunner = require('../src/query-runner');

describe('QueryRunner', function() {
    it('should format a result', async function() {
        const nvimLines = [
            'select 1',
            '--> ',
            'select top 5 zDealerID, zMenuID, zVIN, zCustomerLastName',
            'from tblMenu where zDealerID = 1750',
            '',
            '--> {"title": "Try JSON", "output": "json"}',
            'select top 1 zCustomerFirstName, zCustomerLastName',
            'from tblMenu where zDealerID = 1750',
            '',
            '-->',
            'select top 1 from Invalid',
        ];
        const qr = new QueryRunner(nvimLines, 40);
        const r = await qr.results();
        console.log(r);
        assert(r.length > 0, 'should return a result');
    });
});
