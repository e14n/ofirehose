// test the Feed module
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

vows.describe("Feed module").addBatch({
	"When we require the module": {
		topic: function() {
			return require("../lib/feed").Feed;
		},
		"it works": function(err) {
			assert.ifError(err);
		},
		"it exports the Feed class": function(err, Feed) {
			assert.isFunction(Feed);
		},
		"and we instantiate a Feed": {
			topic: function(Feed) {
				return new Feed();
			},
			"it works": function(err) {
				assert.ifError(err);
			},
			"it's an object": function(err, feed) {
				assert.isObject(feed);
			},
			"it has the right methods": function(err, feed) {
				assert.isFunction(feed.unshift);
				assert.isFunction(feed.slice);
			},
			"feed.items is an array": function(err, feed) {
				assert.isArray(feed.items);
			},
			"and we call unshift() a couple times": {
				topic: function(feed) {
					feed.unshift("1");
					feed.unshift("2");
					feed.unshift("3");
					feed.unshift("4");
					var retval = feed.unshift("5");
					return [feed, retval];
				},
				"it works": function(err) {
					assert.ifError(err);
				},
				"the return value is the right length": function(err, arr) {
					assert.isNumber(arr[1]);
					assert.equal(arr[1], 5);
				},
				"and we call slice()": {
					topic: function(arr) {
						return arr[0].slice(2, 4);
					},
					"it works": function(err) {
						assert.ifError(err);
					},
					"it returns the right data": function(err, arr) {
						assert.deepEqual(arr, ["3", "2"]);
					}
				},
				"and we call unshift() a bunch more times": {
					topic: function(arr) {
						var retval, feed = arr[0];
						for (var i = 6; i <= 100; i++) {
							retval = feed.unshift(String(i));
						}
						return [feed, retval];
					},
					"it works": function(err) {
						assert.ifError(err);
					},
					"the return value is the length MAX": function(err, arr) {
						assert.isNumber(arr[1]);
						assert.equal(arr[1], 20);
					},
					"it returns the last MAX feed entries": function(err, arr) {
						var newArr = [];
						for (var i = 81; i <= 100; i++) {
							newArr.unshift(String(i));
						}

						assert.deepEqual(arr[0].items, newArr);
					}
				}
			}
		}
	}
}).export(module);
