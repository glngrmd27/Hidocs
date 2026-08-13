enum QuestionType {
  multipleChoice,
  shortText,
  longText,
  rating,
  yesNo,
  imageChoice,
  mathFormula,
  codeInput,
}

String questionTypeToApi(QuestionType type) {
  switch (type) {
    case QuestionType.multipleChoice:
      return 'MULTIPLE_CHOICE';
    case QuestionType.shortText:
      return 'SHORT_TEXT';
    case QuestionType.longText:
      return 'LONG_TEXT';
    case QuestionType.rating:
      return 'RATING';
    case QuestionType.yesNo:
      return 'YES_NO';
    case QuestionType.imageChoice:
      return 'IMAGE';
    case QuestionType.mathFormula:
      return 'MATH';
    case QuestionType.codeInput:
      return 'CODE';
  }
}

QuestionType questionTypeFromApi(String value) {
  switch (value) {
    case 'SHORT_TEXT':
      return QuestionType.shortText;
    case 'LONG_TEXT':
      return QuestionType.longText;
    case 'MULTIPLE_CHOICE':
    case 'CHECKBOXES':
    case 'DROPDOWN':
      return QuestionType.multipleChoice;
    case 'RATING':
      return QuestionType.rating;
    case 'YES_NO':
      return QuestionType.yesNo;
    case 'MATH':
      return QuestionType.mathFormula;
    case 'CODE':
      return QuestionType.codeInput;
    case 'IMAGE':
      return QuestionType.imageChoice;
    default:
      return QuestionType.shortText;
  }
}

enum ScoreVisibility {
  hidden,
  visible,
}

class QuestionModel {
  final String id;
  final QuestionType type;
  String text;
  String? imageUrl;
  String? mathFormula;
  String? codeSnippet;
  List<OptionModel> options;
  bool isRequired;
  int? ratingMax;

  bool hasScore;
  double score;

  QuestionModel({
    required this.id,
    required this.type,
    required this.text,
    this.imageUrl,
    this.mathFormula,
    this.codeSnippet,
    List<OptionModel>? options,
    this.isRequired = true,
    this.ratingMax,
    this.hasScore = false,
    this.score = 0,
  }) : options = options ?? [];

  QuestionModel copyWith({
    String? text,
    String? imageUrl,
    String? mathFormula,
    String? codeSnippet,
    List<OptionModel>? options,
    bool? isRequired,
    int? ratingMax,
    bool? hasScore,
    double? score,
  }) {
    return QuestionModel(
      id: id,
      type: type,
      text: text ?? this.text,
      imageUrl: imageUrl ?? this.imageUrl,
      mathFormula: mathFormula ?? this.mathFormula,
      codeSnippet: codeSnippet ?? this.codeSnippet,
      options: options ?? this.options,
      isRequired: isRequired ?? this.isRequired,
      ratingMax: ratingMax ?? this.ratingMax,
      hasScore: hasScore ?? this.hasScore,
      score: score ?? this.score,
    );
  }

  factory QuestionModel.fromJson(Map<String, dynamic> json) {
    final questionId = (json['id'] ?? '').toString();
    final imageUrl = (json['img_url'] ?? '').toString();
    final codeLanguage = (json['code_language'] ?? '').toString();

    QuestionType mappedType =
        questionTypeFromApi((json['question_type'] ?? '').toString());

    String? snippet;
    if (mappedType == QuestionType.codeInput && codeLanguage.isNotEmpty) {
      snippet = codeLanguage;
    }

    List<OptionModel> options = [];
    if (json['options'] is List) {
      options = (json['options'] as List)
          .whereType<Map>()
          .map((e) => OptionModel.fromJson({...e}))
          .toList();
    }

    return QuestionModel(
      id: questionId,
      type: mappedType,
      text: (json['question_text'] ?? '').toString(),
      imageUrl: imageUrl.isEmpty ? null : imageUrl,
      codeSnippet: snippet,
      isRequired: json['is_required'] == true,
      ratingMax: mappedType == QuestionType.rating ? 5 : null,
      hasScore: json['points'] is int
          ? (json['points'] as int) > 0
          : false,
      score: (json['points'] is num) ? (json['points'] as num).toDouble() : 0,
      options: options,
    );
  }

  Map<String, dynamic> toQuestionJson({int orderIndex = 1}) {
    return {
      'question_text': text,
      'question_type': questionTypeToApi(type),
      'code_language': type == QuestionType.codeInput
          ? (codeSnippet ?? 'text')
          : null,
      'img_url': imageUrl,
      'is_auto_scored': hasScore,
      'points': hasScore ? score.round() : 0,
      'order_index': orderIndex,
      'is_required': isRequired,
      'options': options
          .asMap()
          .entries
          .map((e) => e.value.toOptionJson(orderIndex: e.key + 1))
          .toList(),
    };
  }
}

class OptionModel {
  final String id;
  String text;
  String? imageUrl;

  double score;

  OptionModel({
    required this.id,
    required this.text,
    this.imageUrl,
    this.score = 0,
  });

  OptionModel copyWith({
    String? text,
    String? imageUrl,
    double? score,
  }) {
    return OptionModel(
      id: id,
      text: text ?? this.text,
      imageUrl: imageUrl ?? this.imageUrl,
      score: score ?? this.score,
    );
  }

  factory OptionModel.fromJson(Map<String, dynamic> json) {
    final imageUrl = (json['img_url'] ?? '').toString();

    return OptionModel(
      id: (json['id'] ?? '').toString(),
      text: (json['option_text'] ?? '').toString(),
      imageUrl: imageUrl.isEmpty ? null : imageUrl,
      score: json['is_correct'] == true ? 1 : 0,
    );
  }

  Map<String, dynamic> toOptionJson({int orderIndex = 1}) {
    return {
      'option_text': text,
      'is_correct': score > 0,
      'order_index': orderIndex,
    };
  }
}