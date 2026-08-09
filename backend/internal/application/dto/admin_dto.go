package dto

import "github.com/google/uuid"

type UpdateCreatorStatusRequest struct {
	IsActive bool `json:"is_active"`
}

type CreatorResponse struct {
	ID        uuid.UUID `json:"id"`
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	IsActive  bool      `json:"is_active"`
	CreatedAt string    `json:"created_at"`
}
