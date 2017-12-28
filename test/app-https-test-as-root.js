// Test running the app over HTTPS
//
// Copyright 2012, E14N https://e14n.com/
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

"use strict";

var vows = require("perjury"),
    assert = vows.assert,
    fs = require("fs"),
    path = require("path"),
    databank = require("databank"),
    Step = require("step"),
    http = require("http"),
    https = require("https"),
    urlparse = require("url").parse;

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var suite = vows.describe("smoke test app interface over https");

var httpsURL = function(url) {
    var parts = urlparse(url);
    return parts.protocol === "https:";
};

suite.addBatch({
    "When we makeApp()": {
        topic: function() {
            var config = {port: 443,
                          hostname: "secure.localhost",
                          key: path.join(__dirname, "data", "secure.localhost.key"),
                          cert: path.join(__dirname, "data", "secure.localhost.crt"),
                          driver: "memory",
                          params: {},
                         },
                makeApp = require("../lib/app");

            process.env.NODE_ENV = "test";

            return makeApp(config);
        },
        "it works": function(err, app) {
            assert.ifError(err);
            assert.isObject(app);
        },
        "and we app.start()": {
            topic: function(app) {
                var cb = this.callback;
                app.start(function(err) {
                    if (err) {
                        cb(err, null);
                    } else {
                        cb(null, app);
                    }
                });
            },
            teardown: function(app) {
                if (app && app.server && app.server.close) {
                    app.server.close(this.callback);
                }
            },
            "it works": function(err, app) {
                assert.ifError(err);
            },
            "app is listening on correct port": function(err, app) {
                var addr = app.server.address();
                assert.equal(addr.port, 443);
            }
        }
    }
});

suite["export"](module);
