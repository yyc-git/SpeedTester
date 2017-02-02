var JsTokenizer = require("./JsTokenizer.js");

describe("JsTokenizer", function () {
    var tokenizer = null;

    beforeEach(function () {
        tokenizer = JsTokenizer.getInstance();
    });
    afterEach(function () {
        JsTokenizer.forTest_clearInstance();
    });

    describe("解析", function () {
        var tokens = null;

        function tokenize(str) {
            tokenizer.tokenize(str, function (token, type) {
                tokens.push([token, type]);
            });
        }

        beforeEach(function () {
            tokens = [];
        });
        afterEach(function () {
        });

        it("提取string", function () {
            var str = "var t = \"aaa ccc\";var m = 'bbb'";

            tokenize(str);

            expect(tokens).toEqual([
                [ 'var', 'word' ],
                [ ' ', 'whitespace' ],
                [ 't', 'word' ],
                [ ' ', 'whitespace' ],
                [ '=', 'char' ],
                [ ' ', 'whitespace' ],
                [ '"aaa ccc"', 'string' ],
                [ ';', 'char' ],
                [ 'var', 'word' ],
                [ ' ', 'whitespace' ],
                [ 'm', 'word' ],
                [ ' ', 'whitespace' ],
                [ '=', 'char' ],
                [ ' ', 'whitespace' ],
                [ "'bbb'", 'string' ]
            ]);
        });
        it("提取单行注释", function () {
            var str = "var t = 1;//bbb\r\n//ccc";

            tokenize(str);

            expect(tokens).toEqual([
                [ 'var', 'word' ],
                [ ' ', 'whitespace' ],
                [ 't', 'word' ],
                [ ' ', 'whitespace' ],
                [ '=', 'char' ],
                [ ' ', 'whitespace' ],
                [ '1', 'number' ],
                [ ';', 'char' ],
                [ '//bbb', 'comment' ],
                [ '\n', 'newline' ],
                [ '//ccc', 'comment' ]
            ]);
        });
        it("提取多行注释", function () {
            var str = "var t = 2;/*bbb\nccc*/\nvar m = 3;";

            tokenize(str);

            expect(tokens).toEqual([
                [ 'var', 'word' ],
                [ ' ', 'whitespace' ],
                [ 't', 'word' ],
                [ ' ', 'whitespace' ],
                [ '=', 'char' ],
                [ ' ', 'whitespace' ],
                [ '2', 'number' ],
                [ ';', 'char' ],
                [ '/*bbb\nccc*/', 'comment' ],
                [ '\n', 'newline' ],
                [ 'var', 'word' ],
                [ ' ', 'whitespace' ],
                [ 'm', 'word' ],
                [ ' ', 'whitespace' ],
                [ '=', 'char' ],
                [ ' ', 'whitespace' ],
                [ '3', 'number' ],
                [ ';', 'char' ]
            ]);
        });
        describe("提取正则表达式", function () {
            it("可正确提出正则表达式及其标志", function () {
                var str = "var m = /\d+/;var k = /; /mg;";

                tokenize(str);

                expect(tokens).toEqual([
                    [ 'var', 'word' ],
                    [ ' ', 'whitespace' ],
                    [ 'm', 'word' ],
                    [ ' ', 'whitespace' ],
                    [ '=', 'char' ],
                    [ ' ', 'whitespace' ],
                    [ '/d+/', 'regex' ],
                    [ ';', 'char' ],
                    [ 'var', 'word' ],
                    [ ' ', 'whitespace' ],
                    [ 'k', 'word' ],
                    [ ' ', 'whitespace' ],
                    [ '=', 'char' ],
                    [ ' ', 'whitespace' ],
                    [ '/; /mg', 'regex' ],
                    [ ';', 'char' ]
                ]);
            });

            describe("测试易混淆的非正则表达式的提取", function () {
                it("测试提取除号/", function () {
                    var str = "var a = 1000 / 5;\r\nvar b = 5 / 1;";

                    tokenize(str);

                    expect(tokens).toEqual([
                        [ 'var', 'word' ],
                        [ ' ', 'whitespace' ],
                        [ 'a', 'word' ],
                        [ ' ', 'whitespace' ],
                        [ '=', 'char' ],
                        [ ' ', 'whitespace' ],
                        [ '1000', 'number' ],
                        [ ' ', 'whitespace' ],
                        [ '/', 'char' ],
                        [ ' ', 'whitespace' ],
                        [ '5', 'number' ],
                        [ ';', 'char' ],
                        [ '\n', 'newline' ],
                        [ 'var', 'word' ],
                        [ ' ', 'whitespace' ],
                        [ 'b', 'word' ],
                        [ ' ', 'whitespace' ],
                        [ '=', 'char' ],
                        [ ' ', 'whitespace' ],
                        [ '5', 'number' ],
                        [ ' ', 'whitespace' ],
                        [ '/', 'char' ],
                        [ ' ', 'whitespace' ],
                        [ '1', 'number' ],
                        [ ';', 'char' ]
                    ]);
                });
                it("测试提取除号和注释", function () {
                    var str = "var a = 1000 / 5;//aa\r\nvar b = 5 / 1;/*bb*/";

                    tokenize(str);

                    expect(tokens).toEqual([
                        [ 'var', 'word' ],
                        [ ' ', 'whitespace' ],
                        [ 'a', 'word' ],
                        [ ' ', 'whitespace' ],
                        [ '=', 'char' ],
                        [ ' ', 'whitespace' ],
                        [ '1000', 'number' ],
                        [ ' ', 'whitespace' ],
                        [ '/', 'char' ],
                        [ ' ', 'whitespace' ],
                        [ '5', 'number' ],
                        [ ';', 'char' ],
                        [ '//aa', 'comment' ],
                        [ '\n', 'newline' ],
                        [ 'var', 'word' ],
                        [ ' ', 'whitespace' ],
                        [ 'b', 'word' ],
                        [ ' ', 'whitespace' ],
                        [ '=', 'char' ],
                        [ ' ', 'whitespace' ],
                        [ '5', 'number' ],
                        [ ' ', 'whitespace' ],
                        [ '/', 'char' ],
                        [ ' ', 'whitespace' ],
                        [ '1', 'number' ],
                        [ ';', 'char' ],
                        [ '/*bb*/', 'comment' ]
                    ]);
                });
            });
        });

        it("提取数字", function () {
            var str = "var t = 122;\nvar m = 0.13";

            tokenize(str);

            expect(tokens).toEqual([
                [ 'var', 'word' ],
                [ ' ', 'whitespace' ],
                [ 't', 'word' ],
                [ ' ', 'whitespace' ],
                [ '=', 'char' ],
                [ ' ', 'whitespace' ],
                [ '122', 'number' ],
                [ ';', 'char' ],
                ['\n', 'newline' ],
                [ 'var', 'word' ],
                [ ' ', 'whitespace' ],
                [ 'm', 'word' ],
                [ ' ', 'whitespace' ],
                [ '=', 'char' ],
                [ ' ', 'whitespace' ],
                [ '0.13', 'number' ]
            ]);
        });
        it("提取关键字", function () {
            var str = "var t = null;return undefined;";

            tokenize(str);

            expect(tokens).toEqual([
                [ 'var', 'word' ],
                [ ' ', 'whitespace' ],
                [ 't', 'word' ],
                [ ' ', 'whitespace' ],
                [ '=', 'char' ],
                [ ' ', 'whitespace' ],
                [ 'null', 'word' ],
                [ ';', 'char' ],
                [ 'return', 'word' ],
                [ ' ', 'whitespace' ],
                [ 'undefined', 'word' ],
                [ ';', 'char' ]
            ]);
        });

        describe("提取换行符", function () {
            it("windows下换行符为\\r\\n", function () {
                var str = "var t = 1;\r\n//a";

                tokenize(str);

                expect(tokens).toEqual([
                    [ 'var', 'word' ],
                    [ ' ', 'whitespace' ],
                    [ 't', 'word' ],
                    [ ' ', 'whitespace' ],
                    [ '=', 'char' ],
                    [ ' ', 'whitespace' ],
                    [ '1', 'number' ],
                    [ ';', 'char' ] ,
                    [ '\n', 'newline' ] ,
                    [ '//a', 'comment' ]
                ]);
            });
            it("linux,unix下换行符为\\n", function () {
                var str = "var t = 1;\n//a";

                tokenize(str);

                expect(tokens).toEqual([
                    [ 'var', 'word' ],
                    [ ' ', 'whitespace' ],
                    [ 't', 'word' ],
                    [ ' ', 'whitespace' ],
                    [ '=', 'char' ],
                    [ ' ', 'whitespace' ],
                    [ '1', 'number' ],
                    [ ';', 'char' ],
                    [ '\n', 'newline' ],
                    [ '//a', 'comment' ]
                ]);
            });
            it("mac下换行符为\\r", function () {
                var str = "var t = 1;\r//a";

                tokenize(str);

                expect(tokens).toEqual([
                    [ 'var', 'word' ],
                    [ ' ', 'whitespace' ],
                    [ 't', 'word' ],
                    [ ' ', 'whitespace' ],
                    [ '=', 'char' ],
                    [ ' ', 'whitespace' ],
                    [ '1', 'number' ],
                    [ ';', 'char' ] ,
                    [ '\n', 'newline' ]  ,
                    [ '//a', 'comment' ]
                ]);
            });
        });

        describe("提取剩余字符", function () {
            it("测试1", function () {
                var str = "var t += 1;";

                tokenize(str);

                expect(tokens).toEqual([
                    [ 'var', 'word' ],
                    [ ' ', 'whitespace' ],
                    [ 't', 'word' ],
                    [ ' ', 'whitespace' ],
                    [ '+', 'char' ],
                    [ '=', 'char' ],
                    [ ' ', 'whitespace' ],
                    [ '1', 'number' ],
                    [ ';', 'char' ]
                ]);
            });
        });
    });


    describe("可获得后面的token数据，包括token值、类型type和token起始位置pos", function () {
        it("默认获得后面第一个的token数据", function () {
            var str = "var t = 1";
            var tokens = [];

            tokenizer.tokenize(str, function (token, type, getBeforeTokenData, getAfterTokenAndType) {
                tokens.push([token, type, getAfterTokenAndType()]);
            });

            expect(tokens).toEqual([
                [ 'var', 'word', { token: ' ', type: 'whitespace', pos: 3 } ],
                [ ' ', 'whitespace', { token: 't', type: 'word', pos: 4 } ],
                [ 't', 'word', { token: ' ', type: 'whitespace', pos: 5 } ],
                [ ' ', 'whitespace', { token: '=', type: 'char', pos: 6 } ],
                [ '=', 'char', { token: ' ', type: 'whitespace', pos: 7 } ],
                [ ' ', 'whitespace', { token: '1', type: 'char', pos: 9 } ],
                [ '1', 'char', { token: null, type: null, pos: 9 } ]
            ]);
        });
        it("可获得指定序号的token数据，序号从0开始", function () {
            var str = "var t = 1";
            var tokens = [];

            tokenizer.tokenize(str, function (token, type, getBeforeTokenData, getAfterTokenData) {
                tokens.push([token, type, getAfterTokenData(1)]);
            });

            expect(tokens).toEqual([
                [ 'var', 'word', { token: 't', type: 'word', pos: 4 } ],
                [ ' ', 'whitespace', { token: ' ', type: 'whitespace', pos: 5 } ],
                [ 't', 'word', { token: '=', type: 'char', pos: 6 } ],
                [ ' ', 'whitespace', { token: ' ', type: 'whitespace', pos: 7 } ],
                [ '=', 'char', { token: '1', type: 'char', pos: 9 } ],
                [ ' ', 'whitespace', { token: null, type: null, pos: 9 } ],
                [ '1', 'char', { token: null, type: null, pos: 9 } ]
            ]);
        });
    });

    describe("可获得前面的token数据，包括token值、类型type和token起始位置pos", function () {
        it("默认获得前面第一个的token数据", function () {
            var str = "var t = 1";
            var tokens = [];

            tokenizer.tokenize(str, function (token, type, getBeforeTokenData, getAfterTokenAndType) {
                tokens.push([token, type, getBeforeTokenData()]);
            });

            expect(tokens).toEqual([
                [ 'var', 'word', { token: null, type: null, pos: -1 } ],
                [ ' ', 'whitespace', { token: 'var', type: 'word', pos: 0 } ],
                [ 't', 'word', { token: ' ', type: 'whitespace', pos: 3 } ],
                [ ' ', 'whitespace', { token: 't', type: 'word', pos: 4 } ],
                [ '=', 'char', { token: ' ', type: 'whitespace', pos: 5 } ],
                [ ' ', 'whitespace', { token: '=', type: 'char', pos: 6 } ],
                [ '1', 'char', { token: ' ', type: 'whitespace', pos: 7 } ]
            ]);
        });
        it("可获得指定序号的token数据，序号从0开始", function () {
            var str = "var t = 1";
            var tokens = [];

            tokenizer.tokenize(str, function (token, type, getBeforeTokenData, getAfterTokenData) {
                tokens.push([token, type, getBeforeTokenData(2)]);
            });

            expect(tokens).toEqual([
                [ 'var', 'word', { token: null, type: null, pos: -1 } ],
                [ ' ', 'whitespace', { token: null, type: null, pos: -1 } ],
                [ 't', 'word', { token: null, type: null, pos: -1 } ],
                [ ' ', 'whitespace', { token: 'var', type: 'word', pos: 0 } ],
                [ '=', 'char', { token: ' ', type: 'whitespace', pos: 3 } ],
                [ ' ', 'whitespace', { token: 't', type: 'word', pos: 4 } ],
                [ '1', 'char', { token: ' ', type: 'whitespace', pos: 5 } ]
            ]);
        });
    });
});
