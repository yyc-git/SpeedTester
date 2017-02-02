var sinon = require("sinon");
var fs = require("fs");
var config = require("../config.js");
var tool = require("../tool.js");
var controller = require("./controller.js");
var querystring = require("querystring");

describe("controller", function () {
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("index", function () {
        beforeEach(function () {
            sandbox.stub(fs, "readFile");
        });
        afterEach(function () {
        });

        it("读取并返回项目页面", function () {
            var fakeResponse = {
                writeHead: sandbox.stub(),
                write: sandbox.stub(),
                end: sandbox.stub()
            };
            var content = "<html></html>";
            sandbox.stub(config, "indexPath", "C:/output/view/index.html");

            controller.index({}, fakeResponse);
            fs.readFile.callArgWith(2, null, content);

            expect(tool.changeToUnixifyPath(fs.readFile.firstCall.args[0])).toEqual("C:/output/view/index.html");
            expect(fakeResponse.write.calledWith(content)).toBeTruthy();
        });
    });

    describe("showResult", function () {
        beforeEach(function () {
        });
        afterEach(function () {
        });

        it("不处理get请求", function () {
            var fakeRequest = {
                method: "GET"
            };

            expect(controller.showResult(fakeRequest, {})).toBeNull();
        });

        describe("处理post请求", function () {
            var fakeRequest = null;

            beforeEach(function () {
                fakeRequest = {
                    method: "POST",
                    setEncoding: sandbox.stub(),
                    on: sandbox.stub()
                };
                sandbox.stub(fs, "readFile");
            });
            afterEach(function () {
            });

            it("读取显示数据页面", function () {
                var showResultPath = "C:/showResult.html";
                sandbox.stub(config, "showResultPath", showResultPath);

                controller.showResult(fakeRequest, {});
                fakeRequest.on.secondCall.callArg(1);

                expect(fs.readFile.firstCall.args[0]).toEqual(showResultPath);
            });
            it("将post传入的值保存到页面的隐藏域中", function () {
                var outputData = "[1,{}, \"aaa\"]";
                sandbox.stub(querystring, "parse").returns({
                    outputData: outputData
                });
                var pageHtml = "<html><body><input type='hidden' value='__RESULT__'/></body></html>"
                var fakeResponse = {
                    writeHead: sandbox.stub(),
                    write: sandbox.stub(),
                    end: sandbox.stub()
                };

                controller.showResult(fakeRequest, fakeResponse);
                fakeRequest.on.secondCall.callArg(1);
                fs.readFile.callArgWith(2, null, pageHtml);

                expect(fakeResponse.write.firstCall.args[0]).toContain("value='"+outputData+"'");
            })
        });
    });
});