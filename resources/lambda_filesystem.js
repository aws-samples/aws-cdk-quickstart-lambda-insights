const AWS = require('aws-sdk');
const AWSXRay = require('aws-xray-sdk-core');
const fs = require('fs');
const uniqueFilename = require('unique-filename');

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

// Code to generate IO activity. Start by writing one sample file to disk
fs.writeFile("/tmp/test", "Hey there!", function(err) {
    if(err) {
        return console.log(err);
    }

    console.log("The file was saved!");
});

const output_a = a.join("\n");
const output_b = b.join("\n");

// write the output_b to the EFS 50 times

for (var q = 0; q < 50; q++) {
     
     var randomfileA = uniqueFilename('/mnt/lambda', 'testingA');
     var randomfileB = uniqueFilename('/mnt/lambda', 'testingB');
     
     fs.writeFile(randomfileA, output_a, function(err) {
    if(err) {
        return console.log(err);
    }

});

     fs.writeFile(randomfileB, output_b, function(err) {
    if(err) {
        return console.log(err);
    }

});
 

}

subsegment.close();

console.log("The array b was saved on EFS 50 times !");
// Code block to show CPU usage during lambda execution. We are performing an operation which takes time and CPU cycles.

//fibo(40);
console.log(event);
const response = {
    statusCode: 200,
    headers: {
        "x-custom-header": "My Header Value",
    },
    body: JSON.stringify({message: "Hello World - Lambda EFS!"
    }),
};
callback(null, response);
};

function fibo(n) { 
    if (n < 2)
        return 1;
    else   return fibo(n - 2) + fibo(n - 1);
}