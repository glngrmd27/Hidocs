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
}