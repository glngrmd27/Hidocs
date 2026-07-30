package dto

import (
	"time"

	"backend/internal/domain"
	"github.com/google/uuid"
)

type UserResponse struct {
	ID        uuid.UUID       `json:"id"`
	Name      string          `json:"name"`
	Email     string          `json:"email"`
	Role      domain.UserRole `json:"role"`
	AvatarURL string          `json:"avatar_url,omitempty"`
	IsActive  bool            `json:"is_active"`
	CreatedAt time.Time       `json:"created_at"`
}

type UpdateProfileRequest struct {
	Name      string `json:"name" binding:"required,min=2,max=100"`
	AvatarURL string `json:"avatar_url,omitempty"`
}

type ImportStudentsRequest struct {
	Students []RegisterRequest `json:"students" binding:"required,dive"`
}
