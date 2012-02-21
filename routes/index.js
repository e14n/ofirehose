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

var theFeed = require('../lib/feed').theFeed,
    localURL = require('../lib/url').localURL;

exports.index = function(req, res) {
    res.render('index', { title: 'Home' });
};

exports.ping = function(req, res) {

    var activity = req.body;

    theFeed.unshift(activity);

    res.writeHead(201);
    res.end();
};

exports.feed = function(req, res) {
    
    var collection = {
        displayName: "OFirehose.com feed",
        id: localURL('feed.json'),
        objectTypes: ["activity"],
        items: theFeed.slice(0, 20)
    };

    res.writeHead(200, {'Content-Type': 'application/json'});
    res.end(JSON.stringify(collection));
};

exports.publish = function(req, res) {
    res.render('publish', { title: 'Help for publishers' });
};

exports.subscribe = function(req, res) {
    res.render('subscribe', { title: 'Help for subscribers' });
};
