package service

import (
	"context"

	"backend/internal/application/dto"
	"backend/internal/domain"
	"backend/internal/infrastructure/security"
	"github.com/google/uuid"
)

type UserService interface {
	GetProfile(ctx context.Context, userID uuid.UUID) (*dto.UserResponse, error)
	UpdateProfile(ctx context.Context, userID uuid.UUID, req dto.UpdateProfileRequest) (*dto.UserResponse, error)
	ImportStudents(ctx context.Context, req dto.ImportStudentsRequest) (int, error)
}

type userService struct {
	userRepo       domain.UserRepository
	passwordHasher security.PasswordHasher
}

func NewUserService(userRepo domain.UserRepository, hasher security.PasswordHasher) UserService {
	return &userService{
		userRepo:       userRepo,
		passwordHasher: hasher,
	}
}

func (s *userService) GetProfile(ctx context.Context, userID uuid.UUID) (*dto.UserResponse, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	return &dto.UserResponse{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		Role:      user.Role,
		AvatarURL: user.AvatarURL,
		IsActive:  user.IsActive,
		CreatedAt: user.CreatedAt,
	}, nil
}

func (s *userService) UpdateProfile(ctx context.Context, userID uuid.UUID, req dto.UpdateProfileRequest) (*dto.UserResponse, error) {
	user, err := s.userRepo.GetByID(ctx, userID)
	if err != nil {
		return nil, err
	}

	user.Name = req.Name
	if req.AvatarURL != "" {
		user.AvatarURL = req.AvatarURL
	}

	if err := s.userRepo.Update(ctx, user); err != nil {
		return nil, err
	}

	return &dto.UserResponse{
		ID:        user.ID,
		Name:      user.Name,
		Email:     user.Email,
		Role:      user.Role,
		AvatarURL: user.AvatarURL,
		IsActive:  user.IsActive,
		CreatedAt: user.CreatedAt,
	}, nil
}

func (s *userService) ImportStudents(ctx context.Context, req dto.ImportStudentsRequest) (int, error) {
	importedCount := 0
	for _, studentReq := range req.Students {
		existing, _ := s.userRepo.GetByEmail(ctx, studentReq.Email)
		if existing != nil {
			continue
		}

		hashedPassword, err := s.passwordHasher.HashPassword(studentReq.Password)
		if err != nil {
			continue
		}

		user := &domain.User{
			ID:           uuid.New(),
			Name:         studentReq.Name,
			Email:        studentReq.Email,
			PasswordHash: hashedPassword,
			Role:         domain.RoleUser,
			IsActive:     true,
		}

		if err := s.userRepo.Create(ctx, user); err == nil {
			importedCount++
		}
	}
	return importedCount, nil
}
