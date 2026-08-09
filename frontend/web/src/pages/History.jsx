import {
  useContext,
  useMemo,
  useState,
} from "react";

import {
  useLocation,
  useNavigate,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaCheckCircle,
  FaClock,
  FaExclamationTriangle,
  FaEye,
  FaHistory,
  FaHourglassEnd,
  FaListOl,
  FaTrash,
  FaTrophy,
} from "react-icons/fa";

import "../assets/css/History.css";

import BottomNavigation from "../components/BottomNavigation";

import {
  ThemeContext,
} from "../context/ThemeContext";

import {
  FormContext,
} from "../context/FormContext";


// =========================================================
// STORAGE KEY
// =========================================================

const HIDDEN_HISTORY_STORAGE_KEY =
  "hidocs_hidden_history";


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
// CURRENT USER
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

      const storedUser =
        localStorage.getItem(
          key
        );


      if (!storedUser) {

        continue;

      }


      const parsedUser =
        JSON.parse(
          storedUser
        );


      if (
        !parsedUser ||
        typeof parsedUser !==
          "object"
      ) {

        continue;

      }


      return {

        id:
          parsedUser.id ??
          null,

        username:
          parsedUser.username ||
          parsedUser.name ||
          "HiDocs User",

        email:
          String(
            parsedUser.email ||
            ""
          )
            .trim()
            .toLowerCase(),

      };

    }

  } catch (error) {

    console.error(
      "Gagal membaca user aktif:",
      error
    );

  }


  return {

    id:
      null,

    username:
      "HiDocs User",

    email:
      "",

  };

};


// =========================================================
// USER IDENTITY
// =========================================================

const getUserIdentity = (
  user
) => {

  if (
    user.email
  ) {

    return String(
      user.email
    )
      .trim()
      .toLowerCase();

  }


  if (
    user.id !==
      undefined &&
    user.id !==
      null
  ) {

    return String(
      user.id
    )
      .trim()
      .toLowerCase();

  }


  return String(
    user.username ||
    "hidocs-user"
  )
    .trim()
    .toLowerCase();

};


// =========================================================
// CREATE HIDDEN HISTORY KEY
// Multi account:
// tiap hidden history terkait user + submission.
// =========================================================

const createHiddenHistoryKey = (
  userIdentity,
  submissionId
) => {

  return `${String(
    userIdentity ||
    ""
  )
    .trim()
    .toLowerCase()}::${String(
    submissionId ||
    ""
  ).trim()}`;

};


// =========================================================
// HISTORY
// =========================================================

function History() {

  const navigate =
    useNavigate();


  const location =
    useLocation();


  const {
    darkMode,
  } = useContext(
    ThemeContext
  );


  const formContext =
    useContext(
      FormContext
    ) || {};


  const {
    submittedForms = [],
    forms = [],
    getFormById,
  } = formContext;


  // =========================================================
  // CURRENT USER
  // =========================================================

  const currentUser =
    useMemo(
      () => {

        return getCurrentUser();

      },
      []
    );


  const currentUserIdentity =
    useMemo(
      () => {

        return getUserIdentity(
          currentUser
        );

      },
      [
        currentUser,
      ]
    );


  // =========================================================
  // HIDDEN HISTORY STATE
  // =========================================================

  const [
    hiddenHistory,
    setHiddenHistory,
  ] = useState(
    () =>
      getStoredArray(
        HIDDEN_HISTORY_STORAGE_KEY
      )
  );


  // =========================================================
  // TIME EXPIRED MESSAGE
  // =========================================================

  const timeExpiredMessage =
    location.state?.timeExpired
      ? {

          title:
            location.state?.formTitle ||
            "Form",

          message:
            "Your response time has ended. This attempt has been recorded as Time Expired.",

        }
      : null;


  // =========================================================
  // GET FORM DATA
  // =========================================================

  const getRelatedForm = (
    formId
  ) => {

    if (
      formId ===
        undefined ||
      formId ===
        null ||
      formId ===
        ""
    ) {

      return null;

    }


    if (
      typeof getFormById ===
      "function"
    ) {

      const foundForm =
        getFormById(
          formId
        );


      if (
        foundForm
      ) {

        return foundForm;

      }

    }


    return (
      forms.find(
        (
          item
        ) =>
          String(
            item.id
          ) ===
          String(
            formId
          )
      ) ||
      null
    );

  };


  // =========================================================
  // NORMALIZE HISTORY ITEMS
  // =========================================================

  const historyItems =
    useMemo(
      () => {

        return [
          ...submittedForms,
        ]
          .map(
            (
              submission,
              index
            ) => {

              const formId =
                submission.formId ??
                submission.id;


              const relatedForm =
                getRelatedForm(
                  formId
                );


              const isTimeExpired =
                submission.isTimeExpired ===
                  true ||
                submission.status ===
                  "time-expired" ||
                submission.status ===
                  "expired" ||
                submission.status ===
                  "Time Expired";


              const status =
                isTimeExpired
                  ? "time-expired"
                  : "completed";


              const resultMode =
                normalizeResultMode(

                  submission.resultMode ||

                  relatedForm?.settings
                    ?.resultMode ||

                  relatedForm?.resultMode

                );


              const canViewResult =
                !isTimeExpired &&
                (
                  resultMode ===
                    "result" ||
                  resultMode ===
                    "score"
                );


              const canViewScore =
                !isTimeExpired &&
                resultMode ===
                  "score";


              return {

                ...submission,

                formId,

                submissionId:
                  submission.submissionId ||
                  `${formId}-${submission.submittedAt || index}-${index}`,

                title:
                  submission.title ||
                  relatedForm?.title ||
                  "Untitled Form",

                status,

                isTimeExpired,

                answeredQuestions:
                  Number(
                    submission.answeredQuestions
                  ) || 0,

                totalQuestions:
                  Number(
                    submission.totalQuestions
                  ) ||
                  (
                    Array.isArray(
                      relatedForm?.questions
                    )
                      ? relatedForm.questions.length
                      : 0
                  ),

                resultMode,

                canViewResult,

                canViewScore,

              };

            }
          )
          .filter(
            (
              item
            ) => {

              const hiddenKey =
                createHiddenHistoryKey(
                  currentUserIdentity,
                  item.submissionId
                );


              return (
                !hiddenHistory.includes(
                  hiddenKey
                )
              );

            }
          )
          .sort(
            (
              first,
              second
            ) => {

              const firstTime =
                new Date(
                  first.submittedAt
                ).getTime();


              const secondTime =
                new Date(
                  second.submittedAt
                ).getTime();


              if (
                Number.isNaN(
                  firstTime
                ) ||
                Number.isNaN(
                  secondTime
                )
              ) {

                return 0;

              }


              return (
                secondTime -
                firstTime
              );

            }
          );

      },
      [
        submittedForms,
        forms,
        getFormById,
        hiddenHistory,
        currentUserIdentity,
      ]
    );


  // =========================================================
  // FORMAT DATE
  // =========================================================

  const getSubmissionDate = (
    submittedAt
  ) => {

    if (!submittedAt) {

      return "-";

    }


    const date =
      new Date(
        submittedAt
      );


    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {

      return new Intl.DateTimeFormat(
        "en-GB",
        {

          day:
            "2-digit",

          month:
            "short",

          year:
            "numeric",

        }
      ).format(
        date
      );

    }


    const dateParts =
      String(
        submittedAt
      ).split(",");


    return (
      dateParts[0]
        ?.trim() ||
      "-"
    );

  };


  // =========================================================
  // FORMAT TIME
  // =========================================================

  const getSubmissionTime = (
    submittedAt
  ) => {

    if (!submittedAt) {

      return "-";

    }


    const date =
      new Date(
        submittedAt
      );


    if (
      !Number.isNaN(
        date.getTime()
      )
    ) {

      return new Intl.DateTimeFormat(
        "en-GB",
        {

          hour:
            "2-digit",

          minute:
            "2-digit",

          hour12:
            false,

        }
      ).format(
        date
      );

    }


    const dateParts =
      String(
        submittedAt
      ).split(",");


    return (
      dateParts
        .slice(1)
        .join(",")
        .trim() ||
      "-"
    );

  };


  // =========================================================
  // DELETE SINGLE HISTORY
  // =========================================================

  const deleteHistoryItem = (
    form
  ) => {

    if (!form) {

      return;

    }


    const confirmed =
      window.confirm(
        `Hapus "${form.title}" dari History?\n\nRiwayat hanya akan disembunyikan. Status form yang sudah dikerjakan tetap tersimpan.`
      );


    if (!confirmed) {

      return;

    }


    const hiddenKey =
      createHiddenHistoryKey(
        currentUserIdentity,
        form.submissionId
      );


    const latestHiddenHistory =
      getStoredArray(
        HIDDEN_HISTORY_STORAGE_KEY
      );


    const updatedHiddenHistory =
      latestHiddenHistory.includes(
        hiddenKey
      )
        ? latestHiddenHistory
        : [
            ...latestHiddenHistory,
            hiddenKey,
          ];


    localStorage.setItem(
      HIDDEN_HISTORY_STORAGE_KEY,
      JSON.stringify(
        updatedHiddenHistory
      )
    );


    setHiddenHistory(
      updatedHiddenHistory
    );

  };


  // =========================================================
  // CLEAR CURRENT USER HISTORY
  // =========================================================

  const clearAllHistory =
    () => {

      if (
        historyItems.length ===
        0
      ) {

        return;

      }


      const confirmed =
        window.confirm(
          `Hapus seluruh ${historyItems.length} history akun ini?\n\nRiwayat hanya akan disembunyikan. Status form yang sudah dikerjakan tetap tersimpan.`
        );


      if (!confirmed) {

        return;

      }


      const latestHiddenHistory =
        getStoredArray(
          HIDDEN_HISTORY_STORAGE_KEY
        );


      const newKeys =
        historyItems.map(
          (
            item
          ) =>
            createHiddenHistoryKey(
              currentUserIdentity,
              item.submissionId
            )
        );


      const updatedHiddenHistory =
        Array.from(
          new Set([
            ...latestHiddenHistory,
            ...newKeys,
          ])
        );


      localStorage.setItem(
        HIDDEN_HISTORY_STORAGE_KEY,
        JSON.stringify(
          updatedHiddenHistory
        )
      );


      setHiddenHistory(
        updatedHiddenHistory
      );

  };


  // =========================================================
  // OPEN FORM DETAILS
  // =========================================================

  const openFormDetails = (
    formId
  ) => {

    if (
      formId ===
        undefined ||
      formId ===
        null ||
      formId ===
        ""
    ) {

      return;

    }


    navigate(
      `/form-details/${formId}`
    );

  };


  // =========================================================
  // OPEN RESULT
  // =========================================================

  const openFormResult = (
    form
  ) => {

    if (
      !form?.formId ||
      !form.canViewResult
    ) {

      return;

    }


    navigate(
      `/form-result/${form.formId}`,
      {

        state: {

          formId:
            form.formId,

          formTitle:
            form.title,

          submissionId:
            form.submissionId,

          resultMode:
            form.resultMode,

          submission:
            form,

        },

      }
    );

  };


  // =========================================================
  // OPEN FORMS
  // =========================================================

  const openForms =
    () => {

      navigate(
        "/forms"
      );

    };


  // =========================================================
  // RETURN
  // =========================================================

  return (

    <div
      className={
        darkMode
          ? "history-page dark"
          : "history-page"
      }
    >


      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="history-header">


        <div className="history-header-decoration">

          <span className="history-header-circle history-circle-one"></span>

          <span className="history-header-circle history-circle-two"></span>

        </div>


        <div className="history-header-content">


          <button
            type="button"
            className="history-back-btn"
            onClick={() =>
              navigate(-1)
            }
            aria-label="Back"
            title="Back"
          >

            <FaArrowLeft />

          </button>


          <div className="history-header-title">

            <span>
              Activity
            </span>

            <h1>
              History
            </h1>

            <p>
              View your submitted forms and previous attempts.
            </p>

          </div>


          <div className="history-header-summary">

            <div className="history-header-summary-icon">

              <FaHistory />

            </div>


            <div>

              <span>
                Total Activity
              </span>

              <strong>
                {historyItems.length}
              </strong>

            </div>

          </div>


        </div>


      </header>



      {/* =====================================================
          CONTENT
      ===================================================== */}

      <main className="history-content">


        {/* ===================================================
            PAGE TITLE
        =================================================== */}

        <section className="history-content-heading">


          <div>

            <span className="history-eyebrow">
              Your Activity
            </span>

            <h2>
              Submission History
            </h2>

            <p>
              All forms you have completed or attempted will be shown here.
            </p>

          </div>


          {historyItems.length >
            0 && (

            <div className="history-heading-actions">


              <div className="history-count-badge">

                <FaHistory />

                <span>

                  {historyItems.length}
                  {" "}
                  {
                    historyItems.length ===
                    1
                      ? "Activity"
                      : "Activities"
                  }

                </span>

              </div>


              <button
                type="button"
                className="history-clear-all-btn"
                onClick={
                  clearAllHistory
                }
              >

                <FaTrash />

                <span>
                  Clear History
                </span>

              </button>


            </div>

          )}


        </section>



        {/* ===================================================
            TIME EXPIRED ALERT
        =================================================== */}

        {timeExpiredMessage && (

          <section
            className="history-expired-alert"
            role="alert"
          >


            <div className="history-expired-alert-icon">

              <FaHourglassEnd />

            </div>


            <div className="history-expired-alert-content">

              <span className="history-alert-label">
                Time Expired
              </span>

              <strong>
                {timeExpiredMessage.title}
              </strong>

              <p>
                {timeExpiredMessage.message}
              </p>

            </div>


          </section>

        )}



        {/* ===================================================
            EMPTY STATE
        =================================================== */}

        {historyItems.length ===
        0 ? (

          <section className="history-empty">


            <div className="history-empty-decoration">

              <div className="history-empty-icon">

                <FaHistory />

              </div>

            </div>


            <span className="history-empty-label">
              No Activity Yet
            </span>


            <h3>
              No submission history
            </h3>


            <p>
              Forms you submit or attempts that run out of time will appear here.
            </p>


            <button
              type="button"
              className="history-explore-btn"
              onClick={
                openForms
              }
            >

              <span>
                Explore Forms
              </span>

              <FaArrowRight />

            </button>


          </section>

        ) : (

          <section className="history-list">


            {historyItems.map(
              (
                form
              ) => {

                const isExpired =
                  form.isTimeExpired;


                const answeredCount =
                  Number(
                    form.answeredQuestions
                  ) || 0;


                const totalCount =
                  Number(
                    form.totalQuestions
                  ) || 0;


                const hasQuestionInformation =
                  totalCount >
                  0;


                return (

                  <article
                    className={
                      isExpired
                        ? "history-card expired"
                        : "history-card completed"
                    }
                    key={
                      form.submissionId
                    }
                  >


                    <div className="history-card-status-line"></div>


                    <div
                      className={
                        isExpired
                          ? "history-card-main-icon expired"
                          : "history-card-main-icon completed"
                      }
                    >

                      {isExpired ? (

                        <FaHourglassEnd />

                      ) : (

                        <FaCheckCircle />

                      )}

                    </div>


                    <div className="history-card-content">


                      <div className="history-card-top">


                        <div className="history-card-title-area">


                          <span className="history-card-eyebrow">

                            {isExpired
                              ? "Incomplete Attempt"
                              : "Completed Form"
                            }

                          </span>


                          <h3>
                            {form.title}
                          </h3>


                          <p>

                            {isExpired
                              ? "The form was closed automatically because your response time ended."
                              : "Your response has been successfully submitted and recorded."
                            }

                          </p>


                        </div>


                        <span
                          className={
                            isExpired
                              ? "history-status-badge expired"
                              : "history-status-badge completed"
                          }
                        >

                          {isExpired ? (

                            <>

                              <FaExclamationTriangle />

                              <span>
                                Time Expired
                              </span>

                            </>

                          ) : (

                            <>

                              <FaCheckCircle />

                              <span>
                                Submitted
                              </span>

                            </>

                          )}

                        </span>


                      </div>



                      <div className="history-card-meta">


                        <div className="history-meta-item">

                          <div className="history-meta-icon">

                            <FaCalendarAlt />

                          </div>

                          <div>

                            <span>
                              Date
                            </span>

                            <strong>

                              {getSubmissionDate(
                                form.submittedAt
                              )}

                            </strong>

                          </div>

                        </div>


                        <div className="history-meta-divider"></div>


                        <div className="history-meta-item">

                          <div className="history-meta-icon">

                            <FaClock />

                          </div>

                          <div>

                            <span>
                              Time
                            </span>

                            <strong>

                              {getSubmissionTime(
                                form.submittedAt
                              )}

                            </strong>

                          </div>

                        </div>


                        {hasQuestionInformation && (

                          <>

                            <div className="history-meta-divider"></div>


                            <div className="history-meta-item">

                              <div className="history-meta-icon">

                                <FaListOl />

                              </div>

                              <div>

                                <span>
                                  Questions
                                </span>

                                <strong>

                                  {answeredCount}
                                  {" "}
                                  /
                                  {" "}
                                  {totalCount}

                                </strong>

                              </div>

                            </div>

                          </>

                        )}


                      </div>



                      {isExpired &&
                      hasQuestionInformation && (

                        <div className="history-expired-information">

                          <div className="history-expired-info-icon">

                            <FaHourglassEnd />

                          </div>


                          <div>

                            <strong>
                              Response time ended
                            </strong>

                            <span>

                              You answered
                              {" "}
                              {answeredCount}
                              {" "}
                              of
                              {" "}
                              {totalCount}
                              {" "}
                              questions before the timer expired.

                            </span>

                          </div>

                        </div>

                      )}



                      <div className="history-card-footer">


                        <div className="history-card-footer-status">

                          {isExpired ? (

                            <>

                              <span className="history-footer-dot expired"></span>

                              Attempt recorded

                            </>

                          ) : (

                            <>

                              <span className="history-footer-dot completed"></span>

                              Response saved successfully

                            </>

                          )}

                        </div>



                        <div className="history-card-actions">


                          <button
                            type="button"
                            className="history-delete-btn"
                            onClick={() =>
                              deleteHistoryItem(
                                form
                              )
                            }
                          >

                            <FaTrash />

                            <span>
                              Delete
                            </span>

                          </button>


                          {form.canViewResult && (

                            <button
                              type="button"
                              className={
                                form.canViewScore
                                  ? "history-result-btn score"
                                  : "history-result-btn"
                              }
                              onClick={() =>
                                openFormResult(
                                  form
                                )
                              }
                            >

                              {form.canViewScore ? (

                                <FaTrophy />

                              ) : (

                                <FaEye />

                              )}


                              <span>

                                {form.canViewScore
                                  ? "View Result & Score"
                                  : "View Result"
                                }

                              </span>


                              <FaArrowRight />

                            </button>

                          )}



                          <button
                            type="button"
                            className="history-detail-btn"
                            onClick={() =>
                              openFormDetails(
                                form.formId
                              )
                            }
                          >

                            <FaEye />

                            <span>
                              View Form Details
                            </span>

                            <FaArrowRight />

                          </button>


                        </div>


                      </div>


                    </div>


                  </article>

                );

              }
            )}


          </section>

        )}


      </main>



      <BottomNavigation
        active="history"
      />


    </div>

  );

}


export default History;