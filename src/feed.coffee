# Feed for ofirehose.com
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
Feed = ->
  @_items = []

MAX = 20
Feed::unshift = (value) ->
  result = @_items.unshift(value)
  @_items.splice MAX, @_items.length - MAX  if @_items.length > MAX
  @_items.length

Feed::slice = (begin, end) ->
  @_items.slice begin, end

exports.Feed = Feed
