(function () {
    "use strict";

    var fs = require("fs");
    var path = require("path");
    var JsTokenizer = require("./JsTokenizer.js");
    var tool = require("../tool.js");

    var collectionTemplate = fs.readFileSync(path.join(__dirname, "template/collectionTemplate.js")).toString();
    var collectionInterceptorParts = collectionTemplate.split("SPLIT");
    var collectionInterceptorStart = collectionInterceptorParts[0].trim();
    var collectionInterceptorEnd = collectionInterceptorParts[1].trim();

    var out = [],
        nestingDepth = [],
        line = 1,
        funcName = null,
        wordBeforeFunction = null;
//        isTokenBetweenFunctionKeywordAndPositiveBracket = false,
//        isTokenBetweenFunctionKeywordAndCurlyBrace = false;

    var rewriter = {
        addDataCollectionStatement: function (filePath, text) {
            var self = this;

            this._reset();

            //转换地址中的“\\”为“/”，解决_buildCollectionnInterceptorStart中替换filepath后“\\”变成“\”的问题
            filePath = tool.changeToUnixifyPath(filePath);

            JsTokenizer.getInstance().tokenize(text, function (token, type, getBeforeTokenData, getAfterTokenData) {
                self._handleToken(token, type, filePath, getBeforeTokenData, getAfterTokenData);
            });

            return out.join("");
        },
        _reset: function () {
            out = [];
            nestingDepth = [];
            line = 1;
            funcName = null;
            wordBeforeFunction = null;
//            isTokenBetweenFunctionKeywordAndPositiveBracket = false;
//            isTokenBetweenFunctionKeywordAndCurlyBrace = false;
        },
        _handleToken: function (token, type, filePath, getBeforeTokenData, getAfterTokenData) {
            switch (token) {
                case '"use strict"':
                case "'use strict'" :
                    out.push("/* cannot work in strict mode.*/");
                    break;
                case   "function":
                    nestingDepth.push(0);
                    funcName = this._getFuncName(getBeforeTokenData, getAfterTokenData);
//                    isTokenBetweenFunctionKeywordAndPositiveBracket = true;
//                    isTokenBetweenFunctionKeywordAndCurlyBrace = true;

                    out.push(token);
                    break;
//                case "(":
//                    isTokenBetweenFunctionKeywordAndPositiveBracket = false;
//
//                    out.push(token);
//                    break;
                case "{" :
                    ++nestingDepth[nestingDepth.length - 1];
//                    isTokenBetweenFunctionKeywordAndCurlyBrace = false;
//
//                    if (funcName === null && this._isEnterFunction(nestingDepth)) {
//                        funcName = this._getFuncName(wordBeforeFunction);
//                    }

                    out.push(token);

                    if (this._isEnterFunction(nestingDepth)) {
                        out.push(this._buildCollectionnInterceptorStart(filePath, funcName, line));
                    }
                    break;
                case "}":
                    --nestingDepth[nestingDepth.length - 1];

                    if (this._isExitFunction(nestingDepth)) {
                        out.push(this._buildCollectionnInterceptorEnd());
                        nestingDepth.pop();
                        funcName = null;
                    }

                    out.push(token);
                    break;
                case "return" :
                    out.push(this._buildCollectionnInterceptorEnd());
                    out.push(token);
                    break;
                default :
                    line = this._computeLine(token, type, line);

                    out.push(token);
                    break;
            }
        },
        _getFuncName: function (getBeforeTokenData, getAfterTokenData) {
            var funcName = null;

            /*处理下面几种情况：
             var a = function(){   //wordBeforeFunction = a
             };
             var b = function(src, props){  //wordBeforeFunction = b
             };
             var c = {
             func:function(src){   //wordBeforeFunction = func
             }
             };
             */
            funcName = this._findPrev(getBeforeTokenData);
            if (funcName) {
                return funcName;
            }
            // 处理“function xx()//则获得xx函数名”的情况
            funcName = this._findAfter(getAfterTokenData);

            if (funcName) {
                return funcName;
            }

            return "anonymous";
        },
        _findPrev: function (getBeforeTokenData) {
            var index = 0,
                data = getBeforeTokenData(index),
                tokens = [],
                funcName = null;

            while (this._isNotNullData(data)) {
                if (data.type !== "whitespace") {
                    tokens.push(data);
                    if (this._isFuncNameWhenFindPrev(tokens)) {
                        funcName = tokens[1].token;
                        break;
                    }
                    if (tokens.length > 2) {
                        funcName = null;
                        break;
                    }
                }

                index += 1;
                data = getBeforeTokenData(index);
            }

            return funcName;
        },
        _isNotNullData: function (data) {
            return data.token !== null && data.type !== null;
        },
        _isFuncNameWhenFindPrev: function (tokens) {
            return tokens.length === 2
                && tokens[1].type === "word"
                && (tokens[0].token === ":" || tokens[0].token === "=");
        },
        _findAfter: function (getAfterTokenData) {
            var index = 0,
                data = getAfterTokenData(index),
                funcName = null;

            while (this._isNotNullData(data)) {
                if (data.type !== "whitespace") {
//                    tokens.push(data);
                    if (this._isFuncNameWhenFindAfter(data)) {
                        funcName = data.token;
                        break;
                    }
//                    if (tokens.length > 2) {
                    funcName = null;
                    break;
//                    }
                }

                index += 1;
                data = getAfterTokenData(index);
            }

            return funcName;
        },
        _isFuncNameWhenFindAfter: function (data) {
            return data.type === "word";
        },
        _isEnterFunction: function (nestingDepth) {
            return nestingDepth.length > 0 && nestingDepth[nestingDepth.length - 1] === 1;
        },
        _isExitFunction: function (nestingDepth) {
            return nestingDepth.length > 0 && nestingDepth[nestingDepth.length - 1] === 0;
        },
        _computeLine: function (token, type, line) {
            var delimiter = null;

            if (type === "newline") {
                line += 1;
            }
            else if (type == "comment") {
                if (this._isWindowOrMac(token)) {
                    delimiter = "\r";
                }
                else if (this._isLinuxOrUnix(token)) {
                    delimiter = "\n";
                }
                line += token.split("\n").length - 1;
            }

            return line;
        },
        _isWindowOrMac: function (str) {
            return str.indexOf("\r") > -1;
        },
        _isLinuxOrUnix: function (str) {
            return str.indexOf("\r\n") === -1 && str.indexOf("\n") > -1;
        },
        _buildCollectionnInterceptorStart: function (filePath, funcName, line) {
            return collectionInterceptorStart
                .replace("__FILEPATH__", filePath)
                .replace("__FUNCNAME__", funcName)
                .replace("__LINE__", line);
        },
        _buildCollectionnInterceptorEnd: function () {
            return collectionInterceptorEnd;
        }
    };


    module.exports = rewriter;
}());


