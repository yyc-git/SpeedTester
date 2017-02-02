var rewriter = require("./htmlrewriter.js");
var config = require("../config.js");
var sinon = require("sinon");

describe("htmlrewriter", function () {
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

//    describe("_changeJsDirToOutputDir", function () {
//        beforeEach(function () {
//        });
//        afterEach(function () {
//        });
//
//        it("更改项目的js路径为outputDir目录中的js", function () {
//            var content = '<html><head>' +
//                '<script src=\'./a.js\'></script>' +
//                '\n  <script src="../b.js"></script>\n </head>' +
//                '<body><script></script></body></html>';
//            var fakeIndexDir = 'outputDir/view';
//            sandbox.stub(globalData, "indexRelativeDir", fakeIndexDir);
//
//            var result = rewriter._changeJsDirToOutputDir(content);
//
////            expect(require("path").join(fakeIndexDir, "./a.js")).toEqual("");
////            expect(require("path").normalize("view/./a.js")).toEqual("");
//            expect(result).toContain("<script src='outputDir/view/a.js'></script>");
//            expect(result).toContain('<script src="outputDir/b.js"></script>');
//            expect(result).toContain('<script></script>');
//        });
//    });


    describe("_insertJs", function () {
        it("插入js", function () {
            var fakeInsertJs = ["a.js", "b.js"];
            sandbox.stub(config, "insertJs", fakeInsertJs);
            var content = "<html><head></head></html>";
            var foregroundDir = "/foregroundJs/";
            sandbox.stub(config, "foregroundDir", foregroundDir);

            var result = rewriter._insertJs(content);

            expect(result).toContain('<script type="text/javascript" src="' + foregroundDir + fakeInsertJs[0] + '"></script>');
            expect(result).toContain('<script type="text/javascript" src="' + foregroundDir + fakeInsertJs[1] + '"></script>');
        });
    });

    describe("_insertTestControll", function () {
        beforeEach(function () {
        });
        afterEach(function () {
        });

        it("在页面最上方插入测试控制html元素", function () {
            var content = "<html><head><body style=\"\"><div></div></body></head></html>";

            var result = rewriter._insertTestControll(content);

            expect(result).toContain('<body style=""><p><input type="button" value="开始测试" id="startTestForDataCollection"/>'
                + '<input type="button" value="结束测试" id="endTestForDataCollection"/>');
            expect(result).toContain("指定主循环帧数");
        });
    });
});
