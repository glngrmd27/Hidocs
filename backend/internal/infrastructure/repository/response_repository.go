package repository

import (
	"context"
	"errors"

	"backend/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type responseRepository struct {
	db *gorm.DB
}

func NewResponseRepository(db *gorm.DB) domain.ResponseRepository {
	return &responseRepository{db: db}
}

func (r *responseRepository) CreateResponse(ctx context.Context, resp *domain.FormResponse) error {
	return r.db.WithContext(ctx).Create(resp).Error
}

func (r *responseRepository) GetResponseByID(ctx context.Context, id uuid.UUID) (*domain.FormResponse, error) {
	var resp domain.FormResponse
	err := r.db.WithContext(ctx).
		Preload("Form").
		Preload("Answers").
		Preload("Answers.Question").
		Preload("Answers.Question.Options").
		Preload("Answers.SelectedOption").
		First(&resp, "id = ?", id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrResponseNotFound
		}
		return nil, err
	}
	return &resp, nil
}

func (r *responseRepository) GetResponsesByFormID(ctx context.Context, formID uuid.UUID) ([]domain.FormResponse, error) {
	var responses []domain.FormResponse
	err := r.db.WithContext(ctx).
		Preload("Answers").
		Preload("Answers.SelectedOption").
		Where("form_id = ?", formID).
		Order("submitted_at desc").
		Find(&responses).Error

	return responses, err
}

func (r *responseRepository) GetResponsesByEmail(ctx context.Context, email string) ([]domain.FormResponse, error) {
	var responses []domain.FormResponse
	err := r.db.WithContext(ctx).
		Preload("Form").
		Preload("Answers").
		Preload("Answers.Question").
		Preload("Answers.SelectedOption").
		Where("respondent_email = ?", email).
		Order("submitted_at desc").
		Find(&responses).Error

	return responses, err
}

func (r *responseRepository) CheckUserAlreadySubmitted(ctx context.Context, formID uuid.UUID, email string) (bool, error) {
	var count int64
	err := r.db.WithContext(ctx).
		Model(&domain.FormResponse{}).
		Where("form_id = ? AND respondent_email = ?", formID, email).
		Count(&count).Error

	return count > 0, err
}

func (r *responseRepository) UpdateResponseGrade(ctx context.Context, responseID uuid.UUID, totalScore float64) error {
	return r.db.WithContext(ctx).
		Model(&domain.FormResponse{}).
		Where("id = ?", responseID).
		Update("total_score", totalScore).Error
}

func (r *responseRepository) GetAnalyticsByFormID(ctx context.Context, formID uuid.UUID) (*domain.FormAnalytics, error) {
	var responses []domain.FormResponse
	err := r.db.WithContext(ctx).
		Preload("Answers").
		Where("form_id = ?", formID).
		Find(&responses).Error

	if err != nil {
		return nil, err
	}

	analytics := &domain.FormAnalytics{
		TotalResponses:    int64(len(responses)),
		QuestionBreakdown: make(map[uuid.UUID]domain.QuestionAnalytics),
	}

	if len(responses) == 0 {
		return analytics, nil
	}

	var sumScore float64
	var countWithScore float64
	var highest float64
	var lowest float64
	first := true

	for _, resp := range responses {
		if resp.TotalScore != nil {
			score := *resp.TotalScore
			sumScore += score
			countWithScore++

			if first {
				highest = score
				lowest = score
				first = false
			} else {
				if score > highest {
					highest = score
				}
				if score < lowest {
					lowest = score
				}
			}
		}
	}

	if countWithScore > 0 {
		analytics.AverageScore = sumScore / countWithScore
		analytics.HighestScore = highest
		analytics.LowestScore = lowest
	}

	// Fetch all questions for this form
	var questions []domain.Question
	r.db.WithContext(ctx).Preload("Options").Where("form_id = ?", formID).Find(&questions)

	for _, q := range questions {
		qAnalytics := domain.QuestionAnalytics{
			QuestionID:   q.ID,
			QuestionText: q.QuestionText,
			OptionCounts: make(map[string]int),
		}

		for _, opt := range q.Options {
			qAnalytics.OptionCounts[opt.ID.String()] = 0
		}

		var totalAns int64
		var correctAns int64

		for _, resp := range responses {
			for _, ans := range resp.Answers {
				if ans.QuestionID == q.ID {
					totalAns++
					if ans.SelectedOptionID != nil {
						optIDStr := ans.SelectedOptionID.String()
						qAnalytics.OptionCounts[optIDStr]++

						// Check if selected option was correct
						for _, opt := range q.Options {
							if opt.ID == *ans.SelectedOptionID && opt.IsCorrect {
								correctAns++
								break
							}
						}
					}
				}
			}
		}

		qAnalytics.TotalAnswered = totalAns
		qAnalytics.CorrectCount = correctAns
		if totalAns > 0 {
			qAnalytics.AccuracyRate = (float64(correctAns) / float64(totalAns)) * 100.0
		}

		analytics.QuestionBreakdown[q.ID] = qAnalytics
	}

	return analytics, nil
}
