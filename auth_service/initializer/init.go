package initializer

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/go-redis/redis/v8"
	"github.com/joho/godotenv"
)

var (
	CognitoClient *cognitoidentityprovider.Client
	UserPoolID    string
	ClientID      string
	JwksURL       string
)

func InitEnv() {
	// Load environment variables from .env file
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}

	// Check if required environment variables are set
	requiredEnvVars := []string{"AWS_REGION", "COGNITO_USER_POOL_ID", "COGNITO_CLIENT_ID"}
	for _, envVar := range requiredEnvVars {
		if os.Getenv(envVar) == "" {
			log.Fatalf("Missing required environment variable: %s", envVar)
		}
	}
}

func InitCognitoParam() {
	// Load AWS configuration
	cfg, err := config.LoadDefaultConfig(context.TODO(), config.WithRegion(os.Getenv("AWS_REGION")))
	if err != nil {
		log.Fatalf("Failed to load AWS configuration: %v", err)
	}

	// Initialize Cognito client
	CognitoClient = cognitoidentityprovider.NewFromConfig(cfg)

	// Set Cognito parameters
	UserPoolID = os.Getenv("COGNITO_USER_POOL_ID")
	ClientID = os.Getenv("COGNITO_CLIENT_ID")

	// Construct JWKS URL
	JwksURL = fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json", os.Getenv("AWS_REGION"), UserPoolID)

	log.Println("Initialization complete: Cognito client and environment variables loaded.")
}

var Rdb *redis.Client
func InitRedis() {
	Rdb = redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_URL"), // Adjust to your Redis server address
		Password: "",               // No password set (default)
		DB:       0,                // Default DB
	})

	// Test the Redis connection
	pong, err := Rdb.Ping(context.TODO()).Result()
	if err != nil {
		log.Fatalf("Could not connect to Redis: %v", err)
	}
	// Log the successful connection and the Pong message from Redis
    log.Printf("Connected to Redis: %v", pong)
}