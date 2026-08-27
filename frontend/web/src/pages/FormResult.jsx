import {
  useContext,
  useMemo,
} from "react";
import {
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaCheck,
  FaCheckCircle,
  FaClipboardCheck,
  FaClock,
  FaCode,
  FaExclamationTriangle,
  FaFileAlt,
  FaHome,
  FaImage,
  FaListUl,
  FaStar,
  FaTimes,
  FaTrophy,
} from "react-icons/fa";
import {
  ThemeContext,
} from "../context/ThemeContext";
import {
  FormContext,
} from "../context/FormContext";
import "../assets/css/FormResult.css";
// =========================================================
// STORAGE KEYS
// =========================================================
const FORMS_STORAGE_KEY =
  "hidocs_forms";
const SUBMISSIONS_STORAGE_KEY =
  "hidocs_submissions";
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
// NORMALIZE RESULT MODE
// =========================================================
const normalizeResultMode = (
  value
) => {
  const normalizedValue =
    String(
      value ||
      ""
    )
      .trim()
      .toLowerCase();
  if (
    normalizedValue ===
      "score" ||
    normalizedValue ===
      "show-score" ||
    normalizedValue ===
      "show-result-and-score" ||
    normalizedValue ===
      "result-score"
  ) {
    return "score";
  }
  if (
    normalizedValue ===
      "result" ||
    normalizedValue ===
      "show-result" ||
    normalizedValue ===
      "show-result-only"
  ) {
    return "result";
  }
  return "none";
};
// =========================================================
// CHECK ANSWER VALUE
// =========================================================
const hasAnswerValue = (
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
    value !== undefined &&
    value !== null &&
    value !== ""
  );
};
// =========================================================
// NORMALIZE ANSWER TEXT
// =========================================================
const normalizeAnswerText = (
  value
) => {
  if (
    value === undefined ||
    value === null
  ) {
    return "";
  }
  if (
    Array.isArray(
      value
    )
  ) {
    return value
      .map(
        (
          item
        ) =>
          String(
            item ??
            ""
          ).trim()
      )
      .filter(
        Boolean
      )
      .join(", ");
  }
  if (
    typeof value ===
    "object"
  ) {
    try {
      return JSON.stringify(
        value
      );
    } catch (error) {
      console.error(
        "Gagal membaca jawaban object:",
        error
      );
      return String(
        value
      );
    }
  }
  return String(
    value
  ).trim();
};
// =========================================================
// NORMALIZE COMPARABLE ANSWER
// =========================================================
const normalizeComparableAnswer = (
  value
) => {
  if (
    Array.isArray(
      value
    )
  ) {
    return value
      .map(
        (
          item
        ) =>
          String(
            item ??
            ""
          )
            .trim()
            .toLowerCase()
      )
      .sort()
      .join("|");
  }
  return normalizeAnswerText(
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
  if (
    !question ||
    typeof question !==
      "object"
  ) {
    return "";
  }
  const possibleAnswers = [
    question.correctAnswer,
    question.correctOption,
    question.correctValue,
    question.expectedAnswer,
    question.answerKey,
  ];
  for (
    const answer of possibleAnswers
  ) {
    if (
      hasAnswerValue(
        answer
      )
    ) {
      return answer;
    }
  }
  /*
    Jangan langsung memakai question.answer.
    Pada beberapa struktur aplikasi, "answer"
    dapat digunakan untuk data lain.
    Hanya digunakan sebagai fallback.
  */
  if (
    hasAnswerValue(
      question.answer
    )
  ) {
    return question.answer;
  }
  /*
    Mendukung option object seperti:
    {
      text: "Jakarta",
      correct: true
    }
  */
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
// NORMALIZE QUESTION
// =========================================================
const normalizeQuestion = (
  question,
  index
) => {
  const safeQuestion =
    question &&
    typeof question ===
      "object"
      ? question
      : {};
  const questionId =
    safeQuestion.id ??
    `question-${index + 1}`;
  return {
    ...safeQuestion,
    id:
      questionId,
    title:
      String(
        safeQuestion.title ||
        safeQuestion.question ||
        `Question ${index + 1}`
      ).trim(),
    type:
      safeQuestion.type ||
      "short",
    required:
      safeQuestion.required !==
      false,
    image:
      String(
        safeQuestion.image ||
        ""
      ).trim(),
    imageName:
      String(
        safeQuestion.imageName ||
        ""
      ).trim(),
    scoring:
      safeQuestion.scoring ===
      true,
    points:
      Number(
        safeQuestion.points
      ) || 0,
    options:
      Array.isArray(
        safeQuestion.options
      )
        ? safeQuestion.options
        : [],
  };
};
// =========================================================
// GET QUESTION TYPE LABEL
// =========================================================
const getQuestionTypeLabel = (
  type
) => {
  switch (
    String(
      type ||
      ""
    ).toLowerCase()
  ) {
    case "multiple":
      return "Multiple Choice";
    case "short":
      return "Short Text";
    case "long":
      return "Long Text";
    case "rating":
      return "Rating";
    case "yesno":
      return "Yes / No";
    case "math":
      return "Math";
    case "code":
      return "Code";
    case "image":
      return "Image Question";
    default:
      return "Question";
  }
};
// =========================================================
// GET QUESTION TYPE ICON
// =========================================================
const getQuestionTypeIcon = (
  type
) => {
  switch (
    String(
      type ||
      ""
    ).toLowerCase()
  ) {
    case "multiple":
    case "yesno":
      return (
        <FaListUl />
      );
    case "rating":
      return (
        <FaStar />
      );
    case "code":
      return (
        <FaCode />
      );
    case "image":
      return (
        <FaImage />
      );
    default:
      return (
        <FaFileAlt />
      );
  }
};
// =========================================================
// FORMAT DATE
// =========================================================
const formatSubmissionDate = (
  value
) => {
  if (!value) {
    return "-";
  }
  try {
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
      "id-ID",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    ).format(
      date
    );
  } catch (error) {
    console.error(
      "Gagal format tanggal:",
      error
    );
    return "-";
  }
};
// =========================================================
// FORMAT TIME
// =========================================================
const formatSubmissionTime = (
  value
) => {
  if (!value) {
    return "-";
  }
  try {
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
      "id-ID",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    ).format(
      date
    );
  } catch (error) {
    console.error(
      "Gagal format waktu:",
      error
    );
    return "-";
  }
};
// =========================================================
// FIND STORED FORM
// =========================================================
const findStoredForm = (
  formId
) => {
  if (
    formId === undefined ||
    formId === null
  ) {
    return null;
  }
  const storedForms =
    getStoredArray(
      FORMS_STORAGE_KEY
    );
  return (
    [...storedForms]
      .reverse()
      .find(
        (
          item
        ) =>
          String(
            item?.id
          ) ===
          String(
            formId
          )
      ) ||
    null
  );
};
// =========================================================
// FIND STORED SUBMISSION
// =========================================================
const findStoredSubmission = (
  formId,
  submissionId
) => {
  const storedSubmissions =
    getStoredArray(
      SUBMISSIONS_STORAGE_KEY
    );
  if (
    storedSubmissions.length ===
    0
  ) {
    return null;
  }
  /*
    Jika submissionId tersedia, gunakan itu terlebih dahulu.
  */
  if (
    submissionId
  ) {
    const exactSubmission =
      [...storedSubmissions]
        .reverse()
        .find(
          (
            item
          ) =>
            String(
              item?.submissionId
            ) ===
            String(
              submissionId
            )
        );
    if (
      exactSubmission
    ) {
      return exactSubmission;
    }
  }
  /*
    Fallback berdasarkan formId.
  */
  const matchingSubmissions =
    storedSubmissions.filter(
      (
        item
      ) => {
        const storedFormId =
          item?.formId ??
          item?.id;
        return (
          String(
            storedFormId
          ) ===
          String(
            formId
          )
        );
      }
    );
  if (
    matchingSubmissions.length ===
    0
  ) {
    return null;
  }
  return matchingSubmissions[
    matchingSubmissions.length -
    1
  ];
};
// =========================================================
// FORM RESULT
// =========================================================
function FormResult() {
  const navigate =
    useNavigate();
  const location =
    useLocation();
  const params =
    useParams();
  // =========================================================
  // CONTEXT
  // =========================================================
  const themeContext =
    useContext(
      ThemeContext
    ) ||
    {};
  const darkMode =
    Boolean(
      themeContext.darkMode
    );
  const formContext =
    useContext(
      FormContext
    ) ||
    {};
  const forms =
    Array.isArray(
      formContext.forms
    )
      ? formContext.forms
      : [];
  const submittedForms =
    Array.isArray(
      formContext.submittedForms
    )
      ? formContext.submittedForms
      : [];
  const getFormById =
    formContext.getFormById;
  const getUserSubmissionByForm =
    formContext.getUserSubmissionByForm;
  // =========================================================
  // ROUTE STATE
  // =========================================================
  const routeState =
    (
      location.state &&
      typeof location.state ===
        "object"
    )
      ? location.state
      : {};
  const formId =
    routeState.formId ??
    params.id ??
    null;
  const submissionId =
    routeState.submissionId ??
    routeState.submission
      ?.submissionId ??
    null;
  // =========================================================
  // LOAD FORM
  // =========================================================
  const form =
    useMemo(
      () => {
        if (
          formId === undefined ||
          formId === null
        ) {
          return null;
        }
        /*
          Prioritas 1:
          Context helper.
        */
        if (
          typeof getFormById ===
          "function"
        ) {
          try {
            const foundForm =
              getFormById(
                formId
              );
            if (
              foundForm
            ) {
              return foundForm;
            }
          } catch (error) {
            console.error(
              "getFormById error:",
              error
            );
          }
        }
        /*
          Prioritas 2:
          Context forms.
        */
        const contextForm =
          forms.find(
            (
              item
            ) =>
              String(
                item?.id
              ) ===
              String(
                formId
              )
          );
        if (
          contextForm
        ) {
          return contextForm;
        }
        /*
          Prioritas 3:
          LocalStorage.
        */
        return findStoredForm(
          formId
        );
      },
      [
        formId,
        forms,
        getFormById,
      ]
    );
  // =========================================================
  // LOAD SUBMISSION
  // =========================================================
  const submission =
    useMemo(
      () => {
        /*
          Prioritas 1:
          Submission dari navigation state.
        */
        if (
          routeState.submission &&
          typeof routeState.submission ===
            "object"
        ) {
          return routeState.submission;
        }
        /*
          Prioritas 2:
          Helper context.
        */
        if (
          formId &&
          typeof getUserSubmissionByForm ===
            "function"
        ) {
          try {
            const foundSubmission =
              getUserSubmissionByForm(
                formId
              );
            if (
              foundSubmission
            ) {
              return foundSubmission;
            }
          } catch (error) {
            console.error(
              "getUserSubmissionByForm error:",
              error
            );
          }
        }
        /*
          Prioritas 3:
          submittedForms context.
        */
        const matchingContextSubmissions =
          submittedForms.filter(
            (
              item
            ) => {
              const itemFormId =
                item?.formId ??
                item?.id;
              return (
                String(
                  itemFormId
                ) ===
                String(
                  formId
                )
              );
            }
          );
        if (
          submissionId
        ) {
          const exactContextSubmission =
            matchingContextSubmissions.find(
              (
                item
              ) =>
                String(
                  item?.submissionId
                ) ===
                String(
                  submissionId
                )
            );
          if (
            exactContextSubmission
          ) {
            return exactContextSubmission;
          }
        }
        if (
          matchingContextSubmissions.length >
          0
        ) {
          return matchingContextSubmissions[
            matchingContextSubmissions.length -
            1
          ];
        }
        /*
          Prioritas 4:
          LocalStorage.
        */
        return findStoredSubmission(
          formId,
          submissionId
        );
      },
      [
        formId,
        submissionId,
        routeState.submission,
        submittedForms,
        getUserSubmissionByForm,
      ]
    );
  // =========================================================
  // RESULT MODE
  // =========================================================
  const resultMode =
    normalizeResultMode(
      routeState.resultMode ??
      submission?.resultMode ??
      form?.settings?.resultMode ??
      form?.resultMode
    );
  const canViewResult =
    resultMode ===
      "result" ||
    resultMode ===
      "score";
  const canViewScore =
    resultMode ===
    "score";
  // =========================================================
  // QUESTIONS
  // =========================================================
  const questions =
    useMemo(
      () => {
        if (
          !form ||
          !Array.isArray(
            form.questions
          )
        ) {
          return [];
        }
        return form.questions.map(
          (
            question,
            index
          ) =>
            normalizeQuestion(
              question,
              index
            )
        );
      },
      [
        form,
      ]
    );
  // =========================================================
  // ANSWERS
  // =========================================================
  const answers =
    useMemo(
      () => {
        if (
          !submission ||
          !submission.answers ||
          typeof submission.answers !==
            "object" ||
          Array.isArray(
            submission.answers
          )
        ) {
          return {};
        }
        return submission.answers;
      },
      [
        submission,
      ]
    );
  // =========================================================
  // STORED QUESTION RESULTS
  // =========================================================
  const storedQuestionResults =
    useMemo(
      () => {
        if (
          !submission ||
          !Array.isArray(
            submission.questionResults
          )
        ) {
          return [];
        }
        return submission.questionResults;
      },
      [
        submission,
      ]
    );
  // =========================================================
  // BUILD QUESTION RESULTS
  // =========================================================
  const questionResults =
    useMemo(
      () => {
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
            const storedQuestionResult =
              storedQuestionResults.find(
                (
                  result
                ) => {
                  const resultQuestionId =
                    result?.questionId ??
                    result?.id;
                  return (
                    String(
                      resultQuestionId
                    ) ===
                    String(
                      questionId
                    )
                  );
                }
              ) ||
              null;
            const correctAnswer =
              storedQuestionResult
                ?.correctAnswer ??
              getCorrectAnswer(
                question
              );
            const hasCorrectAnswer =
              hasAnswerValue(
                correctAnswer
              );
            let isCorrect =
              null;
            /*
              Jika submission sudah memiliki hasil penilaian,
              gunakan data itu.
            */
            if (
              typeof storedQuestionResult
                ?.isCorrect ===
              "boolean"
            ) {
              isCorrect =
                storedQuestionResult
                  .isCorrect;
            }
            /*
              Jika belum ada, hitung dari correctAnswer.
            */
            else if (
              hasCorrectAnswer &&
              hasAnswerValue(
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
            /*
              Ada kunci tetapi user tidak menjawab.
            */
            else if (
              hasCorrectAnswer &&
              !hasAnswerValue(
                userAnswer
              )
            ) {
              isCorrect =
                false;
            }
            /*
              Scoring hanya dianggap aktif jika:
              - question.scoring true
              - atau stored result menyebut scoring true
              - atau ada points > 0
            */
            const scoringEnabled =
              question.scoring ===
                true ||
              storedQuestionResult
                ?.scoring ===
                true ||
              Number(
                question.points
              ) >
                0 ||
              Number(
                storedQuestionResult
                  ?.maxPoints
              ) >
                0;
            const pointsFromQuestion =
              Number(
                question.points
              );
            const pointsFromStoredResult =
              Number(
                storedQuestionResult
                  ?.maxPoints ??
                storedQuestionResult
                  ?.points
              );
            let maxPoints =
              0;
            if (
              Number.isFinite(
                pointsFromStoredResult
              ) &&
              pointsFromStoredResult >
                0
            ) {
              maxPoints =
                pointsFromStoredResult;
            } else if (
              Number.isFinite(
                pointsFromQuestion
              ) &&
              pointsFromQuestion >
                0
            ) {
              maxPoints =
                pointsFromQuestion;
            } else if (
              scoringEnabled
            ) {
              maxPoints =
                1;
            }
            let earnedPoints =
              0;
            if (
              storedQuestionResult
                ?.earnedPoints !==
              undefined &&
              storedQuestionResult
                ?.earnedPoints !==
              null
            ) {
              const storedEarnedPoints =
                Number(
                  storedQuestionResult
                    .earnedPoints
                );
              earnedPoints =
                Number.isFinite(
                  storedEarnedPoints
                )
                  ? storedEarnedPoints
                  : 0;
            } else if (
              scoringEnabled &&
              isCorrect ===
                true
            ) {
              earnedPoints =
                maxPoints;
            }
            return {
              questionId,
              question,
              userAnswer,
              correctAnswer,
              hasCorrectAnswer,
              isCorrect,
              scoringEnabled,
              maxPoints,
              earnedPoints,
            };
          }
        );
      },
      [
        questions,
        answers,
        storedQuestionResults,
      ]
    );
  // =========================================================
  // CALCULATED SCORE
  // =========================================================
  const calculatedScore =
    useMemo(
      () => {
        return questionResults.reduce(
          (
            total,
            item
          ) => {
            if (
              !item.scoringEnabled
            ) {
              return total;
            }
            return (
              total +
              (
                Number(
                  item.earnedPoints
                ) ||
                0
              )
            );
          },
          0
        );
      },
      [
        questionResults,
      ]
    );
  const calculatedMaxScore =
    useMemo(
      () => {
        return questionResults.reduce(
          (
            total,
            item
          ) => {
            if (
              !item.scoringEnabled
            ) {
              return total;
            }
            return (
              total +
              (
                Number(
                  item.maxPoints
                ) ||
                0
              )
            );
          },
          0
        );
      },
      [
        questionResults,
      ]
    );
  // =========================================================
  // FINAL SCORE
  // =========================================================
  const storedScore =
    Number(
      submission?.score
    );
  const storedMaxScore =
    Number(
      submission?.maxScore
    );
  const score =
    Number.isFinite(
      storedScore
    )
      ? storedScore
      : calculatedScore;
  const maxScore =
    (
      Number.isFinite(
        storedMaxScore
      ) &&
      storedMaxScore >
        0
    )
      ? storedMaxScore
      : calculatedMaxScore;
  // =========================================================
  // SCORED QUESTIONS
  // =========================================================
  const scoredQuestionResults =
    useMemo(
      () => {
        return questionResults.filter(
          (
            item
          ) => {
            return (
              item.scoringEnabled ||
              item.hasCorrectAnswer
            );
          }
        );
      },
      [
        questionResults,
      ]
    );
  // =========================================================
  // CORRECT COUNT
  // =========================================================
  const calculatedCorrectCount =
    scoredQuestionResults.filter(
      (
        item
      ) =>
        item.isCorrect ===
        true
    ).length;
  const storedCorrectAnswers =
    Number(
      submission?.correctAnswers
    );
  const correctCount =
    Number.isFinite(
      storedCorrectAnswers
    )
      ? storedCorrectAnswers
      : calculatedCorrectCount;
  // =========================================================
  // INCORRECT COUNT
  // =========================================================
  const calculatedIncorrectCount =
    scoredQuestionResults.filter(
      (
        item
      ) =>
        item.isCorrect ===
        false
    ).length;
  const storedIncorrectAnswers =
    Number(
      submission?.incorrectAnswers
    );
  const incorrectCount =
    Number.isFinite(
      storedIncorrectAnswers
    )
      ? storedIncorrectAnswers
      : calculatedIncorrectCount;
  // =========================================================
  // PERCENTAGE
  // =========================================================
  const percentage =
    maxScore >
      0
      ? Math.max(
          0,
          Math.min(
            100,
            Math.round(
              (
                score /
                maxScore
              ) *
              100
            )
          )
        )
      : (
          scoredQuestionResults.length >
            0
            ? Math.round(
                (
                  correctCount /
                  scoredQuestionResults.length
                ) *
                100
              )
            : 0
        );
  // =========================================================
  // ANSWERED COUNT
  // =========================================================
  const answeredCount =
    questionResults.filter(
      (
        item
      ) =>
        hasAnswerValue(
          item.userAnswer
        )
    ).length;
  // =========================================================
  // FORM TITLE
  // =========================================================
  const formTitle =
    routeState.formTitle ||
    submission?.title ||
    form?.title ||
    "Form Result";
  // =========================================================
  // NAVIGATION
  // =========================================================
  const goBack =
    () => {
      navigate(
        "/history"
      );
  };
  const goHome =
    () => {
      navigate(
        "/dashboard"
      );
  };
  // =========================================================
  // FORM ID NOT FOUND
  // =========================================================
  if (
    !formId
  ) {
    return (
      <div
        className={
          darkMode
            ? "form-result-page dark"
            : "form-result-page"
        }
      >
        <div className="form-result-state-card">
          <div className="form-result-state-icon warning">
            <FaExclamationTriangle />
          </div>
          <h2>
            Form ID tidak ditemukan
          </h2>
          <p>
            Halaman result tidak menerima ID form yang valid.
          </p>
          <button
            type="button"
            onClick={
              goBack
            }
          >
            <FaArrowLeft />
            Back to History
          </button>
        </div>
      </div>
    );
  }
  // =========================================================
  // DATA NOT FOUND
  // =========================================================
  if (
    !form ||
    !submission
  ) {
    return (
      <div
        className={
          darkMode
            ? "form-result-page dark"
            : "form-result-page"
        }
      >
        <div className="form-result-state-card">
          <div className="form-result-state-icon warning">
            <FaExclamationTriangle />
          </div>
          <h2>
            Result tidak ditemukan
          </h2>
          <p>
            {!form
              ? "Data form tidak berhasil ditemukan."
              : "Data submission tidak berhasil ditemukan."
            }
          </p>
          <button
            type="button"
            onClick={
              goBack
            }
          >
            <FaArrowLeft />
            Back to History
          </button>
        </div>
      </div>
    );
  }
  // =========================================================
  // RESULT ACCESS DENIED
  // =========================================================
  if (
    !canViewResult
  ) {
    return (
      <div
        className={
          darkMode
            ? "form-result-page dark"
            : "form-result-page"
        }
      >
        <div className="form-result-state-card">
          <div className="form-result-state-icon warning">
            <FaExclamationTriangle />
          </div>
          <h2>
            Result tidak tersedia
          </h2>
          <p>
            Admin tidak mengaktifkan akses hasil untuk form ini.
          </p>
          <button
            type="button"
            onClick={
              goBack
            }
          >
            <FaArrowLeft />
            Back to History
          </button>
        </div>
      </div>
    );
  }
  // =========================================================
  // EMPTY QUESTIONS
  // =========================================================
  if (
    questions.length ===
    0
  ) {
    return (
      <div
        className={
          darkMode
            ? "form-result-page dark"
            : "form-result-page"
        }
      >
        <div className="form-result-state-card">
          <div className="form-result-state-icon warning">
            <FaExclamationTriangle />
          </div>
          <h2>
            Pertanyaan tidak ditemukan
          </h2>
          <p>
            Data pertanyaan untuk form ini tidak tersedia.
          </p>
          <button
            type="button"
            onClick={
              goBack
            }
          >
            <FaArrowLeft />
            Back to History
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
          ? "form-result-page dark"
          : "form-result-page"
      }
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="form-result-header">
        <div className="form-result-header-decoration">
          <span className="form-result-circle circle-one"></span>
          <span className="form-result-circle circle-two"></span>
          <div className="form-result-dot-pattern">
            {Array.from({
              length: 15,
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
        <div className="form-result-header-top">
          <button
            type="button"
            className="form-result-back-btn"
            onClick={
              goBack
            }
          >
            <FaArrowLeft />
          </button>
          <span className="form-result-header-label">
            Submission Result
          </span>
          <span
            className={
              canViewScore
                ? "form-result-mode-badge score"
                : "form-result-mode-badge"
            }
          >
            {canViewScore ? (
              <>
                <FaTrophy />
                Result &amp; Score
              </>
            ) : (
              <>
                <FaClipboardCheck />
                Result Only
              </>
            )}
          </span>
        </div>
        <div className="form-result-header-content">
          <span className="form-result-eyebrow">
            HiDocs Result
          </span>
          <h1>
            {formTitle}
          </h1>
          <p>
            {canViewScore
              ? "Review your submitted answers and see your score."
              : "Review the questions and answers you submitted."
            }
          </p>
        </div>
      </header>
      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="form-result-content">
        {/* ===================================================
            SUBMISSION SUMMARY
        =================================================== */}
        <section className="form-result-summary-card">
          <div className="form-result-summary-icon">
            <FaCheckCircle />
          </div>
          <div className="form-result-summary-main">
            <span>
              Submission Completed
            </span>
            <strong>
              Your response was successfully recorded
            </strong>
            <p>
              {answeredCount}
              {" "}
              of
              {" "}
              {questions.length}
              {" "}
              questions answered.
            </p>
          </div>
          <div className="form-result-summary-meta">
            <div>
              <FaCalendarAlt />
              <span>
                {formatSubmissionDate(
                  submission.submittedAt
                )}
              </span>
            </div>
            <div>
              <FaClock />
              <span>
                {formatSubmissionTime(
                  submission.submittedAt
                )}
              </span>
            </div>
          </div>
        </section>
        {/* ===================================================
            SCORE SECTION
        =================================================== */}
        {canViewScore && (
          <section className="form-result-score-section">
            <div className="form-result-score-card">
              <div className="form-result-score-decoration"></div>
              <div className="form-result-score-icon">
                <FaTrophy />
              </div>
              <div className="form-result-score-content">
                <span>
                  Your Score
                </span>
                <div className="form-result-score-number">
                  <strong>
                    {score}
                  </strong>
                  <small>
                    / {maxScore}
                  </small>
                </div>
                <p>
                  Total points earned from all scored questions.
                </p>
              </div>
              <div className="form-result-score-percentage">
                <strong>
                  {percentage}%
                </strong>
                <span>
                  Score
                </span>
              </div>
            </div>
            <div className="form-result-score-stats">
              <article className="form-result-mini-stat correct">
                <div>
                  <FaCheck />
                </div>
                <span>
                  Correct
                </span>
                <strong>
                  {correctCount}
                </strong>
              </article>
              <article className="form-result-mini-stat incorrect">
                <div>
                  <FaTimes />
                </div>
                <span>
                  Incorrect
                </span>
                <strong>
                  {incorrectCount}
                </strong>
              </article>
              <article className="form-result-mini-stat answered">
                <div>
                  <FaClipboardCheck />
                </div>
                <span>
                  Answered
                </span>
                <strong>
                  {answeredCount}
                  /
                  {questions.length}
                </strong>
              </article>
            </div>
          </section>
        )}
        {/* ===================================================
            REVIEW HEADING
        =================================================== */}
        <section className="form-result-review-heading">
          <div>
            <span>
              Answer Review
            </span>
            <h2>
              Your Responses
            </h2>
            <p>
              {canViewScore
                ? "Questions answered incorrectly are highlighted in red. Correct answers remain highlighted positively."
                : "This page only shows the questions and answers you submitted. Correctness and score are hidden."
              }
            </p>
          </div>
          <span className="form-result-question-count">
            {questions.length}
            {" "}
            Questions
          </span>
        </section>
        {/* ===================================================
            QUESTION LIST
        =================================================== */}
        <section className="form-result-question-list">
          {questionResults.map(
            (
              item,
              index
            ) => {
              const question =
                item.question;
              const userAnswer =
                item.userAnswer;
              const correctAnswer =
                item.correctAnswer;
              const isCorrect =
                item.isCorrect;
              const maxPoints =
                Number(
                  item.maxPoints
                ) ||
                0;
              const earnedPoints =
                Number(
                  item.earnedPoints
                ) ||
                0;
              const incorrect =
                canViewScore &&
                isCorrect ===
                  false;
              const correct =
                canViewScore &&
                isCorrect ===
                  true;
              return (
                <article
                  key={
                    item.questionId
                  }
                  className={[
                    "form-result-question-card",
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
                  {/* =========================================
                      QUESTION TOP
                  ========================================= */}
                  <div className="form-result-question-top">
                    <div className="form-result-question-number">
                      {index + 1}
                    </div>
                    <div className="form-result-question-type">
                      {getQuestionTypeIcon(
                        question.type
                      )}
                      <span>
                        {getQuestionTypeLabel(
                          question.type
                        )}
                      </span>
                    </div>
                    {canViewScore &&
                    isCorrect !==
                      null && (
                      <span
                        className={
                          isCorrect
                            ? "form-result-correctness correct"
                            : "form-result-correctness incorrect"
                        }
                      >
                        {isCorrect ? (
                          <>
                            <FaCheckCircle />
                            Correct
                          </>
                        ) : (
                          <>
                            <FaTimes />
                            Incorrect
                          </>
                        )}
                      </span>
                    )}
                  </div>
                  {/* =========================================
                      QUESTION CONTENT
                  ========================================= */}
                  <div className="form-result-question-body">
                    <h3>
                      {question.title ||
                      question.question ||
                      `Question ${index + 1}`}
                    </h3>
                    {question.image && (
                      <div className="form-result-question-image">
                        <img
                          src={
                            question.image
                          }
                          alt={
                            question.imageName ||
                            `Question ${index + 1}`
                          }
                        />
                      </div>
                    )}
                    {/* =======================================
                        USER ANSWER
                    ======================================= */}
                    <div
                      className={[
                        "form-result-answer-box",
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
                      <span className="form-result-answer-label">
                        Your Answer
                      </span>
                      <div className="form-result-answer-value">
                        {hasAnswerValue(
                          userAnswer
                        ) ? (
                          <>
                            {correct && (
                              <FaCheckCircle />
                            )}
                            {incorrect && (
                              <FaTimes />
                            )}
                            <strong>
                              {normalizeAnswerText(
                                userAnswer
                              )}
                            </strong>
                          </>
                        ) : (
                          <span className="form-result-no-answer">
                            No answer submitted
                          </span>
                        )}
                      </div>
                    </div>
                    {/* =======================================
                        CORRECT ANSWER
                        Hanya muncul:
                        - mode score
                        - jawaban user salah
                    ======================================= */}
                    {canViewScore &&
                    incorrect &&
                    hasAnswerValue(
                      correctAnswer
                    ) && (
                      <div className="form-result-correct-answer-box">
                        <span>
                          Correct Answer
                        </span>
                        <div>
                          <FaCheckCircle />
                          <strong>
                            {normalizeAnswerText(
                              correctAnswer
                            )}
                          </strong>
                        </div>
                      </div>
                    )}
                  </div>
                  {/* =========================================
                      QUESTION FOOTER
                  ========================================= */}
                  <div className="form-result-question-footer">
                    <span>
                      {question.required !==
                      false
                        ? "Required question"
                        : "Optional question"
                      }
                    </span>
                    {canViewScore &&
                    item.scoringEnabled &&
                    maxPoints >
                      0 && (
                      <strong
                        className={
                          incorrect
                            ? "score incorrect"
                            : "score"
                        }
                      >
                        {earnedPoints}
                        /
                        {maxPoints}
                        {" "}
                        pts
                      </strong>
                    )}
                  </div>
                </article>
              );
            }
          )}
        </section>
        {/* ===================================================
            BOTTOM ACTIONS
        =================================================== */}
        <section className="form-result-bottom-actions">
          <button
            type="button"
            className="form-result-history-btn"
            onClick={
              goBack
            }
          >
            <FaArrowLeft />
            <span>
              Back to History
            </span>
          </button>
          <button
            type="button"
            className="form-result-home-btn"
            onClick={
              goHome
            }
          >
            <FaHome />
            <span>
              Back to Home
            </span>
            <FaArrowRight />
          </button>
        </section>
      </main>
    </div>
  );
}
export default FormResult;