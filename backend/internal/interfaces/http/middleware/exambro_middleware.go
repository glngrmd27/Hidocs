package middleware

import (
	"backend/pkg/response"
	"github.com/gin-gonic/gin"
)

func RequireExambroHeader() gin.HandlerFunc {
	return func(c *gin.Context) {
		exambroHeader := c.GetHeader("X-Exambro-Token")
		if exambroHeader == "" {
			response.Forbidden(c, "Exam must be accessed via HiDocs Exambro Secure Browser", nil)
			c.Abort()
			return
		}
		c.Next()
	}
}
