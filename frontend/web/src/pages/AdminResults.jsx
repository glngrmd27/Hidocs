import {
  useContext,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  FaArrowDown,
  FaArrowLeft,
  FaCalendarAlt,
  FaChartBar,
  FaChartLine,
  FaCheck,
  FaCheckCircle,
  FaChevronDown,
  FaClock,
  FaDownload,
  FaEye,
  FaFileExcel,
  FaFilePdf,
  FaQuestionCircle,
  FaSearch,
  FaSave,
  FaSortAmountDown,
  FaTimes,
  FaTrophy,
  FaUser,
  FaUsers,
  FaWpforms,
} from "react-icons/fa";
import {
  ThemeContext,
} from "../context/ThemeContext";
import {
  FormContext,
} from "../context/FormContext";
import "../assets/css/AdminResults.css";
import "../assets/css/AdminResultsManualGrading.css";
// =========================================================
// STORAGE KEYS
// =========================================================
const FORMS_STORAGE_KEY =
  "hidocs_forms";
const DELETED_FORMS_STORAGE_KEY =
  "hidocs_deleted_forms";
// =========================================================
// DEFAULT FORMS
// =========================================================
const defaultForms = [
  {
    id: 1,
    title: "Survey Kepuasan Mahasiswa 2024",
    description: "Overview of respondent performance and form analytics.",
    type: "Survey",
    responses: 0,
    questions: [
      {
        id: "survey-1",
        title: "Bagaimana pendapat Anda mengenai fasilitas kampus?",
        type: "multiple",
        options: [
          "Sangat Baik",
          "Baik",
          "Cukup",
          "Kurang",
        ],
      },
      {
        id: "survey-2",
        title: "Apakah pelayanan administrasi sudah memuaskan?",
        type: "multiple",
        options: [
          "Sangat Puas",
          "Puas",
          "Kurang Puas",
          "Tidak Puas",
        ],
      },
    ],
  },
  {
    id: 2,
    title: "Quiz Pemrograman Mobile - Flutter",
    description: "Overview of quiz responses and respondent performance.",
    type: "Quiz",
    responses: 0,
    questions: [
      {
        id: "flutter-1",
        title: "Widget apakah yang digunakan untuk membuat layout vertikal di Flutter?",
        type: "multiple",
        options: [
          "Row",
          "Column",
          "Stack",
          "ListView",
        ],
      },
      {
        id: "flutter-2",
        title: "Perhatikan gambar berikut kemudian pilih jawaban yang benar.",
        type: "multiple",
        options: [
          "Jawaban A",
          "Jawaban B",
          "Jawaban C",
          "Jawaban D",
        ],
      },
      {
        id: "flutter-3",
        title: "Apa fungsi utama dari Scaffold pada Flutter?",
        type: "multiple",
        options: [
          "Widget Layout",
          "Database",
          "State Management",
          "API",
        ],
      },
    ],
  },
  {
    id: 3,
    title: "Form Pendaftaran Event Hackathon",
    description: "Overview of registration responses and participant activity.",
    type: "Registration",
    responses: 0,
    questions: [
      {
        id: "hackathon-1",
        title: "Apakah Anda bersedia mengikuti seluruh rangkaian acara?",
        type: "yesno",
        options: [
          "Ya",
          "Tidak",
        ],
      },
    ],
  },
];
// =========================================================
// SAFE STORAGE READER
// =========================================================
const getStoredArray = (
  key
) => {
  try {
    const storedValue =
      localStorage.getItem(
        key
      );
    if (!storedValue) {
      return [];
    }
    const parsedValue =
      JSON.parse(
        storedValue
      );
    return Array.isArray(
      parsedValue
    )
      ? parsedValue
      : [];
  } catch (error) {
    console.error(
      `Gagal membaca ${key}:`,
      error
    );
    return [];
  }
};
// =========================================================
// NORMALIZE FORM
// =========================================================
const normalizeForm = (
  form
) => {
  const questions =
    Array.isArray(
      form.questions
    )
      ? form.questions
      : [];
  return {
    ...form,
    id:
      form.id,
    title:
      String(
        form.title ||
        ""
      ).trim() ||
      "Untitled Form",
    description:
      String(
        form.description ||
        ""
      ).trim() ||
      "Overview of respondent activity and submitted answers.",
    type:
      form.type ||
      form.category ||
      "Form",
    responses:
      Number(
        form.responses
      ) || 0,
    questions,
  };
};
// =========================================================
// HAS ANSWER
// =========================================================
const hasAnswer = (
  value
) => {
  if (
    Array.isArray(
      value
    )
  ) {
    return (
      value.length >
      0
    );
  }
  if (
    typeof value ===
    "string"
  ) {
    return (
      value.trim().length >
      0
    );
  }
  return (
    value !==
      undefined &&
    value !==
      null &&
    value !==
      ""
  );
};
// =========================================================
// NORMALIZE ANSWER
// =========================================================
const normalizeAnswer = (
  value
) => {
  if (
    Array.isArray(
      value
    )
  ) {
    return value.join(
      ", "
    );
  }
  if (
    value ===
      undefined ||
    value ===
      null ||
    value ===
      ""
  ) {
    return "-";
  }
  if (
    typeof value ===
    "object"
  ) {
    try {
      return JSON.stringify(
        value
      );
    } catch {
      return String(
        value
      );
    }
  }
  return String(
    value
  );
};
// =========================================================
// NORMALIZE COMPARISON
// =========================================================
const normalizeComparableAnswer = (
  value
) => {
  return normalizeAnswer(
    value
  )
    .trim()
    .toLowerCase();
};
// =========================================================
// GET CORRECT ANSWER
// =========================================================
const getCorrectAnswer = (
  question
) => {
  if (!question) {
    return "";
  }
  const directAnswer =
    question.correctAnswer ??
    question.correctOption ??
    question.answer ??
    question.correctValue ??
    question.expectedAnswer;
  if (
    directAnswer !==
      undefined &&
    directAnswer !==
      null &&
    directAnswer !==
      ""
  ) {
    return directAnswer;
  }
  if (
    Array.isArray(
      question.options
    )
  ) {
    const correctOption =
      question.options.find(
        (
          option
        ) => {
          return (
            option &&
            typeof option ===
              "object" &&
            (
              option.correct ===
                true ||
              option.isCorrect ===
                true
            )
          );
        }
      );
    if (
      correctOption
    ) {
      return (
        correctOption.value ??
        correctOption.label ??
        correctOption.text ??
        ""
      );
    }
  }
  return "";
};
// =========================================================
// FORMAT DATE
// =========================================================
const formatSubmittedDate = (
  value
) => {
  if (!value) {
    return "-";
  }
  const date =
    new Date(
      value
    );
  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(
      value
    );
  }
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    }
  ).format(
    date
  );
};
// =========================================================
// FORMAT TIME
// =========================================================
const formatSubmittedTime = (
  value
) => {
  if (!value) {
    return "-";
  }
  const date =
    new Date(
      value
    );
  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "-";
  }
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      hour: "2-digit",
      minute: "2-digit",
    }
  ).format(
    date
  );
};
// =========================================================
// DATE VALUE
// =========================================================
const getDateValue = (
  value
) => {
  const date =
    new Date(
      value
    );
  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return 0;
  }
  return date.getTime();
};
// =========================================================
// CSV
// =========================================================
const escapeCsvValue = (
  value
) => {
  const stringValue =
    String(
      value ??
      ""
    );
  return `"${stringValue.replace(
    /"/g,
    '""'
  )}"`;
};
// =========================================================
// CLEAN WYSIWYG HTML FOR EXPORT
// =========================================================
const stripHtmlToText = (
  value
) => {
  const stringValue =
    String(
      value ??
      ""
    );
  if (!stringValue) {
    return "";
  }
  try {
    const parser =
      new DOMParser();
    const documentValue =
      parser.parseFromString(
        stringValue,
        "text/html"
      );
    return String(
      documentValue.body.textContent ||
      ""
    )
      .replace(
        /\u00a0/g,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  } catch {
    return stringValue
      .replace(
        /<[^>]*>/g,
        " "
      )
      .replace(
        /&nbsp;/gi,
        " "
      )
      .replace(
        /\s+/g,
        " "
      )
      .trim();
  }
};
// =========================================================
// ESCAPE HTML FOR EXCEL EXPORT
// =========================================================
const escapeHtml = (
  value
) => {
  return String(
    value ??
    ""
  )
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&#039;"
    );
};
// =========================================================
// ADMIN RESULTS
// =========================================================
function AdminResults() {
  const navigate =
    useNavigate();
  const {
    id,
  } = useParams();
  const {
    darkMode,
  } = useContext(
    ThemeContext
  );
  const {
    allSubmissions = [],
    updateSubmissionGrading,
  } = useContext(
    FormContext
  );
  // =========================================================
  // STATE
  // =========================================================
  const [
    search,
    setSearch,
  ] = useState("");
  const [
    sortOrder,
    setSortOrder,
  ] = useState(
    "newest"
  );
  const [
    showExportMenu,
    setShowExportMenu,
  ] = useState(
    false
  );
  const [
    exportStatus,
    setExportStatus,
  ] = useState("");
  const [
    selectedRespondent,
    setSelectedRespondent,
  ] = useState(null);
  const [
    manualGrades,
    setManualGrades,
  ] = useState({});
  const [
    gradingSaving,
    setGradingSaving,
  ] = useState(false);
  // =========================================================
  // LOAD FORM
  // =========================================================
  const form =
    useMemo(
      () => {
        const savedForms =
          getStoredArray(
            FORMS_STORAGE_KEY
          );
        const deletedFormIds =
          getStoredArray(
            DELETED_FORMS_STORAGE_KEY
          ).map(
            (
              deletedId
            ) =>
              String(
                deletedId
              )
          );
        if (
          deletedFormIds.includes(
            String(
              id
            )
          )
        ) {
          return null;
        }
        const allForms = [
          ...defaultForms,
          ...savedForms,
        ];
        const selectedForm =
          [...allForms]
            .reverse()
            .find(
              (
                item
              ) =>
                String(
                  item.id
                ) ===
                String(
                  id
                )
            );
        return selectedForm
          ? normalizeForm(
              selectedForm
            )
          : null;
      },
      [
        id,
      ]
    );
  // =========================================================
  // SUBMISSIONS
  // =========================================================
  const formSubmissions =
    useMemo(
      () => {
        return allSubmissions.filter(
          (
            submission
          ) => {
            const formId =
              submission.formId ??
              submission.id;
            return (
              String(
                formId
              ) ===
              String(
                id
              )
            );
          }
        );
      },
      [
        allSubmissions,
        id,
      ]
    );
  // =========================================================
  // BUILD QUESTION RESULTS
  // ADMIN ALWAYS HAS FULL ACCESS
  // =========================================================
  const buildQuestionResults = (
    submission
  ) => {
    const questions =
      Array.isArray(
        form?.questions
      )
        ? form.questions
        : [];
    const answers =
      submission?.answers &&
      typeof submission.answers ===
        "object"
        ? submission.answers
        : {};
    return questions.map(
      (
        question,
        index
      ) => {
        const questionId =
          question.id ??
          `question-${index + 1}`;
        const userAnswer =
          answers[
            questionId
          ];
        const storedResult =
          Array.isArray(
            submission?.questionResults
          )
            ? submission.questionResults.find(
                (
                  result
                ) => {
                  return (
                    String(
                      result.questionId ??
                      result.id
                    ) ===
                    String(
                      questionId
                    )
                  );
                }
              )
            : null;
        const correctAnswer =
          storedResult?.correctAnswer ??
          getCorrectAnswer(
            question
          );
        const hasCorrectAnswer =
          hasAnswer(
            correctAnswer
          );
        let isCorrect =
          null;
        if (
          typeof storedResult?.isCorrect ===
          "boolean"
        ) {
          isCorrect =
            storedResult.isCorrect;
        } else if (
          hasCorrectAnswer &&
          hasAnswer(
            userAnswer
          )
        ) {
          isCorrect =
            normalizeComparableAnswer(
              userAnswer
            ) ===
            normalizeComparableAnswer(
              correctAnswer
            );
        }
        const isAutoGraded =
          question.scoring === true ||
          hasCorrectAnswer;
        const manuallyGraded =
          !isAutoGraded &&
          storedResult?.manuallyGraded === true;
        const scoringEnabled =
          isAutoGraded ||
          manuallyGraded;
        const maxPoints =
          isAutoGraded
            ? Math.max(
                Number(
                  storedResult?.maxPoints ??
                  storedResult?.points ??
                  question.points
                ) || 1,
                0
              )
            : manuallyGraded
              ? Math.max(
                  Number(
                    storedResult?.manualMaxPoints ??
                    storedResult?.points
                  ) || 0,
                  0
                )
              : 0;
        const earnedPoints =
          isAutoGraded
            ? (
                storedResult?.earnedPoints !== undefined
                  ? Number(storedResult.earnedPoints) || 0
                  : isCorrect === true
                    ? maxPoints
                    : 0
              )
            : manuallyGraded
              ? Number(
                  storedResult?.manualEarnedPoints ??
                  storedResult?.earnedPoints
                ) || 0
              : 0;
        return {
          questionId,
          number:
            index +
            1,
          question,
          userAnswer,
          correctAnswer,
          hasCorrectAnswer,
          isCorrect,
          scoringEnabled,
          isAutoGraded,
          manuallyGraded,
          gradingStatus:
            isAutoGraded
              ? "auto"
              : manuallyGraded
                ? "graded"
                : "pending",
          maxPoints,
          earnedPoints,
        };
      }
    );
  };
  // =========================================================
  // RESPONDENTS
  // =========================================================
  const respondents =
    useMemo(
      () => {
        return formSubmissions.map(
          (
            submission,
            index
          ) => {
            const respondentName =
              String(
                submission.respondentName ||
                submission.username ||
                submission.user?.username ||
                submission.user?.name ||
                `Respondent ${index + 1}`
              ).trim();
            const respondentEmail =
              String(
                submission.respondentEmail ||
                submission.email ||
                submission.user?.email ||
                ""
              ).trim();
            const questionResults =
              buildQuestionResults(
                submission
              );
            const calculatedScore =
              questionResults.reduce(
                (
                  total,
                  item
                ) => {
                  return (
                    total +
                    (
                      item.scoringEnabled
                        ? item.earnedPoints
                        : 0
                    )
                  );
                },
                0
              );
            const calculatedMaxScore =
              questionResults.reduce(
                (
                  total,
                  item
                ) => {
                  return (
                    total +
                    (
                      item.scoringEnabled
                        ? item.maxPoints
                        : 0
                    )
                  );
                },
                0
              );
            const storedScore =
              Number(
                submission.score
              );
            const storedMaxScore =
              Number(
                submission.maxScore
              );
            const score =
              Number.isFinite(
                storedScore
              )
                ? storedScore
                : calculatedScore;
            const maxScore =
              Number.isFinite(
                storedMaxScore
              ) &&
              storedMaxScore >
                0
                ? storedMaxScore
                : calculatedMaxScore;
            const scoreItems =
              questionResults.filter(
                (
                  item
                ) =>
                  item.scoringEnabled ||
                  item.isCorrect !==
                    null
              );
            const correctCount =
              scoreItems.filter(
                (
                  item
                ) =>
                  item.isCorrect ===
                  true
              ).length;
            const incorrectCount =
              scoreItems.filter(
                (
                  item
                ) =>
                  item.isCorrect ===
                  false
              ).length;
            const gradedQuestions =
              questionResults.filter(
                (item) =>
                  item.isAutoGraded ||
                  item.manuallyGraded
              ).length;
            const ungradedQuestions =
              questionResults.filter(
                (item) =>
                  !item.isAutoGraded &&
                  !item.manuallyGraded
              ).length;
            let percentage =
              Number(
                submission.percentage
              );
            if (
              !Number.isFinite(
                percentage
              )
            ) {
              percentage =
                maxScore >
                  0
                  ? Math.round(
                      (
                        score /
                        maxScore
                      ) *
                      100
                    )
                  : null;
            }
            return {
              id:
                submission.submissionId ||
                `${submission.formId || submission.id}-${index}-${submission.submittedAt || "submission"}`,
              submission,
              name:
                respondentName ||
                `Respondent ${index + 1}`,
              email:
                respondentEmail,
              initial:
                respondentName
                  .charAt(
                    0
                  )
                  .toUpperCase() ||
                "U",
              score,
              maxScore,
              percentage,
              correctCount,
              incorrectCount,
              gradedQuestions,
              ungradedQuestions,
              gradingComplete:
                ungradedQuestions === 0,
              questionResults,
              date:
                formatSubmittedDate(
                  submission.submittedAt
                ),
              time:
                formatSubmittedTime(
                  submission.submittedAt
                ),
              submittedAt:
                submission.submittedAt ||
                "",
              duration:
                submission.duration ||
                "-",
              status:
                submission.status ||
                "Completed",
              answers:
                submission.answers &&
                typeof submission.answers ===
                  "object"
                  ? submission.answers
                  : {},
              answeredQuestions:
                Number(
                  submission.answeredQuestions
                ) ||
                Object.values(
                  submission.answers ||
                  {}
                ).filter(
                  hasAnswer
                ).length,
              totalQuestions:
                Number(
                  submission.totalQuestions
                ) ||
                (
                  Array.isArray(
                    form?.questions
                  )
                    ? form.questions.length
                    : 0
                ),
            };
          }
        );
      },
      [
        formSubmissions,
        form,
      ]
    );
  // =========================================================
  // SCORED RESPONDENTS
  // =========================================================
  const scoredRespondents =
    useMemo(
      () => {
        return respondents.filter(
          (
            respondent
          ) =>
            Number.isFinite(
              respondent.percentage
            )
        );
      },
      [
        respondents,
      ]
    );
  // =========================================================
  // AVERAGE
  // =========================================================
  const averageScore =
    useMemo(
      () => {
        if (
          scoredRespondents.length ===
          0
        ) {
          return null;
        }
        const total =
          scoredRespondents.reduce(
            (
              sum,
              respondent
            ) =>
              sum +
              respondent.percentage,
            0
          );
        return Math.round(
          total /
          scoredRespondents.length
        );
      },
      [
        scoredRespondents,
      ]
    );
  // =========================================================
  // HIGHEST
  // =========================================================
  const highestScore =
    useMemo(
      () => {
        if (
          scoredRespondents.length ===
          0
        ) {
          return null;
        }
        return Math.max(
          ...scoredRespondents.map(
            (
              respondent
            ) =>
              respondent.percentage
          )
        );
      },
      [
        scoredRespondents,
      ]
    );
  // =========================================================
  // LOWEST
  // =========================================================
  const lowestScore =
    useMemo(
      () => {
        if (
          scoredRespondents.length ===
          0
        ) {
          return null;
        }
        return Math.min(
          ...scoredRespondents.map(
            (
              respondent
            ) =>
              respondent.percentage
          )
        );
      },
      [
        scoredRespondents,
      ]
    );
  // =========================================================
  // SCORE DISTRIBUTION
  // =========================================================
  const distribution =
    useMemo(
      () => {
        const groups = [
          {
            label: "90–100%",
            description: "Excellent",
            minimum: 90,
            maximum: 100,
            color: "green",
          },
          {
            label: "75–89%",
            description: "Good",
            minimum: 75,
            maximum: 89,
            color: "blue",
          },
          {
            label: "60–74%",
            description: "Fair",
            minimum: 60,
            maximum: 74,
            color: "orange",
          },
          {
            label: "< 60%",
            description: "Needs improvement",
            minimum: 0,
            maximum: 59,
            color: "gray",
          },
        ];
        return groups.map(
          (
            group
          ) => {
            const count =
              scoredRespondents.filter(
                (
                  respondent
                ) => {
                  return (
                    respondent.percentage >=
                      group.minimum &&
                    respondent.percentage <=
                      group.maximum
                  );
                }
              ).length;
            const value =
              scoredRespondents.length >
                0
                ? Math.round(
                    (
                      count /
                      scoredRespondents.length
                    ) *
                    100
                  )
                : 0;
            return {
              ...group,
              count,
              value,
            };
          }
        );
      },
      [
        scoredRespondents,
      ]
    );
  // =========================================================
  // TOTAL RESPONSES
  // =========================================================
  const totalResponses =
    respondents.length;
  // =========================================================
  // SCORE CLASS
  // =========================================================
  const getScoreClass = (
    score
  ) => {
    if (
      !Number.isFinite(
        score
      )
    ) {
      return "score-empty";
    }
    if (
      score >=
      90
    ) {
      return "score-high";
    }
    if (
      score >=
      75
    ) {
      return "score-medium";
    }
    return "score-low";
  };
  // =========================================================
  // FILTER + SORT
  // =========================================================
  const filteredRespondents =
    useMemo(
      () => {
        const keyword =
          search
            .trim()
            .toLowerCase();
        const filtered =
          respondents.filter(
            (
              respondent
            ) => {
              return (
                respondent.name
                  .toLowerCase()
                  .includes(
                    keyword
                  ) ||
                respondent.email
                  .toLowerCase()
                  .includes(
                    keyword
                  )
              );
            }
          );
        return [
          ...filtered,
        ].sort(
          (
            first,
            second
          ) => {
            if (
              sortOrder ===
              "highest"
            ) {
              return (
                (
                  second.percentage ??
                  -1
                ) -
                (
                  first.percentage ??
                  -1
                )
              );
            }
            if (
              sortOrder ===
              "lowest"
            ) {
              return (
                (
                  first.percentage ??
                  Number.MAX_SAFE_INTEGER
                ) -
                (
                  second.percentage ??
                  Number.MAX_SAFE_INTEGER
                )
              );
            }
            if (
              sortOrder ===
              "name"
            ) {
              return first.name.localeCompare(
                second.name
              );
            }
            if (
              sortOrder ===
              "oldest"
            ) {
              return (
                getDateValue(
                  first.submittedAt
                ) -
                getDateValue(
                  second.submittedAt
                )
              );
            }
            return (
              getDateValue(
                second.submittedAt
              ) -
              getDateValue(
                first.submittedAt
              )
            );
          }
        );
      },
      [
        respondents,
        search,
        sortOrder,
      ]
    );
  // =========================================================
  // VIEW ANSWERS
  // =========================================================
  const openRespondentAnswers = (
    respondent
  ) => {
    const initialGrades = {};
    respondent.questionResults.forEach((item) => {
      if (!item.isAutoGraded) {
        initialGrades[String(item.questionId)] = {
          earnedPoints: item.manuallyGraded
            ? Number(item.earnedPoints) || 0
            : "",
          maxPoints: item.manuallyGraded
            ? Number(item.maxPoints) || 0
            : "",
          graded: item.manuallyGraded === true,
        };
      }
    });
    setManualGrades(initialGrades);
    setSelectedRespondent(respondent);
    document.body.style.overflow =
      "hidden";
  };
  // =========================================================
  // MANUAL GRADE INPUT
  // =========================================================
  const updateManualGradeField = (questionId, field, value) => {
    setManualGrades((previous) => ({
      ...previous,
      [String(questionId)]: {
        ...(previous[String(questionId)] || {}),
        [field]: value,
      },
    }));
  };
  const saveManualGrades = () => {
    if (!selectedRespondent) return;
    const gradesToSave = {};
    for (const item of selectedRespondent.questionResults) {
      if (item.isAutoGraded) continue;
      const draft = manualGrades[String(item.questionId)] || {};
      const earnedRaw = draft.earnedPoints;
      const maxRaw = draft.maxPoints;
      const untouched =
        earnedRaw === "" &&
        maxRaw === "" &&
        draft.graded !== true;
      if (untouched) continue;
      const earned = Number(earnedRaw);
      const max = Number(maxRaw);
      if (!Number.isFinite(max) || max <= 0) {
        alert(`Isi nilai maksimal untuk soal nomor ${item.number}.`);
        return;
      }
      if (!Number.isFinite(earned) || earned < 0 || earned > max) {
        alert(`Nilai soal nomor ${item.number} harus antara 0 sampai ${max}.`);
        return;
      }
      gradesToSave[String(item.questionId)] = {
        earnedPoints: earned,
        maxPoints: max,
        graded: true,
      };
    }
    if (Object.keys(gradesToSave).length === 0) {
      alert("Belum ada nilai manual yang diisi.");
      return;
    }
    if (typeof updateSubmissionGrading !== "function") {
      alert("Fungsi penyimpanan nilai belum tersedia. Pastikan FormContext sudah diperbarui.");
      return;
    }
    setGradingSaving(true);
    try {
      updateSubmissionGrading(
        selectedRespondent.id,
        gradesToSave
      );
      alert("Nilai manual berhasil disimpan dan total nilai telah diperbarui.");
      closeRespondentAnswers();
    } catch (error) {
      console.error("Gagal menyimpan nilai manual:", error);
      alert("Nilai manual gagal disimpan.");
    } finally {
      setGradingSaving(false);
    }
  };
  // =========================================================
  // CLOSE ANSWERS
  // =========================================================
  const closeRespondentAnswers =
    () => {
      setSelectedRespondent(
        null
      );
      document.body.style.overflow =
        "";
  };
  // =========================================================
  // EXPORT EXCEL
  // Creates a real table layout that opens directly in
  // Microsoft Excel / WPS Spreadsheet without all values
  // being placed in column A.
  // =========================================================
  const exportExcel =
    () => {
      setShowExportMenu(
        false
      );
      if (
        respondents.length ===
        0
      ) {
        alert(
          "No responses are available to export."
        );
        return;
      }
      const questionList =
        Array.isArray(
          form?.questions
        )
          ? form.questions
          : [];
      const getQuestionTitle =
        (
          question,
          index
        ) => {
          const rawTitle =
            question?.title ||
            question?.question ||
            `Question ${index + 1}`;
          const cleanTitle =
            stripHtmlToText(
              rawTitle
            );
          return (
            cleanTitle ||
            `Question ${index + 1}`
          );
        };
      const getGradingStatus =
        (
          respondent
        ) => {
          const graded =
            Number(
              respondent.gradedQuestions
            ) || 0;
          const ungraded =
            Number(
              respondent.ungradedQuestions
            ) || 0;
          if (
            ungraded >
              0 &&
            graded ===
              0
          ) {
            return "Not Graded";
          }
          if (
            ungraded >
            0
          ) {
            return "Partially Graded";
          }
          return "Graded";
        };
      const exportRows =
        respondents.map(
          (
            respondent,
            index
          ) => {
            const questionResults =
              Array.isArray(
                respondent.questionResults
              )
                ? respondent.questionResults
                : [];
            const autoResults =
              questionResults.filter(
                (
                  item
                ) =>
                  item.isAutoGraded ===
                  true
              );
            const manualResults =
              questionResults.filter(
                (
                  item
                ) =>
                  item.isAutoGraded !==
                    true &&
                  item.manuallyGraded ===
                    true
              );
            const autoEarned =
              autoResults.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  (
                    Number(
                      item.earnedPoints
                    ) || 0
                  ),
                0
              );
            const autoMax =
              autoResults.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  (
                    Number(
                      item.maxPoints
                    ) || 0
                  ),
                0
              );
            const manualEarned =
              manualResults.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  (
                    Number(
                      item.earnedPoints
                    ) || 0
                  ),
                0
              );
            const manualMax =
              manualResults.reduce(
                (
                  total,
                  item
                ) =>
                  total +
                  (
                    Number(
                      item.maxPoints
                    ) || 0
                  ),
                0
              );
            const gradingStatus =
              getGradingStatus(
                respondent
              );
            const totalScore =
              gradingStatus ===
                "Not Graded"
                ? "Not Graded"
                : (
                    respondent.maxScore >
                    0
                      ? `${respondent.score}/${respondent.maxScore}`
                      : "Not Graded"
                  );
            const percentage =
              gradingStatus ===
                "Not Graded"
                ? "Not Graded"
                : (
                    Number.isFinite(
                      respondent.percentage
                    )
                      ? (
                          gradingStatus ===
                            "Partially Graded"
                            ? `${respondent.percentage}% (Partial)`
                            : `${respondent.percentage}%`
                        )
                      : "Not Graded"
                  );
            const answerValues =
              questionList.map(
                (
                  question,
                  questionIndex
                ) => {
                  const questionId =
                    question.id ??
                    `question-${questionIndex + 1}`;
                  return normalizeAnswer(
                    respondent.answers[
                      questionId
                    ]
                  );
                }
              );
            return [
              index +
                1,
              respondent.name,
              respondent.email,
              respondent.date,
              respondent.time,
              gradingStatus,
              autoMax >
                0
                ? `${autoEarned}/${autoMax}`
                : "-",
              manualMax >
                0
                ? `${manualEarned}/${manualMax}`
                : (
                    Number(
                      respondent.ungradedQuestions
                    ) >
                    0
                      ? "Not Graded"
                      : "-"
                  ),
              totalScore,
              percentage,
              Number(
                respondent.ungradedQuestions
              ) || 0,
              ...answerValues,
            ];
          }
        );
      const headers = [
        "No",
        "Respondent",
        "Email",
        "Submission Date",
        "Submission Time",
        "Grading Status",
        "Auto Score",
        "Manual Score",
        "Total Score",
        "Percentage",
        "Ungraded Questions",
        ...questionList.map(
          (
            question,
            index
          ) =>
            `Q${index + 1} - ${getQuestionTitle(
              question,
              index
            )}`
        ),
      ];
      const headerHtml =
        headers
          .map(
            (
              header
            ) =>
              `<th>${escapeHtml(
                header
              )}</th>`
          )
          .join(
            ""
          );
      const bodyHtml =
        exportRows
          .map(
            (
              row
            ) => {
              const cells =
                row
                  .map(
                    (
                      value,
                      cellIndex
                    ) => {
                      const className =
                        cellIndex >=
                          11
                          ? "answer-cell"
                          : "";
                      return (
                        `<td class="${className}">${escapeHtml(
                          value
                        )}</td>`
                      );
                    }
                  )
                  .join(
                    ""
                  );
              return `<tr>${cells}</tr>`;
            }
          )
          .join(
            ""
          );
      const workbookHtml =
        `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<meta http-equiv="Content-Type" content="application/vnd.ms-excel; charset=UTF-8" />
<style>
  table {
    border-collapse: collapse;
    font-family: Arial, sans-serif;
    font-size: 11pt;
  }
  th {
    padding: 9px 11px;
    border: 1px solid #cbd5e1;
    background: #1f5fa4;
    color: #ffffff;
    font-weight: 700;
    text-align: center;
    vertical-align: middle;
    white-space: nowrap;
  }
  td {
    padding: 8px 10px;
    border: 1px solid #d9e2ec;
    color: #24364b;
    vertical-align: top;
    white-space: nowrap;
  }
  tr:nth-child(even) td {
    background: #f7fafe;
  }
  .answer-cell {
    min-width: 180px;
    max-width: 420px;
    white-space: pre-wrap;
    word-break: break-word;
  }
</style>
</head>
<body>
<table>
  <thead>
    <tr>${headerHtml}</tr>
  </thead>
  <tbody>
    ${bodyHtml}
  </tbody>
</table>
</body>
</html>`;
      const blob =
        new Blob(
          [
            "\uFEFF",
            workbookHtml,
          ],
          {
            type: "application/vnd.ms-excel;charset=utf-8;",
          }
        );
      const downloadUrl =
        URL.createObjectURL(
          blob
        );
      const downloadLink =
        document.createElement(
          "a"
        );
      const safeTitle =
        form.title
          .replace(
            /[^a-z0-9]/gi,
            "-"
          )
          .replace(
            /-+/g,
            "-"
          )
          .replace(
            /^-+|-+$/g,
            ""
          )
          .toLowerCase();
      downloadLink.href =
        downloadUrl;
      downloadLink.download =
        `${safeTitle || "hidocs-form"}-responses.xls`;
      document.body.appendChild(
        downloadLink
      );
      downloadLink.click();
      document.body.removeChild(
        downloadLink
      );
      URL.revokeObjectURL(
        downloadUrl
      );
      setExportStatus(
        "excel"
      );
      window.setTimeout(
        () =>
          setExportStatus(
            ""
          ),
        1800
      );
  };
  // =========================================================
  // EXPORT PDF
  // Opens a dedicated printable report instead of printing
  // the entire Admin Results page.
  // =========================================================
  const exportPDF =
    () => {
      setShowExportMenu(
        false
      );
      if (
        respondents.length ===
        0
      ) {
        alert(
          "No responses are available to export."
        );
        return;
      }
      const questionList =
        Array.isArray(
          form?.questions
        )
          ? form.questions
          : [];
      const getQuestionTitle =
        (
          question,
          index
        ) => {
          const rawTitle =
            question?.title ||
            question?.question ||
            `Question ${index + 1}`;
          const cleanTitle =
            stripHtmlToText(
              rawTitle
            );
          return (
            cleanTitle ||
            `Question ${index + 1}`
          );
        };
      const getGradingStatus =
        (
          respondent
        ) => {
          const graded =
            Number(
              respondent.gradedQuestions
            ) || 0;
          const ungraded =
            Number(
              respondent.ungradedQuestions
            ) || 0;
          if (
            ungraded >
              0 &&
            graded ===
              0
          ) {
            return "Not Graded";
          }
          if (
            ungraded >
            0
          ) {
            return "Partially Graded";
          }
          return "Graded";
        };
      const respondentRows =
        respondents
          .map(
            (
              respondent,
              index
            ) => {
              const status =
                getGradingStatus(
                  respondent
                );
              const totalScore =
                status ===
                  "Not Graded"
                  ? "Not Graded"
                  : (
                      respondent.maxScore >
                      0
                        ? `${respondent.score}/${respondent.maxScore}`
                        : "Not Graded"
                    );
              const percentage =
                status ===
                  "Not Graded"
                  ? "-"
                  : (
                      Number.isFinite(
                        respondent.percentage
                      )
                        ? `${respondent.percentage}%`
                        : "-"
                    );
              return `
                <tr>
                  <td>${index + 1}</td>
                  <td>${escapeHtml(respondent.name)}</td>
                  <td>${escapeHtml(respondent.email || "-")}</td>
                  <td>${escapeHtml(respondent.date)}</td>
                  <td>${escapeHtml(respondent.time)}</td>
                  <td>${escapeHtml(status)}</td>
                  <td>${escapeHtml(totalScore)}</td>
                  <td>${escapeHtml(percentage)}</td>
                  <td>${Number(respondent.ungradedQuestions) || 0}</td>
                </tr>
              `;
            }
          )
          .join(
            ""
          );
      const detailSections =
        respondents
          .map(
            (
              respondent,
              respondentIndex
            ) => {
              const status =
                getGradingStatus(
                  respondent
                );
              const totalScore =
                status ===
                  "Not Graded"
                  ? "Not Graded"
                  : (
                      respondent.maxScore >
                      0
                        ? `${respondent.score}/${respondent.maxScore}`
                        : "Not Graded"
                    );
              const percentage =
                status ===
                  "Not Graded"
                  ? "-"
                  : (
                      Number.isFinite(
                        respondent.percentage
                      )
                        ? `${respondent.percentage}%`
                        : "-"
                    );
              const answerRows =
                questionList
                  .map(
                    (
                      question,
                      questionIndex
                    ) => {
                      const questionId =
                        question.id ??
                        `question-${questionIndex + 1}`;
                      const questionResult =
                        Array.isArray(
                          respondent.questionResults
                        )
                          ? respondent.questionResults.find(
                              (
                                item
                              ) =>
                                String(
                                  item.questionId
                                ) ===
                                String(
                                  questionId
                                )
                            )
                          : null;
                      const answer =
                        normalizeAnswer(
                          respondent.answers[
                            questionId
                          ]
                        );
                      let questionStatus =
                        "Not Graded";
                      let questionScore =
                        "-";
                      if (
                        questionResult?.isAutoGraded
                      ) {
                        questionStatus =
                          questionResult.isCorrect ===
                            true
                            ? "Correct"
                            : questionResult.isCorrect ===
                              false
                              ? "Incorrect"
                              : "Auto Graded";
                        questionScore =
                          `${Number(questionResult.earnedPoints) || 0}/${Number(questionResult.maxPoints) || 0}`;
                      } else if (
                        questionResult?.manuallyGraded
                      ) {
                        questionStatus =
                          "Manually Graded";
                        questionScore =
                          `${Number(questionResult.earnedPoints) || 0}/${Number(questionResult.maxPoints) || 0}`;
                      }
                      return `
                        <tr>
                          <td>${questionIndex + 1}</td>
                          <td>${escapeHtml(getQuestionTitle(question, questionIndex))}</td>
                          <td class="answer-cell">${escapeHtml(answer)}</td>
                          <td>${escapeHtml(questionStatus)}</td>
                          <td>${escapeHtml(questionScore)}</td>
                        </tr>
                      `;
                    }
                  )
                  .join(
                    ""
                  );
              return `
                <section class="respondent-detail">
                  <div class="respondent-detail-header">
                    <div>
                      <span>Respondent ${respondentIndex + 1}</span>
                      <h2>${escapeHtml(respondent.name)}</h2>
                      <p>${escapeHtml(respondent.email || "-")}</p>
                    </div>
                    <div class="detail-score">
                      <span>Total Score</span>
                      <strong>${escapeHtml(totalScore)}</strong>
                      <small>${escapeHtml(percentage)}</small>
                    </div>
                  </div>
                  <div class="detail-meta">
                    <div>
                      <span>Submitted</span>
                      <strong>${escapeHtml(respondent.date)} • ${escapeHtml(respondent.time)}</strong>
                    </div>
                    <div>
                      <span>Grading Status</span>
                      <strong>${escapeHtml(status)}</strong>
                    </div>
                    <div>
                      <span>Ungraded Questions</span>
                      <strong>${Number(respondent.ungradedQuestions) || 0}</strong>
                    </div>
                  </div>
                  <table class="detail-table">
                    <thead>
                      <tr>
                        <th>No</th>
                        <th>Question</th>
                        <th>User Answer</th>
                        <th>Status</th>
                        <th>Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      ${answerRows}
                    </tbody>
                  </table>
                </section>
              `;
            }
          )
          .join(
            ""
          );
      const averageDisplay =
        averageScore !==
          null
          ? `${averageScore}%`
          : "-";
      const highestDisplay =
        highestScore !==
          null
          ? `${highestScore}%`
          : "-";
      const lowestDisplay =
        lowestScore !==
          null
          ? `${lowestScore}%`
          : "-";
      const reportHtml =
        `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8" />
<title>${escapeHtml(form.title)} - Results Report</title>
<style>
  @page {
    size: A4 landscape;
    margin: 12mm;
  }
  * {
    box-sizing: border-box;
  }
  body {
    margin: 0;
    color: #20344d;
    background: #ffffff;
    font-family: Arial, Helvetica, sans-serif;
    font-size: 10px;
  }
  .report {
    width: 100%;
  }
  .report-header {
    margin-bottom: 18px;
    padding: 18px 20px;
    border-radius: 12px;
    background: #1f5fa4;
    color: #ffffff;
  }
  .report-header span {
    display: block;
    margin-bottom: 5px;
    font-size: 8px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    opacity: .78;
  }
  .report-header h1 {
    margin: 0 0 5px;
    font-size: 22px;
  }
  .report-header p {
    margin: 0;
    font-size: 9px;
    opacity: .82;
  }
  .summary-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 9px;
    margin-bottom: 16px;
  }
  .summary-card {
    padding: 12px;
    border: 1px solid #dce6f0;
    border-radius: 10px;
    background: #f8fbff;
  }
  .summary-card span {
    display: block;
    margin-bottom: 4px;
    color: #71859b;
    font-size: 7px;
    text-transform: uppercase;
  }
  .summary-card strong {
    color: #203b59;
    font-size: 18px;
  }
  h2.section-title {
    margin: 0 0 8px;
    color: #263b54;
    font-size: 14px;
  }
  table {
    width: 100%;
    border-collapse: collapse;
  }
  th {
    padding: 8px;
    border: 1px solid #cbd8e5;
    background: #eaf3fd;
    color: #245b91;
    font-size: 8px;
    text-align: left;
  }
  td {
    padding: 8px;
    border: 1px solid #dce5ee;
    color: #334b63;
    font-size: 8px;
    vertical-align: top;
  }
  tbody tr:nth-child(even) td {
    background: #fafcff;
  }
  .summary-table {
    margin-bottom: 22px;
  }
  .respondent-detail {
    margin-top: 18px;
    padding-top: 4px;
    break-before: page;
    page-break-before: always;
  }
  .respondent-detail:first-of-type {
    break-before: auto;
    page-break-before: auto;
  }
  .respondent-detail-header {
    margin-bottom: 9px;
    padding: 12px 14px;
    border-radius: 10px;
    background: #f1f6fc;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
  }
  .respondent-detail-header span {
    color: #7890a8;
    font-size: 7px;
    text-transform: uppercase;
  }
  .respondent-detail-header h2 {
    margin: 3px 0;
    color: #263d56;
    font-size: 15px;
  }
  .respondent-detail-header p {
    margin: 0;
    color: #7a8da1;
    font-size: 8px;
  }
  .detail-score {
    min-width: 110px;
    text-align: right;
  }
  .detail-score strong {
    display: block;
    margin: 2px 0;
    color: #1f5fa4;
    font-size: 17px;
  }
  .detail-score small {
    color: #75889c;
  }
  .detail-meta {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    margin-bottom: 10px;
  }
  .detail-meta > div {
    padding: 9px 10px;
    border: 1px solid #dde6ef;
    border-radius: 8px;
  }
  .detail-meta span {
    display: block;
    margin-bottom: 3px;
    color: #8395a8;
    font-size: 7px;
  }
  .detail-meta strong {
    color: #314961;
    font-size: 8px;
  }
  .detail-table .answer-cell {
    width: 36%;
    white-space: pre-wrap;
    word-break: break-word;
  }
  .report-footer {
    margin-top: 14px;
    color: #91a0af;
    font-size: 7px;
    text-align: center;
  }
  @media print {
    body {
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
  }
</style>
</head>
<body>
<div class="report">
  <header class="report-header">
    <span>
      HiDocs • Form Results Report
    </span>
    <h1>
      ${escapeHtml(form.title)}
    </h1>
    <p>
      ${escapeHtml(form.description || "Respondent results and grading report.")}
    </p>
  </header>
  <section class="summary-grid">
    <div class="summary-card">
      <span>Total Responses</span>
      <strong>${totalResponses}</strong>
    </div>
    <div class="summary-card">
      <span>Average Score</span>
      <strong>${averageDisplay}</strong>
    </div>
    <div class="summary-card">
      <span>Highest Score</span>
      <strong>${highestDisplay}</strong>
    </div>
    <div class="summary-card">
      <span>Lowest Score</span>
      <strong>${lowestDisplay}</strong>
    </div>
  </section>
  <h2 class="section-title">
    Respondent Score Summary
  </h2>
  <table class="summary-table">
    <thead>
      <tr>
        <th>No</th>
        <th>Respondent</th>
        <th>Email</th>
        <th>Date</th>
        <th>Time</th>
        <th>Grading Status</th>
        <th>Total Score</th>
        <th>Percentage</th>
        <th>Ungraded</th>
      </tr>
    </thead>
    <tbody>
      ${respondentRows}
    </tbody>
  </table>
  ${detailSections}
  <div class="report-footer">
    Generated by HiDocs Admin Results
  </div>
</div>
<script>
  window.addEventListener("load", function () {
    window.setTimeout(function () {
      window.print();
    }, 250);
  });
</script>
</body>
</html>`;
      const printWindow =
        window.open(
          "",
          "_blank",
          "width=1200,height=800"
        );
      if (!printWindow) {
        alert(
          "Please allow pop-ups so the PDF report can be opened."
        );
        return;
      }
      printWindow.document.open();
      printWindow.document.write(
        reportHtml
      );
      printWindow.document.close();
      setExportStatus(
        "pdf"
      );
      window.setTimeout(
        () =>
          setExportStatus(
            ""
          ),
        1800
      );
  };
  // =========================================================
  // BACK
  // =========================================================
  const goBack =
    () => {
      navigate(
        `/admin/forms/${id}`
      );
  };
  // =========================================================
  // FORM NOT FOUND
  // =========================================================
  if (!form) {
    return (
      <div
        className={
          darkMode
            ? "admin-results-page dark"
            : "admin-results-page"
        }
      >
        <div className="results-not-found">
          <div className="results-not-found-icon">
            <FaWpforms />
          </div>
          <h2>
            Hasil form tidak ditemukan
          </h2>
          <p>
            Form yang kamu cari mungkin sudah dihapus atau tidak tersedia.
          </p>
          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/forms"
              )
            }
          >
            <FaArrowLeft />
            Kembali ke Manage Forms
          </button>
        </div>
      </div>
    );
  }
  // =========================================================
  // RETURN
  // =========================================================
  return (
    <div
      className={
        darkMode
          ? "admin-results-page dark"
          : "admin-results-page"
      }
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="results-header">
        <div className="results-header-decoration">
          <span className="results-header-circle circle-one"></span>
          <span className="results-header-circle circle-two"></span>
          <div className="results-header-dots">
            {Array.from({
              length: 12,
            }).map(
              (
                _,
                index
              ) => (
                <span
                  key={
                    index
                  }
                ></span>
              )
            )}
          </div>
        </div>
        <div className="results-header-top">
          <button
            type="button"
            className="results-back-btn"
            onClick={
              goBack
            }
          >
            <FaArrowLeft />
          </button>
          <span className="results-header-label">
            Form Results
          </span>
          <div className="results-export-wrapper">
            <button
              type="button"
              className="results-export-trigger"
              onClick={() =>
                setShowExportMenu(
                  (
                    previous
                  ) =>
                    !previous
                )
              }
            >
              <FaDownload />
              <span>
                Export
              </span>
              <FaChevronDown />
            </button>
            {showExportMenu && (
              <div className="results-export-menu">
                <button
                  type="button"
                  onClick={
                    exportExcel
                  }
                >
                  <span className="export-menu-icon excel">
                    <FaFileExcel />
                  </span>
                  <div>
                    <strong>
                      Export Excel
                    </strong>
                    <small>
                      Download spreadsheet
                    </small>
                  </div>
                </button>
                <button
                  type="button"
                  onClick={
                    exportPDF
                  }
                >
                  <span className="export-menu-icon pdf">
                    <FaFilePdf />
                  </span>
                  <div>
                    <strong>
                      Export PDF
                    </strong>
                    <small>
                      Print or save PDF
                    </small>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
        <div className="results-header-content">
          <div className="results-header-icon">
            <FaChartBar />
          </div>
          <div className="results-header-information">
            <span className="results-label">
              Analytics Dashboard
            </span>
            <h1>
              {form.title}
            </h1>
            <p>
              {form.description}
            </p>
          </div>
        </div>
      </header>
      {/* =====================================================
          MAIN
      ===================================================== */}
      <main className="results-content">
        {/* ===================================================
            OVERVIEW
        =================================================== */}
        <section className="results-overview">
          <div className="results-section-heading">
            <div>
              <span className="results-section-eyebrow">
                Overview
              </span>
              <h2>
                Performance summary
              </h2>
            </div>
            <span className="results-update-label">
              Updated recently
            </span>
          </div>
          <div className="results-stats">
            <article className="result-stat-card responses">
              <div className="result-stat-icon">
                <FaUsers />
              </div>
              <div className="result-stat-info">
                <span>
                  Total responses
                </span>
                <strong>
                  {totalResponses}
                </strong>
                <small>
                  All submitted responses
                </small>
              </div>
              <div className="result-stat-decoration"></div>
            </article>
            <article className="result-stat-card average">
              <div className="result-stat-icon">
                <FaChartLine />
              </div>
              <div className="result-stat-info">
                <span>
                  Average score
                </span>
                <strong>
                  {averageScore !==
                  null
                    ? `${averageScore}%`
                    : "—"
                  }
                </strong>
                <small>
                  Overall respondent average
                </small>
              </div>
              <div className="result-stat-decoration"></div>
            </article>
            <article className="result-stat-card highest">
              <div className="result-stat-icon">
                <FaTrophy />
              </div>
              <div className="result-stat-info">
                <span>
                  Highest score
                </span>
                <strong>
                  {highestScore !==
                  null
                    ? `${highestScore}%`
                    : "—"
                  }
                </strong>
                <small>
                  Best respondent result
                </small>
              </div>
              <div className="result-stat-decoration"></div>
            </article>
            <article className="result-stat-card lowest">
              <div className="result-stat-icon">
                <FaArrowDown />
              </div>
              <div className="result-stat-info">
                <span>
                  Lowest score
                </span>
                <strong>
                  {lowestScore !==
                  null
                    ? `${lowestScore}%`
                    : "—"
                  }
                </strong>
                <small>
                  Lowest respondent result
                </small>
              </div>
              <div className="result-stat-decoration"></div>
            </article>
          </div>
        </section>
        {/* ===================================================
            DISTRIBUTION
        =================================================== */}
        <section className="results-panel score-section">
          <div className="results-panel-heading">
            <div>
              <span className="results-section-eyebrow">
                Score Analytics
              </span>
              <h2>
                Score Distribution
              </h2>
            </div>
            <div className="score-summary-icon">
              <FaChartBar />
            </div>
          </div>
          {scoredRespondents.length ===
          0 ? (
            <div className="respondents-empty">
              <div className="respondents-empty-icon">
                <FaChartBar />
              </div>
              <h3>
                Score data is not available
              </h3>
              <p>
                This form does not contain scored questions.
              </p>
            </div>
          ) : (
            <div className="score-distribution">
              {distribution.map(
                (
                  item,
                  index
                ) => (
                  <article
                    className="score-row"
                    key={
                      index
                    }
                  >
                    <div className="score-row-label">
                      <strong>
                        {item.label}
                      </strong>
                      <span>
                        {item.description}
                      </span>
                    </div>
                    <div className="score-bar-area">
                      <div className="score-bar">
                        <div
                          className={
                            `score-bar-fill ${item.color}`
                          }
                          style={{
                            width: `${item.value}%`,
                          }}
                        ></div>
                      </div>
                      <span className="score-percentage">
                        {item.value}%
                      </span>
                    </div>
                    <div className="score-count">
                      <strong>
                        {item.count}
                      </strong>
                      <span>
                        respondents
                      </span>
                    </div>
                  </article>
                )
              )}
            </div>
          )}
        </section>
        {/* ===================================================
            RESPONDENTS
        =================================================== */}
        <section className="results-panel respondents-section">
          <div className="respondents-header">
            <div>
              <span className="results-section-eyebrow">
                Participants
              </span>
              <h2>
                Respondents
              </h2>
            </div>
            <span className="respondents-count">
              {filteredRespondents.length}
              {" "}
              participants
            </span>
          </div>
          <div className="respondents-toolbar">
            <div className="respondents-search">
              <FaSearch />
              <input
                type="text"
                value={
                  search
                }
                onChange={(event) =>
                  setSearch(
                    event.target.value
                  )
                }
                placeholder="Search respondent..."
              />
            </div>
            <div className="respondents-sort">
              <FaSortAmountDown />
              <select
                value={
                  sortOrder
                }
                onChange={(event) =>
                  setSortOrder(
                    event.target.value
                  )
                }
              >
                <option value="newest">
                  Newest submission
                </option>
                <option value="oldest">
                  Oldest submission
                </option>
                <option value="highest">
                  Highest score
                </option>
                <option value="lowest">
                  Lowest score
                </option>
                <option value="name">
                  Name A–Z
                </option>
              </select>
            </div>
          </div>
          <div className="respondents-list">
            {filteredRespondents.length ===
            0 ? (
              <div className="respondents-empty">
                <div className="respondents-empty-icon">
                  <FaUser />
                </div>
                <h3>
                  {respondents.length ===
                  0
                    ? "No responses yet"
                    : "No respondents found"
                  }
                </h3>
                <p>
                  {respondents.length ===
                  0
                    ? "Responses submitted by users will appear here."
                    : "Try searching with another name."
                  }
                </p>
              </div>
            ) : (
              filteredRespondents.map(
                (
                  respondent,
                  index
                ) => (
                  <article
                    className="respondent-card"
                    key={respondent.id}
                  >
                    {/* =========================
                        LEFT SIDE
                    ========================= */}
                    <div className="respondent-main">
                      <span className="respondent-number">
                        {index + 1}
                      </span>
                      <div className="respondent-avatar">
                        {respondent.initial}
                      </div>
                      <div className="respondent-info">
                        <strong>
                          {respondent.name}
                        </strong>
                        {respondent.email && (
                          <small>
                            {respondent.email}
                          </small>
                        )}
                        <div className="respondent-status">
                          <FaCheck />
                          <span>
                            {respondent.status}
                          </span>
                        </div>
                      </div>
                    </div>
                    {/* =========================
                        DATE & TIME
                    ========================= */}
                    <div className="respondent-meta">
                      <div className="respondent-meta-chip">
                        <FaCalendarAlt />
                        <div>
                          <span>
                            Submitted
                          </span>
                          <strong>
                            {respondent.date}
                          </strong>
                        </div>
                      </div>
                      <div className="respondent-meta-chip">
                        <FaClock />
                        <div>
                          <span>
                            Time
                          </span>
                          <strong>
                            {respondent.time}
                          </strong>
                        </div>
                      </div>
                    </div>
                    {/* =========================
                        RIGHT SIDE
                    ========================= */}
                    <div className="respondent-actions">
                      <div
                        className={
                          `respondent-score ${getScoreClass(
                            respondent.score
                          )}`
                        }
                      >
                        <span>
                          Score
                        </span>
                        <strong>
                          {respondent.score !== null
                            ? `${respondent.score}%`
                            : "—"
                          }
                        </strong>
                      </div>
                      <button
                        type="button"
                        className="respondent-view-answers-btn"
                        onClick={() =>
                          setSelectedRespondent(
                            respondent
                          )
                        }
                      >
                        <FaEye />
                        <span>
                          View Answers
                        </span>
                      </button>
                    </div>
                  </article>
                )
              )
            )}
          </div>
        </section>
        {/* ===================================================
            EXPORT CARD
        =================================================== */}
        <section className="results-export-card">
          <div className="results-export-card-icon">
            <FaDownload />
          </div>
          <div className="results-export-card-content">
            <span>
              Download report
            </span>
            <h2>
              Export response data
            </h2>
            <p>
              Download respondent data and analytics in spreadsheet or PDF format.
            </p>
          </div>
          <div className="results-export-actions">
            <button
              type="button"
              className={
                exportStatus ===
                  "excel"
                  ? "export-btn excel exported"
                  : "export-btn excel"
              }
              onClick={
                exportExcel
              }
            >
              {exportStatus ===
              "excel"
                ? <FaCheck />
                : <FaFileExcel />
              }
              <span>
                Excel
              </span>
            </button>
            <button
              type="button"
              className={
                exportStatus ===
                  "pdf"
                  ? "export-btn pdf exported"
                  : "export-btn pdf"
              }
              onClick={
                exportPDF
              }
            >
              {exportStatus ===
              "pdf"
                ? <FaCheck />
                : <FaFilePdf />
              }
              <span>
                PDF
              </span>
            </button>
          </div>
        </section>
      </main>
      {/* =====================================================
          ADMIN ANSWER MODAL
      ===================================================== */}
      {selectedRespondent && (
        <div
          className="admin-answer-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeRespondentAnswers();
            }
          }}
        >
          <section className="admin-answer-modal">
            {/* ===============================================
                MODAL HEADER
            =============================================== */}
            <div className="admin-answer-modal-header">
              <div className="admin-answer-modal-user">
                <div className="admin-answer-modal-avatar">
                  {selectedRespondent.initial}
                </div>
                <div>
                  <span>
                    Respondent Answers
                  </span>
                  <h2>
                    {selectedRespondent.name}
                  </h2>
                  {selectedRespondent.email && (
                    <p>
                      {selectedRespondent.email}
                    </p>
                  )}
                </div>
              </div>
              <button
                type="button"
                className="admin-answer-close-btn"
                onClick={
                  closeRespondentAnswers
                }
              >
                <FaTimes />
              </button>
            </div>
            {/* ===============================================
                SUBMISSION SUMMARY
            =============================================== */}
            <div className="admin-answer-summary">
              <div>
                <span>
                  Submitted
                </span>
                <strong>
                  {selectedRespondent.date}
                  {" • "}
                  {selectedRespondent.time}
                </strong>
              </div>
              <div>
                <span>
                  Answered
                </span>
                <strong>
                  {selectedRespondent.answeredQuestions}
                  /
                  {selectedRespondent.totalQuestions}
                </strong>
              </div>
              <div>
                <span>
                  Correct
                </span>
                <strong>
                  {selectedRespondent.correctCount}
                </strong>
              </div>
              <div>
                <span>
                  Incorrect
                </span>
                <strong>
                  {selectedRespondent.incorrectCount}
                </strong>
              </div>
            </div>
            {/* ===============================================
                SCORE
            =============================================== */}
            {selectedRespondent.maxScore >
              0 && (
              <div className="admin-answer-score-card">
                <div className="admin-answer-score-icon">
                  <FaTrophy />
                </div>
                <div>
                  <span>
                    Respondent Score
                  </span>
                  <strong>
                    {selectedRespondent.score}
                    /
                    {selectedRespondent.maxScore}
                  </strong>
                </div>
                <div className="admin-answer-score-percentage">
                  {selectedRespondent.percentage}%
                </div>
              </div>
            )}
            <div
              className={
                selectedRespondent.gradingComplete
                  ? "admin-grading-progress complete"
                  : "admin-grading-progress pending"
              }
            >
              <div>
                <span>Grading Progress</span>
                <strong>
                  {selectedRespondent.gradedQuestions}
                  /
                  {selectedRespondent.totalQuestions}
                  {" questions graded"}
                </strong>
              </div>
              <span className="admin-grading-pending-badge">
                {selectedRespondent.ungradedQuestions === 0
                  ? "Grading Complete"
                  : `${selectedRespondent.ungradedQuestions} Not Graded`}
              </span>
            </div>
            {/* ===============================================
                QUESTIONS
            =============================================== */}
            <div className="admin-answer-question-list">
              {selectedRespondent.questionResults.map(
                (
                  item
                ) => {
                  const incorrect =
                    item.isCorrect ===
                    false;
                  const correct =
                    item.isCorrect ===
                    true;
                  return (
                    <article
                      key={
                        item.questionId
                      }
                      className={[
                        "admin-answer-question-card",
                        incorrect
                          ? "incorrect"
                          : "",
                        correct
                          ? "correct"
                          : "",
                      ]
                        .filter(
                          Boolean
                        )
                        .join(
                          " "
                        )}
                    >
                      <div className="admin-answer-question-top">
                        <span className="admin-answer-question-number">
                          {item.number}
                        </span>
                        <span className="admin-answer-question-type">
                          <FaQuestionCircle />
                          {item.question.type ||
                            "Question"}
                        </span>
                        {item.isCorrect !==
                        null && (
                          <span
                            className={
                              item.isCorrect
                                ? "admin-answer-status correct"
                                : "admin-answer-status incorrect"
                            }
                          >
                            {item.isCorrect
                              ? <FaCheckCircle />
                              : <FaTimes />
                            }
                            {item.isCorrect
                              ? "Correct"
                              : "Incorrect"
                            }
                          </span>
                        )}
                      </div>
                      <h3>
                        {item.question.title ||
                          item.question.question ||
                          `Question ${item.number}`}
                      </h3>
                      {item.question.image && (
                        <div className="admin-answer-question-image">
                          <img
                            src={
                              item.question.image
                            }
                            alt={`Question ${item.number}`}
                          />
                        </div>
                      )}
                      <div
                        className={
                          incorrect
                            ? "admin-answer-user-answer incorrect"
                            : correct
                            ? "admin-answer-user-answer correct"
                            : "admin-answer-user-answer"
                        }
                      >
                        <span>
                          User Answer
                        </span>
                        <strong>
                          {hasAnswer(
                            item.userAnswer
                          )
                            ? normalizeAnswer(
                                item.userAnswer
                              )
                            : "No answer"
                          }
                        </strong>
                      </div>
                      {item.hasCorrectAnswer && (
                        <div className="admin-answer-correct-answer">
                          <span>
                            Correct Answer
                          </span>
                          <strong>
                            <FaCheckCircle />
                            {normalizeAnswer(
                              item.correctAnswer
                            )}
                          </strong>
                        </div>
                      )}
                      {!item.isAutoGraded && (
                        <div className="admin-manual-grade-box">
                          <div className="admin-manual-grade-heading">
                            <div>
                              <span>Manual Grading</span>
                              <strong>
                                {item.manuallyGraded
                                  ? "Nilai sudah diberikan admin"
                                  : "This question has not been graded yet."}
                              </strong>
                            </div>
                            <span
                              className={
                                item.manuallyGraded
                                  ? "manual-grade-status graded"
                                  : "manual-grade-status pending"
                              }
                            >
                              {item.manuallyGraded
                                ? "Graded"
                                : "Not Graded"}
                            </span>
                          </div>
                          <div className="admin-manual-grade-inputs">
                            <label>
                              <span>Score</span>
                              <input
                                type="number"
                                min="0"
                                value={
                                  manualGrades[String(item.questionId)]?.earnedPoints ?? ""
                                }
                                onChange={(event) =>
                                  updateManualGradeField(
                                    item.questionId,
                                    "earnedPoints",
                                    event.target.value
                                  )
                                }
                                placeholder="0"
                              />
                            </label>
                            <span className="manual-grade-divider">/</span>
                            <label>
                              <span>Max Points</span>
                              <input
                                type="number"
                                min="1"
                                value={
                                  manualGrades[String(item.questionId)]?.maxPoints ?? ""
                                }
                                onChange={(event) =>
                                  updateManualGradeField(
                                    item.questionId,
                                    "maxPoints",
                                    event.target.value
                                  )
                                }
                                placeholder="10"
                              />
                            </label>
                          </div>
                        </div>
                      )}
                      {item.scoringEnabled && (
                        <div className="admin-answer-points">
                          <span>
                            Question Score
                          </span>
                          <strong>
                            {item.earnedPoints}
                            /
                            {item.maxPoints}
                            {" pts"}
                          </strong>
                        </div>
                      )}
                    </article>
                  );
                }
              )}
            </div>
            {/* ===============================================
                MODAL FOOTER
            =============================================== */}
            <div className="admin-answer-modal-footer">
              <span>
                This detailed result is visible to administrators only.
              </span>
              <div className="admin-answer-footer-actions">
                {selectedRespondent.ungradedQuestions > 0 && (
                  <button
                    type="button"
                    className="admin-save-grades-btn"
                    onClick={saveManualGrades}
                    disabled={gradingSaving}
                  >
                    <FaSave />
                    {gradingSaving ? "Saving..." : "Save Manual Grades"}
                  </button>
                )}
                <button
                  type="button"
                  className="admin-close-answers-btn"
                  onClick={closeRespondentAnswers}
                >
                  Close
                </button>
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
export default AdminResults;