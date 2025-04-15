#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { ServiceTestStack } from '../lib/service_test-stack';

const app = new cdk.App();
new ServiceTestStack(app, 'ServiceTestStack', { 
  env: { 
    account: process.env.CDK_DEFAULT_ACCOUNT, 
    region: process.env.CDK_DEFAULT_REGION 
  },
  description: 'AWS Lambda Insights Demo Stack (Updated 2025)'
});
