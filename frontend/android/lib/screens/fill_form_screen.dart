import 'dart:async';

import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_theme.dart';
import '../providers/form_provider.dart';
import '../models/form_model.dart';
import '../models/question_model.dart';
import '../widgets/gradient_button.dart';
import '../widgets/math_formula_widget.dart';
import '../widgets/code_block_widget.dart';
import '../widgets/image_zoom_widget.dart';

class FillFormScreen extends StatefulWidget {
  final FormModel form;

  const FillFormScreen({
    required this.form,
    super.key,
  });

  @override
  State<FillFormScreen> createState() => _FillFormScreenState();
}

class _FillFormScreenState extends State<FillFormScreen> {
  late List<QuestionModel> _questions;

  final Map<String, dynamic> _answers = {};
  final Map<String, TextEditingController> _controllers = {};

  Timer? _timer;

  int _remaining = 0;
  int _current = 0;

  bool _submitted = false;
  bool _isSubmitting = false;

  @override
  void initState() {
    super.initState();

    _questions = List<QuestionModel>.from(
      widget.form.questions,
    );

    if (widget.form.shuffleQuestions) {
      _questions.shuffle();
    }

    if (widget.form.shuffleOptions) {
      _questions = _questions.map((q) {
        if (q.type == QuestionType.multipleChoice &&
            q.options.isNotEmpty) {
          final shuffledOptions =
              List<OptionModel>.from(q.options);

          shuffledOptions.shuffle();

          return QuestionModel(
            id: q.id,
            type: q.type,
            text: q.text,
            imageUrl: q.imageUrl,
            mathFormula: q.mathFormula,
            codeSnippet: q.codeSnippet,
            options: shuffledOptions,
            isRequired: q.isRequired,
            ratingMax: q.ratingMax,
          );
        }

        return q;
      }).toList();
    }

    if (widget.form.hasTimer) {
      _remaining = widget.form.timerMinutes * 60;

      _timer = Timer.periodic(
        const Duration(seconds: 1),
        (_) {
          if (!mounted || _submitted) return;

          if (_remaining <= 1) {
            _timer?.cancel();
            _remaining = 0;
            _autoSubmit();
          } else {
            setState(() {
              _remaining--;
            });
          }
        },
      );
    }
  }

  @override
  void dispose() {
    _timer?.cancel();

    for (final controller in _controllers.values) {
      controller.dispose();
    }

    super.dispose();
  }

  TextEditingController _getController(
    String questionId,
  ) {
    if (!_controllers.containsKey(questionId)) {
      _controllers[questionId] = TextEditingController(
        text: _answers[questionId]?.toString() ?? '',
      );
    }

    return _controllers[questionId]!;
  }

  String _fmtTime(int seconds) {
    final minutes =
        (seconds ~/ 60).toString().padLeft(2, '0');

    final secs =
        (seconds % 60).toString().padLeft(2, '0');

    return '$minutes:$secs';
  }

  void _autoSubmit() {
    if (_submitted || _isSubmitting) return;

    _submitForm(
      auto: true,
    );
  }

  void _submitForm({
    bool auto = false,
  }) {
    if (_submitted || _isSubmitting) return;

    if (!auto) {
      final unanswered = _questions.where(
        (question) {
          if (!question.isRequired) {
            return false;
          }

          final answer = _answers[question.id];

          if (answer == null) {
            return true;
          }

          if (answer is String &&
              answer.trim().isEmpty) {
            return true;
          }

          if (answer is int && answer == 0) {
            return true;
          }

          return false;
        },
      ).toList();

      if (unanswered.isNotEmpty) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Row(
              children: [
                Icon(
                  Icons.warning_amber_rounded,
                  color: Colors.white,
                  size: 20,
                ),
                SizedBox(width: 10),
                Expanded(
                  child: Text(
                    'Please answer all required questions first.',
                  ),
                ),
              ],
            ),
            backgroundColor: AppTheme.warning,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(12),
            ),
            margin: const EdgeInsets.all(16),
          ),
        );

        return;
      }
    }

    _timer?.cancel();

    setState(() {
      _isSubmitting = true;
      _submitted = true;
    });

    Provider.of<FormProvider>(
      context,
      listen: false,
    ).markSubmitted(
      widget.form.id,
    );

    if (auto && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(
                Icons.timer_off_rounded,
                color: Colors.white,
                size: 18,
              ),
              SizedBox(width: 8),
              Expanded(
                child: Text(
                  "Time's up! Your response was submitted automatically.",
                ),
              ),
            ],
          ),
          backgroundColor: AppTheme.warning,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          margin: const EdgeInsets.all(16),
        ),
      );
    }
  }

  void _nextQuestion() {
    if (_current < _questions.length - 1) {
      setState(() {
        _current++;
      });
    }
  }

  void _previousQuestion() {
    if (_current > 0) {
      setState(() {
        _current--;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_questions.isEmpty) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Form'),
        ),
        body: const Center(
          child: Text(
            'This form has no questions.',
          ),
        ),
      );
    }

    if (_submitted) {
      return _SuccessScreen(
        onBack: () => Navigator.pop(context),
      );
    }

    final q = _questions[_current];

    final progress =
        (_current + 1) / _questions.length;

    final isDark =
        Theme.of(context).brightness ==
            Brightness.dark;

    final isWarn =
        widget.form.hasTimer &&
        _remaining < 60;

    return Scaffold(
      backgroundColor:
          isDark
              ? AppTheme.darkBg
              : AppTheme.surfaceLight,

      appBar: AppBar(
        title: Text(
          widget.form.title,
          style: const TextStyle(
            fontSize: 16,
          ),
          overflow: TextOverflow.ellipsis,
        ),
        actions: [
          if (widget.form.hasTimer)
            Container(
              constraints: const BoxConstraints(
                minWidth: 82,
              ),
              margin: const EdgeInsets.only(
                right: 12,
                top: 8,
                bottom: 8,
              ),
              padding:
                  const EdgeInsets.symmetric(
                horizontal: 10,
                vertical: 6,
              ),
              decoration: BoxDecoration(
                color: isWarn
                    ? AppTheme.error.withValues(
                        alpha: 0.15,
                      )
                    : AppTheme.primaryFaint,
                borderRadius:
                    BorderRadius.circular(20),
                border: Border.all(
                  color: isWarn
                      ? AppTheme.error.withValues(
                          alpha: 0.35,
                        )
                      : AppTheme.primary.withValues(
                          alpha: 0.20,
                        ),
                ),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Icon(
                    Icons.timer_rounded,
                    size: 15,
                    color: isWarn
                        ? AppTheme.error
                        : AppTheme.primary,
                  ),
                  const SizedBox(width: 5),
                  Text(
                    _fmtTime(_remaining),
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight:
                          FontWeight.w800,
                      color: isWarn
                          ? AppTheme.error
                          : AppTheme.primary,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),

      body: Column(
        children: [
          Container(
            height: 4,
            color: isDark
                ? AppTheme.darkBorder
                : AppTheme.border,
            child: FractionallySizedBox(
              alignment:
                  Alignment.centerLeft,
              widthFactor: progress,
              child: Container(
                decoration:
                    const BoxDecoration(
                  gradient:
                      LinearGradient(
                    colors: [
                      AppTheme.primary,
                      AppTheme.primaryLight,
                    ],
                  ),
                ),
              ),
            ),
          ),

          Expanded(
            child: SingleChildScrollView(
              padding:
                  const EdgeInsets.all(24),
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,
                children: [
                  Row(
                    children: [
                      Flexible(
                        child: Container(
                          padding:
                              const EdgeInsets
                                  .symmetric(
                            horizontal: 12,
                            vertical: 6,
                          ),
                          decoration:
                              BoxDecoration(
                            color:
                                AppTheme.primary,
                            borderRadius:
                                BorderRadius
                                    .circular(
                              20,
                            ),
                          ),
                          child: Text(
                            'Question ${_current + 1} / ${_questions.length}',
                            overflow:
                                TextOverflow
                                    .ellipsis,
                            style:
                                const TextStyle(
                              color:
                                  Colors.white,
                              fontWeight:
                                  FontWeight.w700,
                              fontSize: 12,
                            ),
                          ),
                        ),
                      ),

                      if (q.isRequired) ...[
                        const SizedBox(
                          width: 8,
                        ),
                        Container(
                          padding:
                              const EdgeInsets
                                  .symmetric(
                            horizontal: 8,
                            vertical: 5,
                          ),
                          decoration:
                              BoxDecoration(
                            color:
                                AppTheme
                                    .errorLight,
                            borderRadius:
                                BorderRadius
                                    .circular(
                              10,
                            ),
                          ),
                          child:
                              const Text(
                            'Required',
                            style:
                                TextStyle(
                              fontSize: 10,
                              fontWeight:
                                  FontWeight
                                      .w700,
                              color:
                                  AppTheme
                                      .error,
                            ),
                          ),
                        ),
                      ],
                    ],
                  ),

                  const SizedBox(height: 18),

                  Text(
                    q.text,
                    style: TextStyle(
                      fontSize: 19,
                      fontWeight:
                          FontWeight.w700,
                      color: isDark
                          ? AppTheme
                              .darkTextPrimary
                          : AppTheme
                              .textPrimary,
                      height: 1.35,
                    ),
                  ),

                  const SizedBox(height: 22),

                  if (q.type ==
                          QuestionType
                              .mathFormula &&
                      q.mathFormula != null) ...[
                    MathFormulaWidget(
                      formula:
                          q.mathFormula!,
                    ),
                    const SizedBox(
                      height: 20,
                    ),
                  ],

                  if (q.type ==
                          QuestionType
                              .codeInput &&
                      q.codeSnippet != null) ...[
                    CodeBlockWidget(
                      code:
                          q.codeSnippet!,
                    ),
                    const SizedBox(
                      height: 20,
                    ),
                  ],

                  if (q.imageUrl != null) ...[
                    ImageZoomWidget(
                      imageUrl:
                          q.imageUrl!,
                    ),
                    const SizedBox(
                      height: 20,
                    ),
                  ],

                  _buildAnswer(
                    q,
                    isDark,
                  ),
                ],
              ),
            ),
          ),

          _NavBar(
            current: _current,
            total: _questions.length,
            onPrev:
                _previousQuestion,
            onNext:
                _nextQuestion,
            onSubmit:
                () => _submitForm(),
          ),
        ],
      ),
    );
  }

  Widget _buildAnswer(
    QuestionModel q,
    bool isDark,
  ) {
    switch (q.type) {
      case QuestionType.multipleChoice:
        return _MCAnswer(
          q: q,
          answers: _answers,
          isDark: isDark,
          onSelect: (id) {
            setState(() {
              _answers[q.id] = id;
            });
          },
        );

      case QuestionType.shortText:
        return _TextAnswer(
          controller:
              _getController(q.id),
          hint:
              'Type a short answer...',
          maxLines: 1,
          onChanged: (v) {
            _answers[q.id] = v;
          },
        );

      case QuestionType.longText:
      case QuestionType.codeInput:
        return _TextAnswer(
          controller:
              _getController(q.id),
          hint:
              q.type ==
                      QuestionType
                          .codeInput
                  ? 'Write your code answer here...'
                  : 'Type your answer...',
          maxLines: 6,
          monospace:
              q.type ==
                  QuestionType
                      .codeInput,
          onChanged: (v) {
            _answers[q.id] = v;
          },
        );

      case QuestionType.mathFormula:
        return _TextAnswer(
          controller:
              _getController(q.id),
          hint:
              'Write your answer or formula...',
          maxLines: 3,
          onChanged: (v) {
            _answers[q.id] = v;
          },
        );

      case QuestionType.rating:
        final rating =
            (_answers[q.id] as int?) ??
                0;

        return _RatingAnswer(
          rating: rating,
          max:
              q.ratingMax ?? 5,
          onRate: (r) {
            setState(() {
              _answers[q.id] = r;
            });
          },
        );

      case QuestionType.yesNo:
        return _YesNoAnswer(
          value:
              _answers[q.id] as String?,
          onSelect: (v) {
            setState(() {
              _answers[q.id] = v;
            });
          },
        );

      case QuestionType.imageChoice:
        return _TextAnswer(
          controller:
              _getController(q.id),
          hint:
              'Image choices will appear here...',
          maxLines: 1,
          onChanged: (v) {
            _answers[q.id] = v;
          },
        );
    }
  }
}

class _SuccessScreen
    extends StatelessWidget {
  final VoidCallback onBack;

  const _SuccessScreen({
    required this.onBack,
  });

  @override
  Widget build(
    BuildContext context,
  ) {
    final isDark =
        Theme.of(context).brightness ==
            Brightness.dark;

    return Scaffold(
      backgroundColor: isDark
          ? AppTheme.darkBg
          : AppTheme.surfaceLight,
      body: Center(
        child: SingleChildScrollView(
          padding:
              const EdgeInsets.all(40),
          child: Column(
            mainAxisSize:
                MainAxisSize.min,
            children: [
              Container(
                width: 96,
                height: 96,
                decoration:
                    BoxDecoration(
                  color: AppTheme.success
                      .withValues(
                    alpha: 0.10,
                  ),
                  shape:
                      BoxShape.circle,
                ),
                child: const Icon(
                  Icons
                      .check_circle_rounded,
                  color:
                      AppTheme.success,
                  size: 52,
                ),
              ),

              const SizedBox(
                height: 28,
              ),

              Text(
                'Thank You!',
                style: TextStyle(
                  fontSize: 30,
                  fontWeight:
                      FontWeight.w800,
                  color: isDark
                      ? AppTheme
                          .darkTextPrimary
                      : AppTheme
                          .textPrimary,
                  letterSpacing: -0.5,
                ),
              ),

              const SizedBox(
                height: 8,
              ),

              Text(
                'Your response has been submitted successfully.',
                style: TextStyle(
                  fontSize: 15,
                  color: isDark
                      ? AppTheme
                          .darkTextSecondary
                      : AppTheme
                          .textMuted,
                ),
                textAlign:
                    TextAlign.center,
              ),

              const SizedBox(
                height: 36,
              ),

              SizedBox(
                width: double.infinity,
                height: 50,
                child: GradientButton(
                  text: 'Back to Home',
                  onPressed: onBack,
                  icon:
                      Icons.home_rounded,
                  fullWidth: true,
                  height: 50,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _NavBar
    extends StatelessWidget {
  final int current;
  final int total;
  final VoidCallback onPrev;
  final VoidCallback onNext;
  final VoidCallback onSubmit;

  const _NavBar({
    required this.current,
    required this.total,
    required this.onPrev,
    required this.onNext,
    required this.onSubmit,
  });

  @override
  Widget build(
    BuildContext context,
  ) {
    final isDark =
        Theme.of(context).brightness ==
            Brightness.dark;

    final isLast =
        current == total - 1;

    final isFirst =
        current == 0;

    return Container(
      width: double.infinity,
      padding:
          const EdgeInsets.fromLTRB(
        16,
        12,
        16,
        20,
      ),
      decoration:
          BoxDecoration(
        color: isDark
            ? AppTheme.darkCard
            : AppTheme.surfaceCard,
        boxShadow: [
          BoxShadow(
            color: Colors.black
                .withValues(
              alpha: 0.06,
            ),
            blurRadius: 16,
            offset:
                const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Row(
          children: [
            if (!isFirst) ...[
              Expanded(
                flex: 1,
                child:
                    SizedBox(
                  height: 50,
                  child:
                      OutlinedButton(
                    onPressed:
                        onPrev,
                    style:
                        OutlinedButton
                            .styleFrom(
                      padding:
                          const EdgeInsets
                              .symmetric(
                        horizontal:
                            8,
                      ),
                      shape:
                          RoundedRectangleBorder(
                        borderRadius:
                            BorderRadius
                                .circular(
                          14,
                        ),
                      ),
                    ),
                    child:
                        const Icon(
                      Icons
                          .arrow_back_rounded,
                      size: 20,
                    ),
                  ),
                ),
              ),
              const SizedBox(
                width: 10,
              ),
            ],

            Expanded(
              flex: 2,
              child: SizedBox(
                height: 50,
                child: isLast
                    ? _SafeGradientButton(
                        text:
                            'Submit Response',
                        icon: Icons
                            .send_rounded,
                        onPressed:
                            onSubmit,
                      )
                    : _SafeGradientButton(
                        text: 'Next',
                        icon: Icons
                            .arrow_forward_rounded,
                        onPressed:
                            onNext,
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SafeGradientButton
    extends StatelessWidget {
  final String text;
  final IconData icon;
  final VoidCallback onPressed;

  const _SafeGradientButton({
    required this.text,
    required this.icon,
    required this.onPressed,
  });

  @override
  Widget build(
    BuildContext context,
  ) {
    return Material(
      color: Colors.transparent,
      child: InkWell(
        onTap: onPressed,
        borderRadius:
            BorderRadius.circular(
          14,
        ),
        child: Ink(
          decoration:
              BoxDecoration(
            gradient:
                const LinearGradient(
              colors: [
                AppTheme.primary,
                AppTheme.primaryLight,
              ],
            ),
            borderRadius:
                BorderRadius.circular(
              14,
            ),
          ),
          child: Padding(
            padding:
                const EdgeInsets
                    .symmetric(
              horizontal: 12,
            ),
            child: Row(
              mainAxisAlignment:
                  MainAxisAlignment
                      .center,
              children: [
                Icon(
                  icon,
                  color:
                      Colors.white,
                  size: 19,
                ),
                const SizedBox(
                  width: 6,
                ),
                Flexible(
                  child: Text(
                    text,
                    maxLines: 1,
                    overflow:
                        TextOverflow
                            .ellipsis,
                    textAlign:
                        TextAlign.center,
                    style:
                        const TextStyle(
                      color:
                          Colors.white,
                      fontSize: 13,
                      fontWeight:
                          FontWeight.w700,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}

class _MCAnswer
    extends StatelessWidget {
  final QuestionModel q;
  final Map<String, dynamic> answers;
  final bool isDark;
  final void Function(String) onSelect;

  const _MCAnswer({
    required this.q,
    required this.answers,
    required this.isDark,
    required this.onSelect,
  });

  @override
  Widget build(
    BuildContext context,
  ) {
    return Column(
      children: q.options.map(
        (opt) {
          final selected =
              answers[q.id] ==
                  opt.id;

          return GestureDetector(
            onTap: () =>
                onSelect(opt.id),
            child:
                AnimatedContainer(
              duration:
                  const Duration(
                milliseconds: 200,
              ),
              margin:
                  const EdgeInsets
                      .only(
                bottom: 10,
              ),
              padding:
                  const EdgeInsets
                      .symmetric(
                horizontal: 16,
                vertical: 14,
              ),
              decoration:
                  BoxDecoration(
                color: selected
                    ? AppTheme
                        .primary
                        .withValues(
                        alpha: 0.07,
                      )
                    : (isDark
                        ? AppTheme
                            .darkCard
                        : AppTheme
                            .surfaceCard),
                borderRadius:
                    BorderRadius
                        .circular(
                  14,
                ),
                border:
                    Border.all(
                  color: selected
                      ? AppTheme
                          .primary
                      : (isDark
                          ? AppTheme
                              .darkBorder
                          : AppTheme
                              .border),
                  width:
                      selected
                          ? 2
                          : 1,
                ),
              ),
              child: Row(
                children: [
                  AnimatedContainer(
                    duration:
                        const Duration(
                      milliseconds:
                          200,
                    ),
                    width: 22,
                    height: 22,
                    decoration:
                        BoxDecoration(
                      shape:
                          BoxShape
                              .circle,
                      color: selected
                          ? AppTheme
                              .primary
                          : Colors
                              .transparent,
                      border:
                          Border.all(
                        color: selected
                            ? AppTheme
                                .primary
                            : (isDark
                                ? AppTheme
                                    .darkBorder
                                : AppTheme
                                    .border),
                        width: 2,
                      ),
                    ),
                    child: selected
                        ? const Icon(
                            Icons
                                .check_rounded,
                            size: 14,
                            color: Colors
                                .white,
                          )
                        : null,
                  ),

                  const SizedBox(
                    width: 12,
                  ),

                  Expanded(
                    child: Text(
                      opt.text,
                      style:
                          TextStyle(
                        fontSize: 15,
                        fontWeight:
                            selected
                                ? FontWeight
                                    .w600
                                : FontWeight
                                    .w400,
                        color: selected
                            ? AppTheme
                                .primary
                            : (isDark
                                ? AppTheme
                                    .darkTextSecondary
                                : AppTheme
                                    .textSecondary),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          );
        },
      ).toList(),
    );
  }
}

class _TextAnswer
    extends StatelessWidget {
  final TextEditingController controller;
  final String hint;
  final int maxLines;
  final bool monospace;
  final void Function(String) onChanged;

  const _TextAnswer({
    required this.controller,
    required this.hint,
    required this.maxLines,
    this.monospace = false,
    required this.onChanged,
  });

  @override
  Widget build(
    BuildContext context,
  ) {
    final isDark =
        Theme.of(context).brightness ==
            Brightness.dark;

    return TextField(
      controller: controller,
      maxLines: maxLines,
      onChanged: onChanged,
      style: TextStyle(
        fontSize: 15,
        fontFamily:
            monospace
                ? 'monospace'
                : null,
        color: isDark
            ? AppTheme
                .darkTextPrimary
            : AppTheme
                .textPrimary,
      ),
      decoration:
          InputDecoration(
        hintText: hint,
        filled: true,
        fillColor: isDark
            ? AppTheme.darkSurface
            : AppTheme.surfaceCard,
        border:
            OutlineInputBorder(
          borderRadius:
              BorderRadius.circular(
            14,
          ),
          borderSide:
              BorderSide(
            color: isDark
                ? AppTheme.darkBorder
                : AppTheme.border,
          ),
        ),
        enabledBorder:
            OutlineInputBorder(
          borderRadius:
              BorderRadius.circular(
            14,
          ),
          borderSide:
              BorderSide(
            color: isDark
                ? AppTheme.darkBorder
                : AppTheme.border,
          ),
        ),
        focusedBorder:
            OutlineInputBorder(
          borderRadius:
              BorderRadius.circular(
            14,
          ),
          borderSide:
              const BorderSide(
            color:
                AppTheme.primary,
            width: 2,
          ),
        ),
        contentPadding:
            const EdgeInsets.all(
          16,
        ),
      ),
    );
  }
}

class _RatingAnswer
    extends StatelessWidget {
  final int rating;
  final int max;
  final void Function(int) onRate;

  const _RatingAnswer({
    required this.rating,
    required this.max,
    required this.onRate,
  });

  @override
  Widget build(
    BuildContext context,
  ) {
    return Column(
      crossAxisAlignment:
          CrossAxisAlignment.start,
      children: [
        Wrap(
          spacing: 6,
          children:
              List.generate(
            max,
            (i) {
              final filled =
                  i < rating;

              return GestureDetector(
                onTap: () =>
                    onRate(i + 1),
                child:
                    AnimatedContainer(
                  duration:
                      const Duration(
                    milliseconds:
                        150,
                  ),
                  child: Icon(
                    filled
                        ? Icons
                            .star_rounded
                        : Icons
                            .star_outline_rounded,
                    size:
                        filled
                            ? 40
                            : 34,
                    color: filled
                        ? AppTheme
                            .warning
                        : AppTheme
                            .textMuted,
                  ),
                ),
              );
            },
          ),
        ),

        const SizedBox(
          height: 8,
        ),

        Text(
          rating == 0
              ? 'Not selected'
              : '$rating out of $max stars',
          style: TextStyle(
            fontSize: 13,
            color: rating == 0
                ? AppTheme
                    .textMuted
                : AppTheme
                    .warning,
            fontWeight:
                FontWeight.w500,
          ),
        ),
      ],
    );
  }
}


class _YesNoAnswer
    extends StatelessWidget {
  final String? value;
  final void Function(String) onSelect;

  const _YesNoAnswer({
    required this.value,
    required this.onSelect,
  });

  @override
  Widget build(
    BuildContext context,
  ) {
    return Row(
      children: [
        Expanded(
          child: _YNOption(
            label: 'Yes',
            icon:
                Icons.check_circle_rounded,
            color:
                AppTheme.success,
            selected:
                value == 'yes',
            onTap: () =>
                onSelect('yes'),
          ),
        ),

        const SizedBox(
          width: 12,
        ),

        Expanded(
          child: _YNOption(
            label: 'No',
            icon:
                Icons.cancel_rounded,
            color:
                AppTheme.error,
            selected:
                value == 'no',
            onTap: () =>
                onSelect('no'),
          ),
        ),
      ],
    );
  }
}

class _YNOption
    extends StatelessWidget {
  final String label;
  final IconData icon;
  final Color color;
  final bool selected;
  final VoidCallback onTap;

  const _YNOption({
    required this.label,
    required this.icon,
    required this.color,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(
    BuildContext context,
  ) {
    final isDark =
        Theme.of(context).brightness ==
            Brightness.dark;

    return GestureDetector(
      onTap: onTap,
      child:
          AnimatedContainer(
        duration:
            const Duration(
          milliseconds: 200,
        ),
        height: 68,
        decoration:
            BoxDecoration(
          color: selected
              ? color.withValues(
                  alpha: 0.10,
                )
              : Colors.transparent,
          borderRadius:
              BorderRadius.circular(
            16,
          ),
          border:
              Border.all(
            color: selected
                ? color
                : (isDark
                    ? AppTheme
                        .darkBorder
                    : AppTheme
                        .border),
            width:
                selected ? 2 : 1,
          ),
        ),
        child: Center(
          child: Row(
            mainAxisSize:
                MainAxisSize.min,
            children: [
              Icon(
                icon,
                size: 22,
                color: selected
                    ? color
                    : AppTheme
                        .textMuted,
              ),
              const SizedBox(
                width: 8,
              ),
              Text(
                label,
                style:
                    TextStyle(
                  fontSize: 16,
                  fontWeight:
                      FontWeight.w700,
                  color: selected
                      ? color
                      : AppTheme
                          .textMuted,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}