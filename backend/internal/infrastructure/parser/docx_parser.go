package parser

import (
	"archive/zip"
	"bytes"
	"encoding/xml"
	"fmt"
	"io"
	"regexp"
	"strings"

	"backend/internal/domain"
	"github.com/google/uuid"
)

type ExtractedForm struct {
	Title       string
	Description string
	Questions   []domain.Question
}

type DocxParser struct{}

func NewDocxParser() *DocxParser {
	return &DocxParser{}
}

// XML structures for word/document.xml parsing
type documentXML struct {
	XMLName xml.Name `xml:"document"`
	Body    bodyXML  `xml:"body"`
}

type bodyXML struct {
	Paragraphs []paragraphXML `xml:"p"`
}

type paragraphXML struct {
	Runs []runXML `xml:"r"`
}

type runXML struct {
	Text string `xml:"t"`
}

func (p *DocxParser) ParseDocx(fileBytes []byte, formID uuid.UUID) (*ExtractedForm, error) {
	reader, err := zip.NewReader(bytes.NewReader(fileBytes), int64(len(fileBytes)))
	if err != nil {
		return nil, fmt.Errorf("failed to open docx as zip archive: %w", err)
	}

	var documentFile *zip.File
	for _, f := range reader.File {
		if f.Name == "word/document.xml" {
			documentFile = f
			break
		}
	}

	if documentFile == nil {
		return nil, fmt.Errorf("invalid docx file: missing word/document.xml")
	}

	rc, err := documentFile.Open()
	if err != nil {
		return nil, fmt.Errorf("failed to open document.xml: %w", err)
	}
	defer rc.Close()

	xmlData, err := io.ReadAll(rc)
	if err != nil {
		return nil, fmt.Errorf("failed to read document.xml: %w", err)
	}

	var doc documentXML
	if err := xml.Unmarshal(xmlData, &doc); err != nil {
		return nil, fmt.Errorf("failed to parse document.xml: %w", err)
	}

	var lines []string
	for _, p := range doc.Body.Paragraphs {
		var textBuilder strings.Builder
		for _, r := range p.Runs {
			textBuilder.WriteString(r.Text)
		}
		line := strings.TrimSpace(textBuilder.String())
		if line != "" {
			lines = append(lines, line)
		}
	}

	return parseLinesToForm(lines, formID)
}

func parseLinesToForm(lines []string, formID uuid.UUID) (*ExtractedForm, error) {
	extracted := &ExtractedForm{
		Title:       "Imported Form from Docx",
		Description: "Form generated automatically from Word document",
		Questions:   []domain.Question{},
	}

	if len(lines) == 0 {
		return extracted, nil
	}

	// First line can be form title if not starting with a question pattern
	qNumRegex := regexp.MustCompile(`^(?:Soal\s*\d+|\d+[\.\)]|Q\d+[\.\):])\s*(.+)`)
	optionRegex := regexp.MustCompile(`^(?:\*?\s*)([A-Ea-e])[\.\)]\s*(.+)`)

	var currentQuestion *domain.Question
	var currentOptions []domain.QuestionOption
	orderIdx := 1

	for i, line := range lines {
		if i == 0 && !qNumRegex.MatchString(line) {
			extracted.Title = line
			continue
		}
		if i == 1 && extracted.Description == "Form generated automatically from Word document" && !qNumRegex.MatchString(line) && !optionRegex.MatchString(line) {
			extracted.Description = line
			continue
		}

		// Check if it's a question line
		if match := qNumRegex.FindStringSubmatch(line); len(match) > 0 {
			// Save previous question if exists
			if currentQuestion != nil {
				currentQuestion.Options = currentOptions
				extracted.Questions = append(extracted.Questions, *currentQuestion)
			}

			qText := strings.TrimSpace(match[1])
			if qText == "" {
				qText = line
			}

			qID := uuid.New()
			currentQuestion = &domain.Question{
				ID:           qID,
				FormID:       formID,
				QuestionText: qText,
				QuestionType: domain.TypeMultipleChoice,
				Points:       10,
				OrderIndex:   orderIdx,
				IsRequired:   true,
			}
			orderIdx++
			currentOptions = []domain.QuestionOption{}
			continue
		}

		// Check if it's an option line (A., B., C., D. or *A.)
		if match := optionRegex.FindStringSubmatch(line); len(match) > 1 && currentQuestion != nil {
			isCorrect := strings.HasPrefix(strings.TrimSpace(line), "*") || strings.Contains(line, "[correct]") || strings.Contains(line, "(correct)") || strings.Contains(line, "(v)")
			optText := strings.TrimSpace(match[2])
			optText = strings.ReplaceAll(optText, "[correct]", "")
			optText = strings.ReplaceAll(optText, "(correct)", "")
			optText = strings.TrimSpace(optText)

			currentOptions = append(currentOptions, domain.QuestionOption{
				ID:         uuid.New(),
				QuestionID: currentQuestion.ID,
				OptionText: optText,
				IsCorrect:  isCorrect,
				OrderIndex: len(currentOptions) + 1,
			})
			continue
		}

		// If no question current, or plain text under question, append to question text
		if currentQuestion != nil && len(currentOptions) == 0 {
			currentQuestion.QuestionText += "\n" + line
		}
	}

	if currentQuestion != nil {
		currentQuestion.Options = currentOptions
		extracted.Questions = append(extracted.Questions, *currentQuestion)
	}

	return extracted, nil
}
