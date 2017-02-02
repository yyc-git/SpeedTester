(function () {
    var path = require("path");
    var fs = require("fs");
    var url = require("url");
    var tool = require("../tool.js");
    var config = require("../config.js");
    var mime = require("../mime.js");

    function run(req, res) {
        var pathname = url.parse(req.url).pathname;

        _loadStaticResource(pathname, req, res);
    }

    function _loadStaticResource(pathname, req, res) {
        var extname = null,
            filePath = null,
            lastModified = null;

        extname = pathname.match(/[^.]+$/)[0];
        filePath = _getFilePath(pathname);

        fs.exists(filePath, function (exists) {
            if (!exists) {
                _response404(pathname, res);
            }
            else {
                lastModified = _getLastModified(filePath);

                if (_isResource(extname)) {
                    _setCacheHeader(res);
                }
                if (_isNotModified(lastModified, req)) {
                    _response304(res);
                }
                else {
                    _load(filePath, extname, lastModified, res);
                }
            }
        });
    }

    function _getFilePath(pathname) {
        var filePath = null;

        if (pathname.indexOf(config.foregroundDir) === -1) {
            filePath = path.join(config.projectRootDir, pathname);
        }
        else {
            filePath = path.join(config.rootDir, pathname);
        }

        return filePath;
    }

    function _getMimeType(extname) {
        var mimeTypes = mime.types;

        return mimeTypes[extname] ? mimeTypes[extname] : "text/plain";
    }

    function _response404(pathname, res) {
        res.writeHead(404, {"Content-Type": "text/plain"});
        res.write("This request URL " + pathname + " was not found on this server.");
        res.end();
    }

    function _getLastModified(filePath) {
        var fileInfo = fs.statSync(filePath);

        return fileInfo.mtime.toUTCString();
    }

    function _isResource(extname) {
        var mimeTypes = mime.types;

        return !!mimeTypes[extname];
    }

    function _setCacheHeader(res) {
        var date = null,
            CACHE_TIME = 60 * 60 * 24 * 365;

        date = new Date();
        date.setTime(date.getTime() + CACHE_TIME * 1000);
        res.setHeader("Expires", date.toUTCString());
        res.setHeader("Cache-Control", "max-age=" + CACHE_TIME);
    }

    function _isNotModified(lastModified, req) {
        return req.headers["if-modified-since"] && lastModified == req.headers["if-modified-since"]
    }

    function _response304(res) {
        res.writeHead(304, "Not Modified");
        res.end();
    }

    function _load(filePath, extname, lastModified, res) {
        fs.readFile(filePath, function (err, data) {
            if (err) {
                res.writeHead(500, {"Content-Type": "text/ plain"});
                res.end(err);
            }
            else {
                res.setHeader("Last-Modified", lastModified);
                res.writeHead(200, {"Content-Type": _getMimeType(extname)});
                res.write(data);
                res.end();
            }
        });
    }

    exports.run = run;
}());