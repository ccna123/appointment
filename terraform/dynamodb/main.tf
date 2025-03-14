
# Create the DynamoDB table
resource "aws_dynamodb_table" "course_table" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "courseId"

  # Define the attribute for the partition key
  attribute {
    name = "courseId"
    type = "S" # String type (S = String, N = Number, B = Binary)
  }

}

