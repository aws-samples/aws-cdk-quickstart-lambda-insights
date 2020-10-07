const AWS = require('aws-sdk');
//const AWSXRay = require('aws-xray-sdk-core');

exports.handler = function(event, context, callback) {

console.log(event);
const response = {
    statusCode: 200,
    headers: {
        "x-custom-header": "My Header Value",
    },
    body: JSON.stringify({message: "Hello World!"
    }),
};
callback(null, response);
};








