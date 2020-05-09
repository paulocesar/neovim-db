class QueryRunner {
    constructor(sql) {
    }

    async results() {
        return [
            'hello world!',
            'this is a test',
            (new Date().toString())
        ];
    }
}

module.exports = QueryRunner;
