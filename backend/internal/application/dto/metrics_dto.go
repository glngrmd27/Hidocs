package dto

import "time"

type LatencyStats struct {
	AvgMS float64 `json:"avg_ms"`
	P95MS float64 `json:"p95_ms"`
	P99MS float64 `json:"p99_ms"`
}

type HttpStatusBreakdown struct {
	Status2xx int64 `json:"2xx_success"`
	Status4xx int64 `json:"4xx_client_err"`
	Status5xx int64 `json:"5xx_server_err"`
}

type SystemMetricsDetail struct {
	CPUUsagePercent   float64 `json:"cpu_usage_percent"`
	MemoryUsageMB     float64 `json:"memory_usage_mb"`
	DBOpenConnections int     `json:"db_open_connections"`
	DBIdleConnections int     `json:"db_idle_connections"`
}

type RealtimeMetricsData struct {
	Timestamp             string              `json:"timestamp"`
	ActiveUsers           int64               `json:"active_users"`
	ActiveConnections     int64               `json:"active_connections"`
	RequestsPerSecond     float64             `json:"requests_per_second"`
	SubmissionsPerMinute  int64               `json:"submissions_per_minute"`
	TotalSubmissionsToday int64               `json:"total_submissions_today"`
	AverageResponseTimeMS float64             `json:"average_response_time_ms"`
	P95ResponseTimeMS     float64             `json:"p95_response_time_ms"`
	P99ResponseTimeMS     float64             `json:"p99_response_time_ms"`
	ErrorRatePercent      float64             `json:"error_rate_percent"`
	Latency               LatencyStats        `json:"latency"`
	HttpStatusBreakdown   HttpStatusBreakdown `json:"http_status_breakdown"`
	SystemMetrics         SystemMetricsDetail `json:"system_metrics,omitempty"`
}

type RealtimeMetricsResponse struct {
	Success bool                `json:"success"`
	Message string              `json:"message"`
	Data    RealtimeMetricsData `json:"data"`
}

type CpuMetrics struct {
	UsagePercent float64 `json:"usage_percent"`
	Cores        int     `json:"cores"`
}

type MemoryMetrics struct {
	AllocMB  float64 `json:"alloc_mb"`
	SysMB    float64 `json:"sys_mb"`
	GCCycles uint32  `json:"gc_cycles"`
}

type DBPoolMetrics struct {
	MaxOpenConnections int   `json:"max_open_connections"`
	ActiveConnections  int   `json:"active_connections"`
	IdleConnections    int   `json:"idle_connections"`
	WaitCount          int64 `json:"wait_count"`
}

type SystemMetricsData struct {
	Timestamp       string        `json:"timestamp"`
	CPU             CpuMetrics    `json:"cpu"`
	Memory          MemoryMetrics `json:"memory"`
	GoroutinesCount int           `json:"goroutines_count"`
	DatabasePool    DBPoolMetrics `json:"database_pool"`
}

type SystemMetricsResponse struct {
	Success bool              `json:"success"`
	Message string            `json:"message"`
	Data    SystemMetricsData `json:"data"`
}

type LiveExamDTO struct {
	FormID              string     `json:"form_id"`
	Title               string     `json:"title"`
	CreatorName         string     `json:"creator_name"`
	ActiveStudents      int64      `json:"active_students"`
	SubmittedCount      int64      `json:"submitted_count"`
	TotalTargetStudents int64      `json:"total_target_students"`
	StartedAt           *time.Time `json:"started_at,omitempty"`
	EndsAt              *time.Time `json:"ends_at,omitempty"`
}

type LiveExamsResponse struct {
	Success bool          `json:"success"`
	Message string        `json:"message"`
	Data    []LiveExamDTO `json:"data"`
}

type TimeSeriesPoint struct {
	Time      string  `json:"time"`
	RPS       float64 `json:"rps"`
	LatencyMS float64 `json:"latency_ms"`
	Errors    int64   `json:"errors"`
}

type TrafficHistoryData struct {
	TimeSeries []TimeSeriesPoint `json:"time_series"`
}

type TrafficHistoryResponse struct {
	Success bool               `json:"success"`
	Message string             `json:"message"`
	Data    TrafficHistoryData `json:"data"`
}

type FormMetricsDTO struct {
	FormID         string  `json:"form_id"`
	Title          string  `json:"title"`
	ActiveStudents int64   `json:"active_students"`
	TotalSubmitted int64   `json:"total_submitted"`
	AverageScore   float64 `json:"average_score"`
}
