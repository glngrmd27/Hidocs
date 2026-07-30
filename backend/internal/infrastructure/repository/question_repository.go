package repository

import (
	"context"
	"errors"

	"backend/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type questionRepository struct {
	db *gorm.DB
}

func NewQuestionRepository(db *gorm.DB) domain.QuestionRepository {
	return &questionRepository{db: db}
}

func (r *questionRepository) CreateQuestion(ctx context.Context, q *domain.Question) error {
	return r.db.WithContext(ctx).Create(q).Error
}

func (r *questionRepository) CreateBatchQuestions(ctx context.Context, questions []domain.Question) error {
	return r.db.WithContext(ctx).Create(&questions).Error
}

func (r *questionRepository) GetQuestionByID(ctx context.Context, id uuid.UUID) (*domain.Question, error) {
	var q domain.Question
	err := r.db.WithContext(ctx).Preload("Options").First(&q, "id = ?", id).Error
	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrQuestionNotFound
		}
		return nil, err
	}
	return &q, nil
}

func (r *questionRepository) GetQuestionsByFormID(ctx context.Context, formID uuid.UUID) ([]domain.Question, error) {
	var questions []domain.Question
	err := r.db.WithContext(ctx).
		Preload("Options", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_index asc")
		}).
		Where("form_id = ?", formID).
		Order("order_index asc").
		Find(&questions).Error
	return questions, err
}

func (r *questionRepository) UpdateQuestion(ctx context.Context, q *domain.Question) error {
	return r.db.WithContext(ctx).Session(&gorm.Session{FullSaveAssociations: true}).Save(q).Error
}

func (r *questionRepository) DeleteQuestion(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&domain.Question{}, "id = ?", id).Error
}

func (r *questionRepository) CreateOption(ctx context.Context, opt *domain.QuestionOption) error {
	return r.db.WithContext(ctx).Create(opt).Error
}

func (r *questionRepository) UpdateOption(ctx context.Context, opt *domain.QuestionOption) error {
	return r.db.WithContext(ctx).Save(opt).Error
}

func (r *questionRepository) DeleteOption(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&domain.QuestionOption{}, "id = ?", id).Error
}

func (r *questionRepository) GetOptionByID(ctx context.Context, id uuid.UUID) (*domain.QuestionOption, error) {
	var opt domain.QuestionOption
	if err := r.db.WithContext(ctx).First(&opt, "id = ?", id).Error; err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrOptionNotFound
		}
		return nil, err
	}
	return &opt, nil
}
