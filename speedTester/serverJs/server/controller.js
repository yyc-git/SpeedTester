(function () {
    var url = require("url");
    var path = require("path");
    var fs = require("fs");
    var config = require("../config.js");
    var querystring = require("querystring");

    function index(req, res) {
        var filePath = config.indexPath;

        fs.readFile(filePath, "utf-8", function (err, data) {
            if (err) {
                throw err;
            }

            res.writeHead(200, {
                "Content-Type": "text/html"
            });
            res.write(data);
            res.end();
        });
    }

    function showResult(req, res) {
        var body = "";

        if (req.method == "POST") {
            req.setEncoding("utf8");

            req.on("data", function (chunk) {
                body += chunk;
            });
            req.on("end", function () {
                var filePath = config.showResultPath;

                fs.readFile(filePath, "utf-8", function (err, html) {
                    if (err) {
                        throw err;
                    }

                    html = _saveDataToPage(querystring.parse(body).outputData, html);

                    res.writeHead(200, {
                        "Content-Type": "text/html"
                    });
                    res.write(html);
                    res.end();
                });
            });
        }

        return null;
    }

    function _saveDataToPage(data, pageHtml) {
        return pageHtml.replace("__RESULT__", data);
    }

    exports.index = index;
    exports.showResult = showResult;
}());