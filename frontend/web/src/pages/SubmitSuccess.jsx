import {
  useContext,
  useMemo,
} from "react";
import {
  useLocation,
  useNavigate,
} from "react-router-dom";
import {
  FaArrowRight,
  FaCheck,
  FaCheckCircle,
  FaClipboardCheck,
  FaEye,
  FaHome,
  FaShieldAlt,
  FaTrophy,
} from "react-icons/fa";
import {
  ThemeContext,
} from "../context/ThemeContext";
import {
  FormContext,
} from "../context/FormContext";
import "../assets/css/SubmitSuccess.css";
// =========================================================
// NORMALIZE RESULT MODE
// =========================================================
const normalizeResultMode = (
  value
) => {
  const normalizedValue =
    String(
      value ||
      ""
    )
      .trim()
      .toLowerCase();
  if (
    normalizedValue ===
      "score" ||
    normalizedValue ===
      "show-score" ||
    normalizedValue ===
      "show-result-and-score" ||
    normalizedValue ===
      "result-score"
  ) {
    return "score";
  }
  if (
    normalizedValue ===
      "result" ||
    normalizedValue ===
      "show-result" ||
    normalizedValue ===
      "show-result-only"
  ) {
    return "result";
  }
  return "none";
};
// =========================================================
// SUBMIT SUCCESS
// =========================================================
function SubmitSuccess() {
  const navigate =
    useNavigate();
  const location =
    useLocation();
  const {
    darkMode,
  } = useContext(
    ThemeContext
  );
  const {
    submittedForms = [],
    getUserSubmissionByForm,
    getFormById,
  } = useContext(
    FormContext
  );
  // =========================================================
  // ROUTE STATE
  // =========================================================
  const routeState =
    location.state ||
    {};
  const formId =
    routeState.formId ??
    null;
  // =========================================================
  // GET FORM
  // =========================================================
  const selectedForm =
    useMemo(
      () => {
        if (!formId) {
          return null;
        }
        if (
          typeof getFormById ===
          "function"
        ) {
          return (
            getFormById(
              formId
            ) ||
            null
          );
        }
        return null;
      },
      [
        formId,
        getFormById,
      ]
    );
  // =========================================================
  // GET SUBMISSION
  // =========================================================
  const submission =
    useMemo(
      () => {
        /*
          Prioritas pertama:
          submission yang dikirim langsung lewat navigate state.
        */
        if (
          routeState.submission &&
          typeof routeState.submission ===
            "object"
        ) {
          return routeState.submission;
        }
        /*
          Prioritas kedua:
          gunakan helper FormContext.
        */
        if (
          formId &&
          typeof getUserSubmissionByForm ===
            "function"
        ) {
          const foundSubmission =
            getUserSubmissionByForm(
              formId
            );
          if (
            foundSubmission
          ) {
            return foundSubmission;
          }
        }
        /*
          Fallback:
          cari langsung dari submittedForms.
        */
        if (!formId) {
          return null;
        }
        const matchingSubmissions =
          submittedForms.filter(
            (
              item
            ) => {
              const submissionFormId =
                item.formId ??
                item.id;
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
        if (
          matchingSubmissions.length ===
          0
        ) {
          return null;
        }
        return matchingSubmissions[
          matchingSubmissions.length -
          1
        ];
      },
      [
        routeState.submission,
        formId,
        getUserSubmissionByForm,
        submittedForms,
      ]
    );
  // =========================================================
  // FORM INFORMATION
  // =========================================================
  const formTitle =
    routeState.formTitle ||
    submission?.title ||
    selectedForm?.title ||
    "Form";
  const resultMode =
    normalizeResultMode(
      routeState.resultMode ||
      submission?.resultMode ||
      selectedForm?.settings
        ?.resultMode ||
      selectedForm?.resultMode
    );
  // =========================================================
  // SCORE INFORMATION
  // =========================================================
  const score =
    Number(
      submission?.score ??
      routeState.score
    ) || 0;
  const maxScore =
    Number(
      submission?.maxScore ??
      routeState.maxScore
    ) || 0;
  const correctAnswers =
    Number(
      submission?.correctAnswers
    ) || 0;
  const scoredQuestions =
    Number(
      submission?.scoredQuestions
    ) || 0;
  const percentage =
    maxScore >
      0
      ? Math.round(
          (
            score /
            maxScore
          ) *
          100
        )
      : Number(
          submission?.percentage
        ) || 0;
  // =========================================================
  // RESULT ACCESS
  // =========================================================
  const canViewResult =
    resultMode ===
      "result" ||
    resultMode ===
      "score";
  const canViewScore =
    resultMode ===
    "score";
  // =========================================================
  // BACK TO DASHBOARD
  // =========================================================
  const backToDashboard =
    () => {
      navigate(
        "/dashboard",
        {
          replace: true,
        }
      );
    };
  // =========================================================
  // VIEW RESULT
  // =========================================================
  const viewResult =
    () => {
      if (!formId) {
        alert(
          "Data form tidak ditemukan."
        );
        return;
      }
      /*
        Route user result.
        Nanti file result user akan membaca:
        - formId
        - resultMode
        - submissionId
        dari URL / state.
      */
      navigate(
        `/form-result/${formId}`,
        {
          state: {
            formId,
            formTitle,
            submissionId:
              submission
                ?.submissionId ||
              null,
            resultMode,
            submission,
          },
        }
      );
    };
  // =========================================================
  // RETURN
  // =========================================================
  return (
    <div
      className={
        darkMode
          ? "success-page dark"
          : "success-page"
      }
    >
      {/* =====================================================
          BACKGROUND DECORATION
      ===================================================== */}
      <div className="success-decoration">
        <span className="success-circle circle-one"></span>
        <span className="success-circle circle-two"></span>
        <div className="success-dot-pattern">
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
      {/* =====================================================
          MAIN CONTENT
      ===================================================== */}
      <main className="success-content">
        {/* ===================================================
            SUCCESS CARD
        =================================================== */}
        <section className="success-card">
          {/* =================================================
              ICON
          ================================================= */}
          <div className="success-icon-wrapper">
            <div className="success-icon-ring">
              <FaCheckCircle />
            </div>
            <span className="success-icon-badge">
              <FaCheck />
            </span>
          </div>
          {/* =================================================
              HEADER
          ================================================= */}
          <div className="success-header">
            <span className="success-eyebrow">
              Submission Complete
            </span>
            <h1>
              Thank You!
            </h1>
            <p>
              Your response for{" "}
              <strong>
                {formTitle}
              </strong>
              {" "}has been submitted successfully.
              The form is now recorded in your submission history.
            </p>
          </div>
          {/* =================================================
              STATUS INFORMATION
          ================================================= */}
          <div className="success-status-grid">
            <div className="success-status-item">
              <div className="success-status-icon submitted">
                <FaClipboardCheck />
              </div>
              <div>
                <span>
                  Submission Status
                </span>
                <strong>
                  Successfully Submitted
                </strong>
              </div>
            </div>
            <div className="success-status-item">
              <div className="success-status-icon secure">
                <FaShieldAlt />
              </div>
              <div>
                <span>
                  Response Security
                </span>
                <strong>
                  Saved Securely
                </strong>
              </div>
            </div>
          </div>
          {/* =================================================
              SCORE SUMMARY
              Hanya muncul jika mode score.
          ================================================= */}
          {canViewScore && (
            <div className="success-score-preview">
              <div className="success-score-preview-icon">
                <FaTrophy />
              </div>
              <div className="success-score-preview-content">
                <span>
                  Your Score
                </span>
                <strong>
                  {score}
                  /
                  {maxScore}
                </strong>
                <small>
                  {scoredQuestions >
                  0
                    ? `${correctAnswers} of ${scoredQuestions} scored questions correct`
                    : "Open the result page to review your score."
                  }
                </small>
              </div>
              {maxScore >
                0 && (
                <div className="success-score-percentage">
                  {percentage}%
                </div>
              )}
            </div>
          )}
          {/* =================================================
              INFORMATION
          ================================================= */}
          <div className="success-information">
            {canViewResult ? (
              <FaEye />
            ) : (
              <FaCheckCircle />
            )}
            <p>
              {resultMode ===
              "score"
                ? "Your answers and score are available. Open the result page to see which answers are correct or incorrect."
                : resultMode ===
                  "result"
                ? "You can review the questions and answers you submitted. Correct and incorrect answers will not be shown."
                : "You can review the submission record from the History page on your HiDocs account."
              }
            </p>
          </div>
          {/* =================================================
              RESULT BUTTON
          ================================================= */}
          {canViewResult && (
            <button
              type="button"
              className={
                canViewScore
                  ? "success-result-btn score"
                  : "success-result-btn"
              }
              onClick={
                viewResult
              }
            >
              {canViewScore ? (
                <FaTrophy />
              ) : (
                <FaEye />
              )}
              <span>
                {canViewScore
                  ? "View Result & Score"
                  : "View Result"
                }
              </span>
              <FaArrowRight className="success-button-arrow" />
            </button>
          )}
          {/* =================================================
              HOME BUTTON
          ================================================= */}
          <button
            type="button"
            className="success-home-btn"
            onClick={
              backToDashboard
            }
          >
            <FaHome />
            <span>
              Back to Home
            </span>
            <FaArrowRight className="success-button-arrow" />
          </button>
        </section>
      </main>
      {/* =====================================================
          FOOTER
      ===================================================== */}
      <footer className="success-footer-text">
        <span>
          HiDocs!
        </span>
        <p>
          Simple forms, better results.
        </p>
      </footer>
    </div>
  );
}
export default SubmitSuccess;