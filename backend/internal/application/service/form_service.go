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
	UpdateFormSettings(ctx context.Context, userID uuid.UUID, formID uuid.UUID, req dto.UpdateFormSettingsRequest) (*domain.FormSettings, error)
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
		IsTemplate:  req.IsTemplate,
	}

	if err := s.formRepo.Create(ctx, form); err != nil {
		return nil, err
	}

	defaultDuration := 60
	settings := &domain.FormSettings{
		ID:                  uuid.New(),
		FormID:              form.ID,
		DurationMinutes:     &defaultDuration,
		AutoActiveDays:      30,
		IsActiveImmediately: false,
		IsOneTimeSubmission: false,
		RandomizeQuestions:  false,
		RandomizeOptions:    false,
	}
	_ = s.formRepo.UpsertFormSettings(ctx, settings)
	form.FormSettings = settings

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
	form.IsTemplate = req.IsTemplate

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

func (s *formService) UpdateFormSettings(ctx context.Context, userID uuid.UUID, formID uuid.UUID, req dto.UpdateFormSettingsRequest) (*domain.FormSettings, error) {
	form, err := s.formRepo.GetByID(ctx, formID)
	if err != nil {
		return nil, err
	}

	if form.UserID != userID {
		return nil, domain.ErrForbidden
	}

	settings := &domain.FormSettings{
		ID:                  uuid.New(),
		FormID:              formID,
		DurationMinutes:     req.DurationMinutes,
		AutoActiveDays:      req.AutoActiveDays,
		IsActiveImmediately: req.IsActiveImmediately,
		IsOneTimeSubmission: req.IsOneTimeSubmission,
		RandomizeQuestions:  req.RandomizeQuestions,
		RandomizeOptions:    req.RandomizeOptions,
		StartTime:           req.StartTime,
		EndTime:             req.EndTime,
	}

	if err := s.formRepo.UpsertFormSettings(ctx, settings); err != nil {
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

	// Schedule check
	if form.FormSettings != nil {
		now := time.Now()
		if form.FormSettings.StartTime != nil && now.Before(*form.FormSettings.StartTime) {
			return nil, domain.ErrFormNotStarted
		}
		if form.FormSettings.EndTime != nil && now.After(*form.FormSettings.EndTime) {
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
		IsTemplate:  form.IsTemplate,
		Questions:   []dto.PublicQuestionDTO{},
	}

	if form.FormSettings != nil {
		publicDTO.FormSettings = &dto.PublicFormSettings{
			DurationMinutes:     form.FormSettings.DurationMinutes,
			AutoActiveDays:      form.FormSettings.AutoActiveDays,
			IsActiveImmediately: form.FormSettings.IsActiveImmediately,
			IsOneTimeSubmission: form.FormSettings.IsOneTimeSubmission,
			RandomizeQuestions:  form.FormSettings.RandomizeQuestions,
			RandomizeOptions:    form.FormSettings.RandomizeOptions,
			StartTime:           form.FormSettings.StartTime,
			EndTime:             form.FormSettings.EndTime,
		}
	}

	// Randomization
	questions := form.Questions
	if form.FormSettings != nil && form.FormSettings.RandomizeQuestions {
		rand.Seed(time.Now().UnixNano())
		rand.Shuffle(len(questions), func(i, j int) {
			questions[i], questions[j] = questions[j], questions[i]
		})
	}

	for _, q := range questions {
		options := q.Options
		if form.FormSettings != nil && form.FormSettings.RandomizeOptions {
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
			ImgURL:       q.ImgURL,
			IsAutoScored: q.IsAutoScored,
			Points:       q.Points,
			OrderIndex:   q.OrderIndex,
			IsRequired:   q.IsRequired,
			Options:      publicOptions,
		})
	}

	return publicDTO, nil
}

func (s *formService) GetFormQRCode(ctx context.Context, identifier string) (string, error) {
	form, err := s.GetPublicForm(ctx, identifier)
	if err != nil {
		return "", err
	}

	qrURL := "https://quickchart.io/qr?text=" + form.CustomURL + "&size=300"
	return qrURL, nil
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
			ImgURL:       q.ImgURL,
			IsAutoScored: q.IsAutoScored,
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
		IsTemplate:    form.IsTemplate,
		CreatedAt:     form.CreatedAt,
		ResponseCount: count,
		FormSettings:  form.FormSettings,
		Questions:     questionDTOs,
	}
}
