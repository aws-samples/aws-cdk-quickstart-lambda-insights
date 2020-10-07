import * as cdk from '@aws-cdk/core';
import * as lambda_main_service from '../lib/lambda_main_service';
import * as lambda_cpu_service from '../lib/lambda_cpu_service';
import * as lambda_memory_service from '../lib/lambda_memory_service';
import * as lambda_filesystem_service from '../lib/lambda_filesystem_service';

export class ServiceTestStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    new lambda_main_service.LambdaMain(this, 'lambdaMain');
    new lambda_cpu_service.LambdaMain(this, 'lambdaCPU');
    new lambda_memory_service.LambdaMain(this, 'lambdaMemory');
    new lambda_filesystem_service.LambdaMain(this, 'lambdaIO');
    
  }
}
