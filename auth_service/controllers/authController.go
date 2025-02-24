package controllers

import (
	"auth_service_go/helper"
	"auth_service_go/initializer"
	"auth_service_go/models"
	"log"
	"net/http"

	"github.com/MicahParks/keyfunc"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/service/cognitoidentityprovider"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func Login(c *gin.Context) {
	var req models.LoginRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		log.Printf("Error binding JSON: %v", err)
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	// Authenticate user with Cognito
	authInput := &cognitoidentityprovider.InitiateAuthInput{
		AuthFlow: aws.String("USER_PASSWORD_AUTH"),
		AuthParameters: map[string]*string{
			"USERNAME": aws.String(req.Email),
			"PASSWORD": aws.String(req.Password),
		},
		ClientId: aws.String(initializer.ClientID),
	}

	result, err := initializer.CognitoClient.InitiateAuth(authInput)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"mess": "Invalid credentials"})
		return
	}

	log.Printf("Authentication success")

	decoded_token, err := helper.DecodeToken(*result.AuthenticationResult.IdToken)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"mess": "Invalid token"})
		return
	}

	c.SetCookie("id_token", *result.AuthenticationResult.IdToken, 3600, "/", "", false, true) // HttpOnly, Secure for HTTPS
	c.SetCookie("access_token", *result.AuthenticationResult.AccessToken, 3600, "/", "", false, true)
	c.SetCookie("refresh_token", *result.AuthenticationResult.RefreshToken, 86400, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"mess": "Login successful",
		"user": decoded_token,
	})
}

func Signup(c *gin.Context) {
	var req models.SignUpRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input := &cognitoidentityprovider.SignUpInput{
		ClientId: aws.String(initializer.ClientID),
		Username: aws.String(req.Email),
		Password: aws.String(req.Password),
		UserAttributes: []*cognitoidentityprovider.AttributeType{
			{
				Name:  aws.String("name"),
				Value: aws.String(req.Name),
			},
			{
				Name:  aws.String("email"),
				Value: aws.String(req.Email),
			},
			{
				Name:  aws.String("custom:role"),
				Value: aws.String(req.Role),
			},
		},
	}

	_, err := initializer.CognitoClient.SignUp(input)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{
			"details": err.Error(),
		})
		return
	}

	_, err = initializer.CognitoClient.AdminUpdateUserAttributes(&cognitoidentityprovider.AdminUpdateUserAttributesInput{
		UserPoolId: aws.String(initializer.UserPoolID),
		Username:   aws.String(req.Email),
		UserAttributes: []*cognitoidentityprovider.AttributeType{
			{
				Name:  aws.String("email_verified"),
				Value: aws.String("true"),
			},
		},
	})
	if err != nil {
		log.Printf("Failed to confirm email for user: %s, error: %v", req.Email, err)
		c.JSON(http.StatusInternalServerError, gin.H{"mess": "Failed to confirm email"})
		return
	}

	_, err = initializer.CognitoClient.AdminConfirmSignUp(&cognitoidentityprovider.AdminConfirmSignUpInput{
		UserPoolId: aws.String(initializer.UserPoolID),
		Username:   aws.String(req.Email),
	})
	if err != nil {
		log.Printf("Error confirming user: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"mess": "Failed to confirm user"})
		return
	}

	log.Printf("User %s created successfully", req.Email)
	c.JSON(http.StatusCreated, gin.H{"mess": "User created successfully"})
}

func ValidateToken(c *gin.Context) {
	var requestBody struct {
		Token string `json:"token"`
	}

	// Parse JSON body
	if err := c.ShouldBindJSON(&requestBody); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request body"})
		return
	}

	tokenStr := requestBody.Token

	jwks, err := keyfunc.Get(initializer.JwksURL, keyfunc.Options{})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"mess": "Failed to get JWKS"})
		return
	}

	token, err := jwt.Parse(tokenStr, jwks.Keyfunc)
	if err != nil || !token.Valid {
		log.Printf("Token validation failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"mess": "Invalid token"})
		return
	}
	log.Printf("Token is valid")
	c.JSON(http.StatusOK, gin.H{
		"message": "Token is valid",
	})
}
