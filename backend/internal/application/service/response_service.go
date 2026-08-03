package service

import (
	"context"
	"time"

	"backend/internal/application/dto"
	"backend/internal/domain"
	"github.com/google/uuid"
)

type ResponseService interface {
	SubmitResponse(ctx context.Context, formID uuid.UUID, req dto.SubmitFormRequest) (*dto.SubmitResponseResult, error)
	GetFormResponses(ctx context.Context, userID uuid.UUID, formID uuid.UUID) ([]dto.ResponseDetailDTO, error)
	GetResponseByID(ctx context.Context, userID uuid.UUID, responseID uuid.UUID) (*dto.ResponseDetailDTO, error)
	GradeResponse(ctx context.Context, userID uuid.UUID, responseID uuid.UUID, req dto.GradeResponseRequest) error
	GetAnalytics(ctx context.Context, userID uuid.UUID, formID uuid.UUID) (*domain.FormAnalytics, error)
}

type responseService struct {
	responseRepo domain.ResponseRepository
	formRepo     domain.FormRepository
	questionRepo domain.QuestionRepository
}

func NewResponseService(respRepo domain.ResponseRepository, formRepo domain.FormRepository, questionRepo domain.QuestionRepository) ResponseService {
	return &responseService{
		responseRepo: respRepo,
		formRepo:     formRepo,
		questionRepo: questionRepo,
	}
}

func (s *responseService) SubmitResponse(ctx context.Context, formID uuid.UUID, req dto.SubmitFormRequest) (*dto.SubmitResponseResult, error) {
	form, err := s.formRepo.GetByID(ctx, formID)
	if err != nil {
		return nil, domain.ErrFormNotFound
	}

	if form.Status == domain.StatusClosed {
		return nil, domain.ErrFormClosed
	}

	// Schedule validation
	if form.FormSettings != nil {
		now := time.Now()
		if form.FormSettings.StartTime != nil && now.Before(*form.FormSettings.StartTime) {
			return nil, domain.ErrFormNotStarted
		}
		if form.FormSettings.EndTime != nil && now.After(*form.FormSettings.EndTime) {
			return nil, domain.ErrFormEnded
		}
	}

	// Check if one-time submission is enforced
	if form.FormSettings != nil && form.FormSettings.IsOneTimeSubmission {
		alreadySubmitted, _ := s.responseRepo.CheckUserAlreadySubmitted(ctx, formID, req.RespondentEmail)
		if alreadySubmitted {
			return nil, domain.ErrAlreadySubmitted
		}
	}

	responseID := uuid.New()
	var totalScore float64 = 0
	var answers []domain.ResponseAnswer

	// Map existing questions & options for auto-grading
	questionsMap := make(map[uuid.UUID]domain.Question)
	for _, q := range form.Questions {
		questionsMap[q.ID] = q
	}

	for _, ansReq := range req.Answers {
		q, exists := questionsMap[ansReq.QuestionID]
		if !exists {
			continue
		}

		var scoreGiven float64 = 0
		ans := domain.ResponseAnswer{
			ID:               uuid.New(),
			ResponseID:       responseID,
			QuestionID:       ansReq.QuestionID,
			SelectedOptionID: ansReq.SelectedOptionID,
			AnswerText:       ansReq.AnswerText,
		}

		// Auto-Grading System for Multiple Choice / Dropdown
		if q.IsAutoScored && (q.QuestionType == domain.TypeMultipleChoice || q.QuestionType == domain.TypeDropdown || q.QuestionType == domain.TypeYesNo) && ansReq.SelectedOptionID != nil {
			for _, opt := range q.Options {
				if opt.ID == *ansReq.SelectedOptionID && opt.IsCorrect {
					scoreGiven = float64(q.Points)
					totalScore += scoreGiven
					break
				}
			}
		}

		ans.ScoreGiven = &scoreGiven
		answers = append(answers, ans)
	}

	formResponse := &domain.FormResponse{
		ID:              responseID,
		FormID:          formID,
		RespondentEmail: req.RespondentEmail,
		TotalScore:      &totalScore,
		IsAutoSubmitted: req.IsAutoSubmitted,
		SubmittedAt:     time.Now(),
		Answers:         answers,
	}

	if err := s.responseRepo.CreateResponse(ctx, formResponse); err != nil {
		return nil, err
	}

	return &dto.SubmitResponseResult{
		ResponseID:      responseID,
		TotalScore:      totalScore,
		IsAutoSubmitted: req.IsAutoSubmitted,
		SubmittedAt:     formResponse.SubmittedAt,
		Message:         "Response submitted successfully",
	}, nil
}

func (s *responseService) GetFormResponses(ctx context.Context, userID uuid.UUID, formID uuid.UUID) ([]dto.ResponseDetailDTO, error) {
	form, err := s.formRepo.GetByID(ctx, formID)
	if err != nil {
		return nil, err
	}

	if form.UserID != userID {
		return nil, domain.ErrForbidden
	}

	responses, err := s.responseRepo.GetResponsesByFormID(ctx, formID)
	if err != nil {
		return nil, err
	}

	var dtos []dto.ResponseDetailDTO
	for _, r := range responses {
		dtos = append(dtos, *s.mapResponseToDTO(&r))
	}
	return dtos, nil
}

func (s *responseService) GetResponseByID(ctx context.Context, userID uuid.UUID, responseID uuid.UUID) (*dto.ResponseDetailDTO, error) {
	resp, err := s.responseRepo.GetResponseByID(ctx, responseID)
	if err != nil {
		return nil, err
	}

	if resp.Form != nil && resp.Form.UserID != userID {
		return nil, domain.ErrForbidden
	}

	return s.mapResponseToDTO(resp), nil
}

func (s *responseService) GradeResponse(ctx context.Context, userID uuid.UUID, responseID uuid.UUID, req dto.GradeResponseRequest) error {
	resp, err := s.responseRepo.GetResponseByID(ctx, responseID)
	if err != nil {
		return err
	}

	if resp.Form != nil && resp.Form.UserID != userID {
		return domain.ErrForbidden
	}

	return s.responseRepo.UpdateResponseGrade(ctx, responseID, req.TotalScore)
}

func (s *responseService) GetAnalytics(ctx context.Context, userID uuid.UUID, formID uuid.UUID) (*domain.FormAnalytics, error) {
	form, err := s.formRepo.GetByID(ctx, formID)
	if err != nil {
		return nil, err
	}

	if form.UserID != userID {
		return nil, domain.ErrForbidden
	}

	return s.responseRepo.GetAnalyticsByFormID(ctx, formID)
}

func (s *responseService) mapResponseToDTO(resp *domain.FormResponse) *dto.ResponseDetailDTO {
	var answers []dto.AnswerDetailDTO
	for _, a := range resp.Answers {
		detail := dto.AnswerDetailDTO{
			ID:               a.ID,
			QuestionID:       a.QuestionID,
			SelectedOptionID: a.SelectedOptionID,
			AnswerText:       a.AnswerText,
			ScoreGiven:       a.ScoreGiven,
		}

		if a.Question != nil {
			detail.QuestionText = a.Question.QuestionText
		}
		if a.SelectedOption != nil {
			detail.SelectedOption = a.SelectedOption.OptionText
			isCorrect := a.SelectedOption.IsCorrect
			detail.IsCorrect = &isCorrect
			if isCorrect && a.Question != nil {
				detail.PointsEarned = float64(a.Question.Points)
			}
		}

		answers = append(answers, detail)
	}

	return &dto.ResponseDetailDTO{
		ID:              resp.ID,
		FormID:          resp.FormID,
		RespondentEmail: resp.RespondentEmail,
		TotalScore:      resp.TotalScore,
		IsAutoSubmitted: resp.IsAutoSubmitted,
		SubmittedAt:     resp.SubmittedAt,
		Answers:         answers,
	}
}
