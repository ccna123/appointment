#!/bin/bash

ENV_FILE=".env"

[  -f $ENV_FILE ] && rm $ENV_FILE

cat << EOF > "$ENV_FILE"
# Global Variables
CORS_ORIGIN=http://localhost:3000
AWS_REGION=ap-northeast-1
ENV=dev
IMAGE_ENV=dev
COGNITO_IDENTITY_POOL_ID=ap-northeast-1:e2db3a16-f632-4aed-9f4f-7d1e3600ebb0

# UI Service
REACT_APP_COURSE_SERVICE_URL=http://localhost:4000/course
REACT_APP_PAYMENT_SERVICE_URL=http://localhost:4010/payment
REACT_APP_AUTH_SERVICE_URL=http://localhost:4020/auth
REACT_APP_STRIPE_PK=pk_test_51OazL7D3eD5YrsaQKPJqS7kHJJSrLpPMbh2sZmSrS9WI48NSYnr5dxPry4Me2G1Bp54Ads6KvX2XrohZvlXQP6d600WQy85XCz
REACT_APP_PLAYGROUND_URL=http://localhost:4030/playground

# Auth Service
COGNITO_USER_POOL_ID=ap-northeast-1_ZGhPseTQk
COGNITO_CLIENT_ID=2fk992r46r12ig1eb7p3r8n9q9
REDIS_URL=redis:6379

# Course Service
DYNAMODB_TABLE=course
S3_BUCKET=caicanuoc123
DATABASE_URL=mongodb://mongodb:27017/course
DATABASE_NAME=course
AUTH_SERVICE_URL=http://auth_service:4020/auth

# Payment Service
COURSE_SERVICE_URL=http://couse_service:4000/course
PAYMENT_SUCCESS_URL=http://elearn.local/checkout/success
PAYMENT_CANCEL_URL=http://elearn.local/checkout/cancel
STRIPE_SECRET=sk_test_51OazL7D3eD5YrsaQOK6xu6FCytoLxE5Sd5m87U9aAasG2PzR4jJEstsCao5qgd6bvMJCp1gG36qq1peZph0feIR4001YMAg8au

# Playground Service
SERVICE_URL=http://localhost
KUBE_CONFIG_PATH=
EOF

echo "Generate $ENV_FILE file successfully!"