# Internal hub for ofirehose.com
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
 
url = require "url"
qs = require "querystring"
http = require "http"
https = require "https"
crypto = require "crypto"

_ = require "underscore"
databank = require "databank"

NoSuchThingError = databank.NoSuchThingError

MAX_LEASE = 60 * 60 * 24 * 365
MIN_LEASE = 60 * 60 * 24 * 1
DEFAULT_LEASE = 60 * 60 * 24 * 7

class Hub

  @schema = 
    subscription:
      pkey: "callback"
      fields: [
        "callback"
        "created"
        "topic"
        "lease_seconds"
      ]
      indices: ["topic"]
      
  constructor: (@server, @db) ->
    @server = server
    @db = db

  ourTopic: (topic) ->
    parts = url.parse(topic)
    parts.hostname is @server and parts.pathname is "/feed.json"

  subscribe: (params, cb) ->
    hub = this
    @validate params, (err) ->
      sub = undefined
      callback = undefined
      if err
        cb err
      else
        callback = params.hub.callback
        sub =
          callback: callback
          topic: params.hub.topic
          created: Date.now()
          lease_seconds: Math.min(DEFAULT_LEASE, parseInt(params.hub.lease_seconds, 10))

        sub.secret = params.hub.secret  if _(params.hub).has("secret")
        hub.db.save "subscription", callback, sub, (err, value) ->
          if err
            cb new Error("Error saving subscription.")
          else
            cb null, value

  unsubscribe: (params, cb) ->
    hub = this
    @validate params, (err) ->
      sub = undefined
      callback = undefined
      if err
        cb err
      else
        callback = params.hub.callback
        hub.db.del "subscription", callback, (err) ->
          if err and (err not instanceof NoSuchThingError)
            cb new Error("Error deleting subscription.")
          else
            cb null

  validate: (params, cb) ->
    callback = undefined
    topic = undefined
    callback = params.hub.callback
    unless callback
      cb new Error("No callback provided.")
      return
    topic = params.hub.topic
    unless topic
      cb new Error("No topic provided.")
      return
    unless @ourTopic(topic)
      cb new Error("We don't support that topic.")
      return
    if params.hub.verify isnt "sync"
      cb new Error("We only support sync verification.")
      return
    @verify params, (err) ->
      sub = undefined
      if err
        cb err
      else
        cb null

  makeChallenge: ->
    urlsafe = (buf) ->
      str = buf.toString("base64")
      str = str.replace(/\+/g, "-")
      str = str.replace(/\//g, "_")
      str = str.replace(/\=/g, "")
      str
      
    urlsafe crypto.randomBytes(16)

  verify: (params, cb) ->
    callback = params.hub.callback
    challenge = @makeChallenge()
    args =
      "hub.mode": params.hub.mode
      "hub.topic": params.hub.topic
      "hub.challenge": challenge

    args["hub.lease_seconds"] = params.hub.lease_seconds  if _(params.hub).has("lease_seconds")
    args["hub.verify_token"] = params.hub.verify_token  if _(params.hub).has("verify_token")
    
    @postRequest callback, args, (err, res, body) ->
      if err
        cb new Error("Could not verify.")
      else if res.statusCode < 200 or res.statusCode >= 300
        cb new Error("Could not verify.")
      else if body.trim() isnt challenge
        cb new Error("Could not verify.")
      else
        cb null

  postRequest: (targetUrl, params, callback) ->
    parts = url.parse(targetUrl)
    options =
      host: parts.hostname
      port: parts.port
      path: (if (parts.search) then parts.pathname + "?" + parts.search else parts.pathname)
      method: "POST"
      headers:
        "content-type": "application/x-www-form-urlencoded"
        "user-agent": "ofirehose/0.2.0dev"

    mod = if parts.protocol == "https:" then https else http
    
    creq = mod.request(options, (res) ->
      body = ""
      res.on "data", (chunk) ->
        body = body + chunk

      res.on "end", ->
        callback null, res, body

    )
    creq.on "error", (err) ->
      callback err, null, null

    creq.write qs.stringify(params)
    creq.end()

  # XXX: queue and do later
 
  distribute: (activity, topic, callback) ->
    
    hub = this
    message = @makeMessage(activity, topic)
    onSub = (sub) ->
      hub.distributeTo message, topic, sub

    hub.db.search "subscription", {topic: topic}, onSub, (err) ->
      callback err

  makeMessage: (activity, topic) ->
    message = items: [
      topic: topic
      payload: activity
    ]
    JSON.stringify message

  distributeTo: (message, topic, sub) ->
    signature = null
    signature = @sign(message, sub.secret) if sub.secret
    @postMessage sub.callback, message, signature, (err, res, body) ->

  # XXX: log
  sign: (message, secret) ->
    hmac = crypto.createHmac("sha1", secret)
    hmac.update message
    hmac.digest "hex"

  postMessage: (targetUrl, message, signature, callback) ->
    parts = url.parse(targetUrl)
    options =
      host: parts.hostname
      port: parts.port
      path: (if (parts.search) then parts.pathname + "?" + parts.search else parts.pathname)
      method: "POST"
      headers:
        "content-type": "application/json"
        "user-agent": "ofirehose/0.1.0dev"

    options.headers["X-Hub-Signature"] = "sha1=" + signature  if signature

    mod = if parts.protocol == "https:" then https else http
    
    creq = mod.request(options, (res) ->
      body = ""
      res.on "data", (chunk) ->
        body = body + chunk

      res.on "end", ->
        callback null, res, body

    )
    creq.on "error", (err) ->
      callback err, null, null

    creq.write message
    creq.end()

module.exports = Hub
