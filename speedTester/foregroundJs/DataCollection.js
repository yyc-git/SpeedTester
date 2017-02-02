(function () {
    var _instance = null;

    window.YSpeedTester = window.YSpeedTester || {};

    YSpeedTester.DataCollection = YYC.Class({
        Init: function () {
            this.outputData = [];
            this._depth = 0;
        },
        Private: {
            _depth: 0,
            _isStart: false,
            _begineTime: 0,

            _getParentFuncData: function () {
                var data = this.outputData,
                    depth = this._depth;

                while (depth > 0) {
                    data = data[data.length - 1][0];
                    depth -= 1;
                }

                return data;
            },
            _getCurrentFuncData: function () {
                var data = this._getParentFuncData();

                return data[data.length - 1];
            },
            _createCurrentFuncData: function (filePath, funcName, line) {
                return [
                    [],
                    +new Date(),
                    filePath,
                    funcName,
                    line
                ];
            },
            _computeAndSetExecuteTime: function () {
                var data = this._getCurrentFuncData();

                data[1] = +new Date() - data[1];
            },
            _buildMainLoopIndexArr: function () {
                var mainLoopIndexArr = [],
                    engineMainLoopFileName = YSpeedTester.config.engineMainLoopFileName,
                    engineMainLoopFuncName = YSpeedTester.config.engineMainLoopFuncName;

                this.outputData.forEach(function (data, index) {
                    if (data[2].contain(engineMainLoopFileName)
                        && data[3] === engineMainLoopFuncName) {
                        mainLoopIndexArr.push(index);
                    }
                });

                return mainLoopIndexArr;
            },
            _getMetaData: function () {
                return this.outputData[this.outputData.length - 1];
            },
            _addMetaData: function (metaData) {
                this.outputData.push(metaData);
            }
        },
        Public: {
            outputData: null,

            initWhenCreate: function () {
            },
            start: function (filePath, funcName, line) {
                if (!this._isStart) {
                    return;
                }

                this._getParentFuncData().push(this._createCurrentFuncData(filePath, funcName, line));
                this._depth += 1;
            },
            end: function () {
                if (!this._isStart) {
                    return;
                }
                this._depth -= 1;
                this._computeAndSetExecuteTime();
            },
            startTest: function () {
                this.reset();
                this._isStart = true;
                this._begineTime = +new Date();
            },
            endTest: function () {
                if (!this._isStart) {
                    return null;
                }

                this._isStart = false;

                this._addMetaData({
                    begineTime: this._begineTime,
                    endTime: +new Date(),
                    mainLoopIndexArr: this._buildMainLoopIndexArr()
                });
            },
            reset: function () {
                this.outputData = [];
                this._depth = 0;

                if (this._isSetGameFps) {
                    this._isSetGameFps = false;
                    YE.Director.getInstance().resumeRequestAnimFrameLoop();
                }
            },
            setFps: function (fps) {
                var interval = 1 / fps;

                this._isSetGameFps = true;
                YE.Director.getInstance().setLoopIntervalAndRestart(interval);
            },
            buildShowResultPage: function () {
                var tool = YYC.Tool,
                    html = null;

                html = '<!DOCTYPE html><html><head><title>显示测试结果页面</title><meta content="text/html" charset="utf-8"></head><body>'
                    + '<script>'
                    + tool.convert.toString(function () {
                    (function () {
                        function _isArray(val) {
                            return Object.prototype.toString.call(val) === "[object Array]"
                        };
                        function _isFunction(func) {
                            return Object.prototype.toString.call(func) === "[object Function]"
                        };
                        String.prototype.contain = function (str) {
                            var reg = new RegExp(str);
                            if (this.match(reg)) {
                                return true
                            } else {
                                return false
                            }
                        };
                        String.prototype.containIgnoreCase = function (str) {
                            var reg = new RegExp(str, "i");
                            if (this.match(reg)) {
                                return true
                            } else {
                                return false
                            }
                        };
                        String.prototype.trim = function () {
                            var source = this;
                            return source.replace(/^\s*/g, "").replace(/\s*$/g, "")
                        };
                        window.$break = {};
                        if (!Object._extend) {
                            Object._extend = function (destination, source) {
                                for (var property in source) {
                                    destination[property] = source[property]
                                }
                                ;
                                return destination
                            }
                        }
                        ;
                        var _Enumerable = (function () {
                            function each(iterator, context) {
                                var index = 0;
                                this._each(function (value) {
                                    return iterator.call(context, value, index++)
                                });
                                return this
                            };
                            function contain(arg) {
                                var result = false;
                                if (_isFunction(arg)) {
                                    this.each(function (value, index) {
                                        if (!!arg.call(null, value, index)) {
                                            result = true;
                                            return $break
                                        }
                                    })
                                } else {
                                    this.each(function (value, index) {
                                        if (arg === value || (value.contain && value.contain(arg))) {
                                            result = true;
                                            return $break
                                        }
                                    })
                                }
                                ;
                                return result
                            };
                            function modify(iterator, context) {
                                this.each(function (value, index) {
                                    if (iterator.call(context[index], value, index)) {
                                        return $break
                                    }
                                });
                                return
                            };
                            function indexOf(iterator) {
                                var result = -1;
                                var t = null;
                                this.each(function (value, index) {
                                    t = iterator.call(null, value, index);
                                    if (t !== false) {
                                        return $break
                                    }
                                });
                                result = t === false ? -1 : t;
                                return result
                            };
                            return{each: each, contain: contain, modify: modify, indexOf: indexOf}
                        })();
                        Object._extend(Array.prototype, (function () {
                            Object._extend(Array.prototype, _Enumerable);
                            function _each(iterator) {
                                for (var i = 0, length = this.length; i < length; i++) {
                                    if (iterator(this[i]) === $break) {
                                        break
                                    }
                                }
                            };
                            function judge(iterator) {
                                var result = [];
                                this.each(function (value, index) {
                                    if (!iterator.call(null, value, index)) {
                                        result.push(index)
                                    }
                                });
                                return result
                            };
                            return{_each: _each, judge: judge}
                        })());
                        Array.prototype.forEach = function (fn, context) {
                            var scope = context || window;
                            for (var i = 0, j = this.length; i < j; ++i) {
                                if (fn.call(scope, this[i], i, this) === $break) {
                                    break
                                }
                            }
                        };
                        Array.prototype.filter = function (fn, context) {
                            var scope = context || window;
                            var a = [];
                            for (var i = 0, j = this.length; i < j; ++i) {
                                if (!fn.call(scope, this[i], i, this)) {
                                    continue
                                }
                                ;
                                a.push(this[i])
                            }
                            ;
                            return a
                        };
                        Array.prototype.filterWithIndex = function (fn, context) {
                            var scope = context || window;
                            var a = [];
                            for (var i = 0, j = this.length; i < j; ++i) {
                                if (!fn.call(scope, this[i], i, this)) {
                                    continue
                                }
                                ;
                                a.push([i, this[i]])
                            }
                            ;
                            return a
                        };
                        Array.prototype.pushNoRepeat = function (obj) {
                            if (!this.contain(function (value, index) {
                                if (value === obj) {
                                    return true
                                } else {
                                    return false
                                }
                            })) {
                                this.push(obj)
                            }
                        };
                        Array.prototype.remove = function (func, obj) {
                            var self = this;
                            var index = this.indexOf(function (e, index) {
                                if (func.call(self, e, obj)) {
                                    return index
                                }
                                ;
                                return false
                            });
                            if (index !== null && index !== -1) {
                                this.splice(index, 1);
                                return true
                            }
                            ;
                            return false
                        };
                        Array.prototype.map = function (func, valueArr) {
                            if (valueArr && !_isArray(valueArr)) {
                                throw new Error("参数必须为数组")
                            }
                            ;
                            this.forEach(function (e) {
                                e && e[func] && e[func].apply(e, valueArr)
                            })
                        }
                    })();

                    (function () {
                        var outputData = null,
                            metaData = null;

                        function _addEvent(oTarget, sEventType, fnHandler) {
                            if (oTarget.addEventListener) {
                                oTarget.addEventListener(sEventType, fnHandler, false)
                            } else {
                                if (oTarget.attachEvent) {
                                    oTarget.attachEvent("on" + sEventType, fnHandler)
                                } else {
                                    oTarget["on" + sEventType] = fnHandler
                                }
                            }
                        }

                        function _getNextElement(node, tagName) {
                            var next = node.nextSibling;

                            if (!next) {
                                return null;
                            }

                            if (next.nodeType == 3 || next.tagName.toLowerCase() !== tagName) {
                                return _getNextElement(next);
                            }
                            if (next.nodeType == 1) {
                                return next
                            }
                            return null
                        }

                        function _toggle(dom) {
                            if (!dom) {
                                return;
                            }

                            if (dom.style.display === "none") {
                                _show(dom);
                                return
                            }
                            _hide(dom);
                        }

                        function _extend(destination, source) {
                            var property = "";

                            for (property in source) {
                                destination[property] = source[property];
                            }
                            return destination;
                        }

                        function _show(dom) {
                            if (dom.tagName === "LI") {
                                dom.style.display = "list-item";
                            }
                            else {
                                dom.style.display = "block";
                            }
                        }

                        function _hide(dom) {
                            dom.style.display = "none";
                        }

                        window.YSpeedTester = window.YSpeedTester || {};

                        YSpeedTester.showResult = {
                            buildHtml: function (collectionData) {
                                var result = "",
                                    self = this,
                                    isFirstLevelUl = true;

                                function _buildHtml(data) {
                                    if (isFirstLevelUl) {
                                        result += "<ul id='showResult'>";
                                        isFirstLevelUl = false;
                                    }
                                    else {
                                        result += "<ul style='display:none;'>";
                                    }
                                    data.forEach(function (funcData) {
                                        if (funcData[0].length > 0) {
                                            result += "<li>"
                                                + self._buildFuncInfo(funcData)
                                                + "</li>";
                                            _buildHtml(funcData[0]);
                                        }
                                        else {
                                            result += "<li>"
                                                + self._buildFuncInfo(funcData)
                                                + "</li>";
                                        }
                                    });
                                    result += "</ul>";
                                }

                                if (collectionData.length === 0) {
                                    return "没有测试数据";
                                }
                                _buildHtml(collectionData);

                                return result;
                            },
                            _buildFuncInfo: function (funcData) {
                                return funcData[2].match(/\/([^\/]+$)/)[1] + "->" + funcData[3] + "->" + funcData[4] + "行：" + funcData[1] + "ms";
                            },
                            initData: function () {
                                outputData = JSON.parse(document.getElementById("result").value);
                                metaData = outputData.pop();
                            },
                            showResultHtml: function () {
                                var htmlContent = this.buildHtml(outputData);

                                document.getElementsByTagName("p")[0].innerHTML = htmlContent
                            },
                            initResultHtmlEvent: function () {
                                _addEvent(document.getElementById("showResult"), "click", function (e) {
                                    var target = e.srcElement || e.target;
                                    if (target.tagName.toLowerCase() === "li") {
                                        _toggle(_getNextElement(target, "ul"))
                                    }
                                });

                                _addEvent(document.getElementById("onlyShowMainLoopData"), "change", function (e) {
                                    var target = e.srcElement || e.target;
                                    var firstLevelElements = document.getElementById("showResult").childNodes,
                                        mainLoopIndexArr = _extend([], metaData.mainLoopIndexArr),
                                        i = 0,
                                        index = 0,
                                        len = firstLevelElements.length;

                                    if (target.checked === true) {
                                        for (i = 0; i < len; i++) {
                                            if (firstLevelElements[i].tagName.toLowerCase() === "ul") {
                                                _hide(firstLevelElements[i]);
                                                continue;
                                            }

                                            if (mainLoopIndexArr.length > 0 && index === mainLoopIndexArr[0]) {
                                                _show(firstLevelElements[i]);

                                                mainLoopIndexArr.shift();
//                        if (mainLoopIndexArr.length === 0) {
//                            return $break;
//                        }
                                            }
                                            else {
                                                _hide(firstLevelElements[i]);
                                            }
                                            index += 1;
                                        }
                                    }
                                    else {
                                        for (i = 0; i < len; i++) {
                                            if (firstLevelElements[i].tagName.toLowerCase() === "ul") {
                                                _hide(firstLevelElements[i]);
                                                continue;
                                            }

                                            _show(firstLevelElements[i]);
                                        }
                                    }
                                });
                            }
                        };

//    window.showResult = showResult;
                    }());

                    window.onload = function () {
                        YSpeedTester.showResult.initData();
                        YSpeedTester.showResult.showResultHtml();
                        YSpeedTester.showResult.initResultHtmlEvent();
                    };
                })
                    + '</script>'
                    + '<input type="hidden" id="result" value=\''
                    + tool.convert.toString(YSpeedTester.DataCollection.getInstance().outputData)
                    + '\'/><span>测试数据为：</span><label for="onlyShowMainLoopData">只显示主循环数据<input type="checkbox" id="onlyShowMainLoopData"/></label><p></p></body></html>';

                return html;
            },
            buildPageName: function () {
                var metaData = null,
                    pageName = null,
                    tool = YYC.Tool;

                metaData = this._getMetaData();

                pageName = "showResult";
                //文件名不支持“:”符号，因此时间都用“-”间隔符
                pageName += "_from_" + tool.date.format(new Date(metaData.begineTime), "yyyy-MM-dd HH-mm-ss")
                    + "_to_" + tool.date.format(new Date(metaData.endTime), "yyyy-MM-dd HH-mm-ss");
                pageName += ".html";

                return pageName;
            }
        },
        Static: {
            getInstance: function () {
                if (_instance === null) {
                    _instance = new this();
                    _instance.initWhenCreate();
                }
                return _instance;
            },
            //*供测试使用

            forTest_clearInstance: function () {
                _instance = null;
            }
        }
    });
}());


$(function () {
    var collection = YSpeedTester.DataCollection.getInstance();

    function _startTest() {
        var fps = Number($("#mainLoopFPS").val());

        collection.startTest();

        if (fps) {
            collection.setFps(fps);
        }
    }

    function _endTest() {
        collection.endTest();

        YYC.Html5.file.createFileAndDownload(collection.buildShowResultPage(), "text/html", collection.buildPageName());

        collection.reset();   //清除引用，从而可垃圾回收outputData所占内存
    }

    $("#startTestForDataCollection").click(function () {
        _startTest();
    });
    $("#endTestForDataCollection").click(function () {
        _endTest();
    });

    var keyCode = {
        q: 81,
        w: 87
    };
    $(document).keydown(function (e) {
        if (e.keyCode === keyCode.q) {
            _startTest();
        }
        else if (e.keyCode === keyCode.w) {
            _endTest();
        }
    });
});


