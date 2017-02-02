(function () {
    var path = require("path");
    var fs = require("fs");
    var tool = require("./tool.js");
    var config = require("./config.js");
    require("./jsExtend.js");

    var operator = {
        deleteFolderRecursive: function (dir) {
            var files = [],
                self = this;

            if (fs.existsSync(dir)) {
                files = fs.readdirSync(dir);
                files.forEach(function (file, index) {
                    var curPath = dir + "/" + file;
                    if (fs.statSync(curPath).isDirectory()) { // recurse
                        self.deleteFolderRecursive(curPath);
                    } else { // delete file
                        fs.unlinkSync(curPath);
                    }
                });
                fs.rmdirSync(dir);
            }
        },
        mkFolderRecursive: function (dir) {
            if (this._isFile(dir)) {
                dir = path.dirname(dir);
            }

            function _mkFolder(dir) {
                var parentDir = null;

                if (!fs.existsSync(dir)) {
                    parentDir = path.dirname(dir);
                    _mkFolder(parentDir);
                    fs.mkdirSync(dir);
                }
                return;
            }

            _mkFolder(dir);
        },
        _isFile: function (path) {
            return path.match(/\.[^.\/]+$/) !== null;
        },
        findFileCurrentDir: function (fileName, parentDir) {
            var files = [],
                filePath = null,
                self = this;

            function _find(dir) {
                if (fs.existsSync(dir)) {
                    files = fs.readdirSync(dir);
                    files.forEach(function (name, index) {
                        var curPath = path.join(dir, name);

                        if (name === fileName) {
                            filePath = dir;
                            return $break;
                        }

                        if (fs.statSync(curPath).isDirectory()) {
                            _find(curPath);
                        }
                    });
//                fs.rmdirSync(dir);
                }
            }

            _find(parentDir);

            return tool.changeToUnixifyPath(filePath);
        },
        getAllFilePaths: function (dir) {
            var baseDir = path.normalize(dir),
                fileList = fs.readdirSync(baseDir),
                filePaths = [],
                self = this;

            fileList.forEach(function (name) {
                var fullPath = path.join(baseDir, name),
                    stat = fs.statSync(fullPath);

                if (stat.isDirectory()) {
                    filePaths = filePaths.concat(self.getAllFilePaths(fullPath));
                }
                else if (stat.isFile()) {
                    filePaths.push(tool.changeToUnixifyPath(fullPath));
                }
            });

            return filePaths;
        },
        copyFileSync: function (srcFile, destFile) {
            if (!fs.existsSync(destFile)) {
                this.mkFolderRecursive(destFile);
            }

            fs.writeFileSync(destFile, fs.readFileSync(srcFile));
        },
        copyAllFilesToOutputDir: function () {
            var self = this;

            this._clearOutputDir();

            this.getAllFilePaths(path.join(config.rootDir, config.fileServerBaseDir)).forEach(function (filePaths) {
                self.copyFileToOutputDir(filePaths);
            });
        },
        _clearOutputDir: function () {
            var dir = path.join(config.rootDir, config.outputDir);

            this.deleteFolderRecursive(dir);
            fs.mkdirSync(dir)
        },
        copyFileToOutputDir: function (filePath, writeCache) {
//    var serverBaseDir = path.normalize(config.fileServerBaseDir),
//        destBaseDir = path.normalize(config.outputDir),
//        var serverBaseDir = path.join(config.rootDir, config.fileServerBaseDir),
//            destBaseDir = path.join(config.rootDir, config.outputDir),
            var origFilePath = filePath,
                destFilePath = this._getCorrespondingOutPutFilePath(filePath),
                destBaseDir = path.dirname(destFilePath);


//        if (!fs.existsSync(origFilePath)) {
//            return;
//        }
            if (!fs.existsSync(destBaseDir)) {
                this.mkFolderRecursive(destBaseDir);
            }

            console.log('Processing ' + filePath + '... ');

//    //如果已经修改过文件了，则跳过
//    if (fileCache.files[fileName] && (fileStat.mtime.getTime() == fileCache.files[fileName].time) &&
//        fs.existsSync(destFilePath)) {
//        log('Skipping\n');
//        return;
//    }

//    var breakpoints = [];
//
//    var mustDebug = true;
//    for (var i = 0; i < config.blackList.length; i++) {
//        if (fileName.indexOf(config.blackList[i]) >= 0) {
//            mustDebug = false;
//            break;
//        }
//    }
//
//    if (mustDebug && config.whiteList.length > 0) {
//        mustDebug = false;
//        for (i = 0; i < config.whiteList.length; i++) {
//            if (fileName.indexOf(config.whiteList[i]) >= 0) {
//                mustDebug = true;
//                break;
//            }
//        }
//    }
//
//    if ((mustDebug && fileName.substr(-3) === '.js') || fileName === config.indexFile) {
//
//        var content = fs.readFileSync(origFilePath).toString();
//        if (fileName === config.indexFile) {
//            // Inject aardwolf script in index
//            var where = content.indexOf(config.whereToInsertAardwolf) + config.whereToInsertAardwolf.length;
//
//            content = [content.slice(0, where), '\n', config.aardwolfScript, '\n', content.slice(where)].join('');
//        } else {
//            // Instrument JS code
//            log('Debugging ');
//            var processedFile = rewriter.addDebugStatements(fileName, content);
//            content = processedFile.file;
//            breakpoints = processedFile.breakpoints;
//        }
//        fs.writeFileSync(destFilePath, content);
//    }
//    else {
            this.copyFileSync(origFilePath, destFilePath);
//    }

//    fileCache.files[fileName] = {
//        time: fileStat.mtime.getTime()
////        breakpoints: breakpoints
//    };
//    if (writeCache) {
//        fs.writeFileSync(cachePath, JSON.stringify(fileCache));
//    }

            console.log('OK\n');
        },
        _getCorrespondingOutPutFilePath: function (filePath) {
            return filePath.replace(config.fileServerBaseDir, config.outputDir);
        }
    };

    module.exports = operator;
}());