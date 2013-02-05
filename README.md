node-kissmetrics
================

A KISSmetrics library for node.js

Usage
-----

Basically, you simply create a new KM Client instance,

    var kissmestrics = require('kissmetrics')
    var kmClient = new kissmetrics({ key: KM_KEY });

and then issue commands using the provided methods,e.g.:

    // Creating an alias
    kmClient.alias(km_ai_decoded || identity, [username, email], callback);

    // Recording an event
    kmClient.record(km_ai_decoded || identity, 'signed up', callback);

etc.

For more information / documentation on how to use the methods, I suggest you take a look at the [source code](https://github.com/glesperance/node-kissmetrics/blob/master/lib/kissmetrics.js) ; all the methods are accompanied by proper jsDocs.
