import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

export const FormContext =
  createContext(null);

const FORMS_STORAGE_KEY =
  "hidocs_forms";

const SUBMISSIONS_STORAGE_KEY =
  "hidocs_submissions";

const DELETED_FORMS_STORAGE_KEY =
  "hidocs_deleted_forms";

const defaultForms = [

  {
    id:
      1,

    title:
      "Survey Kepuasan Mahasiswa 2024",

    customLink:
      "survey-mhs-2024",

    active:
      true,

    responses:
      0,

    settings: {

      shuffleQuestions:
        false,

      shuffleAnswers:
        false,

      oneTimeOnly:
        false,

      activateImmediately:
        true,

      timer: {

        enabled:
          true,

        mode:
          "custom",

        duration:
          20,

      },

      resultMode:
        "none",

    },

    questions: [

      {
        id:
          "survey-1",

        title:
          "Bagaimana pendapat Anda mengenai fasilitas kampus?",

        question:
          "Bagaimana pendapat Anda mengenai fasilitas kampus?",

        image:
          "",

        type:
          "multiple",

        required:
          true,

        scoring:
          false,

        points:
          0,

        correctAnswer:
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

        question:
          "Apakah pelayanan administrasi sudah memuaskan?",

        image:
          "",

        type:
          "multiple",

        required:
          true,

        scoring:
          false,

        points:
          0,

        correctAnswer:
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

    customLink:
      "quiz-flutter-w5",

    active:
      true,

    responses:
      0,

    settings: {

      shuffleQuestions:
        false,

      shuffleAnswers:
        false,

      oneTimeOnly:
        false,

      activateImmediately:
        true,

      timer: {

        enabled:
          true,

        mode:
          "custom",

        duration:
          30,

      },

      resultMode:
        "score",

    },

    questions: [

      {
        id:
          "flutter-1",

        title:
          "Widget apakah yang digunakan untuk membuat layout vertikal di Flutter?",

        question:
          "Widget apakah yang digunakan untuk membuat layout vertikal di Flutter?",

        image:
          "",

        type:
          "multiple",

        required:
          true,

        scoring:
          true,

        points:
          1,

        correctAnswer:
          "Column",

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

        question:
          "Perhatikan gambar berikut kemudian pilih jawaban yang benar.",

        image:
          "https://picsum.photos/800/420",

        type:
          "multiple",

        required:
          true,

        scoring:
          true,

        points:
          1,

        correctAnswer:
          "Jawaban A",

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

        question:
          "Apa fungsi utama dari Scaffold pada Flutter?",

        image:
          "",

        type:
          "multiple",

        required:
          true,

        scoring:
          true,

        points:
          1,

        correctAnswer:
          "Widget Layout",

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

    customLink:
      "hack24",

    active:
      true,

    responses:
      0,

    settings: {

      shuffleQuestions:
        false,

      shuffleAnswers:
        false,

      oneTimeOnly:
        false,

      activateImmediately:
        true,

      timer: {

        enabled:
          true,

        mode:
          "custom",

        duration:
          15,

      },

      resultMode:
        "none",

    },

    questions: [

      {
        id:
          "hackathon-1",

        title:
          "Apakah Anda bersedia mengikuti seluruh rangkaian acara?",

        question:
          "Apakah Anda bersedia mengikuti seluruh rangkaian acara?",

        image:
          "",

        type:
          "multiple",

        required:
          true,

        scoring:
          false,

        points:
          0,

        correctAnswer:
          "",

        options: [
          "Ya",
          "Tidak",
        ],
      },

    ],

  },

];
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
const getCurrentUser = () => {

  try {

    const possibleKeys = [
      "user",
      "hidocs_user",
      "currentUser",
      "loggedInUser",
    ];


    for (
      const key of possibleKeys
    ) {

      const storedUser =
        localStorage.getItem(
          key
        );


      if (!storedUser) {

        continue;

      }


      const parsedUser =
        JSON.parse(
          storedUser
        );


      if (
        !parsedUser ||
        typeof parsedUser !==
          "object"
      ) {

        continue;

      }


      const username =
        String(
          parsedUser.username ||
          parsedUser.name ||
          "HiDocs User"
        ).trim();


      return {

        ...parsedUser,

        id:
          parsedUser.id ||
          null,

        username,

        name:
          username,

        email:
          String(
            parsedUser.email ||
            ""
          )
            .trim()
            .toLowerCase(),

        role:
          parsedUser.role ||
          "User",

      };

    }


    return {

      id:
        null,

      username:
        "HiDocs User",

      name:
        "HiDocs User",

      email:
        "",

      role:
        "User",

    };

  } catch (error) {

    console.error(
      "Gagal membaca akun aktif:",
      error
    );


    return {

      id:
        null,

      username:
        "HiDocs User",

      name:
        "HiDocs User",

      email:
        "",

      role:
        "User",

    };

  }

};

const getUserIdentity = (
  user
) => {

  if (
    user.email
  ) {

    return String(
      user.email
    )
      .trim()
      .toLowerCase();

  }


  if (
    user.id
  ) {

    return String(
      user.id
    )
      .trim()
      .toLowerCase();

  }


  return String(
    user.username ||
    "hidocs-user"
  )
    .trim()
    .toLowerCase();

};

const hasAnswer = (
  answer
) => {

  if (
    Array.isArray(
      answer
    )
  ) {

    return (
      answer.length >
      0
    );

  }


  if (
    typeof answer ===
    "string"
  ) {

    return (
      answer.trim()
        .length >
      0
    );

  }


  return (
    answer !==
      undefined &&
    answer !==
      null &&
    answer !==
      ""
  );

};
const normalizeResultMode = (
  value
) => {

  const normalized =
    String(
      value ||
      ""
    )
      .trim()
      .toLowerCase();


  if (
    normalized ===
      "score" ||
    normalized ===
      "show-score" ||
    normalized ===
      "show-result-and-score" ||
    normalized ===
      "result-score"
  ) {

    return "score";

  }


  if (
    normalized ===
      "result" ||
    normalized ===
      "show-result" ||
    normalized ===
      "show-result-only"
  ) {

    return "result";

  }


  return "none";

};

const normalizeTimer = (
  form
) => {

  const timerObject =
    form.settings?.timer &&
    typeof form.settings.timer ===
      "object"
      ? form.settings.timer
      : {};


  const enabled =
    form.timerEnabled ??
    form.settings?.timerEnabled ??
    timerObject.enabled ??
    Boolean(
      form.duration ||
      form.timerDuration
    );


  const rawDuration =
    Number(
      form.timerDuration ??
      form.settings?.timerDuration ??
      timerObject.duration ??
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
            1
          ),
          1000
        )
      : 20;


  return {

    enabled:
      Boolean(
        enabled
      ),

    mode:
      timerObject.mode ||
      "custom",

    duration,

  };

};

const normalizeQuestion = (
  question,
  index
) => {

  const options =
    Array.isArray(
      question.options
    )
      ? question.options
      : [];


  const grading =
    question.grading &&
    typeof question.grading ===
      "object"
      ? question.grading
      : {};


  const correctAnswer =
    grading.correctAnswer ??
    question.correctAnswer ??
    "";


  const scoring =
    Boolean(
      grading.enabled ===
        true ||
      question.scoring ===
        true
    );


  const points =
    scoring
      ? Math.max(
          Number(
            grading.points ??
            question.points
          ) || 1,
          0
        )
      : 0;


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

    question:
      String(
        question.question ||
        question.title ||
        ""
      ).trim() ||
      `Question ${index + 1}`,

    type:
      question.type ||
      "short",

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

    imageAnswerType:
      question.imageAnswerType ||
      "",

    imageOptions:
      Array.isArray(
        question.imageOptions
      )
        ? question.imageOptions
        : [],

    options,

    scoring,

    points,

    correctAnswer,

    grading: {

      ...grading,

      enabled:
        scoring,

      points,

      correctAnswer,

    },

  };

};

const normalizeForm = (
  form
) => {

  const timer =
    normalizeTimer(
      form
    );


  const accessMode =
    form.accessMode ||
    form.settings?.accessMode ||
    (
      form.qrOnly ||
      form.settings?.qrOnly
        ? "qr-only"
        : "public"
    );


  const showInUserList =
    form.showInUserList ??
    form.settings?.showInUserList ??
    (
      accessMode ===
      "public"
    );


  const resultMode =
    normalizeResultMode(
      form.settings?.resultMode ||
      form.resultMode
    );


  return {

    ...form,

    id:
      form.id ||
      Date.now() +
      Math.random(),

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
      "Form created using HiDocs Form Builder.",

    type:
      form.type ||
      form.category ||
      "Form",

    category:
      form.category ||
      form.type ||
      "Form",

    active:
      form.active !==
      false,

    responses:
      Number(
        form.responses
      ) || 0,

    questions:
      Array.isArray(
        form.questions
      )
        ? form.questions.map(
            normalizeQuestion
          )
        : [],

    accessMode,

    showInUserList:
      Boolean(
        showInUserList
      ),

    qrOnly:
      accessMode ===
      "qr-only",

    timerEnabled:
      timer.enabled,

    timerDuration:
      timer.duration,

    duration:
      timer.enabled
        ? timer.duration
        : 0,

    resultMode,

    settings: {

      shuffleQuestions:
        Boolean(
          form.settings
            ?.shuffleQuestions
        ),

      shuffleAnswers:
        Boolean(
          form.settings
            ?.shuffleAnswers
        ),

      oneTimeOnly:
        form.settings
          ?.oneTimeOnly !==
        false,

      activateImmediately:
        form.settings
          ?.activateImmediately !==
        false,

      ...form.settings,

      resultMode,

      timer,

      timerEnabled:
        timer.enabled,

      timerDuration:
        timer.duration,

      accessMode,

      showInUserList:
        Boolean(
          showInUserList
        ),

      qrOnly:
        accessMode ===
        "qr-only",

    },

  };

};

const normalizeQuestionResult = (
  item,
  index
) => {

  const questionId =
    item.questionId ??
    item.id ??
    `result-question-${index + 1}`;


  const grading =
    item.grading &&
    typeof item.grading ===
      "object"
      ? item.grading
      : {};


  const scoring =
    Boolean(
      item.scoring ===
        true ||
      grading.enabled ===
        true
    );


  const maxPoints =
    scoring
      ? Math.max(
          Number(
            item.maxPoints ??
            item.points ??
            grading.points
          ) || 0,
          0
        )
      : 0;


  const earnedPoints =
    scoring
      ? Math.max(
          Number(
            item.earnedPoints
          ) || 0,
          0
        )
      : 0;


  const isCorrect =
    typeof item.isCorrect ===
      "boolean"
      ? item.isCorrect
      : null;


  const correctAnswer =
    item.correctAnswer ??
    grading.correctAnswer ??
    "";


  return {

    ...item,

    id:
      questionId,

    questionId,

    title:
      String(
        item.title ||
        item.question ||
        ""
      ).trim() ||
      `Question ${index + 1}`,

    question:
      String(
        item.question ||
        item.title ||
        ""
      ).trim() ||
      `Question ${index + 1}`,

    type:
      item.type ||
      "short",

    image:
      String(
        item.image ||
        ""
      ).trim(),

    imageName:
      String(
        item.imageName ||
        ""
      ).trim(),

    options:
      Array.isArray(
        item.options
      )
        ? item.options
        : [],

    userAnswer:
      item.userAnswer ??
      "",

    correctAnswer,

    scoring,

    points:
      maxPoints,

    maxPoints,

    earnedPoints,

    isCorrect,

    grading: {

      ...grading,

      enabled:
        scoring,

      points:
        maxPoints,

      correctAnswer,

    },

  };

};

const normalizeSubmission = (
  submission,
  index = 0
) => {

  const formId =
    submission.formId ??
    submission.id;


  const isTimeExpired =
    submission.isTimeExpired ===
      true ||
    submission.status ===
      "time-expired" ||
    submission.status ===
      "expired" ||
    submission.status ===
      "Time Expired";


  const normalizedQuestionResults =
    Array.isArray(
      submission.questionResults
    )
      ? submission.questionResults.map(
          normalizeQuestionResult
        )
      : [];


  const calculatedScore =
    normalizedQuestionResults.reduce(
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


  const calculatedMaxScore =
    normalizedQuestionResults.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          item.scoring
            ? Number(
                item.maxPoints ??
                item.points
              ) || 0
            : 0
        ),
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
    storedMaxScore >=
      0
      ? storedMaxScore
      : calculatedMaxScore;


  const calculatedCorrectAnswers =
    normalizedQuestionResults.filter(
      (
        item
      ) =>
        item.scoring &&
        item.isCorrect ===
          true
    ).length;


  const calculatedIncorrectAnswers =
    normalizedQuestionResults.filter(
      (
        item
      ) =>
        item.scoring &&
        item.isCorrect ===
          false
    ).length;


  const calculatedScoredQuestions =
    normalizedQuestionResults.filter(
      (
        item
      ) =>
        item.scoring
    ).length;


  const hasStoredPercentage =
    submission.percentage !==
      undefined &&
    submission.percentage !==
      null &&
    submission.percentage !==
      "";


  const storedPercentage =
    hasStoredPercentage
      ? Number(
          submission.percentage
        )
      : Number.NaN;


  const percentage =
    Number.isFinite(
      storedPercentage
    )
      ? Math.min(
          Math.max(
            Math.round(
              storedPercentage
            ),
            0
          ),
          100
        )
      : (
          maxScore >
            0
            ? Math.round(
                (
                  score /
                  maxScore
                ) *
                100
              )
            : 0
        );


  const correctAnswers =
    submission.correctAnswers !==
      undefined &&
    submission.correctAnswers !==
      null
      ? Number(
          submission.correctAnswers
        ) || 0
      : calculatedCorrectAnswers;


  const incorrectAnswers =
    submission.incorrectAnswers !==
      undefined &&
    submission.incorrectAnswers !==
      null
      ? Number(
          submission.incorrectAnswers
        ) || 0
      : calculatedIncorrectAnswers;


  const scoredQuestions =
    submission.scoredQuestions !==
      undefined &&
    submission.scoredQuestions !==
      null
      ? Number(
          submission.scoredQuestions
        ) || 0
      : calculatedScoredQuestions;


  return {

    ...submission,

    id:
      formId,

    formId,

    submissionId:
      submission.submissionId ||
      `${formId}-${submission.submittedAt || Date.now()}-${index}`,

    status:
      isTimeExpired
        ? "time-expired"
        : "completed",

    isTimeExpired,

    answers:
      submission.answers &&
      typeof submission.answers ===
        "object"
        ? submission.answers
        : {},

    answeredQuestions:
      Number(
        submission.answeredQuestions
      ) || 0,

    totalQuestions:
      Number(
        submission.totalQuestions
      ) || 0,

    resultMode:
      normalizeResultMode(
        submission.resultMode
      ),

    score,

    maxScore,

    percentage,

    correctAnswers,

    incorrectAnswers,

    scoredQuestions,

    questionResults:
      normalizedQuestionResults,

    grading: {

      ...(
        submission.grading &&
        typeof submission.grading ===
          "object"
          ? submission.grading
          : {}
      ),

      enabled:
        scoredQuestions >
        0,

      score,

      maxScore,

      percentage,

      correctAnswers,

      incorrectAnswers,

      scoredQuestions,

    },

    submittedAt:
      submission.submittedAt ||
      new Date()
        .toISOString(),

  };

};

const mergeForms = (
  baseForms,
  savedForms
) => {

  const result =
    [];


  [
    ...baseForms,
    ...savedForms,
  ].forEach(
    (
      form
    ) => {

      const normalizedForm =
        normalizeForm(
          form
        );


      const matchingIndex =
        result.findIndex(
          (
            item
          ) => {

            const sameId =
              String(
                item.id
              ) ===
              String(
                normalizedForm.id
              );


            const sameLink =
              item.customLink &&
              normalizedForm.customLink &&
              String(
                item.customLink
              )
                .trim()
                .toLowerCase() ===
              String(
                normalizedForm.customLink
              )
                .trim()
                .toLowerCase();


            return (
              sameId ||
              sameLink
            );

          }
        );


      if (
        matchingIndex ===
        -1
      ) {

        result.push(
          normalizedForm
        );

      } else {

        result[
          matchingIndex
        ] =
          normalizedForm;

      }

    }
  );


  return result;

};

const loadInitialForms =
  () => {

    const storedForms =
      getStoredArray(
        FORMS_STORAGE_KEY
      );


    const deletedIds =
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


    return mergeForms(
      defaultForms,
      storedForms
    ).filter(
      (
        form
      ) =>
        !deletedIds.includes(
          String(
            form.id
          )
        )
    );

  };

const loadInitialSubmissions =
  () => {

    return getStoredArray(
      SUBMISSIONS_STORAGE_KEY
    ).map(
      normalizeSubmission
    );

  };

export function FormProvider({
  children,
}) {

  const [
    forms,
    setForms,
  ] = useState(
    loadInitialForms
  );


  const [
    allSubmissions,
    setAllSubmissions,
  ] = useState(
    loadInitialSubmissions
  );

  const [
    activeUserIdentity,
    setActiveUserIdentity,
  ] = useState(() => {

    const currentUser =
      getCurrentUser();


    return getUserIdentity(
      currentUser
    );

  });

  const syncActiveUser =
    useCallback(
      () => {

        const currentUser =
          getCurrentUser();


        const nextIdentity =
          getUserIdentity(
            currentUser
          );


        setActiveUserIdentity(
          (previousIdentity) =>
            previousIdentity ===
            nextIdentity
              ? previousIdentity
              : nextIdentity
        );


        return nextIdentity;

      },
      []
    );

  useEffect(() => {

    localStorage.setItem(

      FORMS_STORAGE_KEY,

      JSON.stringify(
        forms
      )

    );

  }, [
    forms,
  ]);

  useEffect(() => {

    localStorage.setItem(

      SUBMISSIONS_STORAGE_KEY,

      JSON.stringify(
        allSubmissions
      )

    );

  }, [
    allSubmissions,
  ]);
  useEffect(() => {

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

          setForms(
            loadInitialForms()
          );

        }


        if (
          event.key ===
          SUBMISSIONS_STORAGE_KEY
        ) {

          setAllSubmissions(
            loadInitialSubmissions()
          );

        }


        if (
          event.key ===
            "user" ||
          event.key ===
            "hidocs_user" ||
          event.key ===
            "currentUser" ||
          event.key ===
            "loggedInUser" ||
          event.key ===
            "isLoggedIn"
        ) {

          syncActiveUser();

        }

      };


    window.addEventListener(
      "storage",
      handleStorageChange
    );


    return () => {

      window.removeEventListener(
        "storage",
        handleStorageChange
      );

    };

  }, [
    syncActiveUser,
  ]);

  useEffect(() => {

    const handleFocus =
      () => {

        syncActiveUser();

      };


    const handlePageShow =
      () => {

        syncActiveUser();

      };


    const handleVisibilityChange =
      () => {

        if (
          document.visibilityState ===
          "visible"
        ) {

          syncActiveUser();

        }

      };


    const handleUserChanged =
      () => {

        syncActiveUser();

      };


    window.addEventListener(
      "focus",
      handleFocus
    );


    window.addEventListener(
      "pageshow",
      handlePageShow
    );


    window.addEventListener(
      "hidocs-user-changed",
      handleUserChanged
    );


    window.addEventListener(
      "hidocsUserChanged",
      handleUserChanged
    );


    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );


    const userSyncInterval =
      window.setInterval(
        syncActiveUser,
        500
      );


    syncActiveUser();


    return () => {

      window.removeEventListener(
        "focus",
        handleFocus
      );


      window.removeEventListener(
        "pageshow",
        handlePageShow
      );


      window.removeEventListener(
        "hidocs-user-changed",
        handleUserChanged
      );


      window.removeEventListener(
        "hidocsUserChanged",
        handleUserChanged
      );


      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );


      window.clearInterval(
        userSyncInterval
      );

    };

  }, [
    syncActiveUser,
  ]);

  const submittedForms =
    useMemo(() => {

      return allSubmissions.filter(
        (
          submission
        ) => {

          const submissionIdentity =
            String(
              submission.userIdentity ||
              submission.respondentEmail ||
              submission.email ||
              submission.userId ||
              ""
            )
              .trim()
              .toLowerCase();


          return (
            submissionIdentity ===
            activeUserIdentity
          );

        }
      );

    }, [
      allSubmissions,
      activeUserIdentity,
    ]);

  const refreshForms =
    useCallback(
      () => {

        const latestForms =
          loadInitialForms();


        setForms(
          latestForms
        );


        return latestForms;

      },
      []
    );

  const createForm =
    useCallback(
      (
        formData
      ) => {

        const newForm =
          normalizeForm({

            ...formData,

            id:
              formData.id ||
              Date.now(),

            active:
              formData.active ??
              formData.settings
                ?.activateImmediately ??
              true,

            responses:
              Number(
                formData.responses
              ) || 0,

            createdAt:
              formData.createdAt ||
              new Date()
                .toISOString(),

          });


        setForms(
          (
            previous
          ) => {

            const exists =
              previous.some(
                (
                  form
                ) =>
                  String(
                    form.id
                  ) ===
                  String(
                    newForm.id
                  )
              );


            if (
              exists
            ) {

              return previous.map(
                (
                  form
                ) =>
                  String(
                    form.id
                  ) ===
                  String(
                    newForm.id
                  )
                    ? newForm
                    : form
              );

            }


            return [

              ...previous,

              newForm,

            ];

          }
        );


        return newForm;

      },
      []
    );
  const updateForm =
    useCallback(
      (
        id,
        updatedData
      ) => {

        setForms(
          (
            previous
          ) =>

            previous.map(
              (
                form
              ) => {

                if (
                  String(
                    form.id
                  ) !==
                  String(
                    id
                  )
                ) {

                  return form;

                }


                return normalizeForm({

                  ...form,

                  ...updatedData,

                  settings: {

                    ...form.settings,

                    ...updatedData.settings,

                  },

                });

              }
            )

        );

      },
      []
    );
  const getFormById =
    useCallback(
      (
        id
      ) => {

        const stateForm =
          forms.find(
            (
              form
            ) =>
              String(
                form.id
              ) ===
              String(
                id
              )
          );


        if (
          stateForm
        ) {

          return stateForm;

        }


        const storedForm =
          getStoredArray(
            FORMS_STORAGE_KEY
          ).find(
            (
              form
            ) =>
              String(
                form.id
              ) ===
              String(
                id
              )
          );


        return storedForm
          ? normalizeForm(
              storedForm
            )
          : null;

      },
      [
        forms,
      ]
    );

  const deleteForm =
    useCallback(
      (
        id
      ) => {

        setForms(
          (
            previous
          ) =>

            previous.filter(
              (
                form
              ) =>
                String(
                  form.id
                ) !==
                String(
                  id
                )
            )

        );


        const deletedIds =
          getStoredArray(
            DELETED_FORMS_STORAGE_KEY
          );


        const alreadyDeleted =
          deletedIds.some(
            (
              deletedId
            ) =>
              String(
                deletedId
              ) ===
              String(
                id
              )
          );


        if (
          !alreadyDeleted
        ) {

          localStorage.setItem(

            DELETED_FORMS_STORAGE_KEY,

            JSON.stringify([

              ...deletedIds,

              id,

            ])

          );

        }


        setAllSubmissions(
          (
            previous
          ) =>

            previous.filter(
              (
                submission
              ) =>
                String(
                  submission.formId
                ) !==
                String(
                  id
                )
            )

        );

      },
      []
    );
  const buildQuestionResults =
    (
      selectedForm,
      answers
    ) => {

      return selectedForm.questions.map(
        (
          question
        ) => {

          const userAnswer =
            answers[
              question.id
            ] ??
            "";


          const grading =
            question.grading &&
            typeof question.grading ===
              "object"
              ? question.grading
              : {};


          const correctAnswer =
            grading.correctAnswer ??
            question.correctAnswer ??
            "";


          const scoring =
            Boolean(
              grading.enabled ===
                true ||
              question.scoring ===
                true
            );


          const points =
            scoring
              ? Math.max(
                  Number(
                    grading.points ??
                    question.points
                  ) || 0,
                  0
                )
              : 0;


          let isCorrect =
            null;


          if (
            scoring
          ) {

            isCorrect =
              false;


            if (
              hasAnswer(
                userAnswer
              ) &&
              hasAnswer(
                correctAnswer
              )
            ) {

              if (
                Array.isArray(
                  correctAnswer
                )
              ) {

                const userArray =
                  Array.isArray(
                    userAnswer
                  )
                    ? userAnswer
                    : [
                        userAnswer,
                      ];


                const normalizedUser =
                  [...userArray]
                    .map(
                      (
                        value
                      ) =>
                        String(
                          value
                        )
                          .trim()
                          .toLowerCase()
                    )
                    .sort();


                const normalizedCorrect =
                  [...correctAnswer]
                    .map(
                      (
                        value
                      ) =>
                        String(
                          value
                        )
                          .trim()
                          .toLowerCase()
                    )
                    .sort();


                isCorrect =
                  JSON.stringify(
                    normalizedUser
                  ) ===
                  JSON.stringify(
                    normalizedCorrect
                  );

              } else {

                isCorrect =
                  String(
                    userAnswer
                  )
                    .trim()
                    .toLowerCase() ===
                  String(
                    correctAnswer
                  )
                    .trim()
                    .toLowerCase();

              }

            }

          }


          return {

            id:
              question.id,

            questionId:
              question.id,

            title:
              question.title,

            question:
              question.question,

            type:
              question.type,

            image:
              question.image,

            imageName:
              question.imageName,

            options:
              Array.isArray(
                question.options
              )
                ? question.options
                : [],

            userAnswer,

            correctAnswer,

            scoring,

            points,

            maxPoints:
              points,

            earnedPoints:
              scoring &&
              isCorrect ===
                true
                ? points
                : 0,

            isCorrect,

            grading: {

              enabled:
                scoring,

              points,

              correctAnswer,

            },

          };

        }
      );

    };
  const submitForm =
    useCallback(
      (
        submission
      ) => {

        const currentUser =
          getCurrentUser();


        const userIdentity =
          getUserIdentity(
            currentUser
          );


        const formId =
          submission.formId ??
          submission.id;


        if (
          formId ===
            undefined ||
          formId ===
            null
        ) {

          return {

            success:
              false,

            message:
              "ID form tidak ditemukan.",

          };

        }


        const formFromState =
          forms.find(
            (
              form
            ) =>
              String(
                form.id
              ) ===
              String(
                formId
              )
          );


        const storedForms =
          getStoredArray(
            FORMS_STORAGE_KEY
          );


        const formFromStorage =
          storedForms.find(
            (
              form
            ) =>
              String(
                form.id
              ) ===
              String(
                formId
              )
          );


        const selectedForm =
          formFromState ||
          (
            formFromStorage
              ? normalizeForm(
                  formFromStorage
                )
              : null
          );


        if (
          !selectedForm
        ) {

          return {

            success:
              false,

            message:
              "Form tidak ditemukan.",

          };

        }


        if (
          selectedForm.active ===
          false
        ) {

          return {

            success:
              false,

            message:
              "Form sedang dinonaktifkan oleh admin.",

          };

        }
        const requestedExpiredStatus =
          submission.isTimeExpired ===
            true ||
          submission.status ===
            "time-expired" ||
          submission.status ===
            "expired" ||
          submission.status ===
            "Time Expired";


        const normalizedStatus =
          requestedExpiredStatus
            ? "time-expired"
            : "completed";

        const oneTimeOnly =
          selectedForm.settings
            ?.oneTimeOnly !==
          false;


        const alreadyExists =
          allSubmissions.some(
            (
              item
            ) => {

              const sameForm =
                String(
                  item.formId ??
                  item.id
                ) ===
                String(
                  formId
                );


              const sameUser =
                String(
                  item.userIdentity ||
                  item.respondentEmail ||
                  item.email ||
                  item.userId ||
                  ""
                )
                  .trim()
                  .toLowerCase() ===
                userIdentity;


              return (
                sameForm &&
                sameUser
              );

            }
          );


        if (
          oneTimeOnly &&
          alreadyExists
        ) {

          return {

            success:
              false,

            message:
              "Anda sudah pernah mengisi atau mencoba form ini.",

          };

        }

        const answers =
          submission.answers &&
          typeof submission.answers ===
            "object"
            ? submission.answers
            : {};


        const answeredQuestions =
          submission.answeredQuestions ??
          Object.values(
            answers
          ).filter(
            hasAnswer
          ).length;


        const totalQuestions =
          submission.totalQuestions ??
          selectedForm.questions.length;

        const questionResults =
          Array.isArray(
            submission.questionResults
          ) &&
          submission.questionResults.length >
            0
            ? submission.questionResults.map(
                normalizeQuestionResult
              )
            : buildQuestionResults(
                selectedForm,
                answers
              );

        const calculatedScore =
          questionResults.reduce(
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


        const calculatedMaxScore =
          questionResults.reduce(
            (
              total,
              item
            ) =>
              total +
              (
                item.scoring
                  ? Number(
                      item.points
                    ) || 0
                  : 0
              ),
            0
          );


        const calculatedCorrectAnswers =
          questionResults.filter(
            (
              item
            ) =>
              item.scoring &&
              item.isCorrect ===
                true
          ).length;


        const calculatedIncorrectAnswers =
          questionResults.filter(
            (
              item
            ) =>
              item.scoring &&
              item.isCorrect ===
                false
          ).length;


        const calculatedScoredQuestions =
          questionResults.filter(
            (
              item
            ) =>
              item.scoring
          ).length;


        const calculatedPercentage =
          calculatedMaxScore >
            0
            ? Math.round(
                (
                  calculatedScore /
                  calculatedMaxScore
                ) *
                100
              )
            : 0;


        const resultMode =
          normalizeResultMode(
            submission.resultMode ||
            selectedForm.settings
              ?.resultMode ||
            selectedForm.resultMode
          );


        const submittedAt =
          submission.submittedAt ||
          new Date()
            .toISOString();

        const newSubmission =
          normalizeSubmission({

            ...submission,

            id:
              formId,

            formId,

            submissionId:
              submission.submissionId ||
              `${formId}-${Date.now()}-${Math.random()
                .toString(
                  36
                )
                .slice(
                  2,
                  8
                )}`,

            userId:
              currentUser.id,

            userIdentity,

            respondentName:
              currentUser.username ||
              currentUser.name ||
              "HiDocs User",

            username:
              currentUser.username ||
              currentUser.name ||
              "HiDocs User",

            respondentEmail:
              currentUser.email ||
              "",

            email:
              currentUser.email ||
              "",

            role:
              currentUser.role ||
              "User",

            title:
              submission.title ||
              selectedForm.title ||
              "Untitled Form",

            answers,

            answeredQuestions:
              Number(
                answeredQuestions
              ) || 0,

            totalQuestions:
              Number(
                totalQuestions
              ) || 0,

            submittedAt,

            status:
              normalizedStatus,

            isTimeExpired:
              requestedExpiredStatus,

            resultMode,

            questionResults,

            score:
              submission.score ??
              calculatedScore,

            maxScore:
              submission.maxScore ??
              calculatedMaxScore,

            percentage:
              submission.percentage ??
              calculatedPercentage,

            correctAnswers:
              submission.correctAnswers ??
              calculatedCorrectAnswers,

            incorrectAnswers:
              submission.incorrectAnswers ??
              calculatedIncorrectAnswers,

            scoredQuestions:
              submission.scoredQuestions ??
              calculatedScoredQuestions,

            grading: {

              ...(
                submission.grading &&
                typeof submission.grading ===
                  "object"
                  ? submission.grading
                  : {}
              ),

              enabled:
                calculatedScoredQuestions >
                0,

              score:
                submission.score ??
                calculatedScore,

              maxScore:
                submission.maxScore ??
                calculatedMaxScore,

              percentage:
                submission.percentage ??
                calculatedPercentage,

              correctAnswers:
                submission.correctAnswers ??
                calculatedCorrectAnswers,

              incorrectAnswers:
                submission.incorrectAnswers ??
                calculatedIncorrectAnswers,

              scoredQuestions:
                submission.scoredQuestions ??
                calculatedScoredQuestions,

            },

          });
        setAllSubmissions(
          (
            previous
          ) => [

            ...previous,

            newSubmission,

          ]
        );

        setForms(
          (
            previous
          ) => {

            const formAlreadyExists =
              previous.some(
                (
                  form
                ) =>
                  String(
                    form.id
                  ) ===
                  String(
                    formId
                  )
              );


            if (
              !formAlreadyExists
            ) {

              return [

                ...previous,

                {

                  ...selectedForm,

                  responses:
                    requestedExpiredStatus
                      ? Number(
                          selectedForm.responses
                        ) || 0
                      : (
                          Number(
                            selectedForm.responses
                          ) || 0
                        ) + 1,

                },

              ];

            }


            return previous.map(
              (
                form
              ) => {

                if (
                  String(
                    form.id
                  ) !==
                  String(
                    formId
                  )
                ) {

                  return form;

                }


                if (
                  requestedExpiredStatus
                ) {

                  return form;

                }


                return {

                  ...form,

                  responses:
                    (
                      Number(
                        form.responses
                      ) || 0
                    ) + 1,

                };

              }
            );

          }
        );


        return {

          success:
            true,

          status:
            normalizedStatus,

          resultMode,

          score:
            newSubmission.score,

          maxScore:
            newSubmission.maxScore,

          percentage:
            newSubmission.percentage,

          correctAnswers:
            newSubmission.correctAnswers,

          incorrectAnswers:
            newSubmission.incorrectAnswers,

          scoredQuestions:
            newSubmission.scoredQuestions,

          questionResults:
            newSubmission.questionResults,

          grading:
            newSubmission.grading,

          submission:
            newSubmission,

        };

      },
      [
        allSubmissions,
        forms,
      ]
    );

  const hasSubmitted =
    useCallback(
      (
        formId
      ) => {

        const userIdentity =
          activeUserIdentity;


        return allSubmissions.some(
          (
            submission
          ) => {

            const sameForm =
              String(
                submission.formId ??
                submission.id
              ) ===
              String(
                formId
              );


            const sameUser =
              String(
                submission.userIdentity ||
                submission.respondentEmail ||
                submission.email ||
                submission.userId ||
                ""
              )
                .trim()
                .toLowerCase() ===
              userIdentity;


            return (
              sameForm &&
              sameUser
            );

          }
        );

      },
      [
        allSubmissions,
        activeUserIdentity,
      ]
    );

  const getUserSubmissionByForm =
    useCallback(
      (
        formId
      ) => {

        const userIdentity =
          activeUserIdentity;


        const submissions =
          allSubmissions.filter(
            (
              submission
            ) => {

              const sameForm =
                String(
                  submission.formId ??
                  submission.id
                ) ===
                String(
                  formId
                );


              const sameUser =
                String(
                  submission.userIdentity ||
                  submission.respondentEmail ||
                  submission.email ||
                  submission.userId ||
                  ""
                )
                  .trim()
                  .toLowerCase() ===
                userIdentity;


              return (
                sameForm &&
                sameUser
              );

            }
          );


        return submissions.length >
          0
          ? submissions[
              submissions.length -
              1
            ]
          : null;

      },
      [
        allSubmissions,
        activeUserIdentity,
      ]
    );
  const getSubmissionById =
    useCallback(
      (
        submissionId
      ) => {

        return allSubmissions.find(
          (
            submission
          ) =>
            String(
              submission.submissionId
            ) ===
            String(
              submissionId
            )
        ) ||
        null;

      },
      [
        allSubmissions,
      ]
    );

  const getSubmissionsByForm =
    useCallback(
      (
        formId
      ) => {

        return allSubmissions.filter(
          (
            submission
          ) =>
            String(
              submission.formId ??
              submission.id
            ) ===
            String(
              formId
            )
        );

      },
      [
        allSubmissions,
      ]
    );

  const clearFormSubmissions =
    useCallback(
      (
        formId
      ) => {

        setAllSubmissions(
          (
            previous
          ) =>

            previous.filter(
              (
                submission
              ) =>
                String(
                  submission.formId ??
                  submission.id
                ) !==
                String(
                  formId
                )
            )

        );


        setForms(
          (
            previous
          ) =>

            previous.map(
              (
                form
              ) => {

                if (
                  String(
                    form.id
                  ) !==
                  String(
                    formId
                  )
                ) {

                  return form;

                }


                return {

                  ...form,

                  responses:
                    0,

                };

              }
            )

        );

      },
      []
    );

  const contextValue =
    useMemo(
      () => ({

        forms,

        submittedForms,

        allSubmissions,

        activeUserIdentity,

        syncActiveUser,

        createForm,

        updateForm,

        getFormById,

        deleteForm,

        submitForm,

        hasSubmitted,

        getUserSubmissionByForm,

        getSubmissionById,

        getSubmissionsByForm,

        clearFormSubmissions,

        refreshForms,

      }),
      [
        forms,
        submittedForms,
        allSubmissions,
        activeUserIdentity,
        syncActiveUser,
        createForm,
        updateForm,
        getFormById,
        deleteForm,
        submitForm,
        hasSubmitted,
        getUserSubmissionByForm,
        getSubmissionById,
        getSubmissionsByForm,
        clearFormSubmissions,
        refreshForms,
      ]
    );
  return (

    <FormContext.Provider
      value={
        contextValue
      }
    >

      {children}

    </FormContext.Provider>

  );

}