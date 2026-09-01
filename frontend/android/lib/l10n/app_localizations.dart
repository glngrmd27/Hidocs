import 'package:flutter/material.dart';

class AppLocalizations {
  final Locale locale;

  AppLocalizations(this.locale);

  static AppLocalizations of(BuildContext context) {
    return Localizations.of<AppLocalizations>(context, AppLocalizations)!;
  }

  bool get isIndonesian => locale.languageCode == 'id';

  // Common
  String get appName => 'HiDocs!';
  String get loading => isIndonesian ? 'Memuat...' : 'Loading...';
  String get refresh => isIndonesian ? 'Segarkan' : 'Refresh';
  String get cancel => isIndonesian ? 'Batal' : 'Cancel';
  String get ok => isIndonesian ? 'OK' : 'OK';
  String get save => isIndonesian ? 'Simpan' : 'Save';
  String get delete => isIndonesian ? 'Hapus' : 'Delete';
  String get edit => isIndonesian ? 'Edit' : 'Edit';
  String get close => isIndonesian ? 'Tutup' : 'Close';
  String get search => isIndonesian ? 'Cari' : 'Search';
  String get settings => isIndonesian ? 'Pengaturan' : 'Settings';

  // User Home Screen
  String get hello => isIndonesian ? 'Halo' : 'Hello';
  String get home => isIndonesian ? 'Beranda' : 'Home';
  String get history => isIndonesian ? 'Riwayat' : 'History';
  String get profile => isIndonesian ? 'Profil' : 'Profile';
  
  String userHomeSubtitle(String name) => isIndonesian
      ? 'Isi formulir dan kirim jawaban Anda'
      : 'Fill out forms and submit your answers';

  String get scanQR => isIndonesian ? 'Pindai Barcode / QR' : 'Scan Barcode / QR';
  String get scanQRSubtitle => isIndonesian ? 'Pindai kode formulir' : 'Scan form code';
  String get enterLink => isIndonesian ? 'Masukkan Tautan' : 'Enter Link';
  String get enterLinkSubtitle => isIndonesian ? 'Tempel tautan formulir' : 'Paste form link';
  String get enterFormLinkTitle => isIndonesian ? 'Masukkan Tautan Formulir' : 'Enter Form Link';
  String get enterFormLinkDesc => isIndonesian
      ? 'Tempelkan tautan formulir untuk membuka dan mengisinya.'
      : 'Paste the form link to open and fill it out.';
  String get openForm => isIndonesian ? 'Buka Formulir' : 'Open Form';
  String get alreadySubmittedForm => isIndonesian
      ? 'Anda sudah mengirimkan formulir ini'
      : "You've already submitted this form";

  String get recentForms => isIndonesian ? 'Formulir Terkini' : 'Recent Forms';
  String get noRecentForms => isIndonesian ? 'Belum ada formulir' : 'No recent forms';
  String get noRecentFormsDesc => isIndonesian
      ? 'Formulir yang Anda isi akan muncul di sini'
      : 'Forms you fill out will appear here';

  String get noSubmissionHistory => isIndonesian ? 'Belum ada riwayat' : 'No submission history';
  String get noSubmissionHistoryDesc => isIndonesian
      ? 'Formulir yang sudah Anda kirim akan muncul di sini'
      : 'Forms you have submitted will appear here';

  String get historyDetailTitle => isIndonesian ? 'Detail Riwayat' : 'History Detail';
  String get respondent => isIndonesian ? 'Responden' : 'Respondent';
  String get submittedAt => isIndonesian ? 'Dikirim' : 'Submitted';
  String get duration => isIndonesian ? 'Durasi' : 'Duration';
  String get score => isIndonesian ? 'Nilai' : 'Score';
  String get yourAnswers => isIndonesian ? 'Jawaban Anda' : 'Your Answers';
  String get answerLabel => isIndonesian ? 'Jawaban' : 'Answer';
  String get gradedLabel => isIndonesian ? 'Dinilai' : 'Graded';

  String get submitted => isIndonesian ? 'Terkirim' : 'Submitted';
  String get youHaveSubmitted => isIndonesian
      ? 'Anda telah mengirim formulir ini'
      : 'You have submitted this form';

  // Settings
  String get language => isIndonesian ? 'Bahasa' : 'Language';
  String get languageDescription => isIndonesian
      ? 'Pilih bahasa aplikasi'
      : 'Choose app language';
  String get indonesian => 'Bahasa Indonesia';
  String get english => 'English';
  String get selectLanguage => isIndonesian ? 'Pilih Bahasa' : 'Select Language';
  
  String get darkMode => isIndonesian ? 'Mode Gelap' : 'Dark Mode';
  String get lightMode => isIndonesian ? 'Mode Terang' : 'Light Mode';
  String get switchTheme => isIndonesian ? 'Ganti tema aplikasi' : 'Switch app theme';
  
  String get modeUser => isIndonesian ? 'Mode User' : 'User Mode';
  String get modeCreator => isIndonesian ? 'Mode Creator' : 'Creator Mode';
  String get modeUserDesc => isIndonesian ? 'Mengisi dan mengerjakan formulir' : 'Fill out and complete forms';
  String get modeCreatorDesc => isIndonesian ? 'Membuat dan mengelola formulir' : 'Create and manage forms';
  
  String get aboutHidocs => isIndonesian ? 'Tentang HiDocs!' : 'About HiDocs!';
  String get aboutTitle => isIndonesian ? 'Tentang HiDocs' : 'About HiDocs';
  String get aboutSectionTitle => isIndonesian ? 'Tentang' : 'About';
  String get aboutDescription => isIndonesian
      ? 'HiDocs! (Form & Exam Maker) adalah aplikasi multi-platform (Web & Mobile) yang menyediakan solusi efisien untuk membuat, mengelola, dan mengisi formulir digital, kuis, serta ujian online. Platform ini memiliki dua mode pengguna: Mode Creator untuk merancang formulir, mengelola soal, dan menganalisis respons, serta Mode User untuk mengakses formulir melalui tautan atau QR Code, mengirimkan jawaban, dan melihat riwayat pengiriman.'
      : 'HiDocs! (Form & Exam Maker) is a multi-platform application (Web & Mobile) that provides an efficient solution for creating, managing, and completing digital forms, quizzes, and online exams. The platform features two user modes: Creator Mode for designing forms, managing questions, and analyzing responses, and User Mode for accessing forms via links or QR Codes, submitting answers, and viewing submission history.';

  String get creatorFeatures => isIndonesian ? 'Fitur Creator' : 'Creator Features';
  String get userFeatures => isIndonesian ? 'Fitur User' : 'User Features';
  
  String get featCreateManageForms => isIndonesian ? 'Buat & Kelola Formulir' : 'Create & Manage Forms';
  String get featManageQuestions => isIndonesian ? 'Kelola Pertanyaan' : 'Manage Questions';
  String get featGenerateQr => isIndonesian ? 'Buat Tautan & QR Code' : 'Generate Link & QR Code';
  String get featViewResponses => isIndonesian ? 'Lihat Respons' : 'View Responses';
  String get featReviewGrade => isIndonesian ? 'Tinjau & Beri Nilai Jawaban' : 'Review & Grade Answers';
  String get featExportResults => isIndonesian ? 'Export Hasil' : 'Export Results';

  String get featAccessViaQr => isIndonesian ? 'Akses Formulir via Tautan / QR Code' : 'Access Forms via Link or QR Code';
  String get featFillForms => isIndonesian ? 'Isi Formulir' : 'Fill Out Forms';
  String get featViewHistory => isIndonesian ? 'Lihat Riwayat Pengiriman' : 'View Submission History';
  String get featOneTimeSubmit => isIndonesian ? 'Pengiriman Satu Kali' : 'One-Time Submission';
  String get featLightDarkMode => isIndonesian ? 'Mode Terang & Gelap' : 'Light & Dark Mode';

  String get thankYouUsing => isIndonesian ? 'Terima kasih telah menggunakan HiDocs!' : 'Thank you for using HiDocs!';

  String get signOut => isIndonesian ? 'Keluar' : 'Sign Out';
  String get editProfile => isIndonesian ? 'Edit Profil' : 'Edit Profile';
  
  String get changeRole => isIndonesian ? 'Ganti Peran' : 'Change Role';
  String get backToRoleSelection => isIndonesian ? 'Kembali ke Pemilihan Peran' : 'Back to Role Selection';

  // Create / Edit Form Screen
  String get editForm => isIndonesian ? 'Edit Form' : 'Edit Form';
  String get createForm => isIndonesian ? 'Buat Form' : 'Create Form';
  String get tabInfo => isIndonesian ? 'Info' : 'Info';
  String get tabSettings => isIndonesian ? 'Pengaturan' : 'Settings';
  String get tabQuestions => isIndonesian ? 'Pertanyaan' : 'Questions';
  String get addAtLeastOneQuestion => isIndonesian
      ? 'Tambahkan minimal 1 pertanyaan'
      : 'Add at least 1 question';
  String questionContentEmpty(int num) => isIndonesian
      ? 'Pertanyaan $num masih kosong. Isi teks pertanyaan terlebih dahulu.'
      : 'Question $num is empty. Please enter question text first.';
  String get closeTimeBeforeOpenTime => isIndonesian
      ? 'Waktu tutup tidak boleh sebelum waktu buka'
      : 'Close time cannot be before open time';
  String get mustBeLoggedInToCreateForm => isIndonesian
      ? 'Anda harus login untuk membuat form'
      : 'You must be logged in to create a form';
  String get formSaveError => isIndonesian
      ? 'Gagal menyimpan form. Periksa jaringan Anda.'
      : 'Failed to save form. Check your network connection.';
  String get formUpdatedSuccess => isIndonesian
      ? 'Form berhasil diperbarui!'
      : 'Form updated successfully!';
  String get formCreatedSuccess => isIndonesian
      ? 'Form berhasil dibuat!'
      : 'Form created successfully!';
  String get prepQuestionImages => isIndonesian
      ? 'Menyiapkan gambar pertanyaan...'
      : 'Preparing question images...';
  String get finishingUp => isIndonesian ? 'Menyelesaikan...' : 'Finishing up...';
  String convertingQuestionsToImages(int done, int total) => isIndonesian
      ? 'Mengonversi pertanyaan ke gambar ($done/$total)'
      : 'Converting questions to images ($done/$total)';

  // Info Tab
  String get formInformation => isIndonesian ? 'Informasi Form' : 'Form Information';
  String get formTitleLabel => isIndonesian ? 'Judul Form' : 'Form Title';
  String get formTitleHint => isIndonesian ? 'mis. Survei Kepuasan Siswa' : 'e.g. Student Satisfaction Survey';
  String get formTitleRequired => isIndonesian ? 'Judul wajib diisi' : 'Title is required';
  String get formTitleMinLength => isIndonesian ? 'Judul form minimal 3 karakter' : 'Form title must be at least 3 characters';
  String get formLinkLabel => isIndonesian ? 'Link Form' : 'Form Link';
  String get formLinkDesc => isIndonesian
      ? 'Buat link singkat yang mudah dibagikan untuk form Anda.'
      : 'Create a short, easily shareable link for your form.';
  String get customLinkLabel => isIndonesian ? 'Link Kustom' : 'Custom Link';
  String get customLinkHint => isIndonesian ? 'mis. survei-saya-2026' : 'e.g. my-survey-2026';
  String get randomizeLinkTooltip => isIndonesian ? 'Buat link acak' : 'Generate random link';
  String get sharingVisibilityLabel => isIndonesian ? 'Berbagi & Visibilitas' : 'Sharing & Visibility';
  String get sharingVisibilityDesc => isIndonesian
      ? 'Form publik muncul di halaman pengguna dan dapat dibagikan lewat link dan QR code. Form privat hanya bisa diakses dengan scan QR code.'
      : 'Public forms appear on the user page and can be shared via link and QR code. Private forms can only be accessed by scanning the QR code.';
  String get publicLabel => isIndonesian ? 'Publik' : 'Public';
  String get publicSublabel => isIndonesian ? 'QR · Link · Halaman pengguna' : 'QR · Link · User page';
  String get privateLabel => isIndonesian ? 'Privat' : 'Private';
  String get privateSublabel => isIndonesian ? 'QR saja' : 'QR only';
  String get scheduleLabel => isIndonesian ? 'Jadwal' : 'Schedule';
  String get scheduleDesc => isIndonesian
      ? 'Atur kapan form dibuka dan ditutup. Timer dihitung otomatis.'
      : 'Set when the form opens and closes. Timer is calculated automatically.';
  String get openLabel => isIndonesian ? 'Buka' : 'Open';
  String get timeAtLabel => isIndonesian ? 'At' : 'At';
  String get closeLabel => isIndonesian ? 'Tutup' : 'Close';
  String get accessRangeLabel => isIndonesian ? 'Rentang Akses Form' : 'Form Access Range';
  String get openUnlimited => isIndonesian ? 'Buka tanpa batas' : 'Open unlimited';
  String accessDurationDaysHours(int days, int hours) => isIndonesian
      ? '$days hari $hours jam'
      : '$days days $hours hours';
  String accessDurationDays(int days) => isIndonesian ? '$days hari' : '$days days';
  String accessDurationHoursMins(int hours, int mins) => isIndonesian
      ? '$hours jam $mins menit'
      : '$hours hours $mins mins';
  String accessDurationHours(int hours) => isIndonesian ? '$hours jam' : '$hours hours';
  String accessDurationMins(int mins) => isIndonesian ? '$mins menit' : '$mins mins';
  String get closeMustBeAfterOpen => isIndonesian
      ? 'Waktu tutup harus setelah waktu buka'
      : 'Close time must be after open time';
  String get examDurationLabel => isIndonesian
      ? 'Durasi Pengerjaan Soal (Menit)'
      : 'Exam Duration (Minutes)';
  String get examDurationHintText => isIndonesian
      ? 'Maksimal 60 menit (1 jam). Isikan 0 untuk tanpa timer pengerjaan.'
      : 'Maximum 60 minutes (1 hour). Enter 0 for no timer.';
  String get noTimeLimit => isIndonesian ? 'Tanpa Batas Waktu' : 'No Time Limit';
  String get selectDate => isIndonesian ? 'Pilih tanggal' : 'Select date';
  String get selectTime => isIndonesian ? 'Pilih Waktu' : 'Select Time';
  String get hoursLabel => isIndonesian ? 'Jam' : 'Hours';
  String get minutesLabel => isIndonesian ? 'Menit' : 'Minutes';

  // Settings Tab
  String get formTypeSecurityMode => isIndonesian
      ? 'Tipe Form & Mode Keamanan'
      : 'Form Type & Security Mode';
  String get surveyModeTitle => isIndonesian ? 'Mode Survei' : 'Survey Mode';
  String get surveyModeSub => isIndonesian
      ? 'Form standar untuk feedback/pengumpulan data. Tanpa batasan anti-cheat atau screenshot.'
      : 'Standard form for feedback/data collection. No anti-cheat or screenshot restrictions.';
  String get examModeTitle => isIndonesian
      ? 'Mode Ujian (Keamanan Anti-Cheat)'
      : 'Exam Mode (Anti-Cheat Security)';
  String get examModeSub => isIndonesian
      ? 'Keamanan ketat aktif: blokir screenshot FLAG_SECURE, deteksi pindah aplikasi (maks 3 peringatan), dan proteksi rasterisasi soal.'
      : 'Strict security enabled: FLAG_SECURE screenshot block, app-switch detection (max 3 warnings), and rasterized question protection.';
  String get formBehaviorLabel => isIndonesian ? 'Perilaku Form' : 'Form Behavior';
  String get shuffleQuestionsTitle => isIndonesian
      ? 'Acak urutan pertanyaan'
      : 'Shuffle question order';
  String get shuffleQuestionsSub => isIndonesian
      ? 'Setiap responden mendapat urutan pertanyaan berbeda'
      : 'Each respondent gets questions in a different order';
  String get shuffleOptionsTitle => isIndonesian
      ? 'Acak pilihan jawaban'
      : 'Shuffle answer options';
  String get shuffleOptionsSub => isIndonesian
      ? 'Opsi pilihan ganda diacak setiap kali'
      : 'Multiple-choice options are randomized each time';
  String get oneTimeSubmitTitle => isIndonesian
      ? 'Hanya satu kali kirim'
      : 'One-time submission only';
  String get oneTimeSubmitSub => isIndonesian
      ? 'Setiap orang hanya bisa mengirim sekali'
      : 'Each person can only submit once';
  String get activateImmediatelyTitle => isIndonesian
      ? 'Aktifkan segera'
      : 'Activate immediately';
  String get activateImmediatelySub => isIndonesian
      ? 'Form langsung aktif setelah disimpan'
      : 'Form goes live right after you save';
  String get resultVisibilityLabel => isIndonesian
      ? 'Visibilitas Hasil'
      : 'Result Visibility';
  String get resultVisibilityDesc => isIndonesian
      ? 'Pilih apa yang dilihat responden setelah mengirim.'
      : 'Choose what respondents see after submitting.';
  String get hideResultsTitle => isIndonesian ? 'Sembunyikan hasil' : 'Hide results';
  String get hideResultsSub => isIndonesian
      ? 'Responden tidak melihat apa pun setelah mengirim'
      : 'Respondents see nothing after submission';
  String get showResultOnlyTitle => isIndonesian
      ? 'Tampilkan hasil saja'
      : 'Show result only';
  String get showResultOnlySub => isIndonesian
      ? 'Mereka bisa melihat jawaban benar/salah'
      : 'They can see which answers were correct/incorrect';
  String get showResultAndScoreTitle => isIndonesian
      ? 'Tampilkan hasil + nilai'
      : 'Show result + score';
  String get showResultAndScoreSub => isIndonesian
      ? 'Mereka bisa melihat jawaban dan nilai akhir'
      : 'They can see both their answers and final score';

  // Questions Tab
  String get addQuestionLabel => isIndonesian ? 'Tambah Pertanyaan' : 'Add Question';
  String get noQuestionsYetTitle => isIndonesian ? 'Belum ada pertanyaan' : 'No questions yet';
  String get noQuestionsYetSub => isIndonesian
      ? 'Tambahkan pertanyaan pertama untuk mulai membangun form ini.'
      : 'Add your first question to start building this form.';
  String get qMultipleChoice => isIndonesian ? 'Pilihan Ganda' : 'Multiple Choice';
  String get qMultipleChoiceSub => isIndonesian ? 'Pilih satu jawaban' : 'Choose one answer';
  String get qImageChoice => isIndonesian ? 'Pilihan Gambar' : 'Image Choice';
  String get qImageChoiceSub => isIndonesian ? 'Pilihan jawaban menggunakan gambar' : 'Answer choices using images';
  String get qEssay => isIndonesian ? 'Esai' : 'Essay';
  String get qEssaySub => isIndonesian ? 'Jawaban panjang' : 'Long-form answer';
  String get qShortAnswer => isIndonesian ? 'Jawaban Singkat' : 'Short Answer';
  String get qShortAnswerSub => isIndonesian ? 'Jawaban tertulis singkat' : 'Brief written answer';
  String get qYesNo => isIndonesian ? 'Ya / Tidak' : 'Yes / No';
  String get qYesNoSub => isIndonesian ? 'Pertanyaan ya atau tidak' : 'Yes or no question';
  String get qRating => isIndonesian ? 'Penilaian' : 'Rating';
  String get qRatingSub => isIndonesian ? 'Penilaian menggunakan bintang' : 'Rating using stars';
  String get qCodeInput => isIndonesian ? 'Input Kode' : 'Code Input';
  String get qCodeInputSub => isIndonesian ? 'Jawaban menggunakan kode program' : 'Answer using program code';
  String get qMathFormula => isIndonesian ? 'Rumus Matematika' : 'Math Formula';
  String get qMathFormulaSub => isIndonesian ? 'Jawaban rumus matematika' : 'Math formula answer';
  String get writeQuestionHere => isIndonesian ? 'Tulis pertanyaan Anda di sini...' : 'Write your question here...';
  String get moveUp => isIndonesian ? 'Pindah ke atas' : 'Move up';
  String get moveDown => isIndonesian ? 'Pindah ke bawah' : 'Move down';
  String get deleteQuestionTooltip => isIndonesian ? 'Hapus pertanyaan' : 'Delete question';
  String get insertImageTooltip => isIndonesian ? 'Sisipkan gambar' : 'Insert image';
  String get insertMathTooltip => isIndonesian ? 'Sisipkan rumus matematika' : 'Insert math formula';
  String get insertCodeTooltip => isIndonesian ? 'Sisipkan blok kode' : 'Insert code block';
  String get optionTextHint => isIndonesian ? 'Teks pilihan' : 'Option text';
  String get addOptionLabel => isIndonesian ? 'Tambah pilihan' : 'Add option';
  String get requiredLabel => isIndonesian ? 'Wajib diisi' : 'Required';
  String get assignPointsLabel => isIndonesian ? 'Beri Poin' : 'Assign Points';
  String get pointsMax100 => isIndonesian ? 'Poin (maks 100): ' : 'Points (max 100): ';
  String get starsLabel => isIndonesian ? 'Bintang' : 'Stars';
  String get correctAnswerOptional => isIndonesian ? 'Jawaban benar (opsional)' : 'Correct answer (optional)';
  String get shortTextHintNote => isIndonesian ? 'Responden mengetik jawaban satu baris.' : 'Respondents type a one-line answer.';
  String get longTextHintNote => isIndonesian ? 'Responden mengetik jawaban panjang.' : 'Respondents type a long-form answer.';
  String get starterCodeHint => isIndonesian ? '// Tulis kode awal di sini...' : '// Write the starter code here...';
  String get mathHintNote => isIndonesian
      ? 'Responden mengetik jawaban rumus matematika (mis. LaTeX atau teks biasa). Anda dapat menyisipkan rumus pada teks pertanyaan di atas menggunakan tombol ∑ di toolbar.'
      : 'Respondents type a math formula answer (e.g. LaTeX or plain text). You can embed a formula in the question text above using the ∑ button in the toolbar.';
  String get insertCodeTitle => isIndonesian ? 'Sisipkan Kode' : 'Insert Code';
  String get codePlaceholder => isIndonesian ? '// Tulis atau tempel kode Anda di sini...' : '// Write or paste your code here...';
  String get insertLabel => isIndonesian ? 'Sisipkan' : 'Insert';
  String get mathFormulaTitle => isIndonesian ? 'Rumus Matematika' : 'Mathematical Formula';
  String get previewLabel => isIndonesian ? 'Pratinjau' : 'Preview';
  String get insertFormulaLabel => isIndonesian ? 'Sisipkan Rumus' : 'Insert Formula';
  String get enterLatexFormula => isIndonesian ? 'Masukkan rumus LaTeX' : 'Enter a LaTeX formula';
  String get invalidLatexFormula => isIndonesian ? 'Rumus LaTeX tidak valid' : 'Invalid LaTeX formula';
  String get deleteOptionTooltip => isIndonesian ? 'Hapus pilihan' : 'Delete option';
  String get previewPlaceholder => isIndonesian ? 'Pratinjau akan muncul di sini' : 'Preview appears here';
  String get failedToInsertImage => isIndonesian ? 'Gagal menyisipkan gambar' : 'Failed to insert image';
  String mcqNeedsCorrectAnswer(int num) => isIndonesian
      ? 'Pertanyaan $num (Pilihan Ganda) wajib memiliki jawaban benar. Tandai salah satu opsi sebagai benar agar bisa disimpan.'
      : 'Question $num (Multiple Choice) must have a correct answer. Mark one option as correct to save the form.';
  String get editBlockedHasResponses => isIndonesian
      ? 'Form sudah memiliki responden. Edit dikunci agar jawaban tidak hilang. Duplikat form jika perlu perubahan.'
      : 'Form already has responses. Edit is locked to preserve answers. Duplicate the form if you need changes.';
}

class AppLocalizationsDelegate extends LocalizationsDelegate<AppLocalizations> {
  const AppLocalizationsDelegate();

  @override
  bool isSupported(Locale locale) {
    return ['en', 'id'].contains(locale.languageCode);
  }

  @override
  Future<AppLocalizations> load(Locale locale) async {
    return AppLocalizations(locale);
  }

  @override
  bool shouldReload(AppLocalizationsDelegate old) => false;
}
