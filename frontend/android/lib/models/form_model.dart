import 'question_model.dart';

enum ResultVisibility {
  hidden,
  resultOnly,
  resultAndScore,
}

class FormModel {
  final String id;
  final String title;
  final String creatorId;

  final String shortLink;
  final String customLinkAlias;

  final DateTime scheduledOpen;
  final DateTime scheduledClose;

  final int timerMinutes;

  final bool isPublic;

  final bool shuffleQuestions;
  final bool shuffleOptions;
  final bool oneTimeOnly;
  final bool isActive;

  final ResultVisibility resultVisibility;

  final List<QuestionModel> questions;

  final int totalResponses;
  final DateTime createdAt;

  FormModel({
    required this.id,
    required this.title,
    required this.creatorId,
    this.shortLink = '',
    this.customLinkAlias = '',
    required this.scheduledOpen,
    required this.scheduledClose,
    this.timerMinutes = 0,
    this.isPublic = true,
    this.shuffleQuestions = false,
    this.shuffleOptions = false,
    this.oneTimeOnly = true,
    this.isActive = true,
    this.resultVisibility = ResultVisibility.hidden,
    List<QuestionModel>? questions,
    this.totalResponses = 0,
    required this.createdAt,
  }) : questions = questions ?? [];

  String get fullLink => customLinkAlias.isNotEmpty
      ? 'hidocs.app/f/$customLinkAlias'
      : 'hidocs.app/f/$shortLink';

  String get slug => customLinkAlias.isNotEmpty ? customLinkAlias : shortLink;

  double get maxScore {
    var total = 0.0;
    for (final q in questions) {
      if (q.hasScore || q.score > 0) {
        total += q.score;
      }
    }
    return total;
  }

  bool get isScheduled =>
      scheduledOpen != scheduledClose;

  bool get hasTimer =>
      timerMinutes > 0;

  Duration get scheduleDuration =>
      scheduledClose.difference(scheduledOpen);

  String get typeForApi => hasTimer ? 'EXAM' : 'SURVEY';

  factory FormModel.fromJson(Map<String, dynamic> json) {
    Map<String, dynamic> settings =
        json['form_settings'] is Map
            ? Map<String, dynamic>.from(json['form_settings'] as Map)
            : {};

    final startTime =
        DateTime.tryParse(settings['start_time']?.toString() ?? '')?.toLocal();
    final endTime =
        DateTime.tryParse(settings['end_time']?.toString() ?? '')?.toLocal();

    final now = DateTime.now();
    // Default window 1 day if backend returns null (new form / import word)
    final defaultOpen = now;
    final defaultClose = now.add(const Duration(days: 1));

    final status = (json['status'] ?? '').toString();

    final accessMode = (json['access_mode'] ??
            settings['access_mode'] ??
            'public')
        .toString();

    final isPublic = accessMode == 'public';

    return FormModel(
      id: (json['id'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      creatorId: (json['user_id'] ?? '').toString(),
      shortLink: (json['custom_url'] ?? '').toString(),
      customLinkAlias: (json['custom_url'] ?? '').toString(),
      scheduledOpen: startTime ?? defaultOpen,
      scheduledClose: endTime ?? defaultClose,
      timerMinutes: settings['duration_minutes'] is num
          ? ((settings['duration_minutes'] as num).toInt()).clamp(0, 100000)
          : 0,
      isPublic: isPublic,
      shuffleQuestions: settings['randomize_questions'] == true,
      shuffleOptions: settings['randomize_options'] == true,
      oneTimeOnly: settings['is_one_time_submission'] == true,
      isActive: status == 'ACTIVE',
      questions: json['questions'] is List
          ? (json['questions'] as List)
                .whereType<Map>()
                .map((e) => QuestionModel.fromJson({...e}))
                .toList()
          : <QuestionModel>[],
      totalResponses: (json['response_count'] is num)
          ? (json['response_count'] as num).toInt()
          : 0,
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '')
              ?.toLocal() ??
          DateTime.now(),
    );
  }

  FormModel withCustomUrl(String slug) {
    return FormModel(
      id: id,
      title: title,
      creatorId: creatorId,
      shortLink: slug,
      customLinkAlias: slug,
      scheduledOpen: scheduledOpen,
      scheduledClose: scheduledClose,
      timerMinutes: timerMinutes,
      isPublic: isPublic,
      shuffleQuestions: shuffleQuestions,
      shuffleOptions: shuffleOptions,
      oneTimeOnly: oneTimeOnly,
      isActive: isActive,
      resultVisibility: resultVisibility,
      questions: questions,
      totalResponses: totalResponses,
      createdAt: createdAt,
    );
  }

  Map<String, dynamic> toCreateJson() {
    return {
      'title': title,
      'description': '',
      'type': typeForApi,
      'custom_url': customLinkAlias.isEmpty ? shortLink : customLinkAlias,
      'access_mode': isPublic ? 'public' : 'qr-only',
      'show_in_user_list': isPublic,
      'qr_only': !isPublic,
      'is_template': false,
    };
  }

  Map<String, dynamic> toUpdateJson() {
    return {
      'title': title,
      'description': '',
      'type': typeForApi,
      'custom_url': customLinkAlias.isEmpty ? shortLink : customLinkAlias,
      'access_mode': isPublic ? 'public' : 'qr-only',
      'show_in_user_list': isPublic,
      'qr_only': !isPublic,
      'status': isActive ? 'ACTIVE' : 'CLOSED',
      'is_template': false,
    };
  }

  Map<String, dynamic> toSettingsJson() {
    // Only send schedule if isScheduled (open != close). Otherwise send null
    // so backend keeps StartTime/EndTime = nil -> no "time limit has passed"
    final bool hasSchedule = isScheduled && scheduledClose.isAfter(scheduledOpen);
    return {
      'duration_minutes': hasTimer ? timerMinutes : null,
      'auto_active_days': 30,
      'is_active_immediately': true,
      'is_one_time_submission': oneTimeOnly,
      'randomize_questions': shuffleQuestions,
      'randomize_options': shuffleOptions,
      'start_time': hasSchedule ? scheduledOpen.toUtc().toIso8601String() : null,
      'end_time': hasSchedule ? scheduledClose.toUtc().toIso8601String() : null,
    };
  }
}

FormModel copyFormModel(
  FormModel source, {
  bool? isPublic,
  bool? isActive,
  ResultVisibility? resultVisibility,
}) {
  return FormModel(
    id: source.id,
    title: source.title,
    creatorId: source.creatorId,
    shortLink: source.shortLink,
    customLinkAlias: source.customLinkAlias,
    scheduledOpen: source.scheduledOpen,
    scheduledClose: source.scheduledClose,
    timerMinutes: source.timerMinutes,
    isPublic: isPublic ?? source.isPublic,
    shuffleQuestions: source.shuffleQuestions,
    shuffleOptions: source.shuffleOptions,
    oneTimeOnly: source.oneTimeOnly,
    isActive: isActive ?? source.isActive,
    resultVisibility:
        resultVisibility ?? source.resultVisibility,
    questions: source.questions,
    totalResponses: source.totalResponses,
    createdAt: source.createdAt,
  );
}