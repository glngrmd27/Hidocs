package handler

import (
	"backend/internal/application/service"
	"backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type PublicHandler struct {
	formService service.FormService
}

func NewPublicHandler(formService service.FormService) *PublicHandler {
	return &PublicHandler{formService: formService}
}

// GetPublicForm godoc
// @Summary Access public form by custom URL slug or short code
// @Tags Public
// @Produce json
// @Param short_code path string true "Custom URL Slug or Form ID"
// @Success 200 {object} response.APIResponse{data=dto.PublicFormDTO}
// @Router /api/v1/public/forms/{short_code} [get]
func (h *PublicHandler) GetPublicForm(c *gin.Context) {
	shortCode := c.Param("short_code")
	if shortCode == "" {
		response.BadRequest(c, "Short code or custom URL is required", nil)
		return
	}

	formDTO, err := h.formService.GetPublicForm(c.Request.Context(), shortCode)
	if err != nil {
		response.NotFound(c, err.Error(), err)
		return
	}

	response.OK(c, "Public form retrieved successfully", formDTO)
}

// GetFormQRCode godoc
// @Summary Generate QR Code URL for public form access
// @Tags Public
// @Produce json
// @Param short_code path string true "Custom URL Slug or Form ID"
// @Success 200 {object} response.APIResponse
// @Router /api/v1/public/forms/{short_code}/qr [get]
func (h *PublicHandler) GetFormQRCode(c *gin.Context) {
	shortCode := c.Param("short_code")
	if shortCode == "" {
		response.BadRequest(c, "Short code or custom URL is required", nil)
		return
	}

	qrURL, err := h.formService.GetFormQRCode(c.Request.Context(), shortCode)
	if err != nil {
		response.NotFound(c, err.Error(), err)
		return
	}

	response.OK(c, "QR code generated successfully", gin.H{
		"short_code": shortCode,
		"qr_code_url": qrURL,
	})
}
