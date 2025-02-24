package controllers

import (
	"context"
	"course_service/helper"
	"course_service/initializer"
	"course_service/models"
	"fmt"
	"net/http"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/gin-gonic/gin"
	"go.mongodb.org/mongo-driver/bson"
)

func GetCourses(c *gin.Context) {
	tableName := os.Getenv("DYNAMODB_TABLE")
	params := &dynamodb.ScanInput{
		TableName: aws.String(tableName),
	}

	result, err := initializer.DynamodbClient.Scan(context.TODO(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	var courses []models.Course
	for _, item := range result.Items {
		course := models.Course{
			CourseId: helper.GetStringValue(item["courseId"]),
			Title:    helper.GetStringValue(item["title"]),
			Price:    helper.GetIntValue(item["price"]),
			Length:   helper.GetIntValue(item["length"]),
			Enrolled: helper.GetIntValue(item["enrolled"]),
			Image:    helper.GetStringValue(item["image"]),
			ImageUrl: fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", os.Getenv("S3_BUCKET"), os.Getenv("AWS_REGION"), helper.GetStringValue(item["image"])),
		}
		courses = append(courses, course)
	}

	c.JSON(http.StatusOK, courses)
}

func GetCourseById(c *gin.Context) {
	tableName := os.Getenv("DYNAMODB_TABLE")
	courseId := c.Param("courseId")
	params := &dynamodb.GetItemInput{
		TableName: aws.String(tableName),
		Key: map[string]types.AttributeValue{
			"courseId": &types.AttributeValueMemberS{Value: courseId},
		},
	}

	result, err := initializer.DynamodbClient.GetItem(context.TODO(), params)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": err.Error()})
		return
	}

	if result.Item == nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Course not found"})
		return
	}

	course := models.Course{
		CourseId: helper.GetStringValue(result.Item["courseId"]),
		Title:    helper.GetStringValue(result.Item["title"]),
		Price:    helper.GetIntValue(result.Item["price"]),
		Length:   helper.GetIntValue(result.Item["length"]),
		Enrolled: helper.GetIntValue(result.Item["enrolled"]),
		Image:    helper.GetStringValue(result.Item["image"]),
		ImageUrl: fmt.Sprintf("https://%s.s3.%s.amazonaws.com/%s", os.Getenv("S3_BUCKET"), os.Getenv("AWS_REGION"), helper.GetStringValue(result.Item["image"])),
	}

	c.JSON(http.StatusOK, course)
}

func GetEnrolled(c *gin.Context) {

	userId := c.Param("userId")

	// Find the database and collection
	collection := initializer.MongoClient.Database(os.Getenv("DATABASE_NAME")).Collection("enrolls")

	var results []models.Enrollment
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
		var enroll models.Enrollment
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
