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
}

type UpdateFormRequest struct {
	Title       string            `json:"title" binding:"required,min=2,max=255"`
	Description string            `json:"description"`
	Type        domain.FormType   `json:"type" binding:"required,oneof=SURVEY EXAM"`
	CustomURL   string            `json:"custom_url"`
	Status      domain.FormStatus `json:"status" binding:"required,oneof=DRAFT ACTIVE CLOSED"`
}

type UpdateExamSettingsRequest struct {
	DurationMinutes    int        `json:"duration_minutes" binding:"gte=0"`
	MaxSubmissions     int        `json:"max_submissions" binding:"gte=0"`
	Passcode           string     `json:"passcode"`
	RandomizeQuestions bool       `json:"randomize_questions"`
	RandomizeOptions   bool       `json:"randomize_options"`
	StartTime          *time.Time `json:"start_time"`
	EndTime            *time.Time `json:"end_time"`
}

type FormResponseDTO struct {
	ID            uuid.UUID            `json:"id"`
	UserID        uuid.UUID            `json:"user_id"`
	Title         string               `json:"title"`
	Description   string               `json:"description"`
	Type          domain.FormType      `json:"type"`
	CustomURL     string               `json:"custom_url"`
	Status        domain.FormStatus    `json:"status"`
	CreatedAt     time.Time            `json:"created_at"`
	ResponseCount int64                `json:"response_count"`
	ExamSettings  *domain.ExamSettings `json:"exam_settings,omitempty"`
	Questions     []QuestionDTO        `json:"questions,omitempty"`
}

type PublicFormDTO struct {
	ID           uuid.UUID            `json:"id"`
	Title        string               `json:"title"`
	Description  string               `json:"description"`
	Type         domain.FormType      `json:"type"`
	CustomURL    string               `json:"custom_url"`
	Status       domain.FormStatus    `json:"status"`
	ExamSettings *PublicExamSettings  `json:"exam_settings,omitempty"`
	Questions    []PublicQuestionDTO  `json:"questions"`
}

type PublicExamSettings struct {
	DurationMinutes    int        `json:"duration_minutes"`
	MaxSubmissions     int        `json:"max_submissions"`
	HasPasscode        bool       `json:"has_passcode"`
	RandomizeQuestions bool       `json:"randomize_questions"`
	RandomizeOptions   bool       `json:"randomize_options"`
	StartTime          *time.Time `json:"start_time"`
	EndTime            *time.Time `json:"end_time"`
}

type PublicQuestionDTO struct {
	ID           uuid.UUID            `json:"id"`
	QuestionText string               `json:"question_text"`
	QuestionType domain.QuestionType `json:"question_type"`
	CodeLanguage string               `json:"code_language,omitempty"`
	Points       int                  `json:"points"`
	OrderIndex   int                  `json:"order_index"`
	IsRequired   bool                 `json:"is_required"`
	Options      []PublicOptionDTO    `json:"options,omitempty"`
}

type PublicOptionDTO struct {
	ID         uuid.UUID `json:"id"`
	OptionText string    `json:"option_text"`
	OrderIndex int       `json:"order_index"`
}
