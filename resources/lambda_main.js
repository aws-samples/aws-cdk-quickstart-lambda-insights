const { captureAsyncFunc } = require('aws-xray-sdk-core');

exports.handler = async (event) => {
  // Implement Lambda function with proper X-Ray tracing
  console.log('Event received:', JSON.stringify(event));
  
  const response = {
    statusCode: 200,
    body: JSON.stringify('Hello from Lambda Insights Demo!'),
  };
  
  return response;
};
