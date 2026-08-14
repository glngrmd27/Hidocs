class ResponseModel {
  final String id;
  final String formId;

  final String respondentId;
  final String respondentName;
  final String respondentEmail;

  final DateTime startedAt;
  final DateTime submittedAt;

  final Map<String, dynamic> answers;

  double score;
  final double maxScore;

  final Map<String, double> essayScores;
  final Map<String, double> autoScores;

  ResponseModel({
    required this.id,
    required this.formId,
    required this.respondentName,
    required this.respondentEmail,
    required this.startedAt,
    required this.submittedAt,
    this.respondentId = '',
    Map<String, dynamic>? answers,
    this.score = 0,
    this.maxScore = 100,
    Map<String, double>? essayScores,
    Map<String, double>? autoScores,
  })  : answers = answers ?? {},
        essayScores = essayScores ?? {},
        autoScores = autoScores ?? {};

  Duration get duration =>
      submittedAt.difference(startedAt);

  int get durationInSeconds =>
      duration.inSeconds;

  String get durationText {
    final totalSeconds = durationInSeconds;

    final hours = totalSeconds ~/ 3600;
    final minutes = (totalSeconds % 3600) ~/ 60;
    final seconds = totalSeconds % 60;

    if (hours > 0) {
      return '${hours}j ${minutes}m ${seconds}d';
    }

    if (minutes > 0) {
      return '${minutes}m ${seconds}d';
    }

    return '${seconds}d';
  }

  double get percentage {
    if (maxScore <= 0) return 0;

    final value = score / maxScore * 100;

    if (value < 0) return 0;
    if (value > 100) return 100;

    return value;
  }

  ResponseModel copyWith({
    String? id,
    String? formId,
    String? respondentId,
    String? respondentName,
    String? respondentEmail,
    DateTime? startedAt,
    DateTime? submittedAt,
    Map<String, dynamic>? answers,
    double? score,
    double? maxScore,
    Map<String, double>? essayScores,
    Map<String, double>? autoScores,
  }) {
    return ResponseModel(
      id: id ?? this.id,
      formId: formId ?? this.formId,
      respondentId: respondentId ?? this.respondentId,
      respondentName:
          respondentName ?? this.respondentName,
      respondentEmail:
          respondentEmail ?? this.respondentEmail,
      startedAt:
          startedAt ?? this.startedAt,
      submittedAt:
          submittedAt ?? this.submittedAt,
      answers:
          answers ??
          Map<String, dynamic>.from(this.answers),
      score:
          score ?? this.score,
      maxScore:
          maxScore ?? this.maxScore,
      essayScores:
          essayScores ??
          Map<String, double>.from(
            this.essayScores,
          ),
      autoScores:
          autoScores ??
          Map<String, double>.from(
            this.autoScores,
          ),
    );
  }
}