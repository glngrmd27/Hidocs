import {
  useContext,
  useEffect,
  useState,
} from "react";
import {
  useNavigate,
} from "react-router-dom";
import {
  FaAdjust,
  FaAt,
  FaChevronRight,
  FaClipboardList,
  FaEnvelope,
  FaHistory,
  FaInfoCircle,
  FaLock,
  FaMoon,
  FaPen,
  FaQrcode,
  FaRandom,
  FaShieldAlt,
  FaSignOutAlt,
  FaStopwatch,
  FaSun,
  FaTimes,
  FaTrophy,
  FaUser,
  FaUserCircle,
} from "react-icons/fa";
import BottomNavigation from "../components/BottomNavigation";
import {
  ThemeContext,
} from "../context/ThemeContext";
import "../assets/css/Profile.css";
// =========================================================
// PROFILE
// =========================================================
function Profile() {
  const navigate =
    useNavigate();
  const {
    darkMode,
    toggleTheme,
  } = useContext(
    ThemeContext
  );
  // =========================================================
  // USER DATA
  // =========================================================
  const [
    user,
    setUser,
  ] = useState({
    username: "Budi Santoso",
    email: "budi@email.com",
    role: "User",
  });
  // =========================================================
  // MODAL STATE
  // =========================================================
  const [
    showEdit,
    setShowEdit,
  ] = useState(
    false
  );
  const [
    showAbout,
    setShowAbout,
  ] = useState(
    false
  );
  const [
    showLogout,
    setShowLogout,
  ] = useState(
    false
  );
  const [
    editedUsername,
    setEditedUsername,
  ] = useState(
    ""
  );
  const [
    editError,
    setEditError,
  ] = useState(
    ""
  );
  // =========================================================
  // LOAD USER
  // =========================================================
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
        setUser({
          username:
            parsedUser.username ||
            parsedUser.name ||
            "User",
          email:
            parsedUser.email ||
            "user@hidocs.com",
          role:
            parsedUser.role ||
            "User",
        });
      } catch (error) {
        console.error(
          "Failed to load user profile:",
          error
        );
      }
    },
    []
  );
  // =========================================================
  // OPEN EDIT MODAL
  // =========================================================
  const openEditModal =
    () => {
      setEditedUsername(
        user.username
      );
      setEditError(
        ""
      );
      setShowEdit(
        true
      );
    };
  // =========================================================
  // OPEN ABOUT MODAL
  // =========================================================
  const openAboutModal =
    () => {
      setShowAbout(
        true
      );
    };
  // =========================================================
  // SAVE USERNAME
  // =========================================================
  const saveUsername = (
    event
  ) => {
    event.preventDefault();
    const cleanUsername =
      editedUsername.trim();
    if (
      cleanUsername.length <
      3
    ) {
      setEditError(
        "Username minimal 3 karakter."
      );
      return;
    }
    if (
      cleanUsername.length >
      30
    ) {
      setEditError(
        "Username maksimal 30 karakter."
      );
      return;
    }
    const updatedUser = {
      ...user,
      username:
        cleanUsername,
    };
    setUser(
      updatedUser
    );
    try {
      // =====================================================
      // UPDATE ACTIVE USER
      // =====================================================
      const savedUser =
        localStorage.getItem(
          "user"
        );
      const existingUser =
        savedUser
          ? JSON.parse(
              savedUser
            )
          : {};
      localStorage.setItem(
        "user",
        JSON.stringify({
          ...existingUser,
          username:
            cleanUsername,
          name:
            cleanUsername,
        })
      );
      // =====================================================
      // UPDATE USERS STORAGE
      // =====================================================
      const savedUsers =
        localStorage.getItem(
          "users"
        );
      if (
        savedUsers
      ) {
        const users =
          JSON.parse(
            savedUsers
          );
        const updatedUsers =
          Array.isArray(
            users
          )
            ? users.map(
                (
                  item
                ) => {
                  if (
                    item.email
                      ?.trim()
                      .toLowerCase() ===
                    user.email
                      ?.trim()
                      .toLowerCase()
                  ) {
                    return {
                      ...item,
                      username:
                        cleanUsername,
                      name:
                        cleanUsername,
                    };
                  }
                  return item;
                }
              )
            : [];
        localStorage.setItem(
          "users",
          JSON.stringify(
            updatedUsers
          )
        );
      }
    } catch (error) {
      console.error(
        "Failed to update username:",
        error
      );
    }
    setShowEdit(
      false
    );
  };
  // =========================================================
  // LOGOUT
  // =========================================================
  const logout =
    () => {
      localStorage.removeItem(
        "user"
      );
      localStorage.removeItem(
        "isLoggedIn"
      );
      navigate(
        "/login",
        {
          replace: true,
        }
      );
    };
  // =========================================================
  // CLOSE MODALS WITH ESCAPE
  // =========================================================
  useEffect(
    () => {
      const handleKeyDown = (
        event
      ) => {
        if (
          event.key !==
          "Escape"
        ) {
          return;
        }
        setShowEdit(
          false
        );
        setShowAbout(
          false
        );
        setShowLogout(
          false
        );
      };
      window.addEventListener(
        "keydown",
        handleKeyDown
      );
      return () => {
        window.removeEventListener(
          "keydown",
          handleKeyDown
        );
      };
    },
    []
  );
  // =========================================================
  // SCROLL LOCK WHEN MODAL OPEN
  // =========================================================
  useEffect(
    () => {
      const modalOpen =
        showEdit ||
        showAbout ||
        showLogout;
      if (
        modalOpen
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
      showEdit,
      showAbout,
      showLogout,
    ]
  );
  // =========================================================
  // RETURN
  // =========================================================
  return (
    <div
      className={
        darkMode
          ? "profile-page dark"
          : "profile-page"
      }
    >
      {/* =====================================================
          HEADER
      ===================================================== */}
      <header className="profile-header">
        <div className="profile-header-decoration">
          <span className="profile-header-circle circle-one"></span>
          <span className="profile-header-circle circle-two"></span>
        </div>
        <div className="profile-header-content">
          <span>
            Account Settings
          </span>
          <h1>
            Profile
          </h1>
          <p>
            Manage your account and application preferences.
          </p>
        </div>
      </header>
      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="profile-content">
        {/* ===================================================
            USER CARD
        =================================================== */}
        <section className="profile-card">
          <div className="profile-card-main">
            <div className="profile-avatar">
              <FaUserCircle />
            </div>
            <div className="profile-details">
              <span className="profile-label">
                Signed in as
              </span>
              <h2>
                {user.username}
              </h2>
              <div className="profile-email">
                <FaEnvelope />
                <span>
                  {user.email}
                </span>
              </div>
              <span className="profile-role">
                <FaShieldAlt />
                {user.role}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="profile-edit-btn"
            onClick={
              openEditModal
            }
          >
            <FaPen />
            <span>
              Edit Username
            </span>
          </button>
        </section>
        {/* ===================================================
            ACCOUNT INFORMATION
        =================================================== */}
        <section className="profile-overview">
          <div className="profile-section-heading">
            <div className="profile-section-icon">
              <FaUser />
            </div>
            <div>
              <span>
                Account
              </span>
              <h3>
                Profile Information
              </h3>
            </div>
          </div>
          <div className="profile-information-grid">
            {/* USERNAME */}
            <div className="profile-information-item">
              <div className="profile-information-icon">
                <FaAt />
              </div>
              <div>
                <span>
                  Username
                </span>
                <strong>
                  {user.username}
                </strong>
              </div>
              <span className="profile-editable-badge">
                Editable
              </span>
            </div>
            {/* EMAIL */}
            <div className="profile-information-item">
              <div className="profile-information-icon email">
                <FaEnvelope />
              </div>
              <div>
                <span>
                  Email Address
                </span>
                <strong>
                  {user.email}
                </strong>
              </div>
              <span className="profile-readonly-badge">
                Read only
              </span>
            </div>
            {/* ROLE */}
            <div className="profile-information-item">
              <div className="profile-information-icon role">
                <FaShieldAlt />
              </div>
              <div>
                <span>
                  Account Role
                </span>
                <strong>
                  {user.role}
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
        <section className="profile-settings-section">
          <div className="profile-section-heading">
            <div className="profile-section-icon">
              {darkMode
                ? <FaMoon />
                : <FaSun />
              }
            </div>
            <div>
              <span>
                Preferences
              </span>
              <h3>
                Application Settings
              </h3>
            </div>
          </div>
          {/* =================================================
              THEME
          ================================================= */}
          <div className="profile-setting-card">
            <div className="profile-setting-left">
              <div className="profile-setting-icon theme">
                {darkMode
                  ? <FaMoon />
                  : <FaSun />
                }
              </div>
              <div>
                <h4>
                  {darkMode
                    ? "Dark Mode"
                    : "Light Mode"
                  }
                </h4>
                <p>
                  Switch the appearance of the HiDocs application.
                </p>
              </div>
            </div>
            <label className="profile-switch">
              <input
                type="checkbox"
                checked={
                  darkMode
                }
                onChange={
                  toggleTheme
                }
              />
              <span className="profile-slider"></span>
            </label>
          </div>
          {/* =================================================
              ABOUT
          ================================================= */}
          <button
            type="button"
            className="profile-setting-card profile-setting-button"
            onClick={
              openAboutModal
            }
          >
            <div className="profile-setting-left">
              <div className="profile-setting-icon about">
                <FaInfoCircle />
              </div>
              <div>
                <h4>
                  About HiDocs!
                </h4>
                <p>
                  Discover HiDocs features and application information.
                </p>
              </div>
            </div>
            <FaChevronRight className="profile-setting-arrow" />
          </button>
        </section>
        {/* ===================================================
            SIGN OUT
        =================================================== */}
        <section className="profile-danger-section">
          <div>
            <span>
              Session
            </span>
            <h3>
              Sign Out Account
            </h3>
            <p>
              End your current session on this device.
            </p>
          </div>
          <button
            type="button"
            className="profile-logout-btn"
            onClick={() =>
              setShowLogout(
                true
              )
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
          EDIT USERNAME MODAL
      ===================================================== */}
      {showEdit && (
        <div
          className="profile-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowEdit(
                false
              );
            }
          }}
        >
          <form
            className="profile-modal"
            onSubmit={
              saveUsername
            }
          >
            <button
              type="button"
              className="profile-modal-close"
              onClick={() =>
                setShowEdit(
                  false
                )
              }
              aria-label="Close"
            >
              <FaTimes />
            </button>
            <div className="profile-modal-icon">
              <FaPen />
            </div>
            <span className="profile-modal-eyebrow">
              Edit Profile
            </span>
            <h2>
              Change Username
            </h2>
            <p>
              Only your username can be updated. Email and account role cannot be changed.
            </p>
            <div className="profile-modal-field">
              <label htmlFor="profile-username">
                Username
              </label>
              <div className="profile-modal-input">
                <FaUser />
                <input
                  id="profile-username"
                  type="text"
                  value={
                    editedUsername
                  }
                  onChange={(event) => {
                    setEditedUsername(
                      event.target.value
                    );
                    setEditError(
                      ""
                    );
                  }}
                  placeholder="Enter username"
                  minLength={3}
                  maxLength={30}
                  autoFocus
                />
              </div>
            </div>
            {editError && (
              <div
                className="profile-modal-error"
                role="alert"
              >
                <span>
                  !
                </span>
                <p>
                  {editError}
                </p>
              </div>
            )}
            <div className="profile-modal-actions">
              <button
                type="button"
                className="profile-modal-cancel"
                onClick={() =>
                  setShowEdit(
                    false
                  )
                }
              >
                Cancel
              </button>
              <button
                type="submit"
                className="profile-modal-save"
              >
                Save Username
              </button>
            </div>
          </form>
        </div>
      )}
      {/* =====================================================
          ABOUT MODAL
      ===================================================== */}
      {showAbout && (
        <div
          className="profile-modal-overlay profile-about-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowAbout(
                false
              );
            }
          }}
        >
          <section className="profile-modal about-modal profile-about-modal">
            {/* =================================================
                CLOSE
            ================================================= */}
            <button
              type="button"
              className="profile-modal-close"
              onClick={() =>
                setShowAbout(
                  false
                )
              }
              aria-label="Close"
            >
              <FaTimes />
            </button>
            {/* =================================================
                HEADER
            ================================================= */}
            <div className="profile-about-header">
              <div className="profile-modal-icon about">
                <FaInfoCircle />
              </div>
              <div className="profile-about-header-content">
                <span className="profile-modal-eyebrow">
                  About Application
                </span>
                <h2>
                  HiDocs!
                </h2>
                <p>
                  HiDocs is a digital form platform designed
                  to make completing surveys, quizzes,
                  registrations, and other online forms
                  easier, faster, and more organized.
                </p>
              </div>
            </div>
            {/* =================================================
                TAGLINE
            ================================================= */}
            <div className="profile-about-tagline">
              <div className="profile-about-tagline-icon">
                <FaClipboardList />
              </div>
              <div>
                <span>
                  HiDocs Platform
                </span>
                <strong>
                  Simple forms, better results.
                </strong>
                <p>
                  Access forms, submit responses, and track
                  your activity from one simple platform.
                </p>
              </div>
            </div>
            {/* =================================================
                FEATURE HEADING
            ================================================= */}
            <div className="profile-about-section-heading">
              <span>
                User Features
              </span>
              <h3>
                What can you do with HiDocs?
              </h3>
              <p>
                Explore the main features available for HiDocs user accounts.
              </p>
            </div>
            {/* =================================================
                FEATURE GRID
            ================================================= */}
            <div className="profile-about-features">
              {/* ===============================================
                  SMART FORMS
              =============================================== */}
              <article className="profile-about-feature">
                <div className="profile-about-feature-icon blue">
                  <FaClipboardList />
                </div>
                <div>
                  <strong>
                    Smart Forms
                  </strong>
                  <span>
                    Complete surveys, quizzes,
                    registration forms, and other
                    digital forms easily.
                  </span>
                </div>
              </article>
              {/* ===============================================
                  QR CODE
              =============================================== */}
              <article className="profile-about-feature">
                <div className="profile-about-feature-icon purple">
                  <FaQrcode />
                </div>
                <div>
                  <strong>
                    QR Code Access
                  </strong>
                  <span>
                    Open private or limited forms
                    quickly by scanning a HiDocs QR Code.
                  </span>
                </div>
              </article>
              {/* ===============================================
                  RESPONSE TIMER
              =============================================== */}
              <article className="profile-about-feature">
                <div className="profile-about-feature-icon orange">
                  <FaStopwatch />
                </div>
                <div>
                  <strong>
                    Response Timer
                  </strong>
                  <span>
                    Complete timed forms with an
                    automatic countdown when enabled
                    by the administrator.
                  </span>
                </div>
              </article>
              {/* ===============================================
                  HISTORY
              =============================================== */}
              <article className="profile-about-feature">
                <div className="profile-about-feature-icon green">
                  <FaHistory />
                </div>
                <div>
                  <strong>
                    Submission History
                  </strong>
                  <span>
                    Review completed forms and
                    previous submission attempts from
                    your History page.
                  </span>
                </div>
              </article>
              {/* ===============================================
                  RESULT & SCORE
              =============================================== */}
              <article className="profile-about-feature">
                <div className="profile-about-feature-icon yellow">
                  <FaTrophy />
                </div>
                <div>
                  <strong>
                    Result & Score
                  </strong>
                  <span>
                    Review submitted answers and scores
                    when result access is enabled by
                    the administrator.
                  </span>
                </div>
              </article>
              {/* ===============================================
                  ONE TIME SUBMISSION
              =============================================== */}
              <article className="profile-about-feature">
                <div className="profile-about-feature-icon red">
                  <FaLock />
                </div>
                <div>
                  <strong>
                    One-Time Submission
                  </strong>
                  <span>
                    Forms can limit each account to one
                    submission to prevent duplicate
                    responses.
                  </span>
                </div>
              </article>
              {/* ===============================================
                  RANDOMIZATION
              =============================================== */}
              <article className="profile-about-feature">
                <div className="profile-about-feature-icon cyan">
                  <FaRandom />
                </div>
                <div>
                  <strong>
                    Randomized Questions
                  </strong>
                  <span>
                    Question and answer order can be
                    randomized for every respondent.
                  </span>
                </div>
              </article>
              {/* ===============================================
                  LIGHT / DARK MODE
              =============================================== */}
              <article className="profile-about-feature">
                <div className="profile-about-feature-icon dark">
                  <FaAdjust />
                </div>
                <div>
                  <strong>
                    Light & Dark Mode
                  </strong>
                  <span>
                    Switch between light and dark
                    interface modes based on your
                    preference.
                  </span>
                </div>
              </article>
            </div>
            {/* =================================================
                SECURITY
            ================================================= */}
            <div className="profile-about-security">
              <div className="profile-about-security-icon">
                <FaShieldAlt />
              </div>
              <div>
                <strong>
                  Secure Account Access
                </strong>
                <span>
                  Your submissions are associated with
                  your logged-in HiDocs account so
                  response history remains separated
                  between users.
                </span>
              </div>
            </div>
            {/* =================================================
                APPLICATION INFORMATION
            ================================================= */}
            <div className="profile-about-section-heading compact">
              <span>
                Application
              </span>
              <h3>
                App Information
              </h3>
            </div>
            <div className="profile-about-list">
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
                  Account Type
                </span>
                <strong>
                  User
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
            <div className="profile-about-footer">
              <div>
                <FaShieldAlt />
                <span>
                  HiDocs Digital Form Platform
                </span>
              </div>
              <button
                type="button"
                className="profile-modal-save"
                onClick={() =>
                  setShowAbout(
                    false
                  )
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
      {showLogout && (
        <div
          className="profile-modal-overlay"
          onMouseDown={(event) => {
            if (
              event.target ===
              event.currentTarget
            ) {
              setShowLogout(
                false
              );
            }
          }}
        >
          <section className="profile-modal logout-modal">
            <button
              type="button"
              className="profile-modal-close"
              onClick={() =>
                setShowLogout(
                  false
                )
              }
              aria-label="Close"
            >
              <FaTimes />
            </button>
            <div className="profile-modal-icon danger">
              <FaSignOutAlt />
            </div>
            <span className="profile-modal-eyebrow danger">
              Account Session
            </span>
            <h2>
              Sign Out?
            </h2>
            <p>
              You will need to enter your email
              and password again to access HiDocs.
            </p>
            <div className="profile-modal-actions">
              <button
                type="button"
                className="profile-modal-cancel"
                onClick={() =>
                  setShowLogout(
                    false
                  )
                }
              >
                Cancel
              </button>
              <button
                type="button"
                className="profile-modal-logout"
                onClick={
                  logout
                }
              >
                <FaSignOutAlt />
                Sign Out
              </button>
            </div>
          </section>
        </div>
      )}
      {/* =====================================================
          BOTTOM NAVIGATION
      ===================================================== */}
      <BottomNavigation
        active="profile"
      />
    </div>
  );
}
export default Profile;