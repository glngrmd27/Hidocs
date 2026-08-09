package middleware

import (
	"net/http"
	"sync"
	"time"

	"backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type clientLimit struct {
	count     int
	lastReset time.Time
}

var (
	clients = make(map[string]*clientLimit)
	mu      sync.Mutex
)

func RateLimiter(requestsPerMinute int) gin.HandlerFunc {
	return func(c *gin.Context) {
		ip := c.ClientIP()

		mu.Lock()
		client, exists := clients[ip]
		if !exists || time.Since(client.lastReset) > time.Minute {
			clients[ip] = &clientLimit{
				count:     1,
				lastReset: time.Now(),
			}
			mu.Unlock()
			c.Next()
			return
		}

		if client.count >= requestsPerMinute {
			mu.Unlock()
			response.Error(c, http.StatusTooManyRequests, "Rate limit exceeded. Please try again later.", nil)
			c.Abort()
			return
		}

		client.count++
		mu.Unlock()
		c.Next()
	}
}
