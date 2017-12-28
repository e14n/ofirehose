// test the main app file
//
// Copyright 2017 AJ Jordan
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

require("./lib/hostname");

var vows = require("perjury"),
    assert = vows.assert,
    _ = require("underscore"),
    defaults = require("../lib/defaults");

vows.describe("app module").addBatch({
	"When we require the module": {
		topic: function() {
			return require("../lib/app");
		},
		"it works": function(err) {
			assert.ifError(err);
		},
		"it exports a makeApp() function": function(err, makeApp) {
			assert.isFunction(makeApp);
		},
		"and we call makeApp()": {
			topic: function(makeApp) {
				return makeApp(_.defaults({port: 15180}, defaults));
			},
			"it works": function(err) {
				assert.ifError(err);
			},
			"we get back an Express app": function(err, app) {
				assert.isObject(app);
			},
			"the Express app has a start() method": function(err, app) {
				assert.isFunction(app.start);
			},
			"and we call app.start()": {
				topic: function(app) {
					app.start(this.callback);
				},
				teardown: function(app) {
					if (app.server && app.server.close) {
						app.server.close(this.callback);
					}
				},
				"it works": function(err) {
					assert.ifError(err);
				},
				"we get back an app server object": function(err, appServer) {
					assert.isObject(appServer);
					assert.isFunction(appServer.listen);
				}
			}
		}
	}
}).export(module);
