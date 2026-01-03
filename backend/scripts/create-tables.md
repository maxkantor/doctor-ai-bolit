# DynamoDB Tables Creation Guide

## Required Tables

### 1. PaymentHistory Table

**Table Name:** `DoctorAibolitPaymentHistory`

**Partition Key (Hash Key):**
- Name: `PaymentId`
- Type: `String`

**Sort Key (Range Key):**
- Name: `VisitorId`
- Type: `String`

**Settings:**
- Billing mode: On-demand (or Provisioned with 5 read/write capacity units)
- No additional indexes needed

**How to Create:**
1. Go to AWS DynamoDB Console
2. Click "Create table"
3. Table name: `DoctorAibolitPaymentHistory`
4. Partition key: `PaymentId` (String)
5. Sort key: `VisitorId` (String)
6. Table settings: Use default settings or choose "On-demand"
7. Click "Create table"

### 2. EmailVisitorMapping Table

**Table Name:** `DoctorAibolitEmailVisitorMapping`

**Partition Key (Hash Key):**
- Name: `Email`
- Type: `String`

**Sort Key (Range Key):**
- Name: `VisitorId`
- Type: `String`

**Settings:**
- Billing mode: On-demand (or Provisioned with 5 read/write capacity units)
- No additional indexes needed

**How to Create:**
1. Go to AWS DynamoDB Console
2. Click "Create table"
3. Table name: `DoctorAibolitEmailVisitorMapping`
4. Partition key: `Email` (String)
5. Sort key: `VisitorId` (String)
6. Table settings: Use default settings or choose "On-demand"
7. Click "Create table"

## IAM Permissions Required

Make sure your Lambda role has these permissions:

```json
{
    "Version": "2012-10-17",
    "Statement": [
        {
            "Effect": "Allow",
            "Action": [
                "dynamodb:PutItem",
                "dynamodb:GetItem",
                "dynamodb:UpdateItem",
                "dynamodb:DeleteItem",
                "dynamodb:Query",
                "dynamodb:Scan"
            ],
            "Resource": [
                "arn:aws:dynamodb:us-east-1:718522948657:table/DoctorAibolitPaymentHistory",
                "arn:aws:dynamodb:us-east-1:718522948657:table/DoctorAibolitPaymentHistory/*",
                "arn:aws:dynamodb:us-east-1:718522948657:table/DoctorAibolitEmailVisitorMapping",
                "arn:aws:dynamodb:us-east-1:718522948657:table/DoctorAibolitEmailVisitorMapping/*"
            ]
        }
    ]
}
```

## Verification

After creating the tables, verify they exist:
1. Go to DynamoDB → Tables
2. You should see both `DoctorAibolitPaymentHistory` and `DoctorAibolitEmailVisitorMapping` in the list
3. Check that the partition key and sort key match the specifications above

