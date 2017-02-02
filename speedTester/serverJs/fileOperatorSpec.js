var request = require("request");
var sinon = require("sinon");
var fs = require("fs");
var path = require("path");
var config = require("./config.js");
var operator = require("./fileOperator.js");

describe("fileOperator", function () {
    var sandbox = null;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });

    describe("copyAllFilesToOutputDir", function () {
        beforeEach(function () {
            sandbox.stub(operator, "copyFileSync");

            sandbox.stub(operator, "deleteFolderRecursive") ;
            sandbox.stub(fs, "mkdirSync") ;
        });
        afterEach(function () {
//            sandbox.restore();
        });

//        it("如果输出目录不存在，则创建输出目录", function () {
//            sandbox.stub(config,"rootDir", "C:/");
//            sandbox.stub(config, "outputDir", "/outputDir/");
//            sandbox.stub(fs, "existsSync", function (path) {
//                if (path === config.outputDir) {
//                    return false;
//                }
//                return true;
//            });
////            fs.existsSync = null;
////            var t = require("../config.js").outputDir;
//
////            setTimeout(function(){
////                var t = require("../config.js").outputDir;
////                 t = 1;
////            }, 500);
//
////            sandbox.stub(require("../config.js"), "outputDir", outputDir);
//
////            var m = require("../config.js").outputDir;
//
////            sandbox.stub(global, "require", {});
//            sandbox.stub(fs, "mkdirSync");
//
////            config.a = 1;
//
////            request(serverPath, function (error, response, body) {
//////                报timed out after 5000 msec waiting for spec to complete错误！
//////                服务器端能够执行，但此次仍会报错！为什么？？
////                var aaa = require("../config.js").outputDir;
////                expect(fs.mkdirSync.calledOnce).toBeTruthy();
////
//////                sandbox.restore();
////                done();
////            });
//
//            operator.copyAllFilesToOutputDir();
//
//            expect(fs.mkdirSync.callCount).toEqual(3);
//        });
        it("清空输出目录", function () {
            sandbox.stub(config, "rootDir", "C:");
            sandbox.stub(config, "outputDir", "/outputDir");
            sandbox.stub(operator, "getAllFilePaths").returns([]);

            operator.copyAllFilesToOutputDir();

            expect(operator.deleteFolderRecursive.calledWith("C:\\outputDir")).toBeTruthy();
            expect(fs.mkdirSync.calledWith("C:\\outputDir")).toBeTruthy();
        });
        it("拷贝指定目录下的所有文件到输出目录下，输出目录与指定目录具有相同的目录结构", function () {
            var outputFilePath = "C:/output/a.js";
            sandbox.stub(operator, "_getCorrespondingOutPutFilePath").returns(outputFilePath);
            sandbox.stub(fs, "existsSync", function (path) {
                return false;
            });
            sandbox.stub(operator, "mkFolderRecursive");
            sandbox.stub(config, "fileServerBaseDir", "/baseDir/");
            var filePaths = ["C:/baseDir/script/a.js", "C:/baseDir/view/b.html"];
            sandbox.stub(operator, "getAllFilePaths").returns(filePaths);

            operator.copyAllFilesToOutputDir();

            expect(operator.mkFolderRecursive.called).toBeTruthy();
            expect(operator.copyFileSync.callCount).toEqual(2);
        });
    });

    describe("客户测试", function () {
        var baseDir = null;

        function getUniqueDir() {
            var dir = "C:/forTest_baseDir";

            while (fs.existsSync(dir)) {
                dir = "C:/forTest_baseDir" + Math.random().toString();
            }

            return dir;
        }

        beforeEach(function () {
            baseDir = getUniqueDir();
        });
        afterEach(function () {
            operator.deleteFolderRecursive(baseDir);
        });

        describe("mkFolderRecursive", function () {
            it("递归创建目录", function () {
                var dir = baseDir + "/a/b";

                operator.mkFolderRecursive(dir);

                expect(fs.existsSync(dir)).toBeTruthy();
            });
            it("参数可以为文件路径", function () {
                var dir = baseDir + "/a/b";

                operator.mkFolderRecursive(dir + "/a.js");

                expect(fs.existsSync(dir)).toBeTruthy();
                expect(fs.existsSync(dir + "/a.js")).toBeFalsy();
            });
        });

        describe("findFileCurrentDir", function () {
            it("根据文件名在文件的上级目录中查找文件，获得文件所在的当前目录", function () {
                var dir = baseDir + "/a/b";
                operator.mkFolderRecursive(dir);
                fs.writeFileSync(dir + "/b.js", "function b(){};");

                var path = operator.findFileCurrentDir("b.js", baseDir);

                expect(path).toEqual(baseDir + "/a/b");
            });
            it("路径中的\\转换为/", function () {
                var dir = path.join(baseDir, "/a/b");
                operator.mkFolderRecursive(dir);
                fs.writeFileSync(path.join(dir, "/b.js"), "function b(){};");

                var filePath = operator.findFileCurrentDir("b.js", baseDir);

                expect(filePath).toEqual(baseDir + "/a/b");
            });
        });

        describe("getAllFilePaths", function () {
            it("获得目录中所有文件的路径", function () {
                operator.mkFolderRecursive(baseDir + "/script/a");
                operator.mkFolderRecursive(baseDir + "/script/b");
                operator.mkFolderRecursive(baseDir + "/view");
                fs.writeFileSync(baseDir + "/script/b.js", "function b(){};");
                fs.writeFileSync(baseDir + "/script/a/a.js", "function a(){};");
                fs.writeFileSync(baseDir + "/view/c.html", "<html></html>");

                var filePaths = operator.getAllFilePaths(baseDir);

                expect(filePaths).toEqual([
                    baseDir + '/script/a/a.js', baseDir + '/script/b.js', baseDir + '/view/c.html'
                ]);
            });
        });

        describe("copyFileSync", function () {
            it("复制文件", function () {
                var srcFile = baseDir + "/a.js",
                    destFile = baseDir + "/b.js";
                operator.mkFolderRecursive(baseDir);
                fs.writeFileSync(srcFile, "var k = 1000 / 5;");

                operator.copyFileSync(srcFile, destFile);

                expect(fs.readFileSync(destFile).toString()).toEqual("var k = 1000 / 5;");
            });
        });

    });
});