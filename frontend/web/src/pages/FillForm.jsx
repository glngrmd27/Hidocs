import { getFormById, submitForm as submitFormApi } from '../api/formApi';
import { getQuestionsByForm } from '../api/questionApi';

import {
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { useNavigate, useParams } from "react-router-dom";

import {
  FaArrowLeft,
  FaArrowRight,
  FaCheckCircle,
  FaClipboardList,
  FaClock,
  FaExclamationTriangle,
  FaInfinity,
  FaStar,
  FaExpand,
  FaSearchMinus,
  FaSearchPlus,
  FaTimes,
  FaUndo,
  FaCode,
  FaCalculator,
} from "react-icons/fa";

import DOMPurify from "dompurify";
import katex from "katex";
import "katex/dist/katex.min.css";

import { ThemeContext } from "../context/ThemeContext";
import { FormContext } from "../context/FormContext";

import logo from "../assets/images/logo.png";

import "../assets/css/FillForm.css";
import "../assets/css/FillFormImageZoom.css";
import "../assets/css/FillFormSpecialAnswers.css";

// =========================================================
// KATEX GLOBAL SETUP
// Formula Quill (window.katex) harus tersedia sebelum
// konten formula dirender ulang di halaman user.
// =========================================================

if (typeof window !== "undefined") {
  window.katex = katex;
}

// =========================================================
// STORAGE KEYS
// =========================================================

const FORMS_STORAGE_KEY = "hidocs_forms";
const DELETED_FORMS_STORAGE_KEY = "hidocs_deleted_forms";

// =========================================================
// TIMER LIMIT
// =========================================================

const MIN_TIMER_MINUTES = 1;
const MAX_TIMER_MINUTES = 1000;

// =========================================================
// DEFAULT FORMS
// =========================================================

const defaultForms = [
  {
    id: 1,
    title: "Survey Kepuasan Mahasiswa 2024",
    category: "Survey",
    active: true,
    settings: {
      oneTimeOnly: true,
      timer: {
        enabled: true,
        duration: 20,
      },
    },
    questions: [
      {
        id: "survey-1",
        title: "Bagaimana pendapat Anda mengenai fasilitas kampus?",
        type: "multiple",
        required: true,
        image: "",
        options: ["Sangat Baik", "Baik", "Cukup", "Kurang"],
      },
      {
        id: "survey-2",
        title: "Apakah pelayanan administrasi sudah memuaskan?",
        type: "multiple",
        required: true,
        image: "",
        options: ["Sangat Puas", "Puas", "Kurang Puas", "Tidak Puas"],
      },
    ],
  },
  {
    id: 2,
    title: "Quiz Pemrograman Mobile - Flutter",
    category: "Quiz",
    active: true,
    settings: {
      oneTimeOnly: true,
      timer: {
        enabled: true,
        duration: 30,
      },
    },
    questions: [
      {
        id: "flutter-1",
        title: "Widget apakah yang digunakan untuk membuat layout vertikal di Flutter?",
        type: "multiple",
        required: true,
        image: "",
        options: ["Row", "Column", "Stack", "ListView"],
      },
      {
        id: "flutter-2",
        title: "Perhatikan gambar berikut kemudian pilih jawaban yang benar.",
        type: "multiple",
        required: true,
        image: "https://picsum.photos/800/420",
        options: ["Jawaban A", "Jawaban B", "Jawaban C", "Jawaban D"],
      },
      {
        id: "flutter-3",
        title: "Apa fungsi utama dari Scaffold pada Flutter?",
        type: "multiple",
        required: true,
        image: "",
        options: ["Widget Layout", "Database", "State Management", "API"],
      },
    ],
  },
  {
    id: 3,
    title: "Form Pendaftaran Event Hackathon",
    category: "Registration",
    active: true,
    settings: {
      oneTimeOnly: true,
      timer: {
        enabled: true,
        duration: 15,
      },
    },
    questions: [
      {
        id: "hackathon-1",
        title: "Apakah Anda bersedia mengikuti seluruh rangkaian acara?",
        type: "yesno",
        required: true,
        image: "",
        options: ["Ya", "Tidak"],
      },
    ],
  },
];

// =========================================================
// SAFE STORAGE READER
// =========================================================

const getStoredArray = (key) => {
  try {
    const storedValue = localStorage.getItem(key);

    if (!storedValue) {
      return [];
    }

    const parsedValue = JSON.parse(storedValue);

    return Array.isArray(parsedValue) ? parsedValue : [];
  } catch (error) {
    console.error(`Gagal membaca ${key}:`, error);

    return [];
  }
};

// =========================================================
// ANSWER CHECKER
// =========================================================

const hasAnswerValue = (value) => {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  if (typeof value === "string") {
    return value.trim().length > 0;
  }

  return value !== undefined && value !== null && value !== "";
};

// =========================================================
// SHUFFLE HELPER
// =========================================================

const shuffleArray = (items) => {
  const result = [...items];

  for (let index = result.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));

    [result[index], result[randomIndex]] = [result[randomIndex], result[index]];
  }

  return result;
};

// =========================================================
// SANITIZE QUESTION HTML
//
// question.title / options bisa berisi HTML dari Quill
// (bold, list, link, embed video, formula KaTeX). String ini
// harus disaring sebelum dirender via dangerouslySetInnerHTML
// agar aman dari XSS, tapi tetap mengizinkan <iframe> untuk
// video embed Quill.
// =========================================================

// =========================================================
// VIDEO EMBED HELPERS
// =========================================================

const getVideoEmbedUrl = (url) => {
  if (!url) {
    return null;
  }

  const cleanUrl = String(url).trim();

  // Sudah berupa embed URL YouTube
  const youtubeEmbedMatch = cleanUrl.match(
    /youtube\.com\/embed\/([a-zA-Z0-9_-]+)/
  );

  if (youtubeEmbedMatch) {
    return `https://www.youtube.com/embed/${youtubeEmbedMatch[1]}`;
  }

  // youtube.com/watch?v=xxxx
  const youtubeWatchMatch = cleanUrl.match(
    /youtube\.com\/watch\?v=([a-zA-Z0-9_-]+)/
  );

  if (youtubeWatchMatch) {
    return `https://www.youtube.com/embed/${youtubeWatchMatch[1]}`;
  }

  // youtu.be/xxxx
  const youtubeShortMatch = cleanUrl.match(
    /youtu\.be\/([a-zA-Z0-9_-]+)/
  );

  if (youtubeShortMatch) {
    return `https://www.youtube.com/embed/${youtubeShortMatch[1]}`;
  }

  // vimeo.com/xxxx
  const vimeoMatch = cleanUrl.match(
    /vimeo\.com\/(\d+)/
  );

  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`;
  }

  return null;

};


// =========================================================
// CONVERT VIDEO LINKS TO EMBEDDED IFRAME
//
// Menangani soal lama yang videonya tersimpan sebagai <a href>
// biasa (bukan hasil tombol Video Quill), supaya tetap tampil
// sebagai player, bukan link biru.
// =========================================================

const convertVideoLinksToEmbeds = (html) => {

  if (typeof window === "undefined" || !html) {
    return html;
  }

  const parser = new DOMParser();

  const parsedDocument = parser.parseFromString(
    html,
    "text/html"
  );


  const anchors = parsedDocument.querySelectorAll("a");


  anchors.forEach((anchor) => {

    const href = anchor.getAttribute("href") || "";

    const embedUrl = getVideoEmbedUrl(href);


    if (!embedUrl) {
      return;
    }


    const iframe = parsedDocument.createElement("iframe");

    iframe.setAttribute("src", embedUrl);
    iframe.setAttribute("class", "ql-video");
    iframe.setAttribute("frameborder", "0");
    iframe.setAttribute("allowfullscreen", "true");
    iframe.setAttribute(
      "allow",
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
    );


    anchor.replaceWith(iframe);

  });


  return parsedDocument.body.innerHTML;

};


// =========================================================
// SANITIZE QUESTION HTML
//
// question.title / options bisa berisi HTML dari Quill
// (bold, list, link, embed video, formula KaTeX). String ini
// harus disaring sebelum dirender via dangerouslySetInnerHTML
// agar aman dari XSS, tapi tetap mengizinkan <iframe> untuk
// video embed Quill. Link video (YouTube/Vimeo) juga otomatis
// dikonversi menjadi iframe embed.
// =========================================================

const sanitizeQuestionHtml = (html) => {

  const rawHtml = String(html || "");


  const withEmbeddedVideos =
    convertVideoLinksToEmbeds(rawHtml);


  return DOMPurify.sanitize(withEmbeddedVideos, {
    ADD_TAGS: ["iframe"],
    ADD_ATTR: [
      "allow",
      "allowfullscreen",
      "class",
      "frameborder",
      "src",
      "target",
    ],
  });
};
// =========================================================
// SCHEDULE HELPERS
// =========================================================

const buildScheduleDateTime = (dateValue, timeValue, defaultTime) => {
  if (!dateValue) {
    return "";
  }

  const safeTime = timeValue || defaultTime;

  return `${dateValue}T${safeTime}:00`;
};

const parseDateTime = (value) => {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  return Number.isNaN(date.getTime()) ? null : date;
};

const formatAvailabilityDateTime = (value) => {
  const date = parseDateTime(value);

  if (!date) {
    return "";
  }

  return new Intl.DateTimeFormat("id-ID", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const getFormSchedule = (form) => {
  const settings = form.settings && typeof form.settings === "object" ? form.settings : {};

  const scheduleObject = form.schedule && typeof form.schedule === "object" ? form.schedule : {};

  const settingsSchedule =
    settings.schedule && typeof settings.schedule === "object" ? settings.schedule : {};

  const openAt =
    form.openAt ||
    scheduleObject.openAt ||
    settings.openAt ||
    settingsSchedule.openAt ||
    buildScheduleDateTime(form.openDate, form.openTime, "00:00");

  let closeAt =
    form.closeAt ||
    scheduleObject.closeAt ||
    settings.closeAt ||
    settingsSchedule.closeAt ||
    buildScheduleDateTime(form.closeDate, form.closeTime, "23:59");

  const responseDays = Number(form.responseDays ?? settings.responseDays);

  /*
    Response availability dipakai sebagai fallback jika admin
    tidak menentukan Close Date secara manual.
  */

  if (!closeAt && Number.isFinite(responseDays) && responseDays > 0) {
    const startingDate = parseDateTime(openAt) || parseDateTime(form.createdAt);

    if (startingDate) {
      const automaticClose = new Date(startingDate);

      automaticClose.setDate(automaticClose.getDate() + responseDays);

      closeAt = automaticClose.toISOString();
    }
  }

  const activationMode =
    form.activationMode ||
    settings.activationMode ||
    (settings.activateImmediately === false ? "scheduled" : "immediate");

  const enabled = Boolean(
    form.schedule?.enabled ??
      settings.scheduleEnabled ??
      settings.schedule?.enabled ??
      Boolean(openAt || closeAt || activationMode === "scheduled")
  );

  return {
    enabled,
    activationMode,
    openAt,
    closeAt,
  };
};

const getFormAvailability = (form, currentTime = new Date()) => {
  const schedule = getFormSchedule(form);

  const now = currentTime instanceof Date ? currentTime : new Date(currentTime);

  if (form.active === false) {
    return {
      status: "inactive",
      canFill: false,
      openAt: schedule.openAt,
      closeAt: schedule.closeAt,
      message: "Form ini sedang dinonaktifkan oleh admin.",
    };
  }

  const openDate = parseDateTime(schedule.openAt);

  const closeDate = parseDateTime(schedule.closeAt);

  if (schedule.activationMode === "scheduled" && !openDate) {
    return {
      status: "not-open",
      canFill: false,
      openAt: schedule.openAt,
      closeAt: schedule.closeAt,
      message: "Form ini belum dibuka oleh admin.",
    };
  }

  if (openDate && now < openDate) {
    return {
      status: "not-open",
      canFill: false,
      openAt: schedule.openAt,
      closeAt: schedule.closeAt,
      message: `Form belum dibuka. Form dapat dikerjakan mulai ${formatAvailabilityDateTime(
        schedule.openAt
      )}.`,
    };
  }

  if (closeDate && now > closeDate) {
    return {
      status: "closed",
      canFill: false,
      openAt: schedule.openAt,
      closeAt: schedule.closeAt,
      message: `Form sudah ditutup pada ${formatAvailabilityDateTime(schedule.closeAt)}.`,
    };
  }

  return {
    status: "open",
    canFill: true,
    openAt: schedule.openAt,
    closeAt: schedule.closeAt,
    message: "",
  };
};

// =========================================================
// SCORE HELPERS
// =========================================================

const normalizeComparableAnswer = (value) => {
  if (value === undefined || value === null) {
    return "";
  }

  if (Array.isArray(value)) {
    return value
      .map((item) => String(item).trim().toLowerCase())
      .sort()
      .join("|");
  }

  return String(value).trim().toLowerCase();
};

const calculateFormScore = (questions, answers) => {
  let score = 0;
  let maxScore = 0;
  let correctAnswers = 0;
  let incorrectAnswers = 0;
  let scoredQuestions = 0;

  /*
    IMPORTANT:

    Penilaian ini merupakan INTERNAL GRADING untuk admin.
    Perhitungan tetap dilakukan walaupun resultMode user adalah:

    - none
    - result
    - score

    resultMode hanya menentukan apa yang boleh dilihat user.
    Ia TIDAK menentukan apakah jawaban user dinilai atau tidak.
  */

  const questionResults = questions.map((question) => {
    const grading = question.grading && typeof question.grading === "object" ? question.grading : {};

    const scoringEnabled = Boolean(question.scoring ?? grading.enabled);

    const respondentAnswer = answers[question.id];

    const hasRespondentAnswer = hasAnswerValue(respondentAnswer);

    const rawCorrectAnswer = question.correctAnswer ?? grading.correctAnswer ?? "";

    const normalizedCorrectAnswer = normalizeComparableAnswer(rawCorrectAnswer);

    const normalizedRespondentAnswer = normalizeComparableAnswer(respondentAnswer);

    const points = scoringEnabled ? Math.max(Number(question.points ?? grading.points) || 0, 0) : 0;

    const hasCorrectAnswer = Boolean(normalizedCorrectAnswer);

    let isCorrect = null;

    if (scoringEnabled && points > 0 && hasCorrectAnswer) {
      isCorrect = hasRespondentAnswer && normalizedRespondentAnswer === normalizedCorrectAnswer;

      scoredQuestions += 1;

      maxScore += points;

      if (isCorrect) {
        score += points;

        correctAnswers += 1;
      } else {
        incorrectAnswers += 1;
      }
    }

    const earnedPoints = isCorrect === true ? points : 0;

    return {
      questionId: question.id,
      questionNumber: question.number ?? null,
      questionTitle: question.title || question.question || "",
      questionType: question.type || "short",
      userAnswer: respondentAnswer,
      correctAnswer: rawCorrectAnswer,
      scoring: scoringEnabled,
      scoringEnabled,
      isCorrect,
      points,
      maxPoints: points,
      earnedPoints,
      answered: hasRespondentAnswer,
    };
  });

  const percentage = maxScore > 0 ? Math.round((score / maxScore) * 100) : 0;

  return {
    score,
    maxScore,
    percentage,
    correctAnswers,
    incorrectAnswers,
    scoredQuestions,
    questionResults,
    gradingEnabled: scoredQuestions > 0,
  };
};

// =========================================================
// NORMALIZE QUESTION
// =========================================================

const normalizeQuestion = (question, index) => {
  const questionType =
    question.type ||
    (Array.isArray(question.options) && question.options.length > 0 ? "multiple" : "short");

  // =========================================================
  // NORMAL OPTIONS
  // =========================================================

  let questionOptions = Array.isArray(question.options)
    ? question.options.map((option) => String(option ?? "").trim()).filter(Boolean)
    : [];

  if (questionType === "yesno" && questionOptions.length === 0) {
    questionOptions = ["Yes", "No"];
  }

  // =========================================================
  // IMAGE ANSWER TYPE
  // =========================================================

  let imageAnswerType = String(question.imageAnswerType || "").trim().toLowerCase();

  if (!["multiple", "short", "long"].includes(imageAnswerType)) {
    /*
      Kompatibilitas dengan pertanyaan gambar lama.

      Jika terdapat imageOptions maka dianggap
      multiple choice.

      Jika tidak, default ke short answer.
    */

    if (Array.isArray(question.imageOptions) && question.imageOptions.length > 0) {
      imageAnswerType = "multiple";
    } else {
      imageAnswerType = "short";
    }
  }

  // =========================================================
  // IMAGE OPTIONS
  // =========================================================

  let imageOptions = Array.isArray(question.imageOptions)
    ? question.imageOptions.map((option) => String(option ?? "").trim()).filter(Boolean)
    : [];

  /*
    Mendukung kemungkinan CreateForm menyimpan
    pilihan pertanyaan gambar di field options.
  */

  if (
    questionType === "image" &&
    imageAnswerType === "multiple" &&
    imageOptions.length === 0 &&
    questionOptions.length > 0
  ) {
    imageOptions = questionOptions;
  }

  return {
    ...question,
    id: question.id || `question-${index + 1}`,
    title: String(question.title || question.question || "").trim() || `Question ${index + 1}`,
    type: questionType,
    required: question.required !== false,
    image: String(question.image || "").trim(),
    imageName: String(question.imageName || "").trim(),
    options: questionOptions,
    imageAnswerType,
    imageOptions,
    ratingMax: Math.min(Math.max(Number(question.ratingMax) || 5, 1), 10),
    scoring: Boolean(question.scoring ?? question.grading?.enabled),
    points: Number(question.points ?? question.grading?.points) || 0,
    correctAnswer: String(question.correctAnswer ?? question.grading?.correctAnswer ?? "").trim(),
    grading: {
      ...(question.grading && typeof question.grading === "object" ? question.grading : {}),
      enabled: Boolean(question.scoring ?? question.grading?.enabled),
      points: Number(question.points ?? question.grading?.points) || 0,
      correctAnswer: String(question.correctAnswer ?? question.grading?.correctAnswer ?? "").trim(),
    },
  };
};

// =========================================================
// NORMALIZE TIMER
// =========================================================

const normalizeTimer = (form) => {
  const timerSetting =
    form.settings?.timer && typeof form.settings.timer === "object" ? form.settings.timer : {};

  const timerEnabled =
    form.timerEnabled ?? form.settings?.timerEnabled ?? timerSetting.enabled ?? Boolean(form.duration);

  const rawDuration = Number(
    form.timerDuration ?? form.settings?.timerDuration ?? timerSetting.duration ?? form.duration ?? 20
  );

  const duration = Number.isFinite(rawDuration)
    ? Math.min(Math.max(Math.floor(rawDuration), MIN_TIMER_MINUTES), MAX_TIMER_MINUTES)
    : 20;

  return {
    enabled: Boolean(timerEnabled),
    duration,
  };
};
const reverseQuestionTypeMap = {
  SHORT_TEXT: "short",
  LONG_TEXT: "long",
  MULTIPLE_CHOICE: "multiple",
  CHECKBOXES: "checkbox",
  YES_NO: "yesno",
  RATING: "rating",
  MATH: "math",
  CODE: "code",
  IMAGE: "image",
};

const mapApiQuestionForFill = (q) => ({
  id: q.id,
  title: q.question_text,
  type: reverseQuestionTypeMap[q.question_type] || "short",
  required: q.is_required,
  scoring: q.is_auto_scored,
  points: q.points,
  language: q.code_language || "",
  options: (q.options || []).map((o) => o.option_text),
  optionIds: (q.options || []).reduce((acc, o) => {
    acc[o.option_text] = o.id;
    return acc;
  }, {}),
});


// =========================================================
// NORMALIZE FORM
// =========================================================

const normalizeForm = (form) => {
  const timer = normalizeTimer(form);

  const settings = form.settings && typeof form.settings === "object" ? form.settings : {};

  let questions = Array.isArray(form.questions) ? form.questions.map(normalizeQuestion) : [];

  /*
    Shuffle answer options dilakukan satu kali ketika form
    dimuat sehingga urutan tidak berubah setiap re-render.
  */

  if (settings.shuffleAnswers) {
    questions = questions.map((question) => {
      if (question.type === "multiple") {
        return {
          ...question,
          options: shuffleArray(question.options),
        };
      }

      if (question.type === "image" && question.imageAnswerType === "multiple") {
        return {
          ...question,
          imageOptions: shuffleArray(question.imageOptions),
        };
      }

      return question;
    });
  }

  /*
    Shuffle question order juga dilakukan satu kali saat form
    dibuka. ID pertanyaan tetap sama sehingga jawaban aman.
  */

  if (settings.shuffleQuestions) {
    questions = shuffleArray(questions);
  }

  const schedule = getFormSchedule(form);

  return {
    ...form,
    id: form.id,
    title: String(form.title || "").trim() || "Untitled Form",
    category: form.category || form.type || "Form",
    active: form.active !== false,
    oneTimeOnly: settings.oneTimeOnly !== false,
    shuffleQuestions: Boolean(settings.shuffleQuestions),
    shuffleAnswers: Boolean(settings.shuffleAnswers),
    resultMode: settings.resultMode || form.resultMode || "none",
    timerEnabled: timer.enabled,
    timerDuration: timer.duration,
    schedule,
    questions,
  };
};

// =========================================================
// FILL FORM
// =========================================================

function FillForm() {
  const navigate = useNavigate();

  const { id } = useParams();

  const { submitForm, submittedForms = [] } = useContext(FormContext);

  const { darkMode } = useContext(ThemeContext);

  // =========================================================
  // LIVE SCHEDULE / STORAGE VERSION
  // =========================================================

  const [currentTime, setCurrentTime] = useState(new Date());

  const [formVersion, setFormVersion] = useState(0);

  // =========================================================
  // LOAD SELECTED FORM
  // =========================================================

  const [form, setForm] = useState(null);
  const [isLoadingForm, setIsLoadingForm] = useState(true);

  useEffect(() => {
    let isMounted = true;

    const loadForm = async () => {
      setIsLoadingForm(true);
      try {
        const formRes = await getFormById(id);
        const questionsRes = await getQuestionsByForm(id);

        const apiForm = formRes.data.data;
        const apiQuestions = questionsRes.data.data || [];

        const mapped = normalizeForm({
          id: apiForm.id,
          title: apiForm.title,
          description: apiForm.description,
          customLink: apiForm.custom_url,
          type: apiForm.type,
          active: apiForm.status === "ACTIVE",
          questions: apiQuestions.map(mapApiQuestionForFill),
        });

        if (isMounted) setForm(mapped);
      } catch (error) {
        console.error("Gagal memuat form:", error);
        if (isMounted) setForm(null);
      } finally {
        if (isMounted) setIsLoadingForm(false);
      }
    };

    loadForm();
    return () => { isMounted = false; };
  }, [id, formVersion]);

  // =========================================================
  // FORM STATE
  // =========================================================

  const [currentQuestion, setCurrentQuestion] = useState(0);

  const [answers, setAnswers] = useState({});

  const [timeLeft, setTimeLeft] = useState(
    form?.timerEnabled ? form.timerDuration * 60 : 0
  );

  const [showAnswerWarning, setShowAnswerWarning] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [timerExpired, setTimerExpired] = useState(false);

  const hasSubmittedRef = useRef(false);

  const answersRef = useRef({});

  // =========================================================
  // IMAGE PREVIEW / ZOOM
  // =========================================================

  const [showImagePreview, setShowImagePreview] = useState(false);

  const [imageZoom, setImageZoom] = useState(1);

  const openImagePreview = () => {
    setImageZoom(1);
    setShowImagePreview(true);
  };

  const closeImagePreview = () => {
    setShowImagePreview(false);
    setImageZoom(1);
  };

  const zoomImageIn = () => {
    setImageZoom((previous) => Math.min(previous + 0.25, 4));
  };

  const zoomImageOut = () => {
    setImageZoom((previous) => Math.max(previous - 0.25, 0.5));
  };

  const resetImageZoom = () => {
    setImageZoom(1);
  };

  const handleImagePreviewWheel = (event) => {
    if (!event.ctrlKey) {
      return;
    }

    event.preventDefault();

    if (event.deltaY < 0) {
      setImageZoom((previous) => Math.min(previous + 0.25, 4));
    } else {
      setImageZoom((previous) => Math.max(previous - 0.25, 0.5));
    }
  };

  useEffect(() => {
    if (!showImagePreview) {
      return undefined;
    }

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        closeImagePreview();
      }

      if (event.key === "+" || event.key === "=") {
        setImageZoom((previous) => Math.min(previous + 0.25, 4));
      }

      if (event.key === "-") {
        setImageZoom((previous) => Math.max(previous - 0.25, 0.5));
      }

      if (event.key === "0") {
        setImageZoom(1);
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [showImagePreview]);

  // =========================================================
  // UPDATE CURRENT TIME
  //
  // Status jadwal diperiksa ulang secara berkala supaya form
  // otomatis berubah dari Not Open -> Open -> Closed tanpa
  // refresh halaman manual.
  // =========================================================

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(new Date());
    }, 15000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  // =========================================================
  // REFRESH FORM AFTER ADMIN CHANGES
  //
  // storage       = perubahan dari tab lain
  // custom event  = perubahan admin pada tab yang sama
  // focus/visible = sinkronisasi saat user kembali ke halaman
  // =========================================================

  useEffect(() => {
    const refreshForm = () => {
      setFormVersion((previous) => previous + 1);

      setCurrentTime(new Date());
    };

    const handleStorageChange = (event) => {
      if (event.key === FORMS_STORAGE_KEY || event.key === DELETED_FORMS_STORAGE_KEY) {
        refreshForm();
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        refreshForm();
      }
    };

    window.addEventListener("storage", handleStorageChange);

    window.addEventListener("focus", refreshForm);

    window.addEventListener("hidocs-forms-updated", refreshForm);

    window.addEventListener("hidocsFormsUpdated", refreshForm);

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);

      window.removeEventListener("focus", refreshForm);

      window.removeEventListener("hidocs-forms-updated", refreshForm);

      window.removeEventListener("hidocsFormsUpdated", refreshForm);

      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, []);

  // =========================================================
  // KEEP LATEST ANSWERS
  // =========================================================

  useEffect(() => {
    answersRef.current = answers;
  }, [answers]);

  // =========================================================
  // FORM INFORMATION
  // =========================================================

  const availability = useMemo(() => {
    if (!form) {
      return {
        status: "unavailable",
        canFill: false,
        message: "",
      };
    }

    return getFormAvailability(form, currentTime);
  }, [form, currentTime]);

  const canFillForm = Boolean(form && availability.canFill);

  const questions = form?.questions || [];

  const totalQuestions = questions.length;

  const question = questions[currentQuestion];

  const currentAnswer = question ? answers[question.id] : undefined;

  const currentQuestionAnswered = hasAnswerValue(currentAnswer);

  const isLastQuestion = currentQuestion === totalQuestions - 1;

  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  const answeredQuestionCount = useMemo(() => {
    return Object.values(answers).filter(hasAnswerValue).length;
  }, [answers]);

  // =========================================================
  // CHECK PREVIOUS SUBMISSION
  // =========================================================

  const alreadySubmitted = useMemo(() => {
    if (!form) {
      return false;
    }

    return submittedForms.some((submittedForm) => {
      const submittedFormId = submittedForm.formId ?? submittedForm.id;

      return String(submittedFormId) === String(form.id);
    });
  }, [form, submittedForms]);

  // =========================================================
  // REDIRECT INVALID OR PREVIOUSLY SUBMITTED FORM
  // =========================================================

  useEffect(() => {
    if (isLoadingForm) {
      return;
    }

    if (!form) {
      navigate("/dashboard", {
        replace: true,
      });

      return;
    }

    if (form.oneTimeOnly && alreadySubmitted && !hasSubmittedRef.current) {
      navigate("/history", {
        replace: true,
      });
    }
  }, [form, alreadySubmitted, navigate]);

  // =========================================================
  // RESET FORM STATE WHEN FORM CHANGES
  // =========================================================

  useEffect(() => {
    if (!form) {
      return;
    }

    hasSubmittedRef.current = false;

    answersRef.current = {};

    setAnswers({});

    setCurrentQuestion(0);

    setShowAnswerWarning(false);

    setIsSubmitting(false);

    setTimerExpired(false);

    setTimeLeft(form.timerEnabled ? form.timerDuration * 60 : 0);
  }, [form?.id, form?.timerEnabled, form?.timerDuration]);

  // =========================================================
  // COMPLETE NORMAL SUBMISSION
  // =========================================================

  const completeSubmission = useCallback(async () => {
    if (hasSubmittedRef.current || !form || !canFillForm || isSubmitting) {
      return;
    }

    hasSubmittedRef.current = true;
    setIsSubmitting(true);

    try {
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      const respondentEmail = currentUser.email || "";

      const answerPayload = questions.map((q) => {
        const answerValue = answersRef.current[q.id];
        const isChoiceType = ["multiple", "checkbox", "yesno"].includes(q.type);

        if (isChoiceType) {
          return {
            question_id: q.id,
            selected_option_id: q.optionIds?.[answerValue] || null,
            answer_text: "",
          };
        }
        return {
          question_id: q.id,
          selected_option_id: null,
          answer_text: String(answerValue || ""),
        };
      });

      const response = await submitFormApi(form.id, {
        respondent_email: respondentEmail,
        passcode: "",
        is_auto_submitted: false,
        answers: answerPayload,
      });

      const result = response.data.data;

      navigate("/submit-success", {
        replace: true,
        state: {
          formId: form.id,
          formTitle: form.title,
          submittedAt: result.submitted_at,
          status: "completed",
          score: result.total_score,
          totalQuestions,
        },
      });
    } catch (error) {
      console.error("Gagal mengirim form:", error);
      hasSubmittedRef.current = false;
      setIsSubmitting(false);
      alert(
        error.response?.data?.message ||
        "Terjadi kesalahan saat mengirim form. Silakan coba lagi."
      );
    }
  }, [form, canFillForm, isSubmitting, navigate, questions, totalQuestions]);

  // =========================================================
  // HANDLE TIMER EXPIRED
  // =========================================================

  const handleTimeExpired = useCallback(() => {
    if (hasSubmittedRef.current || !form) {
      return;
    }

    hasSubmittedRef.current = true;

    setTimerExpired(true);

    setIsSubmitting(true);

    const expiredAt = new Date().toISOString();

    try {
      /*
        Walaupun waktu habis, jawaban yang sudah diisi tetap
        dinilai untuk kebutuhan admin. User tetap tidak otomatis
        mendapatkan akses nilai kecuali resultMode mengizinkannya.
      */

      const scoreResult = calculateFormScore(questions, answersRef.current);

      const result = submitForm({
        formId: form.id,
        title: form.title,
        answers: answersRef.current,
        answeredQuestions: Object.values(answersRef.current).filter(hasAnswerValue).length,
        totalQuestions,
        status: "time-expired",
        isTimeExpired: true,
        submittedAt: expiredAt,
        resultMode: form.resultMode,
        score: scoreResult.score,
        maxScore: scoreResult.maxScore,
        percentage: scoreResult.percentage,
        correctAnswers: scoreResult.correctAnswers,
        incorrectAnswers: scoreResult.incorrectAnswers,
        scoredQuestions: scoreResult.scoredQuestions,
        questionResults: scoreResult.questionResults,
        gradingEnabled: scoreResult.gradingEnabled,
        grading: {
          enabled: scoreResult.gradingEnabled,
          score: scoreResult.score,
          maxScore: scoreResult.maxScore,
          percentage: scoreResult.percentage,
          correctAnswers: scoreResult.correctAnswers,
          incorrectAnswers: scoreResult.incorrectAnswers,
          scoredQuestions: scoreResult.scoredQuestions,
        },
      });

      if (!result?.success) {
        console.error("Gagal mencatat waktu habis:", result?.message);
      }

      navigate("/history", {
        replace: true,
        state: {
          timeExpired: true,
          formId: form.id,
          formTitle: form.title,
          submittedAt: expiredAt,
        },
      });
    } catch (error) {
      console.error("Gagal menyimpan riwayat waktu habis:", error);

      navigate("/history", {
        replace: true,
        state: {
          timeExpired: true,
          formId: form.id,
          formTitle: form.title,
        },
      });
    }
  }, [form, navigate, questions, submitForm, totalQuestions]);

  // =========================================================
  // TIMER
  // =========================================================

  useEffect(() => {
    if (
      !form ||
      !form.timerEnabled ||
      !canFillForm ||
      alreadySubmitted ||
      isSubmitting ||
      hasSubmittedRef.current
    ) {
      return undefined;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((previousTime) => {
        if (previousTime <= 1) {
          window.clearInterval(timer);

          window.setTimeout(handleTimeExpired, 0);

          return 0;
        }

        return previousTime - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [form, alreadySubmitted, isSubmitting, handleTimeExpired, canFillForm]);

  // =========================================================
  // FORMAT TIMER
  // =========================================================

  const timerMinutes = String(Math.floor(timeLeft / 60)).padStart(2, "0");

  const timerSeconds = String(timeLeft % 60).padStart(2, "0");

  const timerIsWarning = Boolean(form?.timerEnabled) && timeLeft <= 300;

  // =========================================================
  // SAVE ANSWER
  // =========================================================

  const saveAnswer = (value) => {
    if (!question || !canFillForm || isSubmitting || timerExpired) {
      return;
    }

    setAnswers((previousAnswers) => {
      const updatedAnswers = {
        ...previousAnswers,
        [question.id]: value,
      };

      answersRef.current = updatedAnswers;

      return updatedAnswers;
    });

    setShowAnswerWarning(false);
  };

  // =========================================================
  // QUESTION NAVIGATION
  // =========================================================

  const goToQuestion = (index) => {
    if (!canFillForm || isSubmitting || timerExpired || index < 0 || index >= totalQuestions) {
      return;
    }

    if (index > currentQuestion && question?.required && !currentQuestionAnswered) {
      setShowAnswerWarning(true);

      return;
    }

    setCurrentQuestion(index);

    setShowAnswerWarning(false);

    window.scrollTo({
      top: 0,
      left: 0,
      behavior: "smooth",
    });
  };

  const nextQuestion = () => {
    if (!canFillForm || isSubmitting || timerExpired) {
      return;
    }

    if (question?.required && !currentQuestionAnswered) {
      setShowAnswerWarning(true);

      return;
    }

    if (!isLastQuestion) {
      goToQuestion(currentQuestion + 1);
    }
  };

  const previousQuestion = () => {
    if (!canFillForm || isSubmitting || timerExpired) {
      return;
    }

    if (currentQuestion > 0) {
      setCurrentQuestion((previous) => previous - 1);

      setShowAnswerWarning(false);
    }
  };

  // =========================================================
  // SUBMIT BUTTON
  // =========================================================

  const handleSubmit = () => {
    if (!canFillForm || isSubmitting || timerExpired) {
      return;
    }

    if (question?.required && !currentQuestionAnswered) {
      setShowAnswerWarning(true);

      return;
    }

    const unansweredRequiredIndex = questions.findIndex((item) => {
      return item.required && !hasAnswerValue(answers[item.id]);
    });

    if (unansweredRequiredIndex !== -1) {
      setCurrentQuestion(unansweredRequiredIndex);

      setShowAnswerWarning(true);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      return;
    }

    completeSubmission();
  };

  // =========================================================
  // RENDER CHOICE OPTIONS
  // =========================================================

  const renderChoiceOptions = (customOptions) => {
  let availableOptions = Array.isArray(customOptions) ? customOptions : question.options;

  if (question.type === "yesno" && availableOptions.length === 0) {
    availableOptions = ["Yes", "No"];
  }

  if (!Array.isArray(availableOptions)) {
    availableOptions = [];
  }

  // Do not use React hooks inside this nested renderer.
  // This function is called conditionally depending on question type,
  // so useMemo here can break the Hooks call order when navigating
  // from Multiple Choice to Math/Code and cause a blank page.
  const sanitizedOptionsHtml =
    availableOptions.map((option) =>
      sanitizeQuestionHtml(option)
    );

  const sanitizedOptionMarkup =
    sanitizedOptionsHtml.map((html) => ({
      __html: html,
    }));

  if (availableOptions.length === 0) {
    return (
      <div className="fillform-warning">
        <FaExclamationTriangle />

        <div>
          <strong>No answer options</strong>

          <span>This question does not contain any answer options.</span>
        </div>
      </div>
    );
  }

  return (
    <fieldset className="options-fieldset">
      <legend className="sr-only">Answer choices</legend>

      <div className="options-list">
        {availableOptions.map((option, index) => {
          const isSelected = currentAnswer === option;

          return (
            <label
              key={`${question.id}-${option}-${index}`}
              className={isSelected ? "option-card selected" : "option-card"}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={option}
                checked={isSelected}
                disabled={!canFillForm || isSubmitting || timerExpired}
                onChange={() => saveAnswer(option)}
              />

              <span className="option-letter">{String.fromCharCode(65 + index)}</span>

              <span
                className="option-text"
                dangerouslySetInnerHTML={sanitizedOptionMarkup[index]}
              />

              <span className="option-check">
                <FaCheckCircle />
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
};
 
    
  // =========================================================
  // RENDER TEXT ANSWER
  // =========================================================

  const renderTextAnswer = (answerType = question.type) => {
    if (answerType === "long") {
      return (
        <div className="fillform-text-answer">
          <textarea
            value={currentAnswer || ""}
            disabled={!canFillForm || isSubmitting || timerExpired}
            onChange={(event) => saveAnswer(event.target.value)}
            placeholder="Type your answer here..."
            rows={6}
          />
        </div>
      );
    }

    let placeholder = "Type your answer here...";

    if (question.type === "image") {
      placeholder = "Type your answer based on the image...";
    }

    return (
      <div className="fillform-text-answer">
        <input
          type="text"
          value={currentAnswer || ""}
          disabled={!canFillForm || isSubmitting || timerExpired}
          onChange={(event) => saveAnswer(event.target.value)}
          placeholder={placeholder}
        />
      </div>
    );
  };


  // =========================================================
  // MATH ANSWER
  // User types a KaTeX/LaTeX expression and sees a live preview.
  // Examples:
  // x = -2
  // b^2
  // x^2 + y^2 = z^2
  // \frac{a}{b}
  // =========================================================

  const getMathPreviewHtml = (value) => {
    const expression = String(value || "").trim();

    if (!expression) {
      return "";
    }

    try {
      return katex.renderToString(expression, {
        throwOnError: false,
        displayMode: true,
        strict: false,
        trust: false,
      });
    } catch (error) {
      console.error("Math preview error:", error);

      return "";
    }
  };


  const renderMathAnswer = () => {
    const mathValue = String(currentAnswer || "");

    const mathPreviewHtml =
      getMathPreviewHtml(mathValue);

    return (
      <section className="fillform-special-answer math-answer-card">


        <div className="special-answer-heading">


          <div className="special-answer-icon math">

            <FaCalculator />

          </div>


          <div>

            <span>
              Math Answer
            </span>

            <strong>
              Enter your mathematical expression
            </strong>

          </div>


        </div>


        <div className="math-answer-input-wrapper">

          <label htmlFor={`math-answer-${question.id}`}>
            Your Answer
          </label>

          <input
            id={`math-answer-${question.id}`}
            type="text"
            value={mathValue}
            disabled={!canFillForm || isSubmitting || timerExpired}
            onChange={(event) =>
              saveAnswer(event.target.value)
            }
            placeholder="Example: x = -2, b^2, \frac{a}{b}"
            autoComplete="off"
            spellCheck={false}
          />

          <small>
            You can use expressions such as <code>b^2</code>,{" "}
            <code>x^2 + y^2</code>, <code>\sqrt{"{16}"}</code>, or{" "}
            <code>\frac{"{a}{b}"}</code>.
          </small>

        </div>


        <div
          className={
            mathValue.trim()
              ? "math-preview-box has-value"
              : "math-preview-box"
          }
        >

          <div className="math-preview-heading">

            <span>
              Live Preview
            </span>

            <small>
              KaTeX
            </small>

          </div>


          {mathValue.trim() ? (

            <div
              className="math-preview-content"
              dangerouslySetInnerHTML={{
                __html:
                  mathPreviewHtml,
              }}
            />

          ) : (

            <div className="math-preview-empty">

              <FaCalculator />

              <span>
                Your formula preview will appear here.
              </span>

            </div>

          )}


        </div>


      </section>
    );
  };


  // =========================================================
  // CODE ANSWER
  // Multiline code editor-style textarea.
  // Code answers are best suited for manual grading because
  // different implementations can still be correct.
  // =========================================================

  const handleCodeKeyDown = (event) => {
    if (event.key !== "Tab") {
      return;
    }

    event.preventDefault();

    const textarea =
      event.currentTarget;

    const start =
      textarea.selectionStart;

    const end =
      textarea.selectionEnd;

    const currentValue =
      String(currentAnswer || "");

    const updatedValue =
      `${currentValue.slice(0, start)}  ${currentValue.slice(end)}`;

    saveAnswer(updatedValue);

    window.requestAnimationFrame(() => {
      textarea.selectionStart =
        start + 2;

      textarea.selectionEnd =
        start + 2;
    });
  };


  const renderCodeAnswer = () => {
    const codeValue =
      String(currentAnswer || "");

    const codeLines =
      codeValue
        ? codeValue.split("\n").length
        : 1;

    return (
      <section className="fillform-special-answer code-answer-card">


        <div className="special-answer-heading">


          <div className="special-answer-icon code">

            <FaCode />

          </div>


          <div>

            <span>
              Code Answer
            </span>

            <strong>
              Write your code below
            </strong>

          </div>


          <div className="code-answer-lines">

            {codeLines}
            {" "}
            {codeLines === 1
              ? "line"
              : "lines"
            }

          </div>


        </div>


        <div className="code-editor-shell">


          <div className="code-editor-topbar">

            <span></span>
            <span></span>
            <span></span>

            <strong>
              answer
            </strong>

          </div>


          <textarea
            value={codeValue}
            disabled={!canFillForm || isSubmitting || timerExpired}
            onChange={(event) =>
              saveAnswer(event.target.value)
            }
            onKeyDown={
              handleCodeKeyDown
            }
            placeholder={`Example:\nfunction sum(a, b) {\n  return a + b;\n}`}
            rows={12}
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
          />


        </div>


        <div className="code-answer-help">

          <FaCode />

          <span>
            Use Tab to indent. Your answer will be saved exactly as written.
          </span>

        </div>


      </section>
    );
  };


  // =========================================================
  // RENDER RATING
  // =========================================================

  const renderRating = () => {
    return (
      <div className="fillform-rating-list">
        {Array.from({
          length: question.ratingMax,
        }).map((_, index) => {
          const rating = index + 1;

          const isSelected = Number(currentAnswer) === rating;

          return (
            <button
              key={rating}
              type="button"
              className={isSelected ? "fillform-rating-btn selected" : "fillform-rating-btn"}
              disabled={isSubmitting || timerExpired}
              onClick={() => saveAnswer(rating)}
            >
              <FaStar />

              <span>{rating}</span>
            </button>
          );
        })}
      </div>
    );
  };

  // =========================================================
  // RENDER IMAGE ANSWER
  // =========================================================

  const renderImageAnswer = () => {
    const imageAnswerType = question.imageAnswerType || "short";

    if (imageAnswerType === "multiple") {
      return renderChoiceOptions(question.imageOptions);
    }

    if (imageAnswerType === "long") {
      return renderTextAnswer("long");
    }

    return renderTextAnswer("short");
  };

  // =========================================================
  // RENDER ANSWER FIELD
  // =========================================================

  const renderAnswerField = () => {
    if (!question) {
      return null;
    }

    if (question.type === "multiple" || question.type === "yesno") {
      return renderChoiceOptions(question.options);
    }

    if (question.type === "rating") {
      return renderRating();
    }

    if (question.type === "image") {
      return renderImageAnswer();
    }

    if (question.type === "long") {
      return renderTextAnswer("long");
    }

    if (question.type === "code") {
      return renderCodeAnswer();
    }

    if (question.type === "math") {
      return renderMathAnswer();
    }

    return renderTextAnswer("short");
  };

  // =========================================================
// MEMOIZED SANITIZED QUESTION TITLE
//
// Timer men-trigger re-render setiap detik. Tanpa memoization,
// dangerouslySetInnerHTML akan mereset iframe video setiap detik
// sehingga video ter-reload terus dan terlihat "kedip-kedip".
// =========================================================

const sanitizedQuestionTitle = useMemo(() => {
  if (!question) {
    return "";
  }

  return sanitizeQuestionHtml(question.title);
}, [question?.id, question?.title]);

const sanitizedQuestionTitleMarkup = useMemo(
  () => ({ __html: sanitizedQuestionTitle }),
  [sanitizedQuestionTitle]
);

  // =========================================================
  // INVALID FORM
  // =========================================================

  if (!form) {
    return null;
  }

  if (alreadySubmitted && form.oneTimeOnly && !hasSubmittedRef.current) {
    return null;
  }

  // =========================================================
  // SCHEDULE NOT AVAILABLE
  // =========================================================

  if (!canFillForm) {
    const isClosed = availability.status === "closed";

    const isInactive = availability.status === "inactive";

    return (
      <div className={darkMode ? "fillform-page dark" : "fillform-page"}>
        <div className="fillform-empty-state">
          {isClosed || isInactive ? <FaExclamationTriangle /> : <FaClock />}

          <h2>
            {isInactive
              ? "Form Sedang Dinonaktifkan"
              : isClosed
              ? "Form Sudah Ditutup"
              : "Form Belum Dibuka"}
          </h2>

          <p>{availability.message}</p>

          {availability.openAt && !isClosed && !isInactive && (
            <p>
              Waktu buka: <strong>{formatAvailabilityDateTime(availability.openAt)}</strong>
            </p>
          )}

          {availability.closeAt && (
            <p>
              Waktu tutup: <strong>{formatAvailabilityDateTime(availability.closeAt)}</strong>
            </p>
          )}

          <button type="button" onClick={() => navigate("/forms")}>
            Kembali ke Forms
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // EMPTY QUESTIONS
  // =========================================================

  if (totalQuestions === 0) {
    return (
      <div className={darkMode ? "fillform-page dark" : "fillform-page"}>
        <div className="fillform-empty-state">
          <FaClipboardList />

          <h2>No Questions Available</h2>

          <p>This form does not contain any questions yet.</p>

          <button type="button" onClick={() => navigate("/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // =========================================================
  // RETURN
  // =========================================================

  return (
    <div className={darkMode ? "fillform-page dark" : "fillform-page"}>
      {/* =====================================================
          HEADER
      ===================================================== */}

      <header className="fillform-header">
        <div className="fillform-brand">
          <div className="fillform-logo-wrapper">
            <img src={logo} alt="HiDocs Logo" />
          </div>

          <div className="fillform-brand-text">
            <h2>HiDocs</h2>

            <span>{form.title}</span>
          </div>
        </div>

        <div className="fillform-header-progress">
          <div className="fillform-progress-information">
            <span>
              Question {currentQuestion + 1} of {totalQuestions}
            </span>

            <strong>{Math.round(progress)}%</strong>
          </div>

          <div className="fillform-progress-track">
            <div
              className="fillform-progress-fill"
              style={{
                width: `${progress}%`,
              }}
            ></div>
          </div>
        </div>

        <div className={timerIsWarning ? "fillform-timer warning" : "fillform-timer"}>
          {form.timerEnabled ? (
            <>
              <FaClock />

              <div>
                <span>Time Left</span>

                <strong>
                  {timerMinutes}:{timerSeconds}
                </strong>
              </div>
            </>
          ) : (
            <>
              <FaInfinity />

              <div>
                <span>Timer</span>

                <strong>No Limit</strong>
              </div>
            </>
          )}
        </div>
      </header>

      {/* =====================================================
          BODY
      ===================================================== */}

      <div className="fillform-body">
        {/* ===================================================
            SIDEBAR
        =================================================== */}

        <aside className="question-sidebar">
          <div className="sidebar-heading">
            <div>
              <span>Navigation</span>

              <h3>Questions</h3>
            </div>

            <strong>
              {currentQuestion + 1}/{totalQuestions}
            </strong>
          </div>

          <div className="question-grid">
            {questions.map((item, index) => {
              const isCurrent = currentQuestion === index;

              const isAnswered = hasAnswerValue(answers[item.id]);

              const isLocked = index > currentQuestion && question?.required && !currentQuestionAnswered;

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => goToQuestion(index)}
                  disabled={isLocked || !canFillForm || isSubmitting || timerExpired}
                  className={[
                    "question-number",
                    isCurrent ? "active" : "",
                    !isCurrent && isAnswered ? "answered" : "",
                    isLocked ? "locked" : "",
                  ]
                    .filter(Boolean)
                    .join(" ")}
                >
                  {isAnswered && !isCurrent ? <FaCheckCircle /> : index + 1}
                </button>
              );
            })}
          </div>

          <div className="question-legend">
            <div className="legend-item">
              <span className="legend current"></span>

              <p>Current</p>
            </div>

            <div className="legend-item">
              <span className="legend answered"></span>

              <p>Answered</p>
            </div>

            <div className="legend-item">
              <span className="legend"></span>

              <p>Not Answered</p>
            </div>
          </div>

          <div className="question-footer-status">
            <span>
              {answeredQuestionCount} of {totalQuestions} answered
            </span>
          </div>
        </aside>

        {/* ===================================================
            QUESTION CONTENT
        =================================================== */}

        <main className="question-content">
          <article className="question-card">
            <div className="question-header">
              <div className="question-heading-content">
                <span className="question-label">{form.category} Question</span>

                <h1>
                  <span className="question-index">{currentQuestion + 1}.</span>

                 
                  <span
                    className="question-title-html"
                    dangerouslySetInnerHTML={sanitizedQuestionTitleMarkup}
                  />

                </h1>

                <p className="question-instruction">
                  {question.required
                    ? "This question must be answered before continuing."
                    : "This question is optional."}
                </p>
              </div>

              <div className="question-header-icon">
                <FaClipboardList />
              </div>
            </div>

            {/* =================================================
                QUESTION IMAGE
            ================================================= */}

            {question.image && (
              <div className="question-image-wrapper">
                <button
                  type="button"
                  className="question-image question-image-clickable"
                  onClick={openImagePreview}
                  title="Click to zoom image"
                  aria-label="Open question image preview"
                >
                  <img
                    src={question.image}
                    alt={question.imageName || `Illustration for question ${currentQuestion + 1}`}
                  />

                  <span className="question-image-zoom-hint">
                    <FaExpand />
                    <span>Click to zoom</span>
                  </span>
                </button>
              </div>
            )}

            {/* =================================================
                ANSWER FIELD
            ================================================= */}

            {renderAnswerField()}

            {/* =================================================
                REQUIRED WARNING
            ================================================= */}

            {showAnswerWarning && (
              <div className="fillform-warning" role="alert">
                <FaExclamationTriangle />

                <div>
                  <strong>Answer this question first</strong>

                  <span>Complete this required question before continuing.</span>
                </div>
              </div>
            )}

            {/* =================================================
                TIMER WARNING
            ================================================= */}

            {form.timerEnabled && timerIsWarning && timeLeft > 0 && (
              <div className="fillform-warning" role="status">
                <FaClock />

                <div>
                  <strong>Time is running out</strong>

                  <span>The form will close automatically when the timer reaches zero.</span>
                </div>
              </div>
            )}

            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="question-footer">
              <button
                type="button"
                className="previous-btn"
                onClick={previousQuestion}
                disabled={currentQuestion === 0 || !canFillForm || isSubmitting || timerExpired}
              >
                <FaArrowLeft />

                <span>Previous</span>
              </button>

              <div className="question-footer-status">
                <span>
                  {isSubmitting
                    ? "Processing..."
                    : currentQuestionAnswered
                    ? "Answer saved"
                    : question.required
                    ? "Answer required"
                    : "Optional question"}
                </span>
              </div>

              {isLastQuestion ? (
                <button
                  type="button"
                  className="submit-btn"
                  onClick={handleSubmit}
                  disabled={
                    !canFillForm ||
                    isSubmitting ||
                    timerExpired ||
                    (question.required && !currentQuestionAnswered)
                  }
                >
                  <FaCheckCircle />

                  <span>{isSubmitting ? "Submitting..." : "Submit Form"}</span>
                </button>
              ) : (
                <button
                  type="button"
                  className="next-btn"
                  onClick={nextQuestion}
                  disabled={
                    !canFillForm ||
                    isSubmitting ||
                    timerExpired ||
                    (question.required && !currentQuestionAnswered)
                  }
                >
                  <span>Next</span>

                  <FaArrowRight />
                </button>
              )}
            </div>
          </article>
        </main>
      </div>

      {/* =====================================================
          IMAGE PREVIEW / ZOOM
      ===================================================== */}

      {showImagePreview && question?.image && (
        <div
          className="image-preview-overlay"
          role="presentation"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              closeImagePreview();
            }
          }}
        >
          <section
            className="image-preview-modal"
            role="dialog"
            aria-modal="true"
            aria-label="Question image preview"
          >
            <header className="image-preview-header">
              <div>
                <span>Question Image</span>
                <strong>Zoom Preview</strong>
              </div>

              <button
                type="button"
                className="image-preview-close"
                onClick={closeImagePreview}
                title="Close preview"
                aria-label="Close image preview"
              >
                <FaTimes />
              </button>
            </header>

            <div className="image-preview-toolbar">
              <button
                type="button"
                onClick={zoomImageOut}
                disabled={imageZoom <= 0.5}
                title="Zoom out"
                aria-label="Zoom out"
              >
                <FaSearchMinus />
              </button>

              <span className="image-preview-zoom-value">
                {Math.round(imageZoom * 100)}%
              </span>

              <button
                type="button"
                onClick={zoomImageIn}
                disabled={imageZoom >= 4}
                title="Zoom in"
                aria-label="Zoom in"
              >
                <FaSearchPlus />
              </button>

              <button
                type="button"
                className="image-preview-reset"
                onClick={resetImageZoom}
                title="Reset zoom"
              >
                <FaUndo />
                <span>Reset</span>
              </button>
            </div>

            <div
              className="image-preview-scroll-area"
              onWheel={handleImagePreviewWheel}
            >
              <div
                className="image-preview-canvas"
                style={{
                  width: `${Math.max(imageZoom, 1) * 100}%`,
                  minWidth: `${Math.max(imageZoom, 1) * 100}%`,
                }}
              >
                <img
                  src={question.image}
                  alt={question.imageName || `Question ${currentQuestion + 1}`}
                  draggable="false"
                  style={{
                    transform: `scale(${imageZoom < 1 ? imageZoom : 1})`,
                  }}
                />
              </div>
            </div>

            <footer className="image-preview-footer">
              <span>
                Zoom with + / −, press 0 to reset, or hold Ctrl while scrolling.
              </span>

              <button type="button" onClick={closeImagePreview}>
                Close
              </button>
            </footer>
          </section>
        </div>
      )}
    </div>
  );
}

export default FillForm;