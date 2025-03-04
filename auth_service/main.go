package main

import (
	"auth_service_go/controllers"
	"auth_service_go/initializer"
	"fmt"
	"os"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func init() {
	if os.Getenv("ENV") != "prod" {
		initializer.InitEnv()
	}
	initializer.InitCognitoParam()
}

func main() {

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins:     []string{os.Getenv("CORS_ORIGIN")},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
	}))
	r.POST("/auth/login", controllers.Login)
	r.POST("/auth/signup", controllers.Signup)
	r.POST("/auth/validate", controllers.ValidateToken)
	
	port := "4020"
	fmt.Printf("Auth service is listening on port %s\n", port)

	// Start the server on the specified port
	r.Run(":" + port)

}
