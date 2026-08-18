import {
  useState,
} from "react";
import {
  Link,
  useNavigate,
} from "react-router-dom";
import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaChevronDown,
  FaEnvelope,
  FaEye,
  FaEyeSlash,
  FaFileAlt,
  FaLock,
  FaShieldAlt,
  FaUser,
  FaUserPlus,
} from "react-icons/fa";
import background from "../assets/images/background.png";
import logo from "../assets/images/logo.png";
import "../assets/css/Register.css";
function Register() {
  const navigate =
    useNavigate();
  // =========================================================
  // FORM STATE
  // =========================================================
  const [
    email,
    setEmail,
  ] = useState("");
  const [
    username,
    setUsername,
  ] = useState("");
  const [
    password,
    setPassword,
  ] = useState("");
  const [
    role,
    setRole,
  ] = useState("User");
  const [
    showPassword,
    setShowPassword,
  ] = useState(false);
  const [
    error,
    setError,
  ] = useState("");
  const [
    isLoading,
    setIsLoading,
  ] = useState(false);
  // =========================================================
  // INPUT HANDLERS
  // =========================================================
  const handleEmailChange = (
    event
  ) => {
    setEmail(
      event.target.value
    );
    setError("");
  };
  const handleUsernameChange = (
    event
  ) => {
    setUsername(
      event.target.value
    );
    setError("");
  };
  const handlePasswordChange = (
    event
  ) => {
    setPassword(
      event.target.value
    );
    setError("");
  };
  const handleRoleChange = (
    event
  ) => {
    setRole(
      event.target.value
    );
    setError("");
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
  // REGISTER
  // =========================================================
  const handleRegister = (
    event
  ) => {
    event.preventDefault();
    if (isLoading) {
      return;
    }
    setError("");
    const cleanEmail =
      email.trim();
    const cleanUsername =
      username.trim();
    // =======================================================
    // REQUIRED VALIDATION
    // =======================================================
    if (
      !cleanEmail ||
      !cleanUsername ||
      !password
    ) {
      setError(
        "Semua field harus diisi."
      );
      return;
    }
    // =======================================================
    // EMAIL VALIDATION
    // =======================================================
    if (
      !isValidEmail(
        cleanEmail
      )
    ) {
      setError(
        "Format email tidak valid."
      );
      return;
    }
    // =======================================================
    // USERNAME VALIDATION
    // =======================================================
    if (
      cleanUsername.length < 3
    ) {
      setError(
        "Username minimal 3 karakter."
      );
      return;
    }
    if (
      cleanUsername.length > 30
    ) {
      setError(
        "Username maksimal 30 karakter."
      );
      return;
    }
    // =======================================================
    // PASSWORD VALIDATION
    // =======================================================
    if (
      password.length < 6
    ) {
      setError(
        "Password minimal 6 karakter."
      );
      return;
    }
    setIsLoading(true);
    // =======================================================
    // DATA SIMULASI REGISTRASI
    // Belum disimpan ke database atau localStorage
    // =======================================================
    const registrationData = {
      email:
        cleanEmail,
      username:
        cleanUsername,
      password,
      role,
    };
    // =======================================================
    // PINDAH KE VERIFY OTP
    // =======================================================
    navigate(
      "/verify-otp",
      {
        state: {
          email:
            cleanEmail,
          registrationData,
        },
      }
    );
  };
  // =========================================================
  // CLEAR FORM WITH ESCAPE
  // =========================================================
  const handleKeyDown = (
    event
  ) => {
    if (
      event.key === "Escape"
    ) {
      setEmail("");
      setUsername("");
      setPassword("");
      setRole("User");
      setError("");
      setIsLoading(false);
    }
  };
  // =========================================================
  // RETURN
  // =========================================================
  return (
    <div
      className="register-page"
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
      <div className="register-background-overlay"></div>
      {/* =====================================================
          REGISTER CONTAINER
      ===================================================== */}
      <main className="register-container">
        {/* ===================================================
            BRAND PANEL
        =================================================== */}
        <section className="register-brand-panel">
          <div className="register-brand-decoration">
            <span className="register-circle circle-one"></span>
            <span className="register-circle circle-two"></span>
            <div className="register-brand-dots">
              {Array.from({
                length: 12,
              }).map(
                (
                  _,
                  index
                ) => (
                  <span
                    key={index}
                  ></span>
                )
              )}
            </div>
          </div>
          <div className="register-brand-content">
            {/* BRAND */}
            <div className="register-brand">
              <div className="register-logo-wrapper">
                <img
                  src={logo}
                  alt="HiDocs Logo"
                  className="register-logo"
                />
              </div>
              <span>
                HiDocs!
              </span>
            </div>
            {/* BRAND MESSAGE */}
            <div className="register-brand-message">
              <span className="register-brand-badge">
                Start With HiDocs
              </span>
              <h1>
                Create forms and
                manage responses easily.
              </h1>
              <p>
                Register your account to start
                creating surveys, quizzes,
                registrations, and digital forms.
              </p>
            </div>
            {/* FEATURE LIST */}
            <div className="register-feature-list">
              <div className="register-feature-item">
                <div className="register-feature-icon">
                  <FaFileAlt />
                </div>
                <div>
                  <strong>
                    Modern Form Builder
                  </strong>
                  <span>
                    Build forms with multiple question types.
                  </span>
                </div>
              </div>
              <div className="register-feature-item">
                <div className="register-feature-icon">
                  <FaCheckCircle />
                </div>
                <div>
                  <strong>
                    Easy Form Management
                  </strong>
                  <span>
                    Track forms and responses from one dashboard.
                  </span>
                </div>
              </div>
              <div className="register-feature-item">
                <div className="register-feature-icon">
                  <FaShieldAlt />
                </div>
                <div>
                  <strong>
                    Email Verification
                  </strong>
                  <span>
                    Verify your email before activating your account.
                  </span>
                </div>
              </div>
            </div>
          </div>
          {/* BRAND FOOTER */}
          <div className="register-brand-footer">
            <span>
              © 2026 HiDocs
            </span>
            <span>
              Create, share, and collect.
            </span>
          </div>
        </section>
        {/* ===================================================
            FORM PANEL
        =================================================== */}
        <section className="register-form-panel">
          {/* =================================================
              MOBILE HEADER
          ================================================= */}
          <div className="register-mobile-header">
            <Link
              to="/login"
              className="register-mobile-back"
              title="Back to login"
            >
              <FaArrowLeft />
            </Link>
            <div className="register-mobile-brand">
              <div className="register-mobile-logo">
                <img
                  src={logo}
                  alt="HiDocs Logo"
                />
              </div>
              <span>
                HiDocs!
              </span>
            </div>
            <div className="register-mobile-spacer"></div>
          </div>
          {/* =================================================
              FORM CARD
          ================================================= */}
          <div className="register-form-card">
            {/* DESKTOP BACK */}
            <Link
              to="/login"
              className="register-back-link"
            >
              <FaArrowLeft />
              <span>
                Back to Sign In
              </span>
            </Link>
            {/* FORM HEADER */}
            <div className="register-form-header">
              <span className="register-form-eyebrow">
                Create Account
              </span>
              <h2>
                Join HiDocs today
              </h2>
              <p>
                Complete the information below.
                After registration, verify your
                email using the four-digit OTP code.
              </p>
            </div>
            {/* =================================================
                REGISTER FORM
            ================================================= */}
            <form
              className="register-form"
              onSubmit={
                handleRegister
              }
            >
              {/* EMAIL */}
              <div className="register-form-group">
                <label htmlFor="register-email">
                  Email Address
                </label>
                <div className="register-input-wrapper">
                  <FaEnvelope className="register-input-icon" />
                  <input
                    id="register-email"
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
              {/* USERNAME */}
              <div className="register-form-group">
                <label htmlFor="register-username">
                  Username
                </label>
                <div className="register-input-wrapper">
                  <FaUser className="register-input-icon" />
                  <input
                    id="register-username"
                    name="username"
                    type="text"
                    value={
                      username
                    }
                    onChange={
                      handleUsernameChange
                    }
                    placeholder="Choose a username"
                    autoComplete="username"
                    minLength={3}
                    maxLength={30}
                    disabled={
                      isLoading
                    }
                  />
                </div>
              </div>
              {/* PASSWORD */}
              <div className="register-form-group">
                <div className="register-label-row">
                  <label htmlFor="register-password">
                    Password
                  </label>
                  <span>
                    Minimum 6 characters
                  </span>
                </div>
                <div className="register-input-wrapper">
                  <FaLock className="register-input-icon" />
                  <input
                    id="register-password"
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
                    autoComplete="new-password"
                    minLength={6}
                    disabled={
                      isLoading
                    }
                  />
                  <button
                    type="button"
                    className="register-eye-btn"
                    onClick={() =>
                      setShowPassword(
                        (previous) =>
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
                    disabled={
                      isLoading
                    }
                  >
                    {showPassword
                      ? <FaEye />
                      : <FaEyeSlash />
                    }
                  </button>
                </div>
              </div>
              {/* ROLE */}
              <div className="register-form-group">
                <label htmlFor="register-role">
                  Role
                </label>
                <div className="register-select-wrapper">
                  <FaShieldAlt className="register-input-icon" />
                  <select
                    id="register-role"
                    name="role"
                    value={
                      role
                    }
                    onChange={
                      handleRoleChange
                    }
                    disabled={
                      isLoading
                    }
                  >
                    <option value="User">
                      User
                    </option>
                    <option value="Admin">
                      Admin
                    </option>
                  </select>
                  <FaChevronDown className="register-select-arrow" />
                </div>
              </div>
              {/* ERROR MESSAGE */}
              {error && (
                <div
                  className="register-error-message"
                  role="alert"
                >
                  <span className="register-error-icon">
                    !
                  </span>
                  <span>
                    {error}
                  </span>
                </div>
              )}
              {/* REGISTER BUTTON */}
              <button
                type="submit"
                className="register-btn"
                disabled={
                  isLoading
                }
              >
                {isLoading ? (
                  <>
                    <span className="register-loading-spinner"></span>
                    <span>
                      Preparing Verification...
                    </span>
                  </>
                ) : (
                  <>
                    <FaUserPlus />
                    <span>
                      Create Account
                    </span>
                    <FaArrowRight className="register-btn-arrow" />
                  </>
                )}
              </button>
            </form>
            {/* =================================================
                DIVIDER
            ================================================= */}
            <div className="register-divider">
              <span></span>
              <p>
                Already registered?
              </p>
              <span></span>
            </div>
            {/* =================================================
                LOGIN BUTTON
            ================================================= */}
            <Link
              to="/login"
              className="register-login-btn"
            >
              <FaUser />
              <span>
                Sign In to Your Account
              </span>
            </Link>
            {/* =================================================
                SECURITY INFORMATION
            ================================================= */}
            <div className="register-security-info">
              <FaShieldAlt />
              <span>
                After creating your account,
                you will be asked to enter a
                four-digit OTP verification code.
              </span>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
export default Register;