package service

import (
	"context"
	"runtime"

	"backend/internal/application/dto"
	"backend/internal/domain"
	"backend/internal/infrastructure/metrics"
	"github.com/google/uuid"
	"gorm.io/gorm"
)

type MetricsService interface {
	GetRealtimeMetrics(ctx context.Context) (*dto.RealtimeMetricsData, error)
	GetSystemMetrics(ctx context.Context) (*dto.SystemMetricsData, error)
	GetLiveExams(ctx context.Context) ([]dto.LiveExamDTO, error)
	GetTrafficHistory(ctx context.Context, duration string) (*dto.TrafficHistoryData, error)
	GetFormMetrics(ctx context.Context, formID uuid.UUID) (*dto.FormMetricsDTO, error)
}

type metricsService struct {
	db        *gorm.DB
	formRepo  domain.FormRepository
	collector *metrics.MetricsCollector
}

func NewMetricsService(db *gorm.DB, formRepo domain.FormRepository) MetricsService {
	return &metricsService{
		db:        db,
		formRepo:  formRepo,
		collector: metrics.GetCollector(),
	}
}

func (s *metricsService) GetRealtimeMetrics(ctx context.Context) (*dto.RealtimeMetricsData, error) {
	data := s.collector.GetRealtimeMetrics()

	// Fill system details
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	sqlDB, err := s.db.DB()
	var dbOpen, dbIdle int
	if err == nil {
		stats := sqlDB.Stats()
		dbOpen = stats.OpenConnections
		dbIdle = stats.Idle
	}

	data.SystemMetrics = dto.SystemMetricsDetail{
		CPUUsagePercent:   float64(runtime.NumGoroutine()) * 0.1, // Normalized runtime goroutines indicator
		MemoryUsageMB:     float64(m.Alloc) / 1024 / 1024,
		DBOpenConnections: dbOpen,
		DBIdleConnections: dbIdle,
	}

	return &data, nil
}

func (s *metricsService) GetSystemMetrics(ctx context.Context) (*dto.SystemMetricsData, error) {
	var m runtime.MemStats
	runtime.ReadMemStats(&m)

	sqlDB, err := s.db.DB()
	var dbPool dto.DBPoolMetrics
	if err == nil {
		stats := sqlDB.Stats()
		dbPool = dto.DBPoolMetrics{
			MaxOpenConnections: stats.MaxOpenConnections,
			ActiveConnections:  stats.InUse,
			IdleConnections:    stats.Idle,
			WaitCount:          stats.WaitCount,
		}
	} else {
		dbPool = dto.DBPoolMetrics{
			MaxOpenConnections: 150,
		}
	}

	return &dto.SystemMetricsData{
		Timestamp: s.collector.GetRealtimeMetrics().Timestamp,
		CPU: dto.CpuMetrics{
			UsagePercent: float64(runtime.NumGoroutine()) * 0.1,
			Cores:        runtime.NumCPU(),
		},
		Memory: dto.MemoryMetrics{
			AllocMB:  float64(m.Alloc) / 1024 / 1024,
			SysMB:    float64(m.Sys) / 1024 / 1024,
			GCCycles: m.NumGC,
		},
		GoroutinesCount: runtime.NumGoroutine(),
		DatabasePool:    dbPool,
	}, nil
}

func (s *metricsService) GetLiveExams(ctx context.Context) ([]dto.LiveExamDTO, error) {
	var forms []domain.Form
	err := s.db.WithContext(ctx).
		Preload("User").
		Preload("FormSettings").
		Where("type = ? AND status = ?", domain.TypeExam, domain.StatusActive).
		Order("created_at desc").
		Find(&forms).Error
	if err != nil {
		return nil, err
	}

	var dtos []dto.LiveExamDTO
	for _, f := range forms {
		activeCount := s.collector.GetActiveFormStudents(f.ID.String())
		subCount, _ := s.formRepo.GetFormResponseCount(ctx, f.ID)

		creatorName := "System Admin"
		if f.User != nil {
			creatorName = f.User.Name
		}

		dtoItem := dto.LiveExamDTO{
			FormID:              f.ID.String(),
			Title:               f.Title,
			CreatorName:         creatorName,
			ActiveStudents:      activeCount,
			SubmittedCount:      subCount,
			TotalTargetStudents: subCount + activeCount,
		}

		if f.FormSettings != nil {
			dtoItem.StartedAt = f.FormSettings.StartTime
			dtoItem.EndsAt = f.FormSettings.EndTime
		}

		dtos = append(dtos, dtoItem)
	}

	return dtos, nil
}

func (s *metricsService) GetTrafficHistory(ctx context.Context, duration string) (*dto.TrafficHistoryData, error) {
	history := s.collector.GetTrafficHistory(duration)
	return &history, nil
}

func (s *metricsService) GetFormMetrics(ctx context.Context, formID uuid.UUID) (*dto.FormMetricsDTO, error) {
	form, err := s.formRepo.GetByID(ctx, formID)
	if err != nil {
		return nil, err
	}

	activeStudents := s.collector.GetActiveFormStudents(form.ID.String())
	submittedCount, _ := s.formRepo.GetFormResponseCount(ctx, form.ID)

	return &dto.FormMetricsDTO{
		FormID:         form.ID.String(),
		Title:          form.Title,
		ActiveStudents: activeStudents,
		TotalSubmitted: submittedCount,
		AverageScore:   0.0,
	}, nil
}
