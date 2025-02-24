package initializer

import (
	"fmt"
	"log"
	"os"

	"github.com/aws/aws-sdk-go/aws"
	"github.com/aws/aws-sdk-go/aws/session"
	"github.com/aws/aws-sdk-go/service/cognitoidentityprovider"
	"github.com/joho/godotenv"
)

var (
	CognitoClient *cognitoidentityprovider.CognitoIdentityProvider
	UserPoolID    string
	ClientID      string
	JwksURL       string
)

func InitEnv() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
}

func InitCognitoParam() {
	sess := session.Must(session.NewSession(&aws.Config{
		Region: aws.String(os.Getenv("AWS_REGION")),
	}))
	CognitoClient = cognitoidentityprovider.New(sess)
	UserPoolID = os.Getenv("COGNITO_USER_POOL_ID")
	ClientID = os.Getenv("COGNITO_CLIENT_ID")

	JwksURL = fmt.Sprintf("https://cognito-idp.%s.amazonaws.com/%s/.well-known/jwks.json", os.Getenv("AWS_REGION"), UserPoolID)
	log.Println("Initialization complete: Cognito client and environment variables loaded.")
}
