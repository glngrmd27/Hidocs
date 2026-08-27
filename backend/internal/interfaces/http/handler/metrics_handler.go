package handler

import (
	"strings"

	"backend/internal/application/service"
	"backend/internal/infrastructure/metrics"
	"backend/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type MetricsHandler struct {
	metricsService service.MetricsService
}

func NewMetricsHandler(metricsService service.MetricsService) *MetricsHandler {
	return &MetricsHandler{metricsService: metricsService}
}

// GetRealtimeMetrics godoc
// @Summary Stream or fetch real-time traffic telemetry metrics
// @Description Stream live telemetry via WebSocket or retrieve instantaneous snapshot JSON (RPS, Latency P95/P99, Active Users, Submissions).
// @Tags Telemetry & Monitoring
// @Produce json
// @Security BearerAuth
// @Success 200 {object} dto.RealtimeMetricsResponse
// @Router /api/v1/admin/metrics/realtime [get]
func (h *MetricsHandler) GetRealtimeMetrics(c *gin.Context) {
	// Check if client requests WebSocket upgrade
	upgradeHeader := c.GetHeader("Upgrade")
	if c.IsWebsocket() || strings.ToLower(upgradeHeader) == "websocket" {
		collector := metrics.GetCollector()
		collector.HandleWebSocket(c.Writer, c.Request)
		return
	}

	data, err := h.metricsService.GetRealtimeMetrics(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve realtime metrics", err)
		return
	}

	response.OK(c, "Realtime traffic metrics retrieved successfully", data)
}

// GetSystemMetrics godoc
// @Summary Get Go runtime & PostgreSQL connection pool health metrics
// @Description Monitor CPU, memory allocations, goroutines count, and database connection pool status during peak load.
// @Tags Telemetry & Monitoring
// @Produce json
// @Security BearerAuth
// @Success 200 {object} dto.SystemMetricsResponse
// @Router /api/v1/admin/metrics/system [get]
func (h *MetricsHandler) GetSystemMetrics(c *gin.Context) {
	data, err := h.metricsService.GetSystemMetrics(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve system metrics", err)
		return
	}

	response.OK(c, "System health metrics retrieved successfully", data)
}

// GetLiveExams godoc
// @Summary Get active live exams and real-time student distribution
// @Description Monitor active exams currently in progress and distribution of students taking each exam.
// @Tags Telemetry & Monitoring
// @Produce json
// @Security BearerAuth
// @Success 200 {object} dto.LiveExamsResponse
// @Router /api/v1/admin/metrics/live-exams [get]
func (h *MetricsHandler) GetLiveExams(c *gin.Context) {
	data, err := h.metricsService.GetLiveExams(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve live exams metrics", err)
		return
	}

	response.OK(c, "Active live exams retrieved successfully", data)
}

// GetTrafficHistory godoc
// @Summary Get historical traffic time-series data for dashboard charts
// @Description Retrieve traffic time-series (RPS, Latency ms, Error count) over the last 1-2 hours for Line Chart visualization.
// @Tags Telemetry & Monitoring
// @Produce json
// @Security BearerAuth
// @Param duration query string false "Duration (e.g. 1h, today)"
// @Success 200 {object} dto.TrafficHistoryResponse
// @Router /api/v1/admin/metrics/traffic-history [get]
func (h *MetricsHandler) GetTrafficHistory(c *gin.Context) {
	duration := c.DefaultQuery("duration", "1h")

	data, err := h.metricsService.GetTrafficHistory(c.Request.Context(), duration)
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve traffic history", err)
		return
	}

	response.OK(c, "Traffic history retrieved successfully", data)
}

// GetFormMetrics godoc
// @Summary Monitor live student activity on a specific form/exam
// @Description Track live active students taking a specific exam form in real-time.
// @Tags Telemetry & Monitoring
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID UUID"
// @Success 200 {object} response.APIResponse{data=dto.FormMetricsDTO}
// @Router /api/v1/admin/metrics/forms/{form_id} [get]
func (h *MetricsHandler) GetFormMetrics(c *gin.Context) {
	formID, err := uuid.Parse(c.Param("form_id"))
	if err != nil {
		response.BadRequest(c, "Invalid form_id UUID format", err)
		return
	}

	data, err := h.metricsService.GetFormMetrics(c.Request.Context(), formID)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.OK(c, "Form live metrics retrieved successfully", data)
}
