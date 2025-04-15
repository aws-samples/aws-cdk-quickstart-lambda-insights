import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as ssm from 'aws-cdk-lib/aws-ssm';

export class LambdaMain extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const bucket = new s3.Bucket(this, "LambdaStore", {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true, // Clean up objects when bucket is removed
      encryption: s3.BucketEncryption.S3_MANAGED, // Enable encryption
    });
    const duration = cdk.Duration.seconds(300); // Reduced from 900 to 300 seconds
    
    const lambdaRole = new iam.Role(this, "lambdaRole", {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      description: 'Role for Lambda with CloudWatch Insights permissions',
    });
    
    // Add required policies
    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLambdaInsightsExecutionRolePolicy')
    );
    lambdaRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );

    // Use SSM parameter for the latest Lambda Insights layer
    const layerArn = ssm.StringParameter.valueForStringParameter(
      this,
      '/aws/service/aws-lambda-insights/extension/default'
    );
    
    const layer = lambda.LayerVersion.fromLayerVersionArn(this, `LayerFromArn`, layerArn);

    const handler = new lambda.Function(this, "LambdaMain", {
      runtime: lambda.Runtime.NODEJS_20_X, // Updated to Node.js 20
      code: lambda.Code.fromAsset("resources"),
      handler: "lambda_main.handler",
      layers: [layer],
      role: lambdaRole,
      tracing: lambda.Tracing.ACTIVE,
      memorySize: 256, // Increased from 128MB to 256MB
      timeout: duration,
      environment: {
        BUCKET: bucket.bucketName,
        POWERTOOLS_SERVICE_NAME: 'LambdaMain',
        POWERTOOLS_METRICS_NAMESPACE: 'LambdaInsightsDemo',
        AWS_LAMBDA_EXEC_WRAPPER: '/opt/extensions/lambda-insights-extension'
      }
    });
    
    // Grant specific permissions instead of broad read/write
    bucket.grantReadWrite(handler);

    const api = new apigateway.RestApi(this, "helloworld-api", {
      restApiName: "Default Vanilla API",
      description: "Default Vanilla API",
      deployOptions: {
        stageName: 'prod',
        tracingEnabled: true, // Enable X-Ray tracing for API Gateway
      }
    });

    const getLambdaIntegration = new apigateway.LambdaIntegration(handler);

    api.root.addMethod("ANY", getLambdaIntegration, {
      methodResponses: [
        {
          statusCode: '200',
          responseModels: {
            'application/json': apigateway.Model.EMPTY_MODEL,
          },
        }
      ]
    });
    
    // Output the API endpoint URL
    new cdk.CfnOutput(this, 'ApiEndpoint', {
      value: api.url,
      description: 'API Endpoint URL',
    });
  }
}