import json
import boto3
import os
from botocore.exceptions import ClientError
from boto3.dynamodb.conditions import Key

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('appointment')

def lambda_handler(event, context):
   
    action = event.get('httpMethod', '')
    body = {}
    
    # Load body only if it's a POST, PUT, or DELETE request
    if action in ['POST', 'PUT']:
        body = json.loads(event.get('body', '{}'))
    
    if action == 'GET':
        if event.get('queryStringParameters', {}) != None:
            appointId = event.get('queryStringParameters', {}).get('appointId')
            userId = event.get('queryStringParameters', {}).get('userId')
            
            statusCode, body =  get_appointments(appointId, userId)
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
            elif statusCode == 404:
                return {
                    'statusCode': 404,
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
        
    elif action == 'POST':
        statusCode = create(body)
        if statusCode == 201:
            return {
                'statusCode': 201,
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
        
        
    elif action == 'PUT':
        appointId = body.get('appointId')
        userId = body.get('userId')
        statusCode =  update(appointId, userId, body)
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
                
    elif action == 'DELETE':
        appointId = event.get('queryStringParameters', {}).get('appointId')
        userId = event.get('queryStringParameters', {}).get('userId')
        statusCode = delete(appointId, userId)
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
        
    else:
        return {
            'statusCode': 400,
            'headers': {
                "Access-Control-Allow-Origin" : "*",
                "Access-Control-Allow-Methods" : "*",
                "Access-Control-Allow-Headers" : "*"
            },
            'body': json.dumps('Invalid HTTP method')
        }
    

def get_appointments(appointId, userId):
    
    try:
        if appointId != None:
            # Get a specific appointment
            response = table.get_item(
                Key={
                    'userId': userId,
                    'appointId': appointId
                }
            )
            item = response.get('Item')
            if item:
                return [ 200, item ]
            else:
                return [404, {}]
        else:
            # Get all appointments for the user
            response = table.query(
                KeyConditionExpression=Key('userId').eq(userId)
            )
            return  [ 200, response.get('Items', []) ]
    except ClientError as e:
        print(f"Failed to get item: {e}")
        return [ 500, {}]

def create(body):
    
    userId = body['userId']
    appointId = body['appointId']
    date = body['date']
    time = body['selectedTime']
    note = body['note']
    status = 'waiting'
    location = body['location']
    course = body['course']
    coach = body['coach']
    userName = body['userName']
    
    try:
        table.put_item(
            Item={
                'userId': userId,
                'appointId': appointId,
                'date': date,
                'time': time,
                'note': note,
                'status': status,
                'location': location,
                'course': course,
                'coach': coach,
                'userName': userName
            }
        )
        return 201
    except ClientError as e:
        print(f"Failed to create item: {e}")
        return 500

def update(appointId, userId, body):
    
    date = body['date']
    time = body['time']
    note = body['note']
    location = body['location']
    course = body['course']
    coach = body['coach']
    
    
    try:
        response = table.update_item(
            Key={
                'userId': userId,
                'appointId': appointId
            },
            UpdateExpression="set #d = :d, #t= :t, note=:n, #loc= :l, course=:c, coach=:coach",
            ExpressionAttributeNames={
                '#d': 'date',
                '#t': 'time',
                '#loc': 'location'
            },
            ExpressionAttributeValues={":d": date, ":t": time, ":n": note, ":l": location, ":c": course, ":coach": coach },
            ReturnValues="UPDATED_NEW"
        )
        print("response: ", response)
        return 200
    except ClientError as e:
        print(f"Failed to update item: {e}")
        return 500

def delete(appointId, userId):
    try:
        table.delete_item(
            Key={
                'userId': userId,
                'appointId': appointId
            }
        )
        return 200
    except ClientError as e:
        print(f"Failed to delete item: {e}")
        return 500

