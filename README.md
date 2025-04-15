# AWS CDK QuickStart: Lambda Insights (Updated 2025)

This project demonstrates how to implement AWS CloudWatch Lambda Insights with modern AWS CDK v2 and Node.js 20. Lambda Insights is an extension that collects system-level metrics from Lambda functions, enabling detailed performance monitoring and troubleshooting.

## Architecture

This CDK project deploys four Lambda functions with different characteristics to demonstrate Lambda Insights capabilities:

1. **Main Lambda** - A standard API endpoint
2. **CPU-intensive Lambda** - Demonstrates CPU utilization metrics
3. **Memory-intensive Lambda** - Shows memory consumption patterns
4. **Filesystem I/O Lambda** - Illustrates filesystem operations impact

Each Lambda function is exposed through API Gateway endpoints and configured with Lambda Insights monitoring.

![Architecture](/images/architecture.png)

## Key Features

- **Modern Stack**: AWS CDK v2 with TypeScript and Node.js 20 runtime
- **Enhanced Observability**: CloudWatch Lambda Insights with X-Ray tracing
- **Security Best Practices**: S3 encryption, proper IAM permissions
- **Performance Optimized**: Right-sized memory allocation and timeouts
- **Auto-updating**: Uses SSM parameter for latest Lambda Insights layer

## Prerequisites

- AWS CLI configured with appropriate permissions
- Node.js 18.x or later
- AWS CDK v2 installed (`npm install -g aws-cdk`)

## Setup and Deployment

1. Clone the repository:
   ```bash
   git clone https://github.com/aws-samples/aws-cdk-quickstart-lambda-insights.git
   cd aws-cdk-quickstart-lambda-insights
   ```

2. Install dependencies:
   ```bash
   npm install
   cd resources && npm install && cd ..
   ```

3. Deploy the stack:
   ```bash
   cdk bootstrap
   cdk synth
   cdk deploy
   ```

4. After deployment, note the API endpoints from the CloudFormation outputs:
   ![CloudFormation](/images/CloudFormation-outputs.png)

## Setting Up CloudWatch Synthetics

To generate traffic and metrics for Lambda Insights, set up CloudWatch Synthetics Canaries:

1. Navigate to CloudWatch console > Synthetics > Canaries
2. Create a new Canary for each API endpoint (follow [AWS documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries_Create.html))
3. Configure each Canary to run every minute
4. After setup, your Canaries should appear as shown:
   ![CloudWatch Synthetics](/images/CloudWatch-Synthetics.png)

## Viewing Lambda Insights

1. Go to CloudWatch console
2. Navigate to Lambda Insights > Multi-Function view
3. You'll see metrics for all four Lambda functions:
   ![CloudWatch-Lambda](/images/CloudWatch-Lambda.png)

## Key Metrics Available

- **Memory Usage**: Track memory utilization and detect potential leaks
- **CPU Usage**: Monitor CPU performance and identify bottlenecks
- **Initialization Duration**: Measure cold start times
- **Invocation Duration**: Track overall function execution time
- **Network I/O**: Monitor network traffic
- **Disk I/O**: Track filesystem operations
- **Errors and Exceptions**: Identify and troubleshoot issues

## Key Improvements in 2025 Update

- Upgraded to CDK v2 from CDK v1
- Updated Node.js runtime from 12.x to 20.x
- Using SSM parameter for latest Lambda Insights layer instead of hardcoded ARN
- Improved X-Ray tracing implementation
- Enhanced security with S3 bucket encryption
- Increased Lambda memory from 128MB to 256MB
- Added proper async/await pattern in Lambda code
- Reduced timeout from 15 minutes to 5 minutes
- Added API Gateway tracing

## Cleanup

To avoid incurring charges, delete the resources when you're done:

1. Delete the CloudWatch Synthetics Canaries
   ```bash
   # Navigate to CloudWatch Synthetics console and delete each Canary
   ```

2. Delete the CDK stack
   ```bash
   cdk destroy
   ```

## Troubleshooting

- **Lambda Insights not showing data**: Ensure the Lambda functions have been invoked at least once
- **Missing permissions**: Check IAM roles for CloudWatchLambdaInsightsExecutionRolePolicy
- **Canary failures**: Verify API endpoints are correct and accessible

## Additional Resources

- [Lambda Insights Documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/Lambda-Insights.html)
- [AWS CDK Documentation](https://docs.aws.amazon.com/cdk/latest/guide/home.html)
- [CloudWatch Synthetics Documentation](https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries.html)

## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.
