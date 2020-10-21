const AWS = require('aws-sdk');
const AWSXRay = require('aws-xray-sdk-core');

exports.handler = function(event, context, callback) {
    
const segment = AWSXRay.getSegment();
const subsegment = segment.addNewSubsegment("ExpensiveCode");

// Code block to consume memory during runtime of the lambda
var a = [];
var b = [];

class SimpleClass {
  constructor(text){
    this.text = text;
  }
}

  var c = Math.random().toString();
  var d = new SimpleClass(c);

for (var p = 0; p < 100000; p++) {
    a.push(d);
  b.push(d);
} 

subsegment.close();

//fibo(40);
console.log(event);
const response = {
    statusCode: 200,
    headers: {
        "x-custom-header": "My Header Value",
    },
    body: JSON.stringify({message: "Hello World - Memory!"
    }),
};
callback(null, response);
};

function fibo(n) { 
    if (n < 2)
        return 1;
    else   return fibo(n - 2) + fibo(n - 1);
}