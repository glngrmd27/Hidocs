import { createForm } from '../api/formApi';
import { addQuestion } from '../api/questionApi';
import { updateFormSettings } from '../api/formApi';
import { updateForm } from '../api/formApi';

import {
  useContext,
  useState,
} from "react";
import {
  useNavigate,
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
import RichTextEditor from "../components/RichTextEditor";
import "../assets/css/CreateForm.css";
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
function CreateForm() {
  const navigate =
    useNavigate();
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
    const [isSaving, setIsSaving] = useState(false);

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
  // RANDOM LINK FEEDBACK
  // =========================================================
  const [
    linkGenerated,
    setLinkGenerated,
  ] = useState(false);
  // =========================================================
  // SAFE STORAGE READER
  // =========================================================
  const dedupeForms =
    (forms) => {
      const uniqueForms = [];
      const seenKeys = new Map();

      forms.forEach((form) => {
        if (!form || typeof form !== "object") {
          return;
        }

        const formId = String(form.id ?? "").trim();
        const customLink = String(form.customLink || form.custom_url || form.link || "")
          .trim()
          .toLowerCase();

        if (!formId && !customLink) {
          return;
        }

        const keys = [];
        if (formId) {
          keys.push(`id:${formId}`);
        }
        if (customLink) {
          keys.push(`link:${customLink}`);
        }

        const existingIndex = keys.reduce((foundIndex, key) => {
          if (foundIndex !== null) {
            return foundIndex;
          }
          return seenKeys.has(key) ? seenKeys.get(key) : null;
        }, null);

        if (existingIndex !== null) {
          uniqueForms[existingIndex] = form;
        } else {
          const index = uniqueForms.length;
          uniqueForms.push(form);
          keys.forEach((key) => seenKeys.set(key, index));
        }

        const indexAfterWrite = uniqueForms.length - 1;
        keys.forEach((key) => seenKeys.set(key, indexAfterWrite));
      });

      return uniqueForms;
    };

  const normalizeStoredLink = (form) => {
    if (!form || typeof form !== "object") {
      return "";
    }

    return String(
      form.customLink ||
      form.custom_url ||
      form.customUrl ||
      form.link ||
      ""
    )
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//i, "")
      .replace(/^hidocs\.app\/r\//i, "")
      .replace(/^\/+/, "")
      .replace(/\/+$/, "");
  };

  const sanitizeStorageForms = (forms) => {
    const cleaned = [];
    const seenCustomLinks = new Map();

    forms.forEach((form) => {
      if (!form || typeof form !== "object") {
        return;
      }

      const customLink = normalizeStoredLink(form);
      if (customLink) {
        const existingIndex = seenCustomLinks.get(customLink);
        if (existingIndex !== undefined) {
          const previousForm = cleaned[existingIndex];
          const previousTime = new Date(previousForm?.createdAt || 0).getTime();
          const currentTime = new Date(form?.createdAt || 0).getTime();
          if (Number.isFinite(currentTime) && currentTime >= previousTime) {
            cleaned[existingIndex] = form;
          }
          return;
        }
        seenCustomLinks.set(customLink, cleaned.length);
      }

      cleaned.push(form);
    });

    return cleaned;
  };

  const getStoredForms =
    () => {
      try {
        const storedValue =
          localStorage.getItem(
            FORMS_STORAGE_KEY
          );
        if (!storedValue) {
          return [];
        }
        const parsedValue =
          JSON.parse(
            storedValue
          );
        const list = Array.isArray(parsedValue)
          ? parsedValue
          : [];
        return dedupeForms(sanitizeStorageForms(list));
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
  // SET CORRECT OPTION
  // =========================================================
  const setCorrectOption = (
    questionId,
    optionValue
  ) => {
    setQuestions((previous) =>
      previous.map((question) =>
        question.id === questionId
          ? { ...question, correctAnswer: optionValue }
          : question
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
        formData.title
          .trim();
      const cleanLink =
        formData.customLink
          .trim();
      if (!cleanTitle) {
        alert(
          "Silakan isi Form Title terlebih dahulu."
        );
        setActiveTab(
          "info"
        );
        return false;
      }
      if (
        cleanTitle.length <
        3
      ) {
        alert(
          "Form Title minimal 3 karakter."
        );
        setActiveTab(
          "info"
        );
        return false;
      }
      if (!cleanLink) {
        alert(
          "Silakan isi Custom Link terlebih dahulu."
        );
        setActiveTab(
          "info"
        );
        return false;
      }
      if (
        !/^[a-zA-Z0-9-_]+$/.test(
          cleanLink
        )
      ) {
        alert(
          "Custom Link hanya boleh berisi huruf, angka, tanda hubung, dan garis bawah."
        );
        setActiveTab(
          "info"
        );
        return false;
      }
      if (
        isCustomLinkUsed(
          cleanLink
        )
      ) {
        alert(
          "Custom Link sudah digunakan. Silakan gunakan link lain."
        );
        setActiveTab(
          "info"
        );
        return false;
      }
      if (
        formData.openDate &&
        formData.closeDate &&
        formData.closeDate <
          formData.openDate
      ) {
        alert(
          "Close Date tidak boleh lebih awal dari Open Date."
        );
        setActiveTab(
          "info"
        );
        return false;
      }
      if (
        formData.openDate &&
        formData.closeDate &&
        formData.openDate ===
          formData.closeDate &&
        formData.openTime &&
        formData.closeTime &&
        formData.closeTime <=
          formData.openTime
      ) {
        alert(
          "Close Time harus lebih akhir dari Open Time."
        );
        setActiveTab(
          "info"
        );
        return false;
      }
      return true;
    };
  // =========================================================
  // VALIDATE SETTINGS
  // =========================================================
  const validateSettings =
    () => {
      if (
        !formData.activateImmediately &&
        !formData.openDate
      ) {
        alert(
          "Jika Activate immediately dimatikan, isi Open Date agar form dapat aktif otomatis sesuai jadwal."
        );
        setActiveTab(
          "info"
        );
        return false;
      }
      if (
        !formData.timerEnabled
      ) {
        return true;
      }
      const timerDuration =
        Number(
          formData.timerDuration
        );
      if (
        !Number.isFinite(
          timerDuration
        ) ||
        timerDuration <
          1 ||
        timerDuration >
          1000
      ) {
        alert(
          "Durasi timer harus antara 1 sampai 1000 menit."
        );
        setActiveTab(
          "settings"
        );
        return false;
      }
      return true;
    };
  // =========================================================
  // RICH TEXT HELPERS
  // =========================================================
  const getPlainTextFromHtml = (
    html
  ) => {
    const temporaryElement =
      document.createElement(
        "div"
      );
    temporaryElement.innerHTML =
      String(
        html ||
        ""
      );
    return String(
      temporaryElement.textContent ||
      temporaryElement.innerText ||
      ""
    )
      .replace(
        /\u00a0/g,
        " "
      )
      .trim();
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
            !getPlainTextFromHtml(
              question.title
            )
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
  // SAVE FORM
  // =========================================================
    const handleSave = async () => {
      if (isSaving) {
        return;
      }
      if (
        !validateInfo() ||
        !validateSettings() ||
        !validateQuestions()
      ) {
        return;
      }
      const normalizedLink =
        (
          formData.customLink
            .trim()
            .toLowerCase()
            .replace(
              /\s+/g,
              "-"
            ) ||
          `form-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 8)}`
        ).replace(
          /[^a-z0-9-_]/g,
          ""
        );
      const isPublicForm =
        formData.accessMode ===
        "public";
      const normalizedTimerDuration =
        formData.timerEnabled
          ? Math.min(
              Math.max(
                Math.floor(
                  Number(
                    formData.timerDuration
                  ) ||
                  1
                ),
                1
              ),
              1000
            )
          : null;
      const schedule =
        getScheduleValues();
      const responseDays =
        Number(
          formData.responseDays
        ) ||
        30;
      const savedForm = {
        id:
          Date.now() +
          Math.random(),
        title:
          formData.title
            .trim(),
        description: "Form created using HiDocs Form Builder.",
        type: "Form",
        category: "Form",
        customLink:
          normalizedLink,
        link: `hidocs.app/r/${normalizedLink}`,
        openDate:
          formData.openDate,
        closeDate:
          formData.closeDate,
        openTime:
          formData.openTime,
        closeTime:
          formData.closeTime,
        // Active = status admin. Jadwal akses diproses terpisah melalui schedule.
        // Dengan cara ini form yang dijadwalkan tidak menjadi inactive permanen.
        active: true,
        activationMode:
          formData.activateImmediately
            ? "immediate"
            : "scheduled",
        openAt:
          schedule.openAt,
        closeAt:
          schedule.closeAt,
        schedule: {
          enabled:
            schedule.enabled,
          openAt:
            schedule.openAt,
          closeAt:
            schedule.closeAt,
        },
        responseDays,
        accessMode:
          formData.accessMode,
        showInUserList:
          isPublicForm,
        qrOnly:
          !isPublicForm,
        responses: 0,
        // =====================================================
        // INTERNAL GRADING
        // Always available for admin when scored questions exist.
        // This does NOT depend on the respondent resultMode.
        // =====================================================
        grading: {
          enabled:
            questions.some(
              (
                question
              ) =>
                Boolean(
                  question.scoring
                )
            ),
          scoredQuestions:
            questions.filter(
              (
                question
              ) =>
                Boolean(
                  question.scoring
                )
            ).length,
          totalPoints:
            questions.reduce(
              (
                total,
                question
              ) => {
                if (
                  !question.scoring
                ) {
                  return total;
                }
                return (
                  total +
                  Math.max(
                    Number(
                      question.points
                    ) ||
                    0,
                    0
                  )
                );
              },
              0
            ),
          calculateForAdmin: true,
          userResultMode:
            formData.resultMode,
        },
        timerEnabled:
          Boolean(
            formData.timerEnabled
          ),
        timerDuration:
          normalizedTimerDuration,
        duration:
          normalizedTimerDuration,
        timer: {
          enabled:
            Boolean(
              formData.timerEnabled
            ),
          mode: "custom",
          duration:
            normalizedTimerDuration,
        },
        settings: {
          shuffleQuestions:
            Boolean(
              formData.shuffleQuestions
            ),
          shuffleAnswers:
            Boolean(
              formData.shuffleAnswers
            ),
          oneTimeOnly:
            Boolean(
              formData.oneTimeOnly
            ),
          activateImmediately:
            Boolean(
              formData.activateImmediately
            ),
          activationMode:
            formData.activateImmediately
              ? "immediate"
              : "scheduled",
          scheduleEnabled:
            schedule.enabled,
          openAt:
            schedule.openAt,
          closeAt:
            schedule.closeAt,
          schedule: {
            enabled:
              schedule.enabled,
            openAt:
              schedule.openAt,
            closeAt:
              schedule.closeAt,
          },
          timerEnabled:
            Boolean(
              formData.timerEnabled
            ),
          timerDuration:
            normalizedTimerDuration,
          timer: {
            enabled:
              Boolean(
                formData.timerEnabled
              ),
            mode: "custom",
            duration:
              normalizedTimerDuration,
          },
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
        questions:
          questions.map(
            (
              question,
              index
            ) => {
              const scoringEnabled =
                Boolean(
                  question.scoring
                );
              const normalizedPoints =
                scoringEnabled
                  ? Math.max(
                      Number(
                        question.points
                      ) ||
                      1,
                      1
                    )
                  : 0;
              const normalizedCorrectAnswer =
                scoringEnabled
                  ? String(
                      question.correctAnswer ??
                      ""
                    ).trim()
                  : "";
              const normalizedOptions =
                (
                  question.type ===
                    "image" &&
                  question.imageAnswerType ===
                    "multiple"
                    ? question.imageOptions ||
                      []
                    : question.type ===
                      "yesno"
                    ? (
                        Array.isArray(
                          question.options
                        ) &&
                        question.options.length
                          ? question.options
                          : [
                              "Yes",
                              "No",
                            ]
                      )
                    : question.options ||
                      []
                ).map(
                  (
                    option
                  ) =>
                    String(
                      option ||
                      ""
                    ).trim()
                );
              return {
                ...question,
                number:
                  index +
                  1,
                title:
                  String(
                    question.title ||
                    ""
                  ).trim(),
                question:
                  String(
                    question.title ||
                    ""
                  ).trim(),
                required:
                  question.required !==
                  false,
                // =================================================
                // INTERNAL ADMIN GRADING
                // =================================================
                scoring:
                  scoringEnabled,
                points:
                  normalizedPoints,
                correctAnswer:
                  normalizedCorrectAnswer,
                grading: {
                  enabled:
                    scoringEnabled,
                  points:
                    normalizedPoints,
                  correctAnswer:
                    normalizedCorrectAnswer,
                },
                // =================================================
                // ANSWER OPTIONS
                // =================================================
                options:
                  normalizedOptions,
                imageAnswerType:
                  question.type ===
                  "image"
                    ? question.imageAnswerType ||
                      "multiple"
                    : "",
                imageOptions:
                  question.type ===
                    "image" &&
                  question.imageAnswerType ===
                    "multiple"
                    ? (
                        question.imageOptions ||
                        []
                      ).map(
                        (
                          option
                        ) =>
                          String(
                            option ||
                            ""
                          ).trim()
                      )
                    : [],
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
              };
            }
          ),
        createdAt:
          new Date()
            .toISOString(),
      };

          setIsSaving(true);


      try {
        const questionTypeMap = {
          short: "SHORT_TEXT",
          long: "LONG_TEXT",
          multiple: "MULTIPLE_CHOICE",
          checkbox: "CHECKBOXES",
          yesno: "YES_NO",
          rating: "RATING",
          math: "MATH",
          code: "CODE",
          image: "IMAGE",
        };

        const hasScoring = questions.some((q) => Boolean(q.scoring));
      // =====================================================
      // 1. CREATE FORM
      // =====================================================
      const formResponse = await createForm({
        title: formData.title.trim(),
        description: "Form created using HiDocs Form Builder.",
        type: hasScoring ? "EXAM" : "SURVEY",
        custom_url: normalizedLink,
      });

      const newFormId = formResponse?.data?.data?.id ?? savedForm.id;

      // =====================================================
      // 2. ADD QUESTIONS ONE BY ONE
      // =====================================================
      for (let index = 0; index < questions.length; index++) {
        const question = questions[index];

        const optionsSource =
          question.type === "yesno"
            ? (Array.isArray(question.options) && question.options.length
                ? question.options
                : ["Yes", "No"])
            : question.options || [];

        const mappedOptions = optionsSource.map((option, optIndex) => ({
          option_text: String(option || "").trim(),
          is_correct:
            String(option || "").trim() ===
            String(question.correctAnswer || "").trim(),
          order_index: optIndex,
        }));

        await addQuestion(newFormId, {
          question_text: String(question.title || "").trim(),
          question_type: questionTypeMap[question.type] || "SHORT_TEXT",
          code_language: question.type === "code" ? (question.language || "") : "",
          is_auto_scored: Boolean(question.scoring),
          points: Boolean(question.scoring)
            ? Math.max(Number(question.points) || 1, 1)
            : 0,
          order_index: index,
          is_required: question.required !== false,
          options: mappedOptions,
        });
      }

      // =====================================================
      // 3. UPDATE FORM SETTINGS
      // =====================================================
        const toISOOrNull = (value) => {
        if (!value) return null;
        const date = new Date(value);
        if (isNaN(date.getTime())) return null;
        return date.toISOString();
      };

      await updateFormSettings(newFormId, {
        duration_minutes: formData.timerEnabled
          ? normalizedTimerDuration
          : null,
        auto_active_days: responseDays,
        is_active_immediately: Boolean(formData.activateImmediately),
        is_one_time_submission: Boolean(formData.oneTimeOnly),
        randomize_questions: Boolean(formData.shuffleQuestions),
        randomize_options: Boolean(formData.shuffleAnswers),
        start_time: toISOOrNull(schedule.openAt),
        end_time: toISOOrNull(schedule.closeAt),
      });

            await updateForm(newFormId, {
        title: formData.title.trim(),
        description: "Form created using HiDocs Form Builder.",
        type: hasScoring ? "EXAM" : "SURVEY",
        custom_url: normalizedLink,
        status: "ACTIVE",
      });

      const storedForms = getStoredForms();
      const normalizedLocalForm = {
        ...savedForm,
        id: newFormId,
        title: formData.title.trim(),
        description: "Form created using HiDocs Form Builder.",
        type: hasScoring ? "EXAM" : "SURVEY",
        customLink: normalizedLink,
        link: `hidocs.app/r/${normalizedLink}`,
        active: true,
        responses: 0,
        createdAt: new Date().toISOString(),
        accessMode: formData.accessMode,
        showInUserList: isPublicForm,
        qrOnly: !isPublicForm,
      };

      const cleanedStoredForms = storedForms.filter((item) => {
        const itemCustomLink = String(item.customLink || item.custom_url || item.link || "").trim().toLowerCase();
        const matchesTempId = String(item.id) === String(savedForm.id);
        const matchesFinalId = String(item.id) === String(newFormId);
        const matchesCustomLink = itemCustomLink === normalizedLink;
        return !(matchesTempId || matchesFinalId || matchesCustomLink);
      });

      const updatedLocalForms = dedupeForms([
        ...cleanedStoredForms,
        normalizedLocalForm,
      ]);

      const backupForms = sanitizeStorageForms(
        Array.isArray(JSON.parse(localStorage.getItem(NEW_FORM_STORAGE_KEY) || "[]"))
          ? JSON.parse(localStorage.getItem(NEW_FORM_STORAGE_KEY) || "[]")
          : []
      ).filter((item) => {
        const itemCustomLink = String(item.customLink || item.custom_url || item.link || "").trim().toLowerCase();
        return itemCustomLink !== normalizedLink;
      });

      localStorage.setItem(FORMS_STORAGE_KEY, JSON.stringify(updatedLocalForms));
      localStorage.setItem(NEW_FORM_STORAGE_KEY, JSON.stringify([...backupForms, normalizedLocalForm]));
      window.dispatchEvent(
        new CustomEvent("hidocs-forms-updated", {
          detail: {
            formId: newFormId,
            type: "form-created",
          },
        })
      );

      if (isPublicForm) {
        alert("Form berhasil disimpan dan akan tampil di halaman user.");
      } else {
        alert(
          "Form berhasil disimpan sebagai QR Code Only. Form hanya dapat dibuka melalui QR atau direct link."
        );
      }

      navigate("/dashboard");
    } catch (err) {
      console.error("Gagal menyimpan form:", err);
      const detail = err.response?.data?.errors;
      alert(
        (err.response?.data?.message || "Gagal menyimpan form.") +
        (detail ? "\n\nDetail: " + JSON.stringify(detail) : "")
      );
    } finally {
      setIsSaving(false);
    }

  };
  // =========================================================
  // INFO TAB
  // =========================================================
  const renderInfoTab =
    () => (
      <div className="create-form-content">
        <section className="create-section">
          <div className="create-section-title">
            <div className="create-section-icon">
              <FaInfoCircle />
            </div>
            <div>
              <span>
                Step 1
              </span>
              <h2>
                Basic Information
              </h2>
            </div>
          </div>
          <div className="create-field">
            <label htmlFor="form-title">
              Form Title
              <span>
                *
              </span>
            </label>
            <div className="create-input-wrapper">
              <FaInfoCircle />
              <input
                id="form-title"
                type="text"
                name="title"
                value={
                  formData.title
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. Student Satisfaction Survey"
                maxLength={100}
              />
            </div>
          </div>
          <div className="create-field">
            <div className="create-field-label-row">
              <label htmlFor="custom-link">
                Custom Link
                <span>
                  *
                </span>
              </label>
            </div>
            <div className="create-input-wrapper create-link-input-wrapper">
              <FaLink />
              <input
                id="custom-link"
                type="text"
                name="customLink"
                value={
                  formData.customLink
                }
                onChange={
                  handleChange
                }
                placeholder="e.g. student-survey-2026"
                maxLength={60}
                autoComplete="off"
              />
              <button
                type="button"
                className={
                  linkGenerated
                    ? "create-random-link-btn generated"
                    : "create-random-link-btn"
                }
                onClick={
                  generateRandomLink
                }
                disabled={
                  !formData.title
                    .trim()
                }
                aria-label="Generate random custom link"
                title="Random Link"
              >
                {linkGenerated
                  ? <FaCheck />
                  : <FaRandom />
                }
              </button>
            </div>
            <div className="create-link-information">
              <small className="create-field-help">
                Your form link will be:{" "}
                <strong>
                  hidocs.app/r/
                  {
                    formData.customLink ||
                    "custom-link"
                  }
                </strong>
              </small>
              {linkGenerated && (
                <span className="create-link-generated-message">
                  <FaCheck />
                  Link generated
                </span>
              )}
            </div>
          </div>
        </section>
        <section className="create-section">
          <div className="create-section-title">
            <div className="create-section-icon">
              <FaClock />
            </div>
            <div>
              <span>
                Optional
              </span>
              <h2>
                Schedule
              </h2>
            </div>
          </div>
          <div className="schedule-grid">
            {[
              {
                id: "open-date",
                label: "Open Date",
                name: "openDate",
                type: "date",
                icon:
                  <FaCalendarAlt />,
              },
              {
                id: "close-date",
                label: "Close Date",
                name: "closeDate",
                type: "date",
                icon:
                  <FaCalendarAlt />,
              },
              {
                id: "open-time",
                label: "Open Time",
                name: "openTime",
                type: "time",
                icon:
                  <FaClock />,
              },
              {
                id: "close-time",
                label: "Close Time",
                name: "closeTime",
                type: "time",
                icon:
                  <FaClock />,
              },
            ].map(
              (
                field
              ) => (
                <div
                  className="create-field"
                  key={
                    field.name
                  }
                >
                  <label htmlFor={field.id}>
                    {field.label}
                  </label>
                  <div className="create-input-wrapper">
                    {field.icon}
                    <input
                      id={field.id}
                      type={field.type}
                      name={field.name}
                      value={
                        formData[
                          field.name
                        ]
                      }
                      onChange={
                        handleChange
                      }
                    />
                  </div>
                </div>
              )
            )}
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
                 
                  <span
                    className={
                      question.correctAnswer === option
                        ? "answer-radio answer-radio-selected"
                        : "answer-radio"
                    }
                    onClick={() =>
                      setCorrectOption(question.id, option)
                    }
                    style={{ cursor: "pointer" }}
                    title="Tandai sebagai jawaban benar"
                  >
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
      <div className="question-rich-editor-section">
        <div className="question-rich-editor-label">
          <FaQuestionCircle />
          <span>
            Question
          </span>
        </div>
        <RichTextEditor
          value={
            question.title
          }
          onChange={(html) =>
            updateQuestion(
              question.id,
              "title",
              html
            )
          }
          placeholder="Write your question here..."
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
              "/admin"
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
            Create Form
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
              onClick={handleSave}
              disabled={isSaving}
            >
              {isSaving ? "Saving..." : "Save Form"}
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
export default CreateForm;