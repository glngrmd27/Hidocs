package repository

import (
	"context"

	"backend/internal/domain"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type adminRepository struct {
	db *gorm.DB
}

func NewAdminRepository(db *gorm.DB) domain.AdminRepository {
	return &adminRepository{db: db}
}

func (r *adminRepository) GetDashboardStats(ctx context.Context) (*domain.AdminStats, error) {
	var stats domain.AdminStats

	r.db.WithContext(ctx).Model(&domain.User{}).Count(&stats.TotalUsers)
	r.db.WithContext(ctx).Model(&domain.User{}).Where("role = ?", domain.RoleUser).Count(&stats.TotalCreators)
	r.db.WithContext(ctx).Model(&domain.Form{}).Count(&stats.TotalForms)
	r.db.WithContext(ctx).Model(&domain.Form{}).Where("type = ? AND status = ?", domain.TypeExam, domain.StatusActive).Count(&stats.ActiveExams)
	r.db.WithContext(ctx).Model(&domain.FormResponse{}).Count(&stats.TotalResponses)

	return &stats, nil
}

func (r *adminRepository) ListCreators(ctx context.Context) ([]domain.User, error) {
	var users []domain.User
	err := r.db.WithContext(ctx).Where("role = ?", domain.RoleUser).Order("created_at desc").Find(&users).Error
	return users, err
}

func (r *adminRepository) ListAdmins(ctx context.Context) ([]domain.User, error) {
	var users []domain.User
	err := r.db.WithContext(ctx).Where("role = ?", domain.RoleAdmin).Order("created_at desc").Find(&users).Error
	return users, err
}

func (r *adminRepository) UpdateCreatorStatus(ctx context.Context, creatorID uuid.UUID, isActive bool) error {
	return r.db.WithContext(ctx).Model(&domain.User{}).Where("id = ?", creatorID).Update("is_active", isActive).Error
}

func (r *adminRepository) ListAllForms(ctx context.Context) ([]domain.Form, error) {
	var forms []domain.Form
	err := r.db.WithContext(ctx).Preload("User").Order("created_at desc").Find(&forms).Error
	return forms, err
}

func (r *adminRepository) DeleteForm(ctx context.Context, formID uuid.UUID) error {
	return r.db.WithContext(ctx).Delete(&domain.Form{}, "id = ?", formID).Error
}
