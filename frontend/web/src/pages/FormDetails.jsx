import {
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  getFormById,
} from "../api/formApi";
import {
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  FaArrowLeft,
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaExclamationTriangle,
  FaFileAlt,
  FaInfoCircle,
  FaPlay,
  FaShieldAlt,
} from "react-icons/fa";
import {
  ThemeContext,
} from "../context/ThemeContext";
import {
  FormContext,
} from "../context/FormContext";
import "../assets/css/FormDetails.css";
// =========================================================
// STORAGE KEYS
// =========================================================
const FORMS_STORAGE_KEY =
  "hidocs_forms";
const NEW_FORM_STORAGE_KEY =
  "hidocs_new_form";
const DELETED_FORMS_STORAGE_KEY =
  "hidocs_deleted_forms";
// =========================================================
// DEFAULT FORM DATA
// =========================================================
const defaultForms = [
  {
    id: 1,
    title: "Survey Kepuasan Mahasiswa 2024",
    category: "Survey",
    description: "Please read all information carefully before filling out this survey.",
    status: "Available to Fill",
    submission: "You can only submit once",
    questions: 5,
    duration: "5 minutes",
    deadline: "15 July 2024",
    active: true,
    settings: {
      oneTimeOnly: true,
    },
  },
  {
    id: 2,
    title: "Quiz Pemrograman Mobile - Flutter",
    category: "Quiz",
    description: "Please read all information carefully before starting the quiz.",
    status: "Available to Fill",
    submission: "You can only submit once",
    questions: 10,
    duration: "20 minutes",
    deadline: "18 July 2024",
    active: true,
    settings: {
      oneTimeOnly: true,
    },
  },
  {
    id: 3,
    title: "Form Pendaftaran Event Hackathon",
    category: "Registration",
    description: "Please read all information carefully before registering for this event.",
    status: "Available to Fill",
    submission: "You can only submit once",
    questions: 7,
    duration: "8 minutes",
    deadline: "20 July 2024",
    active: true,
    settings: {
      oneTimeOnly: true,
    },
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

const normalizeStoredLinkValue = (form) => {
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

const sanitizeDuplicateStorageForms = (forms) => {
  const cleaned = [];
  const seenLinks = new Map();

  forms.forEach((form) => {
    if (!form || typeof form !== "object") {
      return;
    }

    const customLink = normalizeStoredLinkValue(form);
    if (customLink) {
      const existingIndex = seenLinks.get(customLink);
      if (existingIndex !== undefined) {
        const previousForm = cleaned[existingIndex];
        const previousTime = new Date(previousForm?.createdAt || 0).getTime();
        const currentTime = new Date(form?.createdAt || 0).getTime();
        if (Number.isFinite(currentTime) && currentTime >= previousTime) {
          cleaned[existingIndex] = form;
        }
        return;
      }
      seenLinks.set(customLink, cleaned.length);
    }

    cleaned.push(form);
  });

  return cleaned;
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
      month: "long",
      year: "numeric",
    }
  ).format(
    date
  );
};
// =========================================================
// FORMAT DATE TIME
// =========================================================
const formatDateTime = (
  dateValue,
  timeValue
) => {
  if (!dateValue) {
    return "Not scheduled";
  }
  const safeTime =
    timeValue ||
    "00:00";
  const date =
    new Date(
      `${dateValue}T${safeTime}`
    );
  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return `${dateValue}${
      timeValue
        ? ` ${timeValue}`
        : ""
    }`;
  }
  return new Intl.DateTimeFormat(
    "en-GB",
    {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    }
  ).format(
    date
  );
};
// =========================================================
// CREATE DATE TIME
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
// =========================================================
const getScheduleStatus = (
  form,
  currentTime
) => {
  if (
    form.active ===
    false
  ) {
    return {
      code: "inactive",
      label: "Unavailable",
      title: "Currently Unavailable",
      message: "This form has been deactivated by the administrator.",
      canStart: false,
    };
  }
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
      title: "Form Not Open Yet",
      message:
        `This form will open on ${formatDateTime(
          form.openDate,
          form.openTime
        )}.`,
      canStart: false,
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
      title: "Form Closed",
      message:
        `This form closed on ${formatDateTime(
          form.closeDate,
          form.closeTime
        )}.`,
      canStart: false,
    };
  }
  return {
    code: "open",
    label: "Available",
    title: "Available to Fill",
    message: "This form is currently open and accepting responses.",
    canStart: true,
  };
};
// =========================================================
// FORMAT DURATION
// =========================================================
const formatDuration = (
  form
) => {
  const timerEnabled =
    form.timerEnabled ??
    form.settings?.timerEnabled ??
    form.settings?.timer?.enabled;
  if (
    timerEnabled ===
    false
  ) {
    return "No time limit";
  }
  const durationValue =
    form.timerDuration ??
    form.settings?.timerDuration ??
    form.settings?.timer?.duration ??
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
    return "No time limit";
  }
  if (
    typeof durationValue ===
    "number"
  ) {
    return `${durationValue} minutes`;
  }
  const durationText =
    String(
      durationValue
    ).trim();
  if (!durationText) {
    return "No time limit";
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
    )
  ) {
    return `${durationNumber} minutes`;
  }
  return durationText;
};
// =========================================================
// NORMALIZE FORM
// =========================================================
const normalizeForm = (
  form,
  currentTime
) => {
  const questionCount =
    Array.isArray(
      form.questions
    )
      ? form.questions.length
      : Number(
          form.questions
        ) || 0;
  const oneTimeOnly =
    form.settings?.oneTimeOnly !==
    false;
  const scheduleStatus =
    getScheduleStatus(
      form,
      currentTime
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
    description:
      String(
        form.description ||
        ""
      ).trim() ||
      "Please read all information carefully before filling out this form.",
    status:
      scheduleStatus.title,
    statusCode:
      scheduleStatus.code,
    statusLabel:
      scheduleStatus.label,
    statusMessage:
      scheduleStatus.message,
    canStart:
      scheduleStatus.canStart,
    submission:
      oneTimeOnly
        ? "You can only submit once"
        : "Multiple submissions are allowed",
    questions:
      questionCount,
    duration:
      formatDuration(
        form
      ),
    deadline:
      form.closeDate
        ? formatDateTime(
            form.closeDate,
            form.closeTime
          )
        : form.deadline
        ? formatDate(
            form.deadline
          )
        : "No deadline",
    openSchedule:
      form.openDate
        ? formatDateTime(
            form.openDate,
            form.openTime
          )
        : "Available immediately",
    closeSchedule:
      form.closeDate
        ? formatDateTime(
            form.closeDate,
            form.closeTime
          )
        : "No closing schedule",
    active:
      form.active !==
      false,
    oneTimeOnly,
  };
};
// =========================================================
// FORM DETAILS
// =========================================================
function FormDetails() {
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
    submittedForms = [],
  } = useContext(
    FormContext
  );
  // =========================================================
  // CURRENT TIME
  // Dibuat state agar status form dapat berubah otomatis
  // tanpa refresh manual.
  // =========================================================
  const [
    currentTime,
    setCurrentTime,
  ] = useState(
    new Date()
  );
  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          setCurrentTime(
            new Date()
          );
        },
        30000
      );
    return () => {
      window.clearInterval(
        interval
      );
    };
  }, []);
  // =========================================================
  // STORAGE VERSION
  // Supaya perubahan jadwal dari Admin langsung terbaca.
  // =========================================================
  const [
    storageVersion,
    setStorageVersion,
  ] = useState(
    0
  );
  const [
    apiFallbackForm,
    setApiFallbackForm,
  ] = useState(
    null
  );
  useEffect(() => {
    const refreshForm =
      () => {
        setStorageVersion(
          (
            previous
          ) =>
            previous +
            1
        );
      };
    const handleStorage =
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
          setCurrentTime(
            new Date()
          );
        }
      };
    window.addEventListener(
      "storage",
      handleStorage
    );
    window.addEventListener(
      "hidocs-forms-updated",
      refreshForm
    );
    window.addEventListener(
      "focus",
      refreshForm
    );
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
    return () => {
      window.removeEventListener(
        "storage",
        handleStorage
      );
      window.removeEventListener(
        "hidocs-forms-updated",
        refreshForm
      );
      window.removeEventListener(
        "focus",
        refreshForm
      );
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);
  useEffect(() => {
    let isMounted = true;

    const syncApiFallback = async () => {
      if (!id) {
        setApiFallbackForm(null);
        return;
      }

      const savedForms = sanitizeDuplicateStorageForms(getStoredArray(FORMS_STORAGE_KEY));
      const backupForms = sanitizeDuplicateStorageForms(getStoredArray(NEW_FORM_STORAGE_KEY));
      const deletedFormIds = getStoredArray(DELETED_FORMS_STORAGE_KEY).map((deletedId) => String(deletedId));
      const dedupedForms = [...defaultForms, ...savedForms, ...backupForms].reduce((uniqueForms, form) => {
        if (!form || typeof form !== "object") {
          return uniqueForms;
        }

        const formId = String(form?.id ?? "").trim();
        const customLink = String(form?.customLink || form?.custom_url || form?.link || "").trim().toLowerCase();
        if (!formId && !customLink) {
          return uniqueForms;
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
          const seenIndex = uniqueForms.seenKeys.get(key);
          return seenIndex !== undefined ? seenIndex : null;
        }, null);

        if (existingIndex !== null) {
          uniqueForms.values[existingIndex] = form;
        } else {
          const nextIndex = uniqueForms.values.length;
          uniqueForms.values.push(form);
          keys.forEach((key) => uniqueForms.seenKeys.set(key, nextIndex));
        }

        return uniqueForms;
      }, { values: [], seenKeys: new Map() }).values;

      const existsLocally = dedupedForms.some((item) => {
        if (deletedFormIds.includes(String(item.id))) {
          return false;
        }
        return String(item.id) === String(id);
      });

      if (existsLocally) {
        setApiFallbackForm(null);
        return;
      }

      try {
        const response = await getFormById(id);
        const apiForm = response?.data?.data || response?.data || {};
        if (!apiForm || typeof apiForm !== "object") {
          setApiFallbackForm(null);
          return;
        }

        const mappedForm = normalizeForm(
          {
            id: apiForm.id,
            title: apiForm.title,
            description: apiForm.description,
            category: apiForm.type || "Form",
            accessMode: apiForm.accessMode || "public",
            qrOnly: Boolean(apiForm.qrOnly),
            showInUserList: apiForm.showInUserList !== false,
            active: apiForm.status === "ACTIVE" || apiForm.active !== false,
            customLink: apiForm.custom_url || apiForm.customLink || "",
            settings: {
              accessMode: apiForm.accessMode || "public",
              qrOnly: Boolean(apiForm.qrOnly),
              showInUserList: apiForm.showInUserList !== false,
            },
            timerEnabled: Boolean(apiForm.timerEnabled),
            timerDuration: Number(apiForm.timerDuration || apiForm.duration || 20) || 20,
            duration: Number(apiForm.timerDuration || apiForm.duration || 20) || 20,
          },
          currentTime
        );

        if (isMounted) {
          setApiFallbackForm(mappedForm);
        }
      } catch (error) {
        console.warn("Form not found in local storage and API fallback failed:", error);
        if (isMounted) {
          setApiFallbackForm(null);
        }
      }
    };

    syncApiFallback();

    return () => {
      isMounted = false;
    };
  }, [id, currentTime, storageVersion]);

  const form =
    useMemo(
      () => {
        const savedForms =
          sanitizeDuplicateStorageForms(
            getStoredArray(
              FORMS_STORAGE_KEY
            )
          );
        const backupForms =
          sanitizeDuplicateStorageForms(
            getStoredArray(
              NEW_FORM_STORAGE_KEY
            )
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
        const dedupedForms = [
          ...defaultForms,
          ...savedForms,
          ...backupForms,
        ].reduce((uniqueForms, form) => {
          if (!form || typeof form !== "object") {
            return uniqueForms;
          }

          const formId = String(form?.id ?? "").trim();
          const customLink = String(form?.customLink || form?.custom_url || form?.link || "").trim().toLowerCase();
          if (!formId && !customLink) {
            return uniqueForms;
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
            const seenIndex = uniqueForms.seenKeys.get(key);
            return seenIndex !== undefined ? seenIndex : null;
          }, null);

          if (existingIndex !== null) {
            uniqueForms.values[existingIndex] = form;
          } else {
            const nextIndex = uniqueForms.values.length;
            uniqueForms.values.push(form);
            keys.forEach((key) => uniqueForms.seenKeys.set(key, nextIndex));
          }

          return uniqueForms;
        }, { values: [], seenKeys: new Map() }).values;
        const availableForms = dedupedForms;
        const selectedForm =
          [...availableForms]
            .reverse()
            .find(
              (
                item
              ) => {
                return (
                  String(
                    item.id
                  ) ===
                  String(
                    id
                  )
                );
              }
            );
        if (!selectedForm) {
          return apiFallbackForm;
        }
        if (
          deletedFormIds.includes(
            String(
              selectedForm.id
            )
          )
        ) {
          return null;
        }
        return normalizeForm(
          selectedForm,
          currentTime
        );
      },
      [
        id,
        currentTime,
        storageVersion,
        apiFallbackForm,
      ]
    );
  // =========================================================
  // CHECK SUBMISSION
  // =========================================================
  const isSubmitted =
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
  // FORM NOT FOUND
  // =========================================================
  if (!form) {
    return (
      <div
        className={
          darkMode
            ? "details-page dark"
            : "details-page"
        }
      >
        <div className="details-not-found">
          <div className="details-not-found-icon">
            <FaClipboardList />
          </div>
          <h2>
            Form Not Found
          </h2>
          <p>
            The form you are looking for is unavailable or has been removed.
          </p>
          <button
            type="button"
            className="details-primary-btn"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            <FaArrowLeft />
            <span>
              Back to Dashboard
            </span>
          </button>
        </div>
      </div>
    );
  }
  // =========================================================
  // START FORM
  // =========================================================
  const handleStartForm =
    () => {
      if (
        !form.canStart
      ) {
        return;
      }
      if (
        form.oneTimeOnly &&
        isSubmitted
      ) {
        navigate(
          "/history"
        );
        return;
      }
      navigate(
        `/fill-form/${id}`
      );
    };
  // =========================================================
  // BUTTON TEXT
  // =========================================================
  const getStartButtonText =
    () => {
      if (
        form.statusCode ===
        "inactive"
      ) {
        return "Form Unavailable";
      }
      if (
        form.statusCode ===
        "not-open"
      ) {
        return "Form Not Open Yet";
      }
      if (
        form.statusCode ===
        "closed"
      ) {
        return "Form Closed";
      }
      if (
        form.oneTimeOnly &&
        isSubmitted
      ) {
        return "View Submission History";
      }
      return "Start Filling Form";
    };
  // =========================================================
  // STATUS CLASS
  // =========================================================
  const statusClassName =
    form.statusCode ===
    "open"
      ? "details-status-badge"
      : `details-status-badge inactive ${form.statusCode}`;
  // =========================================================
  // RETURN
  // =========================================================
  return (
    <div
      className={
        darkMode
          ? "details-page dark"
          : "details-page"
      }
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="details-header">
        <div className="details-header-decoration">
          <span className="details-header-circle circle-one"></span>
          <span className="details-header-circle circle-two"></span>
        </div>
        <button
          type="button"
          className="details-back-button"
          onClick={() =>
            navigate(-1)
          }
          aria-label="Back"
        >
          <FaArrowLeft />
        </button>
        <div className="details-header-title">
          <span>
            HiDocs Form
          </span>
          <h2>
            Form Details
          </h2>
        </div>
      </header>
      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="details-content">
        {/* ===================================================
            SCHEDULE STATUS ALERT
        =================================================== */}
        {form.statusCode !==
        "open" && (
          <section className="details-warning-card">
            <div className="details-warning-icon">
              <FaExclamationTriangle />
            </div>
            <div>
              <span className="details-warning-label">
                {form.statusLabel}
              </span>
              <h4>
                {form.status}
              </h4>
              <p>
                {form.statusMessage}
              </p>
            </div>
          </section>
        )}
        {/* ===================================================
            HERO
        =================================================== */}
        <section className="details-hero-card">
          <div className="details-main-icon">
            <FaClipboardList />
          </div>
          <span className="details-category">
            {form.category}
          </span>
          <h1>
            {form.title}
          </h1>
          <p className="details-description">
            {form.description}
          </p>
          <div className="details-meta-list">
            <span>
              <FaFileAlt />
              {form.questions}
              {" "}
              Questions
            </span>
            <span>
              <FaClock />
              {form.duration}
            </span>
            <span>
              <FaCalendarAlt />
              {form.deadline}
            </span>
          </div>
        </section>
        {/* ===================================================
            CONTENT GRID
        =================================================== */}
        <div className="details-layout">
          {/* =================================================
              FORM INFORMATION
          ================================================= */}
          <section className="details-information-card">
            <div className="details-section-heading">
              <div className="details-section-icon">
                <FaInfoCircle />
              </div>
              <div>
                <span>
                  Overview
                </span>
                <h3>
                  Form Information
                </h3>
              </div>
            </div>
            <div className="details-information-list">
              {/* FORM NAME */}
              <div className="details-information-item">
                <div className="details-information-icon blue">
                  <FaFileAlt />
                </div>
                <div className="details-information-text">
                  <span>
                    Form Name
                  </span>
                  <strong>
                    {form.title}
                  </strong>
                </div>
              </div>
              {/* STATUS */}
              <div className="details-information-item">
                <div
                  className={
                    form.statusCode ===
                    "open"
                      ? "details-information-icon green"
                      : "details-information-icon"
                  }
                >
                  {form.statusCode ===
                  "open" ? (
                    <FaCheckCircle />
                  ) : (
                    <FaExclamationTriangle />
                  )}
                </div>
                <div className="details-information-text">
                  <span>
                    Status
                  </span>
                  <strong>
                    {form.status}
                  </strong>
                </div>
                <span
                  className={
                    statusClassName
                  }
                >
                  <span className="details-status-dot"></span>
                  {form.statusLabel}
                </span>
              </div>
              {/* OPEN SCHEDULE */}
              <div className="details-information-item">
                <div className="details-information-icon blue">
                  <FaCalendarAlt />
                </div>
                <div className="details-information-text">
                  <span>
                    Opens
                  </span>
                  <strong>
                    {form.openSchedule}
                  </strong>
                </div>
              </div>
              {/* CLOSE SCHEDULE */}
              <div className="details-information-item">
                <div className="details-information-icon purple">
                  <FaCalendarAlt />
                </div>
                <div className="details-information-text">
                  <span>
                    Closes
                  </span>
                  <strong>
                    {form.closeSchedule}
                  </strong>
                </div>
              </div>
              {/* SUBMISSION */}
              <div className="details-information-item">
                <div className="details-information-icon purple">
                  <FaShieldAlt />
                </div>
                <div className="details-information-text">
                  <span>
                    Submission Rule
                  </span>
                  <strong>
                    {form.submission}
                  </strong>
                </div>
              </div>
            </div>
          </section>
          {/* =================================================
              SIDE INFORMATION
          ================================================= */}
          <aside className="details-side-column">
            {form.statusCode ===
            "open" ? (
              <section className="details-warning-card">
                <div className="details-warning-icon">
                  <FaExclamationTriangle />
                </div>
                <div>
                  <span className="details-warning-label">
                    Important Notice
                  </span>
                  <h4>
                    Before You Start
                  </h4>
                  <p>
                    Make sure you have enough time to complete the form.
                    Review every answer carefully before submitting.
                  </p>
                </div>
              </section>
            ) : (
              <section className="details-warning-card">
                <div className="details-warning-icon">
                  <FaClock />
                </div>
                <div>
                  <span className="details-warning-label">
                    Form Availability
                  </span>
                  <h4>
                    {form.status}
                  </h4>
                  <p>
                    {form.statusMessage}
                  </p>
                </div>
              </section>
            )}
            <section className="details-rule-card">
              <div className="details-rule-icon">
                <FaShieldAlt />
              </div>
              <div>
                <strong>
                  {form.oneTimeOnly
                    ? "One-time submission"
                    : "Multiple submissions"
                  }
                </strong>
                <span>
                  {form.oneTimeOnly
                    ? "You cannot submit this form again after completing it."
                    : "This form allows more than one submission."
                  }
                </span>
              </div>
            </section>
            {isSubmitted && (
              <section className="details-rule-card submitted">
                <div className="details-rule-icon">
                  <FaCheckCircle />
                </div>
                <div>
                  <strong>
                    Already submitted
                  </strong>
                  <span>
                    You have completed this form previously.
                  </span>
                </div>
              </section>
            )}
          </aside>
        </div>
        {/* ===================================================
            ACTIONS
        =================================================== */}
        <section className="details-actions">
          <button
            type="button"
            className="details-cancel-btn"
            onClick={() =>
              navigate(
                "/dashboard"
              )
            }
          >
            Cancel
          </button>
          <button
            type="button"
            className="details-primary-btn"
            onClick={
              handleStartForm
            }
            disabled={
              !form.canStart
            }
          >
            {form.oneTimeOnly &&
            isSubmitted ? (
              <FaCheckCircle />
            ) : form.canStart ? (
              <FaPlay />
            ) : (
              <FaClock />
            )}
            <span>
              {getStartButtonText()}
            </span>
          </button>
        </section>
      </main>
    </div>
  );
}
export default FormDetails;