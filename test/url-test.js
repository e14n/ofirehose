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
		},
		"and we call localURL()": {
			topic: function(localURL) {
				return localURL.localURL("hub");
			},
			"it works": function(err) {
				assert.ifError(err);
			},
			"we get back the right result": function(err, url) {
				assert.isString(url);
				assert.equal(url, "http://localhost/hub");
			}
		},
		"and we configure localURL with some different parameters": {
			topic: function(localURL) {
				localURL.localURL.server = "firehose.example";
				return localURL;
			},
			"it works": function(err) {
				assert.ifError(err);
			},
			"and we call localURL()": {
				topic: function(localURL) {
					return localURL.localURL("hub");
				},
				"it works": function(err) {
					assert.ifError(err);
				},
				"we get back the right result": function(err, url) {
					assert.isString(url);
					assert.equal(url, "http://firehose.example/hub");
				}
			}
		}
	}
}).export(module);
