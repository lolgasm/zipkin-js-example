/* eslint-disable import/newline-after-import */
// initialize tracer
const express = require('express');
const CLSContext = require('zipkin-context-cls');
const {
    Tracer
} = require('zipkin');
const {
    recorder
} = require('./recorder');

const port = process.env.PORT || 9000;
var my_url
if (process.env.VCAP_APPLICATION) {
    var vc = JSON.parse(process.env.VCAP_APPLICATION);
    my_url = vc.uris[0];
} else {
    my_url = 'localhost:9000';
}

const ctxImpl = new CLSContext('zipkin');
const localServiceName = 'backend';
const tracer = new Tracer({
    ctxImpl,
    recorder,
    localServiceName
});

const app = express();

// instrument the server
const zipkinMiddleware = require('zipkin-instrumentation-express').expressMiddleware;
app.use(zipkinMiddleware({
    tracer
}));

app.get('/api', (req, res) => res.send(new Date().toString()));

app.listen(port, () => {
    console.log('Backend listening on port ' + port);
});