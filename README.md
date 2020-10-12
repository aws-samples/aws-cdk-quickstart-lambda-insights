# CDK TypeScript project for Lambda Insights.


## Setup Stack

```
$ git clone https://git-codecommit.us-west-2.amazonaws.com/v1/repos/aws-cdk-quickstart-lambda-insights  (this will be changed to aws-samples public link before being published out)
$ npm install 
$ cd resources && npm install 
$ cdk bootstrap   
$ cdk synth       
$ cdk deploy      
```

The cdk will deploy below architecture.

![Architecture](/images/architecture.png)

Go to the Cloudformation console and search for ServiceTestStack and check Outputs. Take a note of the 4 API end points.  To generate data for lambda insights, we will use CloudWatch synthetics to make call to each API endpoint every minute.

![CloudFormation](/images/CloudFormation-outputs.png)

Setup CloudWatch Synthetics Canaries to call the API end points every minute. The instructions to create a Canary are mentioned at https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries_Create.html.
Once the 4 canaries are setup for each API End point, they should look like below-

![CloudWatch Synthetics](/images/CloudWatch-Synthetics.png)

We can go ahead and start looking at lambda insights in CloudWatch. To do this, go to CloudWatch and click on Multi-Function under Lambda Insights. Here, we can observe metrics for the four lambda functions which were created by the cdk.
![CloudWatch-Lambda](/images/CloudWatch-Lambda.png)

# Deleting/Destroying the Stack

```
$ cdk destroy
```

Delete the Canaries in CloudWatch Synthetics
