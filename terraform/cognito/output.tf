output "user_pool_id" {
  value = aws_cognito_user_pool.my_user_pool.id
}

output "user_pool_client_id" {
  value = aws_cognito_user_pool_client.my_user_pool_client.id
}

output "identity_pool_id" {
  value = aws_cognito_identity_pool.elearn_identity_pool.id
}
