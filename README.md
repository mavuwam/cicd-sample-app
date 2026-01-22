# AI-Powered Business Proposal Generator

An intelligent web application that generates professional business proposals and tender documents using AWS Bedrock (Claude AI).

## Features

- 🤖 **AI-Powered Generation**: Uses Claude 3 Sonnet for high-quality document generation
- 📄 **Multiple Document Types**: Business proposals and tender documents
- ⚡ **Serverless Architecture**: Fully serverless using AWS Lambda and API Gateway
- 🔒 **Secure**: Documents stored in encrypted S3 buckets
- 🚀 **CI/CD Pipeline**: Automated deployment through AWS CodePipeline
- 💰 **Cost-Effective**: Pay only for what you use

## Architecture

```
User Browser
    ↓
S3 Static Website (Frontend)
    ↓
API Gateway
    ↓
Lambda Function
    ↓
AWS Bedrock (Claude 3)
    ↓
S3 Bucket (Generated Documents)
```

## AWS Services Used

- **AWS Lambda**: Serverless compute for API backend
- **API Gateway**: RESTful API endpoint
- **AWS Bedrock**: Claude 3 Sonnet AI model
- **S3**: Static website hosting and document storage
- **CloudWatch**: Logging and monitoring
- **CodePipeline**: CI/CD automation
- **CodeBuild**: Build automation
- **CloudFormation**: Infrastructure as Code

## Prerequisites

- AWS Account with Bedrock access enabled
- AWS Bedrock model access for Claude 3 Sonnet
- GitHub repository (already configured)
- CI/CD pipeline (already deployed)

## Enabling AWS Bedrock

Before deploying, you need to enable Bedrock model access:

1. Go to AWS Console → Bedrock
2. Navigate to "Model access" in the left sidebar
3. Click "Manage model access"
4. Enable "Claude 3 Sonnet" by Anthropic
5. Submit the request (usually instant approval)

## Deployment

The application deploys automatically through the CI/CD pipeline:

```bash
# Commit and push changes
git add .
git commit -m "Deploy AI proposal generator"
git push origin main
```

The pipeline will:
1. Pull code from GitHub
2. Build the Lambda function
3. Package with SAM
4. Deploy CloudFormation stack
5. Upload frontend to S3

## Manual Deployment (Optional)

```bash
# Build
sam build

# Deploy
sam deploy --guided
```

## Usage

After deployment, get the frontend URL:

```bash
aws cloudformation describe-stacks \
  --stack-name application-stack \
  --query 'Stacks[0].Outputs[?OutputKey==`FrontendUrl`].OutputValue' \
  --output text
```

Visit the URL and:
1. Select document type (Proposal or Tender)
2. Enter your requirements
3. Click "Generate Document"
4. Wait 10-30 seconds for AI generation
5. Download the generated document

## API Endpoint

### POST /generate

Generate a business proposal or tender document.

**Request:**
```json
{
  "documentType": "proposal",
  "requirements": "Create a proposal for a mobile app development project..."
}
```

**Response:**
```json
{
  "success": true,
  "document": "EXECUTIVE SUMMARY\n\n...",
  "s3Key": "generated/proposal-1234567890.txt",
  "filename": "proposal-1234567890.txt",
  "generatedAt": "2026-01-22T16:30:00.000Z"
}
```

## Cost Estimate

Monthly costs for moderate usage (100 documents/month):

- Lambda: ~$0.20 (100 invocations × 30s each)
- API Gateway: ~$0.35 (100 requests)
- Bedrock: ~$3.00 (100 requests × ~1000 tokens)
- S3: ~$0.10 (storage + requests)
- CloudWatch: ~$0.50 (logs)

**Total**: ~$4-5/month

## Monitoring

View logs:
```bash
aws logs tail /aws/lambda/proposal-generator-production --follow
```

View metrics in CloudWatch Dashboard:
- Lambda invocations
- API Gateway requests
- Error rates
- Duration

## Customization

### Change AI Model

Edit `src/generate-proposal.js`:
```javascript
modelId: "anthropic.claude-3-haiku-20240307-v1:0"  // Faster, cheaper
// or
modelId: "anthropic.claude-3-sonnet-20240229-v1:0"  // Better quality
```

### Modify Prompts

Edit the `createPrompt()` function in `src/generate-proposal.js` to customize document structure and style.

### Add Document Types

Add new document types in the `createPrompt()` function:
```javascript
const prompts = {
  proposal: "...",
  tender: "...",
  rfp: "...",  // Add new type
  quote: "..."  // Add new type
};
```

## Troubleshooting

### Bedrock Access Denied
- Ensure Bedrock model access is enabled in your AWS account
- Check IAM permissions for Lambda function

### CORS Errors
- API Gateway CORS is configured automatically
- Check browser console for specific errors

### Slow Generation
- Claude 3 Sonnet takes 10-30 seconds
- Consider using Claude 3 Haiku for faster responses

### Frontend Not Loading
- Check S3 bucket policy allows public read
- Verify frontend was deployed after CloudFormation stack

## Security

- All S3 buckets use encryption at rest
- API Gateway uses HTTPS only
- Generated documents expire after 30 days
- No authentication required (add API keys for production)

## Future Enhancements

- [ ] User authentication (Cognito)
- [ ] Document templates
- [ ] PDF generation
- [ ] Email delivery
- [ ] Document history
- [ ] Multi-language support
- [ ] Custom branding

## License

MIT

## Support

For issues or questions, check:
- CloudWatch Logs for Lambda errors
- API Gateway execution logs
- CloudFormation stack events
