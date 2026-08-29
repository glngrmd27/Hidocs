import { getForms } from '../api/formApi';

import {
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
  FaCalendarAlt,
  FaCheckCircle,
  FaClipboardList,
  FaCopy,
  FaDownload,
  FaFileAlt,
  FaHome,
  FaPlus,
  FaQrcode,
  FaQuestionCircle,
  FaSearch,
  FaTimes,
  FaTrash,
  FaUserCog,
  FaUsers,
  FaWpforms,
} from "react-icons/fa";
import {
  QRCodeCanvas,
} from "qrcode.react";
import {
  ThemeContext,
} from "../context/ThemeContext";
import "../assets/css/ManageForms.css";
// =========================================================
// STORAGE KEYS
// =========================================================
const FORMS_STORAGE_KEY =
  "hidocs_forms";
const DELETED_FORMS_STORAGE_KEY =
  "hidocs_deleted_forms";
const NEW_FORM_STORAGE_KEY =
  "hidocs_new_form";
// =========================================================
// DEFAULT FORM DATA
// =========================================================
const defaultForms = [
  {
    id: 1,
    title: "Survey Kepuasan Mahasiswa 2024",
    description: "Collect feedback about campus facilities and administrative services.",
    customLink: "survey-mhs-2024",
    link: "hidocs.app/r/survey-mhs-2024",
    active: true,
    responses: 247,
    questions: 5,
    createdAt: "2024-06-10T00:00:00.000Z",
    type: "Survey",
    isDefault: true,
  },
  {
    id: 2,
    title: "Quiz Pemrograman Mobile - Flutter",
    description: "Evaluate students' understanding of Flutter widgets and mobile development.",
    customLink: "quiz-flutter-w5",
    link: "hidocs.app/r/quiz-flutter-w5",
    active: true,
    responses: 128,
    questions: 15,
    createdAt: "2024-06-11T00:00:00.000Z",
    type: "Quiz",
    isDefault: true,
  },
  {
    id: 3,
    title: "Form Pendaftaran Event Hackathon",
    description: "Registration form for participants joining the upcoming hackathon event.",
    customLink: "hack24",
    link: "hidocs.app/r/hack24",
    active: true,
    responses: 86,
    questions: 8,
    createdAt: "2024-06-13T00:00:00.000Z",
    type: "Registration",
    isDefault: true,
  },
];
function ManageForms() {
  const navigate =
    useNavigate();
  const {
    darkMode,
  } = useContext(
    ThemeContext
  );
  // =========================================================
  // FORMS
  // =========================================================
  const [
    forms,
    setForms,
  ] = useState([]);
  // =========================================================
  // SEARCH
  // =========================================================
  const [
    search,
    setSearch,
  ] = useState("");
  // =========================================================
  // COPY FEEDBACK
  // =========================================================
  const [
    copiedFormId,
    setCopiedFormId,
  ] = useState(null);
  // =========================================================
  // DELETE STATE
  // =========================================================
  const [
    deletingFormId,
    setDeletingFormId,
  ] = useState(null);
  // =========================================================
  // QR MODAL STATE
  // =========================================================
  const [
    selectedQrForm,
    setSelectedQrForm,
  ] = useState(null);
  const [
    qrDownloaded,
    setQrDownloaded,
  ] = useState(false);
  // =========================================================
  // SAFE JSON PARSER
  // =========================================================
  const parseStoredArray = (
    key
  ) => {
    try {
      const savedValue =
        localStorage.getItem(
          key
        );
      if (!savedValue) {
        return [];
      }
      const parsedValue =
        JSON.parse(
          savedValue
        );
      return Array.isArray(
        parsedValue
      )
        ? parsedValue
        : [];
    } catch (error) {
      console.error(
        `Gagal membaca localStorage ${key}:`,
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
      return "-";
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
  // NORMALIZE CUSTOM LINK
  // =========================================================
  const normalizeCustomLink = (
    form
  ) => {
    const rawLink =
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
          /^\/+/,
          ""
        );
    return (
      rawLink ||
      String(
        form.id ||
        Date.now()
      )
    );
  };
  // =========================================================
  // NORMALIZE FORM
  // =========================================================
  const normalizeForm = (
    form
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
    const formId =
      form.id ||
      Date.now() +
      Math.random();
    return {
      ...form,
      id:
        formId,
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
      customLink,
      link:
        form.link
          ? String(
              form.link
            )
              .replace(
                /^https?:\/\//i,
                ""
              )
          : `hidocs.app/r/${customLink}`,
      active:
        form.active !== false,
      responses:
        Number(
          form.responses
        ) || 0,
      questions:
        questionCount,
      createdAt:
        form.createdAt ||
        new Date().toISOString(),
      type:
        form.type ||
        "Form",
      isDefault:
        Boolean(
          form.isDefault
        ),
    };
  };
  // =========================================================
  // MERGE FORMS
  // =========================================================
  const mergeForms = (
    baseForms,
    savedForms
  ) => {
    const normalizedForms = [
      ...baseForms.map(
        normalizeForm
      ),
      ...savedForms.map(
        normalizeForm
      ),
    ];
    return normalizedForms.filter(
      (
        form,
        index,
        array
      ) => {
        const firstMatchingIndex =
          array.findIndex(
            (item) => {
              const sameId =
                String(
                  item.id
                ) ===
                String(
                  form.id
                );
              const sameCustomLink =
                item.customLink &&
                form.customLink &&
                item.customLink
                  .trim()
                  .toLowerCase() ===
                form.customLink
                  .trim()
                  .toLowerCase();
              return (
                sameId ||
                sameCustomLink
              );
            }
          );
        return (
          index ===
          firstMatchingIndex
        );
      }
    );
  };
  // =========================================================
  // LOAD FORMS
  // =========================================================
  const loadForms = async () => {
    try {
      const response = await getForms();
      const apiForms = response.data.data || [];

      const mappedForms = apiForms.map((form) => ({
        id: form.id,
        title: form.title,
        description: form.description,
        customLink: form.custom_url,
        active: form.status === "ACTIVE",
        responses: form.response_count || 0,
        questions: form.questions || [],
        createdAt: form.created_at,
        type: form.type,
        isDefault: false,
      }));

      setForms(mappedForms);
    } catch (error) {
      console.error("Gagal memuat data form:", error);
      setForms([]);
    }
  };
  // =========================================================
  // LOAD WHEN PAGE OPENS
  // =========================================================
  useEffect(() => {
    loadForms();
  }, []);
  // =========================================================
  // UPDATE WHEN STORAGE CHANGES
  // =========================================================
  useEffect(() => {
    const handleStorageChange = (
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
  }, []);
  // =========================================================
  // UPDATE WHEN PAGE ACTIVE
  // =========================================================
  useEffect(() => {
    const handlePageFocus =
      () => {
        loadForms();
      };
    const handleVisibilityChange =
      () => {
        if (
          document.visibilityState ===
          "visible"
        ) {
          loadForms();
        }
      };
    window.addEventListener(
      "focus",
      handlePageFocus
    );
    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );
    return () => {
      window.removeEventListener(
        "focus",
        handlePageFocus
      );
      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );
    };
  }, []);
  // =========================================================
  // QR MODAL EFFECT
  // =========================================================
  useEffect(() => {
    if (!selectedQrForm) {
      return undefined;
    }
    const previousOverflow =
      document.body.style.overflow;
    document.body.style.overflow =
      "hidden";
    const handleEscape = (
      event
    ) => {
      if (
        event.key ===
        "Escape"
      ) {
        setSelectedQrForm(
          null
        );
        setQrDownloaded(
          false
        );
      }
    };
    window.addEventListener(
      "keydown",
      handleEscape
    );
    return () => {
      document.body.style.overflow =
        previousOverflow;
      window.removeEventListener(
        "keydown",
        handleEscape
      );
    };
  }, [
    selectedQrForm,
  ]);
  // =========================================================
  // SUMMARY
  // =========================================================
  const totalForms =
    forms.length;
  const activeForms =
    forms.filter(
      (form) =>
        form.active
    ).length;
  const totalResponses =
    forms.reduce(
      (
        total,
        form
      ) => {
        return (
          total +
          (
            Number(
              form.responses
            ) || 0
          )
        );
      },
      0
    );
  // =========================================================
  // FILTER FORMS
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
          (form) => {
            const searchableText = [
              form.title,
              form.description,
              form.link,
              form.customLink,
              form.type,
            ]
              .map(
                (value) =>
                  String(
                    value ||
                    ""
                  ).toLowerCase()
              )
              .join(" ");
            return searchableText.includes(
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
  // GET WORKING FORM URL
  // =========================================================
  const getFormUrl = (
    form
  ) => {
    /*
      Menggunakan route yang sudah tersedia pada App.jsx:
      /form-details/:id
      Jadi ketika QR dipindai dari browser atau perangkat
      yang dapat mengakses alamat ini, form yang sesuai
      akan langsung dibuka.
    */
    return (
      `${window.location.origin}/form-details/${form.id}`
    );
  };
  // =========================================================
  // GET DISPLAY LINK
  // =========================================================
  const getDisplayLink = (
    form
  ) => {
    return (
      form.link ||
      `hidocs.app/r/${form.customLink}`
    );
  };
  // =========================================================
  // COPY LINK
  // =========================================================
  const copyLink = async (
    form,
    event
  ) => {
    event.stopPropagation();
    const linkValue =
      getFormUrl(
        form
      );
    try {
      await navigator.clipboard.writeText(
        linkValue
      );
      setCopiedFormId(
        form.id
      );
      window.setTimeout(
        () => {
          setCopiedFormId(
            null
          );
        },
        1800
      );
    } catch (error) {
      console.error(
        "Gagal menyalin link:",
        error
      );
      alert(
        "Link gagal disalin."
      );
    }
  };
  // =========================================================
  // OPEN QR MODAL
  // =========================================================
  const openQrModal = (
    form,
    event
  ) => {
    event.stopPropagation();
    setSelectedQrForm(
      form
    );
    setQrDownloaded(
      false
    );
  };
  // =========================================================
  // CLOSE QR MODAL
  // =========================================================
  const closeQrModal =
    () => {
      setSelectedQrForm(
        null
      );
      setQrDownloaded(
        false
      );
    };
  // =========================================================
  // DOWNLOAD QR CODE
  // =========================================================
  const downloadQrCode =
    () => {
      if (!selectedQrForm) {
        return;
      }
      const canvas =
        document.getElementById(
          "manage-form-qr-canvas"
        );
      if (!canvas) {
        alert(
          "QR Code belum siap. Silakan coba kembali."
        );
        return;
      }
      try {
        const imageUrl =
          canvas.toDataURL(
            "image/png"
          );
        const downloadLink =
          document.createElement(
            "a"
          );
        const safeFileName =
          String(
            selectedQrForm.customLink ||
            selectedQrForm.title ||
            "hidocs-form"
          )
            .trim()
            .toLowerCase()
            .replace(
              /[^a-z0-9]+/g,
              "-"
            )
            .replace(
              /^-|-$/g,
              ""
            );
        downloadLink.href =
          imageUrl;
        downloadLink.download =
          `${safeFileName || "hidocs-form"}-qr.png`;
        document.body.appendChild(
          downloadLink
        );
        downloadLink.click();
        document.body.removeChild(
          downloadLink
        );
        setQrDownloaded(
          true
        );
        window.setTimeout(
          () => {
            setQrDownloaded(
              false
            );
          },
          1800
        );
      } catch (error) {
        console.error(
          "Gagal mengunduh QR Code:",
          error
        );
        alert(
          "QR Code gagal diunduh."
        );
      }
    };
  // =========================================================
  // DELETE FORM
  // =========================================================
  const deleteForm = (
    form,
    event
  ) => {
    event.stopPropagation();
    if (
      deletingFormId !==
      null
    ) {
      return;
    }
    const confirmed =
      window.confirm(
        `Apakah kamu yakin ingin menghapus form "${form.title}"?\n\nForm yang dihapus tidak dapat dikembalikan.`
      );
    if (!confirmed) {
      return;
    }
    setDeletingFormId(
      form.id
    );
    try {
      const savedForms =
        parseStoredArray(
          FORMS_STORAGE_KEY
        );
      const updatedSavedForms =
        savedForms.filter(
          (savedForm) =>
            String(
              savedForm.id
            ) !==
            String(
              form.id
            )
        );
      localStorage.setItem(
        FORMS_STORAGE_KEY,
        JSON.stringify(
          updatedSavedForms
        )
      );
      const deletedFormIds =
        parseStoredArray(
          DELETED_FORMS_STORAGE_KEY
        );
      const alreadyDeleted =
        deletedFormIds.some(
          (deletedId) =>
            String(
              deletedId
            ) ===
            String(
              form.id
            )
        );
      if (!alreadyDeleted) {
        localStorage.setItem(
          DELETED_FORMS_STORAGE_KEY,
          JSON.stringify([
            ...deletedFormIds,
            form.id,
          ])
        );
      }
      try {
        const newestFormValue =
          localStorage.getItem(
            NEW_FORM_STORAGE_KEY
          );
        const newestForm =
          newestFormValue
            ? JSON.parse(
                newestFormValue
              )
            : null;
        if (
          newestForm &&
          String(
            newestForm.id
          ) ===
          String(
            form.id
          )
        ) {
          localStorage.removeItem(
            NEW_FORM_STORAGE_KEY
          );
        }
      } catch (backupError) {
        console.error(
          "Gagal memeriksa backup form:",
          backupError
        );
      }
      setForms(
        (previousForms) =>
          previousForms.filter(
            (item) =>
              String(
                item.id
              ) !==
              String(
                form.id
              )
          )
      );
      if (
        String(
          copiedFormId
        ) ===
        String(
          form.id
        )
      ) {
        setCopiedFormId(
          null
        );
      }
      if (
        String(
          selectedQrForm?.id
        ) ===
        String(
          form.id
        )
      ) {
        closeQrModal();
      }
    } catch (error) {
      console.error(
        "Gagal menghapus form:",
        error
      );
      alert(
        "Form gagal dihapus. Silakan coba kembali."
      );
    } finally {
      setDeletingFormId(
        null
      );
    }
  };
  // =========================================================
  // OPEN FORM DETAILS
  // =========================================================
  const openForm = (
    id
  ) => {
    navigate(
      `/admin/forms/${id}`
    );
  };
  // =========================================================
  // CREATE NEW FORM
  // =========================================================
  const createNewForm =
    () => {
      navigate(
        "/create-form"
      );
    };
  // =========================================================
  // CLEAR SEARCH
  // =========================================================
  const clearSearch =
    () => {
      setSearch("");
    };
  // =========================================================
  // NAVIGATION
  // =========================================================
  const goHome =
    () => {
      navigate(
        "/admin"
      );
    };
  const goForms =
    () => {
      navigate(
        "/admin/forms"
      );
    };
  const goProfile =
    () => {
      navigate(
        "/admin/profile"
      );
    };
  // =========================================================
  // RETURN
  // =========================================================
  return (
    <div
      className={
        darkMode
          ? "manage-forms-page dark"
          : "manage-forms-page"
      }
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="manage-forms-header">
        <div className="manage-header-decoration">
          <span className="manage-header-circle circle-one"></span>
          <span className="manage-header-circle circle-two"></span>
          <div className="manage-header-dots">
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
        <div className="manage-header-content">
          <div className="manage-header-text">
            <span className="manage-header-eyebrow">
              Form Management
            </span>
            <h1>
              Manage Forms
            </h1>
            <p>
              View, search, and manage all your
              HiDocs forms in one place.
            </p>
          </div>
          <button
            type="button"
            className="manage-header-new-btn"
            onClick={
              createNewForm
            }
          >
            <FaPlus />
            <span>
              New Form
            </span>
          </button>
        </div>
      </header>
      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="manage-forms-content">
        {/* SUMMARY */}
        <section className="manage-summary-grid">
          <article className="manage-summary-card forms">
            <div className="manage-summary-icon">
              <FaWpforms />
            </div>
            <div className="manage-summary-info">
              <span>
                Total Forms
              </span>
              <strong>
                {totalForms}
              </strong>
              <small>
                Forms created
              </small>
            </div>
          </article>
          <article className="manage-summary-card active">
            <div className="manage-summary-icon">
              <FaCheckCircle />
            </div>
            <div className="manage-summary-info">
              <span>
                Active Forms
              </span>
              <strong>
                {activeForms}
              </strong>
              <small>
                Currently available
              </small>
            </div>
          </article>
          <article className="manage-summary-card responses">
            <div className="manage-summary-icon">
              <FaUsers />
            </div>
            <div className="manage-summary-info">
              <span>
                Total Responses
              </span>
              <strong>
                {totalResponses}
              </strong>
              <small>
                All submitted responses
              </small>
            </div>
          </article>
        </section>
        {/* TOOLBAR */}
        <section className="manage-toolbar">
          <div className="manage-toolbar-heading">
            <span className="manage-section-eyebrow">
              Your Forms
            </span>
            <h2>
              All Forms
            </h2>
            <p>
              {filteredForms.length}
              {" "}
              of
              {" "}
              {totalForms}
              {" "}
              forms displayed
            </p>
          </div>
          <div className="manage-search-box">
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
              placeholder="Search form, link, or type..."
            />
            {search && (
              <button
                type="button"
                className="manage-search-clear"
                onClick={
                  clearSearch
                }
                title="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>
        </section>
        {/* FORM LIST */}
        <section className="manage-form-list">
          {filteredForms.length ===
          0 ? (
            <div className="manage-empty-state">
              <div className="manage-empty-icon">
                <FaClipboardList />
              </div>
              <h3>
                {search
                  ? "No forms found"
                  : "No forms available"
                }
              </h3>
              <p>
                {search
                  ? (
                    <>
                      We could not find a form matching{" "}
                      “{search}”.
                    </>
                  )
                  : (
                    <>
                      Create a new form to start collecting responses.
                    </>
                  )
                }
              </p>
              {search ? (
                <button
                  type="button"
                  onClick={
                    clearSearch
                  }
                >
                  Clear Search
                </button>
              ) : (
                <button
                  type="button"
                  onClick={
                    createNewForm
                  }
                >
                  <FaPlus />
                  Create New Form
                </button>
              )}
            </div>
          ) : (
            filteredForms.map(
              (form) => (
                <article
                  className="manage-form-card"
                  key={
                    form.id
                  }
                  tabIndex={0}
                  role="button"
                  onClick={() =>
                    openForm(
                      form.id
                    )
                  }
                  onKeyDown={(event) => {
                    if (
                      event.key ===
                        "Enter" ||
                      event.key ===
                        " "
                    ) {
                      event.preventDefault();
                      openForm(
                        form.id
                      );
                    }
                  }}
                >
                  {/* CARD HEADER */}
                  <div className="manage-form-card-header">
                    <div className="manage-form-heading">
                      <div className="manage-form-icon">
                        <FaFileAlt />
                      </div>
                      <div className="manage-form-title">
                        <div className="manage-form-type">
                          {form.type}
                        </div>
                        <h2>
                          {form.title}
                        </h2>
                      </div>
                    </div>
                    <span
                      className={
                        form.active
                          ? "manage-form-status"
                          : "manage-form-status inactive"
                      }
                    >
                      <span className="manage-status-dot"></span>
                      {form.active
                        ? "Active"
                        : "Inactive"
                      }
                    </span>
                  </div>
                  {/* DESCRIPTION */}
                  <p className="manage-form-description">
                    {form.description}
                  </p>
                  {/* META */}
                  <div className="manage-form-meta">
                    <div className="manage-meta-item">
                      <FaUsers />
                      <span>
                        {form.responses}
                        {" "}
                        responses
                      </span>
                    </div>
                    <div className="manage-meta-item">
                      <FaQuestionCircle />
                      <span>
                        {form.questions}
                        {" "}
                        questions
                      </span>
                    </div>
                    <div className="manage-meta-item">
                      <FaCalendarAlt />
                      <span>
                        {formatDate(
                          form.createdAt
                        )}
                      </span>
                    </div>
                  </div>
                  {/* LINK */}
                  <div className="manage-form-link">
                    <div className="manage-link-left">
                      <span className="manage-link-icon">
                        ↗
                      </span>
                      <span className="manage-link-text">
                        {getDisplayLink(
                          form
                        )}
                      </span>
                    </div>
                    <div className="manage-link-actions">
                      <button
                        type="button"
                        className="manage-qr-btn"
                        onClick={(event) =>
                          openQrModal(
                            form,
                            event
                          )
                        }
                        title="Generate QR Code"
                        aria-label={
                          `Generate QR Code for ${form.title}`
                        }
                      >
                        <FaQrcode />
                        <span>
                          QR
                        </span>
                      </button>
                      <button
                        type="button"
                        className={
                          copiedFormId ===
                            form.id
                            ? "manage-copy-btn copied"
                            : "manage-copy-btn"
                        }
                        onClick={(event) =>
                          copyLink(
                            form,
                            event
                          )
                        }
                        title="Copy link"
                      >
                        {copiedFormId ===
                        form.id ? (
                          <FaCheckCircle />
                        ) : (
                          <FaCopy />
                        )}
                        <span>
                          {copiedFormId ===
                          form.id
                            ? "Copied"
                            : "Copy"
                          }
                        </span>
                      </button>
                    </div>
                  </div>
                  {/* FOOTER */}
                  <div className="manage-form-footer">
                    <span>
                      Open form details and results
                    </span>
                    <div className="manage-form-footer-actions">
                      <button
                        type="button"
                        className="manage-delete-btn"
                        onClick={(event) =>
                          deleteForm(
                            form,
                            event
                          )
                        }
                        disabled={
                          deletingFormId ===
                          form.id
                        }
                        title="Delete form"
                        aria-label={
                          `Delete ${form.title}`
                        }
                      >
                        <FaTrash />
                        <span>
                          {deletingFormId ===
                          form.id
                            ? "Deleting..."
                            : "Delete"
                          }
                        </span>
                      </button>
                      <button
                        type="button"
                        className="manage-open-btn"
                        onClick={(event) => {
                          event.stopPropagation();
                          openForm(
                            form.id
                          );
                        }}
                      >
                        <span>
                          View Details
                        </span>
                        <FaArrowRight />
                      </button>
                    </div>
                  </div>
                </article>
              )
            )
          )}
        </section>
      </main>
      {/* FLOATING BUTTON */}
      <button
        type="button"
        className="manage-floating-new-btn"
        onClick={
          createNewForm
        }
      >
        <FaPlus />
        <span>
          New Form
        </span>
      </button>
      {/* BOTTOM NAVIGATION */}
      <nav className="manage-bottom-nav">
        <button
          type="button"
          className="manage-nav-item"
          onClick={
            goHome
          }
        >
          <FaHome />
          <span>
            Home
          </span>
        </button>
        <button
          type="button"
          className="manage-nav-item active"
          onClick={
            goForms
          }
        >
          <FaWpforms />
          <span>
            Forms
          </span>
        </button>
        <button
          type="button"
          className="manage-nav-item"
          onClick={
            goProfile
          }
        >
          <FaUserCog />
          <span>
            Profile
          </span>
        </button>
      </nav>
      {/* =====================================================
          QR CODE MODAL
      ===================================================== */}
      {selectedQrForm && (
        <div
          className="manage-qr-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              closeQrModal();
            }
          }}
        >
          <section
            className="manage-qr-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="manage-qr-modal-title"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            {/* MODAL HEADER */}
            <div className="manage-qr-modal-header">
              <div className="manage-qr-modal-heading">
                <div className="manage-qr-modal-icon">
                  <FaQrcode />
                </div>
                <div>
                  <span>
                    Share Form
                  </span>
                  <h2 id="manage-qr-modal-title">
                    QR Code
                  </h2>
                </div>
              </div>
              <button
                type="button"
                className="manage-qr-close-btn"
                onClick={
                  closeQrModal
                }
                aria-label="Close QR Code"
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
            {/* FORM INFORMATION */}
            <div className="manage-qr-form-info">
              <span className="manage-qr-form-type">
                {selectedQrForm.type}
              </span>
              <h3>
                {selectedQrForm.title}
              </h3>
              <p>
                Scan this QR Code to open the form.
              </p>
            </div>
            {/* QR CODE */}
            <div className="manage-qr-code-wrapper">
              <div className="manage-qr-code-box">
                <QRCodeCanvas
                  id="manage-form-qr-canvas"
                  value={
                    getFormUrl(
                      selectedQrForm
                    )
                  }
                  size={230}
                  level="H"
                  includeMargin={true}
                  bgColor="#ffffff"
                  fgColor="#172033"
                  title={
                    `QR Code ${selectedQrForm.title}`
                  }
                />
              </div>
              <span className="manage-qr-scan-label">
                <FaQrcode />
                Scan to open form
              </span>
            </div>
            {/* LINK PREVIEW */}
            <div className="manage-qr-link-preview">
              <span>
                Form Link
              </span>
              <div>
                <p>
                  {getFormUrl(
                    selectedQrForm
                  )}
                </p>
                <button
                  type="button"
                  onClick={(event) =>
                    copyLink(
                      selectedQrForm,
                      event
                    )
                  }
                  title="Copy QR link"
                >
                  {copiedFormId ===
                  selectedQrForm.id ? (
                    <FaCheckCircle />
                  ) : (
                    <FaCopy />
                  )}
                </button>
              </div>
            </div>
            {/* MODAL ACTIONS */}
            <div className="manage-qr-modal-actions">
              <button
                type="button"
                className="manage-qr-cancel-btn"
                onClick={
                  closeQrModal
                }
              >
                Close
              </button>
              <button
                type="button"
                className={
                  qrDownloaded
                    ? "manage-qr-download-btn downloaded"
                    : "manage-qr-download-btn"
                }
                onClick={
                  downloadQrCode
                }
              >
                {qrDownloaded ? (
                  <FaCheckCircle />
                ) : (
                  <FaDownload />
                )}
                <span>
                  {qrDownloaded
                    ? "Downloaded"
                    : "Download QR"
                  }
                </span>
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
export default ManageForms;