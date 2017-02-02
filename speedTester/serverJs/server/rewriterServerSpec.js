var server = require("./rewriterServer.js");
var sinon = require("sinon");
var fs = require("fs");
var fileOperator = require("../fileOperator.js");
var config = require("../config.js");
var tool = require("../tool.js");
var jsrewriter = require("../rewriter/jsrewriter");

describe("rewriterServer", function () {
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("_rewriteAllJs", function () {
        beforeEach(function () {
            sandbox.stub(jsrewriter, "addDataCollectionStatement");
            sandbox.stub(fs, "readFileSync").returns({
                toString: sandbox.stub()
            });
            sandbox.stub(fs, "writeFileSync");
        });

        it("如果设置了白名单，则只重写白名单指定的js文件", function () {
            var jsRewriterWhiteList = ["C:/a.js", "C:/b.js"];
            sandbox.stub(config, "jsRewriterWhiteList", jsRewriterWhiteList);

            server._rewriteAllJs();

            expect(fs.writeFileSync.firstCall.args[0]).toEqual(jsRewriterWhiteList[0]);
            expect(fs.writeFileSync.secondCall.args[0]).toEqual(jsRewriterWhiteList[1]);
        });

        describe("否则", function () {
            beforeEach(function () {
                sandbox.stub(config, "jsRewriterWhiteList", []);
            });

            it("重写不包含在黑名单中的js文件", function () {
                var jsRewriterBlackList = ["a.js", "C:/b.js"];
                sandbox.stub(config, "jsRewriterBlackList", jsRewriterBlackList);
                var allFilePaths = ["C:/a.js", "C:/b.js", "C:/c.js"];
                sandbox.stub(fileOperator, "getAllFilePaths").returns(allFilePaths);

                server._rewriteAllJs();

                expect(fs.writeFileSync.callCount).toEqual(1);
                expect(fs.writeFileSync.firstCall.args[0]).toEqual(allFilePaths[2]);
            });
        });
    });
//    describe("_findAndSetIndexDir", function () {
//        var dir = null;
//
//        beforeEach(function () {
//            dir = "C:/outputDir/view";
//            sandbox.stub(fileOperator, "findFileCurrentDir").returns(dir);
//        });
//        afterEach(function () {
//        });
//
//        it("寻找并设置项目页面的绝对目录", function () {
//            rewriterServer._findAndSetIndexDir();
//
//            expect(globalData.indexAbsoluteDir).toEqual(dir);
//        });
//        it("寻找并设置项目页面的相对目录", function () {
//            sandbox.stub(config, "outputDir", "/outputDir");
//
//            rewriterServer._findAndSetIndexDir();
//
//            expect(globalData.indexRelativeDir).toEqual("/outputDir/view");
//        });
//    });
});
