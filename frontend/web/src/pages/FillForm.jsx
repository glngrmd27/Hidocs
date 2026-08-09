import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaExclamationTriangle,
  FaInfinity,
  FaStar,
} from "react-icons/fa";

import {
  ThemeContext,
} from "../context/ThemeContext";

import {
  FormContext,
} from "../context/FormContext";

import logo from "../assets/images/logo.png";

import "../assets/css/FillForm.css";


// =========================================================
// STORAGE KEYS
// =========================================================

const FORMS_STORAGE_KEY =
  "hidocs_forms";

const DELETED_FORMS_STORAGE_KEY =
  "hidocs_deleted_forms";


// =========================================================
// TIMER LIMIT
// =========================================================

const MIN_TIMER_MINUTES =
  1;

const MAX_TIMER_MINUTES =
  1000;


// =========================================================
// DEFAULT FORMS
// =========================================================

const defaultForms = [

  {
    id:
      1,

    title:
      "Survey Kepuasan Mahasiswa 2024",

    category:
      "Survey",

    active:
      true,

    settings: {

      oneTimeOnly:
        true,

      timer: {

        enabled:
          true,

        duration:
          20,

      },

    },

    questions: [

      {
        id:
          "survey-1",

        title:
          "Bagaimana pendapat Anda mengenai fasilitas kampus?",

        type:
          "multiple",

        required:
          true,

        image:
          "",

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

        required:
          true,

        image:
          "",

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
    id:
      2,

    title:
      "Quiz Pemrograman Mobile - Flutter",

    category:
      "Quiz",

    active:
      true,

    settings: {

      oneTimeOnly:
        true,

      timer: {

        enabled:
          true,

        duration:
          30,

      },

    },

    questions: [

      {
        id:
          "flutter-1",

        title:
          "Widget apakah yang digunakan untuk membuat layout vertikal di Flutter?",

        type:
          "multiple",

        required:
          true,

        image:
          "",

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

        required:
          true,

        image:
          "https://picsum.photos/800/420",

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

        required:
          true,

        image:
          "",

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
    id:
      3,

    title:
      "Form Pendaftaran Event Hackathon",

    category:
      "Registration",

    active:
      true,

    settings: {

      oneTimeOnly:
        true,

      timer: {

        enabled:
          true,

        duration:
          15,

      },

    },

    questions: [

      {
        id:
          "hackathon-1",

        title:
          "Apakah Anda bersedia mengikuti seluruh rangkaian acara?",

        type:
          "yesno",

        required:
          true,

        image:
          "",

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
// ANSWER CHECKER
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
      value.trim()
        .length >
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
// SHUFFLE HELPER
// =========================================================

const shuffleArray = (
  items
) => {

  const result = [
    ...items,
  ];


  for (
    let index =
      result.length -
      1;
    index >
      0;
    index -=
      1
  ) {

    const randomIndex =
      Math.floor(
        Math.random() *
        (
          index +
          1
        )
      );


    [
      result[index],
      result[randomIndex],
    ] = [
      result[randomIndex],
      result[index],
    ];

  }


  return result;

};


// =========================================================
// SCHEDULE HELPERS
// =========================================================

const buildScheduleDateTime = (
  dateValue,
  timeValue,
  defaultTime
) => {

  if (!dateValue) {

    return "";

  }


  const safeTime =
    timeValue ||
    defaultTime;


  return `${dateValue}T${safeTime}:00`;

};


const parseDateTime = (
  value
) => {

  if (!value) {

    return null;

  }


  const date =
    new Date(
      value
    );


  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date;

};


const formatAvailabilityDateTime = (
  value
) => {

  const date =
    parseDateTime(
      value
    );


  if (!date) {

    return "";

  }


  return new Intl.DateTimeFormat(
    "id-ID",
    {
      day:
        "2-digit",

      month:
        "long",

      year:
        "numeric",

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(
    date
  );

};


const getFormSchedule = (
  form
) => {

  const settings =
    form.settings &&
    typeof form.settings ===
      "object"
      ? form.settings
      : {};


  const scheduleObject =
    form.schedule &&
    typeof form.schedule ===
      "object"
      ? form.schedule
      : {};


  const settingsSchedule =
    settings.schedule &&
    typeof settings.schedule ===
      "object"
      ? settings.schedule
      : {};


  const openAt =
    form.openAt ||
    scheduleObject.openAt ||
    settings.openAt ||
    settingsSchedule.openAt ||
    buildScheduleDateTime(
      form.openDate,
      form.openTime,
      "00:00"
    );


  let closeAt =
    form.closeAt ||
    scheduleObject.closeAt ||
    settings.closeAt ||
    settingsSchedule.closeAt ||
    buildScheduleDateTime(
      form.closeDate,
      form.closeTime,
      "23:59"
    );


  const responseDays =
    Number(
      form.responseDays ??
      settings.responseDays
    );


  /*
    Response availability dipakai sebagai fallback jika admin
    tidak menentukan Close Date secara manual.
  */

  if (
    !closeAt &&
    Number.isFinite(
      responseDays
    ) &&
    responseDays >
      0
  ) {

    const startingDate =
      parseDateTime(
        openAt
      ) ||
      parseDateTime(
        form.createdAt
      );


    if (startingDate) {

      const automaticClose =
        new Date(
          startingDate
        );


      automaticClose.setDate(
        automaticClose.getDate() +
        responseDays
      );


      closeAt =
        automaticClose.toISOString();

    }

  }


  const activationMode =
    form.activationMode ||
    settings.activationMode ||
    (
      settings.activateImmediately ===
      false
        ? "scheduled"
        : "immediate"
    );


  const enabled =
    Boolean(
      form.schedule?.enabled ??
      settings.scheduleEnabled ??
      settings.schedule?.enabled ??
      Boolean(
        openAt ||
        closeAt ||
        activationMode ===
          "scheduled"
      )
    );


  return {

    enabled,

    activationMode,

    openAt,

    closeAt,

  };

};


const getFormAvailability = (
  form,
  currentTime = new Date()
) => {

  const schedule =
    getFormSchedule(
      form
    );


  const now =
    currentTime instanceof Date
      ? currentTime
      : new Date(
          currentTime
        );


  if (
    form.active ===
    false
  ) {

    return {

      status:
        "inactive",

      canFill:
        false,

      openAt:
        schedule.openAt,

      closeAt:
        schedule.closeAt,

      message:
        "Form ini sedang dinonaktifkan oleh admin.",

    };

  }


  const openDate =
    parseDateTime(
      schedule.openAt
    );


  const closeDate =
    parseDateTime(
      schedule.closeAt
    );


  if (
    schedule.activationMode ===
      "scheduled" &&
    !openDate
  ) {

    return {

      status:
        "not-open",

      canFill:
        false,

      openAt:
        schedule.openAt,

      closeAt:
        schedule.closeAt,

      message:
        "Form ini belum dibuka oleh admin.",

    };

  }


  if (
    openDate &&
    now <
      openDate
  ) {

    return {

      status:
        "not-open",

      canFill:
        false,

      openAt:
        schedule.openAt,

      closeAt:
        schedule.closeAt,

      message:
        `Form belum dibuka. Form dapat dikerjakan mulai ${formatAvailabilityDateTime(
          schedule.openAt
        )}.`,

    };

  }


  if (
    closeDate &&
    now >
      closeDate
  ) {

    return {

      status:
        "closed",

      canFill:
        false,

      openAt:
        schedule.openAt,

      closeAt:
        schedule.closeAt,

      message:
        `Form sudah ditutup pada ${formatAvailabilityDateTime(
          schedule.closeAt
        )}.`,

    };

  }


  return {

    status:
      "open",

    canFill:
      true,

    openAt:
      schedule.openAt,

    closeAt:
      schedule.closeAt,

    message:
      "",

  };

};


// =========================================================
// SCORE HELPERS
// =========================================================

const normalizeComparableAnswer = (
  value
) => {

  if (
    value ===
      undefined ||
    value ===
      null
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
            item
          )
            .trim()
            .toLowerCase()
      )
      .sort()
      .join(
        "|"
      );

  }


  return String(
    value
  )
    .trim()
    .toLowerCase();

};


const calculateFormScore = (
  questions,
  answers
) => {

  let score =
    0;

  let maxScore =
    0;

  let correctAnswers =
    0;

  let incorrectAnswers =
    0;

  let scoredQuestions =
    0;


  /*
    IMPORTANT:

    Penilaian ini merupakan INTERNAL GRADING untuk admin.
    Perhitungan tetap dilakukan walaupun resultMode user adalah:

    - none
    - result
    - score

    resultMode hanya menentukan apa yang boleh dilihat user.
    Ia TIDAK menentukan apakah jawaban user dinilai atau tidak.
  */

  const questionResults =
    questions.map(
      (
        question
      ) => {

        const grading =
          question.grading &&
          typeof question.grading ===
            "object"
            ? question.grading
            : {};


        const scoringEnabled =
          Boolean(
            question.scoring ??
            grading.enabled
          );


        const respondentAnswer =
          answers[
            question.id
          ];


        const hasRespondentAnswer =
          hasAnswerValue(
            respondentAnswer
          );


        const rawCorrectAnswer =
          question.correctAnswer ??
          grading.correctAnswer ??
          "";


        const normalizedCorrectAnswer =
          normalizeComparableAnswer(
            rawCorrectAnswer
          );


        const normalizedRespondentAnswer =
          normalizeComparableAnswer(
            respondentAnswer
          );


        const points =
          scoringEnabled
            ? Math.max(
                Number(
                  question.points ??
                  grading.points
                ) ||
                0,
                0
              )
            : 0;


        const hasCorrectAnswer =
          Boolean(
            normalizedCorrectAnswer
          );


        let isCorrect =
          null;


        if (
          scoringEnabled &&
          points >
            0 &&
          hasCorrectAnswer
        ) {

          isCorrect =
            hasRespondentAnswer &&
            normalizedRespondentAnswer ===
              normalizedCorrectAnswer;


          scoredQuestions +=
            1;


          maxScore +=
            points;


          if (
            isCorrect
          ) {

            score +=
              points;


            correctAnswers +=
              1;

          } else {

            incorrectAnswers +=
              1;

          }

        }


        const earnedPoints =
          isCorrect ===
            true
            ? points
            : 0;


        return {

          questionId:
            question.id,

          questionNumber:
            question.number ??
            null,

          questionTitle:
            question.title ||
            question.question ||
            "",

          questionType:
            question.type ||
            "short",

          userAnswer:
            respondentAnswer,

          correctAnswer:
            rawCorrectAnswer,

          scoring:
            scoringEnabled,

          scoringEnabled,

          isCorrect,

          points,

          maxPoints:
            points,

          earnedPoints,

          answered:
            hasRespondentAnswer,

        };

      }
    );


  const percentage =
    maxScore >
      0
      ? Math.round(
          (
            score /
            maxScore
          ) *
          100
        )
      : 0;


  return {

    score,

    maxScore,

    percentage,

    correctAnswers,

    incorrectAnswers,

    scoredQuestions,

    questionResults,

    gradingEnabled:
      scoredQuestions >
      0,

  };

};


// =========================================================
// NORMALIZE QUESTION
// =========================================================

const normalizeQuestion = (
  question,
  index
) => {

  const questionType =
    question.type ||
    (
      Array.isArray(
        question.options
      ) &&
      question.options.length >
        0
        ? "multiple"
        : "short"
    );


  // =========================================================
  // NORMAL OPTIONS
  // =========================================================

  let questionOptions =
    Array.isArray(
      question.options
    )
      ? question.options
          .map(
            (
              option
            ) =>
              String(
                option ??
                ""
              ).trim()
          )
          .filter(
            Boolean
          )
      : [];


  if (
    questionType ===
      "yesno" &&
    questionOptions.length ===
      0
  ) {

    questionOptions = [
      "Yes",
      "No",
    ];

  }


  // =========================================================
  // IMAGE ANSWER TYPE
  // =========================================================

  let imageAnswerType =
    String(
      question.imageAnswerType ||
      ""
    )
      .trim()
      .toLowerCase();


  if (
    ![
      "multiple",
      "short",
      "long",
    ].includes(
      imageAnswerType
    )
  ) {

    /*
      Kompatibilitas dengan pertanyaan gambar lama.

      Jika terdapat imageOptions maka dianggap
      multiple choice.

      Jika tidak, default ke short answer.
    */

    if (
      Array.isArray(
        question.imageOptions
      ) &&
      question.imageOptions.length >
        0
    ) {

      imageAnswerType =
        "multiple";

    } else {

      imageAnswerType =
        "short";

    }

  }


  // =========================================================
  // IMAGE OPTIONS
  // =========================================================

  let imageOptions =
    Array.isArray(
      question.imageOptions
    )
      ? question.imageOptions
          .map(
            (
              option
            ) =>
              String(
                option ??
                ""
              ).trim()
          )
          .filter(
            Boolean
          )
      : [];


  /*
    Mendukung kemungkinan CreateForm menyimpan
    pilihan pertanyaan gambar di field options.
  */

  if (
    questionType ===
      "image" &&
    imageAnswerType ===
      "multiple" &&
    imageOptions.length ===
      0 &&
    questionOptions.length >
      0
  ) {

    imageOptions =
      questionOptions;

  }


  return {

    ...question,

    id:
      question.id ||
      `question-${index + 1}`,

    title:
      String(
        question.title ||
        question.question ||
        ""
      ).trim() ||
      `Question ${index + 1}`,

    type:
      questionType,

    required:
      question.required !==
      false,

    image:
      String(
        question.image ||
        ""
      ).trim(),

    imageName:
      String(
        question.imageName ||
        ""
      ).trim(),

    options:
      questionOptions,

    imageAnswerType,

    imageOptions,

    ratingMax:
      Math.min(
        Math.max(
          Number(
            question.ratingMax
          ) || 5,
          1
        ),
        10
      ),

    scoring:
      Boolean(
        question.scoring ??
        question.grading?.enabled
      ),

    points:
      Number(
        question.points ??
        question.grading?.points
      ) || 0,

    correctAnswer:
      String(
        question.correctAnswer ??
        question.grading?.correctAnswer ??
        ""
      ).trim(),

    grading: {

      ...(
        question.grading &&
        typeof question.grading ===
          "object"
          ? question.grading
          : {}
      ),

      enabled:
        Boolean(
          question.scoring ??
          question.grading?.enabled
        ),

      points:
        Number(
          question.points ??
          question.grading?.points
        ) || 0,

      correctAnswer:
        String(
          question.correctAnswer ??
          question.grading?.correctAnswer ??
          ""
        ).trim(),

    },

  };

};


// =========================================================
// NORMALIZE TIMER
// =========================================================

const normalizeTimer = (
  form
) => {

  const timerSetting =
    form.settings?.timer &&
    typeof form.settings.timer ===
      "object"
      ? form.settings.timer
      : {};


  const timerEnabled =
    form.timerEnabled ??
    form.settings?.timerEnabled ??
    timerSetting.enabled ??
    Boolean(
      form.duration
    );


  const rawDuration =
    Number(
      form.timerDuration ??
      form.settings?.timerDuration ??
      timerSetting.duration ??
      form.duration ??
      20
    );


  const duration =
    Number.isFinite(
      rawDuration
    )
      ? Math.min(
          Math.max(
            Math.floor(
              rawDuration
            ),
            MIN_TIMER_MINUTES
          ),
          MAX_TIMER_MINUTES
        )
      : 20;


  return {

    enabled:
      Boolean(
        timerEnabled
      ),

    duration,

  };

};


// =========================================================
// NORMALIZE FORM
// =========================================================

const normalizeForm = (
  form
) => {

  const timer =
    normalizeTimer(
      form
    );


  const settings =
    form.settings &&
    typeof form.settings ===
      "object"
      ? form.settings
      : {};


  let questions =
    Array.isArray(
      form.questions
    )
      ? form.questions.map(
          normalizeQuestion
        )
      : [];


  /*
    Shuffle answer options dilakukan satu kali ketika form
    dimuat sehingga urutan tidak berubah setiap re-render.
  */

  if (
    settings.shuffleAnswers
  ) {

    questions =
      questions.map(
        (
          question
        ) => {

          if (
            question.type ===
              "multiple"
          ) {

            return {

              ...question,

              options:
                shuffleArray(
                  question.options
                ),

            };

          }


          if (
            question.type ===
              "image" &&
            question.imageAnswerType ===
              "multiple"
          ) {

            return {

              ...question,

              imageOptions:
                shuffleArray(
                  question.imageOptions
                ),

            };

          }


          return question;

        }
      );

  }


  /*
    Shuffle question order juga dilakukan satu kali saat form
    dibuka. ID pertanyaan tetap sama sehingga jawaban aman.
  */

  if (
    settings.shuffleQuestions
  ) {

    questions =
      shuffleArray(
        questions
      );

  }


  const schedule =
    getFormSchedule(
      form
    );


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

    category:
      form.category ||
      form.type ||
      "Form",

    active:
      form.active !==
      false,

    oneTimeOnly:
      settings.oneTimeOnly !==
      false,

    shuffleQuestions:
      Boolean(
        settings.shuffleQuestions
      ),

    shuffleAnswers:
      Boolean(
        settings.shuffleAnswers
      ),

    resultMode:
      settings.resultMode ||
      form.resultMode ||
      "none",

    timerEnabled:
      timer.enabled,

    timerDuration:
      timer.duration,

    schedule,

    questions,

  };

};


// =========================================================
// FILL FORM
// =========================================================

function FillForm() {

  const navigate =
    useNavigate();


  const {
    id,
  } = useParams();


  const {
    submitForm,
    submittedForms = [],
  } = useContext(
    FormContext
  );


  const {
    darkMode,
  } = useContext(
    ThemeContext
  );


  // =========================================================
  // LIVE SCHEDULE / STORAGE VERSION
  // =========================================================

  const [
    currentTime,
    setCurrentTime,
  ] = useState(
    new Date()
  );


  const [
    formVersion,
    setFormVersion,
  ] = useState(
    0
  );


  // =========================================================
  // LOAD SELECTED FORM
  // =========================================================

  const form =
    useMemo(
      () => {

        const storedForms =
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

          ...storedForms,

        ];


        /*
          Reverse dipakai agar form terbaru
          dari localStorage diprioritaskan.
        */

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


        if (
          !selectedForm
        ) {

          return null;

        }


        return normalizeForm(
          selectedForm
        );

      },
      [
        id,
        formVersion,
      ]
    );


  // =========================================================
  // FORM STATE
  // =========================================================

  const [
    currentQuestion,
    setCurrentQuestion,
  ] = useState(
    0
  );


  const [
    answers,
    setAnswers,
  ] = useState(
    {}
  );


  const [
    timeLeft,
    setTimeLeft,
  ] = useState(
    form?.timerEnabled
      ? form.timerDuration *
        60
      : 0
  );


  const [
    showAnswerWarning,
    setShowAnswerWarning,
  ] = useState(
    false
  );


  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(
    false
  );


  const [
    timerExpired,
    setTimerExpired,
  ] = useState(
    false
  );


  const hasSubmittedRef =
    useRef(
      false
    );


  const answersRef =
    useRef(
      {}
    );


  // =========================================================
  // UPDATE CURRENT TIME
  //
  // Status jadwal diperiksa ulang secara berkala supaya form
  // otomatis berubah dari Not Open -> Open -> Closed tanpa
  // refresh halaman manual.
  // =========================================================

  useEffect(
    () => {

      const interval =
        window.setInterval(
          () => {

            setCurrentTime(
              new Date()
            );

          },
          15000
        );


      return () => {

        window.clearInterval(
          interval
        );

      };

    },
    []
  );


  // =========================================================
  // REFRESH FORM AFTER ADMIN CHANGES
  //
  // storage       = perubahan dari tab lain
  // custom event  = perubahan admin pada tab yang sama
  // focus/visible = sinkronisasi saat user kembali ke halaman
  // =========================================================

  useEffect(
    () => {

      const refreshForm =
        () => {

          setFormVersion(
            (
              previous
            ) =>
              previous +
              1
          );


          setCurrentTime(
            new Date()
          );

        };


      const handleStorageChange =
        (
          event
        ) => {

          if (
            event.key ===
              FORMS_STORAGE_KEY ||
            event.key ===
              DELETED_FORMS_STORAGE_KEY
          ) {

            refreshForm();

          }

        };


      const handleVisibilityChange =
        () => {

          if (
            document.visibilityState ===
            "visible"
          ) {

            refreshForm();

          }

        };


      window.addEventListener(
        "storage",
        handleStorageChange
      );


      window.addEventListener(
        "focus",
        refreshForm
      );


      window.addEventListener(
        "hidocs-forms-updated",
        refreshForm
      );


      window.addEventListener(
        "hidocsFormsUpdated",
        refreshForm
      );


      document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
      );


      return () => {

        window.removeEventListener(
          "storage",
          handleStorageChange
        );


        window.removeEventListener(
          "focus",
          refreshForm
        );


        window.removeEventListener(
          "hidocs-forms-updated",
          refreshForm
        );


        window.removeEventListener(
          "hidocsFormsUpdated",
          refreshForm
        );


        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );

      };

    },
    []
  );


  // =========================================================
  // KEEP LATEST ANSWERS
  // =========================================================

  useEffect(
    () => {

      answersRef.current =
        answers;

    },
    [
      answers,
    ]
  );


  // =========================================================
  // FORM INFORMATION
  // =========================================================

  const availability =
    useMemo(
      () => {

        if (!form) {

          return {
            status:
              "unavailable",

            canFill:
              false,

            message:
              "",
          };

        }


        return getFormAvailability(
          form,
          currentTime
        );

      },
      [
        form,
        currentTime,
      ]
    );


  const canFillForm =
    Boolean(
      form &&
      availability.canFill
    );


  const questions =
    form?.questions ||
    [];


  const totalQuestions =
    questions.length;


  const question =
    questions[
      currentQuestion
    ];


  const currentAnswer =
    question
      ? answers[
          question.id
        ]
      : undefined;


  const currentQuestionAnswered =
    hasAnswerValue(
      currentAnswer
    );


  const isLastQuestion =
    currentQuestion ===
    totalQuestions -
      1;


  const progress =
    totalQuestions >
    0
      ? (
          (
            currentQuestion +
            1
          ) /
          totalQuestions
        ) *
        100
      : 0;


  const answeredQuestionCount =
    useMemo(
      () => {

        return Object.values(
          answers
        ).filter(
          hasAnswerValue
        ).length;

      },
      [
        answers,
      ]
    );


  // =========================================================
  // CHECK PREVIOUS SUBMISSION
  // =========================================================

  const alreadySubmitted =
    useMemo(
      () => {

        if (!form) {

          return false;

        }


        return submittedForms.some(
          (
            submittedForm
          ) => {

            const submittedFormId =
              submittedForm.formId ??
              submittedForm.id;


            return (
              String(
                submittedFormId
              ) ===
              String(
                form.id
              )
            );

          }
        );

      },
      [
        form,
        submittedForms,
      ]
    );


  // =========================================================
  // REDIRECT INVALID OR PREVIOUSLY SUBMITTED FORM
  // =========================================================

  useEffect(
    () => {

      if (!form) {

        navigate(
          "/dashboard",
          {
            replace:
              true,
          }
        );

        return;

      }


      if (
        form.oneTimeOnly &&
        alreadySubmitted &&
        !hasSubmittedRef.current
      ) {

        navigate(
          "/history",
          {
            replace:
              true,
          }
        );

      }

    },
    [
      form,
      alreadySubmitted,
      navigate,
    ]
  );


  // =========================================================
  // RESET FORM STATE WHEN FORM CHANGES
  // =========================================================

  useEffect(
    () => {

      if (!form) {

        return;

      }


      hasSubmittedRef.current =
        false;


      answersRef.current =
        {};


      setAnswers(
        {}
      );


      setCurrentQuestion(
        0
      );


      setShowAnswerWarning(
        false
      );


      setIsSubmitting(
        false
      );


      setTimerExpired(
        false
      );


      setTimeLeft(
        form.timerEnabled
          ? form.timerDuration *
            60
          : 0
      );

    },
    [
      form?.id,
      form?.timerEnabled,
      form?.timerDuration,
    ]
  );


  // =========================================================
  // COMPLETE NORMAL SUBMISSION
  // =========================================================

  const completeSubmission =
    useCallback(
      () => {

        if (
          hasSubmittedRef.current ||
          !form ||
          !canFillForm ||
          isSubmitting
        ) {

          return;

        }


        hasSubmittedRef.current =
          true;


        setIsSubmitting(
          true
        );


        try {

          const submittedAt =
            new Date()
              .toISOString();


          const scoreResult =
            calculateFormScore(
              questions,
              answersRef.current
            );


          const result =
            submitForm({

              formId:
                form.id,

              title:
                form.title,

              answers:
                answersRef.current,

              answeredQuestions:
                Object.values(
                  answersRef.current
                ).filter(
                  hasAnswerValue
                ).length,

              totalQuestions,

              status:
                "completed",

              isTimeExpired:
                false,

              submittedAt,

              resultMode:
                form.resultMode,

              score:
                scoreResult.score,

              maxScore:
                scoreResult.maxScore,

              percentage:
                scoreResult.percentage,

              correctAnswers:
                scoreResult.correctAnswers,

              scoredQuestions:
                scoreResult.scoredQuestions,

              incorrectAnswers:
                scoreResult.incorrectAnswers,

              questionResults:
                scoreResult.questionResults,

              gradingEnabled:
                scoreResult.gradingEnabled,

              grading: {

                enabled:
                  scoreResult.gradingEnabled,

                score:
                  scoreResult.score,

                maxScore:
                  scoreResult.maxScore,

                percentage:
                  scoreResult.percentage,

                correctAnswers:
                  scoreResult.correctAnswers,

                incorrectAnswers:
                  scoreResult.incorrectAnswers,

                scoredQuestions:
                  scoreResult.scoredQuestions,

              },

            });


          if (
            !result?.success
          ) {

            hasSubmittedRef.current =
              false;


            setIsSubmitting(
              false
            );


            alert(
              result?.message ||
              "Form gagal dikirim."
            );


            if (
              result?.message
                ?.toLowerCase()
                .includes(
                  "sudah"
                )
            ) {

              navigate(
                "/history",
                {
                  replace:
                    true,
                }
              );

            }


            return;

          }


          navigate(
            "/submit-success",
            {
              replace:
                true,

              state: {

                formId:
                  form.id,

                formTitle:
                  form.title,

                submittedAt,

                status:
                  "completed",

                resultMode:
                  form.resultMode,

                showResult:
                  form.resultMode ===
                    "result" ||
                  form.resultMode ===
                    "score",

                showScore:
                  form.resultMode ===
                  "score",

                score:
                  scoreResult.score,

                maxScore:
                  scoreResult.maxScore,

                percentage:
                  scoreResult.percentage,

                correctAnswers:
                  scoreResult.correctAnswers,

                scoredQuestions:
                  scoreResult.scoredQuestions,

                incorrectAnswers:
                  scoreResult.incorrectAnswers,

                questionResults:
                  scoreResult.questionResults,

                gradingEnabled:
                  scoreResult.gradingEnabled,

                answeredQuestions:
                  Object.values(
                    answersRef.current
                  ).filter(
                    hasAnswerValue
                  ).length,

                totalQuestions,

              },

            }
          );

        } catch (error) {

          console.error(
            "Gagal mengirim form:",
            error
          );


          hasSubmittedRef.current =
            false;


          setIsSubmitting(
            false
          );


          alert(
            "Terjadi kesalahan saat mengirim form. Silakan coba lagi."
          );

        }

      },
      [
        form,
        canFillForm,
        isSubmitting,
        navigate,
        questions,
        submitForm,
        totalQuestions,
      ]
    );


  // =========================================================
  // HANDLE TIMER EXPIRED
  // =========================================================

  const handleTimeExpired =
    useCallback(
      () => {

        if (
          hasSubmittedRef.current ||
          !form
        ) {

          return;

        }


        hasSubmittedRef.current =
          true;


        setTimerExpired(
          true
        );


        setIsSubmitting(
          true
        );


        const expiredAt =
          new Date()
            .toISOString();


        try {

          /*
            Walaupun waktu habis, jawaban yang sudah diisi tetap
            dinilai untuk kebutuhan admin. User tetap tidak otomatis
            mendapatkan akses nilai kecuali resultMode mengizinkannya.
          */

          const scoreResult =
            calculateFormScore(
              questions,
              answersRef.current
            );


          const result =
            submitForm({

              formId:
                form.id,

              title:
                form.title,

              answers:
                answersRef.current,

              answeredQuestions:
                Object.values(
                  answersRef.current
                ).filter(
                  hasAnswerValue
                ).length,

              totalQuestions,

              status:
                "time-expired",

              isTimeExpired:
                true,

              submittedAt:
                expiredAt,

              resultMode:
                form.resultMode,

              score:
                scoreResult.score,

              maxScore:
                scoreResult.maxScore,

              percentage:
                scoreResult.percentage,

              correctAnswers:
                scoreResult.correctAnswers,

              incorrectAnswers:
                scoreResult.incorrectAnswers,

              scoredQuestions:
                scoreResult.scoredQuestions,

              questionResults:
                scoreResult.questionResults,

              gradingEnabled:
                scoreResult.gradingEnabled,

              grading: {

                enabled:
                  scoreResult.gradingEnabled,

                score:
                  scoreResult.score,

                maxScore:
                  scoreResult.maxScore,

                percentage:
                  scoreResult.percentage,

                correctAnswers:
                  scoreResult.correctAnswers,

                incorrectAnswers:
                  scoreResult.incorrectAnswers,

                scoredQuestions:
                  scoreResult.scoredQuestions,

              },

            });


          if (
            !result?.success
          ) {

            console.error(
              "Gagal mencatat waktu habis:",
              result?.message
            );

          }


          navigate(
            "/history",
            {
              replace:
                true,

              state: {

                timeExpired:
                  true,

                formId:
                  form.id,

                formTitle:
                  form.title,

                submittedAt:
                  expiredAt,

              },

            }
          );

        } catch (error) {

          console.error(
            "Gagal menyimpan riwayat waktu habis:",
            error
          );


          navigate(
            "/history",
            {
              replace:
                true,

              state: {

                timeExpired:
                  true,

                formId:
                  form.id,

                formTitle:
                  form.title,

              },

            }
          );

        }

      },
      [
        form,
        navigate,
        questions,
        submitForm,
        totalQuestions,
      ]
    );


  // =========================================================
  // TIMER
  // =========================================================

  useEffect(
    () => {

      if (
        !form ||
        !form.timerEnabled ||
        !canFillForm ||
        alreadySubmitted ||
        isSubmitting ||
        hasSubmittedRef.current
      ) {

        return undefined;

      }


      const timer =
        window.setInterval(
          () => {

            setTimeLeft(
              (
                previousTime
              ) => {

                if (
                  previousTime <=
                  1
                ) {

                  window.clearInterval(
                    timer
                  );


                  window.setTimeout(
                    handleTimeExpired,
                    0
                  );


                  return 0;

                }


                return (
                  previousTime -
                  1
                );

              }
            );

          },
          1000
        );


      return () => {

        window.clearInterval(
          timer
        );

      };

    },
    [
      form,
      alreadySubmitted,
      isSubmitting,
      handleTimeExpired,
      canFillForm,
    ]
  );


  // =========================================================
  // FORMAT TIMER
  // =========================================================

  const timerMinutes =
    String(
      Math.floor(
        timeLeft /
        60
      )
    ).padStart(
      2,
      "0"
    );


  const timerSeconds =
    String(
      timeLeft %
      60
    ).padStart(
      2,
      "0"
    );


  const timerIsWarning =
    Boolean(
      form?.timerEnabled
    ) &&
    timeLeft <=
      300;


  // =========================================================
  // SAVE ANSWER
  // =========================================================

  const saveAnswer = (
    value
  ) => {

    if (
      !question ||
      !canFillForm ||
      isSubmitting ||
      timerExpired
    ) {

      return;

    }


    setAnswers(
      (
        previousAnswers
      ) => {

        const updatedAnswers = {

          ...previousAnswers,

          [question.id]:
            value,

        };


        answersRef.current =
          updatedAnswers;


        return updatedAnswers;

      }
    );


    setShowAnswerWarning(
      false
    );

  };


  // =========================================================
  // QUESTION NAVIGATION
  // =========================================================

  const goToQuestion = (
    index
  ) => {

    if (
      !canFillForm ||
      isSubmitting ||
      timerExpired ||
      index <
        0 ||
      index >=
        totalQuestions
    ) {

      return;

    }


    if (
      index >
        currentQuestion &&
      question?.required &&
      !currentQuestionAnswered
    ) {

      setShowAnswerWarning(
        true
      );


      return;

    }


    setCurrentQuestion(
      index
    );


    setShowAnswerWarning(
      false
    );


    window.scrollTo({

      top:
        0,

      left:
        0,

      behavior:
        "smooth",

    });

  };


  const nextQuestion =
    () => {

      if (
        !canFillForm ||
        isSubmitting ||
        timerExpired
      ) {

        return;

      }


      if (
        question?.required &&
        !currentQuestionAnswered
      ) {

        setShowAnswerWarning(
          true
        );


        return;

      }


      if (
        !isLastQuestion
      ) {

        goToQuestion(
          currentQuestion +
            1
        );

      }

    };


  const previousQuestion =
    () => {

      if (
        !canFillForm ||
        isSubmitting ||
        timerExpired
      ) {

        return;

      }


      if (
        currentQuestion >
        0
      ) {

        setCurrentQuestion(
          (
            previous
          ) =>
            previous -
            1
        );


        setShowAnswerWarning(
          false
        );

      }

    };


  // =========================================================
  // SUBMIT BUTTON
  // =========================================================

  const handleSubmit =
    () => {

      if (
        !canFillForm ||
        isSubmitting ||
        timerExpired
      ) {

        return;

      }


      if (
        question?.required &&
        !currentQuestionAnswered
      ) {

        setShowAnswerWarning(
          true
        );


        return;

      }


      const unansweredRequiredIndex =
        questions.findIndex(
          (
            item
          ) => {

            return (
              item.required &&
              !hasAnswerValue(
                answers[
                  item.id
                ]
              )
            );

          }
        );


      if (
        unansweredRequiredIndex !==
        -1
      ) {

        setCurrentQuestion(
          unansweredRequiredIndex
        );


        setShowAnswerWarning(
          true
        );


        window.scrollTo({

          top:
            0,

          behavior:
            "smooth",

        });


        return;

      }


      completeSubmission();

    };


  // =========================================================
  // RENDER CHOICE OPTIONS
  // =========================================================

  const renderChoiceOptions = (
    customOptions
  ) => {

    let availableOptions =
      Array.isArray(
        customOptions
      )
        ? customOptions
        : question.options;


    if (
      question.type ===
        "yesno" &&
      availableOptions.length ===
        0
    ) {

      availableOptions = [
        "Yes",
        "No",
      ];

    }


    if (
      !Array.isArray(
        availableOptions
      )
    ) {

      availableOptions =
        [];

    }


    if (
      availableOptions.length ===
      0
    ) {

      return (

        <div className="fillform-warning">

          <FaExclamationTriangle />

          <div>

            <strong>
              No answer options
            </strong>

            <span>
              This question does not contain any answer options.
            </span>

          </div>

        </div>

      );

    }


    return (

      <fieldset className="options-fieldset">

        <legend className="sr-only">
          Answer choices
        </legend>


        <div className="options-list">

          {availableOptions.map(
            (
              option,
              index
            ) => {

              const isSelected =
                currentAnswer ===
                option;


              return (

                <label
                  key={
                    `${question.id}-${option}-${index}`
                  }
                  className={
                    isSelected
                      ? "option-card selected"
                      : "option-card"
                  }
                >

                  <input
                    type="radio"
                    name={
                      `question-${question.id}`
                    }
                    value={
                      option
                    }
                    checked={
                      isSelected
                    }
                    disabled={
                      !canFillForm ||
                      isSubmitting ||
                      timerExpired
                    }
                    onChange={() =>
                      saveAnswer(
                        option
                      )
                    }
                  />


                  <span className="option-letter">

                    {String.fromCharCode(
                      65 +
                      index
                    )}

                  </span>


                  <span className="option-text">

                    {option}

                  </span>


                  <span className="option-check">

                    <FaCheckCircle />

                  </span>

                </label>

              );

            }
          )}

        </div>

      </fieldset>

    );

  };


  // =========================================================
  // RENDER TEXT ANSWER
  // =========================================================

  const renderTextAnswer = (
    answerType =
      question.type
  ) => {

    if (
      answerType ===
      "long"
    ) {

      return (

        <div className="fillform-text-answer">

          <textarea
            value={
              currentAnswer ||
              ""
            }
            disabled={
              !canFillForm ||
              isSubmitting ||
              timerExpired
            }
            onChange={(event) =>
              saveAnswer(
                event.target.value
              )
            }
            placeholder="Type your answer here..."
            rows={6}
          />

        </div>

      );

    }


    let placeholder =
      "Type your answer here...";


    if (
      answerType ===
      "code"
    ) {

      placeholder =
        "Enter your code answer...";

    }


    if (
      answerType ===
      "math"
    ) {

      placeholder =
        "Enter your mathematical answer...";

    }


    if (
      question.type ===
        "image"
    ) {

      placeholder =
        "Type your answer based on the image...";

    }


    return (

      <div className="fillform-text-answer">

        <input
          type="text"
          value={
            currentAnswer ||
            ""
          }
          disabled={
            isSubmitting ||
            timerExpired
          }
          onChange={(event) =>
            saveAnswer(
              event.target.value
            )
          }
          placeholder={
            placeholder
          }
        />

      </div>

    );

  };


  // =========================================================
  // RENDER RATING
  // =========================================================

  const renderRating =
    () => {

      return (

        <div className="fillform-rating-list">

          {Array.from({

            length:
              question.ratingMax,

          }).map(
            (
              _,
              index
            ) => {

              const rating =
                index +
                1;


              const isSelected =
                Number(
                  currentAnswer
                ) ===
                rating;


              return (

                <button
                  key={
                    rating
                  }
                  type="button"
                  className={
                    isSelected
                      ? "fillform-rating-btn selected"
                      : "fillform-rating-btn"
                  }
                  disabled={
                    isSubmitting ||
                    timerExpired
                  }
                  onClick={() =>
                    saveAnswer(
                      rating
                    )
                  }
                >

                  <FaStar />

                  <span>
                    {rating}
                  </span>

                </button>

              );

            }
          )}

        </div>

      );

    };


  // =========================================================
  // RENDER IMAGE ANSWER
  // =========================================================

  const renderImageAnswer =
    () => {

      const imageAnswerType =
        question.imageAnswerType ||
        "short";


      if (
        imageAnswerType ===
        "multiple"
      ) {

        return renderChoiceOptions(
          question.imageOptions
        );

      }


      if (
        imageAnswerType ===
        "long"
      ) {

        return renderTextAnswer(
          "long"
        );

      }


      return renderTextAnswer(
        "short"
      );

    };


  // =========================================================
  // RENDER ANSWER FIELD
  // =========================================================

  const renderAnswerField =
    () => {

      if (!question) {

        return null;

      }


      if (
        question.type ===
          "multiple" ||
        question.type ===
          "yesno"
      ) {

        return renderChoiceOptions(
          question.options
        );

      }


      if (
        question.type ===
        "rating"
      ) {

        return renderRating();

      }


      if (
        question.type ===
        "image"
      ) {

        return renderImageAnswer();

      }


      if (
        question.type ===
        "long"
      ) {

        return renderTextAnswer(
          "long"
        );

      }


      if (
        question.type ===
        "code"
      ) {

        return renderTextAnswer(
          "code"
        );

      }


      if (
        question.type ===
        "math"
      ) {

        return renderTextAnswer(
          "math"
        );

      }


      return renderTextAnswer(
        "short"
      );

    };


  // =========================================================
  // INVALID FORM
  // =========================================================

  if (!form) {

    return null;

  }


  if (
    alreadySubmitted &&
    form.oneTimeOnly &&
    !hasSubmittedRef.current
  ) {

    return null;

  }


  // =========================================================
  // SCHEDULE NOT AVAILABLE
  // =========================================================

  if (
    !canFillForm
  ) {

    const isClosed =
      availability.status ===
      "closed";


    const isInactive =
      availability.status ===
      "inactive";


    return (

      <div
        className={
          darkMode
            ? "fillform-page dark"
            : "fillform-page"
        }
      >

        <div className="fillform-empty-state">

          {isClosed ||
          isInactive ? (

            <FaExclamationTriangle />

          ) : (

            <FaClock />

          )}

          <h2>

            {isInactive
              ? "Form Sedang Dinonaktifkan"
              : isClosed
              ? "Form Sudah Ditutup"
              : "Form Belum Dibuka"
            }

          </h2>

          <p>
            {availability.message}
          </p>

          {availability.openAt &&
          !isClosed &&
          !isInactive && (

            <p>
              Waktu buka:{" "}
              <strong>
                {formatAvailabilityDateTime(
                  availability.openAt
                )}
              </strong>
            </p>

          )}

          {availability.closeAt && (

            <p>
              Waktu tutup:{" "}
              <strong>
                {formatAvailabilityDateTime(
                  availability.closeAt
                )}
              </strong>
            </p>

          )}

          <button
            type="button"
            onClick={() =>
              navigate(
                "/forms"
              )
            }
          >
            Kembali ke Forms
          </button>

        </div>

      </div>

    );

  }


  // =========================================================
  // EMPTY QUESTIONS
  // =========================================================

  if (
    totalQuestions ===
    0
  ) {

    return (

      <div
        className={
          darkMode
            ? "fillform-page dark"
            : "fillform-page"
        }
      >

        <div className="fillform-empty-state">

          <FaClipboardList />

          <h2>
            No Questions Available
          </h2>

          <p>
            This form does not contain any questions yet.
          </p>

          <button
            type="button"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            Back to Dashboard
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
          ? "fillform-page dark"
          : "fillform-page"
      }
    >


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="fillform-header">


        <div className="fillform-brand">

          <div className="fillform-logo-wrapper">

            <img
              src={
                logo
              }
              alt="HiDocs Logo"
            />

          </div>


          <div className="fillform-brand-text">

            <h2>
              HiDocs
            </h2>

            <span>
              {form.title}
            </span>

          </div>

        </div>



        <div className="fillform-header-progress">

          <div className="fillform-progress-information">

            <span>

              Question
              {" "}
              {currentQuestion + 1}
              {" "}
              of
              {" "}
              {totalQuestions}

            </span>

            <strong>

              {Math.round(
                progress
              )}%

            </strong>

          </div>


          <div className="fillform-progress-track">

            <div
              className="fillform-progress-fill"
              style={{
                width:
                  `${progress}%`,
              }}
            ></div>

          </div>

        </div>



        <div
          className={
            timerIsWarning
              ? "fillform-timer warning"
              : "fillform-timer"
          }
        >

          {form.timerEnabled ? (

            <>

              <FaClock />

              <div>

                <span>
                  Time Left
                </span>

                <strong>
                  {timerMinutes}:{timerSeconds}
                </strong>

              </div>

            </>

          ) : (

            <>

              <FaInfinity />

              <div>

                <span>
                  Timer
                </span>

                <strong>
                  No Limit
                </strong>

              </div>

            </>

          )}

        </div>


      </header>



      {/* =====================================================
          BODY
      ===================================================== */}

      <div className="fillform-body">


        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="question-sidebar">


          <div className="sidebar-heading">

            <div>

              <span>
                Navigation
              </span>

              <h3>
                Questions
              </h3>

            </div>

            <strong>

              {currentQuestion + 1}
              /
              {totalQuestions}

            </strong>

          </div>



          <div className="question-grid">

            {questions.map(
              (
                item,
                index
              ) => {

                const isCurrent =
                  currentQuestion ===
                  index;


                const isAnswered =
                  hasAnswerValue(
                    answers[
                      item.id
                    ]
                  );


                const isLocked =
                  index >
                    currentQuestion &&
                  question?.required &&
                  !currentQuestionAnswered;


                return (

                  <button
                    key={
                      item.id
                    }
                    type="button"
                    onClick={() =>
                      goToQuestion(
                        index
                      )
                    }
                    disabled={
                      isLocked ||
                      !canFillForm ||
                      isSubmitting ||
                      timerExpired
                    }
                    className={[
                      "question-number",

                      isCurrent
                        ? "active"
                        : "",

                      !isCurrent &&
                      isAnswered
                        ? "answered"
                        : "",

                      isLocked
                        ? "locked"
                        : "",
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        " "
                      )}
                  >

                    {isAnswered &&
                    !isCurrent ? (

                      <FaCheckCircle />

                    ) : (

                      index +
                      1

                    )}

                  </button>

                );

              }
            )}

          </div>



          <div className="question-legend">

            <div className="legend-item">

              <span className="legend current"></span>

              <p>
                Current
              </p>

            </div>


            <div className="legend-item">

              <span className="legend answered"></span>

              <p>
                Answered
              </p>

            </div>


            <div className="legend-item">

              <span className="legend"></span>

              <p>
                Not Answered
              </p>

            </div>

          </div>


          <div className="question-footer-status">

            <span>

              {answeredQuestionCount}
              {" "}
              of
              {" "}
              {totalQuestions}
              {" "}
              answered

            </span>

          </div>


        </aside>



        {/* ===================================================
            QUESTION CONTENT
        =================================================== */}

        <main className="question-content">

          <article className="question-card">


            <div className="question-header">

              <div className="question-heading-content">

                <span className="question-label">

                  {form.category}
                  {" "}
                  Question

                </span>


                <h1>

                  <span className="question-index">

                    {currentQuestion + 1}.

                  </span>

                  {question.title}

                </h1>


                <p className="question-instruction">

                  {question.required
                    ? "This question must be answered before continuing."
                    : "This question is optional."
                  }

                </p>

              </div>


              <div className="question-header-icon">

                <FaClipboardList />

              </div>

            </div>



            {/* =================================================
                QUESTION IMAGE
            ================================================= */}

            {question.image && (

              <div className="question-image">

                <img
                  src={
                    question.image
                  }
                  alt={
                    question.imageName ||
                    `Illustration for question ${currentQuestion + 1}`
                  }
                />

              </div>

            )}



            {/* =================================================
                ANSWER FIELD
            ================================================= */}

            {renderAnswerField()}



            {/* =================================================
                REQUIRED WARNING
            ================================================= */}

            {showAnswerWarning && (

              <div
                className="fillform-warning"
                role="alert"
              >

                <FaExclamationTriangle />

                <div>

                  <strong>
                    Answer this question first
                  </strong>

                  <span>
                    Complete this required question before continuing.
                  </span>

                </div>

              </div>

            )}



            {/* =================================================
                TIMER WARNING
            ================================================= */}

            {form.timerEnabled &&
            timerIsWarning &&
            timeLeft >
              0 && (

              <div
                className="fillform-warning"
                role="status"
              >

                <FaClock />

                <div>

                  <strong>
                    Time is running out
                  </strong>

                  <span>
                    The form will close automatically when the timer reaches zero.
                  </span>

                </div>

              </div>

            )}



            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="question-footer">

              <button
                type="button"
                className="previous-btn"
                onClick={
                  previousQuestion
                }
                disabled={
                  currentQuestion ===
                    0 ||
                  !canFillForm ||
                  isSubmitting ||
                  timerExpired
                }
              >

                <FaArrowLeft />

                <span>
                  Previous
                </span>

              </button>



              <div className="question-footer-status">

                <span>

                  {isSubmitting
                    ? "Processing..."
                    : currentQuestionAnswered
                    ? "Answer saved"
                    : question.required
                    ? "Answer required"
                    : "Optional question"
                  }

                </span>

              </div>



              {isLastQuestion ? (

                <button
                  type="button"
                  className="submit-btn"
                  onClick={
                    handleSubmit
                  }
                  disabled={
                    !canFillForm ||
                    isSubmitting ||
                    timerExpired ||
                    (
                      question.required &&
                      !currentQuestionAnswered
                    )
                  }
                >

                  <FaCheckCircle />

                  <span>

                    {isSubmitting
                      ? "Submitting..."
                      : "Submit Form"
                    }

                  </span>

                </button>

              ) : (

                <button
                  type="button"
                  className="next-btn"
                  onClick={
                    nextQuestion
                  }
                  disabled={
                    !canFillForm ||
                    isSubmitting ||
                    timerExpired ||
                    (
                      question.required &&
                      !currentQuestionAnswered
                    )
                  }
                >

                  <span>
                    Next
                  </span>

                  <FaArrowRight />

                </button>

              )}


            </div>


          </article>

        </main>


      </div>


    </div>

  );

}


export default FillForm;