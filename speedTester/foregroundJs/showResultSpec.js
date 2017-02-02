describe("showResult", function () {
    var show = YSpeedTester.showResult;
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("buildHtml", function () {
        it("以树形结构展示测试数据", function () {
            var collectionData = [
                [
                    [
                        [
                            [
                                [
                                    [ ],
                                    1,
                                    'C:/c.js',
                                    'do1',
                                    100
                                ]
                            ],
                            2,
                            'C:/b.js',
                            'doSomething',
                            20
                        ],
                        [
                            [ ],
                            3,
                            'C:/c.js',
                            'do2',
                            300
                        ]
                    ],
                    4,
                    'C:/a.js',
                    'func1',
                    10
                ]  ,
                [
                    [
                        [
                            [
                                [
                                    [ ],
                                    1,
                                    'C:/c.js',
                                    'do1',
                                    100
                                ]
                            ],
                            2,
                            'C:/b.js',
                            'doSomething',
                            20
                        ]
                    ],
                    3,
                    'C:/a.js',
                    'func2',
                    20
                ]
            ];
            sandbox.stub(show, "_buildFuncInfo", function (funcData) {
                return funcData[1] + "ms";
            });

            var html = show.buildHtml(collectionData);

            expect(html).toEqual("<ul id='showResult'><li>4ms</li><ul style='display:none;'><li>2ms</li><ul style='display:none;'><li>1ms</li></ul>" +
                "<li>3ms</li></ul><li>3ms</li><ul style='display:none;'><li>2ms</li><ul style='display:none;'><li>1ms</li></ul></ul></ul>");
        });
    });

    describe("_buildFuncInfo", function () {
        it("构造函数信息", function () {
            var funcData = [
                [],
                2,
                'C:/a/b.js',
                'doSomething',
                20
            ];

            var info = show._buildFuncInfo(funcData);

            expect(info).toEqual("b.js->doSomething->20行：2ms");
        });
    });
});