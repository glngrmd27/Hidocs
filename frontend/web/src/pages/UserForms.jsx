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
} from "react-router-dom";
import {
  FaArrowRight,
  FaCheck,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaEye,
  FaFileAlt,
  FaQrcode,
  FaRegCalendarAlt,
  FaSearch,
  FaTimes,
} from "react-icons/fa";
import {
  Html5Qrcode,
  Html5QrcodeSupportedFormats,
} from "html5-qrcode";
import {
  getFormById,
  getPublicForm,
} from "../api/formApi";
import {
  FormContext,
} from "../context/FormContext";
import {
  ThemeContext,
} from "../context/ThemeContext";
import BottomNavigation from "../components/BottomNavigation";
import "../assets/css/UserForms.css";
// =========================================================
// STORAGE KEYS
// =========================================================
const FORMS_STORAGE_KEY =
  "hidocs_forms";
const DELETED_FORMS_STORAGE_KEY =
  "hidocs_deleted_forms";
const SAVED_FORMS_STORAGE_KEY =
  "hidocs_user_saved_forms";
// =========================================================
// DEFAULT FORMS
// Semua default form dianggap public.
// =========================================================
const defaultForms = [
  {
    id: 1,
    title: "Survey Kepuasan Mahasiswa 2024",
    description: "Bagikan pendapatmu mengenai pengalaman dan pelayanan kampus.",
    category: "Survey",
    questions: 5,
    duration: "5 min",
    deadline: "15 Jul 2024",
    active: true,
    accent: "blue",
    customLink: "survey-mhs-2024",
    link: "hidocs.app/r/survey-mhs-2024",
    createdAt: "2024-06-10T00:00:00.000Z",
    accessMode: "public",
    showInUserList: true,
    qrOnly: false,
  },
  {
    id: 2,
    title: "Quiz Pemrograman Mobile - Flutter",
    description: "Uji pemahamanmu mengenai dasar-dasar pengembangan Flutter.",
    category: "Quiz",
    questions: 10,
    duration: "20 min",
    deadline: "18 Jul 2024",
    active: true,
    accent: "purple",
    customLink: "quiz-flutter-w5",
    link: "hidocs.app/r/quiz-flutter-w5",
    createdAt: "2024-06-11T00:00:00.000Z",
    accessMode: "public",
    showInUserList: true,
    qrOnly: false,
  },
  {
    id: 3,
    title: "Form Pendaftaran Event Hackathon",
    description: "Daftarkan dirimu untuk mengikuti kegiatan Hackathon HiDocs.",
    category: "Registration",
    questions: 7,
    duration: "8 min",
    deadline: "20 Jul 2024",
    active: true,
    accent: "green",
    customLink: "hack24",
    link: "hidocs.app/r/hack24",
    createdAt: "2024-06-13T00:00:00.000Z",
    accessMode: "public",
    showInUserList: true,
    qrOnly: false,
  },
];
// =========================================================
// ACCENT OPTIONS
// =========================================================
const accentOptions = [
  "blue",
  "purple",
  "green",
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
// FORMAT DATE
// =========================================================
const formatDate = (
  dateValue
) => {
  if (!dateValue) {
    return "No deadline";
  }
  const date =
    new Date(
      dateValue
    );
  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(
      dateValue
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
// CREATE DATE TIME
// Digunakan untuk membaca jadwal Open dan Close.
// =========================================================
const createDateTime = (
  dateValue,
  timeValue,
  fallbackTime
) => {
  if (!dateValue) {
    return null;
  }
  const finalTime =
    timeValue ||
    fallbackTime;
  const date =
    new Date(
      `${dateValue}T${finalTime}`
    );
  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return null;
  }
  return date;
};
// =========================================================
// GET SCHEDULE STATUS
//
// inactive  = dinonaktifkan admin.
// not-open  = jadwal belum dimulai.
// available = dapat dikerjakan.
// closed    = jadwal sudah berakhir.
// =========================================================
const getScheduleStatus = (
  form
) => {
  if (
    form.active ===
    false
  ) {
    return {
      code: "inactive",
      label: "Inactive",
      canFill: false,
    };
  }
  const currentTime =
    new Date();
  const openDateTime =
    createDateTime(
      form.openDate,
      form.openTime,
      "00:00"
    );
  const closeDateTime =
    createDateTime(
      form.closeDate,
      form.closeTime,
      "23:59"
    );
  if (
    openDateTime &&
    currentTime <
      openDateTime
  ) {
    return {
      code: "not-open",
      label: "Not Open Yet",
      canFill: false,
    };
  }
  if (
    closeDateTime &&
    currentTime >
      closeDateTime
  ) {
    return {
      code: "closed",
      label: "Closed",
      canFill: false,
    };
  }
  return {
    code: "available",
    label: "Available",
    canFill: true,
  };
};
// =========================================================
// NORMALIZE CUSTOM LINK
// =========================================================
const normalizeCustomLink = (
  form
) => {
  const rawValue =
    String(
      form.customLink ||
      form.link ||
      ""
    )
      .trim()
      .replace(
        /^https?:\/\//i,
        ""
      )
      .replace(
        /^hidocs\.app\/r\//i,
        ""
      )
      .replace(
        /^localhost:\d+\/r\//i,
        ""
      )
      .replace(
        /^localhost:\d+\/form-details\//i,
        ""
      )
      .replace(
        /^\/form-details\//i,
        ""
      )
      .replace(
        /^\/r\//i,
        ""
      )
      .replace(
        /^\/+/,
        ""
      )
      .split("?")[0]
      .split("#")[0];
  return (
    rawValue ||
    String(
      form.id ||
      ""
    )
  );
};
// =========================================================
// CHECK ACTIVE FORM
// =========================================================
const isFormActive = (
  form
) => {
  return (
    form.active !==
    false
  );
};
// =========================================================
// CHECK PUBLIC FORM
// =========================================================
const isPublicForm = (
  form
) => {
  const accessMode =
    form.accessMode ??
    form.settings?.accessMode ??
    "public";
  const qrOnly =
    form.qrOnly ??
    form.settings?.qrOnly ??
    accessMode ===
      "qr-only";
  const showInUserList =
    form.showInUserList ??
    form.settings?.showInUserList ??
    !qrOnly;
  return (
    accessMode !==
      "qr-only" &&
    qrOnly !==
      true &&
    showInUserList !==
      false
  );
};
// =========================================================
// GET FORM DURATION
// =========================================================
const getFormDuration = (
  form
) => {
  const timerObject =
    form.settings?.timer &&
    typeof form.settings.timer ===
      "object"
      ? form.settings.timer
      : null;
  const timerEnabled =
    form.timerEnabled ??
    form.settings?.timerEnabled ??
    timerObject?.enabled;
  if (
    timerEnabled ===
    false
  ) {
    return "No timer";
  }
  const durationValue =
    form.timerDuration ??
    form.settings?.timerDuration ??
    timerObject?.duration ??
    form.duration ??
    form.settings?.duration;
  if (
    durationValue ===
      undefined ||
    durationValue ===
      null ||
    durationValue ===
      ""
  ) {
    return "No timer";
  }
  if (
    typeof durationValue ===
    "string"
  ) {
    const durationText =
      durationValue.trim();
    if (!durationText) {
      return "No timer";
    }
    if (
      durationText
        .toLowerCase()
        .includes(
          "min"
        )
    ) {
      return durationText;
    }
    const durationNumber =
      Number(
        durationText
      );
    if (
      Number.isFinite(
        durationNumber
      ) &&
      durationNumber >
        0
    ) {
      return `${durationNumber} min`;
    }
    return durationText;
  }
  const durationNumber =
    Number(
      durationValue
    );
  if (
    Number.isFinite(
      durationNumber
    ) &&
    durationNumber >
      0
  ) {
    return `${durationNumber} min`;
  }
  return "No timer";
};
// =========================================================
// NORMALIZE FORM
// =========================================================
const normalizeForm = (
  form,
  index
) => {
  const customLink =
    normalizeCustomLink(
      form
    );
  const questionCount =
    Array.isArray(
      form.questions
    )
      ? form.questions.length
      : Number(
          form.questions
        ) || 0;
  const accessMode =
    form.accessMode ??
    form.settings?.accessMode ??
    "public";
  const qrOnly =
    form.qrOnly ??
    form.settings?.qrOnly ??
    accessMode ===
      "qr-only";
  const showInUserList =
    form.showInUserList ??
    form.settings?.showInUserList ??
    !qrOnly;
  const scheduleStatus =
    getScheduleStatus(
      form
    );
  return {
    ...form,
    id:
      form.id ??
      Date.now() +
      index,
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
      "Complete this form and submit your response.",
    category:
      form.category ||
      form.type ||
      "Form",
    questions:
      questionCount,
    duration:
      getFormDuration(
        form
      ),
    deadline:
      form.closeDate
        ? formatDate(
            form.closeDate
          )
        : form.deadline
        ? formatDate(
            form.deadline
          )
        : "No deadline",
    active:
      isFormActive(
        form
      ),
    scheduleStatus:
      scheduleStatus.code,
    scheduleLabel:
      scheduleStatus.label,
    canFill:
      scheduleStatus.canFill,
    openDate:
      form.openDate ||
      "",
    openTime:
      form.openTime ||
      "",
    closeDate:
      form.closeDate ||
      "",
    closeTime:
      form.closeTime ||
      "",
    accent:
      form.accent ||
      accentOptions[
        index %
        accentOptions.length
      ],
    customLink,
    link:
      form.link
        ? String(
            form.link
          ).replace(
            /^https?:\/\//i,
            ""
          )
        : `hidocs.app/r/${customLink}`,
    createdAt:
      form.createdAt ||
      new Date(
        Date.now() +
        index
      ).toISOString(),
    accessMode,
    qrOnly,
    showInUserList,
  };
};
// =========================================================
// MERGE FORMS
//
// Default dimasukkan dulu.
// localStorage dimasukkan setelahnya.
// Jadi data hasil perubahan admin memiliki prioritas.
// =========================================================
const mergeForms = (
  baseForms,
  storedForms
) => {
  const result =
    [];
  const combinedSource = [
    ...baseForms,
    ...storedForms,
  ];
  combinedSource.forEach(
    (
      form,
      index
    ) => {
      const normalizedForm =
        normalizeForm(
          form,
          index
        );
      const existingIndex =
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
              Boolean(
                item.customLink
              ) &&
              Boolean(
                normalizedForm.customLink
              ) &&
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
        existingIndex !==
        -1
      ) {
        result[
          existingIndex
        ] =
          normalizedForm;
      } else {
        result.push(
          normalizedForm
        );
      }
    }
  );
  return result;
};
// =========================================================
// USER FORMS
// =========================================================
function UserForms() {
  const navigate =
    useNavigate();
  const {
    darkMode,
  } = useContext(
    ThemeContext
  );
  const {
    submittedForms = [],
  } = useContext(
    FormContext
  );
  // =========================================================
  // FORM STATE
  //
  // allForms:
  // Form aktif untuk scanner QR.
  //
  // forms:
  // Form public yang tampil di daftar user.
  // =========================================================
  const [
    allForms,
    setAllForms,
  ] = useState([]);
  const [
    forms,
    setForms,
  ] = useState([]);
  const [
    search,
    setSearch,
  ] = useState("");
  const [
    showScanner,
    setShowScanner,
  ] = useState(false);
  const [
    scannerStatus,
    setScannerStatus,
  ] = useState("");
  const [
    scannerError,
    setScannerError,
  ] = useState("");
  const [
    savedFormIds,
    setSavedFormIds,
  ] = useState([]);
  const [
    scannerRunning,
    setScannerRunning,
  ] = useState(false);
  const scannerRef =
    useRef(null);
  const scanHandledRef =
    useRef(false);
  // =========================================================
  // LOAD FORMS
  // =========================================================
  const loadForms =
    useCallback(
      () => {
        try {
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
          const currentSavedIds =
            getStoredArray(
              SAVED_FORMS_STORAGE_KEY
            ).map(
              (
                formId
              ) =>
                String(
                  formId
                )
            );
          // ===================================================
          // MERGE DEFAULT + DATA ADMIN
          // ===================================================
          const combinedForms =
            mergeForms(
              defaultForms,
              storedForms
            );
          // ===================================================
          // REMOVE DELETED
          // ===================================================
          const nonDeletedForms =
            combinedForms.filter(
              (
                form
              ) => {
                return (
                  !deletedFormIds.includes(
                    String(
                      form.id
                    )
                  )
                );
              }
            );
          // ===================================================
          // ACTIVE FORMS
          //
          // Digunakan scanner.
          //
          // Form yang Closed / Not Open masih termasuk,
          // selama tidak dinonaktifkan admin.
          // ===================================================
          const activeForms =
            nonDeletedForms.filter(
              (
                form
              ) =>
                form.active !==
                false
            );
          // ===================================================
          // VISIBLE PUBLIC FORMS
          //
          // Public form tetap ditampilkan meskipun:
          // - belum dibuka
          // - sudah ditutup
          //
          // Supaya user bisa melihat status jadwalnya.
          // ===================================================
          const visibleForms =
            activeForms.filter(
              (
                form
              ) =>
                isPublicForm(
                  form
                )
            );
          // ===================================================
          // SORT NEWEST FIRST
          // ===================================================
          const sortedForms =
            [...visibleForms].sort(
              (
                first,
                second
              ) => {
                const firstTime =
                  new Date(
                    first.createdAt ||
                    0
                  ).getTime();
                const secondTime =
                  new Date(
                    second.createdAt ||
                    0
                  ).getTime();
                const safeFirstTime =
                  Number.isNaN(
                    firstTime
                  )
                    ? 0
                    : firstTime;
                const safeSecondTime =
                  Number.isNaN(
                    secondTime
                  )
                    ? 0
                    : secondTime;
                return (
                  safeSecondTime -
                  safeFirstTime
                );
              }
            );
          setAllForms(
            activeForms
          );
          setForms(
            sortedForms
          );
          setSavedFormIds(
            currentSavedIds
          );
        } catch (error) {
          console.error(
            "Gagal memuat form user:",
            error
          );
          setAllForms([]);
          setForms([]);
          setSavedFormIds([]);
        }
      },
      []
    );
  // =========================================================
  // LOAD PAGE
  // =========================================================
  useEffect(
    () => {
      loadForms();
    },
    [
      loadForms,
    ]
  );
  // =========================================================
  // AUTO REFRESH SCHEDULE
  //
  // Status berubah otomatis:
  // Not Open Yet -> Available -> Closed
  // =========================================================
  useEffect(
    () => {
      const interval =
        window.setInterval(
          () => {
            loadForms();
          },
          30000
        );
      return () => {
        window.clearInterval(
          interval
        );
      };
    },
    [
      loadForms,
    ]
  );
  // =========================================================
  // STORAGE CHANGE
  // =========================================================
  useEffect(
    () => {
      const handleStorageChange =
        (
          event
        ) => {
          if (
            event.key ===
              FORMS_STORAGE_KEY ||
            event.key ===
              DELETED_FORMS_STORAGE_KEY ||
            event.key ===
              SAVED_FORMS_STORAGE_KEY
          ) {
            loadForms();
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
    },
    [
      loadForms,
    ]
  );
  // =========================================================
  // WINDOW FOCUS
  // =========================================================
  useEffect(
    () => {
      const handleFocus =
        () => {
          loadForms();
        };
      window.addEventListener(
        "focus",
        handleFocus
      );
      return () => {
        window.removeEventListener(
          "focus",
          handleFocus
        );
      };
    },
    [
      loadForms,
    ]
  );
  // =========================================================
  // PAGE VISIBILITY
  // =========================================================
  useEffect(
    () => {
      const handleVisibilityChange =
        () => {
          if (
            document.visibilityState ===
            "visible"
          ) {
            loadForms();
          }
        };
      document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
      return () => {
        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );
      };
    },
    [
      loadForms,
    ]
  );
  // =========================================================
  // PAGE SHOW
  // =========================================================
  useEffect(
    () => {
      const handlePageShow =
        () => {
          loadForms();
        };
      window.addEventListener(
        "pageshow",
        handlePageShow
      );
      return () => {
        window.removeEventListener(
          "pageshow",
          handlePageShow
        );
      };
    },
    [
      loadForms,
    ]
  );
  // =========================================================
  // CUSTOM UPDATE EVENT
  //
  // AdminFormDetails menggunakan event ini setelah:
  // - active / inactive
  // - perubahan jadwal
  // =========================================================
  useEffect(
    () => {
      const handleFormsUpdated =
        () => {
          loadForms();
        };
      window.addEventListener(
        "hidocs-forms-updated",
        handleFormsUpdated
      );
      return () => {
        window.removeEventListener(
          "hidocs-forms-updated",
          handleFormsUpdated
        );
      };
    },
    [
      loadForms,
    ]
  );
  // =========================================================
  // CHECK SUBMITTED
  // =========================================================
  const isSubmitted = (
    formId
  ) => {
    return submittedForms.some(
      (
        submission
      ) => {
        const submissionFormId =
          submission.formId ??
          submission.id;
        return (
          String(
            submissionFormId
          ) ===
          String(
            formId
          )
        );
      }
    );
  };
  // =========================================================
  // FILTERED FORMS
  // =========================================================
  const filteredForms =
    useMemo(
      () => {
        const keyword =
          search
            .trim()
            .toLowerCase();
        if (!keyword) {
          return forms;
        }
        return forms.filter(
          (
            form
          ) => {
            const searchableValue = [
              form.title,
              form.description,
              form.category,
              form.customLink,
              form.link,
              form.scheduleLabel,
            ]
              .map(
                (
                  value
                ) =>
                  String(
                    value ||
                    ""
                  ).toLowerCase()
              )
              .join(
                " "
              );
            return searchableValue.includes(
              keyword
            );
          }
        );
      },
      [
        forms,
        search,
      ]
    );
  // =========================================================
  // SAVE FORM TO USER
  //
  // Disimpan untuk mengetahui QR-only yang pernah dibuka.
  // QR-only tetap tidak ditampilkan di daftar public.
  // =========================================================
  const saveFormToUser =
    useCallback(
      (
        formId
      ) => {
        const currentSavedIds =
          getStoredArray(
            SAVED_FORMS_STORAGE_KEY
          ).map(
            (
              savedId
            ) =>
              String(
                savedId
              )
          );
        const normalizedId =
          String(
            formId
          );
        if (
          currentSavedIds.includes(
            normalizedId
          )
        ) {
          return currentSavedIds;
        }
        const updatedIds = [
          ...currentSavedIds,
          normalizedId,
        ];
        localStorage.setItem(
          SAVED_FORMS_STORAGE_KEY,
          JSON.stringify(
            updatedIds
          )
        );
        setSavedFormIds(
          updatedIds
        );
        return updatedIds;
      },
      []
    );
  // =========================================================
  // OPEN PUBLIC FORM DETAILS
  // =========================================================
  const openFormDetails = (
    form
  ) => {
    navigate(
      `/form-details/${form.id}`
    );
  };
  // =========================================================
  // NORMALIZE QR TOKEN
  // =========================================================
  const normalizeQrToken = (
    value
  ) => {
    return String(
      value ??
      ""
    )
      .trim()
      .replace(
        /^https?:\/\//i,
        ""
      )
      .replace(
        /^hidocs\.app\/r\//i,
        ""
      )
      .replace(
        /^form-details\//i,
        ""
      )
      .replace(
        /^r\//i,
        ""
      )
      .replace(
        /^\/+/, ""
      )
      .replace(
        /\/+$/,
        ""
      )
      .split("?")[0]
      .split("#")[0]
      .toLowerCase();
  };
  // =========================================================
  // EXTRACT VALUE FROM QR
  // =========================================================
  const extractQrIdentifier = (
    scannedValue
  ) => {
    const cleanValue =
      String(
        scannedValue ||
        ""
      ).trim();
    if (!cleanValue) {
      return "";
    }
    try {
      const parsedUrl =
        new URL(
          cleanValue
        );
      const pathParts =
        parsedUrl.pathname
          .split("/")
          .filter(
            Boolean
          );
      const formDetailsIndex =
        pathParts.findIndex(
          (
            part
          ) =>
            part ===
            "form-details"
        );
      if (
        formDetailsIndex !==
          -1 &&
        pathParts[
          formDetailsIndex +
          1
        ]
      ) {
        return decodeURIComponent(
          pathParts[
            formDetailsIndex +
            1
          ]
        );
      }
      const publicLinkIndex =
        pathParts.findIndex(
          (
            part
          ) =>
            part ===
            "r"
        );
      if (
        publicLinkIndex !==
          -1 &&
        pathParts[
          publicLinkIndex +
          1
        ]
      ) {
        return decodeURIComponent(
          pathParts[
            publicLinkIndex +
            1
          ]
        );
      }
      return decodeURIComponent(
        pathParts[
          pathParts.length -
          1
        ] ||
        cleanValue
      );
    } catch {
      return decodeURIComponent(
        cleanValue
          .replace(
            /^https?:\/\//i,
            ""
          )
          .replace(
            /^hidocs\.app\/r\//i,
            ""
          )
          .replace(
            /^.*\/form-details\//i,
            ""
          )
          .replace(
            /^.*\/r\//i,
            ""
          )
          .replace(
            /^\/+/,
            ""
          )
          .split("?")[0]
          .split("#")[0]
      );
    }
  };
  // =========================================================
  // FETCH REMOTE FORM FROM QR
  // =========================================================
  const fetchRemoteFormFromQr =
    useCallback(
      async (
        identifier
      ) => {
        if (!identifier) {
          return null;
        }

        const candidateRequests = [];
        if (/^\d+$/.test(identifier)) {
          candidateRequests.push(async () => {
            const response = await getFormById(identifier);
            return response?.data?.data ?? response?.data ?? response;
          });
        }

        candidateRequests.push(async () => {
          const response = await getPublicForm(identifier);
          return response?.data?.data ?? response?.data ?? response;
        });

        for (const request of candidateRequests) {
          try {
            const payload = await request();
            if (!payload) {
              continue;
            }

            const remoteForm = {
              id:
                payload.id ??
                payload.form_id ??
                payload.formId ??
                identifier,
              title:
                payload.title ||
                "Form",
              description:
                payload.description ||
                "",
              category:
                payload.category ||
                payload.type ||
                "General",
              active:
                payload.active !==
                false &&
                payload.status !==
                "INACTIVE",
              customLink:
                payload.custom_url ||
                payload.customUrl ||
                payload.short_code ||
                payload.shortCode ||
                identifier,
              link:
                payload.link ||
                payload.url ||
                payload.public_link ||
                payload.publicLink ||
                (payload.custom_url
                  ? `hidocs.app/r/${payload.custom_url}`
                  : ""),
              createdAt:
                payload.created_at ||
                payload.createdAt ||
                new Date().toISOString(),
              accessMode:
                payload.access_mode ||
                payload.accessMode ||
                "public",
              showInUserList:
                payload.show_in_user_list ??
                payload.showInUserList ??
                true,
              qrOnly:
                payload.qr_only ??
                payload.qrOnly ??
                false,
              isRemote: true,
            };

            return remoteForm;
          } catch (error) {
            console.warn(
              "QR fetch fallback gagal:",
              identifier,
              error
            );
          }
        }

        return null;
      },
      []
    );

  // =========================================================
  // FIND FORM FROM QR
  // =========================================================
  const findFormFromQr =
    useCallback(
      async (
        scannedValue
      ) => {
        const identifier =
          normalizeQrToken(
            extractQrIdentifier(
              scannedValue
            )
          );
        if (!identifier) {
          return null;
        }

        const normalizedScannedLink =
          normalizeQrToken(
            scannedValue
          );

        const localMatch =
          allForms.find(
            (
              form
            ) => {
              const formId =
                normalizeQrToken(
                  form.id
                );
              const formCustomLink =
                normalizeQrToken(
                  form.customLink
                );
              const formLink =
                normalizeQrToken(
                  form.link
                );
              const formPublicLink =
                normalizeQrToken(
                  form.publicLink
                );
              const formUrl =
                normalizeQrToken(
                  form.url
                );

              return (
                formId ===
                  identifier ||
                formCustomLink ===
                  identifier ||
                formLink ===
                  identifier ||
                formPublicLink ===
                  identifier ||
                formUrl ===
                  identifier ||
                formLink ===
                  normalizedScannedLink ||
                formPublicLink ===
                  normalizedScannedLink ||
                formUrl ===
                  normalizedScannedLink ||
                formCustomLink ===
                  normalizedScannedLink
              );
            }
          );

        if (localMatch) {
          return localMatch;
        }

        return fetchRemoteFormFromQr(
          identifier
        );
      },
      [
        allForms,
        fetchRemoteFormFromQr,
        normalizeQrToken,
      ]
    );
  // =========================================================
  // STOP QR SCANNER
  // =========================================================
  const stopScanner =
    useCallback(
      async () => {
        const scanner =
          scannerRef.current;
        if (!scanner) {
          setScannerRunning(
            false
          );
          return;
        }
        try {
          if (
            scanner.isScanning
          ) {
            await scanner.stop();
          }
        } catch (error) {
          console.error(
            "Gagal menghentikan scanner:",
            error
          );
        }
        try {
          await scanner.clear();
        } catch (error) {
          console.error(
            "Gagal membersihkan scanner:",
            error
          );
        } finally {
          scannerRef.current =
            null;
          setScannerRunning(
            false
          );
        }
      },
      []
    );
  // =========================================================
  // CLOSE SCANNER
  // =========================================================
  const closeScanner =
    useCallback(
      async () => {
        await stopScanner();
        setShowScanner(
          false
        );
        setScannerStatus(
          ""
        );
        setScannerError(
          ""
        );
        scanHandledRef.current =
          false;
      },
      [
        stopScanner,
      ]
    );
  // =========================================================
  // RESOLVE DIRECT QR ROUTE
  // =========================================================
  const resolveQrNavigationTarget =
    useCallback(
      (
        scannedValue
      ) => {
        const rawValue =
          String(
            scannedValue ||
            ""
          ).trim();
        if (!rawValue) {
          return null;
        }

        try {
          const parsedUrl =
            new URL(
              rawValue
            );
          const pathParts =
            parsedUrl.pathname
              .split("/")
              .filter(
                Boolean
              );

          const formIndex =
            pathParts.findIndex(
              (
                part
              ) =>
                part ===
                "form-details"
            );
          if (
            formIndex !==
              -1 &&
            pathParts[
              formIndex +
              1
            ]
          ) {
            return `/fill-form/${pathParts[formIndex + 1]}`;
          }

          const shortLinkIndex =
            pathParts.findIndex(
              (
                part
              ) =>
                part === "r"
            );
          if (
            shortLinkIndex !==
              -1 &&
            pathParts[
              shortLinkIndex +
              1
            ]
          ) {
            return `/fill-form/${pathParts[shortLinkIndex + 1]}`;
          }
        } catch {
          // URL parse gagal: fallback gunakan raw string.
        }

        const fallbackIdentifier =
          normalizeQrToken(
            extractQrIdentifier(
              rawValue
            )
          );
        if (!fallbackIdentifier) {
          return null;
        }

        if (/^\d+$/.test(fallbackIdentifier)) {
          return `/fill-form/${fallbackIdentifier}`;
        }

        const routeLikeMatch =
          String(
            fallbackIdentifier
          ).match(
            /(?:^|[/?#])(?:form-details|r)[/?#]?([^/?#]+)/i
          );
        if (routeLikeMatch?.[1]) {
          return `/fill-form/${routeLikeMatch[1]}`;
        }

        return null;
      },
      []
    );
  // =========================================================
  // HANDLE SCAN SUCCESS
  // =========================================================
  const handleScanSuccess =
    useCallback(
      async (
        decodedText
      ) => {
        if (
          scanHandledRef.current
        ) {
          return;
        }
        scanHandledRef.current =
          true;

        const directTarget =
          resolveQrNavigationTarget(
            decodedText
          );
        const matchedForm =
          await findFormFromQr(
            decodedText
          );

        if (!matchedForm && !directTarget) {
          scanHandledRef.current =
            false;
          setScannerStatus(
            ""
          );
          setScannerError(
            "QR Code tidak sesuai dengan form HiDocs yang aktif atau form sudah tidak tersedia."
          );
          return;
        }

        const finalTarget =
          matchedForm
            ? `/fill-form/${matchedForm.id}`
            : directTarget;

        if (
          matchedForm &&
          !matchedForm.isRemote &&
          !isFormActive(
            matchedForm
          )
        ) {
          scanHandledRef.current =
            false;
          setScannerStatus(
            ""
          );
          setScannerError(
            "Form ini sedang dinonaktifkan oleh admin."
          );
          return;
        }

        setScannerError(
          ""
        );
        if (matchedForm) {
          if (
            matchedForm.scheduleStatus ===
            "not-open"
          ) {
            setScannerStatus(
              `Form "${matchedForm.title}" berhasil ditemukan. Form belum dibuka.`
            );
          } else if (
            matchedForm.scheduleStatus ===
            "closed"
          ) {
            setScannerStatus(
              `Form "${matchedForm.title}" berhasil ditemukan. Form sudah ditutup.`
            );
          } else {
            setScannerStatus(
              `Form "${matchedForm.title}" berhasil ditemukan.`
            );
          }
          saveFormToUser(
            matchedForm.id
          );
        } else {
          setScannerStatus(
            "QR Code valid. Membuka form..."
          );
        }

        await stopScanner();
        window.setTimeout(
          () => {
            setShowScanner(
              false
            );
            navigate(
              finalTarget
            );
          },
          700
        );
      },
      [
        findFormFromQr,
        navigate,
        resolveQrNavigationTarget,
        saveFormToUser,
        stopScanner,
      ]
    );
  // =========================================================
  // START QR SCANNER
  // =========================================================
  const startScanner =
    useCallback(
      async () => {
        setScannerError(
          ""
        );
        setScannerStatus(
          "Meminta izin kamera..."
        );
        scanHandledRef.current =
          false;
        try {
          await stopScanner();
          const readerElement =
            document.getElementById(
              "user-form-qr-reader"
            );
          if (!readerElement) {
            throw new Error(
              "QR reader element tidak ditemukan."
            );
          }
          const scanner =
            new Html5Qrcode(
              "user-form-qr-reader"
            );
          scannerRef.current =
            scanner;
          await scanner.start(
            {
              facingMode: "environment",
            },
            {
              fps: 10,
              qrbox:
                {
                  width: 240,
                  height: 240,
                },
              aspectRatio: 1,
              disableFlip: false,
            },
            handleScanSuccess,
            () => {
              // Error pembacaan tiap frame sengaja diabaikan.
            },
            [Html5QrcodeSupportedFormats.QR_CODE]
          );
          setScannerRunning(
            true
          );
          setScannerStatus(
            "Arahkan kamera ke QR Code form."
          );
        } catch (error) {
          console.error(
            "Gagal membuka QR scanner:",
            error
          );
          scannerRef.current =
            null;
          setScannerRunning(
            false
          );
          setScannerStatus(
            ""
          );
          setScannerError(
            "Kamera tidak dapat dibuka. Pastikan izin kamera diberikan dan aplikasi dibuka melalui localhost atau HTTPS."
          );
        }
      },
      [
        handleScanSuccess,
        stopScanner,
      ]
    );
  // =========================================================
  // OPEN SCANNER
  // =========================================================
  const openScanner =
    () => {
      setShowScanner(
        true
      );
      setScannerStatus(
        ""
      );
      setScannerError(
        ""
      );
      scanHandledRef.current =
        false;
    };
  // =========================================================
  // START SCANNER WHEN MODAL OPENS
  // =========================================================
  useEffect(
    () => {
      if (!showScanner) {
        return undefined;
      }
      const timer =
        window.setTimeout(
          () => {
            startScanner();
          },
          250
        );
      return () => {
        window.clearTimeout(
          timer
        );
      };
    },
    [
      showScanner,
      startScanner,
    ]
  );
  // =========================================================
  // SCANNER CLEANUP
  // =========================================================
  useEffect(
    () => {
      return () => {
        const scanner =
          scannerRef.current;
        if (!scanner) {
          return;
        }
        if (
          scanner.isScanning
        ) {
          scanner
            .stop()
            .catch(
              () => {}
            );
        }
        scanner
          .clear()
          .catch(
            () => {}
          );
      };
    },
    []
  );
  // =========================================================
  // RETURN
  // =========================================================
  return (
    <div
      className={
        darkMode
          ? "user-forms-page dark"
          : "user-forms-page"
      }
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="user-forms-header">
        <div className="user-forms-header-decoration">
          <span className="user-forms-circle circle-one"></span>
          <span className="user-forms-circle circle-two"></span>
          <div className="user-forms-dots">
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
        <div className="user-forms-header-content">
          <div>
            <span className="user-forms-eyebrow">
              Form Directory
            </span>
            <h1>
              Explore Forms
            </h1>
            <p>
              Search available forms or scan a QR Code to open a private form.
            </p>
          </div>
          <button
            type="button"
            className="user-forms-scan-btn"
            onClick={
              openScanner
            }
          >
            <FaQrcode />
            <span>
              Scan QR
            </span>
          </button>
        </div>
      </header>
      {/* =====================================================
          CONTENT
      ===================================================== */}
      <main className="user-forms-content">
        {/* ===================================================
            TOOLBAR
        =================================================== */}
        <section className="user-forms-toolbar">
          <div className="user-forms-toolbar-heading">
            <span>
              Available Forms
            </span>
            <h2>
              All Forms
            </h2>
            <p>
              {filteredForms.length}
              {" "}
              of
              {" "}
              {forms.length}
              {" "}
              forms displayed
            </p>
          </div>
          <div className="user-forms-search">
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
              placeholder="Search form, category, or link..."
            />
            {search && (
              <button
                type="button"
                onClick={() =>
                  setSearch("")
                }
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </section>
        {/* ===================================================
            FORMS
        =================================================== */}
        <section className="user-forms-grid">
          {filteredForms.length ===
          0 ? (
            <div className="user-forms-empty">
              <div className="user-forms-empty-icon">
                {search
                  ? <FaSearch />
                  : <FaClipboardList />
                }
              </div>
              <h3>
                {search
                  ? "No matching forms"
                  : "No forms available"
                }
              </h3>
              <p>
                {search
                  ? `No form matches “${search}”.`
                  : "There are currently no public forms. Scan a QR Code to access a private form."
                }
              </p>
              {search ? (
                <button
                  type="button"
                  onClick={() =>
                    setSearch("")
                  }
                >
                  Clear Search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    openScanner
                  }
                >
                  <FaQrcode />
                  Scan QR Code
                </button>
              )}
            </div>
          ) : (
            filteredForms.map(
              (
                form
              ) => {
                const submitted =
                  isSubmitted(
                    form.id
                  );
                const isClosed =
                  form.scheduleStatus ===
                  "closed";
                const isNotOpen =
                  form.scheduleStatus ===
                  "not-open";
                return (
                  <article
                    key={
                      form.id
                    }
                    className={[
                      "user-form-card",
                      submitted
                        ? "submitted"
                        : "",
                      isClosed
                        ? "closed"
                        : "",
                      isNotOpen
                        ? "waiting"
                        : "",
                      form.accent,
                    ]
                      .filter(
                        Boolean
                      )
                      .join(
                        " "
                      )}
                  >
                    {/* =======================================
                        CARD HEADER
                    ======================================= */}
                    <div className="user-form-card-header">
                      <div className="user-form-card-icon">
                        {submitted
                          ? <FaCheckCircle />
                          : isClosed ||
                            isNotOpen
                          ? <FaRegCalendarAlt />
                          : <FaClipboardList />
                        }
                      </div>
                      <div className="user-form-status-group">
                        <span
                          className={[
                            "user-form-status",
                            submitted
                              ? "submitted"
                              : isClosed
                              ? "closed"
                              : isNotOpen
                              ? "waiting"
                              : "available",
                          ].join(
                            " "
                          )}
                        >
                          {submitted ? (
                            <>
                              <FaCheck />
                              Submitted
                            </>
                          ) : isClosed ? (
                            <>
                              <FaClock />
                              Closed
                            </>
                          ) : isNotOpen ? (
                            <>
                              <FaRegCalendarAlt />
                              Not Open Yet
                            </>
                          ) : (
                            <>
                              <span className="user-form-status-dot"></span>
                              Available
                            </>
                          )}
                        </span>
                      </div>
                    </div>
                    {/* =======================================
                        CONTENT
                    ======================================= */}
                    <div className="user-form-card-content">
                      <span className="user-form-category">
                        <FaFileAlt />
                        {form.category}
                      </span>
                      <h3>
                        {form.title}
                      </h3>
                      <p>
                        {submitted
                          ? "You have already submitted this form."
                          : isClosed
                          ? "This form is already closed and can no longer accept responses."
                          : isNotOpen
                          ? "This form has been scheduled and is not open yet."
                          : form.description
                        }
                      </p>
                    </div>
                    {/* =======================================
                        META
                    ======================================= */}
                    <div className="user-form-meta">
                      <span>
                        <FaClipboardList />
                        {form.questions}
                        {" "}
                        Questions
                      </span>
                      <span>
                        <FaClock />
                        {form.duration}
                      </span>
                      <span>
                        <FaRegCalendarAlt />
                        {form.deadline}
                      </span>
                    </div>
                    {/* =======================================
                        ACTION
                    ======================================= */}
                    <button
                      type="button"
                      className={[
                        "user-form-details-btn",
                        submitted
                          ? "submitted"
                          : "",
                        isClosed
                          ? "closed"
                          : "",
                        isNotOpen
                          ? "waiting"
                          : "",
                      ]
                        .filter(
                          Boolean
                        )
                        .join(
                          " "
                        )}
                      onClick={() =>
                        openFormDetails(
                          form
                        )
                      }
                    >
                      <FaEye />
                      <span>
                        {submitted
                          ? "View Submitted Form"
                          : isClosed
                          ? "View Closed Form"
                          : isNotOpen
                          ? "View Schedule"
                          : "View Form Details"
                        }
                      </span>
                      <FaArrowRight />
                    </button>
                  </article>
                );
              }
            )
          )}
        </section>
      </main>
      {/* =====================================================
          QR SCANNER MODAL
      ===================================================== */}
      {showScanner && (
        <div
          className="user-qr-overlay"
          role="dialog"
          aria-modal="true"
          aria-label="Scan QR Code"
        >
          <div className="user-qr-modal">
            <div className="user-qr-modal-header">
              <div>
                <span>
                  QR Scanner
                </span>
                <h2>
                  Scan Form QR Code
                </h2>
              </div>
              <button
                type="button"
                className="user-qr-close-btn"
                onClick={
                  closeScanner
                }
                aria-label="Close scanner"
              >
                <FaTimes />
              </button>
            </div>
            <p className="user-qr-description">
              Point your camera at a QR Code generated from the HiDocs admin form page.
            </p>
            <div className="user-qr-reader-wrapper">
              <div
                id="user-form-qr-reader"
                className="user-qr-reader"
              ></div>
              {!scannerRunning &&
              !scannerError && (
                <div className="user-qr-loading">
                  <span></span>
                  <p>
                    Opening camera...
                  </p>
                </div>
              )}
            </div>
            {scannerStatus && (
              <div className="user-qr-message success">
                <FaCheckCircle />
                <span>
                  {scannerStatus}
                </span>
              </div>
            )}
            {scannerError && (
              <div className="user-qr-message error">
                <span>
                  !
                </span>
                <p>
                  {scannerError}
                </p>
              </div>
            )}
            <div className="user-qr-actions">
              <button
                type="button"
                className="user-qr-cancel-btn"
                onClick={
                  closeScanner
                }
              >
                Cancel
              </button>
              {scannerError && (
                <button
                  type="button"
                  className="user-qr-retry-btn"
                  onClick={
                    startScanner
                  }
                >
                  <FaQrcode />
                  Try Again
                </button>
              )}
            </div>
          </div>
        </div>
      )}
      {/* =====================================================
          BOTTOM NAVIGATION
      ===================================================== */}
      <BottomNavigation
        active="forms"
      />
    </div>
  );
}
export default UserForms;