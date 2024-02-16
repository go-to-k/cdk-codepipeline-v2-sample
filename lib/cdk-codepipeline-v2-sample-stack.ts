import * as cdk from 'aws-cdk-lib';
import { Artifact, Pipeline, PipelineType, Variable } from 'aws-cdk-lib/aws-codepipeline';
import { S3DeployAction, S3SourceAction } from 'aws-cdk-lib/aws-codepipeline-actions';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export class CdkCodepipelineV2SampleStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const sourceBucket = new Bucket(this, 'PipelineBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    const sourceOutput = new Artifact('SourceArtifact');
    const sourceAction = new S3SourceAction({
      actionName: 'Source',
      output: sourceOutput,
      bucket: sourceBucket,
      bucketKey: 'key',
    });
    
    const deployBucket = new Bucket(this, 'DeployBucket', {
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
    
    const variable = new Variable({
      variableName: 'bucket-var',
      description: 'description',
      defaultValue: 'sample',
    });
    
    new Pipeline(this, 'Pipeline', {
      artifactBucket: sourceBucket,
      pipelineType: PipelineType.V2,
      variables: [variable],
      stages: [
        {
          stageName: 'Source',
          actions: [sourceAction],
        },
        {
          stageName: 'Deploy',
          actions: [
            new S3DeployAction({
              actionName: 'DeployAction',
              extract: false,
              objectKey: `${variable.reference()}.txt`,
              input: sourceOutput,
              bucket: deployBucket,
            }),
          ],
        },
      ],
    });
  }
}