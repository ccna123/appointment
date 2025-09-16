package main

import (
	"auth_service_go/controllers"
	"auth_service_go/initializer"
	"context"
	"fmt"
	"log"
	"os"
	"os/signal"
	"time"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func init() {
	if os.Getenv("ENV") != "prod" {
		initializer.InitEnv()
	}
	initializer.InitCognitoParam()
	initializer.InitRedis()

}

func main() {

	stop := make(chan struct{})
	go func() {
		for {
			select {
			case <-stop:
				log.Println("Stopping credential refresh goroutine")
				return
			default:
				creds, err := initializer.CredentialsProvider.Retrieve(context.TODO())
				if err != nil {
					log.Printf("Failed to get current credentials: %v, retrying in 1 minute", err)
					time.Sleep(1 * time.Minute)
					continue
				}
				timeUntilExpiry := time.Until(creds.Expires)
				sleepDuration := timeUntilExpiry - (10 * time.Minute)
				if sleepDuration < 0 {
					initializer.RefreshCognitoCredentials()
					continue
				}
				log.Printf("Credentials expire at %v, sleeping for %v", creds.Expires, sleepDuration)
				time.Sleep(sleepDuration)
				initializer.RefreshCognitoCredentials()
			}
		}
	}()

	r := gin.Default()
	r.Use(cors.New(cors.Config{
		AllowCredentials: true,
		AllowOrigins:     []string{os.Getenv("CORS_ORIGIN")},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
	}))
	r.POST("/auth/login", controllers.Login)
	r.POST("/auth/logout", controllers.Logout)
	r.GET("/auth/login/status/:userId",controllers.GetUserLoginStatus)
	r.POST("/auth/signup", controllers.Signup)
	r.POST("/auth/validate", controllers.ValidateToken)
	
	port := "4020"
	fmt.Printf("Auth service is listening on port %s\n", port)

	// Handle shutdown gracefully
	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt) // Catch Ctrl+C
	go func() {
		<-sigChan
		log.Println("Shutting down...")
		close(stop) // Signal the refresh goroutine to stop
		os.Exit(0)
	}()

	// Start the server on the specified port
	r.Run(":" + port)

}
