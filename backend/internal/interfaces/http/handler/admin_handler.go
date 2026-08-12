package handler

import (
	"backend/internal/application/dto"
	"backend/internal/application/service"
	"backend/pkg/response"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

type AdminHandler struct {
	adminService service.AdminService
}

func NewAdminHandler(adminService service.AdminService) *AdminHandler {
	return &AdminHandler{adminService: adminService}
}

// GetDashboardStats godoc
// @Summary Get admin dashboard global statistics
// @Tags Admin
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse{data=domain.AdminStats}
// @Router /api/v1/admin/dashboard/stats [get]
func (h *AdminHandler) GetDashboardStats(c *gin.Context) {
	stats, err := h.adminService.GetDashboardStats(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to retrieve dashboard stats", err)
		return
	}

	response.OK(c, "Admin dashboard stats retrieved successfully", stats)
}

// ListCreators godoc
// @Summary List form creators/users
// @Tags Admin
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse{data=[]dto.CreatorResponse}
// @Router /api/v1/admin/creators [get]
func (h *AdminHandler) ListCreators(c *gin.Context) {
	creators, err := h.adminService.ListCreators(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to list creators", err)
		return
	}

	response.OK(c, "Creators retrieved successfully", creators)
}

// CreateCreator godoc
// @Summary Create a new form creator account
// @Tags Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.RegisterRequest true "Create Creator Payload"
// @Success 201 {object} response.APIResponse{data=dto.UserResponse}
// @Router /api/v1/admin/creators [post]
func (h *AdminHandler) CreateCreator(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err)
		return
	}

	creator, err := h.adminService.CreateCreator(c.Request.Context(), req)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.Created(c, "Creator created successfully", creator)
}

// UpdateCreatorStatus godoc
// @Summary Update creator active/inactive status
// @Tags Admin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param creator_id path string true "Creator ID"
// @Param request body dto.UpdateCreatorStatusRequest true "Status Payload"
// @Success 200 {object} response.APIResponse
// @Router /api/v1/admin/creators/{creator_id}/status [put]
func (h *AdminHandler) UpdateCreatorStatus(c *gin.Context) {
	creatorID, err := uuid.Parse(c.Param("creator_id"))
	if err != nil {
		response.BadRequest(c, "Invalid creator_id UUID format", err)
		return
	}

	var req dto.UpdateCreatorStatusRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err)
		return
	}

	if err := h.adminService.UpdateCreatorStatus(c.Request.Context(), creatorID, req); err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.OK(c, "Creator status updated successfully", nil)
}

// ListAllForms godoc
// @Summary List all system forms
// @Tags Admin
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse{data=[]dto.FormResponseDTO}
// @Router /api/v1/admin/forms [get]
func (h *AdminHandler) ListAllForms(c *gin.Context) {
	forms, err := h.adminService.ListAllForms(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to list forms", err)
		return
	}

	response.OK(c, "All forms retrieved successfully", forms)
}

// CreateAdmin godoc
// @Summary Create a new admin account (SuperAdmin only)
// @Tags SuperAdmin
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.RegisterRequest true "Create Admin Payload"
// @Success 201 {object} response.APIResponse{data=dto.UserResponse}
// @Router /api/v1/superadmin/create-admin [post]
func (h *AdminHandler) CreateAdmin(c *gin.Context) {
	var req dto.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err)
		return
	}

	admin, err := h.adminService.CreateAdmin(c.Request.Context(), req)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.Created(c, "Admin account created successfully", admin)
}

// ListAdmins godoc
// @Summary List all admin accounts (SuperAdmin only)
// @Tags SuperAdmin
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse{data=[]dto.UserResponse}
// @Router /api/v1/superadmin/list-admin [get]
func (h *AdminHandler) ListAdmins(c *gin.Context) {
	admins, err := h.adminService.ListAdmins(c.Request.Context())
	if err != nil {
		response.InternalServerError(c, "Failed to list admins", err)
		return
	}

	response.OK(c, "Admins retrieved successfully", admins)
}

// DeleteForm godoc
// @Summary Delete form as admin
// @Tags Admin
// @Security BearerAuth
// @Param form_id path string true "Form ID"
// @Success 200 {object} response.APIResponse
// @Router /api/v1/admin/forms/{form_id} [delete]
func (h *AdminHandler) DeleteForm(c *gin.Context) {
	formID, err := uuid.Parse(c.Param("form_id"))
	if err != nil {
		response.BadRequest(c, "Invalid form_id UUID format", err)
		return
	}

	if err := h.adminService.DeleteForm(c.Request.Context(), formID); err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.OK(c, "Form deleted successfully by admin", nil)
}
