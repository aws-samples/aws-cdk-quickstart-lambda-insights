import * as core from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3 from "@aws-cdk/aws-s3";
import * as efs from "@aws-cdk/aws-efs";
import * as ec2 from "@aws-cdk/aws-ec2";
import * as iam from "@aws-cdk/aws-iam";

export class LambdaMain extends core.Construct {
  constructor(scope: core.Construct, id: string) {
    super(scope, id);

    const bucket = new s3.Bucket(this, "LambdaStore", {
      removalPolicy: core.RemovalPolicy.DESTROY,
    });
    
    const duration = core.Duration.seconds(900);
    const lambdarole = new iam.Role(this, "lambdaRole", {assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com')});
    lambdarole.addManagedPolicy({managedPolicyArn: 'arn:aws:iam::aws:policy/CloudWatchLambdaInsightsExecutionRolePolicy'});
    lambdarole.addManagedPolicy({managedPolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole'});
    lambdarole.addManagedPolicy({managedPolicyArn: 'arn:aws:iam::aws:policy/service-role/AWSLambdaVPCAccessExecutionRole'});
    

    const layerArn = "arn:aws:lambda:"+ process.env.CDK_DEFAULT_REGION +":580247275435:layer:LambdaInsightsExtension:2";    
    const layer = lambda.LayerVersion.fromLayerVersionArn(this, `LayerFromArn`, layerArn);

    
    const myVpc = new ec2.Vpc(this, 'VPC');
    
    const fileSystem = new efs.FileSystem(this, 'MyEfsFileSystem', {
     vpc: myVpc,
     encrypted: true,
     lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS,
     performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
     removalPolicy: core.RemovalPolicy.DESTROY,
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
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset("resources"),
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
        BUCKET: bucket.bucketName
      }
    });

    bucket.grantReadWrite(handler); // was: handler.role);

    const api = new apigateway.RestApi(this, "helloworld-api-IO", {
      restApiName: "Default API - IO",
      description: "Default API - Test Service - IO"
    });

    const getLambdaIntegration = new apigateway.LambdaIntegration(handler);

    api.root.addMethod("ANY", getLambdaIntegration); 
  }
}