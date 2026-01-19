# Sample CI/CD Application

This is a sample application that demonstrates the GitHub to AWS multi-account CI/CD pipeline.

## What This Does

This application deploys a simple AWS Lambda function that returns "Hello World" when invoked.

## Files

- **buildspec.yml** - Build instructions for AWS CodeBuild
- **template.yaml** - CloudFormation template that deploys the Lambda function
- **package.json** - Node.js package configuration

## Pipeline Flow

1. **Source**: Code is pulled from GitHub
2. **Build**: CodeBuild runs the build and tests
3. **Deploy**: Lambda function is deployed to both AWS accounts

## Testing Locally

```bash
# Install dependencies
npm install

# Run build
npm run build

# Run tests
npm test

# Validate CloudFormation template
aws cloudformation validate-template --template-body file://template.yaml
```

## Deployed Resources

When deployed, this creates:
- AWS Lambda Function (hello-world-{environment})
- IAM Role for Lambda execution
- CloudWatch Log Group

## Environment

The Lambda function accepts an `Environment` parameter:
- development
- staging
- production (default)
