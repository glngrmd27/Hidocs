package dto

import (
	"time"

	"github.com/google/uuid"
)

type SubmitFormRequest struct {
	RespondentEmail string               `json:"respondent_email" binding:"required,email"`
	Passcode        string               `json:"passcode"`
	Answers         []SubmitAnswerDetail `json:"answers" binding:"required,dive"`
}

type SubmitAnswerDetail struct {
	QuestionID       uuid.UUID  `json:"question_id" binding:"required"`
	SelectedOptionID *uuid.UUID `json:"selected_option_id"`
	AnswerText       string     `json:"answer_text"`
}

type SubmitResponseResult struct {
	ResponseID  uuid.UUID `json:"response_id"`
	TotalScore  float64   `json:"total_score"`
	SubmittedAt time.Time `json:"submitted_at"`
	Message     string    `json:"message"`
}

type GradeResponseRequest struct {
	TotalScore float64 `json:"total_score" binding:"gte=0"`
}

type ResponseDetailDTO struct {
	ID              uuid.UUID          `json:"id"`
	FormID          uuid.UUID          `json:"form_id"`
	RespondentEmail string             `json:"respondent_email"`
	TotalScore      float64            `json:"total_score"`
	SubmittedAt     time.Time          `json:"submitted_at"`
	Answers         []AnswerDetailDTO  `json:"answers"`
}

type AnswerDetailDTO struct {
	ID               uuid.UUID  `json:"id"`
	QuestionID       uuid.UUID  `json:"question_id"`
	QuestionText     string     `json:"question_text"`
	SelectedOptionID *uuid.UUID `json:"selected_option_id,omitempty"`
	SelectedOption   string     `json:"selected_option_text,omitempty"`
	AnswerText       string     `json:"answer_text,omitempty"`
	IsCorrect        *bool      `json:"is_correct,omitempty"`
	PointsEarned     float64    `json:"points_earned"`
}
