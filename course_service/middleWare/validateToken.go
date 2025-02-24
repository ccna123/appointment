package middleware

import (
	"bytes"
	"fmt"
	"net/http"
	"os"

	"github.com/gin-gonic/gin"
)

func ValidateTokenMiddleware(c *gin.Context) {
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
