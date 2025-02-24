package helper

import (
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v4"
)

func DecodeToken(tokenStr string) (map[string]any, error) {
	token, _, _ := jwt.NewParser().ParseUnverified(tokenStr, jwt.MapClaims{})
	claims, _ := token.Claims.(jwt.MapClaims)

	// Return decoded claims
	return gin.H{
		"userId": claims["sub"],
		"email":  claims["email"],
		"role":   claims["custom:role"],
		"name":   claims["name"],
	}, nil
}
