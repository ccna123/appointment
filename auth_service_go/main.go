package main

import (
	"fmt"
	"net/http"
	"os"
	"strings"

	"log"

	"github.com/MicahParks/keyfunc"
	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cognitoidentityprovider"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
	"github.com/joho/godotenv"
)

type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type SignUpRequest struct {
	Name     string `json:"name"`
	Email    string `json:"email"`
	Password string `json:"password"`
	Role     string `json:"role"`
}

var (
	cognitoClient *cognitoidentityprovider.CognitoIdentityProvider
	userPoolID    string
	clientID      string
	jwksURL       string
)

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	sess := session.Must(session.NewSession(&aws.Config{
		Region: aws.String(os.Getenv("AWS_REGION")),
	}))
	cognitoClient = cognitoidentityprovider.New(sess)
	userPoolID = os.Getenv("COGNITO_USER_POOL_ID")
	clientID = os.Getenv("COGNITO_CLIENT_ID")

	jwksURL = fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json", os.Getenv("AWS_REGION"), userPoolID)
	log.Println("Initialization complete: Cognito client and environment variables loaded.")
}

func login(c *gin.Context) {
	var req LoginRequest

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
		ClientId: aws.String(clientID),
	}

	result, err := cognitoClient.InitiateAuth(authInput)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"mess": "Invalid credentials"})
		return
	}

	log.Printf("Authentication success")

	decoded_token, err := decodeToken(*result.AuthenticationResult.IdToken)
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

func signup(c *gin.Context) {
	var req SignUpRequest

	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	input := &cognitoidentityprovider.SignUpInput{
		ClientId: aws.String(clientID),
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

	_, err := cognitoClient.SignUp(input)
	if err != nil {
		c.JSON(http.StatusConflict, gin.H{
			"details": err.Error(),
		})
		return
	}

	_, err = cognitoClient.AdminUpdateUserAttributes(&cognitoidentityprovider.AdminUpdateUserAttributesInput{
		UserPoolId: aws.String(userPoolID),
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

	_, err = cognitoClient.AdminConfirmSignUp(&cognitoidentityprovider.AdminConfirmSignUpInput{
		UserPoolId: aws.String(userPoolID),
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

func decodeToken(tokenStr string) (map[string]any, error) {
	token, _, _ := jwt.NewParser().ParseUnverified(tokenStr, jwt.MapClaims{})
	claims, _ := token.Claims.(jwt.MapClaims)

	// Return decoded claims
	return gin.H{
		"userId":   claims["sub"],
		"email":    claims["email"],
		"role":     claims["custom:role"],
		"username": claims["name"],
	}, nil
}

func validateToken(c *gin.Context) {
	authHeader := c.GetHeader("Authorization")
	if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
		log.Println("Missing or invalid token")
		c.JSON(http.StatusUnauthorized, gin.H{"mess": "Invalid or missing token"})
		return
	}

	tokenStr := strings.TrimPrefix(authHeader, "Bearer ")

	jwks, err := keyfunc.Get(jwksURL, keyfunc.Options{})
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

func main() {

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
	}))
	r.POST("/auth/login", login)
	r.POST("/auth/signup", signup)
	r.GET("/auth/validate", validateToken)
	r.Run(":8080")

}
