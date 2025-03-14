output "dynamodb_table_name" {
  value       = aws_dynamodb_table.course_table.name
  description = "The name of the DynamoDB course table"
}
