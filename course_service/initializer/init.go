package initializer

import (
	"context"
	"log"
	"os"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/cognitoidentity"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

var (
	DynamodbClient *dynamodb.Client
	MongoClient    *mongo.Client
)

func InitEnv() {
	if os.Getenv("ENV") == "container" {
		err := godotenv.Load()
		if err != nil {
			log.Fatal("Error loading .env file")
		}
	}	
}

func InitDynamodb() {
	// Load base AWS config without credentials
	cfg, err := config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(os.Getenv("AWS_REGION")),
	)
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}

	// Initialize Cognito Identity client
	cognitoClient := cognitoidentity.NewFromConfig(cfg)
	identityPoolID := os.Getenv("COGNITO_IDENTITY_POOL_ID")

	// Fetch unauthenticated identity and credentials
	identityOutput, err := cognitoClient.GetId(context.TODO(), &cognitoidentity.GetIdInput{
		IdentityPoolId: aws.String(identityPoolID),
	})
	if err != nil {
		log.Fatalf("failed to get Cognito identity: %v", err)
	}

	credsOutput, err := cognitoClient.GetCredentialsForIdentity(context.TODO(), &cognitoidentity.GetCredentialsForIdentityInput{
		IdentityId: identityOutput.IdentityId,
	})
	if err != nil {
		log.Fatalf("failed to get Cognito credentials: %v", err)
	}

	// Create a credentials provider with the temporary credentials
	creds := aws.CredentialsProviderFunc(func(ctx context.Context) (aws.Credentials, error) {
		return aws.Credentials{
			AccessKeyID:     *credsOutput.Credentials.AccessKeyId,
			SecretAccessKey: *credsOutput.Credentials.SecretKey,
			SessionToken:    *credsOutput.Credentials.SessionToken,
			Source:          "CognitoIdentityPool",
			Expires:         *credsOutput.Credentials.Expiration,
		}, nil
	})

	// Reconfigure AWS SDK with Cognito credentials
	cfg, err = config.LoadDefaultConfig(context.TODO(),
		config.WithRegion(os.Getenv("AWS_REGION")),
		config.WithCredentialsProvider(creds),
	)
	if err != nil {
		log.Fatalf("unable to load SDK config with Cognito credentials, %v", err)
	}

	// Initialize DynamoDB client
	DynamodbClient = dynamodb.NewFromConfig(cfg)
	log.Println("Dynamodb client initialized with Cognito Identity Pool unauthenticated credentials")
}

func ConnectToMongo() (*mongo.Client, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(os.Getenv("MONGODB_DATABASE_URL"))
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
		return nil, err
	}

	MongoClient = client
	log.Println("MongoDB connected and client initialized")
	return client, nil
}