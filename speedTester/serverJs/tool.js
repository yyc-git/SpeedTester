//'use strict';

(function () {
    var fs = require('fs');
    var path = require('path');
    var config = require('./config.js');

//function serveStaticFile(res, filename) {
//    var ext = filename.split('.').reverse()[0];
//    var ct = ext == 'js'   ? 'application/javascript' :
//             ext == 'css'  ? 'text/css' :
//             ext == 'html' ? 'text/html' :
//             ext == 'png'  ? 'image/png' :
//             ext == 'jpg'  ? 'image/jpeg' :
//             ext == 'jpeg' ? 'image/jpeg' :
//             'text/plain';
//
//    var fdata = fs.readFileSync(filename);
//
//    if (['png', 'jpg', 'jpeg'].indexOf(ext) == -1) {
//        fdata = fdata
//            .toString()
//            .replace(/__SERVER_HOST__/g, config.serverHost)
//            .replace(/__SERVER_PORT__/g, config.serverPort)
//            .replace(/__FILE_SERVER_PORT__/g, config.fileServerPort);
//    }
//
//    res.writeHead(200, { 'Content-Type': ct });
//    res.end(fdata);
//}
//
//
//function getFilesList() {
//	return getAllFiles(['.js', '.coffee']);
//}
//




//
//function validFile(path) {
//	for (var i = 0; i < config.ignoreFiles.length; i++) {
//		if (path.indexOf(config.ignoreFiles[i]) >= 0) {
//			return false;
//		}
//	}
//	return true;
//}

    function changeToUnixifyPath(path) {
        return path.replace(/\\/g, "/");
    }

    function changeToNodeJsPath(path) {
        return path.replace(/\//g, "\\");
    }




//
//module.exports.serveStaticFile = serveStaticFile;
//module.exports.getFilesList = getFilesList;

    exports.changeToUnixifyPath = changeToUnixifyPath;
    exports.changeToNodeJsPath = changeToNodeJsPath;
}());


