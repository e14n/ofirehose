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
    https = require("https"),
    urlparse = require("url").parse,
    post = require("./data/post");

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

var suite = vows.describe("smoke test app interface over https");

suite.addBatch({
	"When we makeApp()": {
		topic: function() {
			var config = {port: 443,
			              hostname: "localhost",
			              key: path.join(__dirname, "data", "secure.localhost.key"),
			              cert: path.join(__dirname, "data", "secure.localhost.crt"),
			              driver: "memory",
			              params: {}
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
			},
			"and we POST to /ping": {
				topic: function() {
					var cb = this.callback,
					    req = https.request({
						    scheme: "http",
						    host: "localhost",
						    path: "/ping",
						    port: 443,
						    method: "POST"
					    });

					req.write(JSON.stringify(post));

					req.on("error", cb);
					req.on("response", function(res) {
						cb(undefined, res);
					});
				},
				"it works": function(err) {
					assert.ifError(err);
				},
				"we get back HTTP 201": function(err, res) {
					assert.equal(res.statusCode, 201);
				}
			}
		}
	}
});

suite["export"](module);
