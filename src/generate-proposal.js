const { BedrockRuntimeClient, InvokeModelCommand } = require("@aws-sdk/client-bedrock-runtime");
const { S3Client, PutObjectCommand } = require("@aws-sdk/client-s3");

const bedrock = new BedrockRuntimeClient({ region: process.env.AWS_REGION });
const s3 = new S3Client({ region: process.env.AWS_REGION });

exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Parse request body
    const body = JSON.parse(event.body || '{}');
    const { requirements, documentType = 'proposal' } = body;
    
    if (!requirements) {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'Content-Type',
          'Access-Control-Allow-Methods': 'POST, OPTIONS'
        },
        body: JSON.stringify({ error: 'Requirements are required' })
      };
    }
    
    // Create prompt based on document type
    const prompt = createPrompt(documentType, requirements);
    
    // Call Bedrock Claude
    const response = await bedrock.send(new InvokeModelCommand({
      modelId: "anthropic.claude-3-sonnet-20240229-v1:0",
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify({
        anthropic_version: "bedrock-2023-05-31",
        max_tokens: 4096,
        messages: [
          {
            role: "user",
            content: prompt
          }
        ]
      })
    }));
    
    // Parse Bedrock response
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    const generatedContent = responseBody.content[0].text;
    
    // Save to S3
    const timestamp = new Date().toISOString();
    const filename = `${documentType}-${Date.now()}.txt`;
    const s3Key = `generated/${filename}`;
    
    await s3.send(new PutObjectCommand({
      Bucket: process.env.DOCUMENTS_BUCKET,
      Key: s3Key,
      Body: generatedContent,
      ContentType: 'text/plain',
      Metadata: {
        documentType,
        generatedAt: timestamp
      }
    }));
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({
        success: true,
        document: generatedContent,
        s3Key: s3Key,
        filename: filename,
        generatedAt: timestamp
      })
    };
    
  } catch (error) {
    console.error('Error:', error);
    return {
      statusCode: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS'
      },
      body: JSON.stringify({ 
        error: 'Failed to generate document',
        message: error.message 
      })
    };
  }
};

function createPrompt(documentType, requirements) {
  const prompts = {
    proposal: `You are an expert business proposal writer. Create a comprehensive, professional business proposal based on the following requirements:

${requirements}

Structure the proposal with:
1. Executive Summary
2. Problem Statement
3. Proposed Solution
4. Implementation Plan
5. Timeline
6. Budget Estimate
7. Benefits and ROI
8. Conclusion

Make it professional, persuasive, and detailed. Use proper business language.`,

    tender: `You are an expert tender document writer. Create a detailed tender response document based on the following requirements:

${requirements}

Structure the tender document with:
1. Company Overview and Qualifications
2. Understanding of Requirements
3. Technical Approach
4. Methodology
5. Project Timeline
6. Resource Allocation
7. Pricing Structure
8. Terms and Conditions
9. References and Past Performance

Make it comprehensive, compliant, and competitive. Use formal tender language.`
  };
  
  return prompts[documentType] || prompts.proposal;
}
