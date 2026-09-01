import { loginUser } from '../api/authApi';

import {
  useEffect,
  useState,
} from "react";
import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  FaArrowRight,
  FaCheckCircle,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaFileAlt,
  FaLock,
  FaShieldAlt,
  FaSignInAlt,
  FaUser,
} from "react-icons/fa";
import background from "../assets/images/background.png";
import logo from "../assets/images/logo.png";
import "../assets/css/Login.css";
// =========================================================
// LOGIN
// =========================================================
function Login() {
  const navigate =
    useNavigate();
  const location =
    useLocation();
  // =========================================================
  // VERIFIED ACCOUNT FROM OTP PAGE
  // =========================================================
  const verifiedAccount =
    location.state?.verifiedAccount ||
    null;
  const verificationSuccess =
    location.state?.verificationSuccess ||
    false;
  // =========================================================
  // FORM STATE
  // =========================================================
  const [
    email,
    setEmail,
  ] = useState(
    verifiedAccount?.email ||
    ""
  );
  const [
    password,
    setPassword,
  ] = useState(
    ""
  );
  const [
    showPassword,
    setShowPassword,
  ] = useState(
    false
  );
  const [
    error,
    setError,
  ] = useState(
    ""
  );
  const [
    successMessage,
    setSuccessMessage,
  ] = useState(
    verificationSuccess
      ? "Email berhasil diverifikasi. Silakan login."
      : ""
  );
  const [
    isLoading,
    setIsLoading,
  ] = useState(
    false
  );
  // =========================================================
  // CLEAR NAVIGATION MESSAGE
  // =========================================================
  useEffect(
    () => {
      if (
        !verificationSuccess
      ) {
        return undefined;
      }
      const timer =
        window.setTimeout(
          () => {
            setSuccessMessage(
              ""
            );
          },
          5000
        );
      return () => {
        window.clearTimeout(
          timer
        );
      };
    },
    [
      verificationSuccess,
    ]
  );
  // =========================================================
  // INPUT CHANGE
  // =========================================================
  const handleEmailChange = (
    event
  ) => {
    setEmail(
      event.target.value
    );
    setError(
      ""
    );
  };
  const handlePasswordChange = (
    event
  ) => {
    setPassword(
      event.target.value
    );
    setError(
      ""
    );
  };
  // =========================================================
  // EMAIL VALIDATION
  // =========================================================
  const isValidEmail = (
    value
  ) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
      value
    );
  };
  // =========================================================
  // SAFE USERS READER
  // =========================================================
  const getStoredUsers =
    () => {
      try {
        const savedUsers =
          localStorage.getItem(
            "users"
          );
        if (
          !savedUsers
        ) {
          return [];
        }
        const parsedUsers =
          JSON.parse(
            savedUsers
          );
        return Array.isArray(
          parsedUsers
        )
          ? parsedUsers
          : [];
      } catch (error) {
        console.error(
          "Gagal membaca data users:",
          error
        );
        return [];
      }
    };
  // =========================================================
  // NORMALIZE USER SESSION
  // =========================================================
  const normalizeSessionUser = (
    user
  ) => {
    const cleanEmail =
      String(
        user?.email ||
        ""
      )
        .trim()
        .toLowerCase();
    const cleanUsername =
      String(
        user?.username ||
        user?.name ||
        cleanEmail
          .split("@")[0] ||
        "User"
      ).trim();
    return {
      ...user,
      id:
        user?.id ||
        cleanEmail ||
        `${cleanUsername}-${Date.now()}`,
      username:
        cleanUsername,
      name:
        user?.name ||
        cleanUsername,
      email:
        cleanEmail,
      role:
        user?.role ||
        "User",
    };
  };
  // =========================================================
  // CLEAR OLD SESSION BEFORE NEW LOGIN
  // =========================================================
  const clearPreviousSession =
    () => {
      localStorage.removeItem(
        "user"
      );
      localStorage.removeItem(
        "hidocs_user"
      );
      localStorage.removeItem(
        "currentUser"
      );
      localStorage.removeItem(
        "loggedInUser"
      );
      localStorage.removeItem(
        "isLoggedIn"
      );
  };
  // =========================================================
  // NOTIFY APPLICATION USER CHANGED
  // =========================================================
  const notifyUserChanged = (
    user
  ) => {
    window.dispatchEvent(
      new CustomEvent(
        "hidocs-user-changed",
        {
          detail: {
            user,
            userIdentity:
              user.email ||
              user.id ||
              user.username,
          },
        }
      )
    );
  };
  // =========================================================
  // LOGIN
  // =========================================================
  const handleLogin = async (
    event
  ) => {
    event.preventDefault();
    setError("");
    setSuccessMessage("");

    const cleanEmail = email.trim().toLowerCase();

    // =====================================================
    // VALIDATION
    // =====================================================
    if (!cleanEmail) {
      setError("Email harus diisi.");
      return;
    }
    if (!isValidEmail(cleanEmail)) {
      setError("Format email tidak valid.");
      return;
    }
    if (!password) {
      setError("Password harus diisi.");
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginUser({
        email: cleanEmail,
        password: password,
      });

      const apiUser = response.data.data.user;
      const token = response.data.data.token;

      const user = normalizeSessionUser(apiUser);

      clearPreviousSession();

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem(
        "hidocs_active_user_identity",
        String(user.email || user.id || user.username)
          .trim()
          .toLowerCase()
      );

      notifyUserChanged(user);

      // =====================================================
      // REDIRECT BASED ON ROLE
      // =====================================================
      navigate("/select-mode", { replace: true });
      
    } catch (loginError) {
      console.error("Login error:", loginError);
      setError(
        loginError.response?.data?.message ||
        "Email atau password salah."
      );
      setIsLoading(false);
    }
  };
  
  // =========================================================
  // KEYBOARD
  // =========================================================
  const handleKeyDown = (
    event
  ) => {
    if (
      event.key ===
      "Escape"
    ) {
      setEmail(
        ""
      );
      setPassword(
        ""
      );
      setError(
        ""
      );
      setSuccessMessage(
        ""
      );
    }
  };
  // =========================================================
  // RETURN
  // =========================================================
  return (
    <div
      className="login-page"
      style={{
        backgroundImage: `url(${background})`,
      }}
      onKeyDown={
        handleKeyDown
      }
    >
      {/* =====================================================
          BACKGROUND OVERLAY
      ===================================================== */}
      <div className="login-background-overlay"></div>
      {/* =====================================================
          LOGIN CONTAINER
      ===================================================== */}
      <main className="login-container">
        {/* ===================================================
            BRAND PANEL
        =================================================== */}
        <section className="login-brand-panel">
          <div className="login-brand-decoration">
            <span className="login-circle circle-one"></span>
            <span className="login-circle circle-two"></span>
            <div className="login-brand-dots">
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
          <div className="login-brand-content">
            <div className="login-brand">
              <div className="login-logo-wrapper">
                <img
                  src={
                    logo
                  }
                  alt="HiDocs Logo"
                  className="login-logo"
                />
              </div>
              <span>
                HiDocs!
              </span>
            </div>
            <div className="login-brand-message">
              <span className="login-brand-badge">
                Digital Form Platform
              </span>
              <h1>
                Create smarter forms
                with HiDocs.
              </h1>
              <p>
                Build surveys, quizzes,
                registration forms, and manage
                responses in one simple platform.
              </p>
            </div>
            <div className="login-feature-list">
              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <FaFileAlt />
                </div>
                <div>
                  <strong>
                    Flexible Form Builder
                  </strong>
                  <span>
                    Create different types of questions easily.
                  </span>
                </div>
              </div>
              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <FaCheckCircle />
                </div>
                <div>
                  <strong>
                    Real-time Responses
                  </strong>
                  <span>
                    Review and manage submitted responses.
                  </span>
                </div>
              </div>
              <div className="login-feature-item">
                <div className="login-feature-icon">
                  <FaShieldAlt />
                </div>
                <div>
                  <strong>
                    Secure Access
                  </strong>
                  <span>
                    Separate access for users and administrators.
                  </span>
                </div>
              </div>
            </div>
          </div>
          <div className="login-brand-footer">
            <span>
              © 2026 HiDocs
            </span>
            <span>
              Simple forms, better results.
            </span>
          </div>
        </section>
        {/* ===================================================
            FORM PANEL
        =================================================== */}
        <section className="login-form-panel">
          <div className="login-mobile-brand">
            <div className="login-mobile-logo">
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
          <div className="login-form-card">
            <div className="login-form-header">
              <span className="login-form-eyebrow">
                Welcome Back
              </span>
              <h2>
                Sign in to your account
              </h2>
              <p>
                Enter your email and password
                to continue to HiDocs.
              </p>
            </div>
            {/* =================================================
                LOGIN FORM
            ================================================= */}
            <form
              className="login-form"
              onSubmit={
                handleLogin
              }
            >
              {/* ===============================================
                  EMAIL
              =============================================== */}
              <div className="login-form-group">
                <label htmlFor="email">
                  Email Address
                </label>
                <div className="login-input-wrapper">
                  <FaEnvelope className="login-input-icon" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={
                      email
                    }
                    onChange={
                      handleEmailChange
                    }
                    placeholder="example@hidocs.com"
                    autoComplete="email"
                    disabled={
                      isLoading
                    }
                  />
                </div>
              </div>
              {/* ===============================================
                  PASSWORD
              =============================================== */}
              <div className="login-form-group">
                <label htmlFor="password">
                  Password
                </label>
                <div className="login-input-wrapper">
                  <FaLock className="login-input-icon" />
                  <input
                    id="password"
                    name="password"
                    type={
                      showPassword
                        ? "text"
                        : "password"
                    }
                    value={
                      password
                    }
                    onChange={
                      handlePasswordChange
                    }
                    placeholder="Enter your password"
                    autoComplete="current-password"
                    disabled={
                      isLoading
                    }
                  />
                  <button
                    type="button"
                    className="login-eye-btn"
                    onClick={() =>
                      setShowPassword(
                        (
                          previous
                        ) =>
                          !previous
                      )
                    }
                    aria-label={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                    title={
                      showPassword
                        ? "Hide password"
                        : "Show password"
                    }
                  >
                    {showPassword
                      ? <FaEye />
                      : <FaEyeSlash />
                    }
                  </button>
                </div>
              </div>
              {/* ===============================================
                  SUCCESS MESSAGE
              =============================================== */}
              {successMessage && (
                <div
                  className="login-success-message"
                  role="status"
                >
                  <FaCheckCircle />
                  <span>
                    {successMessage}
                  </span>
                </div>
              )}
              {/* ===============================================
                  ERROR MESSAGE
              =============================================== */}
              {error && (
                <div
                  className="login-error-message"
                  role="alert"
                >
                  <span className="login-error-icon">
                    !
                  </span>
                  <span>
                    {error}
                  </span>
                </div>
              )}
              {/* ===============================================
                  LOGIN BUTTON
              =============================================== */}
              <button
                type="submit"
                className="login-btn"
                disabled={
                  isLoading
                }
              >
                {isLoading ? (
                  <>
                    <span className="login-loading-spinner"></span>
                    <span>
                      Signing In...
                    </span>
                  </>
                ) : (
                  <>
                    <FaSignInAlt />
                    <span>
                      Sign In
                    </span>
                    <FaArrowRight className="login-btn-arrow" />
                  </>
                )}
              </button>
            </form>
            {/* =================================================
                DIVIDER
            ================================================= */}
            <div className="login-divider">
              <span></span>
              <p>
                New to HiDocs?
              </p>
              <span></span>
            </div>
            {/* =================================================
                REGISTER
            ================================================= */}
            <Link
              to="/register"
              className="login-register-btn"
            >
              <FaUser />
              <span>
                Create New Account
              </span>
            </Link>
            {/* =================================================
                SECURITY INFORMATION
            ================================================= */}
            <div className="login-security-info">
              <FaShieldAlt />
              <span>
                Your account information is
                securely stored on this device.
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
export default Login;