import {
  BuildSpec,
  LinuxBuildImage,
  PipelineProject,
} from "aws-cdk-lib/aws-codebuild";
import { Role } from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export interface InfrastructureBuildProjectProps {
  readonly envName: string;
  readonly account: string;
  readonly region: string;
  readonly infrastructureDeployRole: Role;
}

export function createInfrastructureBuildProject(
  scope: Construct,
  props: InfrastructureBuildProjectProps
): PipelineProject {
  const { envName, account, region, infrastructureDeployRole } = props;

  return new PipelineProject(scope, "InfrastructureProject", {
    role: infrastructureDeployRole,
    environment: {
      buildImage: LinuxBuildImage.AMAZON_LINUX_2_5,
    },
    environmentVariables: {
      DEPLOY_ENVIRONMENT: {
        value: envName,
      },
      AWS_ACCOUNT_ID: {
        value: account,
      },
      AWS_REGION: {
        value: region,
      },
    },
    buildSpec: BuildSpec.fromObject({
      version: "0.2",
      phases: {
        install: {
          "runtime-versions": {
            nodejs: "20.x",
          },
          commands: [
            "npm install -g aws-cdk",
            "npm ci",
          ],
        },
        build: {
          commands: [
            `cdk deploy --context env=${envName} --require-approval never`,
          ],
        },
      },
    }),
  });
}
