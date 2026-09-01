package domain

import (
	"context"

	"github.com/google/uuid"
)

type UserRepository interface {
	Create(ctx context.Context, user *User) error
	GetByID(ctx context.Context, id uuid.UUID) (*User, error)
	GetByEmail(ctx context.Context, email string) (*User, error)
	Update(ctx context.Context, user *User) error
	Delete(ctx context.Context, id uuid.UUID) error
	ListAll(ctx context.Context, offset, limit int) ([]User, int64, error)
	
	// Password resets
	CreatePasswordReset(ctx context.Context, reset *PasswordReset) error
	GetPasswordResetByToken(ctx context.Context, token string) (*PasswordReset, error)
	DeletePasswordReset(ctx context.Context, email string) error
}

type FormRepository interface {
	Create(ctx context.Context, form *Form) error
	GetByID(ctx context.Context, id uuid.UUID) (*Form, error)
	GetByCustomURL(ctx context.Context, customURL string) (*Form, error)
	GetByUserID(ctx context.Context, userID uuid.UUID, status FormStatus) ([]Form, error)
	Update(ctx context.Context, form *Form) error
	Delete(ctx context.Context, id uuid.UUID) error
	
	// Form Settings
	UpsertFormSettings(ctx context.Context, settings *FormSettings) error
	GetFormSettingsByFormID(ctx context.Context, formID uuid.UUID) (*FormSettings, error)
	
	// Stats
	GetFormResponseCount(ctx context.Context, formID uuid.UUID) (int64, error)
}

type QuestionRepository interface {
	CreateQuestion(ctx context.Context, q *Question) error
	CreateBatchQuestions(ctx context.Context, questions []Question) error
	GetQuestionByID(ctx context.Context, id uuid.UUID) (*Question, error)
	GetQuestionsByFormID(ctx context.Context, formID uuid.UUID) ([]Question, error)
	UpdateQuestion(ctx context.Context, q *Question) error
	DeleteQuestion(ctx context.Context, id uuid.UUID) error
	
	// Options
	CreateOption(ctx context.Context, opt *QuestionOption) error
	UpdateOption(ctx context.Context, opt *QuestionOption) error
	DeleteOption(ctx context.Context, id uuid.UUID) error
	GetOptionByID(ctx context.Context, id uuid.UUID) (*QuestionOption, error)
}

type ResponseRepository interface {
	CreateResponse(ctx context.Context, resp *FormResponse) error
	GetResponseByID(ctx context.Context, id uuid.UUID) (*FormResponse, error)
	GetResponsesByFormID(ctx context.Context, formID uuid.UUID) ([]FormResponse, error)
	GetResponsesByEmail(ctx context.Context, email string) ([]FormResponse, error)
	CheckUserAlreadySubmitted(ctx context.Context, formID uuid.UUID, email string) (bool, error)
	UpdateResponseGrade(ctx context.Context, responseID uuid.UUID, totalScore float64) error
	
	// Analytics
	GetAnalyticsByFormID(ctx context.Context, formID uuid.UUID) (*FormAnalytics, error)
}

type FormAnalytics struct {
	TotalResponses    int64                           `json:"total_responses"`
	AverageScore      float64                         `json:"average_score"`
	HighestScore      float64                         `json:"highest_score"`
	LowestScore       float64                         `json:"lowest_score"`
	QuestionBreakdown map[uuid.UUID]QuestionAnalytics `json:"question_breakdown"`
}

type QuestionAnalytics struct {
	QuestionID     uuid.UUID      `json:"question_id"`
	QuestionText   string         `json:"question_text"`
	TotalAnswered  int64          `json:"total_answered"`
	CorrectCount   int64          `json:"correct_count"`
	AccuracyRate   float64        `json:"accuracy_rate"`
	OptionCounts   map[string]int `json:"option_counts"` // Option ID -> count
}

type AdminRepository interface {
	GetDashboardStats(ctx context.Context) (*AdminStats, error)
	ListCreators(ctx context.Context) ([]User, error)
	ListAdmins(ctx context.Context) ([]User, error)
	UpdateCreatorStatus(ctx context.Context, creatorID uuid.UUID, isActive bool) error
	ListAllForms(ctx context.Context) ([]Form, error)
	DeleteForm(ctx context.Context, formID uuid.UUID) error
}

type AdminStats struct {
	TotalUsers     int64 `json:"total_users"`
	TotalCreators  int64 `json:"total_creators"`
	TotalForms     int64 `json:"total_forms"`
	ActiveExams    int64 `json:"active_exams"`
	TotalResponses int64 `json:"total_responses"`
}
