import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as iam from "aws-cdk-lib/aws-iam";
import * as ssm from "aws-cdk-lib/aws-ssm";

export class LambdaMain extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);

    const bucket = new s3.Bucket(this, "LambdaStore", {
      removalPolicy: RemovalPolicy.DESTROY,
      encryption: s3.BucketEncryption.S3_MANAGED,
      autoDeleteObjects: true
    });
    
    const duration = Duration.seconds(300);
    
    const lambdarole = new iam.Role(this, "lambdaRole", {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')
    });
    lambdarole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('CloudWatchLambdaInsightsExecutionRolePolicy')
    );
    lambdarole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaBasicExecutionRole')
    );
    
    // Use SSM parameter for latest Lambda Insights layer
    const layerArn = ssm.StringParameter.valueForStringParameter(
      this,
      '/aws/service/aws-lambda-insights/extension/default'
    );
    const layer = lambda.LayerVersion.fromLayerVersionArn(this, `LayerFromArn`, layerArn);

    const handler = new lambda.Function(this, "LambdaCPU", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("resources"),
      handler: "lambda_cpu.handler",
      layers: [layer],
      role: lambdarole,
      tracing: lambda.Tracing.ACTIVE,
      memorySize: 256,
      timeout: duration,
      environment: {
        BUCKET: bucket.bucketName,
        POWERTOOLS_SERVICE_NAME: 'LambdaCPU',
        POWERTOOLS_METRICS_NAMESPACE: 'LambdaInsightsDemo'
      }
    });

    bucket.grantReadWrite(handler); // was: handler.role);

    const api = new apigateway.RestApi(this, "helloworld-api-cpu", {
      restApiName: "Default API - CPU ",
      description: "Default API - Test Service - CPU",
      deployOptions: {
        tracingEnabled: true
      }
    });

    const getLambdaIntegration = new apigateway.LambdaIntegration(handler);

    api.root.addMethod("ANY", getLambdaIntegration); 
  }
}