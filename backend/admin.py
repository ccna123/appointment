import json
import os
import boto3
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key
from boto3.dynamodb.conditions import Attr

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table(os.environ['TABLE_NAME'])

def lambda_handler(event, context):
        
    action = event.get('httpMethod', '')
    body = {}
    
    if action in ['PUT', 'POST']:
        body = json.loads(event.get('body', '{}'))
        
        
    if action == 'GET':
        statusCode, body = get_all_appointments_of_user()
        if statusCode == 200:
            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin" : "*",
                    "Access-Control-Allow-Methods" : "*",
                    "Access-Control-Allow-Headers" : "*"
                    },
                    'body': json.dumps(body)
                    }
        else:
            return {
                'statusCode': 500,
                'headers': {
                    "Access-Control-Allow-Origin" : "*",
                    "Access-Control-Allow-Methods" : "*",
                    "Access-Control-Allow-Headers" : "*"
                    }
                }

    elif action == 'POST':
        keyword = body.get('keyword', '')
        statusCode, body =  search_appoint(keyword)
        if statusCode == 200:
            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin" : "*",
                    "Access-Control-Allow-Methods" : "*",
                    "Access-Control-Allow-Headers" : "*"
                    },
                    'body': json.dumps(body)
                    }
        else:
            return {
                'statusCode': 500,
                'headers': {
                    "Access-Control-Allow-Origin" : "*",
                    "Access-Control-Allow-Methods" : "*",
                    "Access-Control-Allow-Headers" : "*"        
                    }
                    }        
    
    elif action == 'PUT':
        appointId = body.get('appointId')
        userId = body.get('userId')
        statusCode =  update_appoint_status(appointId, userId)
        if statusCode == 200:
            return {
                'statusCode': 200,
                'headers': {
                    "Access-Control-Allow-Origin" : "*",
                    "Access-Control-Allow-Methods" : "*",
                    "Access-Control-Allow-Headers" : "*"
                    }
                    }
        else:
            return {
                'statusCode': 500,
                'headers': {
                    "Access-Control-Allow-Origin" : "*",
                    "Access-Control-Allow-Methods" : "*",
                    "Access-Control-Allow-Headers" : "*"        
                    }
                    }
    
def get_all_appointments_of_user():
    
    try:
        response = table.scan()
        return [ 200, response['Items'] ]
    except ClientError as e:
        print(f"Failed to get item: {e}")
        return [ 500, {}]    
            
def update_appoint_status(appointId, userId):
        
    try:
        response = table.update_item(
            Key={
                'userId': userId,
                'appointId': appointId
            },
            UpdateExpression="set #s=:s",
            ExpressionAttributeNames={
                '#s': 'status',
            },
            ExpressionAttributeValues={":s": 'confirmed' },
            ReturnValues="UPDATED_NEW"
        )
        print("response: ", response)
        return 200
    except ClientError as e:
        print(f"Failed to update item: {e}")
        return 500
            
            
def search_appoint(keyword):
    try:
        response = table.scan(
            FilterExpression=Attr('courseName').contains(keyword) | 
                             Attr('coach').contains(keyword) |
                             Attr('location').contains(keyword) |
                             Attr('time').contains(keyword) |
                             Attr('date').contains(keyword)
        )
        return [200, response['Items']]
    except ClientError as e:
        print(f"Failed to search items: {e}")
        return [500, {}]
