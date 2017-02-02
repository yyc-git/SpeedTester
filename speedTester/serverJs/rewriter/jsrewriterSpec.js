var rewriter = require("./jsrewriter.js");
var sinon = require("sinon");

describe("jsrewriter", function () {
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("addDataCollectionStatement", function () {
        // 将js代码转换为多行字符串
        // 示例：
        // _convertCodeToString(function () {
        // var a = {
        // func: function () {
        // }
        // };
        // });
        function _convertCodeToString(fn) {
            return fn.toString().split('\n').slice(1, -1).join('\n') + '\n'
        }

        beforeEach(function () {
        });
        afterEach(function () {
        });

        it("不使用严格模式", function () {
            var text = "\"use strict\"\n";

            var result = rewriter.addDataCollectionStatement("", text);

            expect(result).toEqual("/* cannot work in strict mode.*/\n");
        });

        describe("获得过程名称", function () {
            beforeEach(function () {
                sandbox.stub(rewriter, "_buildCollectionnInterceptorStart", function (filePath, funcName, line) {
                    return "collectionStart:" + filePath + "|" + funcName + "|" + line;
                });
                sandbox.stub(rewriter, "_buildCollectionnInterceptorEnd").returns("collectionEnd;");
            });

            describe("获得函数名", function () {
                it("测试1", function () {
                    var text = _convertCodeToString(function () {
                        function a() {
                        }
                    });

                    var result = rewriter.addDataCollectionStatement("", text);

                    expect(result).toContain("{collectionStart:|a|1");
                });
                it("测试2", function () {
                    var text = _convertCodeToString(function () {
                        var a = function () {
                        }
                    });

                    var result = rewriter.addDataCollectionStatement("", text);

                    expect(result).toContain("{collectionStart:|a|1");
                });
                it("测试3", function () {
                    var text = _convertCodeToString(function () {
                        var b = function (src, props) {
                        };
                    });

                    var result = rewriter.addDataCollectionStatement("", text);

                    expect(result).toContain("{collectionStart:|b|1");
                });
                it("测试4", function () {
                    var text = _convertCodeToString(function () {
                        var c = {
                            func: function (src) {
                            }
                        };
                    });

                    var result = rewriter.addDataCollectionStatement("", text);

                    expect(result).toContain("{collectionStart:|func|2");
                });
                it("测试5", function () {
                    var text = _convertCodeToString(function () {
                        var t = function a() {
                        }
                    });

                    var result = rewriter.addDataCollectionStatement("", text);

                    expect(result).toContain("{collectionStart:|t|1");
                });
            });

            it("获得匿名函数名", function () {
                var text = _convertCodeToString(function () {
                     (function(){
                     }());
                });

                var result = rewriter.addDataCollectionStatement("", text);

                expect(result).toContain("{collectionStart:|anonymous|1");
            });
        });

        describe("过程的开头、return前、结尾插入测试代码", function () {
            var filePath = null;

            beforeEach(function () {
                filePath = "C:/a.js";
                sandbox.stub(rewriter, "_buildCollectionnInterceptorStart", function (filePath, funcName, line) {
                    return "collectionStart:" + filePath + "|" + funcName + "|" + line;
                });
                sandbox.stub(rewriter, "_buildCollectionnInterceptorEnd").returns("collectionEnd;");
            });

            it("测试1", function () {
                var text = _convertCodeToString(function () {
                     var a = {
                     func: function () {
                     var t = 1;
                     b.setVal();
                     }
                     };
                     var b = {
                     setVal: function () {
                     var m =100;
                     }
                     };
                });

                var result = rewriter.addDataCollectionStatement(filePath, text);

                expect(result).toContain("func: function () {collectionStart:C:/a.js|func|2");
                expect(result).toContain("setVal: function () {collectionStart:C:/a.js|setVal|8");
                expect(result).toContain("collectionEnd;}");
            });
            it("测试2", function () {
                var text = _convertCodeToString(function () {
                     function a(){
                     var t = 1;
                     }
                });

                var result = rewriter.addDataCollectionStatement(filePath, text);

                expect(result).toContain("function a(){collectionStart:C:/a.js|a|1");
                expect(result).toContain("collectionEnd;}");
            });
            it("测试3", function () {
                var text = _convertCodeToString(function () {
                     var a = function(){
                     };
                     var b = function(src, props){
                     };
                });

                var result = rewriter.addDataCollectionStatement(filePath, text);

                expect(result).toContain("var a = function(){collectionStart:C:/a.js|a|1");
                expect(result).toContain("var b = function(src, props){collectionStart:C:/a.js|b|3");
                expect(result.match(/collectionEnd;}/g).length).toEqual(2);
            });
            it("测试4", function () {
                var text = _convertCodeToString(function () {
                     //匿名函数
                     (function(){
                     var t = 1;
                     var k = {
                     func:function(callback){
                     callback();
                     }
                     };
                     (function(){
                     });
                     }());
                });

                var result = rewriter.addDataCollectionStatement(filePath, text);

                expect(result).toContain("(function(){collectionStart:C:/a.js|anonymous|2");
                expect(result).toContain("func:function(callback){collectionStart:C:/a.js|func|5");
                expect(result).toContain("(function(){collectionStart:C:/a.js|anonymous|9");
                expect(result.match(/collectionEnd;}/g).length).toEqual(3);
            });
            it("测试过程嵌套的情况", function () {
                var text = _convertCodeToString(function () {
                     var m = 1;
                     (function(){
                     var a = {
                     func: function () {
                     var t = 1;
                     function b(){
                     var k = {
                     a:1
                     }
                     }
                     }
                     };
                     }());
                });

                var result = rewriter.addDataCollectionStatement(filePath, text);

                expect(result).toContain("(function(){collectionStart:C:/a.js|anonymous|2");
                expect(result).toContain("func: function () {collectionStart:C:/a.js|func|4");
                expect(result).toContain("function b(){collectionStart:C:/a.js|b|6");
                expect(result.match(/collectionEnd;}/g).length).toEqual(3);
            });

            describe("测试在return语句前插入测试代码", function () {
                it("测试1", function () {
                    var text = _convertCodeToString(function () {
                         var a = function(){
                         var m = 1;
                         return true;
                         };
                    });

                    var result = rewriter.addDataCollectionStatement(filePath, text);

                    expect(result).toContain("collectionEnd;return true;");
                    expect(result).toContain("collectionEnd;}");
                });
//                it("测试2", function () {
//                    var text = _convertCodeToString(function () {
//                         var a = function(){
//                         if(true) return true;
//                         };
//                    });
//
//                    var result = rewriter.addDataCollectionStatement(filePath, text);
//
//                    expect(result).toContain("if(true) {collectionEnd;return true;}");
//                    expect(result).toContain("collectionEnd;}");
//                });
//                it("测试3", function () {
//                    var text = _convertCodeToString(function () {
//                         var a = function(){
//                         if(true) return 1
//                         + 2;
//                         };
//                    });
//
//                    var result = rewriter.addDataCollectionStatement(filePath, text);
//
//                    expect(result).toContain("if(true) {collectionEnd;return 1");
//                    expect(result).toContain("+ 2;}");
//                    expect(result).toContain("collectionEnd;}");
//                });
//                it("测试4", function () {
//                    var text = _convertCodeToString(function () {
//                         var a = function(){
//                         if(true)
//                         return function(){
//                         var t = 1;
//                         return function(){
//                         };
//                         }
//
//                         };
//                    });
//
//                    var result = rewriter.addDataCollectionStatement(filePath, text);
//
////                    expect(result).toEqual("");
//                    expect(result.match(/\{collectionEnd;return function\(\)\{collectionStart/g).length).toEqual(2);
//                    expect(result).toContain("collectionEnd;}};\n");
//                    expect(result).toContain("collectionEnd;}}\n");
//                    expect(result).toContain("collectionEnd;}");
//                });
//                it("测试5", function () {
//                    var text = _convertCodeToString(function () {
//                         var a = function(){
//                         if(true)
//                         return function(){
//                         var t = 1;
//                         return {
//                         };
//                         var k = {};
//                         }
//                         };
//                    });
//
//                    var result = rewriter.addDataCollectionStatement(filePath, text);
//
//                    expect(result).toContain("{collectionEnd;return function(){");
//                    expect(result).toContain("{collectionEnd;return {\n");
//                    expect(result).toContain("var k = {};\n");
//                    expect(result).toContain(" collectionEnd;}}\n");
//                    expect(result).toContain("collectionEnd;}");
//                });
//                it("测试6", function () {
//                    var text = _convertCodeToString(function () {
//                         var a = function(){
//                         if(true)
//                         return (function(){
//                             return (function(){
//                             })();
//                         }());
//                         };
//                    });
//
//                    var result = rewriter.addDataCollectionStatement(filePath, text);
//
//                    expect(result).toContain(" collectionEnd;})()};\n");
//                    expect(result).toContain("collectionEnd;}())};");
//                });
//                it("测试7", function () {
//                    var text = _convertCodeToString(function () {
//                         var a = function(){
//                         return (function(){
//                             return 1;
//                         }(a, b));
//                         };
//                    });
//
//                    var result = rewriter.addDataCollectionStatement(filePath, text);
//
//                    expect(result).toContain(" collectionEnd;})(a, b)};\n");
//                });
            });
        });
    });
});
