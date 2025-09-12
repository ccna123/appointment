resource "aws_cognito_user_pool" "my_user_pool" {
  name = var.user_pool_name

  username_attributes = ["email"]

  schema {
    attribute_data_type      = "String"
    developer_only_attribute = false
    mutable                  = true
    name                     = "role" # Custom attribute name
    required                 = false  # Optional: Set to true if role is mandatory

    string_attribute_constraints {
      min_length = 1
      max_length = 50 # Adjust based on your role naming conventions
    }
  }

  password_policy {
    minimum_length                   = 6
    require_lowercase                = true
    require_uppercase                = false
    require_numbers                  = true
    require_symbols                  = false
    temporary_password_validity_days = 7
  }
  auto_verified_attributes = ["email"]
  mfa_configuration        = "OFF"
  account_recovery_setting {
    recovery_mechanism {
      name     = "verified_email"
      priority = 1
    }
  }
}
resource "aws_cognito_user_pool_client" "my_user_pool_client" {
  name = "my-user-pool-client"

  user_pool_id = aws_cognito_user_pool.my_user_pool.id

  # Optional: Configure token validity
  id_token_validity      = 24 # Hours
  access_token_validity  = 24 # Hours
  refresh_token_validity = 30 # Days

  # Optional: Configure callback URLs
  callback_urls = ["https://example.com/callback"]

  # Optional: Configure logout URLs
  logout_urls = ["https://example.com/logout"]

  # Optional: Configure allowed OAuth flows
  allowed_oauth_flows = ["code", "implicit"]

  # Optional: Configure allowed OAuth scopes
  allowed_oauth_scopes = ["email", "openid", "profile"]

  # Optional: Enable or disable OAuth flows
  allowed_oauth_flows_user_pool_client = true

  # Optional: Configure explicit auth flows
  explicit_auth_flows = [
    "ALLOW_USER_PASSWORD_AUTH",
    "ALLOW_USER_SRP_AUTH",
    "ALLOW_REFRESH_TOKEN_AUTH"
  ]

  # Optional: Prevent user existence errors
  prevent_user_existence_errors = "ENABLED"
}

resource "aws_iam_role" "unauth_role" {
  name = "cognito_unauth_role"
  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Principal = {
          Federated = "cognito-identity.amazonaws.com"
        }
        Action = "sts:AssumeRoleWithWebIdentity"
        Condition = {
          StringEquals = {
            "cognito-identity.amazonaws.com:aud" = aws_cognito_identity_pool.elearn_identity_pool.id
          }
          "ForAnyValue:StringLike" = {
            "cognito-identity.amazonaws.com:amr" = "unauthenticated"
          }
        }
      }
    ]
  })
}

resource "aws_iam_policy" "unauth_dynamodb_policy" {
  name = "cognito_unauth_dynamodb_policy"
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = [
          "arn:aws:dynamodb:ap-northeast-1:223479137170:table/course"
        ]
      }
    ]
  })
}

resource "aws_iam_role_policy_attachment" "unauth_role_attachment" {
  role       = aws_iam_role.unauth_role.name
  policy_arn = aws_iam_policy.unauth_dynamodb_policy.arn
}

resource "aws_cognito_identity_pool" "elearn_identity_pool" {
  identity_pool_name               = var.identity_pool_name
  allow_unauthenticated_identities = true
}

resource "aws_cognito_identity_pool_roles_attachment" "elearn_identity_pool_roles_attachment" {
  identity_pool_id = aws_cognito_identity_pool.elearn_identity_pool.id
  roles = {
    "unauthenticated" = aws_iam_role.unauth_role.arn
  }
}
