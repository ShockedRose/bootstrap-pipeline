import {
  CompositePrincipal,
  PolicyDocument,
  PolicyStatement,
  Role,
  ServicePrincipal,
} from "aws-cdk-lib/aws-iam";
import { Construct } from "constructs";

export function createInfrastructureDeployRole(scope: Construct): Role {
  return new Role(scope, "InfrastructureDeployRole", {
    assumedBy: new CompositePrincipal(
      new ServicePrincipal("codebuild.amazonaws.com"),
      new ServicePrincipal("codepipeline.amazonaws.com")
    ),
    inlinePolicies: {
      CdkDeployPermissions: new PolicyDocument({
        statements: [
          new PolicyStatement({
            actions: ["sts:AssumeRole"],
            resources: ["arn:aws:iam::*:role/cdk-*"],
          }),
          new PolicyStatement({
            actions: [
              "ec2:*",
              "iam:*",
              "ssm:*",
              "s3:*",
              "cloudformation:*",
              "apigateway:*",
              "lambda:*",
              "ecr:*",
              "ecs:*",
              "elasticloadbalancing:*",
              "logs:*",
              "codedeploy:*",
              "codepipeline:*",
              "codebuild:*",
              "secretsmanager:GetSecretValue",
            ],
            resources: ["*"],
          }),
        ],
      }),
    },
  });
}
