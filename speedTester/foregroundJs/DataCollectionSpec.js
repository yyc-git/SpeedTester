describe("DataCollection", function () {
    var collection = null;
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
        collection = YSpeedTester.DataCollection.getInstance();
    });
    afterEach(function () {
        YSpeedTester.DataCollection.forTest_clearInstance();
        sandbox.restore();
    });

    describe("测试收集的数据", function () {
        beforeEach(function () {
            collection.startTest();
        });

        it("测试1", function () {
            var a = null,
                b = null;
            a = {
                func: function () {
                    collection.start("C:/a.js", "func", 10);

                    var sum = 0,
                        i = 0;
                    for (i = 0; i < 10000000; i++) {
                        sum += i;
                    }
                    b.doSomething();

                    collection.end();
                }
            };
            b = {
                doSomething: function () {
                    collection.start("C:/b.js", "doSomething", 20);

                    var sum = 0,
                        i = 0;
                    for (i = 0; i < 10000000; i++) {
                        sum += i;
                    }

                    collection.end();
                }
            };

            a.func();

            expect(collection.outputData).toEqual(
                [
                    [
                        [
                            [
                                [],
                                jasmine.any(Number),
                                "C:/b.js",
                                "doSomething",
                                20
                            ]
                        ]   ,
                        jasmine.any(Number),
                        "C:/a.js",
                        "func",
                        10
                    ]
                ]
            );
        });
        it("测试2", function () {
            var a = null,
                b = null,
                c = null;
            a = {
                func1: function () {
                    collection.start("C:/a.js", "func1", 10);

                    var sum = 0,
                        i = 0;
                    for (i = 0; i < 10000000; i++) {
                        sum += i;
                    }
                    b.doSomething();
                    c.do2();

                    collection.end();
                },
                func2: function () {
                    collection.start("C:/a.js", "func2", 20);

                    var sum = 0,
                        i = 0;
                    for (i = 0; i < 10000000; i++) {
                        sum += i;
                    }
                    b.doSomething();

                    collection.end();
                }
            };
            b = {
                doSomething: function () {
                    collection.start("C:/b.js", "doSomething", 20);

                    var sum = 0,
                        i = 0;
                    for (i = 0; i < 10000000; i++) {
                        sum += i;
                    }
                    c.do1();

                    collection.end();
                }
            };
            c = {
                do1: function () {
                    collection.start("C:/c.js", "do1", 100);

                    var sum = 0,
                        i = 0;
                    for (i = 0; i < 10000000; i++) {
                        sum += i;
                    }

                    collection.end();
                },
                do2: function () {
                    collection.start("C:/c.js", "do2", 300);

                    var sum = 0,
                        i = 0;
                    for (i = 0; i < 10000000; i++) {
                        sum += i;
                    }

                    collection.end();
                }
            };

            a.func1();
            a.func2();

            expect(collection.outputData).toEqual(
                [
                    [
                        [
                            [
                                [
                                    [
                                        [ ],
                                        jasmine.any(Number),
                                        'C:/c.js',
                                        'do1',
                                        100
                                    ]
                                ],
                                jasmine.any(Number),
                                'C:/b.js',
                                'doSomething',
                                20
                            ],
                            [
                                [ ],
                                jasmine.any(Number),
                                'C:/c.js',
                                'do2',
                                300
                            ]
                        ],
                        jasmine.any(Number),
                        'C:/a.js',
                        'func1',
                        10
                    ],
                    [
                        [
                            [
                                [
                                    [
                                        [ ],
                                        jasmine.any(Number),
                                        'C:/c.js',
                                        'do1',
                                        100
                                    ]
                                ],
                                jasmine.any(Number),
                                'C:/b.js',
                                'doSomething',
                                20
                            ]
                        ],
                        jasmine.any(Number),
                        'C:/a.js',
                        'func2',
                        20
                    ]
                ]
            );
        });
    });

    describe("reset", function () {
        it("重置测试数据", function () {
            collection.outputData = [
                {},
                {}
            ];
            collection._depth = 100;

            collection.reset();

            expect(collection.outputData).toEqual([]);
            expect(collection._depth).toEqual(0);
        });
        it("如果设置了游戏引擎fps，则重置标志，并恢复引擎原来的fps", function () {
            var fakeDirector = {
                resumeRequestAnimFrameLoop: sandbox.stub()
            };
            sandbox.stub(window, "YE", {
                Director: {
                    getInstance: sandbox.stub().returns(fakeDirector)
                }
            });
            collection._isSetGameFps = true;

            collection.reset();

            expect(fakeDirector.resumeRequestAnimFrameLoop.calledOnce).toBeTruthy();
            expect(collection._isSetGameFps).toBeFalsy();
        });
    });

    describe("setFps", function () {
        beforeEach(function () {
        });
        afterEach(function () {
        });

        it("设置游戏引擎的fps", function () {
            var fps = 10,
                interval = 1 / fps;
            var fakeDirector = {
                setLoopIntervalAndRestart: sandbox.stub()
            };
            sandbox.stub(window, "YE", {
                Director: {
                    getInstance: sandbox.stub().returns(fakeDirector)
                }
            });

            collection.setFps(fps);

            expect(collection._isSetGameFps).toBeTruthy();
            expect(fakeDirector.setLoopIntervalAndRestart.calledOnce).toBeTruthy();
        });
    });


    describe("startTest", function () {
        it("重置测试数据", function () {
            sandbox.stub(collection, "reset");

            collection.startTest();

            expect(collection.reset.calledOnce).toBeTruthy();
        });
        it("标志为开始测试", function () {
            collection.startTest();

            expect(collection._isStart).toBeTruthy();
        });
        it("保存开始测试的时间", function () {
            collection.startTest();

            expect(collection._begineTime).not.toEqual(0);
        });
    });

    describe("endTest", function () {
        var engineMainLoopFileName = null,
            engineMainLoopFuncName = null;

        beforeEach(function () {
            engineMainLoopFileName = "Director.js";
            engineMainLoopFuncName = "mainLoop";
            sandbox.stub(YSpeedTester, "config", {
                engineMainLoopFileName: engineMainLoopFileName,
                engineMainLoopFuncName: engineMainLoopFuncName
            });
        });

        it("如果没有开始测试，则直接返回", function () {
            collection._isStart = false;

            var result = collection.endTest();

            expect(result).toBeNull();
        });
        it("标志为结束测试", function () {
            collection.startTest();

            collection.endTest();

            expect(collection._isStart).toBeFalsy();
        });

        describe("测试数据加入元数据", function () {
            beforeEach(function () {
                collection.startTest();
            });
            afterEach(function () {
            });

            it("元数据包含测试开始时间和测试结束时间", function () {
                collection.outputData = [];

                collection.endTest();

                var metaData = collection.outputData[collection.outputData.length - 1];
                expect(metaData.begineTime).not.toEqual(0);
                expect(metaData.mainLoopIndexArr).not.toEqual(0);
            });
            it("元数据包含测试数据第一级数据中引擎主循环数据的序号数组", function () {
                var mainLoopData = [
                        [],
                        1,
                        "c:/Director.js",
                        "mainLoop",
                        1
                    ],
                    otherFuncData = [
                        [],
                        1,
                        "c:/Scene.js",
                        "run",
                        1
                    ];
                collection.outputData = [mainLoopData, otherFuncData, mainLoopData];

                collection.endTest();

                var metaData = collection.outputData[collection.outputData.length - 1];
                expect(metaData.mainLoopIndexArr).toEqual([0, 2]);
            });
        });

    });

    describe("buildShowResultPage", function () {
        it("构建并返回showResult页面html代码（页面嵌入了js代码）", function () {
            var html = collection.buildShowResultPage();

            expect(html).toContain("<!DOCTYPE html>");
            expect(html).toContain("<script>[\\s\\S]+</script>");
        });
    });

    describe("buildPageName", function () {
        beforeEach(function () {
        });
        afterEach(function () {
        });

        it("构造页面名，包含开始测试时间和结束测试时间", function () {
            collection.outputData = [
                {
                    beginTime: 1405863539489,
                    endTime: 1405863549489
                }
            ];
            var from = "2014-07-20 21-41-50" ,
                to = "2014-07-20 21-42-25";
            sandbox.stub(YYC.Tool.date, "format");
            YYC.Tool.date.format.onCall(0).returns(from);
            YYC.Tool.date.format.onCall(1).returns(to);

            var pageName = collection.buildPageName();

            expect(pageName).toEqual("showResult_from_2014-07-20 21-41-50_to_2014-07-20 21-42-25.html");
        });
    });

});
