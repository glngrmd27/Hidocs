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

    final startTime = DateTime.tryParse(
        settings['start_time']?.toString() ?? '');
    final endTime = DateTime.tryParse(
        settings['end_time']?.toString() ?? '');

    final now = DateTime.now();

    final status = (json['status'] ?? '').toString();

    return FormModel(
      id: (json['id'] ?? '').toString(),
      title: (json['title'] ?? '').toString(),
      creatorId: (json['user_id'] ?? '').toString(),
      shortLink: (json['custom_url'] ?? '').toString(),
      customLinkAlias: (json['custom_url'] ?? '').toString(),
      scheduledOpen: startTime ?? now,
      scheduledClose: endTime ?? now,
      timerMinutes: settings['duration_minutes'] is int
          ? (settings['duration_minutes'] as int).clamp(0, 100000)
          : 0,
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
      createdAt: DateTime.tryParse(json['created_at']?.toString() ?? '') ??
          DateTime.now(),
    );
  }

  Map<String, dynamic> toCreateJson() {
    return {
      'title': title,
      'description': '',
      'type': typeForApi,
      'custom_url': customLinkAlias.isEmpty ? shortLink : customLinkAlias,
      'is_template': false,
    };
  }

  Map<String, dynamic> toUpdateJson() {
    return {
      'title': title,
      'description': '',
      'type': typeForApi,
      'custom_url': customLinkAlias.isEmpty ? shortLink : customLinkAlias,
      'status': isActive ? 'ACTIVE' : 'CLOSED',
      'is_template': false,
    };
  }

  Map<String, dynamic> toSettingsJson() {
    return {
      'duration_minutes': hasTimer ? timerMinutes : null,
      'auto_active_days': 30,
      'is_active_immediately': true,
      'is_one_time_submission': oneTimeOnly,
      'randomize_questions': shuffleQuestions,
      'randomize_options': shuffleOptions,
      'start_time': scheduledOpen.toIso8601String(),
      'end_time': scheduledClose.toIso8601String(),
    };
  }
}

FormModel copyFormModel(
  FormModel source, {
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