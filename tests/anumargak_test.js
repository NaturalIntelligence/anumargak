var Anumargak = require("./../src/letsRoute");

describe("Anumargak ", function () {

    it("should find static url", function () {
        var router = Anumargak();

        router.on("GET", "/this/is/static", () => 30);
        router.on("HEAD", "/this/is/static", () => 30);

        expect(Object.keys(router.staticRoutes.GET).length).toEqual(1);
        expect(Object.keys(router.staticRoutes.HEAD).length).toEqual(1);
        expect(router.count).toEqual(2);

        expect( router.quickFind( { method: "GET", headers: {}, url: "/this/is/static" }).handler()).toEqual(30);
        expect( router.quickFind( { method: "HEAD", headers: {}, url: "/this/is/static" }).handler()).toEqual(30);

    });

    it("should register for multiple urls", function () {
        var router = Anumargak();

        router.on(["GET", "HEAD"], ["/500", "/502"], () => 30);
        router.get(["/400", "/404"], () => 30);

        expect(Object.keys(router.staticRoutes.GET).length).toEqual(4);
        expect(Object.keys(router.staticRoutes.HEAD).length).toEqual(2);
        expect(router.count).toEqual(6);

        expect( router.quickFind( { method: "GET", headers: {}, url: "/500" }).handler()).toEqual(30);
        expect( router.quickFind( { method: "HEAD", headers: {}, url: "/500" }).handler()).toEqual(30);

        expect( router.quickFind( { method: "GET", headers: {}, url: "/502" }).handler()).toEqual(30);
        expect( router.quickFind( { method: "HEAD", headers: {}, url: "/502" }).handler()).toEqual(30);

        expect( router.quickFind( { method: "GET", headers: {}, url: "/400" }).handler()).toEqual(30);
        expect( router.quickFind( { method: "GET", headers: {}, url: "/404" }).handler()).toEqual(30);

    });

    it("should register for multiple methods", function () {
        var router = Anumargak();

        router.on(["GET", "HEAD"], "/this/is/static", () => 30);

        expect(Object.keys(router.staticRoutes.GET).length).toEqual(1);
        expect(Object.keys(router.staticRoutes.HEAD).length).toEqual(1);
        expect(router.count).toEqual(2);

        expect( router.quickFind( { method: "GET", headers: {}, url: "/this/is/static" }).handler()).toEqual(30);
        expect( router.quickFind( { method: "HEAD", headers: {}, url: "/this/is/static" }).handler()).toEqual(30);

    });

    it("should error when invalid method type is given", function () {
        var anumargak = Anumargak();

        expect(() => {
            anumargak.on(() => { }, "/this/is/static", () => 30);
        }).toThrowError("Invalid method argument. String or array is expected.");

    });

    //TODO: removing method check can it make it multi purpose
    it("should error when invalid method is given", function () {
        var anumargak = Anumargak();

        expect(() => {
            anumargak.on("invalid", "/this/is/static", () => 30);
        }).toThrowError("Invalid method type invalid");

    });

    it("should lookup static url", function (done) {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/static", (req, res) => {
            done();
        });

        anumargak.lookup({
            method: "GET",
            url: "/this/is/static",
            headers: {}
        });
    });

    it("should set dynamic url", function () {
        var router = Anumargak();

        router.on("GET", "/this/is/:dynamic", () => 30);
        router.on("HEAD", "/this/is/:dynamic", () => 30);

        expect(Object.keys(router.dynamicRoutes.GET).length).toEqual(1);
        expect(Object.keys(router.dynamicRoutes.HEAD).length).toEqual(1);
        expect(router.count).toEqual(2);

        expect( router.quickFind( { method: "GET", headers: {}, url: "/this/is/dynamic" }).handler()).toEqual(30);
        expect( router.quickFind( { method: "HEAD", headers: {}, url: "/this/is/dynamic" }).handler()).toEqual(30);
    });

    it("should set multiple urls under the same route ", function () {
        var anumargak = Anumargak();

        anumargak.on("HEAD", "/this/is/:dynamic", () => 30)
        anumargak.on("HEAD", "/this/is/:dynamic/2", () => 50)

        expect(Object.keys(anumargak.dynamicRoutes.HEAD).length).toEqual(2);
        expect(anumargak.count).toEqual(2);

        expect(anumargak.find("HEAD", "/this/is/dynamic").handler()).toEqual(30);
        expect(anumargak.find("HEAD", "/this/is/dynamic/2").handler()).toEqual(50);
    });

    it("should not overwrite  same route ", function () {
        var anumargak = Anumargak();

        anumargak.on("HEAD", "/this/is/:dynamic", () => 30)
        expect(() => {
            anumargak.on("HEAD", "/this/is/:dynamic", () => 50)
        }).toThrowError("Given route is matching with already registered route");

    });

    it("should set dynamic url with two parameters", function () {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)", () => 30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(1);

        expect(anumargak.find("GET", "/this/is/dynamic/with/123").handler()).toEqual(30);
    });

    //TODO: change the regex to identify consecutive params
    it("should set dynamic url with two consecutive parameters", function () {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:two-:params", () => 30)

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(1);

        expect(anumargak.find("GET", "/this/is/dynamic/with/twoparams").handler()).toEqual(30);
    });

    it("should set dynamic url with two consecutive parameters with pattern", function () {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:two(\\d+):params", () => 30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(anumargak.count).toEqual(1);

        expect(anumargak.find("GET", "/this/is/dynamic/with/123pattern").handler()).toEqual(30);
    });

    it("should set dynamic url with parameter with val", function () {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest", () => 30);
        anumargak.on("GET", "/example/at/:hour(\\d{2})h:minute(\\d{2})m", () => 50)

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(2);
        expect(anumargak.count).toEqual(2);

        expect(anumargak.find("GET", "/this/is/dynamic/with/123rest").handler()).toEqual(30);
        expect(anumargak.find("GET", "/example/at/32h48m").handler()).toEqual(50);
    });

    it("should set dynamic url with parameter with val", function () {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest", () => 30);
        anumargak.on("GET", "/example/at/:hour(\\d{2})h:minute(\\d{2})m", () => 50)

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(2);
        expect(anumargak.count).toEqual(2);

        expect(anumargak.find("GET", "/this/is/dynamic/with/123rest").handler()).toEqual(30);
        expect(anumargak.find("GET", "/example/at/32h48m").handler()).toEqual(50);
    });

    it("should lookup for correct function", function (done) {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest",
            (req, res) => {
                expect(req._path.params).toEqual({
                    dynamic: "dynamic",
                    two: "123"
                });
                done();
            }
        );
        anumargak.on("GET", "/example/at/:hour(\\d{2})h:minute(\\d{2})m",
            (req, res) => {
                expect(req._path.params).toEqual({
                    hour: "32",
                    minute: "48"
                });
                done();
            }
        );

        var req = {
            method: "GET",
            url: "/this/is/dynamic/with/123rest",
            headers: {}
        }

        anumargak.lookup(req);

        var req = {
            method: "GET",
            url: "/example/at/32h48m",
            headers: {}
        }

        anumargak.lookup(req);

    });


    it("should find correct function leaving query paramaters apart", function () {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)", () => 30);

        expect(anumargak.find("GET", "/this/is/dynamic/with/123?ignore=me").handler()).toEqual(30);
        expect(anumargak.find("GET", "/this/is/dynamic/with/123#ignoreme").handler()).toEqual(30);
    });

    it("should lookup correct function without comparing query paramaters", function (done) {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest",
            (req, res) => {
                expect(req._path.url).toEqual("/this/is/dynamic/with/123rest");
                expect(req._queryStr).toEqual("ignore=me");
                expect(req._hashStr).toEqual(undefined);

                expect(req._path.params).toEqual({
                    dynamic: "dynamic",
                    two: "123"
                });
                done();
            }
        );

        var req = {
            method: "GET",
            url: "/this/is/dynamic/with/123rest?ignore=me",
            headers: {}
        }

        anumargak.lookup(req);
    });

    it("should lookup correct function without comparing query paramaters separated by ;", function (done) {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest",
            (req, res) => {
                expect(req._path.url).toEqual("/this/is/dynamic/with/123rest");
                expect(req._queryStr).toEqual("ignore=me");
                expect(req._hashStr).toEqual(undefined);

                expect(req._path.params).toEqual({
                    dynamic: "dynamic",
                    two: "123"
                });
                done();
            }
        );

        var req = {
            method: "GET",
            url: "/this/is/dynamic/with/123rest;ignore=me",
            headers: {}
        }

        anumargak.lookup(req);
    });

    it("should lookup correct function without comparing hashtag", function (done) {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest",
            (req, res) => {
                expect(req._path.url).toEqual("/this/is/dynamic/with/123rest");
                expect(req._queryStr).toEqual(undefined);
                expect(req._hashStr).toEqual("ignoreme");

                expect(req._path.params).toEqual({
                    dynamic: "dynamic",
                    two: "123"
                });
                done();
            }
        );

        var req = {
            method: "GET",
            url: "/this/is/dynamic/with/123rest#ignoreme",
            headers: {}
        }

        anumargak.lookup(req);
    });

    it("should support similar route path with different parameter", function () {
        var anumargak = Anumargak();

        anumargak.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)", () => 30);
        anumargak.on("GET", "/this/is/:dynamic/with/:pattern([a-z]+)", () => 50);

        expect(anumargak.find("GET", "/this/is/dynamic/with/123").handler()).toEqual(30);
        expect(anumargak.find("GET", "/this/is/dynamic/with/string").handler()).toEqual(50);
    });

    it("should ignore trailing slash", function () {
        var anumargak = Anumargak({
            ignoreTrailingSlash: true
        });

        anumargak.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)/", () => 30);
        anumargak.on("GET", "/this/is/static/", () => 50);
        anumargak.on("GET", "/this/is/other/static", () => 70);

        expect(anumargak.find("GET", "/this/is/dynamic/with/123").handler()).toEqual(30);
        expect(anumargak.find("GET", "/this/is/dynamic/with/123/").handler()).toEqual(30);
        expect(anumargak.find("GET", "/this/is/static").handler()).toEqual(50);
        expect(anumargak.find("GET", "/this/is/static/").handler()).toEqual(50);
        expect(anumargak.find("GET", "/this/is/other/static").handler()).toEqual(70);
        expect(anumargak.find("GET", "/this/is/other/static/").handler()).toEqual(70);
    });

    it("should ignore leading slash", function () {
        var anumargak = Anumargak({
            ignoreTrailingSlash: true,
            ignoreLeadingSlash: true
        });

        anumargak.on("GET", "this/is/:dynamic/with/:pattern(\\d+)/", () => 30);
        anumargak.on("GET", "this/is/static/", () => 50);
        anumargak.on("GET", "this/is/other/static", () => 70);

        expect(anumargak.find("GET", "/this/is/dynamic/with/123").handler()).toEqual(30);
        expect(anumargak.find("GET", "/this/is/dynamic/with/123/").handler()).toEqual(30);
        expect(anumargak.find("GET", "/this/is/static").handler()).toEqual(50);
        expect(anumargak.find("GET", "/this/is/static/").handler()).toEqual(50);
        expect(anumargak.find("GET", "/this/is/other/static").handler()).toEqual(70);
        expect(anumargak.find("GET", "/this/is/other/static/").handler()).toEqual(70);
        expect(anumargak.count).toEqual(3);
    });

    it("should return default route", function () {
        var router = Anumargak({
            defaultRoute: () => 50
        });

        router.on("GET", "/this/is/:dynamic/with/:pattern(\\d+)/", () => 30);

        expect( router.quickFind( { method: "GET", headers: {}, url: "/this/is/not/matching" }) ).toEqual(null);

    });

    it("should run default route", function (done) {
        var anumargak = Anumargak({
            defaultRoute: (req, res) => {
                expect(req._path.params).toEqual(undefined);
                expect(req._path.url).toEqual("/this/is/not/matching");
                expect(req._queryStr).toEqual("q=test");
                done();
            }
        });

        anumargak.on("GET", "/this/is/:dynamic/with/:two(\\d+)rest",
            (req, res) => {
                done.fail();
            }
        );

        var req = {
            method: "GET",
            url: "/this/is/not/matching?q=test",
            headers: {}
        }

        anumargak.lookup(req);

    });

    it("should register static routes for 'GET, POST, DELETE, PUT, HEAD' methods", function () {
        var anumargak = Anumargak();

        anumargak.get("/this/is/static", () => 50);
        anumargak.post("/this/is/static", () => 50);
        anumargak.delete("/this/is/static", () => 50);
        anumargak.put("/this/is/static", () => 50);
        anumargak.head("/this/is/static", () => 50);

        expect(Object.keys(anumargak.staticRoutes.GET).length).toEqual(1);
        expect(Object.keys(anumargak.staticRoutes.POST).length).toEqual(1);
        expect(Object.keys(anumargak.staticRoutes.DELETE).length).toEqual(1);
        expect(Object.keys(anumargak.staticRoutes.PUT).length).toEqual(1);
        expect(Object.keys(anumargak.staticRoutes.HEAD).length).toEqual(1);
        expect(anumargak.count).toEqual(5);

        expect(anumargak.find("GET", "/this/is/static").handler()).toEqual(50);
        expect(anumargak.find("POST", "/this/is/static").handler()).toEqual(50);
        expect(anumargak.find("DELETE", "/this/is/static").handler()).toEqual(50);
        expect(anumargak.find("PUT", "/this/is/static").handler()).toEqual(50);
        expect(anumargak.find("HEAD", "/this/is/static").handler()).toEqual(50);
    });
    it("should register dynamic routes for 'GET, POST, DELETE, PUT, HEAD' methods", function () {
        var anumargak = Anumargak();

        anumargak.get("/this/is/:dynamic", () => 30);
        anumargak.head("/this/is/:dynamic", () => 30);
        anumargak.post("/this/is/:dynamic", () => 30);
        anumargak.put("/this/is/:dynamic", () => 30);
        anumargak.delete("/this/is/:dynamic", () => 30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(Object.keys(anumargak.dynamicRoutes.HEAD).length).toEqual(1);
        expect(Object.keys(anumargak.dynamicRoutes.POST).length).toEqual(1);
        expect(Object.keys(anumargak.dynamicRoutes.PUT).length).toEqual(1);
        expect(Object.keys(anumargak.dynamicRoutes.DELETE).length).toEqual(1);
        expect(anumargak.count).toEqual(5);

        expect(anumargak.find("GET", "/this/is/dynamic").handler()).toEqual(30);
        expect(anumargak.find("HEAD", "/this/is/dynamic").handler()).toEqual(30);
        expect(anumargak.find("POST", "/this/is/dynamic").handler()).toEqual(30);
        expect(anumargak.find("PUT", "/this/is/dynamic").handler()).toEqual(30);
        expect(anumargak.find("DELETE", "/this/is/dynamic").handler()).toEqual(30);
    });

    it('should register named regular expression', function () {
        var anumargak = Anumargak();

        anumargak.addNamedExpression("num", "\\d+");

        expect(anumargak.namedExpressions.count() ).toEqual(1);

        anumargak.addNamedExpression({
            "oneNum": "\\d",
            "oneOrNoNum": "\\d?",
        });

        expect( anumargak.namedExpressions.count() ).toEqual(3);

    });

    it("should throw error when addNamedExpression method called with invalid arguments", function () {
        var anumargak = Anumargak();
        var errorMsg = "Invalid method argument. Two parameters of type String or only object is expected.";

        expect(() => {
            anumargak.addNamedExpression("num");
        }).toThrowError(errorMsg);

        expect(() => {
            anumargak.addNamedExpression(123, 234);
        }).toThrowError(errorMsg);

        expect(() => {
            anumargak.addNamedExpression([{ "num": "\\d+" }]);
        }).toThrowError(errorMsg);

    });

    it("should throw error when named expression being used but not defined", function () {
        var anumargak = Anumargak();

        expect(() => {
            anumargak.get("/this/is/:dynamic/with/:pattern(:num:)", () => 30);
        }).toThrowError("Usage of named expression in url as num. Define it using addNamedExpression method before using in URLs.");

    });

    it("should add named regular expression which can be used in dynamic routes for 'GET, POST, DELETE, PUT, HEAD' methods", function () {
        var anumargak = Anumargak();

        anumargak.addNamedExpression("num", "\\d+");
        anumargak.addNamedExpression({
            "oneNum": "\\d",
            "oneOrNoNum": "\\d?",
        });

        anumargak.get("/this/is/:dynamic/with/:pattern(:num:)", () => 30);
        anumargak.head("/this/is/:dynamic/with/:pattern(:oneNum:)", () => 30);
        anumargak.post("/this/is/:dynamic/with/:pattern(:oneOrNoNum:)", () => 30);
        anumargak.put("/this/is/:dynamic/with/:pattern(:num:)", () => 30);
        anumargak.delete("/this/is/:dynamic/with/:pattern(:oneNum:)", () => 30);

        expect(Object.keys(anumargak.dynamicRoutes.GET).length).toEqual(1);
        expect(Object.keys(anumargak.dynamicRoutes.HEAD).length).toEqual(1);
        expect(Object.keys(anumargak.dynamicRoutes.POST).length).toEqual(1);
        expect(Object.keys(anumargak.dynamicRoutes.PUT).length).toEqual(1);
        expect(Object.keys(anumargak.dynamicRoutes.DELETE).length).toEqual(1);
        expect(anumargak.count).toEqual(5);

        expect(anumargak.find("GET", "/this/is/dynamic/with/123").handler()).toEqual(30);
        expect(anumargak.find("HEAD", "/this/is/dynamic/with/5").handler()).toEqual(30);
        expect(anumargak.find("POST", "/this/is/dynamic/with/").handler()).toEqual(30);
        expect(anumargak.find("PUT", "/this/is/dynamic/with/41234").handler()).toEqual(30);
        expect(anumargak.find("DELETE", "/this/is/dynamic/with/5").handler()).toEqual(30);
    });

    const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

    it("should lookup for aync callback", async function(done) {
        var router = Anumargak();

        async function callback (req){
            await sleep(200);
            expect(req._path.url).toEqual("/this/is/static");
            done();
        }

        router.on("GET", "/this/is/static", callback);
        
        var req = {
            method: "GET",
            url: "/this/is/static",
            headers: {}
        }

        router.lookup(req);
    });

});
