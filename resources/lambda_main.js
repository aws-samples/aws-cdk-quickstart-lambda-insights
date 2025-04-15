exports.handler = async function(event, context) {
  console.log('Lambda invoked: Hello World');
  
  // Simple Hello World response
  const response = {
    statusCode: 200,
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      message: "Hello World"
    }),
  };
  
  return response;
};
