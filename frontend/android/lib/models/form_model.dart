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