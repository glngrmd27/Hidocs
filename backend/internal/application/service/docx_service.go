package service

import (
	"context"

	"backend/internal/application/dto"
	"backend/internal/domain"
	"backend/internal/infrastructure/parser"
	"backend/pkg/utils"
	"github.com/google/uuid"
)

type DocxService interface {
	ImportFormFromDocx(ctx context.Context, userID uuid.UUID, fileBytes []byte) (*dto.FormResponseDTO, error)
}

type docxService struct {
	docxParser   *parser.DocxParser
	formRepo     domain.FormRepository
	questionRepo domain.QuestionRepository
}

func NewDocxService(docxParser *parser.DocxParser, formRepo domain.FormRepository, questionRepo domain.QuestionRepository) DocxService {
	return &docxService{
		docxParser:   docxParser,
		formRepo:     formRepo,
		questionRepo: questionRepo,
	}
}

func (s *docxService) ImportFormFromDocx(ctx context.Context, userID uuid.UUID, fileBytes []byte) (*dto.FormResponseDTO, error) {
	formID := uuid.New()
	extracted, err := s.docxParser.ParseDocx(fileBytes, formID)
	if err != nil {
		return nil, err
	}

	form := &domain.Form{
		ID:          formID,
		UserID:      userID,
		Title:       extracted.Title,
		Description: extracted.Description,
		Type:        domain.TypeExam,
		CustomURL:   utils.GenerateSlug(extracted.Title),
		Status:      domain.StatusDraft,
	}

	if err := s.formRepo.Create(ctx, form); err != nil {
		return nil, err
	}

	if len(extracted.Questions) > 0 {
		if err := s.questionRepo.CreateBatchQuestions(ctx, extracted.Questions); err != nil {
			return nil, err
		}
	}

	// Create default exam settings
	settings := &domain.ExamSettings{
		ID:                 uuid.New(),
		FormID:             formID,
		DurationMinutes:    60,
		RandomizeQuestions: false,
		RandomizeOptions:   false,
	}
	_ = s.formRepo.UpsertExamSettings(ctx, settings)
	form.ExamSettings = settings

	// Retrieve complete form
	fullForm, err := s.formRepo.GetByID(ctx, formID)
	if err != nil {
		return nil, err
	}

	var qDTOs []dto.QuestionDTO
	for _, q := range fullForm.Questions {
		var optDTOs []dto.OptionDTO
		for _, opt := range q.Options {
			optDTOs = append(optDTOs, dto.OptionDTO{
				ID:         opt.ID,
				QuestionID: opt.QuestionID,
				OptionText: opt.OptionText,
				IsCorrect:  opt.IsCorrect,
				OrderIndex: opt.OrderIndex,
			})
		}
		qDTOs = append(qDTOs, dto.QuestionDTO{
			ID:           q.ID,
			FormID:       q.FormID,
			QuestionText: q.QuestionText,
			QuestionType: q.QuestionType,
			Points:       q.Points,
			OrderIndex:   q.OrderIndex,
			IsRequired:   q.IsRequired,
			Options:      optDTOs,
		})
	}

	return &dto.FormResponseDTO{
		ID:           fullForm.ID,
		UserID:       fullForm.UserID,
		Title:        fullForm.Title,
		Description:  fullForm.Description,
		Type:         fullForm.Type,
		CustomURL:    fullForm.CustomURL,
		Status:       fullForm.Status,
		CreatedAt:    fullForm.CreatedAt,
		ExamSettings: fullForm.ExamSettings,
		Questions:    qDTOs,
	}, nil
}
