from flask import Flask, request, jsonify, make_response
import os
import logging
import requests
from flask_cors import CORS
import boto3
from botocore.exceptions import ClientError
from jose import jwt, JWTError
from jose.utils import base64url_decode
from datetime import datetime
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv() 

# Initialize Flask app
app = Flask(__name__)

CORS(app, supports_credentials=True)

# Configure logging
logging.basicConfig(level=logging.INFO, format="%(asctime)s - %(levelname)s - %(message)s")
logger = logging.getLogger()

COGNITO_USER_POOL_ID = os.getenv("COGNITO_USER_POOL_ID")
COGNITO_CLIENT_ID = os.getenv("COGNITO_CLIENT_ID")
AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

# Cognito issuer URL
COGNITO_ISSUER = f"https://cognito-idp.{AWS_REGION}.amazonaws.com/{COGNITO_USER_POOL_ID}"

# Fetch Cognito public keys (JWKS)
JWKS_URL = f"{COGNITO_ISSUER}/.well-known/jwks.json"

# Initialize Boto3 Cognito client
client = boto3.client('cognito-idp', region_name=AWS_REGION)

@app.before_request
def log_request_info():
    logger.info(f"Received {request.method} request on {request.path} from {request.remote_addr}")

def get_cognito_public_keys():
    """Fetch Cognito public keys from JWKS URL."""
    try:
        response = requests.get(JWKS_URL)
        response.raise_for_status()
        return response.json()["keys"]
    except Exception as e:
        logger.error(f"Failed to fetch Cognito public keys: {str(e)}")
        raise

def validate_token(token):
    """
    Validate a Cognito JWT token.
    Args:
        token (str): The JWT token to validate.
    Returns:
        dict: Decoded token payload if valid.
    Raises:
        JWTError: If the token is invalid.
    """
    try:
        # Fetch Cognito public keys
        public_keys = get_cognito_public_keys()

        # Decode the token header to get the key ID (kid)
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")

        # Find the matching public key
        key = next((key for key in public_keys if key["kid"] == kid), None)
        if not key:
            raise JWTError("Public key not found for the given kid")

        # Decode and verify the token
        decoded_token = jwt.decode(
            token,
            key,
            algorithms=["RS256"],
            audience=COGNITO_CLIENT_ID,
            issuer=COGNITO_ISSUER,
        )

        # Check token expiration
        if datetime.utcnow() > datetime.fromtimestamp(decoded_token["exp"]):
            raise JWTError("Token has expired")

        return decoded_token
    except JWTError as e:
        logger.error(f"Token validation failed: {str(e)}")
        raise
    except Exception as e:
        logger.error(f"Error validating token: {str(e)}")
        raise

@app.route('/auth/validate', methods=['POST'])
def validate():
    """Validate a JWT token sent by the client."""
    try:
        # Fetch the token from the Authorization header
        auth_header = request.headers.get("Authorization")
        if not auth_header:
            return jsonify({ "mess": "Authorization header is missing" }), 401

        # Check if the header is in the correct format: "Bearer <token>"
        parts = auth_header.split()
        if parts[0].lower() != "bearer" or len(parts) != 2:
            return jsonify({ "mess": "Invalid Authorization header format" }), 401

        token = parts[1]

        # Validate the token
        decoded_token = validate_token(token)

        # Return the decoded token payload
        return jsonify({
            "mess": "Token is valid",
            "user": {
                "username": decoded_token.get("name"),
                "email": decoded_token.get("email"),
                "role": decoded_token.get("custom:role", "user")  # Custom role attribute
            },
        })
    except JWTError as e:
        return jsonify({ "mess": f"Invalid token: {str(e)}"}), 401
    except Exception as e:
        logger.error(f"Error validating token: {str(e)}", exc_info=True)
        return jsonify({ "mess": "An error occurred"}), 500

@app.route('/auth/user/info', methods=['GET'])
def get_user_info():
    try:
        user_sub = request.args.get("user_sub")
        if not user_sub:
            return jsonify({"error": "At least one 'user_sub' is required"}), 400
        
        user_subs = user_sub.split(",")

        users_info = []

        for sub in user_subs:
            try:
                response = client.admin_get_user(
                    UserPoolId=COGNITO_USER_POOL_ID,
                    Username=sub
                )
                
                # Extract the user attributes
                user_info = {
                    "name": next((attr["Value"] for attr in response["UserAttributes"] if attr["Name"] == "name"), ""),
                    "sub": next((attr["Value"] for attr in response["UserAttributes"] if attr["Name"] == "sub"), "")
                }

                users_info.append(user_info)  # Add user info to the list

            except client.exceptions.UserNotFoundException:
                # If user is not found, add a placeholder with error message
                users_info.append({
                    "error": f"User with sub {sub} not found"
                })
        
        return jsonify(users_info), 200  # Return the list of user information

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/auth/login', methods=['POST'])
def login():
    try:
        data = request.get_json()
        email = data.get('email')
        password = data.get('password')
        
        try:
            response = client.initiate_auth(
                AuthFlow='USER_PASSWORD_AUTH',
                AuthParameters={
                    'USERNAME': email,
                    'PASSWORD': password
                },
                ClientId=COGNITO_CLIENT_ID
            )
            logger.info(f"User {email} logged in successfully")
            
            id_token = response['AuthenticationResult']['IdToken']
            access_token = response['AuthenticationResult']['AccessToken']
            refresh_token = response['AuthenticationResult']['RefreshToken']
            
            decoded_token = validate_token(id_token)
            
            
            # Set HttpOnly cookie
            resp = make_response(jsonify({
                "mess": "Login successful",
                "user": {
                    "userId": decoded_token.get("sub"),
                    "name": decoded_token.get("name"),
                    "email": decoded_token.get("email"),
                    "role": decoded_token.get("custom:role", "user")
                }
            }))
            # Set HttpOnly cookies securely
            resp.set_cookie(
                "id_token",
                id_token,
                httponly=True,
                secure=False,  # Use HTTPS
                samesite="Lax",  # Prevent CSRF
                max_age=3600  # 1 hour expiration
            )

            resp.set_cookie(
                "access_token",
                access_token,
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=3600
            )

            resp.set_cookie(
                "refresh_token",
                refresh_token,
                httponly=True,
                secure=False,
                samesite="Lax",
                max_age=86400  # 1-day expiration (for refresh token)
            )

            return resp, 200
        except ClientError as e:
            logger.info(f"Failed login attempt for {email}: {str(e)}")
            return jsonify({ "mess": "Invalid credentials"}), 401

    except ClientError as e:
        logger.error(f"Error logging in: {str(e)}", exc_info=True)
        return jsonify({ "mess": "An error occurred"}), 500

@app.route('/auth/signup', methods=['POST'])
def register():
    try:
        data = request.get_json()
        name = data.get('name')
        email = data.get('email')
        password = data.get('password')
        role = data.get('role', 'user')

        # Register user with Cognito
        try:
            response = client.sign_up(
                ClientId=COGNITO_CLIENT_ID,
                Username=email,
                Password=password,
                UserAttributes=[
                    {
                        'Name': 'name',
                        'Value': name
                    },
                    {
                        'Name': 'email',
                        'Value': email
                    },
                    {
                        'Name': 'custom:role',
                        'Value': role
                    }
                ]
            )
            logger.info(f"User {email} registered successfully")
            client.admin_update_user_attributes(
                UserPoolId=COGNITO_USER_POOL_ID,
                Username=email,
                UserAttributes=[
                    {
                        'Name': 'email_verified',
                        'Value': 'true'
                    }
                ]
            )
            # Confirm user
            client.admin_confirm_sign_up(
                UserPoolId=COGNITO_USER_POOL_ID,
                Username=email
            )
            logger.info(f"Email {email} marked as verified")
            return jsonify({ "mess": "User registered successfully"}), 201
        except ClientError as e:
            logger.error(f"Error during registration: {str(e)}")
            if e.response['Error']['Code'] == 'UsernameExistsException':
                return jsonify({"mess": "User already exists"}), 409
            elif e.response['Error']['Code'] == 'InvalidPasswordException':
                return jsonify({"mess": "Password does not meet security requirements"}), 400
            else:
                return jsonify({"mess": "Registration failed", "error": str(e)}), 500
    except Exception as e:
        logger.error(f"Error during registration: {str(e)}", exc_info=True)
        return jsonify({ "mess": "An error occurred"}), 500


@app.route('/auth/user/<int:userId>', methods=['GET'])
def get_user(userId):
    try:
        # Get user details from Cognito
        try:
            response = client.admin_get_user(
                UserPoolId=COGNITO_USER_POOL_ID,
                Username=userId
            )
            user_data = {
                "id": userId,
                "name": next(attr['Value'] for attr in response['UserAttributes'] if attr['Name'] == 'name'),
                "email": next(attr['Value'] for attr in response['UserAttributes'] if attr['Name'] == 'email'),
                "role": next(attr['Value'] for attr in response['UserAttributes'] if attr['Name'] == 'custom:role')
            }
            return jsonify({ "user": user_data})
        except ClientError as e:
            logger.error(f"Error getting user {userId}: {str(e)}")
            return jsonify({ "mess": "User not found"}), 404
    except Exception as e:
        logger.error(f"Error getting user {userId}: {str(e)}", exc_info=True)
        return jsonify({ "mess": "An error occurred"}), 500
# Create database tables (if they don't exist)

if __name__ == '__main__':
    app.run(host=os.getenv("FLASK_HOST", "0.0.0.0"), port=os.getenv("FLASK_PORT", 5000))