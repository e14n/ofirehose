// Utilities to set up app instances
//
// Copyright 2012-2013 E14N https://e14n.com/
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
    _ = require("underscore"),
    makeApp = require("../../lib/app"),
    config = _.defaults({port: 32598}, require("../../lib/defaults"));

var withAppSetup = function(batchConfig) {
    batchConfig.topic = function() {
        var callback = this.callback,
            app = makeApp(config).start(function(err) {
                callback(err, app);
            })
    };

    batchConfig.teardown = function(app) {
        app.close(this.callback);
    };

    batchConfig["it works"] = function(err) {
        assert.ifError(err);
    };

    return {
        "When we set up the app": batchConfig
    };
};

exports.withAppSetup = withAppSetup;
