describe("tool", function () {
    var request = require("request");
    var sinon = require("sinon");
    var sandbox = null;
    var fs = require("fs");
    var config = require("./config.js");
    var tool = require("./tool.js");

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });
    afterEach(function () {
        sandbox.restore();
    });




    describe("changeToNodeJsPath", function () {
        beforeEach(function () {
        });
        afterEach(function () {
        });

        it("将unixPath转换为nodeJsPath", function () {
            var path = "C:/a.js";

            expect(tool.changeToNodeJsPath(path)).toEqual("C:\\a.js");
        });
    });

});