import { Stack, StackProps } from "aws-cdk-lib";
import { Construct } from "constructs";
import { createArtifactBucket } from "./artifacts/artifact-bucket";
import { createInfrastructureBuildProject } from "./build/infrastructure-build-project";
import { createInfrastructureDeployRole } from "./identity/infrastructure-deploy-role";
import { createInfrastructurePipeline } from "./pipeline/infrastructure-pipeline";

interface BootstrapPipelineStackProps extends StackProps {
  envName: string;
  infrastructureRepoName: string;
  infrastructureBranchName: string;
  repositoryOwner: string;
  account: string;
  region: string;
}

export class BootstrapPipelineStack extends Stack {
  constructor(scope: Construct, id: string, props: BootstrapPipelineStackProps) {
    super(scope, id, props);
    const {
      envName,
      infrastructureRepoName,
      infrastructureBranchName,
      repositoryOwner,
      account,
      region,
    } = props;

    const infrastructureDeployRole = createInfrastructureDeployRole(this);
    const artifactBucket = createArtifactBucket(this, envName, repositoryOwner);
    const infrastructureBuildProject = createInfrastructureBuildProject(this, {
      envName,
      account,
      region,
      infrastructureDeployRole,
    });

    createInfrastructurePipeline(this, {
      envName,
      infrastructureRepoName,
      infrastructureBranchName,
      repositoryOwner,
      infrastructureDeployRole,
      artifactBucket,
      infrastructureBuildProject,
    });

  }
}
