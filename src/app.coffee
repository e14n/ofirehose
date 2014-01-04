# main function for ofirehose.com
#
# Copyright 2012 StatusNet Inc.
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
fs = require("fs")
express = require("express")
routes = require("./routes")
localURL = require("./url").localURL
config = require("./config")
os = require("os")
Databank = require("databank").Databank
globals = require("./globals")
Hub = require("./hub").Hub
Feed = require("./feed").Feed
server = config.server or os.hostname()
address = config.address or server
useHTTPS = (if (config.key) then true else false)
app = undefined
bounce = undefined
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
module.exports = app

# Configuration
app.configure ->
  app.set "views", __dirname + "/views"
  app.set "view engine", "utml"
  app.use express.bodyParser()
  app.use express.methodOverride()
  app.use express.logger()
  app.use app.router
  app.use express.static(__dirname + "/public")

app.configure "development", ->
  app.use express.errorHandler(
    dumpExceptions: true
    showStack: true
  )

app.configure "production", ->
  app.use express.errorHandler()


# Routes
app.get "/", routes.index
app.get "/feed.json", routes.feed
app.get "/doc/publish", routes.publish
app.get "/doc/subscribe", routes.subscribe
app.post "/ping", routes.ping
app.post "/hub", routes.hub

# DB
driver = config.driver or "disk"
params = config.params or {}
params.schema = Hub.schema
db = Databank.get(driver, params)
db.connect {}, (err) ->
  if err
    console.error "Couldn't connect to JSON store: " + err.message
  else
    globals.hub new Hub(localURL.server, db)
    globals.feed new Feed()
    if useHTTPS
      app.listen 443, address
      bounce.listen 80, address
    else
      app.listen 80, address

