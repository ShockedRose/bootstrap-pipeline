import { SecretValue } from "aws-cdk-lib";
import { PipelineProject } from "aws-cdk-lib/aws-codebuild";
import { Artifact, Pipeline } from "aws-cdk-lib/aws-codepipeline";
import {
  CodeBuildAction,
  GitHubSourceAction,
  ManualApprovalAction,
} from "aws-cdk-lib/aws-codepipeline-actions";
import { Role } from "aws-cdk-lib/aws-iam";
import { Bucket } from "aws-cdk-lib/aws-s3";
import { Construct } from "constructs";

export interface InfrastructurePipelineProps {
  readonly envName: string;
  readonly infrastructureRepoName: string;
  readonly infrastructureBranchName: string;
  readonly repositoryOwner: string;
  readonly infrastructureDeployRole: Role;
  readonly artifactBucket: Bucket;
  readonly infrastructureBuildProject: PipelineProject;
}

/** Manual approval before deploy for higher environments only. */
function requiresDeployApproval(env: string): boolean {
  return env === "staging" || env === "prod";
}

export function createInfrastructurePipeline(
  scope: Construct,
  props: InfrastructurePipelineProps
): Pipeline {
  const {
    envName,
    infrastructureRepoName,
    infrastructureBranchName,
    repositoryOwner,
    infrastructureDeployRole,
    artifactBucket,
    infrastructureBuildProject,
  } = props;
  const gitHubToken = SecretValue.secretsManager("github-token");
  const infrastructureSourceOutput = new Artifact("InfrastructureSourceOutput");

  const infraPipeline = new Pipeline(scope, "CIPipeline", {
    pipelineName: `${envName}-CI-Pipeline`,
    role: infrastructureDeployRole,
    artifactBucket,
  });

  infraPipeline.addStage({
    stageName: "Source",
    actions: [
      new GitHubSourceAction({
        owner: repositoryOwner,
        repo: infrastructureRepoName,
        actionName: "InfrastructureSource",
        branch: infrastructureBranchName,
        output: infrastructureSourceOutput,
        oauthToken: gitHubToken,
      }),
    ],
  });

  if (requiresDeployApproval(envName)) {
    infraPipeline.addStage({
      stageName: "ApproveDeployment",
      actions: [
        new ManualApprovalAction({
          actionName: "ApproveInfraDeploy",
          additionalInformation: `Approve CDK infrastructure deployment to ${envName}.`,
          role: infrastructureDeployRole,
        }),
      ],
    });
  }

  infraPipeline.addStage({
    stageName: "Deploy",
    actions: [
      new CodeBuildAction({
        actionName: "DeployCdkInfrastructure",
        project: infrastructureBuildProject,
        input: infrastructureSourceOutput,
        role: infrastructureDeployRole,
      }),
    ],
  });

  return infraPipeline;
}
