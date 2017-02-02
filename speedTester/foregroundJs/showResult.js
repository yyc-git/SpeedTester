(function () {
    window.YSpeedTester = window.YSpeedTester || {};

    YSpeedTester.showResult = (function () {
        var outputData = null,
            metaData = null;
        var listId = "showResult",
            showMainLoopCheckboxId = "onlyShowMainLoopData";

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

        function _addClickEvent() {
            _addEvent(document.getElementById(listId), "click", function (e) {
                var target = e.srcElement || e.target;

                if (target.tagName.toLowerCase() === "li") {
                    _toggle(_getNextElement(target, "ul"));
                }
            });
        }

        function _addChangeEvent() {
            _addEvent(document.getElementById(showMainLoopCheckboxId), "change", function (e) {
                var target = e.srcElement || e.target,
                    firstLevelLists = document.getElementById(listId).childNodes;

                if (target.checked === true) {
                    _onlyShowMainLoopList(firstLevelLists);
                }
                else {
                    _showAllFirstLevelList(firstLevelLists);
                }
            });
        }

        function _onlyShowMainLoopList(firstLevelLists) {
            var mainLoopIndexArr = _extend([], metaData.mainLoopIndexArr),
                i = 0,
                firstLevelListIndex = 0,
                len = firstLevelLists.length;

            for (i = 0; i < len; i++) {
                if (_isSecondLevelList(firstLevelLists[i])) {
                    _hide(firstLevelLists[i]);
                    continue;
                }

                if (_isMainLoopList(mainLoopIndexArr, firstLevelListIndex)) {
                    _show(firstLevelLists[i]);
                    mainLoopIndexArr.shift();
                }
                else {
                    _hide(firstLevelLists[i]);
                }
                firstLevelListIndex += 1;
            }
        }

        function _isSecondLevelList(ele) {
            return ele.tagName.toLowerCase() === "ul";
        }

        function _isMainLoopList(mainLoopIndexArr, index) {
            return mainLoopIndexArr.length > 0 && index === mainLoopIndexArr[0];
        }

        function _showAllFirstLevelList(firstLevelLists) {
            var i = 0,
                len = firstLevelLists.length;

            for (i = 0; i < len; i++) {
                if (_isSecondLevelList(firstLevelLists[i])) {
                    _hide(firstLevelLists[i]);
                    continue;
                }

                _show(firstLevelLists[i]);
            }
        }

        return {
            buildHtml: function (collectionData) {
                var result = "",
                    self = this,
                    isFirstLevelUl = true;

                function _buildHtml(data) {
                    if (isFirstLevelUl) {
                        result += "<ul id='" + listId + "'>";
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

                document.getElementsByTagName("p")[0].innerHTML = htmlContent;
            },
            initResultHtmlEvent: function () {
                _addClickEvent();
                _addChangeEvent();
            }
        };
    }());
}());