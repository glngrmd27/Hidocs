import {
  useContext,
  useEffect,
  useState,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  FaChartBar,
  FaCheckCircle,
  FaChevronRight,
  FaClipboardCheck,
  FaClock,
  FaDownload,
  FaEnvelope,
  FaEye,
  FaFileWord,
  FaHome,
  FaInfoCircle,
  FaMoon,
  FaPencilAlt,
  FaPlus,
  FaQrcode,
  FaRandom,
  FaSave,
  FaShieldAlt,
  FaSignOutAlt,
  FaSun,
  FaTimes,
  FaTrophy,
  FaUser,
  FaUserCog,
  FaWpforms,
} from "react-icons/fa";
import {
  ThemeContext,
} from "../context/ThemeContext";
import "../assets/css/AdminProfile.css";
function CreatorProfile() {
  const navigate =
    useNavigate();
  const location =
    useLocation();

  const basePath =
    "/creator";

  useEffect(() => {
    localStorage.setItem("activeMode", "creator");
  }, [location.pathname]);

  const {
    darkMode,
    toggleTheme,
  } = useContext(
    ThemeContext
  );
  const adminEmail =
    "admin@hidocs.app";
  const adminRole =
    "ADMINISTRATOR";
  const [
    username,
    setUsername,
  ] = useState(
    "Admin"
  );
  const [
    showEditModal,
    setShowEditModal,
  ] = useState(
    false
  );
  const [
    showAboutModal,
    setShowAboutModal,
  ] = useState(
    false
  );
  const [
    showLogoutModal,
    setShowLogoutModal,
  ] = useState(
    false
  );
  const [
    editUsername,
    setEditUsername,
  ] = useState(
    "Admin"
  );
  const [
    usernameError,
    setUsernameError,
  ] = useState(
    ""
  );
  const [
    savedMessage,
    setSavedMessage,
  ] = useState(
    ""
  );
  useEffect(
    () => {
      try {
        const savedUser =
          localStorage.getItem(
            "user"
          );
        if (!savedUser) {
          return;
        }
        const parsedUser =
          JSON.parse(
            savedUser
          );
        const savedUsername =
          parsedUser.username ||
          parsedUser.name;
        if (
          typeof savedUsername ===
            "string" &&
          savedUsername.trim()
        ) {
          setUsername(
            savedUsername.trim()
          );
          setEditUsername(
            savedUsername.trim()
          );
        }
      } catch (error) {
        console.error(
          "Gagal membaca data admin:",
          error
        );
      }
    },
    []
  );
  // =========================================================
  // AVATAR INITIAL
  // =========================================================
  const avatarInitial =
    username
      .trim()
      .charAt(0)
      .toUpperCase() ||
    "A";
  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================
  const handleOpenEdit =
    () => {
      setEditUsername(
        username
      );
      setUsernameError(
        ""
      );
      setSavedMessage(
        ""
      );
      setShowEditModal(
        true
      );
    };

  const handleSwitchToUser = () => {
    localStorage.setItem("activeMode", "user");
    navigate("/dashboard");
  };

  // =========================================================
  // CLOSE EDIT MODAL
  // =========================================================
  const handleCloseEdit =
    () => {
      setEditUsername(
        username
      );
      setUsernameError(
        ""
      );
      setShowEditModal(
        false
      );
    };
  // =========================================================
  // OPEN ABOUT
  // =========================================================
  const handleOpenAbout =
    () => {
      setShowAboutModal(
        true
      );
    };
  // =========================================================
  // CLOSE ABOUT
  // =========================================================
  const handleCloseAbout =
    () => {
      setShowAboutModal(
        false
      );
    };
  // =========================================================
  // CHANGE USERNAME
  // =========================================================
  const handleUsernameChange = (
    event
  ) => {
    const value =
      event.target.value;
    setEditUsername(
      value
    );
    setUsernameError(
      ""
    );
  };
  // =========================================================
  // SAVE USERNAME
  // =========================================================
  const handleSaveProfile =
    () => {
      const newUsername =
        editUsername.trim();
      if (!newUsername) {
        setUsernameError(
          "Username tidak boleh kosong."
        );
        return;
      }
      if (
        newUsername.length <
        3
      ) {
        setUsernameError(
          "Username minimal 3 karakter."
        );
        return;
      }
      if (
        newUsername.length >
        30
      ) {
        setUsernameError(
          "Username maksimal 30 karakter."
        );
        return;
      }
      try {
        const savedUser =
          localStorage.getItem(
            "user"
          );
        let previousUser =
          {};
        if (
          savedUser
        ) {
          previousUser =
            JSON.parse(
              savedUser
            );
        }
        const updatedUser = {
          ...previousUser,
          username:
            newUsername,
          name:
            newUsername,
          email:
            adminEmail,
          role:
            adminRole,
        };
        localStorage.setItem(
          "user",
          JSON.stringify(
            updatedUser
          )
        );
        setUsername(
          newUsername
        );
        setEditUsername(
          newUsername
        );
        setShowEditModal(
          false
        );
        setSavedMessage(
          "Username berhasil diperbarui."
        );
        window.setTimeout(
          () => {
            setSavedMessage(
              ""
            );
          },
          2500
        );
      } catch (error) {
        console.error(
          "Gagal menyimpan username:",
          error
        );
        setUsernameError(
          "Username gagal disimpan."
        );
      }
    };
  // =========================================================
  // KEYBOARD SUBMIT
  // =========================================================
  const handleEditKeyDown = (
    event
  ) => {
    if (
      event.key ===
      "Enter"
    ) {
      event.preventDefault();
      handleSaveProfile();
    }
    if (
      event.key ===
      "Escape"
    ) {
      handleCloseEdit();
    }
  };

  
  // =========================================================
  // THEME
  // =========================================================
  const handleThemeToggle =
    () => {
      if (
        typeof toggleTheme ===
        "function"
      ) {
        toggleTheme();
      }
    };
  // =========================================================
  // SIGN OUT
  // =========================================================
  const handleSignOut =
    () => {
      setShowLogoutModal(
        true
      );
    };
  // =========================================================
  // CONFIRM SIGN OUT
  // =========================================================
  const confirmSignOut =
    () => {
      localStorage.removeItem(
        "isLoggedIn"
      );
      localStorage.removeItem(
        "user"
      );
      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };
  // =========================================================
  // ESCAPE KEY
  // =========================================================
  useEffect(
    () => {
      const handleEscape = (
        event
      ) => {
        if (
          event.key !==
          "Escape"
        ) {
          return;
        }
        setShowEditModal(
          false
        );
        setShowAboutModal(
          false
        );
        setShowLogoutModal(
          false
        );
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
    []
  );
  // =========================================================
  // BODY SCROLL LOCK
  // =========================================================
  useEffect(
    () => {
      const hasOpenModal =
        showEditModal ||
        showAboutModal ||
        showLogoutModal;
      if (
        hasOpenModal
      ) {
        document.body.style.overflow =
          "hidden";
      } else {
        document.body.style.removeProperty(
          "overflow"
        );
      }
      return () => {
        document.body.style.removeProperty(
          "overflow"
        );
      };
    },
    [
      showEditModal,
      showAboutModal,
      showLogoutModal,
    ]
  );
  // =========================================================
  // NAVIGATION
  // =========================================================
  const goHome =
    () => {
      navigate(
        basePath
      );
    };
  const goForms =
    () => {
      navigate(
        `${basePath}/forms`
      );
    };
  const goProfile =
    () => {
      navigate(
        `${basePath}/profile`
      );
    };
  // =========================================================
  // RETURN
  // =========================================================
  return (
    <div
      className={
        darkMode
          ? "admin-profile-page dark"
          : "admin-profile-page"
      }
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="admin-profile-header">
        <div className="admin-profile-header-decoration">
          <span className="profile-header-circle circle-one"></span>
          <span className="profile-header-circle circle-two"></span>
          <div className="profile-header-dots">
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
        <div className="admin-profile-header-content">
          <span className="admin-profile-eyebrow">
            Account Settings
          </span>
          <h1>
            Creator Profile
          </h1>
          <p>
            Manage your account information
            and application preferences.
          </p>
        </div>
      </header>
      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="admin-profile-content">
        {/* ===================================================
            SAVED MESSAGE
        =================================================== */}
        {savedMessage && (
          <div className="profile-success-message">
            <FaSave />
            <span>
              {savedMessage}
            </span>
          </div>
        )}
        {/* ===================================================
            PROFILE CARD
        =================================================== */}
        <section className="admin-profile-card">
          <div className="admin-profile-avatar-wrapper">
            <div className="admin-profile-avatar">
              {avatarInitial}
            </div>
            <span className="admin-online-indicator"></span>
          </div>
          <div className="admin-profile-info">
            <span className="profile-card-label">
              Creator account
            </span>
            <h2>
              {username}
            </h2>
            <div className="admin-profile-email">
              <FaEnvelope />
              <span>
                {adminEmail}
              </span>
            </div>
            <span className="admin-role">
              <FaShieldAlt />
              {adminRole}
            </span>
          </div>
          <button
            type="button"
            className="admin-edit-btn"
            onClick={
              handleOpenEdit
            }
            title="Edit username"
          >
            <FaPencilAlt />
            <span>
              Edit Profile
            </span>
          </button>
        </section>
        {/* ===================================================
            ACCOUNT INFORMATION
        =================================================== */}
        <section className="profile-section">
          <div className="profile-section-heading">
            <div>
              <span className="profile-section-eyebrow">
                Account
              </span>
              <h2>
                Profile Information
              </h2>
            </div>
            <div className="profile-section-icon">
              <FaUserCog />
            </div>
          </div>
          <div className="profile-information-list">
            {/* USERNAME */}
            <button
              type="button"
              className="profile-information-row editable"
              onClick={
                handleOpenEdit
              }
            >
              <div className="profile-information-icon user">
                <FaUser />
              </div>
              <div className="profile-information-content">
                <span>
                  Username
                </span>
                <strong>
                  {username}
                </strong>
              </div>
              <div className="profile-edit-indicator">
                <FaPencilAlt />
                <span>
                  Editable
                </span>
              </div>
            </button>
            {/* EMAIL */}
            <div className="profile-information-row">
              <div className="profile-information-icon email">
                <FaEnvelope />
              </div>
              <div className="profile-information-content">
                <span>
                  Email address
                </span>
                <strong>
                  {adminEmail}
                </strong>
              </div>
              <span className="profile-readonly-badge">
                Read only
              </span>
            </div>
            {/* ROLE */}
            <div className="profile-information-row">
              <div className="profile-information-icon role">
                <FaShieldAlt />
              </div>
              <div className="profile-information-content">
                <span>
                  Account role
                </span>
                <strong>
                  Creator
                </strong>
              </div>
              <span className="profile-readonly-badge">
                Read only
              </span>
            </div>
          </div>
        </section>
        {/* ===================================================
            SETTINGS
        =================================================== */}
        <section className="profile-section">
          <div className="profile-section-heading">
            <div>
              <span className="profile-section-eyebrow">
                Preferences
              </span>
              <h2>
                Application Settings
              </h2>
            </div>
            <div className="profile-section-icon">
              {darkMode
                ? <FaMoon />
                : <FaSun />
              }
            </div>
          </div>
          <div className="admin-profile-settings">
            
            {/* THEME */}
            <div className="profile-setting-row">
              <div className="profile-setting-left">
                <div
                  className={
                    darkMode
                      ? "profile-setting-icon moon"
                      : "profile-setting-icon sun"
                  }
                >
                  {darkMode
                    ? <FaMoon />
                    : <FaSun />
                  }
                </div>
                <div className="profile-setting-text">
                  <strong>
                    {darkMode
                      ? "Dark Mode"
                      : "Light Mode"
                    }
                  </strong>
                  <span>
                    Switch the application theme
                  </span>
                </div>
              </div>
              <button
                type="button"
                className={
                  darkMode
                    ? "profile-toggle active"
                    : "profile-toggle"
                }
                onClick={
                  handleThemeToggle
                }
                aria-label="Toggle theme"
                aria-pressed={
                  darkMode
                }
              >

                
                <span className="profile-toggle-circle"></span>
              </button>
            </div>

            {/* SWITCH TO USER */}
<button
  type="button"
  className="profile-setting-row about-row"
  onClick={handleSwitchToUser}
>
  <div className="profile-setting-left">
    <div className="profile-setting-icon info">
      <FaUser />
    </div>
    <div className="profile-setting-text">
      <strong>Switch to User Mode</strong>
      <span>Go back to the regular user dashboard</span>
    </div>
  </div>
  <FaChevronRight className="about-arrow" />
</button>
            {/* ABOUT */}
            <button
              type="button"
              className="profile-setting-row about-row"
              onClick={
                handleOpenAbout
              }
            >
              <div className="profile-setting-left">
                <div className="profile-setting-icon info">
                  <FaInfoCircle />
                </div>
                <div className="profile-setting-text">
                  <strong>
                    About HiDocs!
                  </strong>
                  <span>
                    Discover HiDocs admin features and application information
                  </span>
                </div>
              </div>
              <FaChevronRight className="about-arrow" />
            </button>
          </div>
        </section>
        {/* ===================================================
            SIGN OUT
        =================================================== */}
        <section className="profile-danger-section">
          <div className="profile-danger-content">
            <strong>
              Sign out from HiDocs
            </strong>
            <span>
              You will need to log in again
              to access the admin dashboard.
            </span>
          </div>
          <button
            type="button"
            className="admin-signout-btn"
            onClick={
              handleSignOut
            }
          >
            <FaSignOutAlt />
            <span>
              Sign Out
            </span>
          </button>
        </section>
      </main>
      {/* =====================================================
          BOTTOM NAVIGATION
      ===================================================== */}
      <nav className="admin-bottom-nav">
        <button
          type="button"
          className="admin-nav-item"
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
          className="admin-nav-item"
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
          className="admin-nav-item active"
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
          EDIT USERNAME MODAL
      ===================================================== */}
      {showEditModal && (
        <div
          className="edit-profile-overlay"
          onMouseDown={
            handleCloseEdit
          }
        >
          <div
            className="edit-profile-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="edit-profile-title"
            onMouseDown={(event) =>
              event.stopPropagation()
            }
          >
            <div className="edit-profile-header">
              <div className="edit-profile-title">
                <div className="edit-profile-title-icon">
                  <FaUser />
                </div>
                <div>
                  <span>
                    Account information
                  </span>
                  <h2 id="edit-profile-title">
                    Edit Username
                  </h2>
                </div>
              </div>
              <button
                type="button"
                className="edit-close-btn"
                onClick={
                  handleCloseEdit
                }
                title="Close"
              >
                <FaTimes />
              </button>
            </div>
            <div className="edit-profile-body">
              <div className="edit-profile-avatar-preview">
                {editUsername
                  .trim()
                  .charAt(0)
                  .toUpperCase() ||
                  "A"
                }
              </div>
              <div className="edit-profile-field">
                <label htmlFor="admin-username">
                  Username
                </label>
                <div
                  className={
                    usernameError
                      ? "edit-profile-input error"
                      : "edit-profile-input"
                  }
                >
                  <FaUser />
                  <input
                    id="admin-username"
                    type="text"
                    value={
                      editUsername
                    }
                    onChange={
                      handleUsernameChange
                    }
                    onKeyDown={
                      handleEditKeyDown
                    }
                    placeholder="Enter username"
                    minLength={3}
                    maxLength={30}
                    autoFocus
                  />
                </div>
                <div className="edit-field-footer">
                  <span
                    className={
                      usernameError
                        ? "edit-error-message"
                        : "edit-helper-text"
                    }
                  >
                    {usernameError ||
                      "Only the username can be changed."
                    }
                  </span>
                  <span className="edit-character-count">
                    {editUsername.length}/30
                  </span>
                </div>
              </div>
              <div className="edit-readonly-information">
                <div>
                  <FaEnvelope />
                  <span>
                    Email
                  </span>
                  <strong>
                    {adminEmail}
                  </strong>
                </div>
                <span className="readonly-label">
                  Read only
                </span>
              </div>
            </div>
            <div className="edit-profile-actions">
              <button
                type="button"
                className="edit-cancel-btn"
                onClick={
                  handleCloseEdit
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="edit-save-btn"
                onClick={
                  handleSaveProfile
                }
              >
                <FaSave />
                Save Username
              </button>
            </div>
          </div>
        </div>
      )}
      {/* =====================================================
          ABOUT HIDOCS MODAL
      ===================================================== */}
      {showAboutModal && (
        <div
          className="admin-about-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              handleCloseAbout();
            }
          }}
        >
          <section
            className="admin-about-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="admin-about-title"
          >
            {/* =================================================
                CLOSE BUTTON
            ================================================= */}
            <button
              type="button"
              className="admin-about-close"
              onClick={
                handleCloseAbout
              }
              aria-label="Close"
            >
              <FaTimes />
            </button>
            {/* =================================================
                HERO
            ================================================= */}
            <div className="admin-about-hero">
              <div className="admin-about-hero-icon">
                <FaWpforms />
              </div>
              <div className="admin-about-hero-content">
                <span>
                  About Application
                </span>
                <h2 id="admin-about-title">
                  HiDocs!
                </h2>
                <p>
                  HiDocs is a smart digital form management platform
                  for creating, distributing, managing, and analyzing
                  surveys, quizzes, registrations, and other digital forms.
                </p>
              </div>
            </div>
            {/* =================================================
                TAGLINE
            ================================================= */}
            <div className="admin-about-intro">
              <div className="admin-about-intro-icon">
                <FaShieldAlt />
              </div>
              <div>
                <span>
                  Creator Workspace
                </span>
                <strong>
                  Create smarter forms. Manage everything in one place.
                </strong>
                <p>
                  Build forms manually or import Word documents,
                  control form availability, manage scoring,
                  and analyze respondent performance.
                </p>
              </div>
            </div>
            {/* =================================================
                FEATURES TITLE
            ================================================= */}
            <div className="admin-about-heading">
              <span>
                Creator Features
              </span>
              <h3>
                Powerful tools for managing forms
              </h3>
              <p>
                Everything administrators need to create,
                distribute, monitor, and evaluate forms.
              </p>
            </div>
            {/* =================================================
                FEATURES
            ================================================= */}
            <div className="admin-about-feature-grid">
              {/* CREATE FORM */}
              <article className="admin-about-feature">
                <div className="admin-about-feature-icon">
                  <FaPlus />
                </div>
                <div>
                  <strong>
                    Form Builder
                  </strong>
                  <span>
                    Create surveys, quizzes, registrations,
                    and custom forms with multiple question types.
                  </span>
                </div>
              </article>
              {/* IMPORT WORD */}
              <article className="admin-about-feature">
                <div className="admin-about-feature-icon">
                  <FaFileWord />
                </div>
                <div>
                  <strong>
                    Import Word
                  </strong>
                  <span>
                    Convert Microsoft Word .docx documents
                    directly into editable HiDocs questions.
                  </span>
                </div>
              </article>
              {/* SCHEDULE */}
              <article className="admin-about-feature">
                <div className="admin-about-feature-icon">
                  <FaClock />
                </div>
                <div>
                  <strong>
                    Schedule & Timer
                  </strong>
                  <span>
                    Set opening and closing schedules
                    and configure individual response timers.
                  </span>
                </div>
              </article>
              {/* QR */}
              <article className="admin-about-feature">
                <div className="admin-about-feature-icon">
                  <FaQrcode />
                </div>
                <div>
                  <strong>
                    QR Code Distribution
                  </strong>
                  <span>
                    Generate QR Codes and create
                    public or QR-only form access.
                  </span>
                </div>
              </article>
              {/* RANDOM */}
              <article className="admin-about-feature">
                <div className="admin-about-feature-icon">
                  <FaRandom />
                </div>
                <div>
                  <strong>
                    Question Randomization
                  </strong>
                  <span>
                    Shuffle questions and answer choices
                    for different respondents.
                  </span>
                </div>
              </article>
              {/* SCORING */}
              <article className="admin-about-feature">
                <div className="admin-about-feature-icon">
                  <FaTrophy />
                </div>
                <div>
                  <strong>
                    Smart Scoring
                  </strong>
                  <span>
                    Set correct answers and points
                    for automatically graded questions.
                  </span>
                </div>
              </article>
              {/* VIEW ANSWERS */}
              <article className="admin-about-feature">
                <div className="admin-about-feature-icon">
                  <FaEye />
                </div>
                <div>
                  <strong>
                    View Respondent Answers
                  </strong>
                  <span>
                    Review answers, correct and incorrect responses,
                    points, and respondent scores privately.
                  </span>
                </div>
              </article>
              {/* ANALYTICS */}
              <article className="admin-about-feature">
                <div className="admin-about-feature-icon">
                  <FaChartBar />
                </div>
                <div>
                  <strong>
                    Response Analytics
                  </strong>
                  <span>
                    Monitor response totals, average scores,
                    score distribution, highest and lowest results.
                  </span>
                </div>
              </article>
              {/* RESULT CONTROL */}
              <article className="admin-about-feature">
                <div className="admin-about-feature-icon">
                  <FaClipboardCheck />
                </div>
                <div>
                  <strong>
                    Result Control
                  </strong>
                  <span>
                    Decide whether users can see no result,
                    result only, or result with score.
                  </span>
                </div>
              </article>
              {/* EXPORT */}
              <article className="admin-about-feature">
                <div className="admin-about-feature-icon">
                  <FaDownload />
                </div>
                <div>
                  <strong>
                    Export Results
                  </strong>
                  <span>
                    Export respondent data and reports
                    for further analysis and documentation.
                  </span>
                </div>
              </article>
            </div>
            {/* =================================================
                ADMIN CONTROL
            ================================================= */}
            <div className="admin-about-control-card">
              <div className="admin-about-control-icon">
                <FaCheckCircle />
              </div>
              <div>
                <strong>
                  Complete Form Management
                </strong>
                <span>
                  Creators can activate or deactivate forms,
                  extend schedules, manage access, review submissions,
                  and control what respondents are allowed to see.
                </span>
              </div>
            </div>
            {/* =================================================
                APP INFORMATION
            ================================================= */}
            <div className="admin-about-heading compact">
              <span>
                Application
              </span>
              <h3>
                App Information
              </h3>
            </div>
            <div className="admin-about-information">
              <div>
                <span>
                  Application
                </span>
                <strong>
                  HiDocs!
                </strong>
              </div>
              <div>
                <span>
                  Version
                </span>
                <strong>
                  1.0.0
                </strong>
              </div>
              <div>
                <span>
                  Account
                </span>
                <strong>
                  Creator
                </strong>
              </div>
              <div>
                <span>
                  Developed by
                </span>
                <strong>
                  Kelompok 3
                </strong>
              </div>
            </div>
            {/* =================================================
                FOOTER
            ================================================= */}
            <div className="admin-about-footer">
              <div>
                <FaShieldAlt />
                <span>
                  HiDocs Digital Form Platform
                </span>
              </div>
              <button
                type="button"
                onClick={
                  handleCloseAbout
                }
              >
                Close
              </button>
            </div>
          </section>
        </div>
      )}
      {/* =====================================================
          LOGOUT MODAL
      ===================================================== */}
      {showLogoutModal && (
        <div
          className="admin-logout-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowLogoutModal(
                false
              );
            }
          }}
        >
          <section
            className="admin-logout-modal"
            role="dialog"
            aria-modal="true"
          >
            <button
              type="button"
              className="admin-logout-close"
              onClick={() =>
                setShowLogoutModal(
                  false
                )
              }
              aria-label="Close"
            >
              <FaTimes />
            </button>
            <div className="admin-logout-icon">
              <FaSignOutAlt />
            </div>
            <span>
              Account Session
            </span>
            <h2>
              Sign Out?
            </h2>
            <p>
              You will need to enter your email
              and password again to access HiDocs.
            </p>
            <div className="admin-logout-actions">
              <button
                type="button"
                className="admin-logout-cancel"
                onClick={() =>
                  setShowLogoutModal(
                    false
                  )
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="admin-logout-confirm"
                onClick={
                  confirmSignOut
                }
              >
                <FaSignOutAlt />
                Sign Out
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
export default CreatorProfile;