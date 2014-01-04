# routes for ofirehose.com
#
# Copyright 2012-2014 E14N https://e14n.com/
#
# Licensed under the Apache License, Version 2.0 (the "License");
# you may not use this file except in compliance with the License.
# You may obtain a copy of the License at
#
#     http://www.apache.org/licenses/LICENSE-2.0
#
# Unless required by applicable law or agreed to in writing, software
# distributed under the License is distributed on an "AS IS" BASIS,
# WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
# See the License for the specific language governing permissions and
# limitations under the License.
 
localURL = require("./url").localURL

exports.index = (req, res) ->
  res.render "index",
    title: "Home"

exports.ping = (req, res) ->
  activity = req.body
  theFeed = req.app.feed
  theHub = req.app.hub
  theFeed.unshift activity
  theHub.distribute activity, localURL("feed.json"), (err) ->

  res.writeHead 201
  res.end()

exports.feed = (req, res) ->
  theFeed = req.app.feed
  collection =
    displayName: "OFirehose.com feed"
    hubs: [localURL("hub")]
    id: localURL("feed.json")
    objectTypes: ["activity"]
    items: theFeed.slice(0, 20)

  res.setHeader "Link", [
    "<" + localURL("hub") + ">; rel=\"hub\""
    "<" + localURL("feed.json") + ">; rel=\"self\""
  ]
  res.writeHead 200,
    "Content-Type": "application/json"

  res.end JSON.stringify(collection)

exports.publish = (req, res) ->
  res.render "publish",
    title: "Help for publishers"


exports.subscribe = (req, res) ->
  res.render "subscribe",
    title: "Help for subscribers"

namespacedParams = (body) ->
  params = {}
  dotted = undefined
  dot = undefined
  namespace = undefined
  name = undefined
  for dotted of body
    dot = dotted.indexOf(".")
    if dot isnt -1
      namespace = dotted.substr(0, dot)
      name = dotted.substr(dot + 1)
    else
      namespace = "__default__"
      name = dotted
    params[namespace] = {}  unless params.hasOwnProperty(namespace)
    params[namespace][name] = body[dotted]
  params

exports.hub = (req, res) ->
  params = namespacedParams(req.body)
  theHub = req.app.hub
  switch params.hub.mode
    when "subscribe"
      theHub.subscribe params, (err, results) ->
        if err
          res.writeHead 500,
            "Content-Type": "text/plain"

          res.end err.message
        else
          res.writeHead 204
          res.end()

    when "unsubscribe"
      theHub.unsubscribe params, (err, results) ->
        if err
          res.writeHead 500,
            "Content-Type": "text/plain"

          res.end err.message
        else
          res.writeHead 204
          res.end()

    when "publish"
    else
      res.writeHead 400,
        "Content-Type": "text/plain"

      res.end "That's not a mode this hub supports."
