import {
  useContext,
  useEffect,
  useState,
} from "react";
import {
  getFormById,
  updateForm,
  updateFormSettings,
} from "../api/formApi";
import {
  getQuestionsByForm,
} from "../api/questionApi";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  FaAlignLeft,
  FaArrowLeft,
  FaCalculator,
  FaCalendarAlt,
  FaChartBar,
  FaCheck,
  FaCircle,
  FaClock,
  FaCode,
  FaCog,
  FaCopy,
  FaEye,
  FaEyeSlash,
  FaFont,
  FaGlobe,
  FaHourglassHalf,
  FaImage,
  FaInfoCircle,
  FaLink,
  FaListUl,
  FaLock,
  FaMinus,
  FaPlus,
  FaPowerOff,
  FaQrcode,
  FaQuestionCircle,
  FaRandom,
  FaStar,
  FaTrash,
  FaTrophy,
} from "react-icons/fa";
import {
  ThemeContext,
} from "../context/ThemeContext";
import "../assets/css/CreateForm.css";
import "../assets/css/EditForm.css";
// =========================================================
// STORAGE KEYS
// =========================================================
const FORMS_STORAGE_KEY =
  "hidocs_forms";
const NEW_FORM_STORAGE_KEY =
  "hidocs_new_form";
// =========================================================
// IMAGE CONFIGURATION
// =========================================================
const MAXIMUM_IMAGE_SIZE =
  1 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];
// =========================================================
// CREATE FORM
// =========================================================
function EditForm() {
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
  // =========================================================
  // ACTIVE TAB
  // =========================================================
  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "info"
  );
  const tabOrder = [
    "info",
    "settings",
    "questions",
  ];
  const activeTabIndex =
    tabOrder.indexOf(
      activeTab
    );
  const isFirstTab =
    activeTab ===
    "info";
  const isLastTab =
    activeTab ===
    "questions";
  // =========================================================
  // FORM DATA
  // =========================================================
  const [
    formData,
    setFormData,
  ] = useState({
    title: "",
    customLink: "",
    openDate: "",
    closeDate: "",
    openTime: "",
    closeTime: "",
    shuffleQuestions: false,
    shuffleAnswers: false,
    oneTimeOnly: true,
    activateImmediately: true,
    timerEnabled: true,
    timerDuration: 20,
    responseDays: 30,
    resultMode: "none",
    accessMode: "public",
  });
  // =========================================================
  // QUESTIONS
  // =========================================================
  const [
    questions,
    setQuestions,
  ] = useState([]);
  // =========================================================
  // EDIT FORM STATE
  // =========================================================
  const [
    originalForm,
    setOriginalForm,
  ] = useState(null);
  const [
    loadingForm,
    setLoadingForm,
  ] = useState(true);
  const [
    formNotFound,
    setFormNotFound,
  ] = useState(false);
  // =========================================================
  // LOAD EXISTING FORM
  // =========================================================
  useEffect(() => {
    const loadFormForEdit = async () => {
      try {
        const storedForms = getStoredForms();
        const selectedForm =
          [...storedForms]
            .reverse()
            .find(
              (item) =>
                String(item.id) ===
                String(id)
            );

        if (selectedForm) {
          const settings =
            selectedForm.settings &&
            typeof selectedForm.settings === "object"
              ? selectedForm.settings
              : {};
          const timerObject =
            selectedForm.timer &&
            typeof selectedForm.timer === "object"
              ? selectedForm.timer
              : {};
          const timerEnabled =
            settings.timerEnabled ??
            settings.timer?.enabled ??
            selectedForm.timerEnabled ??
            timerObject.enabled ??
            false;
          const timerDuration =
            Number(
              settings.timerDuration ??
              settings.timer?.duration ??
              selectedForm.timerDuration ??
              timerObject.duration ??
              selectedForm.duration ??
              20
            ) || 20;
          const accessMode =
            settings.accessMode ||
            selectedForm.accessMode ||
            (selectedForm.qrOnly ? "qr-only" : "public");
          const loadedQuestions =
            Array.isArray(selectedForm.questions)
              ? selectedForm.questions.map(
                  (question, index) => ({
                    ...question,
                    id:
                      question.id ??
                      `${selectedForm.id}-question-${index + 1}`,
                    title:
                      String(
                        question.title ||
                        question.question ||
                        ""
                      ),
                    required:
                      question.required !== false,
                    scoring:
                      Boolean(
                        question.scoring ??
                        question.grading?.enabled
                      ),
                    points:
                      Number(
                        question.points ??
                        question.grading?.points ??
                        1
                      ) || 1,
                    correctAnswer:
                      String(
                        question.correctAnswer ??
                        question.grading?.correctAnswer ??
                        ""
                      ),
                    options:
                      Array.isArray(question.options)
                        ? [...question.options]
                        : question.type === "yesno"
                        ? ["Yes", "No"]
                        : [],
                    imageOptions:
                      Array.isArray(question.imageOptions)
                        ? [...question.imageOptions]
                        : [],
                    imageAnswerType:
                      question.imageAnswerType ||
                      (question.type === "image"
                        ? "multiple"
                        : ""),
                    ratingMax:
                      question.ratingMax ||
                      (question.type === "rating" ? 5 : null),
                  })
                )
              : [];
          setOriginalForm(selectedForm);
          setFormData({
            title:
              String(selectedForm.title || ""),
            customLink:
              String(selectedForm.customLink || ""),
            openDate:
              selectedForm.openDate || "",
            closeDate:
              selectedForm.closeDate || "",
            openTime:
              selectedForm.openTime || "",
            closeTime:
              selectedForm.closeTime || "",
            shuffleQuestions:
              Boolean(settings.shuffleQuestions),
            shuffleAnswers:
              Boolean(settings.shuffleAnswers),
            oneTimeOnly:
              settings.oneTimeOnly !== false,
            activateImmediately:
              settings.activateImmediately !== false,
            timerEnabled:
              Boolean(timerEnabled),
            timerDuration,
            responseDays:
              Number(
                settings.responseDays ??
                selectedForm.responseDays ??
                30
              ) || 30,
            resultMode:
              settings.resultMode ||
              selectedForm.resultMode ||
              "none",
            accessMode,
          });
          setQuestions(loadedQuestions);
          setFormNotFound(false);
          setLoadingForm(false);
          return;
        }

        const [formResponse, questionsResponse] = await Promise.all([
          getFormById(id),
          getQuestionsByForm(id),
        ]);

        const apiForm = formResponse?.data?.data || formResponse?.data || {};
        const apiQuestions = questionsResponse?.data?.data || questionsResponse?.data || [];

        const mappedQuestions = (Array.isArray(apiQuestions) ? apiQuestions : []).map((question, index) => ({
          id: question.id || `${id}-question-${index + 1}`,
          title: String(question.question_text || question.title || ""),
          type: question.question_type ? question.question_type.toLowerCase().replace(/_/g, "-") : "short",
          required: question.is_required !== false,
          scoring: Boolean(question.is_auto_scored),
          points: Number(question.points) || 1,
          correctAnswer: String(question.correctAnswer || question.correct_answer || ""),
          options: Array.isArray(question.options)
            ? question.options.map((option) => option.option_text || option)
            : [],
          imageOptions: [],
          imageAnswerType: "",
          ratingMax: null,
        }));

        const loadedForm = {
          id,
          title: String(apiForm.title || ""),
          description: String(apiForm.description || "Form created using HiDocs Form Builder."),
          customLink: String(apiForm.custom_url || apiForm.customLink || ""),
          accessMode: apiForm.accessMode || "public",
          qrOnly: Boolean(apiForm.qrOnly),
          showInUserList: apiForm.showInUserList !== false,
          timerEnabled: Boolean(apiForm.timerEnabled),
          timerDuration: Number(apiForm.timerDuration || apiForm.duration || 20) || 20,
          responseDays: Number(apiForm.responseDays || 30) || 30,
          resultMode: apiForm.resultMode || "none",
          settings: {
            accessMode: apiForm.accessMode || "public",
            qrOnly: Boolean(apiForm.qrOnly),
            showInUserList: apiForm.showInUserList !== false,
            timerEnabled: Boolean(apiForm.timerEnabled),
            timerDuration: Number(apiForm.timerDuration || apiForm.duration || 20) || 20,
            responseDays: Number(apiForm.responseDays || 30) || 30,
            resultMode: apiForm.resultMode || "none",
          },
          timer: {
            enabled: Boolean(apiForm.timerEnabled),
            duration: Number(apiForm.timerDuration || apiForm.duration || 20) || 20,
          },
          questions: mappedQuestions,
        };

        setOriginalForm(loadedForm);
        setFormData({
          title: String(loadedForm.title || ""),
          customLink: String(loadedForm.customLink || ""),
          openDate: "",
          closeDate: "",
          openTime: "",
          closeTime: "",
          shuffleQuestions: false,
          shuffleAnswers: false,
          oneTimeOnly: true,
          activateImmediately: true,
          timerEnabled: Boolean(loadedForm.timerEnabled),
          timerDuration: Number(loadedForm.timerDuration || 20) || 20,
          responseDays: Number(loadedForm.responseDays || 30) || 30,
          resultMode: loadedForm.resultMode || "none",
          accessMode: loadedForm.accessMode || "public",
        });
        setQuestions(mappedQuestions);
        setFormNotFound(false);
      } catch (error) {
        console.error(
          "Gagal memuat form untuk diedit:",
          error
        );
        setFormNotFound(true);
      } finally {
        setLoadingForm(false);
      }
    };

    if (id) {
      loadFormForEdit();
    }
  }, [id]);
  // =========================================================
  // RANDOM LINK FEEDBACK
  // =========================================================
  const [
    linkGenerated,
    setLinkGenerated,
  ] = useState(false);
  // =========================================================
  // SAFE STORAGE READER
  // =========================================================
  const getStoredForms =
    () => {
      try {
        const storedValue =
          localStorage.getItem(
            FORMS_STORAGE_KEY
          );
        const backupValue =
          localStorage.getItem(
            NEW_FORM_STORAGE_KEY
          );
        const storedForms =
          storedValue
            ? JSON.parse(storedValue)
            : [];
        const backupForms =
          backupValue
            ? JSON.parse(backupValue)
            : [];

        const parsedStored =
          Array.isArray(storedForms)
            ? storedForms
            : [];

        const parsedBackup =
          Array.isArray(backupForms)
            ? backupForms
            : backupForms && typeof backupForms === "object"
              ? [backupForms]
              : [];

        return [...parsedStored, ...parsedBackup];
      } catch (error) {
        console.error(
          "Gagal membaca data form:",
          error
        );
        return [];
      }
    };
  // =========================================================
  // FORM CHANGE
  // =========================================================
  const handleChange = (
    event
  ) => {
    const {
      name,
      value,
      type,
      checked,
    } = event.target;
    let updatedValue =
      type === "checkbox"
        ? checked
        : value;
    // Membuat custom link aman untuk URL.
    if (
      name ===
      "customLink"
    ) {
      updatedValue =
        String(
          value
        )
          .toLowerCase()
          .replace(
            /\s+/g,
            "-"
          )
          .replace(
            /[^a-z0-9-_]/g,
            ""
          )
          .replace(
            /-+/g,
            "-"
          )
          .replace(
            /^-/,
            ""
          );
    }
    // Timer hanya boleh 1–1000 menit.
    if (
      name ===
      "timerDuration"
    ) {
      if (
        value ===
        ""
      ) {
        updatedValue =
          "";
      } else {
        const numberValue =
          Number(
            value
          );
        updatedValue =
          Number.isFinite(
            numberValue
          )
            ? Math.min(
                Math.max(
                  Math.floor(
                    numberValue
                  ),
                  1
                ),
                1000
              )
            : 1;
      }
    }
    setFormData(
      (
        previous
      ) => ({
        ...previous,
        [name]:
          updatedValue,
      })
    );
    if (
      name ===
        "title" ||
      name ===
        "customLink"
    ) {
      setLinkGenerated(
        false
      );
    }
  };
  // =========================================================
  // TIMER INPUT BLUR
  // =========================================================
  const handleTimerBlur =
    () => {
      const duration =
        Number(
          formData.timerDuration
        );
      const normalizedDuration =
        Number.isFinite(
          duration
        )
          ? Math.min(
              Math.max(
                Math.floor(
                  duration
                ),
                1
              ),
              1000
            )
          : 1;
      setFormData(
        (
          previous
        ) => ({
          ...previous,
          timerDuration:
            normalizedDuration,
        })
      );
    };
  // =========================================================
  // LINK HELPERS
  // =========================================================
  const createLinkSlug = (
    value
  ) => {
    return String(
      value ||
      ""
    )
      .trim()
      .toLowerCase()
      .normalize(
        "NFD"
      )
      .replace(
        /[\u0300-\u036f]/g,
        ""
      )
      .replace(
        /[^a-z0-9\s-]/g,
        ""
      )
      .replace(
        /\s+/g,
        "-"
      )
      .replace(
        /-+/g,
        "-"
      )
      .replace(
        /^-|-$/g,
        ""
      );
  };
  const createRandomCode =
    () => {
      return Math.random()
        .toString(
          36
        )
        .slice(
          2,
          7
        )
        .toLowerCase();
    };
  const isCustomLinkUsed = (
    customLink
  ) => {
    const storedForms =
      getStoredForms();
    return storedForms.some(
      (
        form
      ) => {
        return (
          String(
            form.customLink ||
            ""
          )
            .trim()
            .toLowerCase() ===
          String(
            customLink ||
            ""
          )
            .trim()
            .toLowerCase()
        );
      }
    );
  };
  const generateRandomLink =
    () => {
      const titleSlug =
        createLinkSlug(
          formData.title
        );
      if (!titleSlug) {
        alert(
          "Isi Form Title terlebih dahulu agar link dapat dibuat otomatis."
        );
        return;
      }
      let generatedLink =
        "";
      let attempt =
        0;
      do {
        generatedLink =
          `${titleSlug}-${createRandomCode()}`;
        attempt +=
          1;
      } while (
        isCustomLinkUsed(
          generatedLink
        ) &&
        attempt <
          20
      );
      if (
        isCustomLinkUsed(
          generatedLink
        )
      ) {
        alert(
          "Link otomatis gagal dibuat. Silakan coba kembali."
        );
        return;
      }
      setFormData(
        (
          previous
        ) => ({
          ...previous,
          customLink:
            generatedLink,
        })
      );
      setLinkGenerated(
        true
      );
      window.setTimeout(
        () => {
          setLinkGenerated(
            false
          );
        },
        1800
      );
    };
  // =========================================================
  // QUESTION TYPES
  // =========================================================
  const questionTypes = [
    {
      type: "multiple",
      label: "Multiple Choice",
      icon:
        <FaListUl />,
      className: "yellow",
    },
    {
      type: "short",
      label: "Short Text",
      icon:
        <FaFont />,
      className: "green",
    },
    {
      type: "long",
      label: "Long Text",
      icon:
        <FaAlignLeft />,
      className: "blue",
    },
    {
      type: "rating",
      label: "Rating",
      icon:
        <FaStar />,
      className: "orange",
    },
    {
      type: "yesno",
      label: "Yes / No",
      icon:
        <FaCheck />,
      className: "green",
    },
    {
      type: "math",
      label: "Math",
      icon:
        <FaCalculator />,
      className: "blue",
    },
    {
      type: "code",
      label: "Code",
      icon:
        <FaCode />,
      className: "orange",
    },
    {
      type: "image",
      label: "Image",
      icon:
        <FaImage />,
      className: "green",
    },
  ];
  // =========================================================
  // CREATE QUESTION
  // =========================================================
  const createQuestion = (type) => {
  const newQuestion = {
    id: Date.now() + Math.random(),
    title: "",
    type,
    required: true,
    // Penilaian internal admin.
    // Tidak bergantung pada resultMode user.
    scoring: false,
    points: 1,
    correctAnswer: "",
    options:
      type === "multiple"
        ? ["", ""]
        : type === "yesno"
        ? ["Yes", "No"]
        : [],
    ratingMax:
      type === "rating"
        ? 5
        : null,
    image: "",
    imageName: "",
    imageAnswerType:
      type === "image"
        ? "multiple"
        : "",
    imageOptions:
      type === "image"
        ? ["", ""]
        : [],
  };
  setQuestions((previous) => [
    ...previous,
    newQuestion,
  ]);
  window.setTimeout(() => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  }, 100);
};
  // =========================================================
  // UPDATE QUESTION
  // =========================================================
  const updateQuestion = (
    id,
    field,
    value
  ) => {
    setQuestions(
      (
        previous
      ) =>
        previous.map(
          (
            question
          ) =>
            question.id ===
            id
              ? {
                  ...question,
                  [field]:
                    value,
                }
              : question
        )
    );
  };
  // =========================================================
  // UPDATE OPTION
  // =========================================================
  const updateOption = (
    questionId,
    optionIndex,
    value
  ) => {
    setQuestions(
      (
        previous
      ) =>
        previous.map(
          (
            question
          ) => {
            if (
              question.id !==
              questionId
            ) {
              return question;
            }
            const updatedOptions = [
              ...(
                question.options ||
                []
              ),
            ];
            const previousOption =
              updatedOptions[
                optionIndex
              ];
            updatedOptions[
              optionIndex
            ] =
              value;
            return {
              ...question,
              options:
                updatedOptions,
              correctAnswer:
                question.correctAnswer ===
                previousOption
                  ? value
                  : question.correctAnswer,
            };
          }
        )
    );
  };
  // =========================================================
  // ADD OPTION
  // =========================================================
  const addOption = (
    questionId
  ) => {
    setQuestions(
      (
        previous
      ) =>
        previous.map(
          (
            question
          ) => {
            if (
              question.id !==
              questionId
            ) {
              return question;
            }
            return {
              ...question,
              options: [
                ...(
                  question.options ||
                  []
                ),
                "",
              ],
            };
          }
        )
    );
  };
  // =========================================================
  // DELETE OPTION
  // =========================================================
  const deleteOption = (
    questionId,
    optionIndex
  ) => {
    setQuestions(
      (
        previous
      ) =>
        previous.map(
          (
            question
          ) => {
            if (
              question.id !==
              questionId
            ) {
              return question;
            }
            const updatedOptions = [
              ...(
                question.options ||
                []
              ),
            ];
            if (
              updatedOptions.length <=
              2
            ) {
              return question;
            }
            const deletedOption =
              updatedOptions[
                optionIndex
              ];
            updatedOptions.splice(
              optionIndex,
              1
            );
            return {
              ...question,
              options:
                updatedOptions,
              correctAnswer:
                question.correctAnswer ===
                deletedOption
                  ? ""
                  : question.correctAnswer,
            };
          }
        )
    );
  };
  // =========================================================
  // IMAGE ANSWER OPTIONS
  // =========================================================
  const changeImageAnswerType = (
    questionId,
    answerType
  ) => {
    setQuestions(
      (
        previous
      ) =>
        previous.map(
          (
            question
          ) => {
            if (
              question.id !==
              questionId
            ) {
              return question;
            }
            return {
              ...question,
              imageAnswerType:
                answerType,
              imageOptions:
                answerType ===
                "multiple"
                  ? (
                      Array.isArray(
                        question.imageOptions
                      ) &&
                      question.imageOptions.length >= 2
                        ? question.imageOptions
                        : [
                            "",
                            "",
                          ]
                    )
                  : [],
              // Reset key because the answer format changed.
              correctAnswer: "",
            };
          }
        )
    );
  };
  const updateImageOption = (
    questionId,
    optionIndex,
    value
  ) => {
    setQuestions(
      (
        previous
      ) =>
        previous.map(
          (
            question
          ) => {
            if (
              question.id !==
              questionId
            ) {
              return question;
            }
            const updatedOptions = [
              ...(
                question.imageOptions ||
                []
              ),
            ];
            const previousOption =
              updatedOptions[
                optionIndex
              ];
            updatedOptions[
              optionIndex
            ] =
              value;
            return {
              ...question,
              imageOptions:
                updatedOptions,
              correctAnswer:
                question.correctAnswer ===
                previousOption
                  ? value
                  : question.correctAnswer,
            };
          }
        )
    );
  };
  const addImageOption = (
    questionId
  ) => {
    setQuestions(
      (
        previous
      ) =>
        previous.map(
          (
            question
          ) =>
            question.id ===
            questionId
              ? {
                  ...question,
                  imageOptions: [
                    ...(
                      question.imageOptions ||
                      []
                    ),
                    "",
                  ],
                }
              : question
        )
    );
  };
  const deleteImageOption = (
    questionId,
    optionIndex
  ) => {
    setQuestions(
      (
        previous
      ) =>
        previous.map(
          (
            question
          ) => {
            if (
              question.id !==
              questionId
            ) {
              return question;
            }
            const updatedOptions = [
              ...(
                question.imageOptions ||
                []
              ),
            ];
            if (
              updatedOptions.length <=
              2
            ) {
              return question;
            }
            const deletedOption =
              updatedOptions[
                optionIndex
              ];
            updatedOptions.splice(
              optionIndex,
              1
            );
            return {
              ...question,
              imageOptions:
                updatedOptions,
              correctAnswer:
                question.correctAnswer ===
                deletedOption
                  ? ""
                  : question.correctAnswer,
            };
          }
        )
    );
  };
  // =========================================================
  // DUPLICATE QUESTION
  // =========================================================
  const duplicateQuestion = (
    id
  ) => {
    setQuestions(
      (
        previous
      ) => {
        const questionIndex =
          previous.findIndex(
            (
              question
            ) =>
              question.id ===
              id
          );
        if (
          questionIndex ===
          -1
        ) {
          return previous;
        }
        const original =
          previous[
            questionIndex
          ];
        const duplicated = {
          ...original,
          id:
            Date.now() +
            Math.random(),
          options: [
            ...(
              original.options ||
              []
            ),
          ],
          imageOptions: [
            ...(
              original.imageOptions ||
              []
            ),
          ],
        };
        const updated = [
          ...previous,
        ];
        updated.splice(
          questionIndex +
            1,
          0,
          duplicated
        );
        return updated;
      }
    );
  };
  // =========================================================
  // DELETE QUESTION
  // =========================================================
  const deleteQuestion = (
    id
  ) => {
    const confirmed =
      window.confirm(
        "Hapus pertanyaan ini?"
      );
    if (!confirmed) {
      return;
    }
    setQuestions(
      (
        previous
      ) =>
        previous.filter(
          (
            question
          ) =>
            question.id !==
            id
        )
    );
  };
  // =========================================================
  // CHANGE QUESTION TYPE
  // =========================================================
  const changeQuestionType = (
    id,
    type
  ) => {
    setQuestions(
      (
        previous
      ) =>
        previous.map(
          (
            question
          ) => {
            if (
              question.id !==
              id
            ) {
              return question;
            }
            return {
              ...question,
              type,
              options:
                type ===
                "multiple"
                  ? [
                      "",
                      "",
                    ]
                  : type ===
                    "yesno"
                  ? [
                      "Yes",
                      "No",
                    ]
                  : [],
              ratingMax:
                type ===
                "rating"
                  ? 5
                  : null,
              image:
                type ===
                "image"
                  ? question.image ||
                    ""
                  : "",
              imageName:
                type ===
                "image"
                  ? question.imageName ||
                    ""
                  : "",
              imageAnswerType:
                type ===
                "image"
                  ? question.imageAnswerType ||
                    "multiple"
                  : "",
              imageOptions:
                type ===
                "image"
                  ? (
                      Array.isArray(
                        question.imageOptions
                      ) &&
                      question.imageOptions.length >= 2
                        ? question.imageOptions
                        : [
                            "",
                            "",
                          ]
                    )
                  : [],
              // Jangan membawa kunci jawaban dari tipe lama.
              correctAnswer: "",
            };
          }
        )
    );
  };
  // =========================================================
  // QUESTION IMAGE UPLOAD
  // =========================================================
  const handleQuestionImageUpload = (
    questionId,
    event
  ) => {
    const file =
      event.target.files?.[0];
    if (!file) {
      return;
    }
    if (
      !ALLOWED_IMAGE_TYPES.includes(
        file.type
      )
    ) {
      alert(
        "Format gambar harus JPG, JPEG, PNG, atau WEBP."
      );
      event.target.value =
        "";
      return;
    }
    if (
      file.size >
      MAXIMUM_IMAGE_SIZE
    ) {
      alert(
        "Ukuran gambar maksimal 1 MB. Silakan kompres gambar terlebih dahulu."
      );
      event.target.value =
        "";
      return;
    }
    const fileReader =
      new FileReader();
    fileReader.onload =
      () => {
        const imageResult =
          String(
            fileReader.result ||
            ""
          );
        setQuestions(
          (
            previous
          ) =>
            previous.map(
              (
                question
              ) => {
                if (
                  question.id !==
                  questionId
                ) {
                  return question;
                }
                return {
                  ...question,
                  image:
                    imageResult,
                  imageName:
                    file.name,
                };
              }
            )
        );
      };
    fileReader.onerror =
      () => {
        alert(
          "Gambar gagal dibaca. Silakan pilih gambar lain."
        );
      };
    fileReader.readAsDataURL(
      file
    );
  };
  // =========================================================
  // REMOVE QUESTION IMAGE
  // =========================================================
  const removeQuestionImage = (
    questionId
  ) => {
    setQuestions(
      (
        previous
      ) =>
        previous.map(
          (
            question
          ) => {
            if (
              question.id !==
              questionId
            ) {
              return question;
            }
            return {
              ...question,
              image: "",
              imageName: "",
            };
          }
        )
    );
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
  const getScheduleValues =
    () => {
      const openAt =
        buildScheduleDateTime(
          formData.openDate,
          formData.openTime,
          "00:00"
        );
      const closeAt =
        buildScheduleDateTime(
          formData.closeDate,
          formData.closeTime,
          "23:59"
        );
      return {
        enabled:
          Boolean(
            openAt ||
            closeAt
          ),
        openAt,
        closeAt,
      };
    };
  // =========================================================
  // VALIDATE INFO
  // =========================================================
  const validateInfo =
    () => {
      const cleanTitle =
        formData.title.trim();
      if (!cleanTitle) {
        alert("Silakan isi Form Title terlebih dahulu.");
        setActiveTab("info");
        return false;
      }
      if (cleanTitle.length < 3) {
        alert("Form Title minimal 3 karakter.");
        setActiveTab("info");
        return false;
      }
      return true;
    };
  // =========================================================
  // VALIDATE SETTINGS
  // =========================================================
  const validateSettings =
    () => {
      if (!formData.timerEnabled) {
        return true;
      }
      const timerDuration =
        Number(formData.timerDuration);
      if (
        !Number.isFinite(timerDuration) ||
        timerDuration < 1 ||
        timerDuration > 1000
      ) {
        alert("Durasi timer harus antara 1 sampai 1000 menit.");
        setActiveTab("settings");
        return false;
      }
      return true;
    };
  // =========================================================
  // VALIDATE QUESTIONS
  // =========================================================
  const validateQuestions =
    () => {
      if (
        questions.length ===
        0
      ) {
        alert(
          "Tambahkan minimal satu pertanyaan."
        );
        setActiveTab(
          "questions"
        );
        return false;
      }
      const emptyQuestionIndex =
        questions.findIndex(
          (
            question
          ) =>
            !String(
              question.title ||
              ""
            ).trim()
        );
      if (
        emptyQuestionIndex !==
        -1
      ) {
        alert(
          `Judul pertanyaan nomor ${
            emptyQuestionIndex +
            1
          } belum diisi.`
        );
        setActiveTab(
          "questions"
        );
        return false;
      }
      const invalidMultipleIndex =
        questions.findIndex(
          (
            question
          ) => {
            if (
              question.type !==
              "multiple"
            ) {
              return false;
            }
            return (
              !Array.isArray(
                question.options
              ) ||
              question.options.length <
                2 ||
              question.options.some(
                (
                  option
                ) =>
                  !String(
                    option ||
                    ""
                  ).trim()
              )
            );
          }
        );
      if (
        invalidMultipleIndex !==
        -1
      ) {
        alert(
          `Semua pilihan jawaban pada pertanyaan nomor ${
            invalidMultipleIndex +
            1
          } harus diisi.`
        );
        setActiveTab(
          "questions"
        );
        return false;
      }
      const invalidImageIndex =
        questions.findIndex(
          (
            question
          ) => {
            return (
              question.type ===
                "image" &&
              !String(
                question.image ||
                ""
              ).trim()
            );
          }
        );
      if (
        invalidImageIndex !==
        -1
      ) {
        alert(
          `Gambar pada pertanyaan nomor ${
            invalidImageIndex +
            1
          } belum dipilih.`
        );
        setActiveTab(
          "questions"
        );
        return false;
      }
      const invalidImageOptionsIndex =
        questions.findIndex(
          (
            question
          ) => {
            if (
              question.type !==
                "image" ||
              question.imageAnswerType !==
                "multiple"
            ) {
              return false;
            }
            return (
              !Array.isArray(
                question.imageOptions
              ) ||
              question.imageOptions.length <
                2 ||
              question.imageOptions.some(
                (
                  option
                ) =>
                  !String(
                    option ||
                    ""
                  ).trim()
              )
            );
          }
        );
      if (
        invalidImageOptionsIndex !==
        -1
      ) {
        alert(
          `Semua pilihan jawaban gambar pada pertanyaan nomor ${
            invalidImageOptionsIndex +
            1
          } harus diisi.`
        );
        setActiveTab(
          "questions"
        );
        return false;
      }
      const invalidScoringIndex =
        questions.findIndex(
          (
            question
          ) => {
            if (
              !question.scoring
            ) {
              return false;
            }
            const points =
              Number(
                question.points
              );
            return (
              !Number.isFinite(
                points
              ) ||
              points <=
                0 ||
              !String(
                question.correctAnswer ??
                ""
              ).trim()
            );
          }
        );
      if (
        invalidScoringIndex !==
        -1
      ) {
        alert(
          `Pertanyaan nomor ${
            invalidScoringIndex +
            1
          } memakai scoring. Isi poin dan kunci jawaban terlebih dahulu.`
        );
        setActiveTab(
          "questions"
        );
        return false;
      }
      /*
        IMPORTANT:
        Scoring is an internal grading feature for admin.
        resultMode only controls what respondents can see:
        - none   = respondent cannot view result/score
        - result = respondent can review submitted answers only
        - score  = respondent can review answers + correctness + score
        Therefore scoring can remain enabled even when resultMode
        is "none" or "result".
      */
      return true;
    };
  // =========================================================
  // TAB NAVIGATION
  // =========================================================
  const changeTab = (
    tab
  ) => {
    if (
      tab ===
      "info"
    ) {
      setActiveTab(
        "info"
      );
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
      return;
    }
    if (
      !validateInfo()
    ) {
      return;
    }
    if (
      tab ===
        "questions" &&
      !validateSettings()
    ) {
      return;
    }
    setActiveTab(
      tab
    );
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };
  const handleNextStep =
    () => {
      if (
        activeTab ===
          "info" &&
        !validateInfo()
      ) {
        return;
      }
      if (
        activeTab ===
          "settings" &&
        !validateSettings()
      ) {
        return;
      }
      if (
        activeTabIndex <
        tabOrder.length -
          1
      ) {
        setActiveTab(
          tabOrder[
            activeTabIndex +
              1
          ]
        );
        window.scrollTo({
          top: 0,
          behavior: "smooth",
        });
      }
    };
  const handlePreviousStep =
    () => {
      if (
        activeTabIndex <=
        0
      ) {
        return;
      }
      setActiveTab(
        tabOrder[
          activeTabIndex -
            1
        ]
      );
      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    };
  // =========================================================
  // SAVE CHANGES
  // =========================================================
  const handleSave =
    async () => {
      if (
        !validateInfo() ||
        !validateSettings() ||
        !validateQuestions()
      ) {
        return;
      }
      if (!originalForm) {
        alert("Data form tidak ditemukan.");
        return;
      }
      const normalizedTimerDuration =
        formData.timerEnabled
          ? Math.min(
              Math.max(
                Math.floor(
                  Number(formData.timerDuration) || 1
                ),
                1
              ),
              1000
            )
          : null;
      const responseDays =
        Number(formData.responseDays) || 30;
      const isPublicForm =
        formData.accessMode === "public";
      const normalizedQuestions =
        questions.map((question, index) => {
          const scoringEnabled =
            Boolean(question.scoring);
          const normalizedPoints =
            scoringEnabled
              ? Math.max(
                  Number(question.points) || 1,
                  1
                )
              : 0;
          const normalizedCorrectAnswer =
            scoringEnabled
              ? String(
                  question.correctAnswer ?? ""
                ).trim()
              : "";
          const normalizedOptions =
            (
              question.type === "image" &&
              question.imageAnswerType === "multiple"
                ? question.imageOptions || []
                : question.type === "yesno"
                ? (
                    Array.isArray(question.options) &&
                    question.options.length
                      ? question.options
                      : ["Yes", "No"]
                  )
                : question.options || []
            ).map((option) =>
              String(option || "").trim()
            );
          return {
            ...question,
            number: index + 1,
            title:
              String(question.title || "").trim(),
            question:
              String(question.title || "").trim(),
            required:
              question.required !== false,
            scoring:
              scoringEnabled,
            points:
              normalizedPoints,
            correctAnswer:
              normalizedCorrectAnswer,
            grading: {
              enabled: scoringEnabled,
              points: normalizedPoints,
              correctAnswer: normalizedCorrectAnswer,
            },
            options:
              normalizedOptions,
            imageAnswerType:
              question.type === "image"
                ? question.imageAnswerType || "multiple"
                : "",
            imageOptions:
              question.type === "image" &&
              question.imageAnswerType === "multiple"
                ? (question.imageOptions || []).map(
                    (option) =>
                      String(option || "").trim()
                  )
                : [],
            image:
              String(question.image || "").trim(),
            imageName:
              String(question.imageName || "").trim(),
          };
        });
      const gradingEnabled =
        normalizedQuestions.some(
          (question) => question.scoring
        );
      const updatedForm = {
        ...originalForm,
        title:
          formData.title.trim(),
        accessMode:
          formData.accessMode,
        showInUserList:
          isPublicForm,
        qrOnly:
          !isPublicForm,
        timerEnabled:
          Boolean(formData.timerEnabled),
        timerDuration:
          normalizedTimerDuration,
        duration:
          normalizedTimerDuration,
        responseDays,
        settings: {
          ...(
            originalForm.settings &&
            typeof originalForm.settings === "object"
              ? originalForm.settings
              : {}
          ),
          shuffleQuestions:
            Boolean(formData.shuffleQuestions),
          shuffleAnswers:
            Boolean(formData.shuffleAnswers),
          oneTimeOnly:
            Boolean(formData.oneTimeOnly),
          activateImmediately:
            Boolean(formData.activateImmediately),
          timerEnabled:
            Boolean(formData.timerEnabled),
          timerDuration:
            normalizedTimerDuration,
          responseDays,
          resultMode:
            formData.resultMode,
          accessMode:
            formData.accessMode,
          showInUserList:
            isPublicForm,
          qrOnly:
            !isPublicForm,
        },
        resultMode:
          formData.resultMode,
        grading: {
          ...(
            originalForm.grading &&
            typeof originalForm.grading === "object"
              ? originalForm.grading
              : {}
          ),
          enabled:
            gradingEnabled,
          scoredQuestions:
            normalizedQuestions.filter(
              (question) => question.scoring
            ).length,
          totalPoints:
            normalizedQuestions.reduce(
              (total, question) =>
                total +
                (question.scoring
                  ? Number(question.points) || 0
                  : 0),
              0
            ),
          calculateForAdmin: true,
          userResultMode:
            formData.resultMode,
        },
        questions:
          normalizedQuestions,
        updatedAt:
          new Date().toISOString(),
      };

      try {
        const existingForms =
          getStoredForms();
        const formIndex =
          existingForms.findIndex(
            (item) =>
              String(item.id) ===
              String(id)
          );

        const normalizedLink =
          String(formData.customLink || "").trim();

        try {
          await updateForm(String(id), {
            title: formData.title.trim(),
            description: originalForm.description || "Form created using HiDocs Form Builder.",
            type: originalForm.type || "SURVEY",
            custom_url: normalizedLink,
            status: "ACTIVE",
          });

          await updateFormSettings(String(id), {
            duration_minutes: formData.timerEnabled ? normalizedTimerDuration : null,
            auto_active_days: responseDays,
            is_active_immediately: Boolean(formData.activateImmediately),
            is_one_time_submission: Boolean(formData.oneTimeOnly),
            randomize_questions: Boolean(formData.shuffleQuestions),
            randomize_options: Boolean(formData.shuffleAnswers),
            start_time: formData.openDate ? new Date(`${formData.openDate}T${formData.openTime || '00:00'}:00`).toISOString() : null,
            end_time: formData.closeDate ? new Date(`${formData.closeDate}T${formData.closeTime || '23:59'}:00`).toISOString() : null,
          });
        } catch (apiError) {
          console.warn("Update form via API gagal, tetap simpan ke localStorage:", apiError);
        }

        if (formIndex === -1) {
          const localForms = [...existingForms, updatedForm];
          localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(localForms));
        } else {
          const updatedForms =
            existingForms.map((item) =>
              String(item.id) === String(id)
                ? updatedForm
                : item
            );
          localStorage.setItem(
            FORMS_STORAGE_KEY,
            JSON.stringify(updatedForms)
          );
        }

        localStorage.setItem(
          NEW_FORM_STORAGE_KEY,
          JSON.stringify(updatedForm)
        );

        window.dispatchEvent(
          new CustomEvent(
            "hidocs-forms-updated",
            {
              detail: {
                formId: updatedForm.id,
                type: "form-edited",
              },
            }
          )
        );
        alert("Perubahan form berhasil disimpan.");
        navigate(
          `/creator/forms/${id}`,
          { replace: true }
        );
      } catch (error) {
        console.error(
          "Gagal menyimpan perubahan form:",
          error
        );
        if (error?.name === "QuotaExceededError") {
          alert(
            "Perubahan gagal disimpan karena kapasitas penyimpanan browser penuh."
          );
        } else {
          alert("Perubahan form gagal disimpan.");
        }
      }
    };
  // =========================================================
  // INFO TAB
  // =========================================================
  const renderInfoTab =
    () => (
      <div className="create-form-content edit-form-info-content">
        <section className="create-section">
          <div className="create-section-title">
            <div className="create-section-icon">
              <FaInfoCircle />
            </div>
            <div>
              <span>Step 1</span>
              <h2>Basic Information</h2>
            </div>
          </div>
          <div className="edit-form-information-note">
            <FaInfoCircle />
            <div>
              <strong>Edit form title</strong>
              <span>
                Custom link dan jadwal buka/tutup tetap dipertahankan.
                Jadwal dapat diubah dari Form Details.
              </span>
            </div>
          </div>
          <div className="create-field">
            <label htmlFor="form-title">
              Form Title
              <span>*</span>
            </label>
            <div className="create-input-wrapper">
              <FaInfoCircle />
              <input
                id="form-title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Form title"
                maxLength={100}
              />
            </div>
          </div>
          <div className="edit-form-locked-info">
            <div>
              <span>Form Link</span>
              <strong>
                hidocs.app/r/{formData.customLink || "-"}
              </strong>
            </div>
            <span className="edit-form-locked-badge">
              Locked
            </span>
          </div>
        </section>
      </div>
    );
  // =========================================================
  // TOGGLE COMPONENT
  // =========================================================
  const renderToggle = (
    name,
    icon,
    title,
    description
  ) => (
    <label className="setting-option">
      <div className="setting-option-icon">
        {icon}
      </div>
      <div className="setting-option-content">
        <strong>
          {title}
        </strong>
        <span>
          {description}
        </span>
      </div>
      <input
        type="checkbox"
        name={name}
        checked={
          Boolean(
            formData[name]
          )
        }
        onChange={
          handleChange
        }
      />
      <span className="toggle-switch">
        <span className="toggle-circle"></span>
      </span>
    </label>
  );
  // =========================================================
  // VISIBILITY SETTINGS
  // =========================================================
  const renderVisibilitySettings =
    () => (
      <section className="settings-section">
        <div className="settings-section-title">
          <div className="settings-title-icon blue">
            <FaGlobe />
          </div>
          <div>
            <small>
              Distribution
            </small>
            <span>
              Form Visibility
            </span>
          </div>
        </div>
        <div className="visibility-options">
          {[
            {
              value: "public",
              icon:
                <FaGlobe />,
              iconClass: "public",
              title: "Public Form",
              description: "The form automatically appears on the user dashboard and Forms page.",
              information: "Suitable for forms that should be visible to every user.",
            },
            {
              value: "qr-only",
              icon:
                <FaQrcode />,
              iconClass: "qr",
              title: "QR Code Only",
              description: "The form stays hidden and can only be opened using its QR code or direct link.",
              information: "Suitable for private events or limited participants.",
            },
          ].map(
            (
              item
            ) => (
              <label
                key={
                  item.value
                }
                className={
                  formData.accessMode ===
                  item.value
                    ? `visibility-option ${
                        item.value ===
                        "qr-only"
                          ? "qr-only "
                          : ""
                      }selected`
                    : `visibility-option ${
                        item.value ===
                        "qr-only"
                          ? "qr-only"
                          : ""
                      }`
                }
              >
                <div
                  className={
                    `visibility-option-icon ${item.iconClass}`
                  }
                >
                  {item.icon}
                </div>
                <div className="visibility-option-content">
                  <strong>
                    {item.title}
                  </strong>
                  <span>
                    {item.description}
                  </span>
                  <small>
                    {item.information}
                  </small>
                </div>
                <input
                  type="radio"
                  name="accessMode"
                  value={
                    item.value
                  }
                  checked={
                    formData.accessMode ===
                    item.value
                  }
                  onChange={
                    handleChange
                  }
                />
                <span className="visibility-radio">
                  <span></span>
                </span>
              </label>
            )
          )}
        </div>
        <div
          className={
            formData.accessMode ===
            "qr-only"
              ? "visibility-information qr"
              : "visibility-information public"
          }
        >
          {formData.accessMode ===
          "qr-only" ? (
            <>
              <FaQrcode />
              <div>
                <strong>
                  QR Code access enabled
                </strong>
                <span>
                  This form will not appear automatically in user lists, but remains accessible through QR and custom link.
                </span>
              </div>
            </>
          ) : (
            <>
              <FaGlobe />
              <div>
                <strong>
                  Public distribution enabled
                </strong>
                <span>
                  This form will automatically appear to users when the form is active.
                </span>
              </div>
            </>
          )}
        </div>
      </section>
    );
  // =========================================================
  // SETTINGS TAB
  // =========================================================
  const renderSettingsTab =
    () => (
      <div className="settings-page">
        <section className="settings-section">
          <div className="settings-section-title">
            <div className="settings-title-icon blue">
              <FaCog />
            </div>
            <div>
              <small>
                Step 2
              </small>
              <span>
                Form Options
              </span>
            </div>
          </div>
          {renderToggle(
            "shuffleQuestions",
            <FaRandom />,
            "Shuffle question order",
            "Each respondent gets a different question order."
          )}
          {renderToggle(
            "shuffleAnswers",
            <FaRandom />,
            "Shuffle answer options",
            "Answer options are randomized for every respondent."
          )}
          {renderToggle(
            "oneTimeOnly",
            <FaLock />,
            "One-time submission only",
            "Respondents cannot submit the same form more than once."
          )}
          {renderToggle(
            "activateImmediately",
            <FaPowerOff />,
            "Activate immediately",
            "The form becomes active immediately or after its opening schedule."
          )}
        </section>
        <section className="settings-section">
          <div className="settings-section-title">
            <div className="settings-title-icon blue">
              <FaClock />
            </div>
            <div>
              <small>
                Time Limit
              </small>
              <span>
                Response Timer
              </span>
            </div>
          </div>
          {renderToggle(
            "timerEnabled",
            <FaHourglassHalf />,
            "Enable response timer",
            "Automatically end the form when the respondent runs out of time."
          )}
          <div
            className={
              formData.timerEnabled
                ? "response-timer-duration"
                : "response-timer-duration disabled"
            }
          >
            <div className="response-timer-duration-icon">
              <FaClock />
            </div>
            <div className="response-timer-duration-content">
              <strong>
                Time limit per response
              </strong>
              <span>
                Set the working time between 1 and 1000 minutes.
              </span>
            </div>
            <div className="response-timer-input-wrapper">
              <input
                type="number"
                name="timerDuration"
                min="1"
                max="1000"
                step="1"
                value={
                  formData.timerDuration
                }
                onChange={
                  handleChange
                }
                onBlur={
                  handleTimerBlur
                }
                disabled={
                  !formData.timerEnabled
                }
              />
              <span>
                minutes
              </span>
            </div>
          </div>
          <div
            className={
              formData.timerEnabled
                ? "response-timer-information active"
                : "response-timer-information"
            }
          >
            <FaHourglassHalf />
            <div>
              <strong>
                {formData.timerEnabled
                  ? `${formData.timerDuration || 1} minute timer enabled`
                  : "Timer is disabled"
                }
              </strong>
              <span>
                {formData.timerEnabled
                  ? "When time runs out, the form will close automatically and the attempt can be recorded as Time Expired."
                  : "Respondents can complete the form without a countdown."
                }
              </span>
            </div>
          </div>
          <div className="timer-card">
            <div className="timer-card-icon">
              <FaCalendarAlt />
            </div>
            <div className="timer-card-content">
              <strong>
                Response availability
              </strong>
              <span>
                The form can receive responses for{" "}
                {formData.responseDays} days.
              </span>
            </div>
            <div className="timer-card-select">
              <select
                name="responseDays"
                value={
                  formData.responseDays
                }
                onChange={
                  handleChange
                }
              >
                <option value="7">
                  7 days
                </option>
                <option value="14">
                  14 days
                </option>
                <option value="30">
                  30 days
                </option>
                <option value="60">
                  60 days
                </option>
                <option value="90">
                  90 days
                </option>
              </select>
            </div>
          </div>
        </section>
        {renderVisibilitySettings()}
        <section className="settings-section">
          <div className="settings-section-title">
            <div className="settings-title-icon blue">
              <FaChartBar />
            </div>
            <div>
              <small>
                Submission
              </small>
              <span>
                Result &amp; Score
              </span>
            </div>
          </div>
          {[
            {
              value: "none",
              icon:
                <FaEyeSlash />,
              title: "Do not show results",
              description: "Respondents cannot see their result or score.",
            },
            {
              value: "result",
              icon:
                <FaEye />,
              title: "Show result only",
              description: "Respondents can see the result without the score.",
            },
            {
              value: "score",
              icon:
                <FaTrophy />,
              title: "Show result and score",
              description: "Respondents can see both their result and final score.",
            },
          ].map(
            (
              item
            ) => (
              <label
                key={
                  item.value
                }
                className={
                  formData.resultMode ===
                  item.value
                    ? "result-option selected"
                    : "result-option"
                }
              >
                <div className="result-icon">
                  {item.icon}
                </div>
                <div className="result-content">
                  <strong>
                    {item.title}
                  </strong>
                  <span>
                    {item.description}
                  </span>
                </div>
                <input
                  type="radio"
                  name="resultMode"
                  value={
                    item.value
                  }
                  checked={
                    formData.resultMode ===
                    item.value
                  }
                  onChange={
                    handleChange
                  }
                />
              </label>
            )
          )}
        </section>
      </div>
    );
  // =========================================================
  // QUESTION HELPERS
  // =========================================================
  const getQuestionTypeLabel = (
    type
  ) => {
    return (
      questionTypes.find(
        (
          item
        ) =>
          item.type ===
          type
      )?.label ||
      "Question"
    );
  };
  const getQuestionTypeIcon = (
    type
  ) => {
    return (
      questionTypes.find(
        (
          item
        ) =>
          item.type ===
          type
      )?.icon ||
      <FaQuestionCircle />
    );
  };
  // =========================================================
  // QUESTION BODY
  // =========================================================
  const renderQuestionBody = (
    question
  ) => {
    if (
      question.type ===
      "multiple"
    ) {
      return (
        <div className="question-options-area">
          <div className="answer-options-header">
            <span>
              Answer Options
            </span>
            <small>
              {
                (
                  question.options ||
                  []
                ).length
              } options
            </small>
          </div>
          <div className="answer-options-list">
            {(
              question.options ||
              []
            ).map(
              (
                option,
                index
              ) => (
                <div
                  className="answer-option-row"
                  key={
                    `${question.id}-${index}`
                  }
                >
                  <span className="answer-radio">
                    <FaCircle />
                  </span>
                  <input
                    type="text"
                    value={
                      option
                    }
                    onChange={(event) =>
                      updateOption(
                        question.id,
                        index,
                        event.target.value
                      )
                    }
                    placeholder={
                      `Option ${index + 1}`
                    }
                  />
                  {question.options
                    .length >
                    2 && (
                    <button
                      type="button"
                      className="remove-option-btn"
                      onClick={() =>
                        deleteOption(
                          question.id,
                          index
                        )
                      }
                    >
                      <FaMinus />
                    </button>
                  )}
                </div>
              )
            )}
          </div>
          <button
            type="button"
            className="add-option-btn"
            onClick={() =>
              addOption(
                question.id
              )
            }
          >
            <FaPlus />
            <span>
              Add option
            </span>
          </button>
        </div>
      );
    }
    if (
      question.type ===
      "short"
    ) {
      return (
        <div className="preview-answer-box">
          <input
            type="text"
            disabled
            placeholder="Short answer text"
          />
        </div>
      );
    }
    if (
      question.type ===
      "long"
    ) {
      return (
        <div className="preview-answer-box">
          <textarea
            disabled
            placeholder="Long answer text"
          />
        </div>
      );
    }
    if (
      question.type ===
      "rating"
    ) {
      return (
        <div className="rating-preview">
          {[1, 2, 3, 4, 5].map(
            (
              number
            ) => (
              <div
                className="rating-item"
                key={
                  number
                }
              >
                <FaStar />
                <span>
                  {number}
                </span>
              </div>
            )
          )}
        </div>
      );
    }
    if (
      question.type ===
      "yesno"
    ) {
      return (
        <div className="yesno-preview">
          <div className="yesno-item">
            <span>
              ○
            </span>
            Yes
          </div>
          <div className="yesno-item">
            <span>
              ○
            </span>
            No
          </div>
        </div>
      );
    }
    if (
      question.type ===
      "math"
    ) {
      return (
        <div className="special-question-box">
          <FaCalculator />
          <span>
            Respondent will enter a mathematical expression.
          </span>
        </div>
      );
    }
    if (
      question.type ===
      "code"
    ) {
      return (
        <div className="code-preview-box">
          <span>
            &lt;/&gt;
          </span>
          Enter code answer...
        </div>
      );
    }
    if (
      question.type ===
      "image"
    ) {
      return (
        <div className="image-question-area">
          <label>
            Question Image
          </label>
          <div className="question-image-upload-box">
            <input
              id={
                `question-image-${question.id}`
              }
              type="file"
              accept="image/jpeg,image/jpg,image/png,image/webp"
              className="question-image-file-input"
              onChange={(event) =>
                handleQuestionImageUpload(
                  question.id,
                  event
                )
              }
            />
            <label
              htmlFor={
                `question-image-${question.id}`
              }
              className="question-image-upload-label"
            >
              <span className="question-image-upload-icon">
                <FaImage />
              </span>
              <span className="question-image-upload-content">
                <strong>
                  {question.image
                    ? "Change Image"
                    : "Choose Image From Device"
                  }
                </strong>
                <small>
                  JPG, JPEG, PNG, or WEBP.
                  Maximum size 1 MB.
                </small>
              </span>
              <span className="question-image-upload-button">
                Browse File
              </span>
            </label>
          </div>
          {question.image && (
            <div className="question-image-preview">
              <div className="question-image-preview-header">
                <div>
                  <strong>
                    Image Preview
                  </strong>
                  <span>
                    {question.imageName ||
                      "Uploaded image"}
                  </span>
                </div>
                <button
                  type="button"
                  className="remove-question-image-btn"
                  onClick={() =>
                    removeQuestionImage(
                      question.id
                    )
                  }
                >
                  <FaTrash />
                  <span>
                    Remove
                  </span>
                </button>
              </div>
              <img
                src={
                  question.image
                }
                alt={
                  question.imageName ||
                  "Question preview"
                }
              />
            </div>
          )}
          <div className="image-answer-settings">
            <div className="answer-options-header">
              <span>
                Answer Type
              </span>
              <small>
                Choose how respondents answer this image question.
              </small>
            </div>
            <div className="image-answer-type-options">
              {[
                {
                  value: "multiple",
                  label: "Multiple Choice",
                  icon:
                    <FaListUl />,
                },
                {
                  value: "short",
                  label: "Short Text",
                  icon:
                    <FaFont />,
                },
                {
                  value: "long",
                  label: "Long Text",
                  icon:
                    <FaAlignLeft />,
                },
              ].map(
                (
                  item
                ) => (
                  <label
                    key={
                      item.value
                    }
                    className={
                      question.imageAnswerType ===
                      item.value
                        ? "image-answer-type-option selected"
                        : "image-answer-type-option"
                    }
                  >
                    <input
                      type="radio"
                      name={
                        `image-answer-type-${question.id}`
                      }
                      value={
                        item.value
                      }
                      checked={
                        question.imageAnswerType ===
                        item.value
                      }
                      onChange={() =>
                        changeImageAnswerType(
                          question.id,
                          item.value
                        )
                      }
                    />
                    <span>
                      {item.icon}
                    </span>
                    <strong>
                      {item.label}
                    </strong>
                  </label>
                )
              )}
            </div>
            {question.imageAnswerType ===
            "multiple" ? (
              <div className="question-options-area image-answer-options-area">
                <div className="answer-options-header">
                  <span>
                    Answer Options
                  </span>
                  <small>
                    {(
                      question.imageOptions ||
                      []
                    ).length} options
                  </small>
                </div>
                <div className="answer-options-list">
                  {(
                    question.imageOptions ||
                    []
                  ).map(
                    (
                      option,
                      optionIndex
                    ) => (
                      <div
                        className="answer-option-row"
                        key={
                          `${question.id}-image-option-${optionIndex}`
                        }
                      >
                        <span className="answer-radio">
                          <FaCircle />
                        </span>
                        <input
                          type="text"
                          value={
                            option
                          }
                          onChange={(event) =>
                            updateImageOption(
                              question.id,
                              optionIndex,
                              event.target.value
                            )
                          }
                          placeholder={
                            `Option ${optionIndex + 1}`
                          }
                        />
                        {(
                          question.imageOptions ||
                          []
                        ).length > 2 && (
                          <button
                            type="button"
                            className="remove-option-btn"
                            onClick={() =>
                              deleteImageOption(
                                question.id,
                                optionIndex
                              )
                            }
                          >
                            <FaMinus />
                          </button>
                        )}
                      </div>
                    )
                  )}
                </div>
                <button
                  type="button"
                  className="add-option-btn"
                  onClick={() =>
                    addImageOption(
                      question.id
                    )
                  }
                >
                  <FaPlus />
                  <span>
                    Add option
                  </span>
                </button>
              </div>
            ) : question.imageAnswerType ===
              "long" ? (
              <div className="preview-answer-box">
                <textarea
                  disabled
                  placeholder="Long answer text"
                />
              </div>
            ) : (
              <div className="preview-answer-box">
                <input
                  type="text"
                  disabled
                  placeholder="Short answer text"
                />
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };
  // =========================================================
  // QUESTION CARD
  // =========================================================
  const renderQuestionCard = (
    question,
    index
  ) => (
    <article
      className="builder-question-card"
      key={
        question.id
      }
    >
      <div className="builder-question-top">
        <div className="builder-question-heading">
          <span className="question-number-badge">
            {index + 1}
          </span>
          <span className="question-type-icon">
            {getQuestionTypeIcon(
              question.type
            )}
          </span>
          <strong>
            {getQuestionTypeLabel(
              question.type
            )}
          </strong>
        </div>
        <div className="question-card-actions">
          <button
            type="button"
            title="Duplicate question"
            onClick={() =>
              duplicateQuestion(
                question.id
              )
            }
          >
            <FaCopy />
          </button>
          <button
            type="button"
            title="Delete question"
            className="delete-question"
            onClick={() =>
              deleteQuestion(
                question.id
              )
            }
          >
            <FaTrash />
          </button>
        </div>
      </div>
      <div className="question-type-select-wrapper">
        <select
          value={
            question.type
          }
          onChange={(event) =>
            changeQuestionType(
              question.id,
              event.target.value
            )
          }
        >
          {questionTypes.map(
            (
              item
            ) => (
              <option
                key={
                  item.type
                }
                value={
                  item.type
                }
              >
                {item.label}
              </option>
            )
          )}
        </select>
      </div>
      <div className="question-main-input">
        <div className="question-input-icon">
          <FaQuestionCircle />
        </div>
        <textarea
          value={
            question.title
          }
          onChange={(event) =>
            updateQuestion(
              question.id,
              "title",
              event.target.value
            )
          }
          placeholder="Write your question here..."
          rows={2}
          maxLength={500}
        />
      </div>
      {renderQuestionBody(
        question
      )}
      <div className="question-setting-card">
        <div className="question-setting-icon">
          <FaTrophy />
        </div>
        <div className="question-setting-content">
          <strong>
            Question scoring
          </strong>
          <span>
            Assign points to this question.
          </span>
        </div>
        {question.scoring && (
          <div className="points-input">
            <input
              type="number"
              min="1"
              value={
                question.points
              }
              onChange={(event) =>
                updateQuestion(
                  question.id,
                  "points",
                  Number(
                    event.target.value
                  )
                )
              }
            />
            <span>
              pts
            </span>
          </div>
        )}
        <label className="small-toggle">
          <input
            type="checkbox"
            checked={
              question.scoring
            }
            onChange={(event) =>
              updateQuestion(
                question.id,
                "scoring",
                event.target.checked
              )
            }
          />
          <span className="small-toggle-track">
            <span className="small-toggle-circle"></span>
          </span>
        </label>
      </div>
      {question.scoring && (
        <div className="create-field">
          <label
            htmlFor={`correct-answer-${question.id}`}
          >
            Correct Answer
            <span>
              *
            </span>
          </label>
          {(question.type === "multiple" ||
            question.type === "yesno" ||
            (
              question.type === "image" &&
              question.imageAnswerType === "multiple"
            )) ? (
            <div className="create-input-wrapper">
              <FaCheck />
              <select
                id={`correct-answer-${question.id}`}
                value={
                  question.correctAnswer ||
                  ""
                }
                onChange={(event) =>
                  updateQuestion(
                    question.id,
                    "correctAnswer",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select correct answer
                </option>
                {(
                  question.type === "image"
                    ? question.imageOptions || []
                    : question.type === "yesno"
                    ? (
                        question.options?.length
                          ? question.options
                          : ["Yes", "No"]
                      )
                    : question.options || []
                ).filter(
                  (option) =>
                    String(
                      option ||
                      ""
                    ).trim()
                ).map(
                  (
                    option,
                    optionIndex
                  ) => (
                    <option
                      key={`${question.id}-correct-${optionIndex}`}
                      value={option}
                    >
                      {option}
                    </option>
                  )
                )}
              </select>
            </div>
          ) : question.type === "rating" ? (
            <div className="create-input-wrapper">
              <FaStar />
              <select
                id={`correct-answer-${question.id}`}
                value={
                  question.correctAnswer ||
                  ""
                }
                onChange={(event) =>
                  updateQuestion(
                    question.id,
                    "correctAnswer",
                    event.target.value
                  )
                }
              >
                <option value="">
                  Select correct rating
                </option>
                {Array.from({
                  length:
                    question.ratingMax || 5,
                }).map(
                  (_, ratingIndex) => (
                    <option
                      key={`${question.id}-rating-${ratingIndex + 1}`}
                      value={String(ratingIndex + 1)}
                    >
                      {ratingIndex + 1}
                    </option>
                  )
                )}
              </select>
            </div>
          ) : (
            <div className="create-input-wrapper">
              <FaCheck />
              <input
                id={`correct-answer-${question.id}`}
                type="text"
                value={
                  question.correctAnswer ||
                  ""
                }
                onChange={(event) =>
                  updateQuestion(
                    question.id,
                    "correctAnswer",
                    event.target.value
                  )
                }
                placeholder="Enter the expected correct answer"
              />
            </div>
          )}
          <small className="create-field-help">
            Used for automatic grading and admin result analysis.
            Respondent visibility is controlled separately by Result &amp; Score settings.
          </small>
        </div>
      )}
      <label className="required-question-row">
        <div>
          <strong>
            Required question
          </strong>
          <span>
            Respondents must answer this question.
          </span>
        </div>
        <input
          type="checkbox"
          checked={
            question.required
          }
          onChange={(event) =>
            updateQuestion(
              question.id,
              "required",
              event.target.checked
            )
          }
        />
        <span className="required-toggle-switch">
          <span className="required-toggle-circle"></span>
        </span>
      </label>
    </article>
  );
  // =========================================================
  // QUESTIONS TAB
  // =========================================================
  const renderQuestionsTab =
    () => (
      <div className="questions-builder-page">
        <div className="question-builder-toolbar">
          <div className="question-builder-label">
            <span>
              Step 3
            </span>
            <strong>
              Add Question
            </strong>
          </div>
          <div className="question-type-list">
            {questionTypes.map(
              (
                item
              ) => (
                <button
                  type="button"
                  key={
                    item.type
                  }
                  className={
                    `question-type-btn ${item.className}`
                  }
                  onClick={() =>
                    createQuestion(
                      item.type
                    )
                  }
                >
                  <span className="question-type-icon">
                    {item.icon}
                  </span>
                  <span>
                    {item.label}
                  </span>
                </button>
              )
            )}
          </div>
        </div>
        <div className="questions-builder-content">
          {questions.length ===
          0 ? (
            <div className="builder-empty-state">
              <div className="builder-empty-icon">
                <FaQuestionCircle />
              </div>
              <h3>
                No questions yet
              </h3>
              <p>
                Choose a question type above to start building your form.
              </p>
            </div>
          ) : (
            <div className="builder-question-list">
              {questions.map(
                (
                  question,
                  index
                ) =>
                  renderQuestionCard(
                    question,
                    index
                  )
              )}
            </div>
          )}
        </div>
      </div>
    );
  // =========================================================
  // LOADING / NOT FOUND
  // =========================================================
  if (loadingForm) {
    return (
      <div className={darkMode ? "edit-form-state-page dark" : "edit-form-state-page"}>
        <div className="edit-form-state-card">
          <span className="edit-form-loader"></span>
          <h2>Loading Form</h2>
          <p>Preparing the form data for editing.</p>
        </div>
      </div>
    );
  }
  if (formNotFound || !originalForm) {
    return (
      <div className={darkMode ? "edit-form-state-page dark" : "edit-form-state-page"}>
        <div className="edit-form-state-card">
          <FaQuestionCircle />
          <h2>Form not found</h2>
          <p>The form may have been deleted or is no longer available.</p>
          <button
            type="button"
            onClick={() => navigate("/creator/forms")}
          >
            Back to Forms
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
          ? "create-form-page dark"
          : "create-form-page"
      }
    >
      <header className="create-form-header">
        <button
          type="button"
          className="create-back-btn"
          onClick={() =>
            navigate(
              `/creator/forms/${id}`
            )
          }
          title="Back"
        >
          <FaArrowLeft />
        </button>
        <div className="create-header-title">
          <span>
            Form Builder
          </span>
          <h1>
            Edit Form
          </h1>
        </div>
        <div className="create-header-actions">
          {!isFirstTab && (
            <button
              type="button"
              className="create-previous-btn"
              onClick={
                handlePreviousStep
              }
            >
              Previous
            </button>
          )}
          {isLastTab ? (
            <button
              type="button"
              className="create-save-btn"
              onClick={
                handleSave
              }
            >
              Save Changes
            </button>
          ) : (
            <button
              type="button"
              className="create-save-btn"
              onClick={
                handleNextStep
              }
            >
              Next
            </button>
          )}
        </div>
      </header>
      <nav className="create-form-tabs">
        {[
          {
            key: "info",
            number: 1,
            icon:
              <FaInfoCircle />,
            label: "Info",
          },
          {
            key: "settings",
            number: 2,
            icon:
              <FaCog />,
            label: "Settings",
          },
          {
            key: "questions",
            number: 3,
            icon:
              <FaQuestionCircle />,
            label: "Questions",
          },
        ].map(
          (
            tab
          ) => (
            <button
              type="button"
              key={
                tab.key
              }
              className={
                activeTab ===
                tab.key
                  ? "create-tab active"
                  : "create-tab"
              }
              onClick={() =>
                changeTab(
                  tab.key
                )
              }
            >
              <span className="create-tab-number">
                {tab.number}
              </span>
              {tab.icon}
              <span>
                {tab.label}
              </span>
            </button>
          )
        )}
      </nav>
      {activeTab ===
        "info" &&
        renderInfoTab()}
      {activeTab ===
        "settings" &&
        renderSettingsTab()}
      {activeTab ===
        "questions" &&
        renderQuestionsTab()}
    </div>
  );
}
export default EditForm;