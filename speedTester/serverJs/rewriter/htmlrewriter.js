(function () {
    var path = require("path");
    var config = require("../config.js");
    var tool = require("../tool.js");
    require("../jsExtend.js");

    function editHtmlText(content) {
        var content = content;

//        content = _changeJsDirToOutputDir(content);
        content = _insertJs(content);
        content = _insertTestControll(content);

        return content;
    }

//    function _changeJsDirToOutputDir(content) {
//        var pagePath = globalData.indexRelativeDir;
//
//        content = content.replace(/<script\s+src.+<\/script>/g, function (strMatch) {
//            return strMatch.replace(/src=("|')([^>\s]+)\1/, function (fullMatch, match1, match2) {
//                return "src=" + match1 + tool.changeToUnixifyPath(path.join(pagePath, match2)) + match1;
//            });
//        });
//
//        return content;
//    }

    function _insertJs(content) {
        var whereToInsertJs = "<head>",
            where = content.indexOf(whereToInsertJs) + whereToInsertJs.length,
            scripts = "";

        config.insertJs.forEach(function (fileName) {
            scripts += ['<script type="text/javascript" src="'
                + tool.changeToUnixifyPath(path.join(config.foregroundDir, fileName))
                + '"></script>', "\n"].join("");
        });

        content = [content.slice(0, where), "\n", scripts, content.slice(where)].join("");

        return content;
    }

    function _insertTestControll(content) {
        var html = '<p><input type="button" value="开始测试" id="startTestForDataCollection"/>'
            +'<input type="button" value="结束测试" id="endTestForDataCollection"/>'
            +'<span style="color:white;">指定主循环帧数：</span><input type="text" value="" id="mainLoopFPS"><span style="color:white;">FPS</span>'
            +'</p>';

        content = content.replace(/<body([^>]*)>/, '<body$1>' + html);

        return content;
    }

    exports.editHtmlText = editHtmlText;
//    exports._changeJsDirToOutputDir = _changeJsDirToOutputDir;
    exports._insertJs = _insertJs;
    exports._insertTestControll = _insertTestControll;
}());
