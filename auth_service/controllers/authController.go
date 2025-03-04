package controllers

import (
	"auth_service_go/helper"
	"auth_service_go/initializer"
	"auth_service_go/models"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"time"

	"github.com/MicahParks/keyfunc"
	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider/types"
	"github.com/gin-gonic/gin"
	"github.com/go-redis/redis/v8"
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
		AuthFlow: types.AuthFlowTypeUserPasswordAuth,
		AuthParameters: map[string]string{
			"USERNAME": req.Email,
			"PASSWORD": req.Password,
		},
		ClientId: aws.String(initializer.ClientID),
	}

	result, err := initializer.CognitoClient.InitiateAuth(context.TODO(), authInput)
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

	// Store the user's login session in Redis with a 24-hour expiration
	userId := decoded_token["userId"].(string)
	err = initializer.Rdb.Set(context.TODO(), userId, *result.AuthenticationResult.AccessToken, 24*time.Hour).Err()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"mess": "Failed to store session"})
		log.Printf("Error storing session in Redis: %v", err)
	}

	c.SetCookie("id_token", *result.AuthenticationResult.IdToken, 3600, "/", "", false, true) // HttpOnly, Secure for HTTPS
	c.SetCookie("access_token", *result.AuthenticationResult.AccessToken, 3600, "/", "", false, true)
	c.SetCookie("refresh_token", *result.AuthenticationResult.RefreshToken, 86400, "/", "", false, true)

	c.JSON(http.StatusOK, gin.H{
		"mess": "Login successful",
		"user": decoded_token,
	})
}

func Logout(c *gin.Context){
	var req models.LogoutRequest
	
	// Manually parse body for sendBeacon
	if err := c.ShouldBindJSON(&req); err != nil {
		body, _ := io.ReadAll(c.Request.Body)
		json.Unmarshal(body, &req)
	}

		// Validate UserId before deleting session
	if req.UserId == "" {
		log.Printf("UserId is required")
		c.JSON(http.StatusBadRequest, gin.H{"mess": "UserId is required"})
		return
	}

	// // Validate JWT token
	// if err := validateToken(req.Token); err != nil {
	// 	log.Printf("Token validation failed: %v", err)
	// 	c.JSON(http.StatusUnauthorized, gin.H{"mess": "Invalid token"})
	// 	return
	// }

	// Delete the user's login session from Redis
	err := initializer.Rdb.Del(context.TODO(), req.UserId).Err()
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"mess": "Failed to delete session"})
		log.Printf("Error deleting session from Redis: %v", err)
		return
	}

	// Invalidate the user's tokens
	clearCookies(c)

	c.JSON(http.StatusOK, gin.H{"mess": "Logout successful"})

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
		UserAttributes: []types.AttributeType{
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

	_, err := initializer.CognitoClient.SignUp(context.TODO(), input)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{
			"details": err.Error(),
		})
		return
	}

	_, err = initializer.CognitoClient.AdminUpdateUserAttributes(context.TODO(), &cognitoidentityprovider.AdminUpdateUserAttributesInput{
		UserPoolId: aws.String(initializer.UserPoolID),
		Username:   aws.String(req.Email),
		UserAttributes: []types.AttributeType{
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

	_, err = initializer.CognitoClient.AdminConfirmSignUp(context.TODO(), &cognitoidentityprovider.AdminConfirmSignUpInput{
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

	// Validate JWT token
	if err := validateToken(requestBody.Token); err != nil {
		log.Printf("Token validation failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"mess": "Invalid token"})
		return
	}
	
	log.Printf("Token is valid")
	c.JSON(http.StatusOK, gin.H{
		"message": "Token is valid",
	})
}

func GetUserLoginStatus(c *gin.Context) {
	userId := c.Param("userId")

	if userId == "" {
		log.Printf("UserId is required")
		c.JSON(http.StatusBadRequest, gin.H{"mess": "UserId is required"})
		return
	}

	// Retrieve the user's login status from Redis
	access_token, err := initializer.Rdb.Get(context.TODO(), userId).Result()
	if err != nil {
		if err == redis.Nil {
			// User not found in Redis
			log.Printf("User not found in Redis: %s", userId)
			c.JSON(http.StatusNotFound, gin.H{"mess": "User not found or not logged in"})
			return
		}
		// Other Redis error
		log.Printf("Error retrieving session from Redis: %v", err)
		c.JSON(http.StatusInternalServerError, gin.H{"mess": "Failed to retrieve session"})
		return
	}

	err = validateToken(access_token); if err != nil {
		log.Printf("Token validation failed: %v", err)
		c.JSON(http.StatusUnauthorized, gin.H{"mess": "Invalid token"})
		return
	} 

	c.JSON(http.StatusOK, gin.H{
		"mess":   "User login status retrieved successfully",
		"status": "Ok",
	})
}


// Private function to validate JWT token
func validateToken(tokenStr string) error {
	jwks, err := keyfunc.Get(initializer.JwksURL, keyfunc.Options{})
	if err != nil {
		return err
	}

	token, err := jwt.Parse(tokenStr, jwks.Keyfunc)
	if err != nil || !token.Valid {
		return err
	}

	if claims, ok := token.Claims.(jwt.MapClaims); ok && token.Valid {
		if exp, ok := claims["exp"].(float64); ok {
			// The "exp" claim is in Unix timestamp format (seconds)
			expirationTime := time.Unix(int64(exp), 0)
			if expirationTime.Before(time.Now()) {
				return fmt.Errorf("token is expired")
			}
		} else {
			return fmt.Errorf("token does not have an exp claim")
		}
	}

	return nil
}

// Private function to clear cookies
func clearCookies(c *gin.Context) {
	c.SetCookie("id_token", "", -1, "/", "", false, true)
	c.SetCookie("access_token", "", -1, "/", "", false, true)
	c.SetCookie("refresh_token", "", -1, "/", "", false, true)
}
