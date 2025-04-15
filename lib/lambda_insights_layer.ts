/**
 * Helper function to get the Lambda Insights layer ARN based on region
 * Source: https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights-extension-versions.html
 */
export function getLambdaInsightsLayerArn(region: string): string {
  // Map of regions to their corresponding Lambda Insights layer ARNs (for x86_64 architecture)
  const layerArnMap: { [key: string]: string } = {
    'us-east-1': 'arn:aws:lambda:us-east-1:580247275435:layer:LambdaInsightsExtension:55',
    'us-east-2': 'arn:aws:lambda:us-east-2:580247275435:layer:LambdaInsightsExtension:55',
    'us-west-1': 'arn:aws:lambda:us-west-1:580247275435:layer:LambdaInsightsExtension:55',
    'us-west-2': 'arn:aws:lambda:us-west-2:580247275435:layer:LambdaInsightsExtension:55',
    // Add more regions as needed
  };

  // Return the ARN for the specified region, or throw an error if not found
  if (region in layerArnMap) {
    return layerArnMap[region];
  } else {
    throw new Error(`Lambda Insights layer ARN not defined for region: ${region}`);
  }
}
