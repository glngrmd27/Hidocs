package service

import (
	"context"

	"backend/internal/application/dto"
	"backend/internal/domain"
	"github.com/google/uuid"
)

type QuestionService interface {
	AddQuestion(ctx context.Context, userID uuid.UUID, formID uuid.UUID, req dto.CreateQuestionRequest) (*dto.QuestionDTO, error)
	UpdateQuestion(ctx context.Context, userID uuid.UUID, questionID uuid.UUID, req dto.UpdateQuestionRequest) (*dto.QuestionDTO, error)
	DeleteQuestion(ctx context.Context, userID uuid.UUID, questionID uuid.UUID) error
	DeleteOption(ctx context.Context, userID uuid.UUID, optionID uuid.UUID) error
}

type questionService struct {
	questionRepo domain.QuestionRepository
	formRepo     domain.FormRepository
}

func NewQuestionService(questionRepo domain.QuestionRepository, formRepo domain.FormRepository) QuestionService {
	return &questionService{
		questionRepo: questionRepo,
		formRepo:     formRepo,
	}
}

func (s *questionService) AddQuestion(ctx context.Context, userID uuid.UUID, formID uuid.UUID, req dto.CreateQuestionRequest) (*dto.QuestionDTO, error) {
	form, err := s.formRepo.GetByID(ctx, formID)
	if err != nil {
		return nil, err
	}

	if form.UserID != userID {
		return nil, domain.ErrForbidden
	}

	qID := uuid.New()
	var options []domain.QuestionOption
	for i, optReq := range req.Options {
		idx := optReq.OrderIndex
		if idx == 0 {
			idx = i + 1
		}
		options = append(options, domain.QuestionOption{
			ID:         uuid.New(),
			QuestionID: qID,
			OptionText: optReq.OptionText,
			IsCorrect:  optReq.IsCorrect,
			OrderIndex: idx,
		})
	}

	question := &domain.Question{
		ID:           qID,
		FormID:       formID,
		QuestionText: req.QuestionText,
		QuestionType: req.QuestionType,
		CodeLanguage: req.CodeLanguage,
		Points:       req.Points,
		OrderIndex:   req.OrderIndex,
		IsRequired:   req.IsRequired,
		Options:      options,
	}

	if err := s.questionRepo.CreateQuestion(ctx, question); err != nil {
		return nil, err
	}

	return s.mapQuestionToDTO(question), nil
}

func (s *questionService) UpdateQuestion(ctx context.Context, userID uuid.UUID, questionID uuid.UUID, req dto.UpdateQuestionRequest) (*dto.QuestionDTO, error) {
	q, err := s.questionRepo.GetQuestionByID(ctx, questionID)
	if err != nil {
		return nil, err
	}

	form, err := s.formRepo.GetByID(ctx, q.FormID)
	if err != nil {
		return nil, err
	}

	if form.UserID != userID {
		return nil, domain.ErrForbidden
	}

	q.QuestionText = req.QuestionText
	q.QuestionType = req.QuestionType
	q.CodeLanguage = req.CodeLanguage
	q.Points = req.Points
	q.OrderIndex = req.OrderIndex
	q.IsRequired = req.IsRequired

	var options []domain.QuestionOption
	for i, optReq := range req.Options {
		idx := optReq.OrderIndex
		if idx == 0 {
			idx = i + 1
		}
		options = append(options, domain.QuestionOption{
			ID:         uuid.New(),
			QuestionID: q.ID,
			OptionText: optReq.OptionText,
			IsCorrect:  optReq.IsCorrect,
			OrderIndex: idx,
		})
	}
	q.Options = options

	if err := s.questionRepo.UpdateQuestion(ctx, q); err != nil {
		return nil, err
	}

	return s.mapQuestionToDTO(q), nil
}

func (s *questionService) DeleteQuestion(ctx context.Context, userID uuid.UUID, questionID uuid.UUID) error {
	q, err := s.questionRepo.GetQuestionByID(ctx, questionID)
	if err != nil {
		return err
	}

	form, err := s.formRepo.GetByID(ctx, q.FormID)
	if err != nil {
		return err
	}

	if form.UserID != userID {
		return domain.ErrForbidden
	}

	return s.questionRepo.DeleteQuestion(ctx, questionID)
}

func (s *questionService) DeleteOption(ctx context.Context, userID uuid.UUID, optionID uuid.UUID) error {
	opt, err := s.questionRepo.GetOptionByID(ctx, optionID)
	if err != nil {
		return err
	}

	q, err := s.questionRepo.GetQuestionByID(ctx, opt.QuestionID)
	if err != nil {
		return err
	}

	form, err := s.formRepo.GetByID(ctx, q.FormID)
	if err != nil {
		return err
	}

	if form.UserID != userID {
		return domain.ErrForbidden
	}

	return s.questionRepo.DeleteOption(ctx, optionID)
}

func (s *questionService) mapQuestionToDTO(q *domain.Question) *dto.QuestionDTO {
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

	return &dto.QuestionDTO{
		ID:           q.ID,
		FormID:       q.FormID,
		QuestionText: q.QuestionText,
		QuestionType: q.QuestionType,
		CodeLanguage: q.CodeLanguage,
		Points:       q.Points,
		OrderIndex:   q.OrderIndex,
		IsRequired:   q.IsRequired,
		Options:      optDTOs,
	}
}
