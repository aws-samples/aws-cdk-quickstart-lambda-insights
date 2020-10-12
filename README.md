# CDK TypeScript project for Lambda Insights.

<br />
<br />

## Setup Stack

 * `git clone`   Clone the git repo
 * `npm install` Install node depedencies and packages
 * `cd resources && npm install` Install node depedencies and packages in resources directory
 * `cdk bootstrap`   CDK Bootstrapping
 * `cdk synth`       Emits the synthesized CloudFormation template
 * `cdk deploy`      Deploy the Stack

<br />
<br />

The cdk will deploy below architecture.
<br />
![Architecture](/images/architecture.png)
<br />
Go to the Cloudformation console and search for ServiceTestStack and check Outputs. Take a note of the 4 API end points.  To generate data for lambda insights, we will use CloudWatch synthetics to make call to each API endpoint every minute.
<br />
![CloudFormation](/images/CloudFormation-outputs.png)
<br />
Setup CloudWatch Synthetics Canaries to call the API end points every minute. The instructions to create a Canary are mentioned at https://docs.aws.amazon.com/AmazonCloudWatch/latest/monitoring/CloudWatch_Synthetics_Canaries_Create.html.
Once the 4 canaries are setup for each API End point, they should look like below-
<br />
![CloudWatch Synthetics](/images/CloudWatch-Synthetics.png)
<br />
We can go ahead and start looking at lambda insights in CloudWatch. To do this, go to CloudWatch and click on Multi-Function under Lambda Insights. Here, we can observe metrics for the four lambda functions which were created by the cdk.
<br />
![CloudWatch-Lambda](/images/CloudWatch-Lambda.png)
<br />
<br />
# Deleting/Destroying the Stack
<br />
 * `cdk destroy`
 * `Delete the Canaries in CloudWatch Synthetics`
