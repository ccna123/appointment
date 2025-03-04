package main

import (
	"course_service/controllers"
	"course_service/initializer"
	middleware "course_service/middleWare"
	"fmt"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
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

func init() {
	if os.Getenv("ENV") != "prod" {
		initializer.InitEnv()
	}
	initializer.InitDynamodb()
	initializer.ConnectToMongo()
}

func main() {

	r := gin.Default()

	r.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins:     []string{os.Getenv("CORS_ORIGIN")},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
	}))

	r.GET("/course/get", controllers.GetCourses)
	r.GET("/course/get/:courseId", middleware.ValidateTokenMiddleware, controllers.GetCourseById)
	r.GET("/course/enrolled/:userId", middleware.ValidateTokenMiddleware, controllers.GetEnrolled)

	port := "4000"
	fmt.Printf("Course service is listening on port %s\n", port)

	// Start the server on the specified port
	r.Run(":" + port)
}
