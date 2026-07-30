package service

import (
	"context"

	"backend/internal/application/dto"
	"backend/internal/domain"
	"backend/internal/infrastructure/security"
	"github.com/google/uuid"
)

type AdminService interface {
	GetDashboardStats(ctx context.Context) (*domain.AdminStats, error)
	ListCreators(ctx context.Context) ([]dto.CreatorResponse, error)
	CreateCreator(ctx context.Context, req dto.RegisterRequest) (*dto.UserResponse, error)
	UpdateCreatorStatus(ctx context.Context, creatorID uuid.UUID, req dto.UpdateCreatorStatusRequest) error
	ListAllForms(ctx context.Context) ([]dto.FormResponseDTO, error)
	DeleteForm(ctx context.Context, formID uuid.UUID) error
}

type adminService struct {
	adminRepo      domain.AdminRepository
	userRepo       domain.UserRepository
	passwordHasher security.PasswordHasher
}

func NewAdminService(adminRepo domain.AdminRepository, userRepo domain.UserRepository, hasher security.PasswordHasher) AdminService {
	return &adminService{
		adminRepo:      adminRepo,
		userRepo:       userRepo,
		passwordHasher: hasher,
	}
}

func (s *adminService) GetDashboardStats(ctx context.Context) (*domain.AdminStats, error) {
	return s.adminRepo.GetDashboardStats(ctx)
}

func (s *adminService) ListCreators(ctx context.Context) ([]dto.CreatorResponse, error) {
	creators, err := s.adminRepo.ListCreators(ctx)
	if err != nil {
		return nil, err
	}

	var dtos []dto.CreatorResponse
	for _, c := range creators {
		dtos = append(dtos, dto.CreatorResponse{
			ID:        c.ID,
			Name:      c.Name,
			Email:     c.Email,
			IsActive:  c.IsActive,
			CreatedAt: c.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}
	return dtos, nil
}

func (s *adminService) CreateCreator(ctx context.Context, req dto.RegisterRequest) (*dto.UserResponse, error) {
	existing, _ := s.userRepo.GetByEmail(ctx, req.Email)
	if existing != nil {
		return nil, domain.ErrUserAlreadyExists
	}

	hashedPassword, err := s.passwordHasher.HashPassword(req.Password)
	if err != nil {
		return nil, err
	}

	user := &domain.User{
		ID:           uuid.New(),
		Name:         req.Name,
		Email:        req.Email,
		PasswordHash: hashedPassword,
		Role:         domain.RoleUser,
		IsActive:     true,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	return &dto.UserResponse{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		Role:      user.Role,
		IsActive:  user.IsActive,
		CreatedAt: user.CreatedAt,
	}, nil
}

func (s *adminService) UpdateCreatorStatus(ctx context.Context, creatorID uuid.UUID, req dto.UpdateCreatorStatusRequest) error {
	return s.adminRepo.UpdateCreatorStatus(ctx, creatorID, req.IsActive)
}

func (s *adminService) ListAllForms(ctx context.Context) ([]dto.FormResponseDTO, error) {
	forms, err := s.adminRepo.ListAllForms(ctx)
	if err != nil {
		return nil, err
	}

	var dtos []dto.FormResponseDTO
	for _, f := range forms {
		dtos = append(dtos, dto.FormResponseDTO{
			ID:          f.ID,
			UserID:      f.UserID,
			Title:       f.Title,
			Description: f.Description,
			Type:        f.Type,
			CustomURL:   f.CustomURL,
			Status:      f.Status,
			CreatedAt:   f.CreatedAt,
		})
	}
	return dtos, nil
}

func (s *adminService) DeleteForm(ctx context.Context, formID uuid.UUID) error {
	return s.adminRepo.DeleteForm(ctx, formID)
}
