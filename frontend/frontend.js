/* eslint-disable import/newline-after-import */
// initialize tracer
const rest = require('rest');
const express = require('express');
const CLSContext = require('zipkin-context-cls');
const {
    Tracer
} = require('zipkin');
const {
    recorder
} = require('./recorder');
const port = process.env.PORT || 8081;

var backend_url;
if (process.env.BACKEND_URL) {
    backend_url = process.env.BACKEND_URL;
} else {
    backend_url = 'localhost:9000';
}

const ctxImpl = new CLSContext('zipkin');
const localServiceName = 'frontend';
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

// instrument the client
const {
    restInterceptor
} = require('zipkin-instrumentation-cujojs-rest');
const zipkinRest = rest.wrap(restInterceptor, {
    tracer
});

// Allow cross-origin, traced requests. See http://enable-cors.org/server_expressjs.html
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', [
        'Origin', 'Accept', 'X-Requested-With', 'X-B3-TraceId',
        'X-B3-ParentSpanId', 'X-B3-SpanId', 'X-B3-Sampled'
    ].join(', '));
    next();
});

app.get('/', (req, res) => {
    tracer.local('pay-me', () =>
        zipkinRest('http://' + backend_url + '/api')
        .then(response => res.send(response.entity))
        .catch(err => console.error('Error', err.stack))
    );
});

app.listen(port, () => {
    console.log('Frontend listening on port ' + port);
});