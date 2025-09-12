provider "aws" {
  region  = var.region
  profile = "default"
}


module "cognito" {
  source             = "./cognito"
  user_pool_name     = "my-user-pool"
  client_name        = "my-app"
  identity_pool_name = "elearn-app-identity-pool"
}

module "dynamodb" {
  source     = "./dynamodb"
  table_name = "course"
}

output "terraform_resource" {
  value = {
    COGNITO_POOL_ID   = module.cognito.user_pool_id
    COGNITO_CLIENT_ID = module.cognito.user_pool_client_id
    DYNAMODB_TABLE    = module.dynamodb.dynamodb_table_name
    IDENTITY_POOL_ID  = module.cognito.identity_pool_id
  }
}
