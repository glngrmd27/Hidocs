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
  String? content;
  String? imageUrl;
  String? mathFormula;
  String? codeSnippet;
  List<OptionModel> options;
  bool isRequired;
  int? ratingMax;
  int? correctRating;

  ScoreVisibility scoreVisibility;
  bool hasScore;
  double score;

  QuestionModel({
    required this.id,
    required this.type,
    required this.text,
    this.content,
    this.imageUrl,
    this.mathFormula,
    this.codeSnippet,
    List<OptionModel>? options,
    this.isRequired = true,
    this.ratingMax,
    this.correctRating,
    this.scoreVisibility = ScoreVisibility.hidden,
    this.hasScore = false,
    this.score = 0,
  }) : options = options ?? [];

  QuestionModel copyWith({
    String? text,
    String? content,
    String? imageUrl,
    String? mathFormula,
    String? codeSnippet,
    List<OptionModel>? options,
    bool? isRequired,
    int? ratingMax,
    int? correctRating,
    ScoreVisibility? scoreVisibility,
    bool? hasScore,
    double? score,
  }) {
    return QuestionModel(
      id: id,
      type: type,
      text: text ?? this.text,
      content: content ?? this.content,
      imageUrl: imageUrl ?? this.imageUrl,
      mathFormula: mathFormula ?? this.mathFormula,
      codeSnippet: codeSnippet ?? this.codeSnippet,
      options: options ?? this.options,
      isRequired: isRequired ?? this.isRequired,
      ratingMax: ratingMax ?? this.ratingMax,
      correctRating: correctRating ?? this.correctRating,
      scoreVisibility: scoreVisibility ?? this.scoreVisibility,
      hasScore: hasScore ?? this.hasScore,
      score: score ?? this.score,
    );
  }
}

class OptionModel {
  final String id;
  String text;
  String? content;
  String? imageUrl;

  double score;
  bool isCorrect;

  OptionModel({
    required this.id,
    required this.text,
    this.content,
    this.imageUrl,
    this.score = 0,
    this.isCorrect = false,
  });

  OptionModel copyWith({
    String? text,
    String? content,
    String? imageUrl,
    double? score,
    bool? isCorrect,
  }) {
    return OptionModel(
      id: id,
      text: text ?? this.text,
      content: content ?? this.content,
      imageUrl: imageUrl ?? this.imageUrl,
      score: score ?? this.score,
      isCorrect: isCorrect ?? this.isCorrect,
    );
  }
}