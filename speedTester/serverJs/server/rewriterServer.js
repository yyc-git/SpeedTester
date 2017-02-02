(function () {
    var path = require("path");
    var fs = require("fs");
    var url = require("url");
    var fileOperator = require("../fileOperator.js");
    var htmlrewriter = require("../rewriter/htmlrewriter.js");
    var jsrewriter = require("../rewriter/jsrewriter.js");
    var config = require("../config.js");
    var tool = require("../tool.js");
    require("../jsExtend.js");

    var isFirstRun = true;

    function run(req, res) {
        if (!isFirstRun) {
            return;
        }

        isFirstRun = false;

        fileOperator.copyAllFilesToOutputDir();
//        _findAndSetIndexDir();
        _rewriteHtml();
        _rewriteAllJs();
    }

//    function _findAndSetIndexDir() {
//        var parentDir = path.join(config.rootDir, config.outputDir),
//            matchResult = null;
//
//        globalData.indexAbsoluteDir = fileOperator.findFileCurrentDir(config.indexName, parentDir);
//
//        matchResult = new RegExp(config.outputDir + "/.+").exec(globalData.indexAbsoluteDir);
//
//        if (matchResult === null) {
//            throw new Error(globalData.indexAbsoluteDir + "格式错误，不能取出indexRelativeDir");
//        }
//        globalData.indexRelativeDir = matchResult[0];
//    }

    function _rewriteHtml() {
        var filePath = null,
            content = null;

        filePath = config.indexPath;
        content = htmlrewriter.editHtmlText(fs.readFileSync(filePath).toString());
        fs.writeFileSync(filePath, content);
    }

    function _rewriteAllJs() {
        if (config.jsRewriterWhiteList.length > 0) {
            _rewriteWhiteListJs();
            return;
        }

        fileOperator.getAllFilePaths(path.join(config.rootDir, config.outputDir)).filter(function (filePath) {
            if (filePath.indexOf(".js") > -1 && !_isInBlackList(filePath)) {
                return true;
            }
            return false;
        }).forEach(function (filePath) {
                _rewriteJs(filePath);
            });
    }

    function _rewriteWhiteListJs() {
        config.jsRewriterWhiteList.forEach(function (filePath) {
            _rewriteJs(filePath);
        });
    }

    function _rewriteJs(filePath) {
        var content = jsrewriter.addDataCollectionStatement(filePath, fs.readFileSync(filePath).toString());

        fs.writeFileSync(filePath, content);
    }

    function _isInBlackList(filePath) {
        var jsRewriterBlackList = config.jsRewriterBlackList,
            i = 0,
            len = jsRewriterBlackList.length,
            result = false;

        for (i = 0; i < len; i++) {
            //黑名单既可以指定文件名，也可以指定文件路径
            if (filePath.contain(jsRewriterBlackList[i])) {
                result = true;
                break;
            }
        }

        return result;
    }

    exports.run = run;
//    exports._findAndSetIndexDir = _findAndSetIndexDir;
    exports._rewriteHtml = _rewriteHtml;
    exports._rewriteAllJs = _rewriteAllJs;
}());