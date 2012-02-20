// routes for ofirehose.com
//
// Copyright 2012 StatusNet Inc.
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

var cg = require('chain-gang'),
    chain = cg.create({workers: 3});

exports.index = function(req, res) {
    res.render('index', { title: 'Express' });
};

var distributor = function(activity) {
    return function(job) {
	job.finish(null);
    };
};

exports.ping = function(req, res) {

    var activity = req.body;

    req.authenticate(['oauth'], function(error, authenticated) { 
        if( authenticated ) {
	    chain.add(distributor(activity), activity.id);
	    res.writeHead(201);
	    res.end();
        } 
        else {
            res.writeHead(401, {'Content-Type': 'text/plain'});
            res.end('Doubt you\'ll ever see this.');
        }
    });

};
