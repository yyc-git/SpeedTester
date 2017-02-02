var sinon = require("sinon");
var fs = require("fs");
var config = require("../config.js");
var tool = require("../tool.js");
var server = require("./resourceServer.js");
var mimeTypes = require("../mime.js");

describe("resourceServer", function () {
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("加载静态资源", function () {
        var fakeRequest = null,
            fakeResponse = null;

        beforeEach(function () {
            fakeResponse = {
                writeHead: sandbox.stub(),
                write: sandbox.stub(),
                end: sandbox.stub()
            };
            fakeRequest = {
                url: "/script/a.js"
            };
            sandbox.stub(fs, "exists");
        });
        afterEach(function () {
        });

        it("如果资源不存在，则返回404响应", function () {
            server.run(fakeRequest, fakeResponse);
            fs.exists.callArgWith(1, false);

            expect(fakeResponse.writeHead.firstCall.args[0]).toEqual(404);
        });

        describe("否则", function () {
            var fakeStat = null;
            var fakeMimeTypes = {
                "js": "application/javascript"
            };

            beforeEach(function () {
                fakeResponse.setHeader = sandbox.stub();
                fakeStat = {
                    mtime: {
                        toUTCString: sandbox.stub()
                    }
                };
                sandbox.stub(fs, "statSync").returns(fakeStat);
            });
            afterEach(function () {
            });

            it("如果能找到mimeType，则设置Expires和Cache-Control", function () {
                fakeRequest.headers = {};
                sandbox.stub(mimeTypes, "types", fakeMimeTypes);

                server.run(fakeRequest, fakeResponse);
                fs.exists.callArgWith(1, true);

                expect(fakeResponse.setHeader.firstCall.args[0]).toEqual("Expires");
                expect(fakeResponse.setHeader.secondCall.args[0]).toEqual("Cache-Control");
            });
            it("检查if-modified-since，如果文件没有修改，则返回304响应", function () {
                var date = "Fri, 11 Nov 2011 19:14:51 GMT";
                fakeRequest.headers = {
                    "if-modified-since": date
                };
                fakeStat.mtime.toUTCString = sandbox.stub().returns(date);

                server.run(fakeRequest, fakeResponse);
                fs.exists.callArgWith(1, true);

                expect(fakeResponse.writeHead.firstCall.args[0]).toEqual(304);
                expect(fakeResponse.end.calledOnce).toBeTruthy();
            });
            describe("否则，加载资源并返回", function () {
                beforeEach(function () {
                    fakeRequest.headers = {
                    };
                    sandbox.stub(fs, "readFile");
                });

                it("如果请求测试用的js，读取对应目录下的js", function () {
                    fakeRequest.url = "/foregroundJs/a.js";
                    sandbox.stub(config, "rootDir", "C:");

                    server.run(fakeRequest, fakeResponse);
                    fs.exists.callArgWith(1, true);

                    expect(tool.changeToUnixifyPath(fs.readFile.firstCall.args[0]))
                        .toEqual("C:/foregroundJs/a.js");
                });
                it("如果请求页面中引用的js，读取outputDir中对应的js", function () {
                    fakeRequest.url = "/script/a.js";
                    sandbox.stub(config, "projectRootDir", "C:/baseDir");

                    server.run(fakeRequest, fakeResponse);
                    fs.exists.callArgWith(1, true);

                    expect(tool.changeToUnixifyPath(fs.readFile.firstCall.args[0]))
                        .toEqual("C:/baseDir/script/a.js");
                });
                it("如果发生错误，则返回500响应", function () {
                    var err = "error";

                    server.run(fakeRequest, fakeResponse);
                    fs.exists.callArgWith(1, true);
                    fs.readFile.callArgWith(1, err);

                    expect(fakeResponse.writeHead.firstCall.args[0]).toEqual(500);
                    expect(fakeResponse.end.calledWith(err)).toBeTruthy();
                });
                it("否则，设置Last-Modified，返回资源", function () {
                    var data = "<script></script>";
                    var date = "Fri, 11 Nov 2011 19:14:51 GMT";
                    fakeStat.mtime.toUTCString = sandbox.stub().returns(date);

                    server.run(fakeRequest, fakeResponse);
                    fs.exists.callArgWith(1, true);
                    fs.readFile.callArgWith(1, null, data);

                    expect(fakeResponse.setHeader.calledWith("Last-Modified", date)).toBeTruthy();
                    expect(fakeResponse.writeHead.calledWith(200, {"Content-Type": fakeMimeTypes["js"]})).toBeTruthy();
                    expect(fakeResponse.write.calledWith(data)).toBeTruthy();
                    expect(fakeResponse.end.calledOnce).toBeTruthy();
                });
            });
        });

    });
});