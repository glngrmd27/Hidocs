package main

import (
	"fmt"
	"log"
	"net/http"

	"backend/config"
	_ "backend/docs"
	"backend/internal/application/service"
	"backend/internal/domain"
	"backend/internal/infrastructure/cache"
	"backend/internal/infrastructure/database"
	"backend/internal/infrastructure/email"
	"backend/internal/infrastructure/parser"
	"backend/internal/infrastructure/repository"
	"backend/internal/infrastructure/security"
	"backend/internal/interfaces/http/handler"
	"backend/internal/interfaces/http/router"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

// @title HiDocs Backend API (Form & Exam Maker)
// @version 1.0
// @description High-performance backend API for HiDocs Form & Exam Maker application using Golang and Domain-Driven Design (DDD).
// @termsOfService http://swagger.io/terms/

// @contact.name HiDocs Support
// @contact.email support@hidocs.id

// @host localhost:8080
// @BasePath /
// @securityDefinitions.apikey BearerAuth
// @in header
// @name Authorization

func main() {
	cfg := config.LoadConfig()

	// Initialize Postgres DB
	db, err := database.NewPostgresDB(cfg)
	if err != nil {
		log.Fatalf("Failed to initialize database: %v", err)
	}

	// Security & External Infrastructure Components
	hasher := security.NewBcryptHasher()
	jwtManager := security.NewJWTManager(cfg.JWTSecret, cfg.JWTExpireHr)
	docxParser := parser.NewDocxParser()
	redisClient := cache.NewRedisClient(cfg)
	emailSender := email.NewSMTPEmailSender(cfg)

	// Seed Admin User if not existing
	seedAdmin(db, hasher)

	// Repositories
	userRepo := repository.NewUserRepository(db)
	formRepo := repository.NewFormRepository(db)
	questionRepo := repository.NewQuestionRepository(db)
	responseRepo := repository.NewResponseRepository(db)
	adminRepo := repository.NewAdminRepository(db)

	// Services
	authService := service.NewAuthService(userRepo, hasher, jwtManager, redisClient, emailSender)
	userService := service.NewUserService(userRepo, hasher)
	formService := service.NewFormService(formRepo)
	questionService := service.NewQuestionService(questionRepo, formRepo)
	responseService := service.NewResponseService(responseRepo, formRepo, questionRepo)
	docxService := service.NewDocxService(docxParser, formRepo, questionRepo)
	exportService := service.NewExportService(formRepo, responseRepo, questionRepo)
	adminService := service.NewAdminService(adminRepo, userRepo, hasher)

	// Handlers
	authHandler := handler.NewAuthHandler(authService)
	userHandler := handler.NewUserHandler(userService)
	formHandler := handler.NewFormHandler(formService, docxService)
	questionHandler := handler.NewQuestionHandler(questionService, formService)
	responseHandler := handler.NewResponseHandler(responseService, exportService)
	publicHandler := handler.NewPublicHandler(formService)
	adminHandler := handler.NewAdminHandler(adminService)

	// Router
	r := router.SetupRouter(&router.RouterConfig{
		AuthHandler:     authHandler,
		UserHandler:     userHandler,
		FormHandler:     formHandler,
		QuestionHandler: questionHandler,
		ResponseHandler: responseHandler,
		PublicHandler:   publicHandler,
		AdminHandler:    adminHandler,
		JWTManager:      jwtManager,
	})

	serverAddr := fmt.Sprintf(":%s", cfg.AppPort)
	log.Printf("🚀 HiDocs Backend Server running on port %s", cfg.AppPort)

	srv := &http.Server{
		Addr:    serverAddr,
		Handler: r,
	}

	if err := srv.ListenAndServe(); err != nil && err != http.ErrServerClosed {
		log.Fatalf("Server failed: %v", err)
	}
}

func seedAdmin(db *gorm.DB, hasher security.PasswordHasher) {
	var count int64
	db.Model(&domain.User{}).Where("role = ?", domain.RoleAdmin).Count(&count)
	if count == 0 {
		hashed, _ := hasher.HashPassword("admin123")
		admin := &domain.User{
			ID:           uuid.New(),
			Name:         "System Admin",
			Email:        "admin@hidocs.id",
			PasswordHash: hashed,
			Role:         domain.RoleAdmin,
			IsActive:     true,
		}
		if err := db.Create(admin).Error; err == nil {
			log.Println("Default admin user created: admin@hidocs.id / admin123")
		}
	}
}
