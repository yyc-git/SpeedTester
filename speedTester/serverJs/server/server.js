(function(){
    var http = require("http");
    var url = require("url");
    var config = require("../config.js");
    var resourceServer = require("./resourceServer.js");
    var rewriterServer = require("./rewriterServer.js");
    var controller = require("./controller.js");

    http.createServer(function (req, res) {
        //处理nodejs默认访问favicon.ico
        if (req.url === "/favicon.ico") {
            res.end();
            return;
        }

        var pathname = url.parse(req.url).pathname;

        rewriterServer.run(req, res);

        if (_isRequestResource(pathname)) {
            resourceServer.run(req, res);
        }
        else if (_isRequestAction(pathname)) {
            controller[pathname.slice(1)](req, res);
        }


//    indexServer.run(req, res);
    }).listen(config.port, function () {
            console.log("Server listening for requests on port " + config.port);
        });

    function _isRequestResource(pathname) {
        return pathname.match(/\.[^.]+$/) !== null;
    }

    function _isRequestAction(pathname) {
        return pathname.match(/\.[^.]+$/) === null;
    }
}());

