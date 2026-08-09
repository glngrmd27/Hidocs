import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaCheckCircle,
  FaEnvelope,
  FaLock,
  FaPaperPlane,
  FaRedoAlt,
  FaShieldAlt,
} from "react-icons/fa";

import logo from "../assets/images/logo.png";

import "../assets/css/VerifyOtp.css";


function VerifyOtp() {

  const navigate =
    useNavigate();


  const location =
    useLocation();


  // =========================================================
  // OTP CONFIGURATION
  // =========================================================

  const OTP_LENGTH = 4;


  // =========================================================
  // REGISTRATION DATA FROM REGISTER PAGE
  // =========================================================

  const registrationData =
    location.state?.registrationData || null;


  const email =
    registrationData?.email ||
    location.state?.email ||
    "";


  // =========================================================
  // OTP STATE
  // =========================================================

  const [
    otpValues,
    setOtpValues,
  ] = useState(
    Array(
      OTP_LENGTH
    ).fill("")
  );


  // =========================================================
  // PAGE STATE
  // =========================================================

  const [
    error,
    setError,
  ] = useState("");


  const [
    successMessage,
    setSuccessMessage,
  ] = useState("");


  const [
    resendMessage,
    setResendMessage,
  ] = useState("");


  const [
    isVerifying,
    setIsVerifying,
  ] = useState(false);


  const [
    resendCountdown,
    setResendCountdown,
  ] = useState(30);


  // =========================================================
  // INPUT REFERENCES
  // =========================================================

  const inputRefs =
    useRef([]);


  // =========================================================
  // CHECK REGISTRATION DATA
  // =========================================================

  useEffect(() => {

    if (!registrationData) {

      setError(
        "Data registrasi tidak ditemukan. Silakan daftar ulang."
      );

    }

  }, [
    registrationData,
  ]);


  // =========================================================
  // AUTO FOCUS FIRST INPUT
  // =========================================================

  useEffect(() => {

    const focusTimer =
      window.setTimeout(() => {

        inputRefs.current[0]
          ?.focus();

      }, 150);


    return () => {

      window.clearTimeout(
        focusTimer
      );

    };

  }, []);


  // =========================================================
  // RESEND COUNTDOWN
  // =========================================================

  useEffect(() => {

    if (
      resendCountdown <= 0
    ) {

      return undefined;

    }


    const timer =
      window.setInterval(() => {

        setResendCountdown(
          (previous) =>
            previous > 0
              ? previous - 1
              : 0
        );

      }, 1000);


    return () => {

      window.clearInterval(
        timer
      );

    };

  }, [
    resendCountdown,
  ]);


  // =========================================================
  // MASK EMAIL
  // =========================================================

  const maskEmail = (
    emailValue
  ) => {

    if (!emailValue) {

      return "email tidak tersedia";

    }


    const [
      usernamePart,
      domainPart,
    ] = emailValue.split("@");


    if (
      !usernamePart ||
      !domainPart
    ) {

      return emailValue;

    }


    const visiblePart =
      usernamePart.length <= 2
        ? usernamePart.charAt(0)
        : usernamePart.slice(
            0,
            2
          );


    const hiddenLength =
      Math.max(
        usernamePart.length -
          visiblePart.length,
        3
      );


    return `${visiblePart}${"*".repeat(
      hiddenLength
    )}@${domainPart}`;

  };


  // =========================================================
  // OTP VALUE
  // =========================================================

  const otpCode =
    otpValues.join("");


  // =========================================================
  // HANDLE OTP CHANGE
  // =========================================================

  const handleOtpChange = (
    index,
    event
  ) => {

    const value =
      event.target.value
        .replace(/\D/g, "")
        .slice(-1);


    const updatedOtp = [
      ...otpValues,
    ];


    updatedOtp[index] =
      value;


    setOtpValues(
      updatedOtp
    );


    setError("");

    setSuccessMessage("");

    setResendMessage("");


    if (
      value &&
      index <
        OTP_LENGTH - 1
    ) {

      inputRefs.current[
        index + 1
      ]?.focus();

    }

  };


  // =========================================================
  // HANDLE KEYBOARD
  // =========================================================

  const handleOtpKeyDown = (
    index,
    event
  ) => {

    if (
      event.key === "Backspace" &&
      !otpValues[index] &&
      index > 0
    ) {

      inputRefs.current[
        index - 1
      ]?.focus();

    }


    if (
      event.key === "ArrowLeft" &&
      index > 0
    ) {

      event.preventDefault();


      inputRefs.current[
        index - 1
      ]?.focus();

    }


    if (
      event.key === "ArrowRight" &&
      index <
        OTP_LENGTH - 1
    ) {

      event.preventDefault();


      inputRefs.current[
        index + 1
      ]?.focus();

    }

  };


  // =========================================================
  // HANDLE PASTE
  // =========================================================

  const handleOtpPaste = (
    event
  ) => {

    event.preventDefault();


    const pastedValue =
      event.clipboardData
        .getData("text")
        .replace(/\D/g, "")
        .slice(
          0,
          OTP_LENGTH
        );


    if (!pastedValue) {

      return;

    }


    const updatedOtp =
      Array(
        OTP_LENGTH
      ).fill("");


    pastedValue
      .split("")
      .forEach(
        (
          number,
          index
        ) => {

          updatedOtp[index] =
            number;

        }
      );


    setOtpValues(
      updatedOtp
    );


    setError("");

    setSuccessMessage("");

    setResendMessage("");


    const lastInputIndex =
      Math.min(
        pastedValue.length,
        OTP_LENGTH
      ) - 1;


    inputRefs.current[
      lastInputIndex
    ]?.focus();

  };


  // =========================================================
  // SAVE VERIFIED USER
  // =========================================================

  const saveVerifiedUser = () => {

    if (!registrationData) {

      setError(
        "Data registrasi tidak ditemukan. Silakan daftar ulang."
      );

      return false;

    }


    try {

      const savedUsers =
        localStorage.getItem(
          "users"
        );


      const users =
        savedUsers
          ? JSON.parse(savedUsers)
          : [];


      const cleanEmail =
        registrationData.email
          ?.trim()
          .toLowerCase();


      const cleanUsername =
        registrationData.username
          ?.trim()
          .toLowerCase();


      const verifiedUser = {

        id:
          registrationData.id ||
          Date.now(),

        email:
          registrationData.email
            ?.trim(),

        username:
          registrationData.username
            ?.trim(),

        name:
          registrationData.name ||
          registrationData.username
            ?.trim(),

        password:
          registrationData.password,

        role:
          registrationData.role ||
          "User",

        emailVerified:
          true,

        verifiedAt:
          new Date().toISOString(),

        createdAt:
          registrationData.createdAt ||
          new Date().toISOString(),

      };


      // Cari akun dengan email atau username yang sama

      const existingUserIndex =
        users.findIndex(
          (user) => {

            const savedEmail =
              user.email
                ?.trim()
                .toLowerCase();


            const savedUsername =
              user.username
                ?.trim()
                .toLowerCase();


            return (
              savedEmail === cleanEmail ||
              savedUsername === cleanUsername
            );

          }
        );


      let updatedUsers = [
        ...users,
      ];


      // Jika sudah ada, perbarui datanya

      if (
        existingUserIndex !== -1
      ) {

        updatedUsers[
          existingUserIndex
        ] = {

          ...updatedUsers[
            existingUserIndex
          ],

          ...verifiedUser,

        };

      } else {

        // Jika belum ada, tambahkan akun baru

        updatedUsers = [

          ...updatedUsers,

          verifiedUser,

        ];

      }


      localStorage.setItem(

        "users",

        JSON.stringify(
          updatedUsers
        )

      );


      return true;

    } catch (saveError) {

      console.error(
        "Gagal menyimpan akun:",
        saveError
      );


      setError(
        "Terjadi kesalahan saat menyimpan akun."
      );


      return false;

    }

  };


  // =========================================================
  // VERIFY OTP
  // =========================================================

  const handleVerifyOtp = (
    event
  ) => {

    event.preventDefault();


    if (isVerifying) {

      return;

    }


    setError("");

    setSuccessMessage("");

    setResendMessage("");


    if (!registrationData) {

      setError(
        "Data registrasi tidak ditemukan. Silakan daftar ulang."
      );

      return;

    }


    if (
      otpCode.length !==
      OTP_LENGTH
    ) {

      setError(
        "Masukkan kode OTP 4 digit."
      );

      return;

    }


    if (
      !/^\d{4}$/.test(
        otpCode
      )
    ) {

      setError(
        "Kode OTP hanya boleh berisi angka."
      );

      return;

    }


    setIsVerifying(true);


    // =======================================================
    // FRONTEND SIMULATION
    // Semua kode angka 4 digit dianggap benar
    // =======================================================

    window.setTimeout(() => {

      const accountSaved =
        saveVerifiedUser();


      if (!accountSaved) {

        setIsVerifying(false);

        return;

      }


      setIsVerifying(false);


      setSuccessMessage(
        "Email berhasil diverifikasi. Akun kamu sudah aktif."
      );


      window.setTimeout(() => {

        navigate(
          "/login",
          {
            replace: true,

            state: {

              verificationSuccess:
                true,

              email:
                registrationData.email,

            },

          }
        );

      }, 1500);

    }, 800);

  };


  // =========================================================
  // RESEND OTP
  // =========================================================

  const handleResendOtp = () => {

    if (
      resendCountdown > 0
    ) {

      return;

    }


    setOtpValues(
      Array(
        OTP_LENGTH
      ).fill("")
    );


    setError("");

    setSuccessMessage("");


    setResendMessage(
      "Kode OTP baru berhasil dikirim ke email kamu."
    );


    setResendCountdown(30);


    window.setTimeout(() => {

      inputRefs.current[0]
        ?.focus();

    }, 100);

  };


  // =========================================================
  // BACK TO REGISTER
  // =========================================================

  const handleBackToRegister =
    () => {

      navigate(
        "/register"
      );

    };


  // =========================================================
  // RETURN
  // =========================================================

  return (

    <div className="verify-otp-page">


      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}

      <div className="verify-page-decoration">


        <span className="verify-page-circle circle-one"></span>

        <span className="verify-page-circle circle-two"></span>


        <div className="verify-page-dots">

          {Array.from({
            length: 16,
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



      {/* =====================================================
          VERIFY CONTAINER
      ===================================================== */}

      <main className="verify-otp-container">


        {/* ===================================================
            BRAND
        =================================================== */}

        <div className="verify-brand">


          <div className="verify-logo-wrapper">

            <img
              src={logo}
              alt="HiDocs Logo"
            />

          </div>


          <span>
            HiDocs!
          </span>


        </div>



        {/* ===================================================
            VERIFY CARD
        =================================================== */}

        <section className="verify-otp-card">


          {/* BACK BUTTON */}

          <button
            type="button"
            className="verify-back-btn"
            onClick={
              handleBackToRegister
            }
          >

            <FaArrowLeft />

            <span>
              Back
            </span>

          </button>



          {/* MAIN ICON */}

          <div className="verify-main-icon">

            <FaEnvelope />


            <span className="verify-icon-badge">

              <FaLock />

            </span>

          </div>



          {/* HEADER */}

          <div className="verify-header">


            <span className="verify-eyebrow">

              Email Verification

            </span>


            <h1>
              Verify your email
            </h1>


            <p>

              We sent a 4-digit verification
              code to

              <strong>

                {maskEmail(
                  email
                )}

              </strong>

            </p>


          </div>



          {/* =================================================
              OTP FORM
          ================================================= */}

          <form
            className="verify-otp-form"
            onSubmit={
              handleVerifyOtp
            }
          >


            <label>
              Enter verification code
            </label>


            <div
              className="verify-otp-inputs"
              onPaste={
                handleOtpPaste
              }
            >

              {otpValues.map(
                (
                  value,
                  index
                ) => (

                  <input
                    key={index}
                    ref={(element) => {

                      inputRefs.current[index] =
                        element;

                    }}
                    type="text"
                    inputMode="numeric"
                    autoComplete={
                      index === 0
                        ? "one-time-code"
                        : "off"
                    }
                    maxLength={1}
                    value={
                      value
                    }
                    onChange={(event) =>
                      handleOtpChange(
                        index,
                        event
                      )
                    }
                    onKeyDown={(event) =>
                      handleOtpKeyDown(
                        index,
                        event
                      )
                    }
                    disabled={
                      isVerifying ||
                      Boolean(
                        successMessage
                      ) ||
                      !registrationData
                    }
                    aria-label={
                      `OTP digit ${index + 1}`
                    }
                  />

                )
              )}

            </div>



            {/* ERROR MESSAGE */}

            {error && (

              <div
                className="verify-message error"
                role="alert"
              >

                <span>
                  !
                </span>

                <p>
                  {error}
                </p>

              </div>

            )}



            {/* RESEND MESSAGE */}

            {resendMessage && (

              <div
                className="verify-message success"
                role="status"
              >

                <FaCheckCircle />

                <p>
                  {resendMessage}
                </p>

              </div>

            )}



            {/* SUCCESS MESSAGE */}

            {successMessage && (

              <div
                className="verify-message success"
                role="status"
              >

                <FaCheckCircle />

                <p>
                  {successMessage}
                </p>

              </div>

            )}



            {/* VERIFY BUTTON */}

            <button
              type="submit"
              className="verify-submit-btn"
              disabled={
                isVerifying ||
                Boolean(
                  successMessage
                ) ||
                !registrationData
              }
            >

              {isVerifying ? (

                <>

                  <span className="verify-button-spinner"></span>

                  <span>
                    Verifying...
                  </span>

                </>

              ) : (

                <>

                  <FaShieldAlt />

                  <span>
                    Verify OTP
                  </span>

                </>

              )}

            </button>


          </form>



          {/* =================================================
              RESEND
          ================================================= */}

          <div className="verify-resend-section">


            <p>
              Didn't receive the code?
            </p>


            <button
              type="button"
              className="verify-resend-btn"
              onClick={
                handleResendOtp
              }
              disabled={
                resendCountdown > 0 ||
                !registrationData
              }
            >

              {resendCountdown > 0 ? (

                <span>

                  Resend in
                  {" "}
                  {resendCountdown}s

                </span>

              ) : (

                <>

                  <FaRedoAlt />

                  <span>
                    Resend Code
                  </span>

                </>

              )}

            </button>


          </div>



          {/* =================================================
              SIMULATION INFORMATION
          ================================================= */}

          <div className="verify-security-info">


            <FaPaperPlane />


            <p>

              This is a frontend OTP simulation.
              Enter any four-digit number to
              complete verification.

            </p>


          </div>


        </section>


      </main>


    </div>

  );

}


export default VerifyOtp;