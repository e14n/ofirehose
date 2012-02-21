// ping.js
//
// Pings a server with an activity streams file
//
// Copyright 2012, StatusNet Inc.
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

var fs = require('fs'),
    url = require('url'),
    http = require('http');

if (process.argv.length != 4) {
    process.stderr.write("USAGE: node ping.js filename.json server\n");
    process.exit(1);
}

var fileName = process.argv[2];
var server = process.argv[3];

fs.readFile(fileName, function (err, data) {

    if (err) {
	console.log("Error reading file: " + err);
	process.exit(1);
    }

    var options = {
	host: server,
	port: '80',
	method: 'POST',
	path: '/ping',
	headers: {'content-type': 'application/json',
		  'user-agent': 'ping.js/0.1.0dev'}
    };

    var req = http.request(options, function(res) {
        var body = '';

	res.on('data', function (chunk) {
	    body = body + chunk;
	});

	res.on('end', function () {
            console.log(body);
	});
    });

    req.on('error', function(err) {
        console.error(err);
    });

    req.write(data);
    req.end();
});
