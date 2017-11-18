// test the URL module
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

var vows = require("perjury"),
    assert = vows.assert;

// XXX expand this file

vows.describe("URL module").addBatch({
	"When we require the module": {
		topic: function() {
			return require("../lib/url");
		},
		"it works": function(err) {
			assert.ifError(err);
		},
		"it exports a function": function(err, localURL) {
			assert.isFunction(localURL.localURL);
		}
	}
}).export(module);
