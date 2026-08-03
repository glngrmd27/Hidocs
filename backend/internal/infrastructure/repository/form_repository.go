package repository

import (
	"context"
	"errors"

	"backend/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
	"gorm.io/gorm/clause"
)

type formRepository struct {
	db *gorm.DB
}

func NewFormRepository(db *gorm.DB) domain.FormRepository {
	return &formRepository{db: db}
}

func (r *formRepository) Create(ctx context.Context, form *domain.Form) error {
	return r.db.WithContext(ctx).Create(form).Error
}

func (r *formRepository) GetByID(ctx context.Context, id uuid.UUID) (*domain.Form, error) {
	var form domain.Form
	err := r.db.WithContext(ctx).
		Preload("FormSettings").
		Preload("Questions", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_index asc")
		}).
		Preload("Questions.Options", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_index asc")
		}).
		First(&form, "id = ?", id).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrFormNotFound
		}
		return nil, err
	}
	return &form, nil
}

func (r *formRepository) GetByCustomURL(ctx context.Context, customURL string) (*domain.Form, error) {
	var form domain.Form
	err := r.db.WithContext(ctx).
		Preload("FormSettings").
		Preload("Questions", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_index asc")
		}).
		Preload("Questions.Options", func(db *gorm.DB) *gorm.DB {
			return db.Order("order_index asc")
		}).
		First(&form, "custom_url = ?", customURL).Error

	if err != nil {
		if errors.Is(err, gorm.ErrRecordNotFound) {
			return nil, domain.ErrFormNotFound
		}
		return nil, err
	}
	return &form, nil
}

func (r *formRepository) GetByUserID(ctx context.Context, userID uuid.UUID, status domain.FormStatus) ([]domain.Form, error) {
	var forms []domain.Form
	query := r.db.WithContext(ctx).Where("user_id = ?", userID)
	if status != "" {
		query = query.Where("status = ?", status)
	}

	err := query.Order("created_at desc").Find(&forms).Error
	return forms, err
}

func (r *formRepository) Update(ctx context.Context, form *domain.Form) error {
	return r.db.WithContext(ctx).Save(form).Error
}

func (r *formRepository) Delete(ctx context.Context, id uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&domain.Form{}, "id = ?", id).Error
}

func (r *formRepository) UpsertFormSettings(ctx context.Context, settings *domain.FormSettings) error {
	return r.db.WithContext(ctx).Clauses(clause.OnConflict{
		Columns:   []clause.Column{{Name: "form_id"}},
		DoUpdates: clause.AssignmentColumns([]string{"duration_minutes", "auto_active_days", "is_active_immediately", "is_one_time_submission", "randomize_questions", "randomize_options", "start_time", "end_time"}),
	}).Create(settings).Error
}

func (r *formRepository) GetFormSettingsByFormID(ctx context.Context, formID uuid.UUID) (*domain.FormSettings, error) {
	var settings domain.FormSettings
	if err := r.db.WithContext(ctx).First(&settings, "form_id = ?", formID).Error; err != nil {
		return nil, err
	}
	return &settings, nil
}

func (r *formRepository) GetFormResponseCount(ctx context.Context, formID uuid.UUID) (int64, error) {
	var count int64
	err := r.db.WithContext(ctx).Model(&domain.FormResponse{}).Where("form_id = ?", formID).Count(&count).Error
	return count, err
}
