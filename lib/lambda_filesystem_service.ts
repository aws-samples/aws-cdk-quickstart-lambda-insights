import * as core from "@aws-cdk/core";
import * as apigateway from "@aws-cdk/aws-apigateway";
import * as lambda from "@aws-cdk/aws-lambda";
import * as s3 from "@aws-cdk/aws-s3";
import * as efs from "@aws-cdk/aws-efs";
import * as ec2 from "@aws-cdk/aws-ec2";

export class LambdaMain extends core.Construct {
  constructor(scope: core.Construct, id: string) {
    super(scope, id);

    const bucket = new s3.Bucket(this, "LambdaStore");
    
    const duration = core.Duration.seconds(900);

    const layerArn = `arn:aws:lambda:us-west-2:907985872988:layer:LambdaInsightsExtensionBeta:1`;
    const layer = lambda.LayerVersion.fromLayerVersionArn(this, `LayerFromArn`, layerArn);
    
    const myVpc = new ec2.Vpc(this, 'VPC');
    
    const fileSystem = new efs.FileSystem(this, 'MyEfsFileSystem', {
     vpc: myVpc,
     encrypted: true,
     lifecyclePolicy: efs.LifecyclePolicy.AFTER_14_DAYS,
     performanceMode: efs.PerformanceMode.GENERAL_PURPOSE,
     throughputMode: efs.ThroughputMode.BURSTING
     });
     
     // create a new access point from the filesystem
    const accessPoint = fileSystem.addAccessPoint('AccessPoint', {
  // set /export/lambda as the root of the access point
     path: '/export/lambda',
  // as /export/lambda does not exist in a new efs filesystem, the efs will create the directory with the following createAcl
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

    const handler = new lambda.Function(this, "LambdaFileSystem", {
      runtime: lambda.Runtime.NODEJS_12_X,
      code: lambda.Code.asset("resources"),
      handler: "lambda_filesystem.handler",
      layers: [layer],
      timeout: duration,
      vpc: myVpc,
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