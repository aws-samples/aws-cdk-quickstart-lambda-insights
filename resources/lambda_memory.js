// Import specific AWS SDK v3 clients as needed
const { DynamoDBClient } = require('@aws-sdk/client-dynamodb');
const AWSXRay = require('aws-xray-sdk-core');

// Initialize and instrument AWS SDK v3 clients with X-Ray
const dynamoClient = AWSXRay.captureAWSv3Client(new DynamoDBClient({ region: process.env.AWS_REGION }));

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

    subsegment.close();

    console.log(event);
    return {
      statusCode: 200,
      headers: {
        "x-custom-header": "My Header Value",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Hello World - Memory!",
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