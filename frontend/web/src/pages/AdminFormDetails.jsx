import {
  useContext,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  FaArrowLeft,
  FaArrowRight,
  FaCalendarAlt,
  FaCalendarCheck,
  FaChartBar,
  FaCheck,
  FaClock,
  FaCopy,
  FaEdit,
  FaEllipsisV,
  FaExclamationCircle,
  FaLink,
  FaPowerOff,
  FaQuestionCircle,
  FaRandom,
  FaSave,
  FaStopwatch,
  FaTimes,
  FaToggleOn,
  FaUsers,
  FaWpforms,
} from "react-icons/fa";

import {
  ThemeContext,
} from "../context/ThemeContext";

import "../assets/css/AdminFormDetails.css";

const FORMS_STORAGE_KEY =
  "hidocs_forms";

const DELETED_FORMS_STORAGE_KEY =
  "hidocs_deleted_forms";

const defaultForms = [

  {
    id:
      1,

    title:
      "Survey Kepuasan Mahasiswa 2024",

    description:
      "Collect feedback and measure student satisfaction.",

    customLink:
      "survey-mhs-2024",

    link:
      "hidocs.app/r/survey-mhs-2024",

    active:
      true,

    responses:
      247,

    duration:
      30,

    openDate:
      "2024-06-01",

    closeDate:
      "2024-07-15",

    openTime:
      "08:00",

    closeTime:
      "23:59",

    settings: {

      shuffleQuestions:
        true,

      shuffleAnswers:
        true,

      oneTimeOnly:
        true,

      activateImmediately:
        true,

      timer: {

        enabled:
          true,

        duration:
          30,

      },

      responseDays:
        30,

      resultMode:
        "result",

    },

    questions: [

      {
        id:
          "survey-1",

        title:
          "Bagaimana pendapat Anda mengenai fasilitas kampus?",

        type:
          "multiple",

        required:
          true,

        image:
          "",

        options: [
          "Sangat Baik",
          "Baik",
          "Cukup",
          "Kurang",
        ],
      },

      {
        id:
          "survey-2",

        title:
          "Apakah pelayanan administrasi sudah memuaskan?",

        type:
          "multiple",

        required:
          true,

        image:
          "",

        options: [
          "Sangat Puas",
          "Puas",
          "Kurang Puas",
          "Tidak Puas",
        ],
      },

      {
        id:
          "survey-3",

        title:
          "Bagaimana kualitas kebersihan lingkungan kampus?",

        type:
          "multiple",

        required:
          true,

        image:
          "",

        options: [
          "Sangat Baik",
          "Baik",
          "Cukup",
          "Kurang",
        ],
      },

      {
        id:
          "survey-4",

        title:
          "Apakah fasilitas pembelajaran sudah memadai?",

        type:
          "yesno",

        required:
          true,

        image:
          "",

        options: [
          "Ya",
          "Tidak",
        ],
      },

      {
        id:
          "survey-5",

        title:
          "Berikan saran untuk meningkatkan pelayanan kampus.",

        type:
          "long",

        required:
          false,

        image:
          "",

        options:
          [],
      },

    ],

    createdAt:
      "2024-06-01T00:00:00.000Z",

    type:
      "Survey",
  },


  {
    id:
      2,

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

    responses:
      128,

    duration:
      20,

    openDate:
      "2024-06-11",

    closeDate:
      "2024-07-18",

    openTime:
      "08:00",

    closeTime:
      "23:59",

    settings: {

      shuffleQuestions:
        true,

      shuffleAnswers:
        true,

      oneTimeOnly:
        true,

      activateImmediately:
        true,

      timer: {

        enabled:
          true,

        duration:
          20,

      },

      responseDays:
        30,

      resultMode:
        "score",

    },

    questions: [

      {
        id:
          "flutter-1",

        title:
          "Widget apakah yang digunakan untuk membuat layout vertikal di Flutter?",

        type:
          "multiple",

        required:
          true,

        image:
          "",

        options: [
          "Row",
          "Column",
          "Stack",
          "ListView",
        ],
      },

      {
        id:
          "flutter-2",

        title:
          "Apa fungsi utama dari Scaffold pada Flutter?",

        type:
          "multiple",

        required:
          true,

        image:
          "",

        options: [
          "Widget Layout",
          "Database",
          "State Management",
          "API",
        ],
      },

    ],

    createdAt:
      "2024-06-11T00:00:00.000Z",

    type:
      "Quiz",
  },


  {
    id:
      3,

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

    responses:
      86,

    duration:
      15,

    openDate:
      "2024-06-13",

    closeDate:
      "2024-07-20",

    openTime:
      "08:00",

    closeTime:
      "23:59",

    settings: {

      shuffleQuestions:
        false,

      shuffleAnswers:
        false,

      oneTimeOnly:
        true,

      activateImmediately:
        true,

      timer: {

        enabled:
          true,

        duration:
          15,

      },

      responseDays:
        30,

      resultMode:
        "none",

    },

    questions: [

      {
        id:
          "hackathon-1",

        title:
          "Apakah Anda bersedia mengikuti seluruh rangkaian acara?",

        type:
          "yesno",

        required:
          true,

        image:
          "",

        options: [
          "Ya",
          "Tidak",
        ],
      },

    ],

    createdAt:
      "2024-06-13T00:00:00.000Z",

    type:
      "Registration",
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

const formatDate = (
  dateValue
) => {

  if (!dateValue) {

    return "Not scheduled";

  }


  /*
    Tambahkan jam lokal agar tanggal tidak mundur 1 hari
    pada timezone tertentu.
  */

  const date =
    /^\d{4}-\d{2}-\d{2}$/.test(
      String(
        dateValue
      )
    )
      ? new Date(
          `${dateValue}T12:00:00`
        )
      : new Date(
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

};

const formatSchedule = (
  dateValue,
  timeValue
) => {

  const formattedDate =
    formatDate(
      dateValue
    );


  if (
    formattedDate ===
    "Not scheduled"
  ) {

    return formattedDate;

  }


  if (!timeValue) {

    return formattedDate;

  }


  return `${formattedDate}, ${timeValue}`;

};
const normalizeTimer = (
  rawForm,
  settings
) => {

  const timerObject =
    settings.timer &&
    typeof settings.timer ===
      "object"
      ? settings.timer
      : {};


  let timerEnabled;


  if (
    rawForm.timerEnabled !==
    undefined
  ) {

    timerEnabled =
      rawForm.timerEnabled;

  } else if (
    settings.timerEnabled !==
    undefined
  ) {

    timerEnabled =
      settings.timerEnabled;

  } else if (
    timerObject.enabled !==
    undefined
  ) {

    timerEnabled =
      timerObject.enabled;

  } else if (
    settings.timer ===
    true
  ) {

    timerEnabled =
      true;

  } else {

    timerEnabled =
      Boolean(
        rawForm.duration
      );

  }


  const rawDuration =
    Number(
      rawForm.timerDuration ??
      settings.timerDuration ??
      timerObject.duration ??
      rawForm.duration ??
      20
    );


  const duration =
    Number.isFinite(
      rawDuration
    ) &&
    rawDuration >
      0
      ? Math.min(
          Math.max(
            Math.floor(
              rawDuration
            ),
            1
          ),
          1000
        )
      : 20;


  return {

    enabled:
      Boolean(
        timerEnabled
      ),

    duration,

  };

};

const normalizeForm = (
  rawForm
) => {

  const questionList =
    Array.isArray(
      rawForm.questions
    )
      ? rawForm.questions
      : [];


  const questionCount =
    Array.isArray(
      rawForm.questions
    )
      ? rawForm.questions.length
      : Number(
          rawForm.questions
        ) ||
        0;


  const settings =
    rawForm.settings &&
    typeof rawForm.settings ===
      "object"
      ? rawForm.settings
      : {};


  const timer =
    normalizeTimer(
      rawForm,
      settings
    );


  const customLink =
    String(
      rawForm.customLink ||
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
      );


  const generatedLink =
    customLink
      ? `hidocs.app/r/${customLink}`
      : `hidocs.app/r/${rawForm.id}`;


  const scheduled =
    Boolean(
      rawForm.openDate ||
      rawForm.closeDate ||
      rawForm.openTime ||
      rawForm.closeTime
    );


  const accessMode =
    rawForm.accessMode ??
    settings.accessMode ??
    "public";


  const qrOnly =
    rawForm.qrOnly ??
    settings.qrOnly ??
    accessMode ===
      "qr-only";


  const showInUserList =
    rawForm.showInUserList ??
    settings.showInUserList ??
    !qrOnly;


  return {

    ...rawForm,

    id:
      rawForm.id,

    title:
      String(
        rawForm.title ||
        ""
      ).trim() ||
      "Untitled Form",

    description:
      String(
        rawForm.description ||
        ""
      ).trim() ||
      "Form created using HiDocs Form Builder.",

    type:
      rawForm.type ||
      rawForm.category ||
      "Form",

    link:
      rawForm.link ||
      generatedLink,

    customLink:
      customLink ||
      String(
        rawForm.id
      ),

    active:
      rawForm.active !==
      false,

    responses:
      Number(
        rawForm.responses
      ) ||
      0,

    questions:
      questionCount,

    questionList,

    duration:
      timer.duration,

    timerEnabled:
      timer.enabled,

    accessMode,

    qrOnly,

    showInUserList,

    openDate:
      rawForm.openDate ||
      "",

    openTime:
      rawForm.openTime ||
      "",

    closeDate:
      rawForm.closeDate ||
      "",

    closeTime:
      rawForm.closeTime ||
      "",

    scheduleOpen:
      formatSchedule(
        rawForm.openDate,
        rawForm.openTime
      ),

    scheduleClose:
      formatSchedule(
        rawForm.closeDate,
        rawForm.closeTime
      ),

    features: {

      shuffleQuestions:
        Boolean(
          settings.shuffleQuestions
        ),

      shuffleAnswers:
        Boolean(
          settings.shuffleAnswers
        ),

      oneTimeOnly:
        settings.oneTimeOnly !==
        false,

      timer:
        timer.enabled,

      scheduled,

      activateImmediately:
        settings.activateImmediately !==
        false,

    },

    settings: {

      ...settings,

      timer: {

        ...(
          typeof settings.timer ===
          "object"
            ? settings.timer
            : {}
        ),

        enabled:
          timer.enabled,

        duration:
          timer.duration,

      },

    },

  };

};

const findRawForm = (
  formId
) => {

  const savedForms =
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


  if (
    deletedFormIds.includes(
      String(
        formId
      )
    )
  ) {

    return null;

  }


  const allForms = [

    ...defaultForms,

    ...savedForms,

  ];


  return (
    [...allForms]
      .reverse()
      .find(
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

function AdminFormDetails() {

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

  const [
    copied,
    setCopied,
  ] = useState(
    false
  );
  const [
    showMoreMenu,
    setShowMoreMenu,
  ] = useState(
    false
  );

  const [
    formVersion,
    setFormVersion,
  ] = useState(
    0
  );

  const [
    showScheduleEditor,
    setShowScheduleEditor,
  ] = useState(
    false
  );


  const [
    scheduleForm,
    setScheduleForm,
  ] = useState({

    openDate:
      "",

    openTime:
      "",

    closeDate:
      "",

    closeTime:
      "",

  });

  const form =
    useMemo(
      () => {

        const selectedForm =
          findRawForm(
            id
          );


        if (!selectedForm) {

          return null;

        }


        return normalizeForm(
          selectedForm
        );

      },
      [
        id,
        formVersion,
      ]
    );
  const updateFormActiveStatus = (
    nextActiveStatus
  ) => {

    if (!form) {

      return;

    }


    try {

      const storedForms =
        getStoredArray(
          FORMS_STORAGE_KEY
        );


      const storedFormIndex =
        storedForms.findIndex(
          (
            item
          ) =>
            String(
              item.id
            ) ===
            String(
              form.id
            )
        );


      let updatedForms;

      if (
        storedFormIndex !==
        -1
      ) {

        updatedForms =
          storedForms.map(
            (
              item
            ) => {

              if (
                String(
                  item.id
                ) !==
                String(
                  form.id
                )
              ) {

                return item;

              }


              return {

                ...item,

                active:
                  nextActiveStatus,

              };

            }
          );

      } else {

        const rawDefaultForm =
          defaultForms.find(
            (
              item
            ) =>
              String(
                item.id
              ) ===
              String(
                form.id
              )
          );


        if (!rawDefaultForm) {

          alert(
            "Data form tidak ditemukan."
          );


          return;

        }


        const overrideForm = {

          ...rawDefaultForm,

          active:
            nextActiveStatus,

        };


        updatedForms = [

          ...storedForms,

          overrideForm,

        ];

      }
      localStorage.setItem(
        FORMS_STORAGE_KEY,
        JSON.stringify(
          updatedForms
        )
      );

      window.dispatchEvent(
        new CustomEvent(
          "hidocs-forms-updated",
          {

            detail: {

              formId:
                form.id,

              type:
                "active-status",

              active:
                nextActiveStatus,

            },

          }
        )
      );


      setShowMoreMenu(
        false
      );


      setFormVersion(
        (
          previous
        ) =>
          previous +
          1
      );


    } catch (error) {

      console.error(
        "Gagal mengubah status form:",
        error
      );


      alert(
        "Status form gagal diubah. Silakan coba lagi."
      );

    }

  };

  const toggleFormActive =
    () => {

      if (!form) {

        return;

      }


      const nextStatus =
        !form.active;


      const confirmationMessage =
        nextStatus
          ? "Aktifkan kembali form ini? Form akan tersedia kembali untuk user."
          : "Nonaktifkan form ini? Form akan disembunyikan dari user dan tidak bisa dikerjakan.";


      const confirmed =
        window.confirm(
          confirmationMessage
        );


      if (!confirmed) {

        return;

      }


      updateFormActiveStatus(
        nextStatus
      );

    };

  const openScheduleEditor =
    () => {

      if (!form) {

        return;

      }


      setScheduleForm({

        openDate:
          form.openDate ||
          "",

        openTime:
          form.openTime ||
          "",

        closeDate:
          form.closeDate ||
          "",

        closeTime:
          form.closeTime ||
          "",

      });


      setShowScheduleEditor(
        true
      );

  };

  const closeScheduleEditor =
    () => {

      setShowScheduleEditor(
        false
      );

  };
  const handleScheduleChange = (
    event
  ) => {

    const {
      name,
      value,
    } =
      event.target;


    setScheduleForm(
      (
        previous
      ) => ({

        ...previous,

        [name]:
          value,

      })
    );

  };

  const createScheduleDateTime = (
    date,
    time,
    fallbackTime
  ) => {

    if (!date) {

      return null;

    }


    const normalizedTime =
      time ||
      fallbackTime;


    const value =
      new Date(
        `${date}T${normalizedTime}:00`
      );


    if (
      Number.isNaN(
        value.getTime()
      )
    ) {

      return null;

    }


    return value;

  };

  const validateSchedule =
    () => {

      const {
        openDate,
        openTime,
        closeDate,
        closeTime,
      } =
        scheduleForm;


      if (
        !openDate &&
        openTime
      ) {

        alert(
          "Pilih Open Date terlebih dahulu sebelum mengisi Open Time."
        );


        return false;

      }


      if (
        !closeDate &&
        closeTime
      ) {

        alert(
          "Pilih Close Date terlebih dahulu sebelum mengisi Close Time."
        );


        return false;

      }


      const openingDateTime =
        createScheduleDateTime(
          openDate,
          openTime,
          "00:00"
        );


      const closingDateTime =
        createScheduleDateTime(
          closeDate,
          closeTime,
          "23:59"
        );


      if (
        openingDateTime &&
        closingDateTime &&
        closingDateTime <=
          openingDateTime
      ) {

        alert(
          "Waktu penutupan harus lebih akhir dari waktu pembukaan."
        );


        return false;

      }


      return true;

  };

  const saveSchedule =
    () => {

      if (!form) {
        return;
      }

      if (!validateSchedule()) {
        return;
      }

      try {
        const storedForms =
          getStoredArray(
            FORMS_STORAGE_KEY
          );

        const storedFormIndex =
          storedForms.findIndex(
            (item) =>
              String(item.id) ===
              String(form.id)
          );

        const openDate =
          scheduleForm.openDate || "";
        const openTime =
          scheduleForm.openTime || "";
        const closeDate =
          scheduleForm.closeDate || "";
        const closeTime =
          scheduleForm.closeTime || "";
        const openingDateTime =
          createScheduleDateTime(
            openDate,
            openTime,
            "00:00"
          );

        const closingDateTime =
          createScheduleDateTime(
            closeDate,
            closeTime,
            "23:59"
          );

        const openAt =
          openingDateTime
            ? openingDateTime.toISOString()
            : null;

        const closeAt =
          closingDateTime
            ? closingDateTime.toISOString()
            : null;

        const updatedAt =
          new Date().toISOString();

        const applySchedule =
          (item) => ({
            ...item,
            openDate,
            openTime,
            closeDate,
            closeTime,
            openAt,
            closeAt,
            schedule: {
              ...(item.schedule || {}),
              openAt,
              closeAt,
              openDate,
              openTime,
              closeDate,
              closeTime,
            },
            settings: {
              ...(item.settings || {}),
              schedule: {
                ...((item.settings &&
                  item.settings.schedule) || {}),
                openAt,
                closeAt,
                openDate,
                openTime,
                closeDate,
                closeTime,
              },
            },
            updatedAt,
          });

        let updatedForms;

        if (storedFormIndex !== -1) {
          updatedForms =
            storedForms.map(
              (item) => {
                if (
                  String(item.id) !==
                  String(form.id)
                ) {
                  return item;
                }

                return applySchedule(item);
              }
            );
        } else {
          const rawDefaultForm =
            defaultForms.find(
              (item) =>
                String(item.id) ===
                String(form.id)
            );

          if (!rawDefaultForm) {
            alert(
              "Data form tidak ditemukan."
            );
            return;
          }

          updatedForms = [
            ...storedForms,
            applySchedule(rawDefaultForm),
          ];
        }

        localStorage.setItem(
          FORMS_STORAGE_KEY,
          JSON.stringify(updatedForms)
        );
        const eventDetail = {
          formId: form.id,
          type: "schedule",
          openDate,
          openTime,
          closeDate,
          closeTime,
          openAt,
          closeAt,
          updatedAt,
        };

        window.dispatchEvent(
          new CustomEvent(
            "hidocs-forms-updated",
            { detail: eventDetail }
          )
        );
        window.dispatchEvent(
          new CustomEvent(
            "hidocsFormsUpdated",
            { detail: eventDetail }
          )
        );

        setShowScheduleEditor(false);
        setFormVersion(
          (previous) => previous + 1
        );

        alert(
          "Schedule berhasil diperbarui."
        );
      } catch (error) {
        console.error(
          "Gagal memperbarui schedule:",
          error
        );

        alert(
          "Schedule gagal diperbarui. Silakan coba lagi."
        );
      }
    };
  const copyLink =
    async () => {

      if (!form) {

        return;

      }


      const linkValue =
        form.link.startsWith(
          "http"
        )
          ? form.link
          : `https://${form.link}`;


      try {

        await navigator.clipboard.writeText(
          linkValue
        );


        setCopied(
          true
        );


        window.setTimeout(
          () => {

            setCopied(
              false
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
  const viewResults =
    () => {

      navigate(
        `/admin/forms/${id}/results`
      );

  };
  const goBack =
    () => {

      navigate(
        "/admin/forms"
      );

  };
  if (!form) {

    return (

      <div
        className={
          darkMode
            ? "admin-detail-page dark"
            : "admin-detail-page"
        }
      >

        <div className="detail-not-found">


          <div className="detail-not-found-icon">

            <FaWpforms />

          </div>


          <h2>
            Form tidak ditemukan
          </h2>


          <p>
            Form yang kamu cari mungkin sudah dihapus
            atau tidak tersedia.
          </p>


          <button
            type="button"
            onClick={() =>
              navigate(
                "/admin/forms"
              )
            }
          >

            <FaArrowLeft />

            Kembali ke Manage Forms

          </button>


        </div>

      </div>

    );

  }
  const activeFeatures = [

    {
      key:
        "shuffleQuestions",

      show:
        form.features
          .shuffleQuestions,

      icon:
        <FaRandom />,

      title:
        "Shuffle questions",

      description:
        "Each respondent gets a different question order.",

      color:
        "blue",
    },

    {
      key:
        "shuffleAnswers",

      show:
        form.features
          .shuffleAnswers,

      icon:
        <FaRandom />,

      title:
        "Shuffle answers",

      description:
        "Answer choices are randomized automatically.",

      color:
        "purple",
    },

    {
      key:
        "oneTimeOnly",

      show:
        form.features
          .oneTimeOnly,

      icon:
        <FaExclamationCircle />,

      title:
        "One-time only",

      description:
        "Respondents can only submit the form once.",

      color:
        "red",
    },

    {
      key:
        "timer",

      show:
        form.features
          .timer,

      icon:
        <FaStopwatch />,

      title:
        `Timer ${form.duration} minutes`,

      description:
        "The form closes automatically when time expires.",

      color:
        "orange",
    },

    {
      key:
        "scheduled",

      show:
        form.features
          .scheduled,

      icon:
        <FaCalendarCheck />,

      title:
        "Scheduled",

      description:
        "The form follows its opening and closing schedule.",

      color:
        "green",
    },

  ].filter(
    (
      feature
    ) =>
      feature.show
  );
  return (

    <div
      className={
        darkMode
          ? "admin-detail-page dark"
          : "admin-detail-page"
      }
      onClick={() => {

        if (
          showMoreMenu
        ) {

          setShowMoreMenu(
            false
          );

        }

      }}
    >

      <header className="detail-header">


        <div className="detail-header-decoration">


          <span className="detail-header-circle circle-one"></span>

          <span className="detail-header-circle circle-two"></span>


          <div className="detail-header-dots">

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



        <div className="detail-header-top">


          <button
            type="button"
            className="detail-back-btn"
            onClick={
              goBack
            }
            title="Kembali"
          >

            <FaArrowLeft />

          </button>


          <span className="detail-header-label">

            Form Details

          </span>
          <div
            className="detail-more-wrapper"
            onClick={
              (
                event
              ) =>
                event.stopPropagation()
            }
          >


            <button
              type="button"
              className={
                showMoreMenu
                  ? "detail-more-btn active"
                  : "detail-more-btn"
              }
              title="More options"
              aria-label="More options"
              onClick={() =>
                setShowMoreMenu(
                  (
                    previous
                  ) =>
                    !previous
                )
              }
            >

              <FaEllipsisV />

            </button>



            {showMoreMenu && (

              <div className="detail-more-menu">


                <div className="detail-more-menu-header">

                  <span>
                    Form Options
                  </span>

                </div>


                <button
                  type="button"
                  className={
                    form.active
                      ? "detail-more-menu-item deactivate"
                      : "detail-more-menu-item activate"
                  }
                  onClick={
                    toggleFormActive
                  }
                >

                  <span
                    className={
                      form.active
                        ? "detail-menu-icon deactivate"
                        : "detail-menu-icon activate"
                    }
                  >

                    {form.active ? (

                      <FaPowerOff />

                    ) : (

                      <FaToggleOn />

                    )}

                  </span>


                  <span className="detail-menu-text">

                    <strong>

                      {form.active
                        ? "Deactivate Form"
                        : "Activate Form"
                      }

                    </strong>


                    <small>

                      {form.active
                        ? "Hide this form from users."
                        : "Make this form available again."
                      }

                    </small>

                  </span>


                </button>


              </div>

            )}


          </div>


        </div>



        <div className="detail-header-content">


          <div className="detail-header-icon">

            <FaWpforms />

          </div>


          <div className="detail-header-information">


            <span
              className={
                form.active
                  ? "detail-status"
                  : "detail-status inactive"
              }
            >

              <span className="detail-status-dot"></span>

              {form.active
                ? "Active"
                : "Inactive"
              }

            </span>


            <h1>
              {form.title}
            </h1>


            <p>
              {form.description}
            </p>


          </div>


        </div>


      </header>

      <main className="detail-content">

        {!form.active && (

          <section className="detail-inactive-alert">


            <div className="detail-inactive-alert-icon">

              <FaPowerOff />

            </div>


            <div>

              <strong>
                This form is currently inactive
              </strong>

              <span>
                Users cannot see or open this form until you activate it again.
              </span>

            </div>


          </section>

        )}

        <section className="detail-link-card">


          <div className="detail-link-icon">

            <FaLink />

          </div>


          <div className="detail-link-information">

            <span className="detail-small-label">

              {form.qrOnly
                ? "Private QR form link"
                : "Public form link"
              }

            </span>

            <strong>
              {form.link}
            </strong>

          </div>


          <button
            type="button"
            className={
              copied
                ? "detail-copy-btn copied"
                : "detail-copy-btn"
            }
            onClick={
              copyLink
            }
          >

            {copied ? (

              <>

                <FaCheck />

                <span>
                  Copied
                </span>

              </>

            ) : (

              <>

                <FaCopy />

                <span>
                  Copy Link
                </span>

              </>

            )}

          </button>


        </section>

        <section className="detail-section">


          <div className="detail-section-heading">


            <div>

              <span className="detail-section-eyebrow">

                Overview

              </span>

              <h2>
                Form performance
              </h2>

            </div>


            <button
              type="button"
              className="detail-inline-action"
              onClick={
                viewResults
              }
            >

              View results

              <FaArrowRight />

            </button>


          </div>



          <div className="detail-stats">


            <article className="detail-stat-card responses">


              <div className="detail-stat-icon">

                <FaUsers />

              </div>


              <div className="detail-stat-content">

                <strong>
                  {form.responses}
                </strong>

                <span>
                  Total responses
                </span>

              </div>


              <div className="detail-stat-decoration"></div>


            </article>



            <article className="detail-stat-card questions">


              <div className="detail-stat-icon">

                <FaQuestionCircle />

              </div>


              <div className="detail-stat-content">

                <strong>
                  {form.questions}
                </strong>

                <span>
                  Questions
                </span>

              </div>


              <div className="detail-stat-decoration"></div>


            </article>



            <article className="detail-stat-card time">


              <div className="detail-stat-icon">

                <FaClock />

              </div>


              <div className="detail-stat-content">

                <strong>

                  {form.timerEnabled
                    ? form.duration
                    : "∞"
                  }

                </strong>

                <span>

                  {form.timerEnabled
                    ? "Minutes duration"
                    : "No time limit"
                  }

                </span>

              </div>


              <div className="detail-stat-decoration"></div>


            </article>


          </div>


        </section>

        <div className="detail-content-grid">

          <section className="detail-panel active-features">


            <div className="detail-panel-heading">


              <div>

                <span className="detail-section-eyebrow">

                  Configuration

                </span>

                <h2>
                  Active Features
                </h2>

              </div>


              <span className="feature-count">

                {activeFeatures.length}

              </span>


            </div>



            <div className="feature-list">


              {activeFeatures.length ===
              0 ? (

                <div className="detail-empty-features">

                  <FaWpforms />

                  <span>
                    No additional features are enabled.
                  </span>

                </div>

              ) : (

                activeFeatures.map(
                  (
                    feature
                  ) => (

                    <article
                      className={
                        `feature-card ${feature.color}`
                      }
                      key={
                        feature.key
                      }
                    >


                      <div className="feature-icon">

                        {feature.icon}

                      </div>


                      <div className="feature-content">

                        <strong>
                          {feature.title}
                        </strong>

                        <span>
                          {feature.description}
                        </span>

                      </div>


                      <span className="feature-enabled">

                        <FaCheck />

                      </span>


                    </article>

                  )
                )

              )}


            </div>


          </section>

          <section className="detail-panel schedule-section">


            <div className="detail-panel-heading">


              <div>

                <span className="detail-section-eyebrow">

                  Availability

                </span>

                <h2>
                  Schedule
                </h2>

              </div>


              {!showScheduleEditor ? (

                <button
                  type="button"
                  className="schedule-edit-btn"
                  onClick={
                    openScheduleEditor
                  }
                  title="Edit schedule"
                >

                  <FaEdit />

                  <span>
                    Edit
                  </span>

                </button>

              ) : (

                <div className="schedule-heading-icon">

                  <FaCalendarAlt />

                </div>

              )}


            </div>



            {!showScheduleEditor ? (

              <>

                <div className="schedule-timeline">


                  <article className="schedule-timeline-item open">


                    <div className="schedule-timeline-marker">

                      <span></span>

                    </div>


                    <div className="schedule-timeline-content">

                      <span>
                        Opens
                      </span>

                      <strong>
                        {form.scheduleOpen}
                      </strong>

                      <small>
                        Form becomes available
                      </small>

                    </div>


                  </article>



                  <div className="schedule-timeline-line"></div>



                  <article className="schedule-timeline-item close">


                    <div className="schedule-timeline-marker">

                      <span></span>

                    </div>


                    <div className="schedule-timeline-content">

                      <span>
                        Closes
                      </span>

                      <strong>
                        {form.scheduleClose}
                      </strong>

                      <small>
                        Form stops accepting responses
                      </small>

                    </div>


                  </article>


                </div>



                <div className="schedule-duration-card">


                  <FaClock />


                  <div>

                    <strong>

                      {form.features.timer
                        ? `${form.duration} minute response timer`
                        : "No response timer"
                      }

                    </strong>

                    <span>

                      {form.features.timer
                        ? "Timer starts after the respondent opens the form."
                        : "The form does not currently use a response timer."
                      }

                    </span>

                  </div>


                </div>


              </>

            ) : (

              <div className="schedule-editor">


                <div className="schedule-editor-header">


                  <div className="schedule-editor-header-icon">

                    <FaCalendarAlt />

                  </div>


                  <div>

                    <strong>
                      Edit Schedule
                    </strong>

                    <span>
                      Change only the opening and closing schedule.
                    </span>

                  </div>


                </div>



                <div className="schedule-editor-grid">


                  {/* OPEN DATE */}

                  <div className="schedule-editor-field">


                    <label htmlFor="admin-open-date">

                      Open Date

                    </label>


                    <div className="schedule-editor-input">

                      <FaCalendarAlt />

                      <input
                        id="admin-open-date"
                        type="date"
                        name="openDate"
                        value={
                          scheduleForm.openDate
                        }
                        onChange={
                          handleScheduleChange
                        }
                      />

                    </div>


                  </div>



                  {/* OPEN TIME */}

                  <div className="schedule-editor-field">


                    <label htmlFor="admin-open-time">

                      Open Time

                    </label>


                    <div className="schedule-editor-input">

                      <FaClock />

                      <input
                        id="admin-open-time"
                        type="time"
                        name="openTime"
                        value={
                          scheduleForm.openTime
                        }
                        onChange={
                          handleScheduleChange
                        }
                      />

                    </div>


                  </div>



                  {/* CLOSE DATE */}

                  <div className="schedule-editor-field">


                    <label htmlFor="admin-close-date">

                      Close Date

                    </label>


                    <div className="schedule-editor-input">

                      <FaCalendarAlt />

                      <input
                        id="admin-close-date"
                        type="date"
                        name="closeDate"
                        value={
                          scheduleForm.closeDate
                        }
                        onChange={
                          handleScheduleChange
                        }
                      />

                    </div>


                  </div>



                  {/* CLOSE TIME */}

                  <div className="schedule-editor-field">


                    <label htmlFor="admin-close-time">

                      Close Time

                    </label>


                    <div className="schedule-editor-input">

                      <FaClock />

                      <input
                        id="admin-close-time"
                        type="time"
                        name="closeTime"
                        value={
                          scheduleForm.closeTime
                        }
                        onChange={
                          handleScheduleChange
                        }
                      />

                    </div>


                  </div>


                </div>



                <div className="schedule-editor-info">


                  <FaCalendarCheck />


                  <div>

                    <strong>
                      Schedule only
                    </strong>

                    <span>
                      Questions, timer, scoring, visibility, shuffle settings, and other form data will not be changed.
                    </span>

                  </div>


                </div>



                <div className="schedule-editor-actions">


                  <button
                    type="button"
                    className="schedule-editor-cancel-btn"
                    onClick={
                      closeScheduleEditor
                    }
                  >

                    <FaTimes />

                    <span>
                      Cancel
                    </span>

                  </button>


                  <button
                    type="button"
                    className="schedule-editor-save-btn"
                    onClick={
                      saveSchedule
                    }
                  >

                    <FaSave />

                    <span>
                      Save Schedule
                    </span>

                  </button>


                </div>


              </div>

            )}


          </section>


        </div>

        <section className="detail-section">


          <div className="detail-section-heading">


            <div>

              <span className="detail-section-eyebrow">

                Form Content

              </span>

              <h2>
                Questions preview
              </h2>

            </div>


            <span className="feature-count">

              {form.questions}

            </span>


          </div>



          {form.questionList.length ===
          0 ? (

            <div className="detail-question-empty">

              <FaQuestionCircle />

              <h3>
                No question data available
              </h3>

              <p>
                This form does not contain any saved questions.
              </p>

            </div>

          ) : (

            <div className="detail-question-list">


              {form.questionList.map(
                (
                  question,
                  index
                ) => {

                  const displayOptions =
                    question.type ===
                      "image" &&
                    question.imageAnswerType ===
                      "multiple"
                      ? (
                          Array.isArray(
                            question.imageOptions
                          )
                            ? question.imageOptions
                            : []
                        )
                      : (
                          Array.isArray(
                            question.options
                          )
                            ? question.options
                            : []
                        );


                  return (

                    <article
                      className="detail-question-card"
                      key={
                        question.id ||
                        index
                      }
                    >


                      <span className="detail-question-number">

                        {index + 1}

                      </span>


                      <div className="detail-question-information">


                        <span>

                          {question.type ||
                          "Question"}

                        </span>


                        <strong>

                          {question.title ||
                          question.question ||
                          `Question ${index + 1}`}

                        </strong>



                        {/* IMAGE */}

                        {question.image && (

                          <div className="detail-question-image">

                            <img
                              src={
                                question.image
                              }
                              alt={
                                question.imageName ||
                                `Question ${index + 1}`
                              }
                            />

                          </div>

                        )}



                        {/* IMAGE ANSWER TYPE */}

                        {question.type ===
                          "image" &&
                        question.imageAnswerType && (

                          <span className="detail-question-answer-type">

                            Answer type:{" "}

                            {question.imageAnswerType ===
                            "multiple"
                              ? "Multiple Choice"
                              : question.imageAnswerType ===
                                "long"
                              ? "Long Text"
                              : "Short Text"
                            }

                          </span>

                        )}



                        {/* OPTIONS */}

                        {displayOptions.length >
                          0 && (

                          <div className="detail-question-options">

                            {displayOptions.map(
                              (
                                option,
                                optionIndex
                              ) => (

                                <span
                                  key={
                                    `${option}-${optionIndex}`
                                  }
                                >

                                  {String.fromCharCode(
                                    65 +
                                    optionIndex
                                  )}
                                  .
                                  {" "}
                                  {option}

                                </span>

                              )
                            )}

                          </div>

                        )}


                      </div>



                      {question.required !==
                      false && (

                        <span className="detail-question-required">

                          Required

                        </span>

                      )}


                    </article>

                  );

                }
              )}


            </div>

          )}


        </section>

        <section className="detail-results-card">


          <div className="detail-results-icon">

            <FaChartBar />

          </div>


          <div className="detail-results-content">

            <span>
              Form analytics
            </span>

            <h2>
              Review responses and results
            </h2>

            <p>
              Open the results dashboard to see response data,
              statistics, and respondent activity.
            </p>

          </div>


          <button
            type="button"
            className="view-results-btn"
            onClick={
              viewResults
            }
          >

            <span>
              View Results
            </span>

            <FaArrowRight />

          </button>


        </section>


      </main>


    </div>

  );

}


export default AdminFormDetails;