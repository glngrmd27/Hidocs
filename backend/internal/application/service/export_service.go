package service

import (
	"bytes"
	"context"
	"encoding/csv"
	"fmt"
	"strconv"
	"time"

	"backend/internal/domain"
	"github.com/google/uuid"
	"github.com/xuri/excelize/v2"
)

type ExportService interface {
	ExportExcel(ctx context.Context, userID uuid.UUID, formID uuid.UUID) ([]byte, string, error)
	ExportCSV(ctx context.Context, userID uuid.UUID, formID uuid.UUID) ([]byte, string, error)
}

type exportService struct {
	formRepo     domain.FormRepository
	responseRepo domain.ResponseRepository
	questionRepo domain.QuestionRepository
}

func NewExportService(formRepo domain.FormRepository, responseRepo domain.ResponseRepository, questionRepo domain.QuestionRepository) ExportService {
	return &exportService{
		formRepo:     formRepo,
		responseRepo: responseRepo,
		questionRepo: questionRepo,
	}
}

func (s *exportService) ExportExcel(ctx context.Context, userID uuid.UUID, formID uuid.UUID) ([]byte, string, error) {
	form, err := s.formRepo.GetByID(ctx, formID)
	if err != nil {
		return nil, "", err
	}

	if form.UserID != userID {
		return nil, "", domain.ErrForbidden
	}

	responses, err := s.responseRepo.GetResponsesByFormID(ctx, formID)
	if err != nil {
		return nil, "", err
	}

	questions, err := s.questionRepo.GetQuestionsByFormID(ctx, formID)
	if err != nil {
		return nil, "", err
	}

	f := excelize.NewFile()
	sheet := "Responses"
	f.SetSheetName("Sheet1", sheet)

	// Headers
	headers := []string{"No", "Respondent Email", "Total Score", "Submitted At"}
	for _, q := range questions {
		headers = append(headers, q.QuestionText)
	}

	for colIdx, h := range headers {
		cell, _ := excelize.CoordinatesToCellName(colIdx+1, 1)
		f.SetCellValue(sheet, cell, h)
	}

	// Data rows
	for rowIdx, resp := range responses {
		rowNum := rowIdx + 2
		scoreVal := float64(0)
		if resp.TotalScore != nil {
			scoreVal = *resp.TotalScore
		}
		f.SetCellValue(sheet, fmt.Sprintf("A%d", rowNum), rowIdx+1)
		f.SetCellValue(sheet, fmt.Sprintf("B%d", rowNum), resp.RespondentEmail)
		f.SetCellValue(sheet, fmt.Sprintf("C%d", rowNum), scoreVal)
		f.SetCellValue(sheet, fmt.Sprintf("D%d", rowNum), resp.SubmittedAt.Format(time.RFC3339))

		// Map answers by QuestionID
		answerMap := make(map[uuid.UUID]string)
		for _, a := range resp.Answers {
			if a.SelectedOption != nil {
				answerMap[a.QuestionID] = a.SelectedOption.OptionText
			} else {
				answerMap[a.QuestionID] = a.AnswerText
			}
		}

		for qIdx, q := range questions {
			colNum := qIdx + 5
			cell, _ := excelize.CoordinatesToCellName(colNum, rowNum)
			f.SetCellValue(sheet, cell, answerMap[q.ID])
		}
	}

	var buf bytes.Buffer
	if err := f.Write(&buf); err != nil {
		return nil, "", err
	}

	filename := fmt.Sprintf("%s_responses_%s.xlsx", form.CustomURL, time.Now().Format("20060102_150405"))
	return buf.Bytes(), filename, nil
}

func (s *exportService) ExportCSV(ctx context.Context, userID uuid.UUID, formID uuid.UUID) ([]byte, string, error) {
	form, err := s.formRepo.GetByID(ctx, formID)
	if err != nil {
		return nil, "", err
	}

	if form.UserID != userID {
		return nil, "", domain.ErrForbidden
	}

	responses, err := s.responseRepo.GetResponsesByFormID(ctx, formID)
	if err != nil {
		return nil, "", err
	}

	questions, err := s.questionRepo.GetQuestionsByFormID(ctx, formID)
	if err != nil {
		return nil, "", err
	}

	var buf bytes.Buffer
	writer := csv.NewWriter(&buf)

	// Headers
	headers := []string{"No", "Respondent Email", "Total Score", "Submitted At"}
	for _, q := range questions {
		headers = append(headers, q.QuestionText)
	}
	_ = writer.Write(headers)

	for rowIdx, resp := range responses {
		scoreStr := "0.0"
		if resp.TotalScore != nil {
			scoreStr = strconv.FormatFloat(*resp.TotalScore, 'f', 2, 64)
		}
		row := []string{
			strconv.Itoa(rowIdx + 1),
			resp.RespondentEmail,
			scoreStr,
			resp.SubmittedAt.Format(time.RFC3339),
		}

		answerMap := make(map[uuid.UUID]string)
		for _, a := range resp.Answers {
			if a.SelectedOption != nil {
				answerMap[a.QuestionID] = a.SelectedOption.OptionText
			} else {
				answerMap[a.QuestionID] = a.AnswerText
			}
		}

		for _, q := range questions {
			row = append(row, answerMap[q.ID])
		}

		_ = writer.Write(row)
	}

	writer.Flush()
	filename := fmt.Sprintf("%s_responses_%s.csv", form.CustomURL, time.Now().Format("20060102_150405"))
	return buf.Bytes(), filename, nil
}
