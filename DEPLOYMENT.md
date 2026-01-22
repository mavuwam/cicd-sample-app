# Deployment Guide - AI Proposal Generator

## Quick Start

### Step 1: Enable AWS Bedrock Access

**CRITICAL**: You must enable Bedrock model access before deploying.

1. Open AWS Console: https://console.aws.amazon.com/bedrock
2. Click "Model access" in left sidebar
3. Click "Manage model access" button
4. Find "Claude 3 Sonnet" by Anthropic
5. Check the box next to it
6. Click "Save changes"
7. Wait for status to show "Access granted" (usually instant)

Verify access:
```bash
aws bedrock list-foundation-models \
  --by-provider anthropic \
  --query 'modelSummaries[?modelId==`anthropic.claude-3-sonnet-20240229-v1:0`]'
```

### Step 2: Deploy via Pipeline

```bash
cd sample-app

# Stage all changes
git add .

# Commit
git commit -m "Deploy AI proposal generator MVP"

# Push to trigger pipeline
git push origin main
```

### Step 3: Monitor Deployment

Watch the pipeline:
```bash
open "https://console.aws.amazon.com/codesuite/codepipeline/pipelines/github-pipeline/view?region=us-east-1"
```

Or check status:
```bash
aws codepipeline get-pipeline-state --name github-pipeline \
  --query 'stageStates[*].[stageName,latestExecution.status]' \
  --output table
```

### Step 4: Deploy Frontend

After CloudFormation completes, deploy the frontend:

```bash
# Get API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name application-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text)

# Get frontend bucket
FRONTEND_BUCKET=$(aws cloudformation describe-stacks \
  --stack-name application-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendBucket`].OutputValue' \
  --output text)

# Update and upload frontend
sed "s|API_ENDPOINT_PLACEHOLDER|$API_ENDPOINT|g" frontend/index.html > /tmp/index.html
aws s3 cp /tmp/index.html s3://$FRONTEND_BUCKET/index.html \
  --content-type "text/html" \
  --cache-control "no-cache"
```

### Step 5: Access Your App

Get the frontend URL:
```bash
aws cloudformation describe-stacks \
  --stack-name application-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendUrl`].OutputValue' \
  --output text
```

Open in browser and test!

## Deployment Timeline

- **Source Stage**: 30 seconds
- **Build Stage**: 3-5 minutes
- **Deploy Stage**: 3-5 minutes
- **Frontend Upload**: 10 seconds

**Total**: ~7-10 minutes

## Verification Steps

### 1. Check CloudFormation Stack

```bash
aws cloudformation describe-stacks \
  --stack-name application-stack \
  --query 'Stacks[0].{Status:StackStatus,Outputs:Outputs}' \
  --output table
```

Expected status: `CREATE_COMPLETE` or `UPDATE_COMPLETE`

### 2. Test Lambda Function

```bash
aws lambda invoke \
  --function-name proposal-generator-production \
  --payload '{"body":"{\"documentType\":\"proposal\",\"requirements\":\"Test\"}"}' \
  response.json

cat response.json
```

### 3. Test API Endpoint

```bash
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name application-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiEndpoint`].OutputValue' \
  --output text)

curl -X POST $API_ENDPOINT \
  -H "Content-Type: application/json" \
  -d '{"documentType":"proposal","requirements":"Create a proposal for a website redesign project"}'
```

### 4. Check Frontend

```bash
FRONTEND_URL=$(aws cloudformation describe-stacks \
  --stack-name application-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendUrl`].OutputValue' \
  --output text)

open $FRONTEND_URL
```

## Troubleshooting

### Issue: Bedrock Access Denied

**Error**: `AccessDeniedException: Could not access model`

**Solution**:
1. Enable Bedrock model access (see Step 1)
2. Wait 1-2 minutes for permissions to propagate
3. Retry the request

### Issue: Lambda Timeout

**Error**: `Task timed out after 3.00 seconds`

**Solution**: Already configured to 300 seconds in template.yaml

### Issue: CORS Error in Browser

**Error**: `Access to fetch blocked by CORS policy`

**Solution**: CORS is configured in API Gateway. Clear browser cache and retry.

### Issue: Frontend Shows API_ENDPOINT_PLACEHOLDER

**Error**: Frontend not connecting to API

**Solution**: Run Step 4 again to update frontend with correct API endpoint

### Issue: Build Fails - SAM Not Found

**Error**: `sam: command not found`

**Solution**: SAM CLI is installed in buildspec.yml. Check CodeBuild logs.

## Manual Rollback

If deployment fails:

```bash
# Rollback CloudFormation
aws cloudformation cancel-update-stack --stack-name application-stack

# Or delete and redeploy
aws cloudformation delete-stack --stack-name application-stack
aws cloudformation wait stack-delete-complete --stack-name application-stack

# Then push again to redeploy
git push origin main
```

## Cost Optimization

### Use Claude 3 Haiku (Cheaper, Faster)

Edit `src/generate-proposal.js`:
```javascript
modelId: "anthropic.claude-3-haiku-20240307-v1:0"
```

Cost comparison per 1000 requests:
- Claude 3 Sonnet: ~$30
- Claude 3 Haiku: ~$2.50

### Reduce Lambda Memory

Edit `template.yaml`:
```yaml
MemorySize: 256  # Reduce from 512
```

### Shorter Document Retention

Edit `template.yaml`:
```yaml
ExpirationInDays: 7  # Reduce from 30
```

## Monitoring

### View Lambda Logs

```bash
aws logs tail /aws/lambda/proposal-generator-production --follow
```

### View API Gateway Logs

```bash
aws logs tail /aws/apigateway/proposal-generator-api-production --follow
```

### Check Bedrock Usage

```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/Bedrock \
  --metric-name Invocations \
  --dimensions Name=ModelId,Value=anthropic.claude-3-sonnet-20240229-v1:0 \
  --start-time $(date -u -d '1 day ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum
```

## Updating the Application

### Update Lambda Code

1. Edit `src/generate-proposal.js`
2. Commit and push
3. Pipeline automatically deploys

### Update Frontend

1. Edit `frontend/index.html`
2. Commit and push
3. After pipeline completes, run Step 4 again

### Update Infrastructure

1. Edit `template.yaml`
2. Commit and push
3. CloudFormation updates automatically

## Production Checklist

Before going to production:

- [ ] Enable Bedrock model access
- [ ] Test document generation
- [ ] Set up CloudWatch alarms
- [ ] Configure SNS notifications
- [ ] Add API authentication (API Gateway API keys)
- [ ] Set up custom domain
- [ ] Enable CloudFront for frontend
- [ ] Configure backup for S3 buckets
- [ ] Review IAM permissions
- [ ] Set up cost alerts
- [ ] Document API for users
- [ ] Add rate limiting

## Next Steps

1. Test the application thoroughly
2. Customize prompts for your use case
3. Add more document types
4. Implement user authentication
5. Add PDF generation
6. Set up monitoring alerts
