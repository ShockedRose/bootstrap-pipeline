import { RemovalPolicy } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export function createArtifactBucket(scope: Construct, envName: string): Bucket {
  return new Bucket(scope, "ArtifactBucket", {
    bucketName: `shockedrose-${envName}-codepipeline-artifact-bucket`,
    removalPolicy: RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
  });
}
