# OFirehose

Firehose for the federated social web

## Installation

### Prerequisites

You'll need four things to get started:

* node.js 4.x or higher
* npm 2.15.x or higher (4.x or above preferred)

### Local install

You need clone the git repository:

    git clone https://github.com/e14n/ofirehose.git

And install the dependencies using `npm`:

    cd ofirehose
    npm install

### Database setup

OFirehose uses [databank][] Any databank driver should work. 
`couchbase`, `mongodb` and `redis` are probably the best
bets for production servers, but the `disk` or even `memory` drivers
can work for testing.

If you're confused, just use the *MongoDB* one, [databank-mongodb](https://www.npmjs.com/package/databank-mongodb).

You can find other drivers like so:

    npm search databank

You can install in the `ofirehose` directory as a normal dependency.
For example, the databank driver for MongoDB:

    npm install databank-mongodb

Note that you also need to install and configure your database server. 
example in Debian derivatives: 

    apt-get install mongodb

## Configuration

OFirehose require a configuration file located in `/etc/ofirehose.json`, `~/.ofirehose.json`, any of the two options would be fine.

### Available parameters

* **driver** The [databank][] driver you're using. Defaults to `memory`, not recommended for production.
* **params** Databank driver params; see the databank driver README for details on what to put here.
* **key** If you're using SSL, the path to the server key, like
   "/etc/ssl/private/myserver.key". Defaults `null`.
* **cert** If you're using SSL, the path to the server cert, like
   "/etc/ssl/private/myserver.crt". Defaults `null`.
* **server** The address on which "publish/subscribe"(`PubSubHubbub`) will happen. Defaults machine `hostname`.
* **address** The address to listen on. Defaults machine `hostname`, Use this if you've got some kind of load-balancer or NAS or whatever and your local IP doesn't map to the IP of the hostname.
* **port** Port to listen on. Defaults to `443` when *key* is set or `80` otherwise, Change this if you've got some kind of load-balancer.
   
## License

Copyright 2012-2014 E14N https://e14n.com/
Copyright 2017 AJ Jordan <alex@strugee.net>, Camilo QS <vxcamiloxv@disroot.org>

OFirehose is licensed under the Apache License Version 2.0, See the [LICENSE][] file for the full license text.

[databank]: https://github.com/evanp/databank
[LICENSE]: https://github.com/e14n/ofirehose/blob/master/LICENSE
