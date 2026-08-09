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

    title:
      "Survey Kepuasan Mahasiswa 2024",

    description:
      "Overview of respondent performance and form analytics.",

    type:
      "Survey",

    responses:
      0,

    questions: [

      {
        id:
          "survey-1",

        title:
          "Bagaimana pendapat Anda mengenai fasilitas kampus?",

        type:
          "multiple",

        options: [
          "Sangat Baik",
          "Baik",
          "Cukup",
          "Kurang",
        ],
      },

      {
        id:
          "survey-2",

        title:
          "Apakah pelayanan administrasi sudah memuaskan?",

        type:
          "multiple",

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

    title:
      "Quiz Pemrograman Mobile - Flutter",

    description:
      "Overview of quiz responses and respondent performance.",

    type:
      "Quiz",

    responses:
      0,

    questions: [

      {
        id:
          "flutter-1",

        title:
          "Widget apakah yang digunakan untuk membuat layout vertikal di Flutter?",

        type:
          "multiple",

        options: [
          "Row",
          "Column",
          "Stack",
          "ListView",
        ],
      },

      {
        id:
          "flutter-2",

        title:
          "Perhatikan gambar berikut kemudian pilih jawaban yang benar.",

        type:
          "multiple",

        options: [
          "Jawaban A",
          "Jawaban B",
          "Jawaban C",
          "Jawaban D",
        ],
      },

      {
        id:
          "flutter-3",

        title:
          "Apa fungsi utama dari Scaffold pada Flutter?",

        type:
          "multiple",

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

    title:
      "Form Pendaftaran Event Hackathon",

    description:
      "Overview of registration responses and participant activity.",

    type:
      "Registration",

    responses:
      0,

    questions: [

      {
        id:
          "hackathon-1",

        title:
          "Apakah Anda bersedia mengikuti seluruh rangkaian acara?",

        type:
          "yesno",

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
    question.grading?.correctAnswer ??
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

      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

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

      hour:
        "2-digit",

      minute:
        "2-digit",

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


        const scoringEnabled =
          storedResult?.scoring ===
            true ||
          storedResult?.grading?.enabled ===
            true ||
          question.grading?.enabled ===
            true ||
          question.scoring ===
            true ||
          hasCorrectAnswer;


        const maxPoints =
          scoringEnabled
            ? Math.max(
                Number(
                  storedResult?.maxPoints ??
                  storedResult?.points ??
                  storedResult?.grading?.points ??
                  question.grading?.points ??
                  question.points
                ) ||
                1,
                0
              )
            : 0;


        const earnedPoints =
          storedResult?.earnedPoints !==
            undefined
            ? Number(
                storedResult.earnedPoints
              ) ||
              0
            : (
                scoringEnabled &&
                isCorrect ===
                  true
                  ? maxPoints
                  : 0
              );


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


            const hasStoredScore =
              submission.score !==
                undefined &&
              submission.score !==
                null &&
              submission.score !==
                "";


            const hasStoredMaxScore =
              submission.maxScore !==
                undefined &&
              submission.maxScore !==
                null &&
              submission.maxScore !==
                "";


            const storedScore =
              hasStoredScore
                ? Number(
                    submission.score
                  )
                : Number.NaN;


            const storedMaxScore =
              hasStoredMaxScore
                ? Number(
                    submission.maxScore
                  )
                : Number.NaN;


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


            const hasStoredPercentage =
              submission.percentage !==
                undefined &&
              submission.percentage !==
                null &&
              submission.percentage !==
                "";


            let percentage =
              hasStoredPercentage
                ? Number(
                    submission.percentage
                  )
                : Number.NaN;


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


            if (
              Number.isFinite(
                percentage
              )
            ) {

              percentage =
                Math.min(
                  Math.max(
                    Math.round(
                      percentage
                    ),
                    0
                  ),
                  100
                );

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
            label:
              "90–100%",

            description:
              "Excellent",

            minimum:
              90,

            maximum:
              100,

            color:
              "green",
          },

          {
            label:
              "75–89%",

            description:
              "Good",

            minimum:
              75,

            maximum:
              89,

            color:
              "blue",
          },

          {
            label:
              "60–74%",

            description:
              "Fair",

            minimum:
              60,

            maximum:
              74,

            color:
              "orange",
          },

          {
            label:
              "< 60%",

            description:
              "Needs improvement",

            minimum:
              0,

            maximum:
              59,

            color:
              "gray",
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

    setSelectedRespondent(
      respondent
    );


    document.body.style.overflow =
      "hidden";

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
  // EXPORT EXCEL / CSV
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
          "Belum ada respons yang dapat diekspor."
        );

        return;

      }


      const questionList =
        Array.isArray(
          form?.questions
        )
          ? form.questions
          : [];


      const headers = [

        "No",

        "Respondent",

        "Email",

        "Submission Date",

        "Submission Time",

        "Score",

        "Percentage",

        ...questionList.map(
          (
            question,
            index
          ) =>
            question.title ||
            question.question ||
            `Question ${index + 1}`
        ),

      ];


      const rows =
        respondents.map(
          (
            respondent,
            index
          ) => [

            index +
              1,

            respondent.name,

            respondent.email,

            respondent.date,

            respondent.time,

            respondent.maxScore >
              0
              ? `${respondent.score}/${respondent.maxScore}`
              : "Not scored",

            Number.isFinite(
              respondent.percentage
            )
              ? `${respondent.percentage}%`
              : "Not scored",

            ...questionList.map(
              (
                question
              ) =>
                normalizeAnswer(
                  respondent.answers[
                    question.id
                  ]
                )
            ),

          ]
        );


      const csvContent = [

        headers
          .map(
            escapeCsvValue
          )
          .join(","),

        ...rows.map(
          (
            row
          ) =>
            row
              .map(
                escapeCsvValue
              )
              .join(",")
        ),

      ].join(
        "\n"
      );


      const blob =
        new Blob(
          [
            "\uFEFF",
            csvContent,
          ],
          {
            type:
              "text/csv;charset=utf-8;",
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
        `${safeTitle || "hidocs-form"}-responses.csv`;


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
          "Belum ada respons yang dapat diekspor."
        );

        return;

      }


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


      window.print();

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
              length:
                12,
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
                      Download as CSV
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
                            width:
                              `${item.value}%`,
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
                            respondent.percentage
                          )}`
                        }
                      >
                        <span>
                          Score
                        </span>

                        <strong>
                          {Number.isFinite(
                            respondent.percentage
                          )
                            ? `${respondent.percentage}%`
                            : "—"
                          }
                        </strong>
                      </div>


                      <button
                        type="button"
                        className="respondent-view-answers-btn"
                        onClick={() =>
                          openRespondentAnswers(
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

                  {Number.isFinite(
                    selectedRespondent.percentage
                  )
                    ? `${selectedRespondent.percentage}%`
                    : "—"
                  }

                </div>

              </div>

            )}



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
                Internal grading is visible to administrators only and is independent from the respondent result setting.
              </span>

              <button
                type="button"
                onClick={
                  closeRespondentAnswers
                }
              >

                Close

              </button>

            </div>


          </section>

        </div>

      )}


    </div>

  );

}


export default AdminResults;