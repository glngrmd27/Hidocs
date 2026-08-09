package dto

import (
	"time"

	"backend/internal/domain"
	"github.com/google/uuid"
)

type CreateFormRequest struct {
	Title       string          `json:"title" binding:"required,min=2,max=255"`
	Description string          `json:"description"`
	Type        domain.FormType `json:"type" binding:"required,oneof=SURVEY EXAM"`
	CustomURL   string          `json:"custom_url"`
	IsTemplate  bool            `json:"is_template"`
}

type UpdateFormRequest struct {
	Title       string            `json:"title" binding:"required,min=2,max=255"`
	Description string            `json:"description"`
	Type        domain.FormType   `json:"type" binding:"required,oneof=SURVEY EXAM"`
	CustomURL   string            `json:"custom_url"`
	Status      domain.FormStatus `json:"status" binding:"required,oneof=DRAFT ACTIVE CLOSED"`
	IsTemplate  bool              `json:"is_template"`
}

type UpdateFormSettingsRequest struct {
	DurationMinutes     *int       `json:"duration_minutes"`
	AutoActiveDays      int        `json:"auto_active_days"`
	IsActiveImmediately bool       `json:"is_active_immediately"`
	IsOneTimeSubmission bool       `json:"is_one_time_submission"`
	RandomizeQuestions  bool       `json:"randomize_questions"`
	RandomizeOptions    bool       `json:"randomize_options"`
	StartTime           *time.Time `json:"start_time"`
	EndTime             *time.Time `json:"end_time"`
}

type FormResponseDTO struct {
	ID            uuid.UUID            `json:"id"`
	UserID        uuid.UUID            `json:"user_id"`
	Title         string               `json:"title"`
	Description   string               `json:"description"`
	Type          domain.FormType      `json:"type"`
	CustomURL     string               `json:"custom_url"`
	Status        domain.FormStatus    `json:"status"`
	IsTemplate    bool                 `json:"is_template"`
	CreatedAt     time.Time            `json:"created_at"`
	ResponseCount int64                `json:"response_count"`
	FormSettings  *domain.FormSettings `json:"form_settings,omitempty"`
	Questions     []QuestionDTO        `json:"questions,omitempty"`
}

type PublicFormDTO struct {
	ID           uuid.UUID           `json:"id"`
	Title        string              `json:"title"`
	Description  string              `json:"description"`
	Type         domain.FormType     `json:"type"`
	CustomURL    string              `json:"custom_url"`
	Status       domain.FormStatus   `json:"status"`
	IsTemplate   bool                `json:"is_template"`
	FormSettings *PublicFormSettings `json:"form_settings,omitempty"`
	Questions    []PublicQuestionDTO `json:"questions"`
}

type PublicFormSettings struct {
	DurationMinutes     *int       `json:"duration_minutes,omitempty"`
	AutoActiveDays      int        `json:"auto_active_days"`
	IsActiveImmediately bool       `json:"is_active_immediately"`
	IsOneTimeSubmission bool       `json:"is_one_time_submission"`
	RandomizeQuestions  bool       `json:"randomize_questions"`
	RandomizeOptions    bool       `json:"randomize_options"`
	StartTime           *time.Time `json:"start_time,omitempty"`
	EndTime             *time.Time `json:"end_time,omitempty"`
}

type PublicQuestionDTO struct {
	ID           uuid.UUID           `json:"id"`
	QuestionText string              `json:"question_text"`
	QuestionType domain.QuestionType `json:"question_type"`
	CodeLanguage string              `json:"code_language,omitempty"`
	ImgURL       string              `json:"img_url,omitempty"`
	IsAutoScored bool                `json:"is_auto_scored"`
	Points       int                 `json:"points"`
	OrderIndex   int                 `json:"order_index"`
	IsRequired   bool                `json:"is_required"`
	Options      []PublicOptionDTO   `json:"options,omitempty"`
}

type PublicOptionDTO struct {
	ID         uuid.UUID `json:"id"`
	OptionText string    `json:"option_text"`
	OrderIndex int       `json:"order_index"`
}
