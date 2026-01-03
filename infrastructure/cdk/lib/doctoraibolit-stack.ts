import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2Integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import { Construct } from 'constructs';
import * as path from 'path';

export class DoctorAibolitStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // DynamoDB Tables (separate from AnxietyChatAI)
    const visitorsTable = new dynamodb.Table(this, 'VisitorsTable', {
      tableName: 'DoctorAibolitVisitors',
      partitionKey: { name: 'VisitorId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const chatSessionsTable = new dynamodb.Table(this, 'ChatSessionsTable', {
      tableName: 'DoctorAibolitChatSessions',
      partitionKey: { name: 'VisitorId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SessionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const chatMessagesTable = new dynamodb.Table(this, 'ChatMessagesTable', {
      tableName: 'DoctorAibolitChatMessages',
      partitionKey: { name: 'SessionId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'Timestamp', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const contactMessagesTable = new dynamodb.Table(this, 'ContactMessagesTable', {
      tableName: 'DoctorAibolitContactMessages',
      partitionKey: { name: 'MessageId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const pricingConfigTable = new dynamodb.Table(this, 'PricingConfigTable', {
      tableName: 'DoctorAibolitPricingConfig',
      partitionKey: { name: 'ConfigId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const pricingPlansTable = new dynamodb.Table(this, 'PricingPlansTable', {
      tableName: 'DoctorAibolitPricingPlans',
      partitionKey: { name: 'PlanId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const visitorSessionsTable = new dynamodb.Table(this, 'VisitorSessionsTable', {
      tableName: 'DoctorAibolitVisitorSessions',
      partitionKey: { name: 'VisitorId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'SessionDate', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const paymentHistoryTable = new dynamodb.Table(this, 'PaymentHistoryTable', {
      tableName: 'DoctorAibolitPaymentHistory',
      partitionKey: { name: 'PaymentId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'VisitorId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const emailVisitorMappingTable = new dynamodb.Table(this, 'EmailVisitorMappingTable', {
      tableName: 'DoctorAibolitEmailVisitorMapping',
      partitionKey: { name: 'Email', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'VisitorId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // S3 Bucket for OG Images
    const ogImagesBucket = new s3.Bucket(this, 'OgImagesBucket', {
      bucketName: 'doctoraibolit-og-images',
      publicReadAccess: true,
      blockPublicAccess: new s3.BlockPublicAccess({
        blockPublicAcls: false,
        blockPublicPolicy: false,
        ignorePublicAcls: false,
        restrictPublicBuckets: false,
      }),
      cors: [
        {
          allowedOrigins: ['*'],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedHeaders: ['*'],
        },
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    // Secrets Manager - Reference existing secret (not creating it)
    const secret = secretsmanager.Secret.fromSecretNameV2(
      this,
      'AppSecret',
      'doctoraibolit'
    );

    // Lambda Function
    // Use pre-built binaries from backend/bin/Release/net8.0
    const backendBuildPath = path.join(__dirname, '../../../backend/bin/Release/net8.0');
    const lambdaFunction = new lambda.Function(this, 'DoctorAibolitApi', {
      runtime: lambda.Runtime.DOTNET_8,
      handler: 'DoctorAIBolit.Api::DoctorAIBolit.LambdaEntryPoint::FunctionHandlerAsync',
      code: lambda.Code.fromAsset(backendBuildPath),
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        DYNAMODB_TABLE_VISITORS: visitorsTable.tableName,
        DYNAMODB_TABLE_CHAT_SESSIONS: chatSessionsTable.tableName,
        DYNAMODB_TABLE_CHAT_MESSAGES: chatMessagesTable.tableName,
        DYNAMODB_TABLE_CONTACT_MESSAGES: contactMessagesTable.tableName,
        DYNAMODB_TABLE_PRICING_CONFIG: pricingConfigTable.tableName,
        DYNAMODB_TABLE_PRICING_PLANS: pricingPlansTable.tableName,
        DYNAMODB_TABLE_VISITOR_SESSIONS: visitorSessionsTable.tableName,
        DYNAMODB_TABLE_PAYMENT_HISTORY: paymentHistoryTable.tableName,
        DYNAMODB_TABLE_EMAIL_VISITOR_MAPPING: emailVisitorMappingTable.tableName,
        S3_BUCKET_OG_IMAGES: ogImagesBucket.bucketName,
        SES_FROM_EMAIL: 'noreply@doctoraibolit.com',
        SES_ADMIN_EMAIL: 'admin@doctoraibolit.com',
      },
    });

    // Grant DynamoDB permissions
    visitorsTable.grantReadWriteData(lambdaFunction);
    chatSessionsTable.grantReadWriteData(lambdaFunction);
    chatMessagesTable.grantReadWriteData(lambdaFunction);
    contactMessagesTable.grantReadWriteData(lambdaFunction);
    pricingConfigTable.grantReadWriteData(lambdaFunction);
    pricingPlansTable.grantReadWriteData(lambdaFunction);
    visitorSessionsTable.grantReadWriteData(lambdaFunction);
    paymentHistoryTable.grantReadWriteData(lambdaFunction);
    emailVisitorMappingTable.grantReadWriteData(lambdaFunction);

    // Grant S3 permissions
    ogImagesBucket.grantReadWrite(lambdaFunction);

    // Grant Secrets Manager permissions
    secret.grantRead(lambdaFunction);

    // Grant SES permissions
    lambdaFunction.addToRolePolicy(
      new iam.PolicyStatement({
        effect: iam.Effect.ALLOW,
        actions: ['ses:SendEmail', 'ses:SendRawEmail'],
        resources: ['*'],
      })
    );

    // HTTP API Gateway
    const httpApi = new apigatewayv2.HttpApi(this, 'DoctorAibolitHttpApi', {
      description: 'DoctorAIBolit Backend API',
      corsPreflight: {
        allowOrigins: ['*'],
        allowMethods: [apigatewayv2.CorsHttpMethod.ANY],
        allowHeaders: ['Content-Type', 'Authorization', 'X-ADMIN-KEY', 'X-Visitor-Id'],
        maxAge: cdk.Duration.seconds(600),
      },
    });

    // Lambda integration
    const lambdaIntegration = new apigatewayv2Integrations.HttpLambdaIntegration(
      'LambdaIntegration',
      lambdaFunction
    );

    // Add routes
    httpApi.addRoutes({
      path: '/{proxy+}',
      methods: [apigatewayv2.HttpMethod.ANY],
      integration: lambdaIntegration,
    });

    httpApi.addRoutes({
      path: '/',
      methods: [apigatewayv2.HttpMethod.ANY],
      integration: lambdaIntegration,
    });

    // Outputs
    new cdk.CfnOutput(this, 'ApiUrl', {
      value: httpApi.url!,
      description: 'API Gateway endpoint URL',
      exportName: 'DoctorAibolit-ApiUrl',
    });

    new cdk.CfnOutput(this, 'LambdaFunctionArn', {
      value: lambdaFunction.functionArn,
      description: 'Lambda Function ARN',
    });

    new cdk.CfnOutput(this, 'OgImagesBucketName', {
      value: ogImagesBucket.bucketName,
      description: 'OG Images S3 Bucket Name',
    });
  }
}

