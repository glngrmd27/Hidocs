package service

import (
	"context"
	"encoding/json"
	"errors"
	"time"

	"backend/internal/application/dto"
	"backend/internal/domain"
	"backend/internal/infrastructure/cache"
	"backend/internal/infrastructure/email"
	"backend/internal/infrastructure/security"
	"backend/pkg/utils"
	"github.com/google/uuid"
)

type AuthService interface {
	Register(ctx context.Context, req dto.RegisterRequest) (string, error)
	VerifyOTP(ctx context.Context, req dto.VerifyOTPRequest) (*dto.AuthResponse, error)
	ResendOTP(ctx context.Context, req dto.ResendOTPRequest) error
	Login(ctx context.Context, req dto.LoginRequest) (*dto.AuthResponse, error)
	ForgotPassword(ctx context.Context, req dto.ForgotPasswordRequest) (string, error)
	ResetPassword(ctx context.Context, req dto.ResetPasswordRequest) error
}

type authService struct {
	userRepo       domain.UserRepository
	passwordHasher security.PasswordHasher
	jwtManager     *security.JWTManager
	otpCache       cache.OTPCache
	emailSender    email.EmailSender
}

func NewAuthService(
	userRepo domain.UserRepository,
	hasher security.PasswordHasher,
	jwt *security.JWTManager,
	otpCache cache.OTPCache,
	emailSender email.EmailSender,
) AuthService {
	return &authService{
		userRepo:       userRepo,
		passwordHasher: hasher,
		jwtManager:     jwt,
		otpCache:       otpCache,
		emailSender:    emailSender,
	}
}

func (s *authService) Register(ctx context.Context, req dto.RegisterRequest) (string, error) {
	existing, _ := s.userRepo.GetByEmail(ctx, req.Email)
	if existing != nil {
		return "", domain.ErrUserAlreadyExists
	}

	hashedPassword, err := s.passwordHasher.HashPassword(req.Password)
	if err != nil {
		return "", err
	}

	// 1. Generate 6-digit OTP code
	otpCode := utils.RandomPin(6)

	// 2. Save OTP and pending user payload in Redis with 60-second TTL
	ttl := 60 * time.Second

	pendingData := map[string]string{
		"name":          req.Name,
		"email":         req.Email,
		"password_hash": hashedPassword,
	}
	jsonPayload, _ := json.Marshal(pendingData)

	if err := s.otpCache.SetOTP(ctx, req.Email, otpCode, ttl); err != nil {
		return "", err
	}
	_ = s.otpCache.SetPendingUser(ctx, req.Email, string(jsonPayload), ttl)

	// 3. Send OTP Code via SMTP
	go s.emailSender.SendOTPEmail(req.Email, otpCode)

	return "OTP code has been sent to your email. Valid for 60 seconds.", nil
}

func (s *authService) VerifyOTP(ctx context.Context, req dto.VerifyOTPRequest) (*dto.AuthResponse, error) {
	// 1. Fetch OTP from Redis
	storedOTP, err := s.otpCache.GetOTP(ctx, req.Email)
	if err != nil || storedOTP == "" {
		return nil, errors.New("OTP code has expired or is invalid. Please request a new OTP.")
	}

	// 2. Validate OTP code
	if storedOTP != req.OTPCode {
		return nil, errors.New("Invalid OTP code. Please check your email and try again.")
	}

	// 3. Fetch pending user payload from Redis
	pendingStr, err := s.otpCache.GetPendingUser(ctx, req.Email)
	if err != nil || pendingStr == "" {
		return nil, errors.New("Registration session expired. Please register again.")
	}

	var pendingData map[string]string
	if err := json.Unmarshal([]byte(pendingStr), &pendingData); err != nil {
		return nil, err
	}

	// 4. Create user in PostgreSQL DB
	user := &domain.User{
		ID:           uuid.New(),
		Name:         pendingData["name"],
		Email:        pendingData["email"],
		PasswordHash: pendingData["password_hash"],
		Role:         domain.RoleUser,
		IsActive:     true,
	}

	if err := s.userRepo.Create(ctx, user); err != nil {
		return nil, err
	}

	// 5. Delete OTP & pending data from Redis
	_ = s.otpCache.DeleteOTP(ctx, req.Email)

	// 6. Generate JWT Session Token
	token, err := s.jwtManager.GenerateToken(user)
	if err != nil {
		return nil, err
	}

	return &dto.AuthResponse{
		Token: token,
		User: dto.UserResponse{
			ID:        user.ID,
			Name:      user.Name,
			Email:     user.Email,
			Role:      user.Role,
			IsActive:  user.IsActive,
			CreatedAt: user.CreatedAt,
		},
	}, nil
}

func (s *authService) ResendOTP(ctx context.Context, req dto.ResendOTPRequest) error {
	pendingStr, err := s.otpCache.GetPendingUser(ctx, req.Email)
	if err != nil || pendingStr == "" {
		return errors.New("No pending registration found for this email")
	}

	otpCode := utils.RandomPin(6)
	ttl := 60 * time.Second

	if err := s.otpCache.SetOTP(ctx, req.Email, otpCode, ttl); err != nil {
		return err
	}
	_ = s.otpCache.SetPendingUser(ctx, req.Email, pendingStr, ttl)

	go s.emailSender.SendOTPEmail(req.Email, otpCode)
	return nil
}

func (s *authService) Login(ctx context.Context, req dto.LoginRequest) (*dto.AuthResponse, error) {
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return nil, domain.ErrInvalidCredentials
	}

	if !user.IsActive {
		return nil, domain.ErrForbidden
	}

	if !s.passwordHasher.ComparePassword(user.PasswordHash, req.Password) {
		return nil, domain.ErrInvalidCredentials
	}

	token, err := s.jwtManager.GenerateToken(user)
	if err != nil {
		return nil, err
	}

	return &dto.AuthResponse{
		Token: token,
		User: dto.UserResponse{
			ID:        user.ID,
			Name:      user.Name,
			Email:     user.Email,
			Role:      user.Role,
			AvatarURL: user.AvatarURL,
			IsActive:  user.IsActive,
			CreatedAt: user.CreatedAt,
		},
	}, nil
}

func (s *authService) ForgotPassword(ctx context.Context, req dto.ForgotPasswordRequest) (string, error) {
	user, err := s.userRepo.GetByEmail(ctx, req.Email)
	if err != nil {
		return "", domain.ErrUserNotFound
	}

	token := utils.RandomString(32)
	reset := &domain.PasswordReset{
		ID:        uuid.New(),
		Email:     user.Email,
		Token:     token,
		ExpiresAt: time.Now().Add(1 * time.Hour),
	}

	_ = s.userRepo.DeletePasswordReset(ctx, user.Email)
	if err := s.userRepo.CreatePasswordReset(ctx, reset); err != nil {
		return "", err
	}

	return token, nil
}

func (s *authService) ResetPassword(ctx context.Context, req dto.ResetPasswordRequest) error {
	reset, err := s.userRepo.GetPasswordResetByToken(ctx, req.Token)
	if err != nil {
		return domain.ErrInvalidToken
	}

	user, err := s.userRepo.GetByEmail(ctx, reset.Email)
	if err != nil {
		return domain.ErrUserNotFound
	}

	hashedPassword, err := s.passwordHasher.HashPassword(req.NewPassword)
	if err != nil {
		return err
	}

	user.PasswordHash = hashedPassword
	if err := s.userRepo.Update(ctx, user); err != nil {
		return err
	}

	_ = s.userRepo.DeletePasswordReset(ctx, user.Email)
	return nil
}
