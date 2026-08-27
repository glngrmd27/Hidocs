import {
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import * as mammoth from "mammoth";
import {
  FaAlignLeft,
  FaArrowLeft,
  FaArrowRight,
  FaCalculator,
  FaCalendarAlt,
  FaCheck,
  FaCheckCircle,
  FaCircle,
  FaClock,
  FaCode,
  FaCog,
  FaCopy,
  FaEye,
  FaEyeSlash,
  FaFileAlt,
  FaFileWord,
  FaFont,
  FaGlobe,
  FaHourglassHalf,
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
  FaTimes,
  FaTrash,
  FaTrophy,
  FaUpload,
} from "react-icons/fa";
import {
  ThemeContext,
} from "../context/ThemeContext";
import "../assets/css/ImportWord.css";
// =========================================================
// STORAGE KEYS
// =========================================================
const FORMS_STORAGE_KEY =
  "hidocs_forms";
const NEW_FORM_STORAGE_KEY =
  "hidocs_new_form";
// =========================================================
// FILE CONFIGURATION
// =========================================================
const MAXIMUM_WORD_SIZE =
  10 * 1024 * 1024;
// =========================================================
// IMPORT WORD
// =========================================================
function ImportWord() {
  const navigate =
    useNavigate();
  const {
    darkMode,
  } = useContext(
    ThemeContext
  );
  const fileInputRef =
    useRef(null);
  // =========================================================
  // TAB
  // =========================================================
  const [
    activeTab,
    setActiveTab,
  ] = useState(
    "upload"
  );
  const tabOrder = [
    "upload",
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
    "upload";
  const isLastTab =
    activeTab ===
    "questions";
  // =========================================================
  // IMPORT STATE
  // =========================================================
  const [
    selectedFile,
    setSelectedFile,
  ] = useState(null);
  const [
    importLoading,
    setImportLoading,
  ] = useState(false);
  const [
    importError,
    setImportError,
  ] = useState("");
  const [
    importSuccess,
    setImportSuccess,
  ] = useState(false);
  const [
    importedText,
    setImportedText,
  ] = useState("");
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
  // LINK GENERATED
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
          "Gagal membaca form:",
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
      type ===
      "checkbox"
        ? checked
        : value;
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
        const numericValue =
          Number(
            value
          );
        updatedValue =
          Number.isFinite(
            numericValue
          )
            ? Math.min(
                Math.max(
                  Math.floor(
                    numericValue
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
    return getStoredForms()
      .some(
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
          "Isi Form Title terlebih dahulu."
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
          "Gagal membuat link. Silakan coba lagi."
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
  // QUESTION TYPE
  // =========================================================
  const questionTypes = [
    {
      type: "multiple",
      label: "Multiple Choice",
      icon:
        <FaListUl />,
    },
    {
      type: "short",
      label: "Short Text",
      icon:
        <FaFont />,
    },
    {
      type: "long",
      label: "Long Text",
      icon:
        <FaAlignLeft />,
    },
    {
      type: "rating",
      label: "Rating",
      icon:
        <FaStar />,
    },
    {
      type: "yesno",
      label: "Yes / No",
      icon:
        <FaCheck />,
    },
    {
      type: "math",
      label: "Math",
      icon:
        <FaCalculator />,
    },
    {
      type: "code",
      label: "Code",
      icon:
        <FaCode />,
    },
  ];
  // =========================================================
  // CREATE QUESTION OBJECT
  // =========================================================
  const createQuestionObject = (
    type = "short"
  ) => {
    return {
      id:
        Date.now() +
        Math.random(),
      title: "",
      question: "",
      type,
      required: true,
      scoring: false,
      points: 1,
      correctAnswer: "",
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
      image: "",
      imageName: "",
      imageAnswerType: "",
      imageOptions:
        [],
    };
  };
  // =========================================================
  // WORD PARSER
  //
  // Format yang dikenali:
  //
  // 1. Pertanyaan...
  // A. Pilihan
  // B. Pilihan
  // C. Pilihan
  // Kunci: B
  // Poin: 2
  //
  // [SHORT] Pertanyaan...
  // [LONG] Pertanyaan...
  // [YESNO] Pertanyaan...
  // [RATING] Pertanyaan...
  // [MATH] Pertanyaan...
  // [CODE] Pertanyaan...
  //
  // =========================================================
  const parseWordQuestions = (
    rawText
  ) => {
    const cleanText =
      String(
        rawText ||
        ""
      )
        .replace(
          /\r/g,
          ""
        )
        .replace(
          /\u00a0/g,
          " "
        );
    const lines =
      cleanText
        .split("\n")
        .map(
          (
            line
          ) =>
            line.trim()
        )
        .filter(
          Boolean
        );
    const parsedQuestions =
      [];
    let currentQuestion =
      null;
    const saveCurrentQuestion =
      () => {
        if (!currentQuestion) {
          return;
        }
        if (
          !String(
            currentQuestion.title ||
            ""
          ).trim()
        ) {
          currentQuestion =
            null;
          return;
        }
        if (
          currentQuestion.type ===
            "multiple" &&
          currentQuestion.options.length <
            2
        ) {
          currentQuestion.type =
            "short";
          currentQuestion.options =
            [];
        }
        parsedQuestions.push(
          currentQuestion
        );
        currentQuestion =
          null;
      };
    const detectTypeFromQuestion =
      (
        value
      ) => {
        const text =
          String(
            value
          );
        const upper =
          text.toUpperCase();
        if (
          upper.startsWith(
            "[SHORT]"
          )
        ) {
          return {
            type: "short",
            title:
              text.replace(
                /^\[SHORT\]\s*/i,
                ""
              ),
          };
        }
        if (
          upper.startsWith(
            "[LONG]"
          )
        ) {
          return {
            type: "long",
            title:
              text.replace(
                /^\[LONG\]\s*/i,
                ""
              ),
          };
        }
        if (
          upper.startsWith(
            "[YESNO]"
          )
        ) {
          return {
            type: "yesno",
            title:
              text.replace(
                /^\[YESNO\]\s*/i,
                ""
              ),
          };
        }
        if (
          upper.startsWith(
            "[RATING]"
          )
        ) {
          return {
            type: "rating",
            title:
              text.replace(
                /^\[RATING\]\s*/i,
                ""
              ),
          };
        }
        if (
          upper.startsWith(
            "[MATH]"
          )
        ) {
          return {
            type: "math",
            title:
              text.replace(
                /^\[MATH\]\s*/i,
                ""
              ),
          };
        }
        if (
          upper.startsWith(
            "[CODE]"
          )
        ) {
          return {
            type: "code",
            title:
              text.replace(
                /^\[CODE\]\s*/i,
                ""
              ),
          };
        }
        return {
          type: "short",
          title:
            text,
        };
      };
    lines.forEach(
      (
        line
      ) => {
        // =====================================================
        // SKIP FORM TITLE
        // =====================================================
        if (
          /^judul\s*:/i.test(
            line
          )
        ) {
          return;
        }
        // =====================================================
        // QUESTION NUMBER
        //
        // 1. Pertanyaan
        // 2) Pertanyaan
        // =====================================================
        const numberedQuestionMatch =
          line.match(
            /^(\d+)[.)]\s+(.+)$/
          );
        if (
          numberedQuestionMatch
        ) {
          saveCurrentQuestion();
          const detected =
            detectTypeFromQuestion(
              numberedQuestionMatch[
                2
              ]
            );
          currentQuestion = {
            ...createQuestionObject(
              detected.type
            ),
            title:
              detected.title,
            question:
              detected.title,
          };
          return;
        }
        // =====================================================
        // QUESTION WITH TYPE BUT NO NUMBER
        // =====================================================
        if (
          /^\[(SHORT|LONG|YESNO|RATING|MATH|CODE)\]/i.test(
            line
          )
        ) {
          saveCurrentQuestion();
          const detected =
            detectTypeFromQuestion(
              line
            );
          currentQuestion = {
            ...createQuestionObject(
              detected.type
            ),
            title:
              detected.title,
            question:
              detected.title,
          };
          return;
        }
        // =====================================================
        // MULTIPLE CHOICE OPTION
        //
        // A. Jawaban
        // B) Jawaban
        // =====================================================
        const optionMatch =
          line.match(
            /^([A-Z])[.)]\s+(.+)$/i
          );
        if (
          optionMatch &&
          currentQuestion
        ) {
          if (
            currentQuestion.type ===
            "short"
          ) {
            currentQuestion.type =
              "multiple";
            currentQuestion.options =
              [];
          }
          if (
            currentQuestion.type ===
            "multiple"
          ) {
            currentQuestion.options.push(
              optionMatch[
                2
              ].trim()
            );
          }
          return;
        }
        // =====================================================
        // CORRECT ANSWER
        //
        // Kunci: A
        // Jawaban: B
        // Correct Answer: C
        // =====================================================
        const answerMatch =
          line.match(
            /^(?:kunci(?:\s+jawaban)?|jawaban|correct\s+answer)\s*:\s*(.+)$/i
          );
        if (
          answerMatch &&
          currentQuestion
        ) {
          const rawCorrectAnswer =
            answerMatch[
              1
            ].trim();
          let correctAnswer =
            rawCorrectAnswer;
          if (
            currentQuestion.type ===
              "multiple"
          ) {
            const letterMatch =
              rawCorrectAnswer.match(
                /^([A-Z])(?:[.)])?$/i
              );
            if (
              letterMatch
            ) {
              const optionIndex =
                letterMatch[
                  1
                ]
                  .toUpperCase()
                  .charCodeAt(
                    0
                  ) -
                65;
              if (
                currentQuestion.options[
                  optionIndex
                ] !==
                undefined
              ) {
                correctAnswer =
                  currentQuestion.options[
                    optionIndex
                  ];
              }
            }
          }
          currentQuestion.correctAnswer =
            correctAnswer;
          currentQuestion.scoring =
            true;
          return;
        }
        // =====================================================
        // POINTS
        // =====================================================
        const pointsMatch =
          line.match(
            /^(?:poin|point|points|nilai)\s*:\s*(\d+)$/i
          );
        if (
          pointsMatch &&
          currentQuestion
        ) {
          currentQuestion.points =
            Math.max(
              Number(
                pointsMatch[
                  1
                ]
              ) ||
              1,
              1
            );
          currentQuestion.scoring =
            true;
          return;
        }
        // =====================================================
        // REQUIRED
        // =====================================================
        const requiredMatch =
          line.match(
            /^required\s*:\s*(yes|no|true|false|ya|tidak)$/i
          );
        if (
          requiredMatch &&
          currentQuestion
        ) {
          const value =
            requiredMatch[
              1
            ]
              .toLowerCase();
          currentQuestion.required =
            (
              value ===
                "yes" ||
              value ===
                "true" ||
              value ===
                "ya"
            );
          return;
        }
        // =====================================================
        // EXTRA TEXT
        //
        // Jika belum ada current question,
        // teks dianggap sebagai pertanyaan baru.
        // =====================================================
        if (
          !currentQuestion
        ) {
          const detected =
            detectTypeFromQuestion(
              line
            );
          currentQuestion = {
            ...createQuestionObject(
              detected.type
            ),
            title:
              detected.title,
            question:
              detected.title,
          };
        } else {
          currentQuestion.title =
            `${currentQuestion.title} ${line}`
              .trim();
          currentQuestion.question =
            currentQuestion.title;
        }
      }
    );
    saveCurrentQuestion();
    return parsedQuestions;
  };
  // =========================================================
  // DETECT TITLE FROM WORD
  // =========================================================
  const detectFormTitle = (
    rawText,
    fileName
  ) => {
    const lines =
      String(
        rawText ||
        ""
      )
        .replace(
          /\r/g,
          ""
        )
        .split("\n")
        .map(
          (
            line
          ) =>
            line.trim()
        )
        .filter(
          Boolean
        );
    const explicitTitle =
      lines.find(
        (
          line
        ) =>
          /^judul\s*:/i.test(
            line
          )
      );
    if (
      explicitTitle
    ) {
      return explicitTitle
        .replace(
          /^judul\s*:/i,
          ""
        )
        .trim();
    }
    const firstLine =
      lines[
        0
      ];
    if (
      firstLine &&
      !/^(\d+)[.)]\s+/.test(
        firstLine
      ) &&
      !/^\[(SHORT|LONG|YESNO|RATING|MATH|CODE)\]/i.test(
        firstLine
      )
    ) {
      return firstLine;
    }
    return String(
      fileName ||
      "Imported Word Form"
    )
      .replace(
        /\.docx$/i,
        ""
      )
      .trim();
  };
  // =========================================================
  // REMOVE TITLE FROM IMPORT TEXT
  // =========================================================
  const removeDetectedTitle = (
    rawText,
    title
  ) => {
    const lines =
      String(
        rawText ||
        ""
      )
        .replace(
          /\r/g,
          ""
        )
        .split("\n");
    let titleRemoved =
      false;
    return lines
      .filter(
        (
          line
        ) => {
          const cleanLine =
            line.trim();
          if (
            titleRemoved
          ) {
            return true;
          }
          if (
            /^judul\s*:/i.test(
              cleanLine
            )
          ) {
            titleRemoved =
              true;
            return false;
          }
          if (
            cleanLine ===
            title
          ) {
            titleRemoved =
              true;
            return false;
          }
          return true;
        }
      )
      .join("\n");
  };
  // =========================================================
  // IMPORT WORD
  // =========================================================
  const importWordFile =
  async (
    file
  ) => {
    if (!file) {
      return;
    }
    setImportError("");
    setImportSuccess(false);
    const lowerName =
      String(file.name || "")
        .toLowerCase();
    if (
      !lowerName.endsWith(
        ".docx"
      )
    ) {
      setImportError(
        "File harus berformat .docx."
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    if (
      file.size >
      MAXIMUM_WORD_SIZE
    ) {
      setImportError(
        "Ukuran file Word maksimal 10 MB."
      );
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      return;
    }
    setImportLoading(true);
    try {
      // ============================================
      // BACA FILE WORD
      // ============================================
      const arrayBuffer =
        await file.arrayBuffer();
      if (!arrayBuffer) {
        throw new Error(
          "File Word tidak dapat dibaca."
        );
      }
      // ============================================
      // PASTIKAN MAMMOTH TERSEDIA
      // ============================================
      if (
        typeof mammoth.extractRawText !==
        "function"
      ) {
        throw new Error(
          "Mammoth gagal dimuat."
        );
      }
      // ============================================
      // WORD -> RAW TEXT
      // ============================================
      const result =
        await mammoth.extractRawText({
          arrayBuffer,
        });
      const rawText =
        String(
          result?.value ||
          ""
        )
          .replace(/\r/g, "")
          .replace(/\u00a0/g, " ")
          .trim();
      console.log(
        "WORD RAW TEXT:",
        rawText
      );
      if (!rawText) {
        throw new Error(
          "Dokumen tidak memiliki teks yang dapat dibaca."
        );
      }
      // ============================================
      // DETECT TITLE
      // ============================================
      const detectedTitle =
        detectFormTitle(
          rawText,
          file.name
        );
      const safeTitle =
        String(
          detectedTitle ||
          file.name.replace(
            /\.docx$/i,
            ""
          ) ||
          "Imported Word Form"
        ).trim();
      // ============================================
      // REMOVE TITLE
      // ============================================
      const questionText =
        removeDetectedTitle(
          rawText,
          safeTitle
        );
      // ============================================
      // PARSE QUESTIONS
      // ============================================
      const parsedQuestions =
        parseWordQuestions(
          questionText
        );
      console.log(
        "PARSED QUESTIONS:",
        parsedQuestions
      );
      if (
        !Array.isArray(
          parsedQuestions
        ) ||
        parsedQuestions.length === 0
      ) {
        throw new Error(
          "Tidak ada pertanyaan yang berhasil ditemukan."
        );
      }
      // ============================================
      // NORMALIZE QUESTIONS
      // ============================================
      const safeQuestions =
        parsedQuestions.map(
          (
            question,
            index
          ) => {
            const validTypes = [
              "multiple",
              "short",
              "long",
              "rating",
              "yesno",
              "math",
              "code",
            ];
            let type =
              String(
                question.type ||
                "short"
              ).toLowerCase();
            if (
              !validTypes.includes(
                type
              )
            ) {
              type =
                "short";
            }
            let options =
              Array.isArray(
                question.options
              )
                ? question.options.map(
                    option =>
                      String(
                        option ?? ""
                      ).trim()
                  )
                : [];
            if (
              type ===
              "yesno"
            ) {
              options = [
                "Yes",
                "No",
              ];
            }
            if (
              type ===
                "multiple" &&
              options.length < 2
            ) {
              type =
                "short";
              options = [];
            }
            if (
              ![
                "multiple",
                "yesno",
              ].includes(type)
            ) {
              options = [];
            }
            const title =
              String(
                question.title ||
                question.question ||
                `Question ${index + 1}`
              ).trim();
            return {
              ...question,
              id:
                question.id ||
                Date.now() +
                index +
                Math.random(),
              number:
                index + 1,
              title,
              question:
                title,
              type,
              required:
                question.required !==
                false,
              scoring:
                Boolean(
                  question.scoring
                ),
              points:
                Math.max(
                  Number(
                    question.points
                  ) || 1,
                  1
                ),
              correctAnswer:
                String(
                  question.correctAnswer ||
                  ""
                ).trim(),
              options,
              ratingMax:
                type ===
                "rating"
                  ? 5
                  : null,
              image: "",
              imageName: "",
              imageAnswerType: "",
              imageOptions:
                [],
            };
          }
        );
      // ============================================
      // CREATE CUSTOM LINK
      // ============================================
      const generatedSlug =
        createLinkSlug(
          safeTitle
        ) ||
        "imported-form";
      let generatedLink =
        `${generatedSlug}-${createRandomCode()}`;
      let attempt = 0;
      while (
        isCustomLinkUsed(
          generatedLink
        ) &&
        attempt < 20
      ) {
        generatedLink =
          `${generatedSlug}-${createRandomCode()}`;
        attempt += 1;
      }
      if (
        isCustomLinkUsed(
          generatedLink
        )
      ) {
        generatedLink =
          `${generatedSlug}-${Date.now()}`;
      }
      // ============================================
      // UPDATE FORM
      // ============================================
      setFormData(
        previous => ({
          ...previous,
          title:
            safeTitle,
          customLink:
            generatedLink,
        })
      );
      // ============================================
      // SIMPAN HASIL IMPORT
      // ============================================
      setQuestions(
        safeQuestions
      );
      setImportedText(
        rawText
      );
      setSelectedFile(
        file
      );
      setImportSuccess(
        true
      );
      setImportError("");
    } catch (error) {
      console.error(
        "Import Word gagal:",
        error
      );
      setSelectedFile(null);
      setQuestions([]);
      setImportedText("");
      setImportSuccess(false);
      setImportError(
        error?.message ||
        "File Word gagal dibaca."
      );
      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
    } finally {
      setImportLoading(false);
    }
  };
  // =========================================================
  // FILE CHANGE
  // =========================================================
  const handleFileChange =
    (
      event
    ) => {
      const file =
        event.target.files?.[
          0
        ];
      if (!file) {
        return;
      }
      importWordFile(
        file
      );
  };
  // =========================================================
  // REMOVE FILE
  // =========================================================
  const removeImportedFile =
    () => {
      setSelectedFile(
        null
      );
      setQuestions([]);
      setImportedText(
        ""
      );
      setImportSuccess(
        false
      );
      setImportError(
        ""
      );
      setFormData(
        (
          previous
        ) => ({
          ...previous,
          title: "",
          customLink: "",
        })
      );
      if (
        fileInputRef.current
      ) {
        fileInputRef.current.value =
          "";
      }
  };
  // =========================================================
  // UPDATE QUESTION
  // =========================================================
  const updateQuestion = (
    questionId,
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
            questionId
              ? {
                  ...question,
                  [field]:
                    value,
                  ...(
                    field ===
                    "title"
                      ? {
                          question:
                            value,
                        }
                      : {}
                  ),
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
            const options = [
              ...(
                question.options ||
                []
              ),
            ];
            const previousOption =
              options[
                optionIndex
              ];
            options[
              optionIndex
            ] =
              value;
            return {
              ...question,
              options,
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
          ) =>
            question.id ===
            questionId
              ? {
                  ...question,
                  options: [
                    ...(
                      question.options ||
                      []
                    ),
                    "",
                  ],
                }
              : question
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
            const options = [
              ...(
                question.options ||
                []
              ),
            ];
            if (
              options.length <=
              2
            ) {
              return question;
            }
            const deletedOption =
              options[
                optionIndex
              ];
            options.splice(
              optionIndex,
              1
            );
            return {
              ...question,
              options,
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
    questionId
  ) => {
    setQuestions(
      (
        previous
      ) => {
        const index =
          previous.findIndex(
            (
              question
            ) =>
              question.id ===
              questionId
          );
        if (
          index ===
          -1
        ) {
          return previous;
        }
        const duplicated = {
          ...previous[
            index
          ],
          id:
            Date.now() +
            Math.random(),
          options: [
            ...(
              previous[
                index
              ].options ||
              []
            ),
          ],
        };
        const result = [
          ...previous,
        ];
        result.splice(
          index +
            1,
          0,
          duplicated
        );
        return result;
      }
    );
  };
  // =========================================================
  // DELETE QUESTION
  // =========================================================
  const deleteQuestion = (
    questionId
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
            questionId
        )
    );
  };
  // =========================================================
  // ADD QUESTION
  // =========================================================
  const addQuestion =
    () => {
      setQuestions(
        (
          previous
        ) => [
          ...previous,
          createQuestionObject(
            "short"
          ),
        ]
      );
  };
  // =========================================================
  // CHANGE QUESTION TYPE
  // =========================================================
  const changeQuestionType = (
    questionId,
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
              questionId
            ) {
              return question;
            }
            let options =
              question.options ||
              [];
            if (
              type ===
              "multiple" &&
              options.length <
              2
            ) {
              options = [
                "",
                "",
              ];
            }
            if (
              type ===
              "yesno"
            ) {
              options = [
                "Yes",
                "No",
              ];
            }
            if (
              ![
                "multiple",
                "yesno",
              ].includes(
                type
              )
            ) {
              options =
                [];
            }
            return {
              ...question,
              type,
              options,
              ratingMax:
                type ===
                "rating"
                  ? 5
                  : null,
              correctAnswer: "",
            };
          }
        )
    );
  };
  // =========================================================
  // TIMER BLUR
  // =========================================================
  const handleTimerBlur =
    () => {
      const value =
        Number(
          formData.timerDuration
        );
      const normalized =
        Number.isFinite(
          value
        )
          ? Math.min(
              Math.max(
                Math.floor(
                  value
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
            normalized,
        })
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
    return `${dateValue}T${timeValue || defaultTime}:00`;
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
  // VALIDATE UPLOAD
  // =========================================================
  const validateUpload =
    () => {
      if (!selectedFile) {
        alert(
          "Upload file Word terlebih dahulu."
        );
        setActiveTab(
          "upload"
        );
        return false;
      }
      if (
        questions.length ===
        0
      ) {
        alert(
          "Tidak ada pertanyaan yang berhasil diimport."
        );
        return false;
      }
      return true;
  };
  // =========================================================
  // VALIDATE INFO
  // =========================================================
  const validateInfo =
    () => {
      const title =
        formData.title
          .trim();
      const link =
        formData.customLink
          .trim();
      if (
        title.length <
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
      if (!link) {
        alert(
          "Custom Link harus diisi."
        );
        setActiveTab(
          "info"
        );
        return false;
      }
      if (
        isCustomLinkUsed(
          link
        )
      ) {
        alert(
          "Custom Link sudah digunakan."
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
          "Isi Open Date jika Activate Immediately dimatikan."
        );
        setActiveTab(
          "info"
        );
        return false;
      }
      if (
        formData.timerEnabled
      ) {
        const duration =
          Number(
            formData.timerDuration
          );
        if (
          !Number.isFinite(
            duration
          ) ||
          duration <
            1 ||
          duration >
            1000
        ) {
          alert(
            "Durasi timer harus 1–1000 menit."
          );
          return false;
        }
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
          "Minimal terdapat satu pertanyaan."
        );
        return false;
      }
      const emptyQuestion =
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
        emptyQuestion !==
        -1
      ) {
        alert(
          `Pertanyaan nomor ${emptyQuestion + 1} masih kosong.`
        );
        return false;
      }
      const invalidMultiple =
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
        invalidMultiple !==
        -1
      ) {
        alert(
          `Pilihan jawaban pertanyaan nomor ${invalidMultiple + 1} belum lengkap.`
        );
        return false;
      }
      const invalidScore =
        questions.findIndex(
          (
            question
          ) => {
            if (
              !question.scoring
            ) {
              return false;
            }
            return (
              Number(
                question.points
              ) <=
                0 ||
              !String(
                question.correctAnswer ||
                ""
              ).trim()
            );
          }
        );
      if (
        invalidScore !==
        -1
      ) {
        alert(
          `Scoring pertanyaan nomor ${invalidScore + 1} belum lengkap.`
        );
        return false;
      }
      /*
        PENTING:
        resultMode hanya mengatur apa yang boleh dilihat user
        setelah submit. Penilaian internal admin tetap dapat
        digunakan selama Question Scoring aktif.
        none   = user tidak melihat hasil/nilai
        result = user hanya melihat hasil jawaban
        score  = user melihat hasil + nilai
        Admin tetap dapat melihat benar/salah, kunci jawaban,
        poin, dan nilai dari pertanyaan yang memakai scoring.
      */
      return true;
  };
  // =========================================================
  // CHANGE TAB
  // =========================================================
  const changeTab = (
    tab
  ) => {
    const targetIndex =
      tabOrder.indexOf(
        tab
      );
    if (
      targetIndex >=
        1 &&
      !validateUpload()
    ) {
      return;
    }
    if (
      targetIndex >=
        2 &&
      !validateInfo()
    ) {
      return;
    }
    if (
      targetIndex >=
        3 &&
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
  // =========================================================
  // NEXT
  // =========================================================
  const handleNextStep =
    () => {
      if (
        activeTab ===
          "upload" &&
        !validateUpload()
      ) {
        return;
      }
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
  // =========================================================
  // PREVIOUS
  // =========================================================
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
  const handleSave =
    () => {
      if (
        !validateUpload() ||
        !validateInfo() ||
        !validateSettings() ||
        !validateQuestions()
      ) {
        return;
      }
      const normalizedLink =
        formData.customLink
          .trim()
          .toLowerCase()
          .replace(
            /\s+/g,
            "-"
          );
      const isPublicForm =
        formData.accessMode ===
        "public";
      const timerDuration =
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
          Date.now(),
        title:
          formData.title
            .trim(),
        description: `Imported from Microsoft Word (${selectedFile?.name || "document.docx"}).`,
        type: "Form",
        category: "Form",
        source: "word-import",
        importedFileName:
          selectedFile?.name ||
          "",
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
        // INTERNAL ADMIN GRADING
        // Tidak bergantung pada resultMode user.
        // =====================================================
        grading: {
          enabled:
            questions.some(
              (question) =>
                Boolean(
                  question.scoring
                )
            ),
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
                    1,
                    1
                  )
                );
              },
              0
            ),
          scoredQuestions:
            questions.filter(
              (question) =>
                Boolean(
                  question.scoring
                )
            ).length,
          calculateForAdmin: true,
          userResultMode:
            formData.resultMode,
        },
        timerEnabled:
          Boolean(
            formData.timerEnabled
          ),
        timerDuration,
        duration:
          timerDuration,
        timer: {
          enabled:
            Boolean(
              formData.timerEnabled
            ),
          mode: "custom",
          duration:
            timerDuration,
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
          timerDuration,
          timer: {
            enabled:
              Boolean(
                formData.timerEnabled
              ),
            mode: "custom",
            duration:
              timerDuration,
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
                      question.correctAnswer ||
                      ""
                    ).trim()
                  : "";
              const normalizedOptions =
                (
                  question.options ||
                  []
                ).map(
                  (option) =>
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
                // ===============================================
                // INTERNAL ADMIN SCORING
                // ===============================================
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
                options:
                  normalizedOptions,
                image: "",
                imageName: "",
                imageAnswerType: "",
                imageOptions:
                  [],
              };
            }
          ),
        createdAt:
          new Date()
            .toISOString(),
      };
      try {
        const existingForms =
          getStoredForms();
        if (
          existingForms.some(
            (
              form
            ) =>
              String(
                form.customLink ||
                ""
              )
                .trim()
                .toLowerCase() ===
              normalizedLink
                .toLowerCase()
          )
        ) {
          alert(
            "Custom Link sudah digunakan."
          );
          setActiveTab(
            "info"
          );
          return;
        }
        const updatedForms = [
          ...existingForms,
          savedForm,
        ];
        localStorage.setItem(
          FORMS_STORAGE_KEY,
          JSON.stringify(
            updatedForms
          )
        );
        localStorage.setItem(
          NEW_FORM_STORAGE_KEY,
          JSON.stringify(
            savedForm
          )
        );
        window.dispatchEvent(
          new CustomEvent(
            "hidocs-forms-updated",
            {
              detail: {
                formId:
                  savedForm.id,
              },
            }
          )
        );
        alert(
          isPublicForm
            ? "Form Word berhasil diimport dan dipublikasikan."
            : "Form Word berhasil diimport sebagai QR Code Only."
        );
        navigate(
          "/admin/forms",
          {
            replace: true,
          }
        );
      } catch (error) {
        console.error(
          "Gagal menyimpan form:",
          error
        );
        alert(
          "Form gagal disimpan."
        );
      }
  };
  // =========================================================
  // RENDER TOGGLE
  // =========================================================
  const renderToggle = (
    name,
    icon,
    title,
    description
  ) => (
    <label className="import-setting-option">
      <div className="import-setting-icon">
        {icon}
      </div>
      <div className="import-setting-content">
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
            formData[
              name
            ]
          )
        }
        onChange={
          handleChange
        }
      />
      <span className="import-toggle">
        <span></span>
      </span>
    </label>
  );
  // =========================================================
  // UPLOAD TAB
  // =========================================================
  const renderUploadTab =
    () => (
      <div className="import-word-content">
        <section className="import-word-section">
          <div className="import-section-heading">
            <div className="import-section-icon">
              <FaFileWord />
            </div>
            <div>
              <span>
                Step 1
              </span>
              <h2>
                Import Microsoft Word
              </h2>
              <p>
                Upload a .docx document and HiDocs will convert it into form questions.
              </p>
            </div>
          </div>
          {!selectedFile ? (
            <div
              className="import-drop-zone"
              onClick={() =>
                fileInputRef.current
                  ?.click()
              }
            >
              <input
                ref={
                  fileInputRef
                }
                type="file"
                accept=".docx,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
                onChange={
                  handleFileChange
                }
                hidden
              />
              <div className="import-drop-icon">
                <FaFileWord />
              </div>
              <h3>
                Upload Word Document
              </h3>
              <p>
                Select a Microsoft Word .docx file containing your questions.
              </p>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation();
                  fileInputRef.current
                    ?.click();
                }}
              >
                <FaUpload />
                Choose Word File
              </button>
              <small>
                DOCX • Maximum 10 MB
              </small>
            </div>
          ) : (
            <div className="import-selected-file">
              <div className="import-selected-file-icon">
                <FaFileWord />
              </div>
              <div className="import-selected-file-info">
                <span>
                  Imported Document
                </span>
                <strong>
                  {selectedFile.name}
                </strong>
                <small>
                  {(
                    selectedFile.size /
                    1024
                  ).toFixed(
                    1
                  )}
                  {" "}
                  KB
                </small>
              </div>
              <div className="import-selected-file-result">
                <FaCheckCircle />
                <strong>
                  {questions.length} Questions
                </strong>
                <span>
                  successfully detected
                </span>
              </div>
              <button
                type="button"
                className="import-remove-file"
                onClick={
                  removeImportedFile
                }
              >
                <FaTrash />
              </button>
            </div>
          )}
          {importLoading && (
            <div className="import-processing">
              <span className="import-spinner"></span>
              <div>
                <strong>
                  Reading Word document...
                </strong>
                <p>
                  HiDocs is detecting questions and answers.
                </p>
              </div>
            </div>
          )}
          {importError && (
            <div className="import-message error">
              <FaTimes />
              <span>
                {importError}
              </span>
            </div>
          )}
          {importSuccess && (
            <div className="import-message success">
              <FaCheckCircle />
              <span>
                Word successfully imported. You can continue and review all questions before saving.
              </span>
            </div>
          )}
        </section>
        <section className="import-word-section template-guide">
          <div className="import-section-heading">
            <div className="import-section-icon">
              <FaInfoCircle />
            </div>
            <div>
              <span>
                Recommended Format
              </span>
              <h2>
                Word Question Format
              </h2>
            </div>
          </div>
          <div className="import-template-example">
            <pre>
{`Judul: Ulangan Tengah Semester
1. Ibukota Indonesia adalah?
A. Bandung
B. Jakarta
C. Surabaya
D. Medan
Kunci: B
Poin: 2
2. Siapakah presiden pertama Indonesia?
A. Soekarno
B. Soeharto
C. Habibie
Kunci: A
Poin: 2
[SHORT] Sebutkan semboyan negara Indonesia.
Kunci: Bhinneka Tunggal Ika
Poin: 3
[LONG] Jelaskan makna gotong royong.
[YESNO] Apakah Jakarta merupakan ibu kota Indonesia?
[RATING] Berikan nilai 1-5 untuk materi ini.`}
            </pre>
          </div>
          <p className="import-template-note">
            Pertanyaan pilihan ganda akan otomatis dikenali dari pilihan A, B, C, D.
            Kunci dan poin bersifat opsional jika form tidak menggunakan scoring.
          </p>
        </section>
      </div>
  );
  // =========================================================
  // INFO TAB
  // =========================================================
  const renderInfoTab =
    () => (
      <div className="import-word-content">
        <section className="import-word-section">
          <div className="import-section-heading">
            <div className="import-section-icon">
              <FaInfoCircle />
            </div>
            <div>
              <span>
                Step 2
              </span>
              <h2>
                Basic Information
              </h2>
            </div>
          </div>
          <div className="import-field">
            <label>
              Form Title *
            </label>
            <div className="import-input-wrapper">
              <FaFileAlt />
              <input
                type="text"
                name="title"
                value={
                  formData.title
                }
                onChange={
                  handleChange
                }
                placeholder="Form title"
              />
            </div>
          </div>
          <div className="import-field">
            <label>
              Custom Link *
            </label>
            <div className="import-input-wrapper">
              <FaLink />
              <input
                type="text"
                name="customLink"
                value={
                  formData.customLink
                }
                onChange={
                  handleChange
                }
              />
              <button
                type="button"
                className="import-random-link-btn"
                onClick={
                  generateRandomLink
                }
              >
                {linkGenerated
                  ? <FaCheck />
                  : <FaRandom />
                }
              </button>
            </div>
            <small>
              hidocs.app/r/{formData.customLink || "custom-link"}
            </small>
          </div>
        </section>
        <section className="import-word-section">
          <div className="import-section-heading">
            <div className="import-section-icon">
              <FaCalendarAlt />
            </div>
            <div>
              <span>
                Availability
              </span>
              <h2>
                Schedule
              </h2>
            </div>
          </div>
          <div className="import-schedule-grid">
            <div className="import-field">
              <label>
                Open Date
              </label>
              <div className="import-input-wrapper">
                <FaCalendarAlt />
                <input
                  type="date"
                  name="openDate"
                  value={
                    formData.openDate
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>
            </div>
            <div className="import-field">
              <label>
                Close Date
              </label>
              <div className="import-input-wrapper">
                <FaCalendarAlt />
                <input
                  type="date"
                  name="closeDate"
                  value={
                    formData.closeDate
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>
            </div>
            <div className="import-field">
              <label>
                Open Time
              </label>
              <div className="import-input-wrapper">
                <FaClock />
                <input
                  type="time"
                  name="openTime"
                  value={
                    formData.openTime
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>
            </div>
            <div className="import-field">
              <label>
                Close Time
              </label>
              <div className="import-input-wrapper">
                <FaClock />
                <input
                  type="time"
                  name="closeTime"
                  value={
                    formData.closeTime
                  }
                  onChange={
                    handleChange
                  }
                />
              </div>
            </div>
          </div>
        </section>
      </div>
  );
  // =========================================================
  // SETTINGS TAB
  // =========================================================
  const renderSettingsTab =
    () => (
      <div className="import-settings-page">
        <section className="import-word-section">
          <div className="import-section-heading">
            <div className="import-section-icon">
              <FaCog />
            </div>
            <div>
              <span>
                Step 3
              </span>
              <h2>
                Form Options
              </h2>
            </div>
          </div>
          {renderToggle(
            "shuffleQuestions",
            <FaRandom />,
            "Shuffle question order",
            "Randomize the question order for every respondent."
          )}
          {renderToggle(
            "shuffleAnswers",
            <FaRandom />,
            "Shuffle answer options",
            "Randomize multiple choice answer options."
          )}
          {renderToggle(
            "oneTimeOnly",
            <FaLock />,
            "One-time submission only",
            "Each account can only submit this form once."
          )}
          {renderToggle(
            "activateImmediately",
            <FaPowerOff />,
            "Activate immediately",
            "Make the form available immediately or according to schedule."
          )}
        </section>
        <section className="import-word-section">
          <div className="import-section-heading">
            <div className="import-section-icon">
              <FaHourglassHalf />
            </div>
            <div>
              <span>
                Time Limit
              </span>
              <h2>
                Response Timer
              </h2>
            </div>
          </div>
          {renderToggle(
            "timerEnabled",
            <FaClock />,
            "Enable response timer",
            "Automatically end the attempt when the timer reaches zero."
          )}
          <div className="import-timer-card">
            <div>
              <strong>
                Time Limit
              </strong>
              <span>
                Duration for each respondent.
              </span>
            </div>
            <div className="import-timer-input">
              <input
                type="number"
                name="timerDuration"
                min="1"
                max="1000"
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
          <div className="import-timer-card">
            <div>
              <strong>
                Response Availability
              </strong>
              <span>
                Default response availability.
              </span>
            </div>
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
        </section>
        <section className="import-word-section">
          <div className="import-section-heading">
            <div className="import-section-icon">
              <FaGlobe />
            </div>
            <div>
              <span>
                Distribution
              </span>
              <h2>
                Form Visibility
              </h2>
            </div>
          </div>
          <div className="import-radio-grid">
            <label
              className={
                formData.accessMode ===
                "public"
                  ? "import-choice-card selected"
                  : "import-choice-card"
              }
            >
              <FaGlobe />
              <div>
                <strong>
                  Public Form
                </strong>
                <span>
                  Form appears automatically on the user dashboard.
                </span>
              </div>
              <input
                type="radio"
                name="accessMode"
                value="public"
                checked={
                  formData.accessMode ===
                  "public"
                }
                onChange={
                  handleChange
                }
              />
            </label>
            <label
              className={
                formData.accessMode ===
                "qr-only"
                  ? "import-choice-card selected"
                  : "import-choice-card"
              }
            >
              <FaQrcode />
              <div>
                <strong>
                  QR Code Only
                </strong>
                <span>
                  Hidden from user lists and accessible through QR/direct link.
                </span>
              </div>
              <input
                type="radio"
                name="accessMode"
                value="qr-only"
                checked={
                  formData.accessMode ===
                  "qr-only"
                }
                onChange={
                  handleChange
                }
              />
            </label>
          </div>
        </section>
        <section className="import-word-section">
          <div className="import-section-heading">
            <div className="import-section-icon">
              <FaTrophy />
            </div>
            <div>
              <span>
                Submission
              </span>
              <h2>
                Result & Score
              </h2>
            </div>
          </div>
          <div className="import-result-options">
            {[
              {
                value: "none",
                icon:
                  <FaEyeSlash />,
                title: "Do not show results",
                description: "Users cannot review results after submitting.",
              },
              {
                value: "result",
                icon:
                  <FaEye />,
                title: "Show result only",
                description: "Users can review their submitted questions and answers.",
              },
              {
                value: "score",
                icon:
                  <FaTrophy />,
                title: "Show result and score",
                description: "Users can see correct answers and their score.",
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
                      ? "import-result-option selected"
                      : "import-result-option"
                  }
                >
                  <div className="import-result-icon">
                    {item.icon}
                  </div>
                  <div>
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
          </div>
        </section>
      </div>
  );
  // =========================================================
  // QUESTIONS TAB
  // =========================================================
  const renderQuestionsTab =
    () => (
      <div className="import-word-content">
        <section className="import-question-summary">
          <div>
            <span>
              Step 4
            </span>
            <h2>
              Review Imported Questions
            </h2>
            <p>
              Check the questions detected from Word before saving your form.
            </p>
          </div>
          <div className="import-question-total">
            <strong>
              {questions.length}
            </strong>
            <span>
              Questions
            </span>
          </div>
        </section>
        <div className="import-question-list">
          {questions.map(
            (
              question,
              index
            ) => (
              <article
                key={
                  question.id
                }
                className="import-question-card"
              >
                <div className="import-question-header">
                  <div className="import-question-number">
                    {index + 1}
                  </div>
                  <div className="import-question-type">
                    {
                      questionTypes.find(
                        (
                          item
                        ) =>
                          item.type ===
                          question.type
                      )?.icon ||
                      <FaQuestionCircle />
                    }
                    <span>
                      {
                        questionTypes.find(
                          (
                            item
                          ) =>
                            item.type ===
                            question.type
                        )?.label ||
                        "Question"
                      }
                    </span>
                  </div>
                  <div className="import-question-actions">
                    <button
                      type="button"
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
                      className="danger"
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
                <div className="import-field">
                  <label>
                    Question Type
                  </label>
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
                        type
                      ) => (
                        <option
                          key={
                            type.type
                          }
                          value={
                            type.type
                          }
                        >
                          {type.label}
                        </option>
                      )
                    )}
                  </select>
                </div>
                <div className="import-field">
                  <label>
                    Question
                  </label>
                  <textarea
                    rows="3"
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
                  />
                </div>
                {question.type ===
                  "multiple" && (
                  <div className="import-options-section">
                    <label>
                      Answer Options
                    </label>
                    {(
                      question.options ||
                      []
                    ).map(
                      (
                        option,
                        optionIndex
                      ) => (
                        <div
                          key={
                            `${question.id}-${optionIndex}`
                          }
                          className="import-option-row"
                        >
                          <span>
                            {String.fromCharCode(
                              65 +
                              optionIndex
                            )}
                          </span>
                          <input
                            type="text"
                            value={
                              option
                            }
                            onChange={(event) =>
                              updateOption(
                                question.id,
                                optionIndex,
                                event.target.value
                              )
                            }
                          />
                          {question.options.length >
                            2 && (
                            <button
                              type="button"
                              onClick={() =>
                                deleteOption(
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
                    <button
                      type="button"
                      className="import-add-option"
                      onClick={() =>
                        addOption(
                          question.id
                        )
                      }
                    >
                      <FaPlus />
                      Add Option
                    </button>
                  </div>
                )}
                {question.type ===
                  "yesno" && (
                  <div className="import-yesno-preview">
                    <span>
                      <FaCircle />
                      Yes
                    </span>
                    <span>
                      <FaCircle />
                      No
                    </span>
                  </div>
                )}
                {question.type ===
                  "rating" && (
                  <div className="import-rating-preview">
                    {[1, 2, 3, 4, 5].map(
                      (
                        value
                      ) => (
                        <span
                          key={
                            value
                          }
                        >
                          <FaStar />
                          {value}
                        </span>
                      )
                    )}
                  </div>
                )}
                <div className="import-question-settings">
                  <label className="import-inline-toggle">
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
                    <span>
                      Required Question
                    </span>
                  </label>
                  <label className="import-inline-toggle">
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
                    <span>
                      Question Scoring
                    </span>
                  </label>
                </div>
                {question.scoring && (
                  <div className="import-score-settings">
                    <div className="import-field">
                      <label>
                        Points
                      </label>
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
                    </div>
                    <div className="import-field">
                      <label>
                        Correct Answer
                      </label>
                      {question.type ===
                        "multiple" ||
                      question.type ===
                        "yesno" ? (
                        <select
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
                            question.type ===
                            "yesno"
                              ? [
                                  "Yes",
                                  "No",
                                ]
                              : question.options ||
                                []
                          ).map(
                            (
                              option,
                              optionIndex
                            ) => (
                              <option
                                key={
                                  `${question.id}-correct-${optionIndex}`
                                }
                                value={
                                  option
                                }
                              >
                                {option}
                              </option>
                            )
                          )}
                        </select>
                      ) : question.type ===
                        "rating" ? (
                        <select
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
                            Select rating
                          </option>
                          {[1, 2, 3, 4, 5].map(
                            (
                              value
                            ) => (
                              <option
                                key={
                                  value
                                }
                                value={
                                  String(
                                    value
                                  )
                                }
                              >
                                {value}
                              </option>
                            )
                          )}
                        </select>
                      ) : (
                        <input
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
                          placeholder="Enter correct answer"
                        />
                      )}
                    </div>
                    <small className="import-score-help">
                      Correct answer and points are used for automatic grading and admin result analysis, even when user score visibility is disabled.
                    </small>
                  </div>
                )}
              </article>
            )
          )}
        </div>
        <button
          type="button"
          className="import-add-question-btn"
          onClick={
            addQuestion
          }
        >
          <FaPlus />
          Add Question Manually
        </button>
      </div>
  );
  // =========================================================
  // IMPORT SUMMARY
  // =========================================================
  const importedSummary =
    useMemo(
      () => {
        const multiple =
          questions.filter(
            (
              question
            ) =>
              question.type ===
              "multiple"
          ).length;
        const scoring =
          questions.filter(
            (
              question
            ) =>
              question.scoring
          ).length;
        return {
          multiple,
          scoring,
        };
      },
      [
        questions,
      ]
    );
  // =========================================================
  // RETURN
  // =========================================================
  return (
    <div
      className={
        darkMode
          ? "import-word-page dark"
          : "import-word-page"
      }
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="import-word-header">
        <button
          type="button"
          className="import-back-btn"
          onClick={() =>
            navigate(
              "/admin"
            )
          }
        >
          <FaArrowLeft />
        </button>
        <div className="import-header-title">
          <span>
            Form Builder
          </span>
          <h1>
            Import Word
          </h1>
        </div>
        <div className="import-header-actions">
          {!isFirstTab && (
            <button
              type="button"
              className="import-previous-btn"
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
              className="import-save-btn"
              onClick={
                handleSave
              }
            >
              <FaCheck />
              Save Form
            </button>
          ) : (
            <button
              type="button"
              className="import-save-btn"
              onClick={
                handleNextStep
              }
              disabled={
                activeTab ===
                  "upload" &&
                (
                  importLoading ||
                  !importSuccess
                )
              }
            >
              Next
              <FaArrowRight />
            </button>
          )}
        </div>
      </header>
      {/* =====================================================
          STEP NAVIGATION
      ===================================================== */}
      <nav className="import-tabs">
        {[
          {
            key: "upload",
            number: 1,
            icon:
              <FaFileWord />,
            label: "Import Word",
          },
          {
            key: "info",
            number: 2,
            icon:
              <FaInfoCircle />,
            label: "Info",
          },
          {
            key: "settings",
            number: 3,
            icon:
              <FaCog />,
            label: "Settings",
          },
          {
            key: "questions",
            number: 4,
            icon:
              <FaQuestionCircle />,
            label: "Review",
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
                  ? "import-tab active"
                  : "import-tab"
              }
              onClick={() =>
                changeTab(
                  tab.key
                )
              }
            >
              <span className="import-tab-number">
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
      {/* =====================================================
          IMPORT STATUS BAR
      ===================================================== */}
      {selectedFile &&
      activeTab !==
        "upload" && (
        <div className="import-status-bar">
          <div>
            <FaFileWord />
            <span>
              {selectedFile.name}
            </span>
          </div>
          <div>
            <strong>
              {questions.length}
            </strong>
            questions
            <strong>
              {importedSummary.multiple}
            </strong>
            multiple choice
            <strong>
              {importedSummary.scoring}
            </strong>
            scored
          </div>
        </div>
      )}
      {/* =====================================================
          PAGE CONTENT
      ===================================================== */}
      {activeTab ===
        "upload" &&
        renderUploadTab()}
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
export default ImportWord;