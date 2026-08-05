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
		Title:       "Dokumen Soal Import Docx",
		Description: "Form ujian diimport secara otomatis dari dokumen Word",
		Questions:   []domain.Question{},
	}

	if len(lines) == 0 {
		return extracted, nil
	}

	qNumRegex := regexp.MustCompile(`(?i)^(?:(?:Soal|Question|Q)\s*#?\s*\d+[\.\):]?|\d+[\.\)]|\(\d+\)|\[\d+\])\s*(.*)`)
	optionRegex := regexp.MustCompile(`(?i)^(\*?\s*)(?:[\(\[]?([A-Ea-e])[\.\)\]]|\b([A-Ea-e])[\.\)])\s*(.+)`)
	answerKeyRegex := regexp.MustCompile(`(?i)^(?:Kunci\s*Jawaban|Kunci|Jawaban|Answer|Key)\s*[:=]?\s*[\(\[]?([A-Ea-e])[\.\)\]]?`)
	separatorRegex := regexp.MustCompile(`^[\_\-\*\=\#\s]{3,}$`)

	startIndex := 0

	// Check if document starts directly with a question
	firstIsQuestion := qNumRegex.MatchString(lines[0]) || optionRegex.MatchString(lines[0])

	if !firstIsQuestion {
		extracted.Title = lines[0]
		startIndex = 1
		if len(lines) > 1 && !qNumRegex.MatchString(lines[1]) && !optionRegex.MatchString(lines[1]) {
			extracted.Description = lines[1]
			startIndex = 2
		}
	}

	var currentQuestion *domain.Question
	var currentOptions []domain.QuestionOption
	var pendingCorrectLetter string
	orderIdx := 1

	for i := startIndex; i < len(lines); i++ {
		line := strings.TrimSpace(lines[i])
		if line == "" {
			continue
		}

		// Skip separator / divider lines
		if separatorRegex.MatchString(line) {
			continue
		}

		// 1. Check if it's a question number line
		if match := qNumRegex.FindStringSubmatch(line); len(match) > 0 {
			if currentQuestion != nil {
				currentQuestion.Options = currentOptions
				extracted.Questions = append(extracted.Questions, *currentQuestion)
			}

			qText := strings.TrimSpace(match[1])
			qID := uuid.New()
			currentQuestion = &domain.Question{
				ID:           qID,
				FormID:       formID,
				QuestionText: qText,
				QuestionType: domain.TypeMultipleChoice,
				IsAutoScored: true,
				Points:       10,
				OrderIndex:   orderIdx,
				IsRequired:   true,
			}
			orderIdx++
			currentOptions = []domain.QuestionOption{}
			pendingCorrectLetter = ""
			continue
		}

		// 2. Check if it's an Answer Key line (e.g. Kunci Jawaban: B)
		if match := answerKeyRegex.FindStringSubmatch(line); len(match) > 1 && currentQuestion != nil {
			correctLetter := strings.ToUpper(strings.TrimSpace(match[1]))
			pendingCorrectLetter = correctLetter

			// Apply correct status to already parsed option if available
			letterIdx := int(correctLetter[0] - 'A')
			if letterIdx >= 0 && letterIdx < len(currentOptions) {
				currentOptions[letterIdx].IsCorrect = true
			} else {
				for idx := range currentOptions {
					optL := strings.TrimPrefix(currentOptions[idx].OptionText, "(")
					if strings.HasPrefix(strings.ToUpper(optL), correctLetter) {
						currentOptions[idx].IsCorrect = true
					}
				}
			}
			continue
		}

		// 3. Check if it's an Option line (e.g. (a) text, A. text, *A. text)
		if match := optionRegex.FindStringSubmatch(line); len(match) > 0 && currentQuestion != nil {
			prefixAsterisk := match[1]
			optLetter := match[2]
			if optLetter == "" {
				optLetter = match[3]
			}
			optText := strings.TrimSpace(match[4])

			lowerLine := strings.ToLower(line)
			isCorrect := strings.Contains(prefixAsterisk, "*") ||
				strings.Contains(lowerLine, "[correct]") ||
				strings.Contains(lowerLine, "(correct)") ||
				strings.Contains(lowerLine, "(v)") ||
				strings.Contains(lowerLine, "(benar)") ||
				strings.Contains(lowerLine, "[benar]")

			if pendingCorrectLetter != "" && strings.ToUpper(optLetter) == pendingCorrectLetter {
				isCorrect = true
			}

			// Clean option text from markers
			optText = strings.ReplaceAll(optText, "[correct]", "")
			optText = strings.ReplaceAll(optText, "(correct)", "")
			optText = strings.ReplaceAll(optText, "(v)", "")
			optText = strings.ReplaceAll(optText, "(benar)", "")
			optText = strings.ReplaceAll(optText, "[benar]", "")
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

		// 4. Multi-line body text for question or option
		if currentQuestion != nil {
			if len(currentOptions) == 0 {
				if currentQuestion.QuestionText != "" {
					currentQuestion.QuestionText += "\n" + line
				} else {
					currentQuestion.QuestionText = line
				}
			} else {
				// Append line to the last option if options already started
				lastIdx := len(currentOptions) - 1
				currentOptions[lastIdx].OptionText += " " + line
			}
		}
	}

	if currentQuestion != nil {
		currentQuestion.Options = currentOptions
		extracted.Questions = append(extracted.Questions, *currentQuestion)
	}

	return extracted, nil
}
