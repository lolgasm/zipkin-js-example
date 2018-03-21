var zipkinBaseUrl;
if (process.env.ZIPKIN_URL) {
    zipkinBaseUrl = 'http://' + process.env.ZIPKIN_URL;
} else {
    zipkinBaseUrl = 'http://localhost:9411';
}

/* eslint-env browser */
const {
    BatchRecorder,
    jsonEncoder: {
        JSON_V2
    }
} = require('zipkin');
const {
    HttpLogger
} = require('zipkin-transport-http');

// Send spans to Zipkin asynchronously over HTTP
const recorder = new BatchRecorder({
    logger: new HttpLogger({
        endpoint: `${zipkinBaseUrl}/api/v2/spans`,
        jsonEncoder: JSON_V2
    })
});

module.exports.recorder = recorder;