import { Duration, RemovalPolicy } from "aws-cdk-lib";
import { Construct } from "constructs";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as efs from "aws-cdk-lib/aws-efs";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as cdk from "aws-cdk-lib";
import { getLambdaInsightsLayerArn } from "./lambda_insights_layer";

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
    lambdarole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AWSLambdaVPCAccessExecutionRole')
    );
    
    // Get the Lambda Insights layer ARN for the current region
    const layerArn = getLambdaInsightsLayerArn(cdk.Stack.of(this).region);
    const layer = lambda.LayerVersion.fromLayerVersionArn(this, `LayerFromArn`, layerArn);
    
    const myVpc = new ec2.Vpc(this, 'VPC');
    
    const fileSystem = new efs.FileSystem(this, 'MyEfsFileSystem', {
      vpc: myVpc,
      encrypted: true,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS,
      performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
      removalPolicy: RemovalPolicy.DESTROY,
      throughputMode: efs.ThroughputMode.BURSTING
    });
     
     // create a new access point from the filesystem
    const accessPoint = fileSystem.addAccessPoint('AccessPoint', {
     path: '/efs',
     createAcl: {
     ownerUid: '1000',
     ownerGid: '1000',
     permissions: '777',
  },
  // enforce the POSIX identity so lambda function will access with this identity
  posixUser: {
    uid: '1000',
    gid: '1000',
  },
});

   // Create a custome security group in the newly created VPC and allow ingress and egress traffic from 0.0.0.0/0 for demo purposes     
     const securitygroup = new ec2.SecurityGroup(this, 'SecurityGroup', {vpc: myVpc,});
     securitygroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic() );

    const handler = new lambda.Function(this, "LambdaFileSystem", {
      runtime: lambda.Runtime.NODEJS_20_X,
      code: lambda.Code.fromAsset("resources"),
      handler: "lambda_filesystem.handler",
      layers: [layer],
      role: lambdarole,
      tracing: lambda.Tracing.ACTIVE,
      memorySize: 1024,
      timeout: duration,
      vpc: myVpc,
      securityGroups: [securitygroup],
      filesystem: lambda.FileSystem.fromEfsAccessPoint(accessPoint, '/mnt/lambda'),
      environment: {
        BUCKET: bucket.bucketName,
        POWERTOOLS_SERVICE_NAME: 'LambdaFileSystem'
      }
    });

    bucket.grantReadWrite(handler); // was: handler.role);

    const api = new apigateway.RestApi(this, "helloworld-api-IO", {
      restApiName: "Default API - IO",
      description: "Default API - Test Service - IO",
      deployOptions: {
        tracingEnabled: true
      }
    });

    const getLambdaIntegration = new apigateway.LambdaIntegration(handler);

    api.root.addMethod("ANY", getLambdaIntegration); 
  }
}
