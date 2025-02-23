package main

import (
	"bytes"
	"context"
	"fmt"
	"log"
	"net/http"
	"os"
	"strconv"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
	"go.mongodb.org/mongo-driver/mongo/options"
)

type Course struct {
	CourseId string `json:"courseId"`
	Title    string `json:"title"`
	Price    int    `json:"price"`
	Length   int    `json:"length"`
	Enrolled int    `json:"enrolled"`
	Image    string `json:"image"`
	ImageUrl string `json:"imageUrl"`
}

type Enrollment struct {
	UserID string `json:"userId"`
	Course Course `json:"course"`
}

var dynamodbClient *dynamodb.Client
var mongoClient *mongo.Client

func init() {
	err := godotenv.Load()
	if err != nil {
		log.Fatal("Error loading .env file")
	}
	cfg, err := config.LoadDefaultConfig(context.TODO())
	if err != nil {
		log.Fatalf("unable to load SDK config, %v", err)
	}
	dynamodbClient = dynamodb.NewFromConfig(cfg)
}

// MongoDB connection function
func connectToMongo() (*mongo.Client, error) {

	ctx, cancel := context.WithTimeout(context.Background(), 3*time.Second)
	defer cancel()

	clientOptions := options.Client().ApplyURI(os.Getenv("DATABASE_URL"))
	client, err := mongo.Connect(ctx, clientOptions)
	if err != nil {
		log.Fatalf("Failed to connect to MongoDB: %v", err)
		return nil, err
	}

	// Check if the connection is successful
	err = client.Ping(ctx, nil)
	if err != nil {
		log.Fatalf("Failed to ping MongoDB: %v", err)
		return nil, err
	}

	return client, nil
}

func getCourses(c *gin.Context) {
	tableName := os.Getenv("DYNAMODB_TABLE")
	params := &dynamodb.ScanInput{
		TableName: aws.String(tableName),
	}

	result, err := dynamodbClient.Scan(context.TODO(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var courses []Course
	for _, item := range result.Items {
		course := Course{
			CourseId: getStringValue(item["courseId"]),
			Title:    getStringValue(item["title"]),
			Price:    getIntValue(item["price"]),
			Length:   getIntValue(item["length"]),
			Enrolled: getIntValue(item["enrolled"]),
			Image:    getStringValue(item["image"]),
			ImageUrl: fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", os.Getenv("S3_BUCKET"), os.Getenv("AWS_REGION"), getStringValue(item["image"])),
		}
		courses = append(courses, course)
	}

	c.JSON(http.StatusOK, courses)
}

func getCourseById(c *gin.Context) {
	tableName := os.Getenv("DYNAMODB_TABLE")
	courseId := c.Param("courseId")
	params := &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"courseId": &types.AttributeValueMemberS{Value: courseId},
		},
	}

	result, err := dynamodbClient.GetItem(context.TODO(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.Item == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	course := Course{
		CourseId: getStringValue(result.Item["courseId"]),
		Title:    getStringValue(result.Item["title"]),
		Price:    getIntValue(result.Item["price"]),
		Length:   getIntValue(result.Item["length"]),
		Enrolled: getIntValue(result.Item["enrolled"]),
		Image:    getStringValue(result.Item["image"]),
		ImageUrl: fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", os.Getenv("S3_BUCKET"), os.Getenv("AWS_REGION"), getStringValue(result.Item["image"])),
	}
	fmt.Println(course)

	c.JSON(http.StatusOK, course)
}

// Fetch enrolled courses for a user
func getEnrolled(c *gin.Context) {

	userId := c.Param("userId")

	// Find the database and collection
	collection := mongoClient.Database(os.Getenv("DATABASE_NAME")).Collection("enrolls")

	var results []Enrollment
	filter := bson.D{{Key: "userId", Value: userId}}

	// Query MongoDB
	cursor, err := collection.Find(context.Background(), filter)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}
	defer cursor.Close(context.Background())

	// Decode the results
	for cursor.Next(context.Background()) {
		var enroll Enrollment
		if err := cursor.Decode(&enroll); err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
			return
		}
		results = append(results, enroll)
	}

	// Handle case when no records are found
	if len(results) == 0 {
		c.JSON(http.StatusNotFound, gin.H{"message": "No enrollment found"})
		return
	}

	// Send the response with status 200 and the results
	c.JSON(http.StatusOK, results)
}

func validateTokenMiddleware(c *gin.Context) {
	// Get token from HTTP-only cookies
	tokenCookie, err := c.Cookie("access_token")
	if err != nil || tokenCookie == "" {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Missing or invalid token"})
		c.Abort()
		return
	}

	// Send token to Auth Service for validation
	authServiceURL := os.Getenv("AUTH_SERVICE_URL")
	reqBody := bytes.NewBuffer([]byte(fmt.Sprintf(`{"token": "%s"}`, tokenCookie)))

	req, err := http.NewRequest("POST", authServiceURL, reqBody)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create request for auth service"})
		c.Abort()
		return
	}

	req.Header.Set("Content-Type", "application/json")

	// Ensure cookies are sent with the request
	client := &http.Client{}
	req.AddCookie(&http.Cookie{Name: "token", Value: tokenCookie})

	resp, err := client.Do(req)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to send request to auth service"})
		c.Abort()
		return
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Invalid token"})
		c.Abort()
		return
	}

	// Token is valid, proceed to the next handler
	c.Next()
}

func getStringValue(av types.AttributeValue) string {
	if v, ok := av.(*types.AttributeValueMemberS); ok {
		return v.Value
	}
	return ""
}

func getIntValue(av types.AttributeValue) int {
	if v, ok := av.(*types.AttributeValueMemberN); ok {
		n, err := strconv.Atoi(v.Value)
		if err != nil {
			return 0
		}
		return n
	}
	return 0
}

func main() {
	// Connect to MongoDB
	var err error
	mongoClient, err = connectToMongo()
	if err != nil {
		log.Fatalf("Error connecting to MongoDB: %v", err)
	}
	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins:     []string{"http://localhost:3000"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
	}))

	r.Use(validateTokenMiddleware)

	r.GET("/course/get", getCourses)
	r.GET("/course/get/:courseId", getCourseById)
	r.GET("/course/enrolled/:userId", getEnrolled)

	r.Run(":4000")
}
