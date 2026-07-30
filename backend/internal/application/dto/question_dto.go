package dto

import (
	"backend/internal/domain"
	"github.com/google/uuid"
)

type CreateQuestionRequest struct {
	QuestionText string                `json:"question_text" binding:"required"`
	QuestionType domain.QuestionType   `json:"question_type" binding:"required"`
	CodeLanguage string                `json:"code_language"`
	Points       int                   `json:"points" binding:"gte=0"`
	OrderIndex   int                   `json:"order_index"`
	IsRequired   bool                  `json:"is_required"`
	Options      []CreateOptionRequest `json:"options"`
}

type UpdateQuestionRequest struct {
	QuestionText string                `json:"question_text" binding:"required"`
	QuestionType domain.QuestionType   `json:"question_type" binding:"required"`
	CodeLanguage string                `json:"code_language"`
	Points       int                   `json:"points" binding:"gte=0"`
	OrderIndex   int                   `json:"order_index"`
	IsRequired   bool                  `json:"is_required"`
	Options      []CreateOptionRequest `json:"options"`
}

type CreateOptionRequest struct {
	OptionText string `json:"option_text" binding:"required"`
	IsCorrect  bool   `json:"is_correct"`
	OrderIndex int    `json:"order_index"`
}

type QuestionDTO struct {
	ID           uuid.UUID           `json:"id"`
	FormID       uuid.UUID           `json:"form_id"`
	QuestionText string              `json:"question_text"`
	QuestionType domain.QuestionType `json:"question_type"`
	CodeLanguage string              `json:"code_language,omitempty"`
	Points       int                 `json:"points"`
	OrderIndex   int                 `json:"order_index"`
	IsRequired   bool                `json:"is_required"`
	Options      []OptionDTO         `json:"options,omitempty"`
}

type OptionDTO struct {
	ID         uuid.UUID `json:"id"`
	QuestionID uuid.UUID `json:"question_id"`
	OptionText string    `json:"option_text"`
	IsCorrect  bool      `json:"is_correct"`
	OrderIndex int       `json:"order_index"`
}
