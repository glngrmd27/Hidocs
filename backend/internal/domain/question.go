package domain

import (
	"github.com/google/uuid"
)

type QuestionType string

const (
	TypeShortText      QuestionType = "SHORT_TEXT"
	TypeParagraph      QuestionType = "PARAGRAPH"
	TypeMultipleChoice QuestionType = "MULTIPLE_CHOICE"
	TypeCheckboxes     QuestionType = "CHECKBOXES"
	TypeDropdown       QuestionType = "DROPDOWN"
	TypeDateTime       QuestionType = "DATE_TIME"
	TypeFileUpload     QuestionType = "FILE_UPLOAD"
	TypeRatingScale    QuestionType = "RATING_SCALE"
	TypeMath           QuestionType = "MATH"
	TypeCode           QuestionType = "CODE"
)

type Question struct {
	ID           uuid.UUID        `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	FormID       uuid.UUID        `gorm:"type:uuid;not null;index" json:"form_id"`
	QuestionText string           `gorm:"type:text;not null" json:"question_text"`
	QuestionType QuestionType     `gorm:"type:varchar(30);not null" json:"question_type"`
	CodeLanguage string           `gorm:"type:varchar(30)" json:"code_language,omitempty"`
	Points       int              `gorm:"type:int;default:0" json:"points"`
	OrderIndex   int              `gorm:"type:int;not null;default:0" json:"order_index"`
	IsRequired   bool             `gorm:"type:boolean;default:false" json:"is_required"`
	
	// Relations
	Options      []QuestionOption `gorm:"foreignKey:QuestionID;constraint:OnDelete:CASCADE" json:"options,omitempty"`
}

type QuestionOption struct {
	ID         uuid.UUID `gorm:"type:uuid;primary_key;default:gen_random_uuid()" json:"id"`
	QuestionID uuid.UUID `gorm:"type:uuid;not null;index" json:"question_id"`
	OptionText string    `gorm:"type:text;not null" json:"option_text"`
	IsCorrect  bool      `gorm:"type:boolean;default:false" json:"is_correct"`
	OrderIndex int       `gorm:"type:int;not null;default:0" json:"order_index"`
}
