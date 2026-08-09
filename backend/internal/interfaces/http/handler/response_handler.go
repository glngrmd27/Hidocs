package handler

import (
	"fmt"
	"net/http"

	"backend/internal/application/dto"
	"backend/internal/application/service"
	"backend/internal/infrastructure/security"
	"backend/internal/interfaces/http/middleware"
	"backend/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type ResponseHandler struct {
	responseService service.ResponseService
	exportService   service.ExportService
}

func NewResponseHandler(respService service.ResponseService, expService service.ExportService) *ResponseHandler {
	return &ResponseHandler{
		responseService: respService,
		exportService:   expService,
	}
}

// SubmitForm godoc
// @Summary Submit form / exam answers
// @Tags Responses
// @Accept json
// @Produce json
// @Param form_id path string true "Form ID"
// @Param request body dto.SubmitFormRequest true "Submit Form Payload"
// @Success 200 {object} response.APIResponse{data=dto.SubmitResponseResult}
// @Router /api/v1/forms/{form_id}/submit [post]
func (h *ResponseHandler) SubmitForm(c *gin.Context) {
	formID, err := uuid.Parse(c.Param("form_id"))
	if err != nil {
		response.BadRequest(c, "Invalid form_id UUID format", err)
		return
	}

	var req dto.SubmitFormRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err)
		return
	}

	res, err := h.responseService.SubmitResponse(c.Request.Context(), formID, req)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.OK(c, res.Message, res)
}

// GetFormResponses godoc
// @Summary Get all responses for a form
// @Tags Responses
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Success 200 {object} response.APIResponse{data=[]dto.ResponseDetailDTO}
// @Router /api/v1/forms/{form_id}/responses [get]
func (h *ResponseHandler) GetFormResponses(c *gin.Context) {
	claims := c.MustGet(middleware.UserContextKey).(*security.JWTClaims)

	formID, err := uuid.Parse(c.Param("form_id"))
	if err != nil {
		response.BadRequest(c, "Invalid form_id UUID format", err)
		return
	}

	responses, err := h.responseService.GetFormResponses(c.Request.Context(), claims.UserID, formID)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.OK(c, "Responses retrieved successfully", responses)
}

// GetResponseByID godoc
// @Summary Get individual response details
// @Tags Responses
// @Produce json
// @Security BearerAuth
// @Param response_id path string true "Response ID"
// @Success 200 {object} response.APIResponse{data=dto.ResponseDetailDTO}
// @Router /api/v1/responses/{response_id} [get]
func (h *ResponseHandler) GetResponseByID(c *gin.Context) {
	claims := c.MustGet(middleware.UserContextKey).(*security.JWTClaims)

	responseID, err := uuid.Parse(c.Param("response_id"))
	if err != nil {
		response.BadRequest(c, "Invalid response_id UUID format", err)
		return
	}

	resp, err := h.responseService.GetResponseByID(c.Request.Context(), claims.UserID, responseID)
	if err != nil {
		response.NotFound(c, err.Error(), err)
		return
	}

	response.OK(c, "Response detail retrieved successfully", resp)
}

// GradeResponse godoc
// @Summary Adjust score/grade manually for a response
// @Tags Responses
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param response_id path string true "Response ID"
// @Param request body dto.GradeResponseRequest true "Grade Payload"
// @Success 200 {object} response.APIResponse
// @Router /api/v1/responses/{response_id}/grade [put]
func (h *ResponseHandler) GradeResponse(c *gin.Context) {
	claims := c.MustGet(middleware.UserContextKey).(*security.JWTClaims)

	responseID, err := uuid.Parse(c.Param("response_id"))
	if err != nil {
		response.BadRequest(c, "Invalid response_id UUID format", err)
		return
	}

	var req dto.GradeResponseRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err)
		return
	}

	if err := h.responseService.GradeResponse(c.Request.Context(), claims.UserID, responseID, req); err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.OK(c, "Grade updated successfully", nil)
}

// ExportResponses godoc
// @Summary Export form responses to Excel or CSV
// @Tags Responses
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param format query string false "Export format ('xlsx' or 'csv', default: 'xlsx')"
// @Success 200 {file} file
// @Router /api/v1/forms/{form_id}/export [get]
func (h *ResponseHandler) ExportResponses(c *gin.Context) {
	claims := c.MustGet(middleware.UserContextKey).(*security.JWTClaims)

	formID, err := uuid.Parse(c.Param("form_id"))
	if err != nil {
		response.BadRequest(c, "Invalid form_id UUID format", err)
		return
	}

	format := c.DefaultQuery("format", "xlsx")

	if format == "csv" {
		data, filename, err := h.exportService.ExportCSV(c.Request.Context(), claims.UserID, formID)
		if err != nil {
			response.BadRequest(c, err.Error(), err)
			return
		}
		c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
		c.Data(http.StatusOK, "text/csv", data)
		return
	}

	data, filename, err := h.exportService.ExportExcel(c.Request.Context(), claims.UserID, formID)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}
	c.Header("Content-Disposition", fmt.Sprintf("attachment; filename=\"%s\"", filename))
	c.Data(http.StatusOK, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", data)
}

// GetAnalytics godoc
// @Summary Get real-time analytics for charts (Pie Chart score distribution, Question accuracy bar charts)
// @Tags Analytics
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Success 200 {object} response.APIResponse{data=domain.FormAnalytics}
// @Router /api/v1/forms/{form_id}/analytics [get]
func (h *ResponseHandler) GetAnalytics(c *gin.Context) {
	claims := c.MustGet(middleware.UserContextKey).(*security.JWTClaims)

	formID, err := uuid.Parse(c.Param("form_id"))
	if err != nil {
		response.BadRequest(c, "Invalid form_id UUID format", err)
		return
	}

	analytics, err := h.responseService.GetAnalytics(c.Request.Context(), claims.UserID, formID)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.OK(c, "Analytics retrieved successfully", analytics)
}
