provider "aws" {
  region = var.region
}


module "cognito" {
  source         = "./cognito"
  user_pool_name = "my-user-pool"
  client_name    = "my-app"
}

output "terraform_resource" {
  value = {
    COGNITO_POOL_ID   = module.cognito.user_pool_id
    COGNITO_CLIENT_ID = module.cognito.user_pool_client_id
  }
}
