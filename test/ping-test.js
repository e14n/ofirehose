// Test that you can actually submit stuff
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
    assert = vows.assert,
    http = require("http"),
    apputil = require("./lib/app"),
    withAppSetup = apputil.withAppSetup;

var post = {
	"to": [{
		"objectType": "collection",
		"id": "http://activityschema.org/collection/public"
	}],
	"cc": [{
		"objectType": "collection",
		"id": "https://pump.strugee.net/api/user/alex/followers"
	}],
	"verb": "post",
	"object": {
		"objectType": "note",
		"content": "A submission to the firehose!",
		"id": "uuid:fec86e5c-27d0-4c93-afb9-932c3c685f5f"
	},
	"actor": {
		"objectType": "person",
		"id": "acct:alex@pump.strugee.net"
	},
	"id": "uuid:dc1d333a-6695-4a30-9621-61db0b5c8991"
};

vows.describe("firehose submission").addBatch(withAppSetup({
	"and we POST to /ping": {
		topic: function() {
			var cb = this.callback,
			    req = http.request({
				scheme: "http",
				host: "localhost",
				path: "/ping",
				port: 32598,
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
})).export(module);
