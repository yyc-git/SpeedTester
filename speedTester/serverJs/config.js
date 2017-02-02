//'use strict';

/*
 *
 * To change defaults set in this file create a file called config.local.js
 * in the same directory and override values like this:
 *
 *     var config = require('../config/config.defaults.js');
 *     config.setting = 'new_value';
 *
 */

var config = {};
var path = require('path');
var fs = require('fs');


/* Full path to directory holding source files you wish to debug */
//config.fileServerBaseDir = path.join(__dirname, 'baseDir');    //__dirname为config.js所在的目录
config.fileServerBaseDir = "/baseDir";

/* Port on which files will be served */
config.port = 8500;


/* Output folder in which to put debugging-enabled files */
//config.outputDir = path.join(__dirname, 'outputDir');
config.outputDir = "/outputDir";

//config.foregroundDir = path.join(__dirname, 'foregroundJs');
config.foregroundDir = "/foregroundJs";

//服务器根目录
config.rootDir = path.dirname(__dirname);
//项目根目录
config.projectRootDir = path.join(config.rootDir, config.outputDir);

config.insertJs = ["jquery-1.7.js", "YTool.js", "YOOP.js", "file.js", "config.js", "DataCollection.js"];

//被测试的项目页面路径
config.indexPath = path.join(config.projectRootDir, "/view/index.html");

config.showResultPath = path.join(config.rootDir, "/view/showResult.html");

//黑名单既可以指定文件名，也可以指定文件路径；白名单必须指定完整的js文件路径
config.jsRewriterBlackList = ["jquery-1.7.js"];
config.jsRewriterWhiteList = [];


module.exports = config;

//
///* Verbose mode */
//config.verbose = false;
//
///* Run the debug file server or not */
//config.runDebugServer = true;
//
///* Run the offline rewriter process or not */
//config.runOfflineRewriter = false;
//
///* Hostname or IP of the local machine */
//config.serverHost = ''; // Can be retrieved automatically or asked to the user
//
///* port on which the server listens for requests */
//config.serverPort = 8000;
//
///* Full path to directory holding source files you wish to debug */
//config.fileServerBaseDir = path.join(__dirname, '../samples');
//
///* Port on which files will be served */
//config.fileServerPort = 8500;
//
///* Output folder in which to put debugging-enabled files */
//config.outputDir = path.join(__dirname, '../samples_output');
//
///* Files which won't be copied to the output folder */
//config.ignoreFiles = ['.git', '.svn'];
//
///* Files which won't be processed by the debugger */
//config.blackList = [];
//
///* Force this files as the only ones to be processed by the debugger */
//config.whiteList = [];
//
///* Index file of the application */
//config.indexFile = '/index.html';
//
///* After which tag insert aardwolf script in the modified index file */
//config.whereToInsertAardwolf = '<head>';
//
///* Aardwolf script tag */
//config.aardwolfScript = '<script type="text/javascript" src="aardwolf.js"></script>';


///* Load overrides from config.local.js if it exists */
//var localConf = path.join(__dirname, 'config.local.js');
//if (fs.existsSync(localConf)) {
//    require(localConf);
//}
