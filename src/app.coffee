# main function for ofirehose.com
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

fs = require "fs"
path = require "path"

_ = require "underscore"
express = require "express"
methodOverride = require "method-override"
Step = require "step"
Databank = require("databank").Databank

defaults = require "./defaults"
routes = require "./routes"
localURL = require("./url").localURL
Hub = require "./hub"
Feed = require("./feed").Feed

makeApp = (config) ->
  server = config.server
  address = config.address or server
  useHTTPS = (if (config.key) then true else false)
  if not config.port
    port = if useHTTPS then 443 else 80

  localURL.server = server
  localURL.protocol = (if (useHTTPS) then "https" else "http")

  if useHTTPS
    app = express.createServer(
      key: fs.readFileSync(config.key)
      cert: fs.readFileSync(config.cert)
    )
    bounce = express.createServer((req, res, next) ->
      host = req.header("Host")
      res.redirect "https://" + host + req.url, 301
    )
  else
    app = express.createServer()

  # Configuration
  app.set "views", path.join __dirname, "..", "views"
  app.set "view engine", "utml"
  app.use express.bodyParser()
  app.use methodOverride()
  app.use express.logger()
  app.use app.router
  app.use express.static path.join __dirname, "..", "public"

  if app.get "env" is "development"
    app.use express.errorHandler(
      dumpExceptions: true
      showStack: true
    )

  if app.get "env" is "production"
    app.use express.errorHandler()

  # Routes
  app.get "/", routes.index
  app.get "/feed.json", routes.feed
  app.get "/doc/publish", routes.publish
  app.get "/doc/subscribe", routes.subscribe
  app.post "/ping", routes.ping
  app.post "/hub", routes.hub

  # DB
  driver = config.driver
  params = config.params
  params.schema = Hub.schema
  db = Databank.get driver, params

  app.start = (cb) ->
    if not cb
      cb = () ->

    db.connect {}, (err) ->
      if err
        console.error "Couldn't connect to JSON store: " + err.message
      else
        app.hub = new Hub(localURL.server, db)
        app.feed = new Feed()
        if useHTTPS
          Step(
            () ->
              app.listen config.port, address, this.parallel()
              bounce.listen 80, address, this.parallel()
            cb
          )
        else
          app.listen config.port, address, cb

  return app

module.exports = makeApp
