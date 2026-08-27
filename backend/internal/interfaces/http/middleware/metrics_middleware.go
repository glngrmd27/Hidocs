package middleware

import (
	"strings"
	"time"

	"backend/internal/infrastructure/metrics"
	"github.com/gin-gonic/gin"
)

func TrackMetrics() gin.HandlerFunc {
	collector := metrics.GetCollector()

	return func(c *gin.Context) {
		start := time.Now()
		clientIP := c.ClientIP()
		path := c.Request.URL.Path

		// Extract Form ID if in path
		formID := c.Param("form_id")
		if formID == "" && strings.Contains(path, "/forms/") {
			parts := strings.Split(path, "/")
			for i, p := range parts {
				if p == "forms" && i+1 < len(parts) {
					formID = parts[i+1]
					break
				}
			}
		}

		c.Next()

		durationMS := float64(time.Since(start).Nanoseconds()) / 1e6
		statusCode := c.Writer.Status()

		collector.RecordRequest(clientIP, path, statusCode, durationMS, formID)
		collector.RecordRequestFinished()

		// Record submission metric if endpoint is form submit
		if strings.HasSuffix(path, "/submit") && c.Request.Method == "POST" && statusCode < 400 {
			collector.RecordSubmission(formID)
		}
	}
}
