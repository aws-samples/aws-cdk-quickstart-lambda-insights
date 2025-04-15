exports.handler = async function(event, context) {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Simulate some work
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const response = {
      statusCode: 200,
      headers: {
        "x-custom-header": "My Header Value",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Hello World!",
        timestamp: new Date().toISOString(),
        requestId: context.awsRequestId
      }),
    };
    
    return response;
  } catch (error) {
    console.error('Error:', error);
    
    return {
      statusCode: 500,
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        message: "Internal Server Error",
        error: error.message
      }),
    };
  }
};
