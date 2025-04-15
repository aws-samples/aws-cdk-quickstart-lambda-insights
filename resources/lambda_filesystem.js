// Import specific AWS SDK v3 clients as needed
const { S3Client } = require('@aws-sdk/client-s3');
const AWSXRay = require('aws-xray-sdk-core');
const fs = require('fs');
const uniqueFilename = require('unique-filename');
const { promisify } = require('util');

// Convert fs methods to promises
const writeFileAsync = promisify(fs.writeFile);

// Initialize and instrument AWS SDK v3 clients with X-Ray
const s3Client = AWSXRay.captureAWSv3Client(new S3Client({ region: process.env.AWS_REGION }));

exports.handler = async function(event, context) {
    
  const segment = AWSXRay.getSegment();
  const subsegment = segment.addNewSubsegment("ExpensiveCode");
  
  try {
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
    await writeFileAsync("/tmp/test", "Hey there!");
    console.log("The file was saved!");

    const output_a = a.join("\n");
    const output_b = b.join("\n");

    // write the output_b to the EFS 50 times
    const writePromises = [];
    for (var q = 0; q < 50; q++) {
      var randomfileA = uniqueFilename('/mnt/lambda', 'testingA');
      var randomfileB = uniqueFilename('/mnt/lambda', 'testingB');
      
      writePromises.push(writeFileAsync(randomfileA, output_a));
      writePromises.push(writeFileAsync(randomfileB, output_b));
    }

    await Promise.all(writePromises);
    console.log("The array b was saved on EFS 50 times!");

    subsegment.close();

    return {
      statusCode: 200,
      headers: {
        "x-custom-header": "My Header Value",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Hello World - Lambda EFS!",
        timestamp: new Date().toISOString()
      }),
    };
  } catch (error) {
    subsegment.addError(error);
    subsegment.close();
    throw error;
  }
};

function fibo(n) { 
  if (n < 2)
    return 1;
  else   
    return fibo(n - 2) + fibo(n - 1);
}