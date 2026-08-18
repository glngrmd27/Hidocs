import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import {
  FaArrowRight,
  FaCheck,
  FaCheckCircle,
  FaClipboardCheck,
  FaClipboardList,
  FaClock,
  FaEye,
  FaFileAlt,
  FaHourglassHalf,
  FaLayerGroup,
  FaLock,
  FaRegCalendarAlt,
  FaStar,
} from "react-icons/fa";
import {
  FormContext,
} from "../context/FormContext";
import {
  ThemeContext,
} from "../context/ThemeContext";
import BottomNavigation from "../components/BottomNavigation";
import logo from "../assets/images/logo.png";
import "../assets/css/Dashboard.css";
// =========================================================
// STORAGE KEYS
// =========================================================
const FORMS_STORAGE_KEY =
  "hidocs_forms";
const DELETED_FORMS_STORAGE_KEY =
  "hidocs_deleted_forms";
// =========================================================
// DASHBOARD FORM LIMIT
// =========================================================
const DASHBOARD_FORM_LIMIT =
  4;
// =========================================================
// DEFAULT FORMS
//
// Default form tidak mempunyai openDate / closeDate.
// Karena itu default form tidak akan dianggap closed hanya
// berdasarkan text deadline lama.
//
// Form yang dibuat melalui CreateForm akan menggunakan:
// - openDate
// - openTime
// - closeDate
// - closeTime
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
    createdAt: "2024-06-13T00:00:00.000Z",
    accessMode: "public",
    showInUserList: true,
    qrOnly: false,
  },
];
// =========================================================
// ACCENT COLORS
// =========================================================
const accentOptions = [
  "blue",
  "purple",
  "green",
];
// =========================================================
// SAFE STORAGE ARRAY
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
// CURRENT USER READER
// =========================================================
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
      const storedValue =
        localStorage.getItem(
          key
        );
      if (!storedValue) {
        continue;
      }
      const parsedValue =
        JSON.parse(
          storedValue
        );
      if (
        !parsedValue ||
        typeof parsedValue !==
          "object"
      ) {
        continue;
      }
      return {
        ...parsedValue,
        username:
          parsedValue.username ||
          parsedValue.name ||
          "User",
        name:
          parsedValue.name ||
          parsedValue.username ||
          "User",
        email:
          String(
            parsedValue.email ||
            ""
          )
            .trim()
            .toLowerCase(),
      };
    }
    return {
      username: "User",
      name: "User",
      email: "",
    };
  } catch (error) {
    console.error(
      "Gagal membaca data user:",
      error
    );
    return {
      username: "User",
      name: "User",
      email: "",
    };
  }
};
// =========================================================
// CHECK WHETHER FORM IS PUBLIC
// QR Code Only tidak boleh muncul otomatis di Dashboard.
// =========================================================
const isPublicUserForm = (
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
// CHECK ACTIVE FORM
// =========================================================
const isFormActive = (
  form
) => {
  /*
    active adalah status utama terbaru dari admin.
    settings.activateImmediately tidak digunakan untuk
    menentukan status terbaru karena admin dapat mengubah
    active setelah form dibuat.
  */
  return (
    form.active !==
    false
  );
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
      `${dateValue}T00:00:00`
    );
  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    const fallbackDate =
      new Date(
        dateValue
      );
    if (
      Number.isNaN(
        fallbackDate.getTime()
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
      fallbackDate
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
// FORMAT SCHEDULE DATE TIME
// =========================================================
const formatScheduleDateTime = (
  dateValue,
  timeValue
) => {
  if (!dateValue) {
    return "";
  }
  const formattedDate =
    formatDate(
      dateValue
    );
  if (!timeValue) {
    return formattedDate;
  }
  return `${formattedDate}, ${timeValue}`;
};
// =========================================================
// CREATE LOCAL DATE TIME
//
// open:
// jika jam kosong → 00:00:00
//
// close:
// jika jam kosong → 23:59:59
// =========================================================
const createScheduleDateTime = (
  dateValue,
  timeValue,
  endOfDay = false
) => {
  if (!dateValue) {
    return null;
  }
  const normalizedTime =
    timeValue
      ? (
          String(
            timeValue
          ).length ===
          5
            ? `${timeValue}:00`
            : String(
                timeValue
              )
        )
      : (
          endOfDay
            ? "23:59:59"
            : "00:00:00"
        );
  const dateTime =
    new Date(
      `${dateValue}T${normalizedTime}`
    );
  if (
    Number.isNaN(
      dateTime.getTime()
    )
  ) {
    return null;
  }
  return dateTime;
};
// =========================================================
// SCHEDULE STATUS
//
// Status:
//
// unscheduled
// not-open
// open
// closed
//
// active false TIDAK ditangani di sini karena form inactive
// memang dihapus dari Dashboard user.
// =========================================================
const getFormScheduleStatus = (
  form,
  currentDate =
    new Date()
) => {
  const openAt =
    createScheduleDateTime(
      form.openDate,
      form.openTime,
      false
    );
  const closeAt =
    createScheduleDateTime(
      form.closeDate,
      form.closeTime,
      true
    );
  if (
    !openAt &&
    !closeAt
  ) {
    return {
      status: "unscheduled",
      isOpen: true,
      openAt: null,
      closeAt: null,
    };
  }
  if (
    openAt &&
    currentDate.getTime() <
      openAt.getTime()
  ) {
    return {
      status: "not-open",
      isOpen: false,
      openAt,
      closeAt,
    };
  }
  if (
    closeAt &&
    currentDate.getTime() >
      closeAt.getTime()
  ) {
    return {
      status: "closed",
      isOpen: false,
      openAt,
      closeAt,
    };
  }
  return {
    status: "open",
    isOpen: true,
    openAt,
    closeAt,
  };
};
// =========================================================
// GET TIMER DURATION
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
  const possibleDuration =
    form.timerDuration ??
    form.settings?.timerDuration ??
    timerObject?.duration ??
    form.duration ??
    form.settings?.duration;
  if (
    possibleDuration ===
      undefined ||
    possibleDuration ===
      null ||
    possibleDuration ===
      ""
  ) {
    return "No timer";
  }
  if (
    typeof possibleDuration ===
    "string"
  ) {
    const durationText =
      possibleDuration.trim();
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
    const numberFromText =
      Number(
        durationText
      );
    if (
      Number.isFinite(
        numberFromText
      ) &&
      numberFromText >
        0
    ) {
      return `${numberFromText} min`;
    }
    return durationText;
  }
  const durationNumber =
    Number(
      possibleDuration
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
const normalizeAdminForm = (
  form,
  index
) => {
  const questionCount =
    Array.isArray(
      form.questions
    )
      ? form.questions.length
      : Number(
          form.questions
        ) || 0;
  const deadline =
    form.closeDate
      ? formatDate(
          form.closeDate
        )
      : form.deadline
      ? formatDate(
          form.deadline
        )
      : "No deadline";
  const createdAt =
    form.createdAt ||
    new Date(
      Date.now() +
      index
    ).toISOString();
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
  const oneTimeOnly =
    form.settings?.oneTimeOnly !==
    false;
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
    deadline,
    createdAt,
    active:
      isFormActive(
        form
      ),
    accent:
      form.accent ||
      accentOptions[
        index %
        accentOptions.length
      ],
    customLink:
      String(
        form.customLink ||
        ""
      ).trim(),
    accessMode,
    qrOnly,
    showInUserList,
    oneTimeOnly,
    openDate:
      form.openDate ||
      "",
    closeDate:
      form.closeDate ||
      "",
    openTime:
      form.openTime ||
      "",
    closeTime:
      form.closeTime ||
      "",
  };
};
// =========================================================
// MERGE DEFAULT AND SAVED FORMS
//
// savedForms berada setelah defaultForms.
//
// Jadi data localStorage selalu menjadi prioritas apabila
// ID atau customLink sama.
// =========================================================
const mergeForms = (
  baseForms,
  savedForms
) => {
  const result =
    [];
  const combinedSource = [
    ...baseForms,
    ...savedForms,
  ];
  combinedSource.forEach(
    (
      rawForm,
      index
    ) => {
      const form =
        normalizeAdminForm(
          rawForm,
          index
        );
      const matchingIndex =
        result.findIndex(
          (
            existingForm
          ) => {
            const sameId =
              String(
                existingForm.id
              ) ===
              String(
                form.id
              );
            const sameCustomLink =
              Boolean(
                existingForm.customLink
              ) &&
              Boolean(
                form.customLink
              ) &&
              String(
                existingForm.customLink
              )
                .trim()
                .toLowerCase() ===
              String(
                form.customLink
              )
                .trim()
                .toLowerCase();
            return (
              sameId ||
              sameCustomLink
            );
          }
        );
      if (
        matchingIndex !==
        -1
      ) {
        result[
          matchingIndex
        ] =
          form;
      } else {
        result.push(
          form
        );
      }
    }
  );
  return result;
};
// =========================================================
// DASHBOARD
// =========================================================
function Dashboard() {
  const navigate =
    useNavigate();
  const formContext =
    useContext(
      FormContext
    ) ||
    {};
  const {
    submittedForms = [],
  } = formContext;
  const {
    darkMode,
  } = useContext(
    ThemeContext
  );
  // =========================================================
  // FORMS STATE
  // =========================================================
  const [
    forms,
    setForms,
  ] = useState([]);
  // =========================================================
  // CURRENT USER
  // =========================================================
  const [
    currentUser,
    setCurrentUser,
  ] = useState(
    getCurrentUser
  );
  // =========================================================
  // CURRENT TIME
  //
  // Dipakai untuk:
  // - greeting
  // - schedule status
  //
  // Berubah setiap 30 detik agar status form dapat berganti
  // otomatis dari Not Open → Available → Closed.
  // =========================================================
  const [
    currentDate,
    setCurrentDate,
  ] = useState(
    new Date()
  );
  const currentHour =
    currentDate.getHours();
  // =========================================================
  // REFRESH CURRENT USER
  // =========================================================
  const refreshCurrentUser =
    useCallback(
      () => {
        setCurrentUser(
          getCurrentUser()
        );
      },
      []
    );
  // =========================================================
  // GREETING BY TIME
  // =========================================================
  const timeGreeting =
    useMemo(
      () => {
        if (
          currentHour >=
            5 &&
          currentHour <
            12
        ) {
          return {
            title: "Good Morning",
            emoji: "☀️",
          };
        }
        if (
          currentHour >=
            12 &&
          currentHour <
            17
        ) {
          return {
            title: "Good Afternoon",
            emoji: "🌤️",
          };
        }
        if (
          currentHour >=
            17 &&
          currentHour <
            21
        ) {
          return {
            title: "Good Evening",
            emoji: "🌇",
          };
        }
        return {
          title: "Good Night",
          emoji: "🌙",
        };
      },
      [
        currentHour,
      ]
    );
  // =========================================================
  // UPDATE CURRENT TIME
  // =========================================================
  useEffect(
    () => {
      const updateTime =
        () => {
          setCurrentDate(
            new Date()
          );
        };
      updateTime();
      const timeInterval =
        window.setInterval(
          updateTime,
          30 * 1000
        );
      return () => {
        window.clearInterval(
          timeInterval
        );
      };
    },
    []
  );
  // =========================================================
  // LOAD FORMS
  //
  // URUTAN:
  //
  // 1. Default forms
  // 2. Form localStorage
  // 3. Merge
  // 4. Hapus deleted
  // 5. Hapus inactive
  // 6. Hapus QR-only
  //
  // Form closed dan not-open TETAP tampil.
  // Status jadwal hanya melarang pengerjaan.
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
          // ===================================================
          // MERGE
          // ===================================================
          const mergedForms =
            mergeForms(
              defaultForms,
              storedForms
            );
          // ===================================================
          // FILTER USER VISIBLE
          // ===================================================
          const visibleForms =
            mergedForms.filter(
              (
                form
              ) => {
                const isDeleted =
                  deletedFormIds.includes(
                    String(
                      form.id
                    )
                  );
                if (
                  isDeleted
                ) {
                  return false;
                }
                if (
                  !isFormActive(
                    form
                  )
                ) {
                  return false;
                }
                if (
                  !isPublicUserForm(
                    form
                  )
                ) {
                  return false;
                }
                return true;
              }
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
                const firstDate =
                  new Date(
                    first.createdAt ||
                    0
                  ).getTime();
                const secondDate =
                  new Date(
                    second.createdAt ||
                    0
                  ).getTime();
                const safeFirstDate =
                  Number.isNaN(
                    firstDate
                  )
                    ? 0
                    : firstDate;
                const safeSecondDate =
                  Number.isNaN(
                    secondDate
                  )
                    ? 0
                    : secondDate;
                return (
                  safeSecondDate -
                  safeFirstDate
                );
              }
            );
          setForms(
            sortedForms
          );
        } catch (error) {
          console.error(
            "Gagal membaca form dashboard:",
            error
          );
          const safeDefaultForms =
            defaultForms
              .map(
                (
                  form,
                  index
                ) =>
                  normalizeAdminForm(
                    form,
                    index
                  )
              )
              .filter(
                (
                  form
                ) => {
                  return (
                    isFormActive(
                      form
                    ) &&
                    isPublicUserForm(
                      form
                    )
                  );
                }
              );
          setForms(
            safeDefaultForms
          );
        }
      },
      []
    );
  // =========================================================
  // INITIAL LOAD
  // =========================================================
  useEffect(
    () => {
      loadForms();
      refreshCurrentUser();
    },
    [
      loadForms,
      refreshCurrentUser,
    ]
  );
  // =========================================================
  // STORAGE CHANGE FROM ANOTHER TAB
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
              DELETED_FORMS_STORAGE_KEY
          ) {
            loadForms();
          }
          if (
            event.key ===
              "user" ||
            event.key ===
              "hidocs_user" ||
            event.key ===
              "currentUser" ||
            event.key ===
              "loggedInUser"
          ) {
            refreshCurrentUser();
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
      refreshCurrentUser,
    ]
  );
  // =========================================================
  // PAGE FOCUS
  // =========================================================
  useEffect(
    () => {
      const handleWindowFocus =
        () => {
          loadForms();
          refreshCurrentUser();
          setCurrentDate(
            new Date()
          );
        };
      window.addEventListener(
        "focus",
        handleWindowFocus
      );
      return () => {
        window.removeEventListener(
          "focus",
          handleWindowFocus
        );
      };
    },
    [
      loadForms,
      refreshCurrentUser,
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
            refreshCurrentUser();
            setCurrentDate(
              new Date()
            );
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
      refreshCurrentUser,
    ]
  );
  // =========================================================
  // BROWSER PAGE SHOW
  // =========================================================
  useEffect(
    () => {
      const handlePageShow =
        () => {
          loadForms();
          refreshCurrentUser();
          setCurrentDate(
            new Date()
          );
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
      refreshCurrentUser,
    ]
  );
  // =========================================================
  // CUSTOM FORM UPDATE EVENT
  //
  // Dipanggil oleh AdminFormDetails setelah:
  // - active / inactive
  // - perubahan jadwal
  // =========================================================
  useEffect(
    () => {
      const handleFormsUpdated =
        () => {
          loadForms();
          setCurrentDate(
            new Date()
          );
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
  // OPTIONAL ACCOUNT UPDATE EVENT
  // =========================================================
  useEffect(
    () => {
      const handleUserUpdated =
        () => {
          refreshCurrentUser();
        };
      window.addEventListener(
        "hidocs-user-updated",
        handleUserUpdated
      );
      window.addEventListener(
        "hidocs-user-changed",
        handleUserUpdated
      );
      return () => {
        window.removeEventListener(
          "hidocs-user-updated",
          handleUserUpdated
        );
        window.removeEventListener(
          "hidocs-user-changed",
          handleUserUpdated
        );
      };
    },
    [
      refreshCurrentUser,
    ]
  );
  // =========================================================
  // CHECK SUBMITTED
  //
  // submittedForms sekarang berasal dari FormContext yang
  // sudah diperbaiki multi-account.
  //
  // Jadi akun A dan akun B tidak berbagi status Submitted.
  // =========================================================
  const isSubmitted =
    useCallback(
      (
        formId
      ) => {
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
                formId
              )
            );
          }
        );
      },
      [
        submittedForms,
      ]
    );
  // =========================================================
  // FORMS WITH LIVE STATUS
  // =========================================================
  const formsWithStatus =
    useMemo(
      () => {
        return forms.map(
          (
            form
          ) => {
            const schedule =
              getFormScheduleStatus(
                form,
                currentDate
              );
            const submitted =
              isSubmitted(
                form.id
              );
            let userStatus =
              "available";
            if (
              submitted
            ) {
              userStatus =
                "submitted";
            } else if (
              schedule.status ===
              "not-open"
            ) {
              userStatus =
                "not-open";
            } else if (
              schedule.status ===
              "closed"
            ) {
              userStatus =
                "closed";
            }
            return {
              ...form,
              scheduleStatus:
                schedule.status,
              scheduleOpen:
                schedule.isOpen,
              scheduleOpenAt:
                schedule.openAt,
              scheduleCloseAt:
                schedule.closeAt,
              submitted,
              userStatus,
            };
          }
        );
      },
      [
        forms,
        currentDate,
        isSubmitted,
      ]
    );
  // =========================================================
  // DASHBOARD SUMMARY
  // =========================================================
  const submittedCount =
    formsWithStatus.filter(
      (
        form
      ) =>
        form.submitted
    ).length;
  const remainingCount =
    formsWithStatus.filter(
      (
        form
      ) =>
        !form.submitted
    ).length;
  const completionPercentage =
    formsWithStatus.length >
      0
      ? Math.round(
          (
            submittedCount /
            formsWithStatus.length
          ) *
          100
        )
      : 0;
  // =========================================================
  // AVAILABLE NOW COUNT
  // =========================================================
  const availableNowCount =
    formsWithStatus.filter(
      (
        form
      ) => {
        return (
          !form.submitted &&
          (
            form.scheduleStatus ===
              "open" ||
            form.scheduleStatus ===
              "unscheduled"
          )
        );
      }
    ).length;
  // =========================================================
  // FORMS SHOWN ON DASHBOARD
  // =========================================================
  const dashboardForms =
    useMemo(
      () => {
        return formsWithStatus.slice(
          0,
          DASHBOARD_FORM_LIMIT
        );
      },
      [
        formsWithStatus,
      ]
    );
  // =========================================================
  // NAVIGATION
  // =========================================================
  const openForm = (
    id
  ) => {
    navigate(
      `/form-details/${id}`
    );
  };
  const handleViewAll =
    () => {
      navigate(
        "/forms"
      );
  };
  // =========================================================
  // GET STATUS INFORMATION
  // =========================================================
  const getStatusInformation = (
    form
  ) => {
    if (
      form.submitted
    ) {
      return {
        label: "Submitted",
        className: "submitted",
        icon:
          <FaCheck />,
        description: "You have already submitted this form. You can still view the form details.",
        buttonText: "View Submitted Form",
      };
    }
    if (
      form.scheduleStatus ===
      "not-open"
    ) {
      const openText =
        formatScheduleDateTime(
          form.openDate,
          form.openTime
        );
      return {
        label: "Not Open Yet",
        className: "not-open",
        icon:
          <FaHourglassHalf />,
        description:
          openText
            ? `This form will open on ${openText}.`
            : "This form is not open yet.",
        buttonText: "View Form Details",
      };
    }
    if (
      form.scheduleStatus ===
      "closed"
    ) {
      const closeText =
        formatScheduleDateTime(
          form.closeDate,
          form.closeTime
        );
      return {
        label: "Closed",
        className: "closed",
        icon:
          <FaLock />,
        description:
          closeText
            ? `This form closed on ${closeText}.`
            : "This form is already closed.",
        buttonText: "View Closed Form",
      };
    }
    return {
      label: "Available",
      className: "available",
      icon: null,
      description:
        form.description,
      buttonText: "View Form Details",
    };
  };
  // =========================================================
  // RETURN
  // =========================================================
  return (
    <div
      className={
        darkMode
          ? "dashboard-page dark"
          : "dashboard-page"
      }
    >
      {/* =====================================================
          HERO HEADER
      ===================================================== */}
      <header className="dashboard-hero">
        <div className="dashboard-hero-decoration">
          <span className="dashboard-circle circle-one"></span>
          <span className="dashboard-circle circle-two"></span>
          <div className="dashboard-dot-pattern">
            {Array.from({
              length: 16,
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
        <div className="dashboard-brand">
          <div className="dashboard-logo-wrapper">
            <img
              src={
                logo
              }
              alt="HiDocs Logo"
            />
          </div>
          <span>
            HiDocs!
          </span>
        </div>
        <div className="dashboard-greeting">
          <span className="dashboard-greeting-badge">
            <FaStar />
            {timeGreeting.title}
            <span>
              {timeGreeting.emoji}
            </span>
          </span>
          <h1>
            Hello, {currentUser.username}!
            <span className="dashboard-wave">
              👋
            </span>
          </h1>
          <p>
            Find available forms, submit your
            answers, and track your progress.
          </p>
        </div>
      </header>
      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="dashboard-main-content">
        {/* ===================================================
            SUMMARY CARDS
        =================================================== */}
        <section className="dashboard-summary-grid">
          <article className="dashboard-summary-card available">
            <div className="dashboard-summary-icon">
              <FaLayerGroup />
            </div>
            <div className="dashboard-summary-info">
              <span>
                Available Forms
              </span>
              <strong>
                {availableNowCount}
              </strong>
              <small>
                Ready to complete now
              </small>
            </div>
          </article>
          <article className="dashboard-summary-card completed">
            <div className="dashboard-summary-icon">
              <FaClipboardCheck />
            </div>
            <div className="dashboard-summary-info">
              <span>
                Completed
              </span>
              <strong>
                {submittedCount}
              </strong>
              <small>
                Forms submitted
              </small>
            </div>
          </article>
          <article className="dashboard-summary-card remaining">
            <div className="dashboard-summary-icon">
              <FaClock />
            </div>
            <div className="dashboard-summary-info">
              <span>
                Remaining
              </span>
              <strong>
                {remainingCount}
              </strong>
              <small>
                Not submitted yet
              </small>
            </div>
          </article>
        </section>
        {/* ===================================================
            PROGRESS
        =================================================== */}
        <section className="dashboard-progress-card">
          <div className="dashboard-progress-top">
            <div>
              <span className="dashboard-section-eyebrow">
                Your Progress
              </span>
              <h2>
                Form completion
              </h2>
              <p>
                You have completed
                {" "}
                {submittedCount}
                {" "}
                of
                {" "}
                {formsWithStatus.length}
                {" "}
                visible forms.
              </p>
            </div>
            <div className="dashboard-progress-percentage">
              {completionPercentage}%
            </div>
          </div>
          <div className="dashboard-progress-track">
            <div
              className="dashboard-progress-fill"
              style={{
                width: `${completionPercentage}%`,
              }}
            ></div>
          </div>
        </section>
        {/* ===================================================
            AVAILABLE FORMS
        =================================================== */}
        <section
          className="dashboard-forms-section"
          id="available-forms"
        >
          <div className="dashboard-section-header">
            <div>
              <span className="dashboard-section-eyebrow">
                Explore Forms
              </span>
              <h2>
                Available Forms
              </h2>
              <p>
                {formsWithStatus.length >
                DASHBOARD_FORM_LIMIT
                  ? `Showing the latest ${DASHBOARD_FORM_LIMIT} forms.`
                  : "Choose a form below to view its details."
                }
              </p>
            </div>
            <button
              type="button"
              className="dashboard-view-all-btn"
              onClick={
                handleViewAll
              }
            >
              <span>
                View All
              </span>
              <FaArrowRight />
            </button>
          </div>
          <div className="dashboard-form-grid">
            {dashboardForms.length ===
            0 ? (
              <div className="dashboard-empty-forms">
                <FaClipboardList />
                <h3>
                  No forms available
                </h3>
                <p>
                  There are currently no public and active forms to display.
                </p>
              </div>
            ) : (
              dashboardForms.map(
                (
                  form
                ) => {
                  const statusInfo =
                    getStatusInformation(
                      form
                    );
                  return (
                    <article
                      className={[
                        "dashboard-form-card",
                        form.submitted
                          ? "submitted"
                          : "",
                        statusInfo.className,
                        form.accent,
                      ]
                        .filter(
                          Boolean
                        )
                        .join(
                          " "
                        )}
                      key={
                        form.id
                      }
                    >
                      {/* =====================================
                          CARD HEADER
                      ===================================== */}
                      <div className="dashboard-form-card-header">
                        <div className="dashboard-form-icon">
                          {form.submitted ? (
                            <FaCheckCircle />
                          ) : form.scheduleStatus ===
                            "closed" ? (
                            <FaLock />
                          ) : form.scheduleStatus ===
                            "not-open" ? (
                            <FaHourglassHalf />
                          ) : (
                            <FaClipboardList />
                          )}
                        </div>
                        <span
                          className={[
                            "dashboard-form-status",
                            statusInfo.className,
                          ]
                            .filter(
                              Boolean
                            )
                            .join(
                              " "
                            )}
                        >
                          {statusInfo.icon ? (
                            statusInfo.icon
                          ) : (
                            <span className="dashboard-status-dot"></span>
                          )}
                          {statusInfo.label}
                        </span>
                      </div>
                      {/* =====================================
                          CARD CONTENT
                      ===================================== */}
                      <div className="dashboard-form-card-content">
                        <span className="dashboard-form-category">
                          <FaFileAlt />
                          {form.category}
                        </span>
                        <h3>
                          {form.title}
                        </h3>
                        <p>
                          {statusInfo.description}
                        </p>
                      </div>
                      {/* =====================================
                          META
                      ===================================== */}
                      <div className="dashboard-form-meta">
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
                      {/* =====================================
                          ACTION
                      ===================================== */}
                      <button
                        type="button"
                        className={[
                          "dashboard-form-action",
                          form.submitted
                            ? "submitted"
                            : "",
                          statusInfo.className,
                        ]
                          .filter(
                            Boolean
                          )
                          .join(
                            " "
                          )}
                        onClick={() =>
                          openForm(
                            form.id
                          )
                        }
                      >
                        <FaEye />
                        <span>
                          {statusInfo.buttonText}
                        </span>
                        <FaArrowRight className="dashboard-action-arrow" />
                      </button>
                    </article>
                  );
                }
              )
            )}
          </div>
        </section>
      </main>
      {/* =====================================================
          BOTTOM NAVIGATION
      ===================================================== */}
      <BottomNavigation
        active="home"
      />
    </div>
  );
}
export default Dashboard;