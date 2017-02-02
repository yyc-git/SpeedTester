(function () {
    "use strict";

    var tool = require("../tool.js");
    require("../YOOP.js");

    var _instance = null;

    var JsTokenizer = YYC.Class({
        Init: function () {
            this._historyData = [];
        },
        Private: {
            _pos: 0,
            _historyData: null,
            _str: null,

            _getCurrentPos: function () {
                return this._pos;
            },
            _setNextPos: function (data) {
                this._pos = data.pos;
            },
            _isNotNullData: function (data) {
                return data.token !== null && data.type !== null;
            },
            _getBeforeTokenData: function (index) {
                var index = index || 0,
                    i = this._historyData.length - index - 1;

                if (i < 0) {
                    return this._buildNullData(-1);
                }

                return this._historyData[i];
            },
            _getAfterTokenData: function (index) {
                var data = null,
                    i = 0,
                    len = this._str.length,
                    index = index || 0,
                    pos = this._pos;

//           pos为下一个token的起始位置，而不是当前token的起始位置！

                for (i = 0; i <= index; i++) {
                    data = this._getData(pos, this._str);
                    pos = data.pos;
                }

                if (data.pos < len) {
                    data.pos = data.pos - 1;
                }

                return data;
            },
            _buildNullData: function (pos) {
                return {
                    token: null,
                    type: null,
                    pos: pos
                };
            },
            _getData: function (pos, str) {
                var c = str[pos],
                    data = null;

                //处理最后一个字符
                if (pos === str.length - 1) {
                    return this._extractChar(pos, str);
                }
                //处理超出字符长度的情况
                if (pos > str.length - 1) {
                    return this._buildNullData(pos);
                }

                if (c === "\"" || c === "'") {
                    data = this._extractString(c, pos, str);
                }
                else if (c === "/" && str[pos + 1] === "/") {
                    data = this._extractSingleLineComment(pos, str);
                }
                else if (c === "/" && str[pos + 1] === "*") {
                    data = this._extractMultiLineComment(pos, str);
                }
                else if (c === "/" && "/*".indexOf(str[pos + 1]) === -1) {
                    data = this._tryExtractRegexLiteral(pos, str);
                }
                else if (c === " " || c === "\t") {
                    data = this._extractWhitespace(pos, str);
                }
                else if ("0123456789".indexOf(c) > -1) {
                    data = this._extractNumber(pos, str);
                }
                else if (c.match(/^[a-zA-Z_$]$/) !== null) {
                    data = this._extractWord(pos, str);
                }
                else if (c === "\r" || c === "\n") {
                    data = this._extractNewline(pos, str);
                }
                else {
                    data = this._extractChar(pos, str);
                }

                return data;
            },


            _extractString: function (flagChar, pos, str) {
                var endPos = pos + 1;

                while (str[endPos] != flagChar) {
                    if (str[endPos] == "\\") {
                        endPos += 1;
                    }
                    endPos += 1;
                }
                endPos += 1;

                return {
                    token: str.substring(pos, endPos),
                    type: "string",
                    pos: endPos
                }
            },

            _extractSingleLineComment: function (pos, str) {
                var endPos = this._computeEndPos(pos, str);

                return {
                    token: str.substring(pos, endPos),
                    type: "comment",
                    pos: endPos
                }
            },

            _computeEndPos: function (pos, str) {
                var endPos = 0;

                if (this._isWindowOrMac(pos, str)) {
                    endPos = str.indexOf("\r", pos);
                }
                else if (this._isLinuxOrUnix(pos, str)) {
                    endPos = str.indexOf("\n", pos);
                }
                else {
                    endPos = str.length;
                }

                return endPos;
            },

            _isWindowOrMac: function (pos, str) {
                return str.indexOf("\r", pos) > -1;
            },

            _isLinuxOrUnix: function (pos, str) {
                return str.indexOf("\r\n", pos) === -1 && str.indexOf("\n", pos) > -1;
            },

            _extractMultiLineComment: function (pos, str) {
                var endPos = pos + 1;

                while (!(str[endPos] === "*" && str[endPos + 1] === "/")) {
                    endPos += 1;
                }
                endPos += 2;

                return {
                    token: str.substring(pos, endPos),
                    type: "comment",
                    pos: endPos
                }
            },

            _tryExtractRegexLiteral: function (pos, str) {
                var endPos = pos + 1;

                while (str[endPos] != "/") {
                    if (endPos === -1) {
                        endPos = str.length;
                    }

                    endPos += 1;

                    if (this._isNotRegex(endPos, str)) {
                        this._extractChar(pos, str);
                        return this._extractChar(pos, str);
                    }
                }
                endPos += 1;
                //提取正则标志
                while ('gimy'.indexOf(str[endPos]) !== -1) {
                    endPos += 1;
                }

                return {
                    token: str.substring(pos, endPos),
                    type: "regex",
                    pos: endPos
                }
            },

            _isNotRegex: function (endPos, str) {
                return this._isNewline(str, endPos) || endPos > str.length
                    || (str[endPos] === "/" && str[endPos + 1] === "/")
                    || (str[endPos] === "/" && str[endPos + 1] === "*");
            },

            _extractWhitespace: function (pos, str) {
                var endPos = pos + 1;

                while (" \t".indexOf(str + endPos) !== -1) {
                    endPos += 1;
                }

                return {
                    token: str.substring(pos, endPos),
                    type: "whitespace",
                    pos: endPos
                }
            },

            _extractNumber: function (pos, str) {
                var endPos = pos + 1;

                while ("0123456789.eE".indexOf(str[endPos]) !== -1) {
                    endPos += 1;
                }

                return {
                    token: str.substring(pos, endPos),
                    type: "number",
                    pos: endPos
                }
            },

            _extractWord: function (pos, str) {
                var endPos = pos + 1;

                while (str[endPos].match(/^[a-zA-Z_$0-9]$/) !== null) {
                    endPos += 1;
                }

                return {
                    token: str.substring(pos, endPos),
                    type: "word",
                    pos: endPos
                }
            },

            _extractNewline: function (pos, str) {
                var data = null;

                //"\r\n"只算一个换行符
                if (this._isNewline(str, pos)) {
                    data = {
                        token: "\n",    //用\n表示换行符
                        type: "newline",
                        pos: pos + 1
                    }
                    ;
                }
                else {
                    data = {
                        token: null,
                        type: null,
                        pos: pos + 1
                    }
                }
                return data;
            },

            _isNewline: function (str, pos) {
                return ((str[pos] === "\r" && str[pos + 1] === "\n")  //windows
                    || (str[pos] === "\n" && str[pos - 1] !== "\r") //linux,unix
                    || (str[pos] === "\r" && str[pos + 1] !== "\n"));   //mac
            },

            _extractChar: function (pos, str) {
                return {
                    token: str.substr(pos, 1),
                    type: "char",
                    pos: pos + 1
                };
            },
            _reset: function () {
                this._pos = 0;
                this._historyData = [];
                this._str = null;
            }
        },
        Public: {
            tokenize: function (str, onToken) {
                var len = str.length,
                    data = null,
                    currentPos = 0,
                    self = this,
                    _getBeforeTokenData = this._getBeforeTokenData,
                    _getAfterTokenData = this._getAfterTokenData;

                this._reset();

                this._str = str;

                while (this._pos < len) {
                    data = this._getData(this._pos, this._str);
                    currentPos = this._getCurrentPos();
                    this._setNextPos(data);
                    if (this._isNotNullData(data)) {
                        onToken(data.token, data.type, function (index) {
                            return _getBeforeTokenData.call(self, index);
                        }, function (index) {
                            return _getAfterTokenData.call(self, index);
                        });

                        this._historyData.push({
                                token: data.token,
                                type: data.type,
                                pos: currentPos
                            }
                        );
                    }
                }
            }
        },
        Static: {
            getInstance: function () {
                if (_instance === null) {
                    _instance = new this();
                }
                return _instance;
            },
            //*供测试使用

            forTest_clearInstance: function () {
                _instance = null;
            }
        }
    });

    module.exports = JsTokenizer;
}());