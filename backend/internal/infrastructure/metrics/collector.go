package metrics

import (
	"encoding/json"
	"log"
	"net/http"
	"sort"
	"sync"
	"sync/atomic"
	"time"

	"backend/internal/application/dto"
	"github.com/gorilla/websocket"
)

type TimePoint struct {
	Timestamp time.Time
	Requests  uint64
	Duration  float64
	Errors    uint64
}

type MetricsCollector struct {
	mu sync.RWMutex

	// Counters
	activeRequests    int64
	totalRequests     uint64
	totalSubmissions  uint64
	submissionsToday  uint64
	status2xx         uint64
	status4xx         uint64
	status5xx         uint64

	// Sliding Latency Sample Buffer (max 1000)
	latencies    []float64
	maxSamples   int

	// Sliding Active IPs (Active Users in last 60s)
	activeIPs map[string]time.Time

	// Form Active Session Tracking (form_id -> map[ip]expireTime)
	formSessions map[string]map[string]time.Time

	// Time-Series History (1-minute resolution buckets, max 120 points)
	history []dto.TimeSeriesPoint

	// WebSocket Hub
	upgrader    websocket.Upgrader
	clients     map[*websocket.Conn]bool
	broadcast   chan []byte
	register    chan *websocket.Conn
	unregister  chan *websocket.Conn

	lastTickTime  time.Time
	lastReqCount  uint64
	lastSubCount  uint64
	currentRPS    float64
	currentSubPM  int64
}

var globalCollector *MetricsCollector
var once sync.Once

func GetCollector() *MetricsCollector {
	once.Do(func() {
		globalCollector = &MetricsCollector{
			maxSamples:   1000,
			latencies:    make([]float64, 0, 1000),
			activeIPs:    make(map[string]time.Time),
			formSessions: make(map[string]map[string]time.Time),
			history:      make([]dto.TimeSeriesPoint, 0, 120),
			clients:      make(map[*websocket.Conn]bool),
			broadcast:    make(chan []byte, 256),
			register:     make(chan *websocket.Conn),
			unregister:   make(chan *websocket.Conn),
			lastTickTime: time.Now(),
			upgrader: websocket.Upgrader{
				CheckOrigin: func(r *http.Request) bool {
					return true // Allow all origins for CORS WebSocket
				},
			},
		}

		go globalCollector.runWebSocketHub()
		go globalCollector.startPeriodicTicker()
	})
	return globalCollector
}

func (c *MetricsCollector) RecordRequest(ip, path string, statusCode int, durationMS float64, formID string) {
	atomic.AddInt64(&c.activeRequests, 1)
	atomic.AddUint64(&c.totalRequests, 1)

	// Status code buckets
	if statusCode >= 200 && statusCode < 400 {
		atomic.AddUint64(&c.status2xx, 1)
	} else if statusCode >= 400 && statusCode < 500 {
		atomic.AddUint64(&c.status4xx, 1)
	} else if statusCode >= 500 {
		atomic.AddUint64(&c.status5xx, 1)
	}

	c.mu.Lock()
	defer c.mu.Unlock()

	// Track Active IP (60s TTL)
	now := time.Now()
	if ip != "" {
		c.activeIPs[ip] = now.Add(60 * time.Second)
	}

	// Record latency sample
	if len(c.latencies) >= c.maxSamples {
		c.latencies = c.latencies[1:]
	}
	c.latencies = append(c.latencies, durationMS)

	// Form session & submission tracking
	if formID != "" {
		if _, exists := c.formSessions[formID]; !exists {
			c.formSessions[formID] = make(map[string]time.Time)
		}
		c.formSessions[formID][ip] = now.Add(60 * time.Second)
	}
}

func (c *MetricsCollector) RecordRequestFinished() {
	atomic.AddInt64(&c.activeRequests, -1)
}

func (c *MetricsCollector) RecordSubmission(formID string) {
	atomic.AddUint64(&c.totalSubmissions, 1)
	atomic.AddUint64(&c.submissionsToday, 1)
}

func (c *MetricsCollector) GetActiveFormStudents(formID string) int64 {
	c.mu.RLock()
	defer c.mu.RUnlock()

	sessionMap, exists := c.formSessions[formID]
	if !exists {
		return 0
	}

	now := time.Now()
	var count int64
	for _, expiresAt := range sessionMap {
		if now.Before(expiresAt) {
			count++
		}
	}
	return count
}

func (c *MetricsCollector) GetRealtimeMetrics() dto.RealtimeMetricsData {
	c.mu.RLock()
	defer c.mu.RUnlock()

	now := time.Now()

	// Clean expired active IPs
	var activeUsers int64
	for _, expiresAt := range c.activeIPs {
		if now.Before(expiresAt) {
			activeUsers++
		}
	}
	if activeUsers == 0 {
		activeUsers = atomic.LoadInt64(&c.activeRequests)
		if activeUsers < 0 {
			activeUsers = 0
		}
	}

	// Calculate latency stats (Avg, P95, P99)
	avg, p95, p99 := c.calculateLatenciesUnsafe()

	// Error rate
	totalReq := atomic.LoadUint64(&c.totalRequests)
	s2xx := atomic.LoadUint64(&c.status2xx)
	s4xx := atomic.LoadUint64(&c.status4xx)
	s5xx := atomic.LoadUint64(&c.status5xx)

	var errorRate float64
	if totalReq > 0 {
		errorRate = (float64(s4xx+s5xx) / float64(totalReq)) * 100.0
	}

	return dto.RealtimeMetricsData{
		Timestamp:             now.UTC().Format(time.RFC3339),
		ActiveUsers:           activeUsers,
		ActiveConnections:     atomic.LoadInt64(&c.activeRequests),
		RequestsPerSecond:     c.currentRPS,
		SubmissionsPerMinute:  c.currentSubPM,
		TotalSubmissionsToday: int64(atomic.LoadUint64(&c.submissionsToday)),
		AverageResponseTimeMS: avg,
		P95ResponseTimeMS:     p95,
		P99ResponseTimeMS:     p99,
		ErrorRatePercent:      errorRate,
		Latency: dto.LatencyStats{
			AvgMS: avg,
			P95MS: p95,
			P99MS: p99,
		},
		HttpStatusBreakdown: dto.HttpStatusBreakdown{
			Status2xx: int64(s2xx),
			Status4xx: int64(s4xx),
			Status5xx: int64(s5xx),
		},
	}
}

func (c *MetricsCollector) calculateLatenciesUnsafe() (avg, p95, p99 float64) {
	n := len(c.latencies)
	if n == 0 {
		return 0.0, 0.0, 0.0
	}

	// Clone & Sort
	samples := make([]float64, n)
	copy(samples, c.latencies)
	sort.Float64s(samples)

	var sum float64
	for _, v := range samples {
		sum += v
	}
	avg = sum / float64(n)

	p95Idx := int(float64(n) * 0.95)
	if p95Idx >= n {
		p95Idx = n - 1
	}
	p95 = samples[p95Idx]

	p99Idx := int(float64(n) * 0.99)
	if p99Idx >= n {
		p99Idx = n - 1
	}
	p99 = samples[p99Idx]

	return avg, p95, p99
}

func (c *MetricsCollector) GetTrafficHistory(duration string) dto.TrafficHistoryData {
	c.mu.RLock()
	defer c.mu.RUnlock()

	res := make([]dto.TimeSeriesPoint, len(c.history))
	copy(res, c.history)

	return dto.TrafficHistoryData{
		TimeSeries: res,
	}
}

func (c *MetricsCollector) HandleWebSocket(w http.ResponseWriter, r *http.Request) {
	conn, err := c.upgrader.Upgrade(w, r, nil)
	if err != nil {
		log.Printf("WebSocket upgrade failed: %v", err)
		return
	}

	c.register <- conn

	// Send initial snapshot immediately
	snapshot := c.GetRealtimeMetrics()
	payload, _ := json.Marshal(dto.RealtimeMetricsResponse{
		Success: true,
		Message: "Realtime traffic metrics stream",
		Data:    snapshot,
	})
	_ = conn.WriteMessage(websocket.TextMessage, payload)

	// Keep alive read loop
	go func() {
		defer func() {
			c.unregister <- conn
			conn.Close()
		}()
		for {
			_, _, err := conn.ReadMessage()
			if err != nil {
				break
			}
		}
	}()
}

func (c *MetricsCollector) runWebSocketHub() {
	for {
		select {
		case conn := <-c.register:
			c.mu.Lock()
			c.clients[conn] = true
			c.mu.Unlock()
			log.Printf("🔌 Superadmin WebSocket client connected (Total: %d)", len(c.clients))

		case conn := <-c.unregister:
			c.mu.Lock()
			if _, ok := c.clients[conn]; ok {
				delete(c.clients, conn)
				conn.Close()
			}
			c.mu.Unlock()
			log.Printf("🔌 Superadmin WebSocket client disconnected")

		case message := <-c.broadcast:
			c.mu.Lock()
			for conn := range c.clients {
				err := conn.WriteMessage(websocket.TextMessage, message)
				if err != nil {
					log.Printf("WebSocket write error: %v", err)
					conn.Close()
					delete(c.clients, conn)
				}
			}
			c.mu.Unlock()
		}
	}
}

func (c *MetricsCollector) startPeriodicTicker() {
	ticker := time.NewTicker(1500 * time.Millisecond)
	minuteTicker := time.NewTicker(1 * time.Minute)

	defer ticker.Stop()
	defer minuteTicker.Stop()

	for {
		select {
		case <-ticker.C:
			now := time.Now()
			c.mu.Lock()

			elapsed := now.Sub(c.lastTickTime).Seconds()
			if elapsed > 0 {
				totalReq := atomic.LoadUint64(&c.totalRequests)
				reqDiff := totalReq - c.lastReqCount
				c.currentRPS = float64(reqDiff) / elapsed
				c.lastReqCount = totalReq

				totalSub := atomic.LoadUint64(&c.totalSubmissions)
				subDiff := totalSub - c.lastSubCount
				c.currentSubPM = int64(float64(subDiff) * (60.0 / elapsed))
				c.lastSubCount = totalSub
			}
			c.lastTickTime = now
			c.mu.Unlock()

			// Broadcast metrics to connected WebSocket clients
			metricsData := c.GetRealtimeMetrics()
			resp := dto.RealtimeMetricsResponse{
				Success: true,
				Message: "Realtime traffic metrics stream",
				Data:    metricsData,
			}
			jsonBytes, err := json.Marshal(resp)
			if err == nil {
				c.broadcast <- jsonBytes
			}

		case <-minuteTicker.C:
			// Save 1-minute resolution point for history graph
			now := time.Now()
			metricsData := c.GetRealtimeMetrics()
			point := dto.TimeSeriesPoint{
				Time:      now.Format("15:04"),
				RPS:       metricsData.RequestsPerSecond,
				LatencyMS: metricsData.AverageResponseTimeMS,
				Errors:    int64(atomic.LoadUint64(&c.status5xx)),
			}

			c.mu.Lock()
			if len(c.history) >= 120 {
				c.history = c.history[1:]
			}
			c.history = append(c.history, point)
			c.mu.Unlock()
		}
	}
}
