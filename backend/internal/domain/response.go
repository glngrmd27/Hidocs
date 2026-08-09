package domain

import (
	"time"

	"github.com/google/uuid"
)

type FormResponse struct {
	ID              uuid.UUID        `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	FormID          uuid.UUID        `gorm:"type:uuid;not null;index" json:"form_id"`
	UserID          *uuid.UUID       `gorm:"type:uuid;index" json:"user_id,omitempty"`
	RespondentEmail string           `gorm:"type:varchar(100);not null" json:"respondent_email"`
	TotalScore      *float64         `gorm:"type:float" json:"total_score,omitempty"`
	IsAutoSubmitted bool             `gorm:"type:boolean;default:false" json:"is_auto_submitted"`
	SubmittedAt     time.Time        `gorm:"type:timestamp;not null;default:now()" json:"submitted_at"`
	
	// Relations
	Form            *Form            `gorm:"foreignKey:FormID;constraint:OnDelete:CASCADE" json:"form,omitempty"`
	User            *User            `gorm:"foreignKey:UserID" json:"user,omitempty"`
	Answers         []ResponseAnswer `gorm:"foreignKey:ResponseID;constraint:OnDelete:CASCADE" json:"answers,omitempty"`
}

type ResponseAnswer struct {
	ID               uuid.UUID       `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	ResponseID       uuid.UUID       `gorm:"type:uuid;not null;index" json:"response_id"`
	QuestionID       uuid.UUID       `gorm:"type:uuid;not null;index" json:"question_id"`
	SelectedOptionID *uuid.UUID      `gorm:"type:uuid" json:"selected_option_id,omitempty"`
	AnswerText       string          `gorm:"type:text" json:"answer_text,omitempty"`
	ScoreGiven       *float64        `gorm:"type:float" json:"score_given,omitempty"`
	
	// Relations
	Question         *Question       `gorm:"foreignKey:QuestionID" json:"question,omitempty"`
	SelectedOption   *QuestionOption `gorm:"foreignKey:SelectedOptionID" json:"selected_option,omitempty"`
}
