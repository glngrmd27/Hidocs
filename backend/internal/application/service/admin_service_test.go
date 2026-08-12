package service_test

import (
	"context"
	"testing"

	"backend/internal/application/dto"
	"backend/internal/application/service"
	"backend/internal/domain"
	"backend/internal/infrastructure/security"
	"github.com/google/uuid"
)

type mockAdminRepo struct {
	creators []domain.User
	admins   []domain.User
	forms    []domain.Form
}

func (m *mockAdminRepo) GetDashboardStats(ctx context.Context) (*domain.AdminStats, error) {
	return &domain.AdminStats{TotalUsers: int64(len(m.creators) + len(m.admins))}, nil
}

func (m *mockAdminRepo) ListCreators(ctx context.Context) ([]domain.User, error) {
	return m.creators, nil
}

func (m *mockAdminRepo) ListAdmins(ctx context.Context) ([]domain.User, error) {
	return m.admins, nil
}

func (m *mockAdminRepo) UpdateCreatorStatus(ctx context.Context, creatorID uuid.UUID, isActive bool) error {
	return nil
}

func (m *mockAdminRepo) ListAllForms(ctx context.Context) ([]domain.Form, error) {
	return m.forms, nil
}

func (m *mockAdminRepo) DeleteForm(ctx context.Context, formID uuid.UUID) error {
	return nil
}

func TestAdminService_CreateAdminAndListAdmins(t *testing.T) {
	userRepo := newMockUserRepo()
	adminRepo := &mockAdminRepo{}
	hasher := security.NewBcryptHasher()

	adminSvc := service.NewAdminService(adminRepo, userRepo, hasher)
	ctx := context.Background()

	// 1. Create Admin account
	req := dto.RegisterRequest{
		Name:     "Admin Baru",
		Email:    "adminbaru@hidocs.id",
		Password: "password123",
	}

	res, err := adminSvc.CreateAdmin(ctx, req)
	if err != nil {
		t.Fatalf("CreateAdmin failed: %v", err)
	}

	if res.Role != domain.RoleAdmin {
		t.Fatalf("Expected role %s, got %s", domain.RoleAdmin, res.Role)
	}

	// Put into mock admin repo for listing
	adminRepo.admins = append(adminRepo.admins, domain.User{
		ID:       res.ID,
		Name:     res.Name,
		Email:    res.Email,
		Role:     res.Role,
		IsActive: true,
	})

	// 2. List Admins
	admins, err := adminSvc.ListAdmins(ctx)
	if err != nil {
		t.Fatalf("ListAdmins failed: %v", err)
	}

	if len(admins) != 1 {
		t.Fatalf("Expected 1 admin, got %d", len(admins))
	}
	if admins[0].Email != "adminbaru@hidocs.id" {
		t.Fatalf("Expected email adminbaru@hidocs.id, got %s", admins[0].Email)
	}
}
