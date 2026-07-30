package service

import (
	"context"
	"math/rand"
	"time"

	"backend/internal/application/dto"
	"backend/internal/domain"
	"backend/pkg/utils"
	"github.com/google/uuid"
)

type FormService interface {
	CreateForm(ctx context.Context, userID uuid.UUID, req dto.CreateFormRequest) (*dto.FormResponseDTO, error)
	GetFormByID(ctx context.Context, formID uuid.UUID) (*dto.FormResponseDTO, error)
	ListUserForms(ctx context.Context, userID uuid.UUID, status domain.FormStatus) ([]dto.FormResponseDTO, error)
	UpdateForm(ctx context.Context, userID uuid.UUID, formID uuid.UUID, req dto.UpdateFormRequest) (*dto.FormResponseDTO, error)
	DeleteForm(ctx context.Context, userID uuid.UUID, formID uuid.UUID) error
	UpdateExamSettings(ctx context.Context, userID uuid.UUID, formID uuid.UUID, req dto.UpdateExamSettingsRequest) (*domain.ExamSettings, error)
	GetPublicForm(ctx context.Context, identifier string) (*dto.PublicFormDTO, error)
	GetFormQRCode(ctx context.Context, identifier string) (string, error)
}

type formService struct {
	formRepo domain.FormRepository
}

func NewFormService(formRepo domain.FormRepository) FormService {
	return &formService{formRepo: formRepo}
}

func (s *formService) CreateForm(ctx context.Context, userID uuid.UUID, req dto.CreateFormRequest) (*dto.FormResponseDTO, error) {
	customURL := req.CustomURL
	if customURL == "" {
		customURL = utils.GenerateSlug(req.Title)
	}

	form := &domain.Form{
		ID:          uuid.New(),
		UserID:      userID,
		Title:       req.Title,
		Description: req.Description,
		Type:        req.Type,
		CustomURL:   customURL,
		Status:      domain.StatusDraft,
	}

	if err := s.formRepo.Create(ctx, form); err != nil {
		return nil, err
	}

	if req.Type == domain.TypeExam {
		settings := &domain.ExamSettings{
			ID:                 uuid.New(),
			FormID:             form.ID,
			DurationMinutes:    60,
			RandomizeQuestions: false,
			RandomizeOptions:   false,
		}
		_ = s.formRepo.UpsertExamSettings(ctx, settings)
		form.ExamSettings = settings
	}

	return s.mapFormToDTO(ctx, form), nil
}

func (s *formService) GetFormByID(ctx context.Context, formID uuid.UUID) (*dto.FormResponseDTO, error) {
	form, err := s.formRepo.GetByID(ctx, formID)
	if err != nil {
		return nil, err
	}
	return s.mapFormToDTO(ctx, form), nil
}

func (s *formService) ListUserForms(ctx context.Context, userID uuid.UUID, status domain.FormStatus) ([]dto.FormResponseDTO, error) {
	forms, err := s.formRepo.GetByUserID(ctx, userID, status)
	if err != nil {
		return nil, err
	}

	var dtos []dto.FormResponseDTO
	for _, f := range forms {
		dtos = append(dtos, *s.mapFormToDTO(ctx, &f))
	}
	return dtos, nil
}

func (s *formService) UpdateForm(ctx context.Context, userID uuid.UUID, formID uuid.UUID, req dto.UpdateFormRequest) (*dto.FormResponseDTO, error) {
	form, err := s.formRepo.GetByID(ctx, formID)
	if err != nil {
		return nil, err
	}

	if form.UserID != userID {
		return nil, domain.ErrForbidden
	}

	form.Title = req.Title
	form.Description = req.Description
	form.Type = req.Type
	if req.CustomURL != "" {
		form.CustomURL = req.CustomURL
	}
	form.Status = req.Status

	if err := s.formRepo.Update(ctx, form); err != nil {
		return nil, err
	}

	return s.mapFormToDTO(ctx, form), nil
}

func (s *formService) DeleteForm(ctx context.Context, userID uuid.UUID, formID uuid.UUID) error {
	form, err := s.formRepo.GetByID(ctx, formID)
	if err != nil {
		return err
	}

	if form.UserID != userID {
		return domain.ErrForbidden
	}

	return s.formRepo.Delete(ctx, formID)
}

func (s *formService) UpdateExamSettings(ctx context.Context, userID uuid.UUID, formID uuid.UUID, req dto.UpdateExamSettingsRequest) (*domain.ExamSettings, error) {
	form, err := s.formRepo.GetByID(ctx, formID)
	if err != nil {
		return nil, err
	}

	if form.UserID != userID {
		return nil, domain.ErrForbidden
	}

	settings := &domain.ExamSettings{
		ID:                 uuid.New(),
		FormID:             formID,
		DurationMinutes:    req.DurationMinutes,
		MaxSubmissions:     req.MaxSubmissions,
		Passcode:           req.Passcode,
		RandomizeQuestions: req.RandomizeQuestions,
		RandomizeOptions:   req.RandomizeOptions,
		StartTime:          req.StartTime,
		EndTime:            req.EndTime,
	}

	if err := s.formRepo.UpsertExamSettings(ctx, settings); err != nil {
		return nil, err
	}

	return settings, nil
}

func (s *formService) GetPublicForm(ctx context.Context, identifier string) (*dto.PublicFormDTO, error) {
	var form *domain.Form
	var err error

	formID, parseErr := uuid.Parse(identifier)
	if parseErr == nil {
		form, err = s.formRepo.GetByID(ctx, formID)
	} else {
		form, err = s.formRepo.GetByCustomURL(ctx, identifier)
	}

	if err != nil {
		return nil, domain.ErrFormNotFound
	}

	if form.Status == domain.StatusClosed {
		return nil, domain.ErrFormClosed
	}

	// Check Exam schedule if EXAM type
	if form.Type == domain.TypeExam && form.ExamSettings != nil {
		now := time.Now()
		if form.ExamSettings.StartTime != nil && now.Before(*form.ExamSettings.StartTime) {
			return nil, domain.ErrFormNotStarted
		}
		if form.ExamSettings.EndTime != nil && now.After(*form.ExamSettings.EndTime) {
			return nil, domain.ErrFormEnded
		}
	}

	publicDTO := &dto.PublicFormDTO{
		ID:          form.ID,
		Title:       form.Title,
		Description: form.Description,
		Type:        form.Type,
		CustomURL:   form.CustomURL,
		Status:      form.Status,
		Questions:   []dto.PublicQuestionDTO{},
	}

	if form.ExamSettings != nil {
		publicDTO.ExamSettings = &dto.PublicExamSettings{
			DurationMinutes:    form.ExamSettings.DurationMinutes,
			MaxSubmissions:     form.ExamSettings.MaxSubmissions,
			HasPasscode:        form.ExamSettings.Passcode != "",
			RandomizeQuestions: form.ExamSettings.RandomizeQuestions,
			RandomizeOptions:   form.ExamSettings.RandomizeOptions,
			StartTime:          form.ExamSettings.StartTime,
			EndTime:            form.ExamSettings.EndTime,
		}
	}

	// Format questions (Hide IsCorrect for exam security!)
	questions := form.Questions
	if form.ExamSettings != nil && form.ExamSettings.RandomizeQuestions {
		rand.Seed(time.Now().UnixNano())
		rand.Shuffle(len(questions), func(i, j int) {
			questions[i], questions[j] = questions[j], questions[i]
		})
	}

	for _, q := range questions {
		options := q.Options
		if form.ExamSettings != nil && form.ExamSettings.RandomizeOptions {
			rand.Seed(time.Now().UnixNano())
			rand.Shuffle(len(options), func(i, j int) {
				options[i], options[j] = options[j], options[i]
			})
		}

		var publicOptions []dto.PublicOptionDTO
		for _, opt := range options {
			publicOptions = append(publicOptions, dto.PublicOptionDTO{
				ID:         opt.ID,
				OptionText: opt.OptionText,
				OrderIndex: opt.OrderIndex,
			})
		}

		publicDTO.Questions = append(publicDTO.Questions, dto.PublicQuestionDTO{
			ID:           q.ID,
			QuestionText: q.QuestionText,
			QuestionType: q.QuestionType,
			CodeLanguage: q.CodeLanguage,
			Points:       q.Points,
			OrderIndex:   q.OrderIndex,
			IsRequired:   q.IsRequired,
			Options:      publicOptions,
		})
	}

	return publicDTO, nil
}

func (s *formService) mapFormToDTO(ctx context.Context, form *domain.Form) *dto.FormResponseDTO {
	count, _ := s.formRepo.GetFormResponseCount(ctx, form.ID)

	var questionDTOs []dto.QuestionDTO
	for _, q := range form.Questions {
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

		questionDTOs = append(questionDTOs, dto.QuestionDTO{
			ID:           q.ID,
			FormID:       q.FormID,
			QuestionText: q.QuestionText,
			QuestionType: q.QuestionType,
			CodeLanguage: q.CodeLanguage,
			Points:       q.Points,
			OrderIndex:   q.OrderIndex,
			IsRequired:   q.IsRequired,
			Options:      optDTOs,
		})
	}

	return &dto.FormResponseDTO{
		ID:            form.ID,
		UserID:        form.UserID,
		Title:         form.Title,
		Description:   form.Description,
		Type:          form.Type,
		CustomURL:     form.CustomURL,
		Status:        form.Status,
		CreatedAt:     form.CreatedAt,
		ResponseCount: count,
		ExamSettings:  form.ExamSettings,
		Questions:     questionDTOs,
	}
}

func (s *formService) GetFormQRCode(ctx context.Context, identifier string) (string, error) {
	form, err := s.GetPublicForm(ctx, identifier)
	if err != nil {
		return "", err
	}

	qrURL := "https://quickchart.io/qr?text=" + form.CustomURL + "&size=300"
	return qrURL, nil
}
