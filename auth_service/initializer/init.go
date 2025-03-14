package initializer

import (
	"context"
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentity"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentityprovider"
	"github.com/go-redis/redis/v8"
	"github.com/joho/godotenv"
)

var (
	CognitoClient      *cognitoidentityprovider.Client
	CredentialsProvider aws.CredentialsProvider // Store the provider for later use
	UserPoolID         string
	ClientID           string
	JwksURL            string
)

func InitEnv() {	
	if os.Getenv("ENV") != "container" {
		err := godotenv.Load()
		if err != nil {
			log.Fatal("Error loading .env file")
		}
	}	
	

	requiredEnvVars := []string{"AWS_REGION", "COGNITO_USER_POOL_ID", "COGNITO_CLIENT_ID", "COGNITO_IDENTITY_POOL_ID"}
	for _, envVar := range requiredEnvVars {
		if os.Getenv(envVar) == "" {
			log.Fatalf("Missing required environment variable: %s", envVar)
		}
	}
}

func InitCognitoParam() {
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(os.Getenv("AWS_REGION")),
	)
	if err != nil {
		log.Fatalf("Failed to load AWS configuration: %v", err)
	}

	cognitoIdentityClient := cognitoidentity.NewFromConfig(cfg)
	identityPoolID := os.Getenv("COGNITO_IDENTITY_POOL_ID")

	identityOutput, err := cognitoIdentityClient.GetId(context.TODO(), &cognitoidentity.GetIdInput{
		IdentityPoolId: aws.String(identityPoolID),
	})
	if err != nil {
		log.Fatalf("Failed to get Cognito Identity: %v", err)
	}

	credsOutput, err := cognitoIdentityClient.GetCredentialsForIdentity(context.TODO(), &cognitoidentity.GetCredentialsForIdentityInput{
		IdentityId: identityOutput.IdentityId,
	})
	if err != nil {
		log.Fatalf("Failed to get Cognito Identity credentials: %v", err)
	}

	// Store the credentials provider globally
	CredentialsProvider = aws.CredentialsProviderFunc(func(ctx context.Context) (aws.Credentials, error) {
		return aws.Credentials{
			AccessKeyID:     *credsOutput.Credentials.AccessKeyId,
			SecretAccessKey: *credsOutput.Credentials.SecretKey,
			SessionToken:    *credsOutput.Credentials.SessionToken,
			Source:          "CognitoIdentityPool",
			Expires:         *credsOutput.Credentials.Expiration,
		}, nil
	})

	cfg, err = config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(os.Getenv("AWS_REGION")),
		config.WithCredentialsProvider(CredentialsProvider),
	)
	if err != nil {
		log.Fatalf("Failed to load AWS configuration with Identity Pool credentials: %v", err)
	}

	CognitoClient = cognitoidentityprovider.NewFromConfig(cfg)
	UserPoolID = os.Getenv("COGNITO_USER_POOL_ID")
	ClientID = os.Getenv("COGNITO_CLIENT_ID")
	JwksURL = fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json", os.Getenv("AWS_REGION"), UserPoolID)

	log.Println("Initialization complete: Cognito client initialized with Identity Pool unauthenticated credentials.")
}

func RefreshCognitoCredentials() error {
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(os.Getenv("AWS_REGION")),
	)
	if err != nil {
		return fmt.Errorf("failed to load AWS configuration: %v", err)
	}

	cognitoIdentityClient := cognitoidentity.NewFromConfig(cfg)
	identityPoolID := os.Getenv("COGNITO_IDENTITY_POOL_ID")

	identityOutput, err := cognitoIdentityClient.GetId(context.TODO(), &cognitoidentity.GetIdInput{
		IdentityPoolId: aws.String(identityPoolID),
	})
	if err != nil {
		return fmt.Errorf("failed to get Cognito Identity: %v", err)
	}

	credsOutput, err := cognitoIdentityClient.GetCredentialsForIdentity(context.TODO(), &cognitoidentity.GetCredentialsForIdentityInput{
		IdentityId: identityOutput.IdentityId,
	})
	if err != nil {
		return fmt.Errorf("failed to get Cognito Identity credentials: %v", err)
	}

	// Update the credentials provider
	CredentialsProvider = aws.CredentialsProviderFunc(func(ctx context.Context) (aws.Credentials, error) {
		return aws.Credentials{
			AccessKeyID:     *credsOutput.Credentials.AccessKeyId,
			SecretAccessKey: *credsOutput.Credentials.SecretKey,
			SessionToken:    *credsOutput.Credentials.SessionToken,
			Source:          "CognitoIdentityPool",
			Expires:         *credsOutput.Credentials.Expiration,
		}, nil
	})

	cfg, err = config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(os.Getenv("AWS_REGION")),
		config.WithCredentialsProvider(CredentialsProvider),
	)
	if err != nil {
		return fmt.Errorf("failed to load AWS configuration with Identity Pool credentials: %v", err)
	}

	CognitoClient = cognitoidentityprovider.NewFromConfig(cfg)
	log.Println("Cognito client refreshed with new Identity Pool unauthenticated credentials.")
	return nil
}

var Rdb *redis.Client

func InitRedis() {
	Rdb = redis.NewClient(&redis.Options{
		Addr:     os.Getenv("REDIS_URL"),
		Password: "",
		DB:       0,
	})

	pong, err := Rdb.Ping(context.TODO()).Result()
	if err != nil {
		log.Fatalf("Could not connect to Redis: %v", err)
	}
	log.Printf("Connected to Redis: %v", pong)
}