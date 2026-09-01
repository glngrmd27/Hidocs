package handler

import (
	"io"

	"backend/internal/application/dto"
	"backend/internal/application/service"
	"backend/internal/domain"
	"backend/internal/infrastructure/security"
	"backend/internal/interfaces/http/middleware"
	"backend/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type FormHandler struct {
	formService service.FormService
	docxService service.DocxService
}

func NewFormHandler(formService service.FormService, docxService service.DocxService) *FormHandler {
	return &FormHandler{
		formService: formService,
		docxService: docxService,
	}
}

// ListForms godoc
// @Summary List user forms ('My Forms')
// @Tags Forms
// @Produce json
// @Security BearerAuth
// @Param status query string false "Filter by status (DRAFT, ACTIVE, CLOSED)"
// @Success 200 {object} response.APIResponse{data=[]dto.FormResponseDTO}
// @Router /api/v1/forms [get]
func (h *FormHandler) ListForms(c *gin.Context) {
	claims := c.MustGet(middleware.UserContextKey).(*security.JWTClaims)
	status := domain.FormStatus(c.Query("status"))

	forms, err := h.formService.ListUserForms(c.Request.Context(), claims.UserID, status)
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve forms", err)
		return
	}

	response.OK(c, "Forms retrieved successfully", forms)
}

// CreateForm godoc
// @Summary Create a new form
// @Tags Forms
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.CreateFormRequest true "Create Form Payload"
// @Success 201 {object} response.APIResponse{data=dto.FormResponseDTO}
// @Router /api/v1/forms [post]
func (h *FormHandler) CreateForm(c *gin.Context) {
	claims := c.MustGet(middleware.UserContextKey).(*security.JWTClaims)

	var req dto.CreateFormRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err)
		return
	}

	form, err := h.formService.CreateForm(c.Request.Context(), claims.UserID, req)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.Created(c, "Form created successfully", form)
}

// GetFormByID godoc
// @Summary Get form details
// @Tags Forms
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Success 200 {object} response.APIResponse{data=dto.FormResponseDTO}
// @Router /api/v1/forms/{form_id} [get]
func (h *FormHandler) GetFormByID(c *gin.Context) {
	formID, err := uuid.Parse(c.Param("form_id"))
	if err != nil {
		response.BadRequest(c, "Invalid form_id UUID format", err)
		return
	}

	form, err := h.formService.GetFormByID(c.Request.Context(), formID)
	if err != nil {
		response.NotFound(c, err.Error(), err)
		return
	}

	response.OK(c, "Form retrieved successfully", form)
}

// UpdateForm godoc
// @Summary Update form details
// @Tags Forms
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param request body dto.UpdateFormRequest true "Update Form Payload"
// @Success 200 {object} response.APIResponse{data=dto.FormResponseDTO}
// @Router /api/v1/forms/{form_id} [put]
func (h *FormHandler) UpdateForm(c *gin.Context) {
	claims := c.MustGet(middleware.UserContextKey).(*security.JWTClaims)

	formID, err := uuid.Parse(c.Param("form_id"))
	if err != nil {
		response.BadRequest(c, "Invalid form_id UUID format", err)
		return
	}

	var req dto.UpdateFormRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err)
		return
	}

	form, err := h.formService.UpdateForm(c.Request.Context(), claims.UserID, formID, req)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.OK(c, "Form updated successfully", form)
}

// DeleteForm godoc
// @Summary Delete a form
// @Tags Forms
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Success 200 {object} response.APIResponse
// @Router /api/v1/forms/{form_id} [delete]
func (h *FormHandler) DeleteForm(c *gin.Context) {
	claims := c.MustGet(middleware.UserContextKey).(*security.JWTClaims)

	formID, err := uuid.Parse(c.Param("form_id"))
	if err != nil {
		response.BadRequest(c, "Invalid form_id UUID format", err)
		return
	}

	if err := h.formService.DeleteForm(c.Request.Context(), claims.UserID, formID); err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.OK(c, "Form deleted successfully", nil)
}

// UpdateFormSettings godoc
// @Summary Update form settings (Timer, Schedule, One-Time Submission, Randomization)
// @Tags Forms
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Param request body dto.UpdateFormSettingsRequest true "Form Settings Payload"
// @Success 200 {object} response.APIResponse{data=domain.FormSettings}
// @Router /api/v1/forms/{form_id}/settings [put]
func (h *FormHandler) UpdateFormSettings(c *gin.Context) {
	claims := c.MustGet(middleware.UserContextKey).(*security.JWTClaims)

	formID, err := uuid.Parse(c.Param("form_id"))
	if err != nil {
		response.BadRequest(c, "Invalid form_id UUID format", err)
		return
	}

	var req dto.UpdateFormSettingsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err)
		return
	}

	settings, err := h.formService.UpdateFormSettings(c.Request.Context(), claims.UserID, formID, req)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.OK(c, "Form settings updated successfully", settings)
}

// ImportDocx godoc
// @Summary Import form from Word .docx file
// @Tags Forms
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param file formData file true "Word Document (.docx)"
// @Success 201 {object} response.APIResponse{data=dto.FormResponseDTO}
// @Router /api/v1/forms/import-docx [post]
func (h *FormHandler) ImportDocx(c *gin.Context) {
	claims := c.MustGet(middleware.UserContextKey).(*security.JWTClaims)

	fileHeader, err := c.FormFile("file")
	if err != nil {
		response.BadRequest(c, "File is required", err)
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		response.BadRequest(c, "Failed to open file", err)
		return
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		response.BadRequest(c, "Failed to read file", err)
		return
	}

	form, err := h.docxService.ImportFormFromDocx(c.Request.Context(), claims.UserID, fileBytes)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.Created(c, "Form imported successfully from Word document", form)
}

// ImportExcel godoc
// @Summary Import form from Excel .xlsx or .csv file
// @Tags Forms
// @Accept multipart/form-data
// @Produce json
// @Security BearerAuth
// @Param file formData file true "Excel Spreadsheet (.xlsx / .csv)"
// @Success 201 {object} response.APIResponse{data=dto.FormResponseDTO}
// @Router /api/v1/forms/import-excel [post]
func (h *FormHandler) ImportExcel(c *gin.Context) {
	claims := c.MustGet(middleware.UserContextKey).(*security.JWTClaims)

	fileHeader, err := c.FormFile("file")
	if err != nil {
		response.BadRequest(c, "File is required", err)
		return
	}

	file, err := fileHeader.Open()
	if err != nil {
		response.BadRequest(c, "Failed to open file", err)
		return
	}
	defer file.Close()

	fileBytes, err := io.ReadAll(file)
	if err != nil {
		response.BadRequest(c, "Failed to read file", err)
		return
	}

	form, err := h.docxService.ImportFormFromExcel(c.Request.Context(), claims.UserID, fileBytes)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.Created(c, "Form imported successfully from Excel spreadsheet", form)
}
