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
  FaChevronRight,
  FaClipboardCheck,
  FaCopy,
  FaDownload,
  FaFileAlt,
  FaFileWord,
  FaHome,
  FaPlus,
  FaQrcode,
  FaTimes,
  FaUser,
  FaWpforms,
} from "react-icons/fa";

import {
  QRCodeCanvas,
} from "qrcode.react";

import {
  ThemeContext,
} from "../context/ThemeContext";

import "../assets/css/AdminDashboard.css";

import logo from "../assets/images/logo.png";

const FORMS_STORAGE_KEY =
  "hidocs_forms";

const DELETED_FORMS_STORAGE_KEY =
  "hidocs_deleted_forms";

const defaultForms = [

  {
    id: 1,

    title:
      "Survey Kepuasan Mahasiswa 2024",

    description:
      "Collect feedback about campus facilities and administrative services.",

    customLink:
      "survey-mhs-2024",

    link:
      "hidocs.app/r/survey-mhs-2024",

    active:
      true,

    createdAt:
      "2024-06-10T10:24:00.000Z",

    type:
      "Survey",

    isDefault:
      true,
  },

  {
    id: 2,

    title:
      "Quiz Pemrograman Mobile - Flutter",

    description:
      "Evaluate students' understanding of Flutter widgets and mobile development.",

    customLink:
      "quiz-flutter-w5",

    link:
      "hidocs.app/r/quiz-flutter-w5",

    active:
      true,

    createdAt:
      "2024-06-11T09:15:00.000Z",

    type:
      "Quiz",

    isDefault:
      true,
  },

  {
    id: 3,

    title:
      "Form Pendaftaran Event Hackathon",

    description:
      "Registration form for participants joining the upcoming hackathon event.",

    customLink:
      "hack24",

    link:
      "hidocs.app/r/hack24",

    active:
      true,

    createdAt:
      "2024-06-13T08:30:00.000Z",

    type:
      "Registration",

    isDefault:
      true,
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

const getCurrentAdmin = () => {

  try {

    const savedUser =
      localStorage.getItem(
        "user"
      );


    if (!savedUser) {

      return {
        name:
          "Admin",
      };

    }


    const parsedUser =
      JSON.parse(
        savedUser
      );


    return {

      name:
        parsedUser.username ||
        parsedUser.name ||
        "Admin",

    };

  } catch (error) {

    console.error(
      "Gagal membaca data admin:",
      error
    );


    return {
      name:
        "Admin",
    };

  }

};

const normalizeCustomLink = (
  form
) => {

  const rawValue =
    String(
      form.customLink ||
      form.link ||
      form.id ||
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
    rawValue ||
    String(
      form.id ||
      Date.now()
    )
  );

};

const normalizeForm = (
  form
) => {

  const customLink =
    normalizeCustomLink(
      form
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

    active:
      form.active !==
      false,

    createdAt:
      form.createdAt ||
      new Date()
        .toISOString(),

    type:
      form.type ||
      form.category ||
      "Form",

  };

};

const mergeForms = (
  baseForms,
  storedForms
) => {

  const normalizedForms = [

    ...baseForms.map(
      normalizeForm
    ),

    ...storedForms.map(
      normalizeForm
    ),

  ];


  /*
    Data form buatan admin diletakkan setelah form default.
    Jika ada ID atau custom link yang sama, data terakhir
    akan digunakan.
  */

  const uniqueForms =
    new Map();


  normalizedForms.forEach(
    (
      form
    ) => {

      const uniqueKey =
        form.customLink
          ? `link-${form.customLink.toLowerCase()}`
          : `id-${String(form.id)}`;


      uniqueForms.set(
        uniqueKey,
        form
      );

    }
  );


  return Array.from(
    uniqueForms.values()
  );

};
const formatRecentDate = (
  dateValue
) => {

  if (!dateValue) {

    return "Date unavailable";

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


  const now =
    new Date();


  const isToday =
    date.getDate() ===
      now.getDate() &&
    date.getMonth() ===
      now.getMonth() &&
    date.getFullYear() ===
      now.getFullYear();


  const formattedTime =
    new Intl.DateTimeFormat(
      "en-US",
      {
        hour:
          "2-digit",

        minute:
          "2-digit",
      }
    ).format(
      date
    );


  if (isToday) {

    return `Today, ${formattedTime}`;

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

      hour:
        "2-digit",

      minute:
        "2-digit",
    }
  ).format(
    date
  );

};

const getCompleteFormLink = (
  form
) => {

  const formLink =
    String(
      form?.link ||
      ""
    );


  if (
    formLink.startsWith(
      "http://"
    ) ||
    formLink.startsWith(
      "https://"
    )
  ) {

    return formLink;

  }


  return `https://${formLink}`;

};

const createSafeFileName = (
  value
) => {

  return String(
    value ||
    "hidocs-form"
  )
    .trim()
    .toLowerCase()
    .replace(
      /[^a-z0-9]+/g,
      "-"
    )
    .replace(
      /^-+|-+$/g,
      ""
    ) ||
    "hidocs-form";

};
function AdminDashboard() {

  const navigate =
    useNavigate();


  const {
    darkMode,
  } = useContext(
    ThemeContext
  );

  const [
    forms,
    setForms,
  ] = useState([]);


  const [
    copiedFormId,
    setCopiedFormId,
  ] = useState(null);


  const [
    selectedQrForm,
    setSelectedQrForm,
  ] = useState(null);


  const [
    qrDownloaded,
    setQrDownloaded,
  ] = useState(false);
  const admin =
    useMemo(
      () =>
        getCurrentAdmin(),
      []
    );



  const getGreeting =
    () => {

      const currentHour =
        new Date()
          .getHours();


      if (
        currentHour <
        11
      ) {

        return "GOOD MORNING";

      }


      if (
        currentHour <
        15
      ) {

        return "GOOD AFTERNOON";

      }


      if (
        currentHour <
        19
      ) {

        return "GOOD EVENING";

      }


      return "GOOD NIGHT";

    };
  const loadForms =
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


        const availableDefaultForms =
          defaultForms.filter(
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


        const availableStoredForms =
          storedForms.filter(
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


        const mergedForms =
          mergeForms(
            availableDefaultForms,
            availableStoredForms
          );


        setForms(
          mergedForms
        );

      } catch (error) {

        console.error(
          "Gagal memuat form dashboard admin:",
          error
        );


        setForms([]);

      }

    };

  useEffect(
    () => {

      loadForms();

    },
    []
  );
  useEffect(
    () => {

      const handleWindowFocus =
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
        handleWindowFocus
      );


      document.addEventListener(
        "visibilitychange",
        handleVisibilityChange
      );


      return () => {

        window.removeEventListener(
          "focus",
          handleWindowFocus
        );


        document.removeEventListener(
          "visibilitychange",
          handleVisibilityChange
        );

      };

    },
    []
  );

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
    []
  );

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
    []
  );

  const recentForms =
    useMemo(
      () => {

        return [
          ...forms,
        ]
          .sort(
            (
              first,
              second
            ) => {

              const firstDate =
                new Date(
                  first.createdAt
                ).getTime();


              const secondDate =
                new Date(
                  second.createdAt
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
          )
          .slice(
            0,
            4
          );

      },
      [
        forms,
      ]
    );
  const goToCreateForm =
    () => {

      navigate(
        "/create-form"
      );

    };

  const goToImportWord =
    () => {

      navigate(
        "/admin/import-word"
      );

    };


  const goToManageForms =
    () => {

      navigate(
        "/admin/forms"
      );

    };


  const goToAdminProfile =
    () => {

      navigate(
        "/admin/profile"
      );

    };


  const openFormDetails = (
    id
  ) => {

    navigate(
      `/admin/forms/${id}`
    );

  };

  const copyFormLink =
    async (
      form,
      event
    ) => {

      event?.stopPropagation();


      try {

        await navigator.clipboard.writeText(
          getCompleteFormLink(
            form
          )
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

  const openQrModal =
    (
      form,
      event
    ) => {

      event?.stopPropagation();


      setQrDownloaded(
        false
      );


      setSelectedQrForm(
        form
      );

    };

  const closeQrModal =
    () => {

      setSelectedQrForm(
        null
      );


      setQrDownloaded(
        false
      );

    };

  const downloadQrCode =
    () => {

      if (!selectedQrForm) {

        return;

      }


      const canvas =
        document.getElementById(
          "admin-dashboard-qr-canvas"
        );


      if (!canvas) {

        alert(
          "QR Code belum tersedia."
        );

        return;

      }


      const pngUrl =
        canvas
          .toDataURL(
            "image/png"
          )
          .replace(
            "image/png",
            "image/octet-stream"
          );


      const downloadLink =
        document.createElement(
          "a"
        );


      downloadLink.href =
        pngUrl;


      downloadLink.download =
        `${createSafeFileName(
          selectedQrForm.title
        )}-qr-code.png`;


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

    };

  useEffect(
    () => {

      if (!selectedQrForm) {

        return undefined;

      }


      const handleEscape =
        (
          event
        ) => {

          if (
            event.key ===
            "Escape"
          ) {

            closeQrModal();

          }

        };


      window.addEventListener(
        "keydown",
        handleEscape
      );


      return () => {

        window.removeEventListener(
          "keydown",
          handleEscape
        );

      };

    },
    [
      selectedQrForm,
    ]
  );
  const renderFormIcon = (
    formType
  ) => {

    if (
      String(
        formType
      )
        .toLowerCase() ===
      "quiz"
    ) {

      return (
        <FaClipboardCheck />
      );

    }


    return (
      <FaFileAlt />
    );

  };

  return (

    <div
      className={
        darkMode
          ? "admin-dashboard dark"
          : "admin-dashboard"
      }
    >

      <header className="admin-hero">


        <div className="admin-hero-decoration">

          <span className="hero-circle hero-circle-one"></span>

          <span className="hero-circle hero-circle-two"></span>


          <div className="hero-dots">

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



        <div className="admin-hero-brand">

          <div className="admin-hero-logo">

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



        <div className="admin-hero-content">

          <span className="admin-greeting-badge">

            {getGreeting()}

          </span>


          <h1>

            Hello, {admin.name}!

            <span
              className="admin-wave"
              role="img"
              aria-label="wave"
            >
              👋
            </span>

          </h1>


          <p>
            Manage your forms and track responses
          </p>

        </div>


      </header>

      <main className="admin-main-content">

        <section className="admin-primary-actions">


          <button
            type="button"
            className="admin-primary-card"
            onClick={
              goToCreateForm
            }
          >

            <div className="primary-card-icon plus">

              <FaPlus />

            </div>


            <div className="primary-card-content">

              <h2>
                New Form
              </h2>

              <p>
                Create surveys, quizzes and registration forms.
              </p>

            </div>


            <div className="primary-card-arrow">

              <FaChevronRight />

            </div>

          </button>



          <button
            type="button"
            className="admin-primary-card"
            onClick={
              goToImportWord
            }
          >

            <div className="primary-card-icon word">

              <FaFileWord />

              <span>
                W
              </span>

            </div>


            <div className="primary-card-content">

              <h2>
                Import Word
              </h2>

              <p>
                Import Microsoft Word (.docx) into HiDocs.
              </p>

            </div>


            <div className="primary-card-arrow">

              <FaChevronRight />

            </div>

          </button>


        </section>

        <section className="admin-recent-section">


          <div className="admin-section-heading">


            <div>

              <span className="admin-section-eyebrow">
                Your Forms
              </span>

              <h2>
                Recent Forms
              </h2>

              <p>
                Showing up to 4 recently created forms.
              </p>

            </div>


            <button
              type="button"
              className="admin-view-all-btn"
              onClick={
                goToManageForms
              }
            >

              <span>
                View All
              </span>

              <FaArrowRight />

            </button>


          </div>



          <div className="admin-recent-grid">


            {recentForms.length ===
            0 ? (

              <div className="admin-empty-recent">


                <div className="admin-empty-recent-icon">

                  <FaWpforms />

                </div>


                <span className="admin-empty-eyebrow">
                  Start Building
                </span>


                <h3>
                  No forms available
                </h3>


                <p>
                  You have not created any forms yet. Create your
                  first form to start collecting responses.
                </p>


                <button
                  type="button"
                  onClick={
                    goToCreateForm
                  }
                >

                  <FaPlus />

                  <span>
                    Create First Form
                  </span>

                </button>


              </div>

            ) : (

              recentForms.map(
                (
                  form
                ) => (

                  <article
                    key={
                      form.id
                    }
                    className="admin-recent-card"
                    tabIndex={
                      0
                    }
                    role="button"
                    onClick={() =>
                      openFormDetails(
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


                        openFormDetails(
                          form.id
                        );

                      }

                    }}
                  >


                    <div className="recent-card-main">


                      <div className="recent-card-icon">

                        {renderFormIcon(
                          form.type
                        )}

                      </div>


                      <div className="recent-card-content">


                        <span className="recent-card-type">

                          {form.type}

                        </span>


                        <h3>
                          {form.title}
                        </h3>


                        <p>
                          {form.description}
                        </p>


                        <div className="recent-card-date">

                          <FaCalendarAlt />

                          <span>

                            {formatRecentDate(
                              form.createdAt
                            )}

                          </span>

                        </div>


                      </div>


                    </div>



                    <div className="recent-card-side">


                      <span
                        className={
                          form.active
                            ? "recent-card-status"
                            : "recent-card-status inactive"
                        }
                      >

                        <span className="recent-status-dot"></span>

                        {form.active
                          ? "Active"
                          : "Inactive"
                        }

                      </span>


                      <div className="recent-card-buttons">


                        <button
                          type="button"
                          className="recent-qr-button"
                          title="Show QR code"
                          aria-label={
                            `Show QR code for ${form.title}`
                          }
                          onClick={(event) =>
                            openQrModal(
                              form,
                              event
                            )
                          }
                        >

                          <FaQrcode />

                        </button>



                        <button
                          type="button"
                          className={
                            copiedFormId ===
                            form.id
                              ? "recent-copy-button copied"
                              : "recent-copy-button"
                          }
                          title="Copy form link"
                          aria-label={
                            `Copy link for ${form.title}`
                          }
                          onClick={(event) =>
                            copyFormLink(
                              form,
                              event
                            )
                          }
                        >

                          {copiedFormId ===
                          form.id ? (

                            <FaCheckCircle />

                          ) : (

                            <FaCopy />

                          )}

                        </button>



                        <button
                          type="button"
                          className="recent-open-button"
                          title="Open form details"
                          aria-label={
                            `Open details for ${form.title}`
                          }
                          onClick={(event) => {

                            event.stopPropagation();


                            openFormDetails(
                              form.id
                            );

                          }}
                        >

                          <FaChevronRight />

                        </button>


                      </div>


                    </div>


                  </article>

                )
              )

            )}


          </div>


        </section>


      </main>
      <nav className="admin-bottom-nav">


        <button
          type="button"
          className="admin-nav-item active"
          onClick={() =>
            navigate(
              "/admin"
            )
          }
        >

          <FaHome />

          <span>
            Home
          </span>

        </button>



        <button
          type="button"
          className="admin-nav-item"
          onClick={
            goToManageForms
          }
        >

          <FaWpforms />

          <span>
            Forms
          </span>

        </button>



        <button
          type="button"
          className="admin-nav-item"
          onClick={
            goToAdminProfile
          }
        >

          <FaUser />

          <span>
            Profile
          </span>

        </button>


      </nav>

      {selectedQrForm && (

        <div
          className="admin-qr-overlay"
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
            className="admin-qr-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-qr-modal-title"
          >


            <div className="admin-qr-modal-header">


              <div className="admin-qr-modal-heading">


                <div className="admin-qr-modal-icon">

                  <FaQrcode />

                </div>


                <div>

                  <span>
                    Form QR Code
                  </span>

                  <h2 id="admin-qr-modal-title">
                    Share Form
                  </h2>

                </div>


              </div>


              <button
                type="button"
                className="admin-qr-close-btn"
                onClick={
                  closeQrModal
                }
                aria-label="Close QR modal"
              >

                <FaTimes />

              </button>


            </div>



            <div className="admin-qr-form-info">

              <span className="admin-qr-form-type">

                {selectedQrForm.type}

              </span>

              <h3>
                {selectedQrForm.title}
              </h3>

              <p>
                Scan this QR code to open the form.
              </p>

            </div>



            <div className="admin-qr-code-wrapper">


              <div className="admin-qr-code-box">

                <QRCodeCanvas
                  id="admin-dashboard-qr-canvas"
                  value={
                    getCompleteFormLink(
                      selectedQrForm
                    )
                  }
                  size={
                    230
                  }
                  level="H"
                  includeMargin
                  bgColor="#ffffff"
                  fgColor="#17385f"
                />

              </div>


              <span className="admin-qr-scan-label">

                <FaQrcode />

                Scan to open form

              </span>


            </div>



            <div className="admin-qr-link-preview">

              <span>
                Public form link
              </span>

              <div>

                <p>

                  {getCompleteFormLink(
                    selectedQrForm
                  )}

                </p>

                <button
                  type="button"
                  onClick={(event) =>
                    copyFormLink(
                      selectedQrForm,
                      event
                    )
                  }
                  title="Copy form link"
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



            <div className="admin-qr-modal-actions">


              <button
                type="button"
                className="admin-qr-cancel-btn"
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
                    ? "admin-qr-download-btn downloaded"
                    : "admin-qr-download-btn"
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


export default AdminDashboard;