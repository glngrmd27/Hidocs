package database

import (
	"fmt"
	"log"
	"time"

	"backend/config"
	"backend/internal/domain"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func NewPostgresDB(cfg *config.Config) (*gorm.DB, error) {
	// 1. First connect to default 'postgres' database to verify/create target database
	defaultDSN := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=postgres port=%s sslmode=%s TimeZone=Asia/Jakarta",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBPort, cfg.DBSSLMode,
	)

	defaultDB, err := gorm.Open(postgres.Open(defaultDSN), &gorm.Config{
		Logger: logger.Default.LogMode(logger.Silent),
	})
	if err == nil {
		var count int
		checkQuery := fmt.Sprintf("SELECT count(*) FROM pg_database WHERE datname = '%s'", cfg.DBName)
		defaultDB.Raw(checkQuery).Scan(&count)
		if count == 0 {
			createDBQuery := fmt.Sprintf("CREATE DATABASE %s", cfg.DBName)
			if createErr := defaultDB.Exec(createDBQuery).Error; createErr != nil {
				log.Printf("Warning: failed to auto-create database %s: %v", cfg.DBName, createErr)
			} else {
				log.Printf("Database '%s' created successfully!", cfg.DBName)
			}
		}
		sqlDB, _ := defaultDB.DB()
		if sqlDB != nil {
			sqlDB.Close()
		}
	}

	// 2. Connect to the target database
	dsn := fmt.Sprintf(
		"host=%s user=%s password=%s dbname=%s port=%s sslmode=%s TimeZone=Asia/Jakarta",
		cfg.DBHost, cfg.DBUser, cfg.DBPassword, cfg.DBName, cfg.DBPort, cfg.DBSSLMode,
	)

	gormConfig := &gorm.Config{}
	if cfg.AppEnv == "development" {
		gormConfig.Logger = logger.Default.LogMode(logger.Info)
	} else {
		gormConfig.Logger = logger.Default.LogMode(logger.Error)
	}

	db, err := gorm.Open(postgres.Open(dsn), gormConfig)
	if err != nil {
		return nil, fmt.Errorf("failed to connect to database: %w", err)
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, fmt.Errorf("failed to get sql.DB instance: %w", err)
	}

	// Performance Optimization for 1000+ Concurrent Users
	sqlDB.SetMaxOpenConns(100)
	sqlDB.SetMaxIdleConns(25)
	sqlDB.SetConnMaxLifetime(15 * time.Minute)
	sqlDB.SetConnMaxIdleTime(5 * time.Minute)

	log.Println("PostgreSQL connected successfully with high-concurrency pool settings")

	// Enable uuid extension in postgres if needed
	db.Exec("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\";")

	// Auto Migration
	err = db.AutoMigrate(
		&domain.User{},
		&domain.PasswordReset{},
		&domain.Form{},
		&domain.ExamSettings{},
		&domain.Question{},
		&domain.QuestionOption{},
		&domain.FormResponse{},
		&domain.ResponseAnswer{},
	)
	if err != nil {
		return nil, fmt.Errorf("auto migration failed: %w", err)
	}

	return db, nil
}
