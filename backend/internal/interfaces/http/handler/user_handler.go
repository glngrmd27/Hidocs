package handler

import (
	"backend/internal/application/dto"
	"backend/internal/application/service"
	"backend/internal/infrastructure/security"
	"backend/internal/interfaces/http/middleware"
	"backend/pkg/response"
	"github.com/gin-gonic/gin"
)

type UserHandler struct {
	userService service.UserService
}

func NewUserHandler(userService service.UserService) *UserHandler {
	return &UserHandler{userService: userService}
}

// GetProfile godoc
// @Summary Get current user profile
// @Tags Users
// @Produce json
// @Security BearerAuth
// @Success 200 {object} response.APIResponse{data=dto.UserResponse}
// @Router /api/v1/users/me [get]
func (h *UserHandler) GetProfile(c *gin.Context) {
	claims := c.MustGet(middleware.UserContextKey).(*security.JWTClaims)
	prof, err := h.userService.GetProfile(c.Request.Context(), claims.UserID)
	if err != nil {
		response.NotFound(c, err.Error(), err)
		return
	}

	response.OK(c, "Profile retrieved successfully", prof)
}

// UpdateProfile godoc
// @Summary Update profile
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.UpdateProfileRequest true "Update Profile Payload"
// @Success 200 {object} response.APIResponse{data=dto.UserResponse}
// @Router /api/v1/users/me [put]
func (h *UserHandler) UpdateProfile(c *gin.Context) {
	claims := c.MustGet(middleware.UserContextKey).(*security.JWTClaims)

	var req dto.UpdateProfileRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err)
		return
	}

	prof, err := h.userService.UpdateProfile(c.Request.Context(), claims.UserID, req)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.OK(c, "Profile updated successfully", prof)
}

// ImportStudents godoc
// @Summary Batch import students/users
// @Tags Users
// @Accept json
// @Produce json
// @Security BearerAuth
// @Param request body dto.ImportStudentsRequest true "Import Students Payload"
// @Success 200 {object} response.APIResponse
// @Router /api/v1/users/students/import [post]
func (h *UserHandler) ImportStudents(c *gin.Context) {
	var req dto.ImportStudentsRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		response.BadRequest(c, "Invalid request payload", err)
		return
	}

	count, err := h.userService.ImportStudents(c.Request.Context(), req)
	if err != nil {
		response.BadRequest(c, err.Error(), err)
		return
	}

	response.OK(c, "Students imported successfully", gin.H{"imported_count": count})
}
