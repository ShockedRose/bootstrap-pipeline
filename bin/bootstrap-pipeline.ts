#!/usr/bin/env node
import { App } from "aws-cdk-lib";
import { BootstrapPipelineStack } from '../lib/bootstrap-pipeline-stack';

const app = new App();
const environments = ["dev", "staging", "prod"];
const deployEnvironment = app.node.tryGetContext("env");
if (!deployEnvironment || !environments.includes(deployEnvironment))
  throw new Error(
    "Please supply the env context variable: cdk deploy --context env=dev/staging/prod"
  );
const contextEnv = app.node.tryGetContext(deployEnvironment);
const infrastructureRepoName = app.node.tryGetContext("infrastructureRepoName");
const repositoryOwner = app.node.tryGetContext("repositoryOwner");

const account = (process.env.CDK_DEFAULT_ACCOUNT || process.env.AWS_ACCOUNT_ID) as string;
const region = (process.env.CDK_DEFAULT_REGION || process.env.AWS_REGION) || "us-east-1";

const stackProps = {
  ...contextEnv,
  infrastructureRepoName,
  repositoryOwner,
  account,
  region,
  env: { account, region },
  description: `Bootstrap for ${deployEnvironment}: deploys only the CodePipeline that watches the infrastructure repo and runs \`cd infrastructure && cdk deploy\`. Application pipeline and runtime resources live in InfrastructureStack.`,
};

new BootstrapPipelineStack(app, `${deployEnvironment}-Pipeline-Stack`, stackProps);
