import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';

import '../app_theme.dart';
import '../models/form_model.dart';
import '../models/question_model.dart';
import '../models/response_model.dart';
import '../providers/response_provider.dart';
import '../widgets/code_block_widget.dart';
import '../widgets/gradient_button.dart';
import '../widgets/math_formula_widget.dart';
import '../widgets/rich_text_view.dart';

class ResponseDetailScreen extends StatefulWidget {
  final FormModel form;
  final ResponseModel response;

  const ResponseDetailScreen({
    required this.form,
    required this.response,
    super.key,
  });

  @override
  State<ResponseDetailScreen> createState() => _ResponseDetailScreenState();
}

class _ResponseDetailScreenState extends State<ResponseDetailScreen> {
  final Map<String, TextEditingController> _gradeControllers = {};
  final Map<String, double> _grades = {};

  bool get _hasGradable => widget.form.questions.any(_isManuallyGraded);

  double get _maxScore => widget.form.maxScore;

  bool _isManuallyGraded(QuestionModel q) {
    return q.type == QuestionType.longText ||
        q.type == QuestionType.shortText ||
        q.type == QuestionType.codeInput ||
        q.type == QuestionType.mathFormula;
  }

  double get _total {
    if (!_hasGradable) return widget.response.score;
    if (_grades.isEmpty) return widget.response.score;

    var sum = widget.response.score;
    for (final q in widget.form.questions) {
      if (!_isManuallyGraded(q)) continue;

      final v = _grades[q.id];
      if (v == null) continue;

      final max = (q.hasScore || q.score > 0) ? q.score : 0.0;
      sum += max * (v / 100);
    }
    return sum;
  }

  @override
  void initState() {
    super.initState();

    for (final q in widget.form.questions) {
      if (!_isManuallyGraded(q)) continue;

      final existing = widget.response.essayScores[q.id];
      if (existing != null) {
        _grades[q.id] = existing;
      }

      _gradeControllers[q.id] = TextEditingController(
        text: existing == null ? '' : '${existing.toInt()}',
      );
    }
  }

  @override
  void dispose() {
    for (final c in _gradeControllers.values) {
      c.dispose();
    }
    super.dispose();
  }

  String _formatDateTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '${dt.day}/${dt.month}/${dt.year} $h:$m';
  }

  String _answerText(QuestionModel q, dynamic answer) {
    if (answer == null) return '-';

    String byText(String fallback) {
      final normalized = answer.toString().trim().toLowerCase();
      for (final opt in q.options) {
        if (opt.text.trim().toLowerCase() == normalized) {
          return opt.text;
        }
      }
      return fallback;
    }

    switch (q.type) {
      case QuestionType.multipleChoice:
      case QuestionType.imageChoice:
        for (final opt in q.options) {
          if (opt.id == answer) return opt.text;
        }
        return byText(answer.toString());

      case QuestionType.yesNo:
        for (final opt in q.options) {
          if (opt.id == answer) return opt.text;
        }
        return byText(answer == 'yes' ? 'Yes' : 'No');

      case QuestionType.rating:
        return '$answer out of ${q.ratingMax ?? 5}';

      default:
        return answer.toString().trim().isEmpty ? '-' : answer.toString();
    }
  }

  void _save() {
    final essayScores = <String, double>{};
    for (final q in widget.form.questions) {
      if (!_isManuallyGraded(q)) continue;

      final v = _grades[q.id];
      if (v != null) {
        essayScores[q.id] = v;
      }
    }

    final updated = widget.response.copyWith(
      essayScores: essayScores,
      score: _total,
      maxScore: _maxScore,
    );

    final provider = Provider.of<ResponseProvider>(context, listen: false);

    provider.saveGrade(widget.response.id, _total).then((_) {
      if (!mounted) return;
      provider.updateResponse(updated);

      Navigator.pop(context, true);

      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(
                Icons.check_circle_rounded,
                color: Colors.white,
                size: 18,
              ),
              SizedBox(width: 8),
              Text(
                'Score saved successfully',
                style: TextStyle(fontWeight: FontWeight.w600),
              ),
            ],
          ),
          backgroundColor: AppTheme.success,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          margin: const EdgeInsets.all(16),
        ),
      );
    }).catchError((Object error) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(provider.error ?? 'Gagal menyimpan skor.'),
          backgroundColor: AppTheme.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          margin: const EdgeInsets.all(16),
        ),
      );
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final primaryTextColor =
        isDark ? AppTheme.darkTextPrimary : AppTheme.textPrimary;
    final secondaryTextColor =
        isDark ? AppTheme.darkTextSecondary : AppTheme.textSecondary;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.surfaceLight,
      appBar: AppBar(
        title: const Text('Detail Respons'),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
        children: [
          // Header Deep Blue Card
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF133E76),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  widget.form.title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 14),
                _HeaderRow(
                  icon: Icons.person_outline_rounded,
                  label: 'Respondent',
                  value: widget.response.respondentName,
                ),
                const SizedBox(height: 8),
                _HeaderRow(
                  icon: Icons.email_outlined,
                  label: 'Email',
                  value: widget.response.respondentEmail,
                ),
                const SizedBox(height: 8),
                _HeaderRow(
                  icon: Icons.calendar_today_outlined,
                  label: 'Submitted',
                  value: _formatDateTime(widget.response.submittedAt),
                ),
                const SizedBox(height: 8),
                _HeaderRow(
                  icon: Icons.timer_outlined,
                  label: 'Duration',
                  value: widget.response.durationText,
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // Total Score Row
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                'Total Score',
                style: TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w700,
                  color: primaryTextColor,
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 14,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: const Color(0xFF1B9E5E).withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(
                  _maxScore > 0
                      ? '${_total.toInt()} / ${_maxScore.round()}'
                      : '${_total.toInt()}',
                  style: const TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w800,
                    color: Color(0xFF1B9E5E),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 20),

          // Section Title: Answers & Grading
          Text(
            'Answers & Grading',
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: primaryTextColor,
            ),
          ),
          const SizedBox(height: 12),

          ...widget.form.questions.asMap().entries.map(
            (entry) {
              final index = entry.key;
              final q = entry.value;
              final answer = widget.response.answers[q.id];

              return _AnswerCard(
                number: index + 1,
                question: q,
                answerText: _answerText(q, answer),
                isEssay: _isManuallyGraded(q),
                controller: _gradeControllers[q.id],
                onGradeChanged: (value) {
                  final parsed = double.tryParse(value);
                  setState(() {
                    if (parsed == null) {
                      _grades.remove(q.id);
                    } else {
                      _grades[q.id] = parsed.clamp(0, 100).toDouble();
                    }
                  });
                },
                isDark: isDark,
              );
            },
          ),

          if (!_hasGradable) ...[
            const SizedBox(height: 8),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: AppTheme.info.withValues(alpha: 0.08),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(
                  color: AppTheme.info.withValues(alpha: 0.20),
                ),
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.info_outline_rounded,
                    size: 18,
                    color: AppTheme.info,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'This form has no questions that require manual grading. The total score is computed automatically.',
                      style: TextStyle(
                        fontSize: 12,
                        color: secondaryTextColor,
                        height: 1.4,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],

          const SizedBox(height: 24),

          GradientButton(
            text: 'Save Score',
            onPressed: _save,
            fullWidth: true,
            icon: Icons.save_rounded,
          ),
        ],
      ),
    );
  }
}

class _HeaderRow extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _HeaderRow({
    required this.icon,
    required this.label,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Icon(icon, size: 16, color: Colors.white70),
        const SizedBox(width: 8),
        Text(
          '$label: ',
          style: const TextStyle(
            fontSize: 13,
            color: Colors.white70,
            fontWeight: FontWeight.w500,
          ),
        ),
        Expanded(
          child: Text(
            value,
            style: const TextStyle(
              fontSize: 13,
              color: Colors.white,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
      ],
    );
  }
}

class _AnswerCard extends StatelessWidget {
  final int number;
  final QuestionModel question;
  final String answerText;
  final bool isEssay;
  final TextEditingController? controller;
  final ValueChanged<String>? onGradeChanged;
  final bool isDark;

  const _AnswerCard({
    required this.number,
    required this.question,
    required this.answerText,
    required this.isEssay,
    required this.controller,
    required this.onGradeChanged,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final primaryTextColor =
        isDark ? AppTheme.darkTextPrimary : AppTheme.textPrimary;
    final secondaryTextColor =
        isDark ? AppTheme.darkTextSecondary : AppTheme.textSecondary;

    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : AppTheme.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isEssay
              ? AppTheme.warning.withValues(alpha: 0.50)
              : (isDark ? AppTheme.darkBorder : AppTheme.border),
          width: isEssay ? 1.5 : 1.0,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Container(
                width: 26,
                height: 26,
                decoration: BoxDecoration(
                  color: AppTheme.info.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    '$number',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.info,
                    ),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: RichTextContentView(
                  content: question.content,
                  fallbackText: question.text,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: primaryTextColor,
                    height: 1.3,
                  ),
                ),
              ),
              if (isEssay)
                Container(
                  padding: const EdgeInsets.symmetric(
                    horizontal: 8,
                    vertical: 4,
                  ),
                  decoration: BoxDecoration(
                    color: AppTheme.warning.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: const Text(
                    'MANUAL',
                    style: TextStyle(
                      fontSize: 10,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.warning,
                    ),
                  ),
                ),
            ],
          ),
          if (question.type == QuestionType.mathFormula &&
              question.mathFormula != null) ...[
            const SizedBox(height: 12),
            MathFormulaWidget(
              formula: question.mathFormula!,
              fontSize: 14,
            ),
          ],
          if (question.type == QuestionType.codeInput &&
              question.codeSnippet != null) ...[
            const SizedBox(height: 12),
            CodeBlockWidget(code: question.codeSnippet!),
          ],
          const SizedBox(height: 12),
          Text(
            'Answer',
            style: TextStyle(
              fontSize: 11,
              fontWeight: FontWeight.w600,
              color: secondaryTextColor,
            ),
          ),
          const SizedBox(height: 4),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: isDark
                  ? const Color(0xFF162E25)
                  : const Color(0xFFEBF7F0),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: const Color(0xFF1B9E5E).withValues(alpha: 0.20),
              ),
            ),
            child: Text(
              answerText,
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w500,
                color: primaryTextColor,
                height: 1.4,
              ),
            ),
          ),
          if (isEssay) ...[
            const SizedBox(height: 14),
            TextField(
              controller: controller,
              keyboardType: TextInputType.number,
              inputFormatters: [
                FilteringTextInputFormatter.allow(RegExp(r'[0-9.]')),
              ],
              onChanged: onGradeChanged,
              style: TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w600,
                color: primaryTextColor,
              ),
              decoration: InputDecoration(
                labelText: 'Score (0 - 100)',
                prefixIcon: const Icon(
                  Icons.star_outline_rounded,
                  size: 20,
                  color: AppTheme.warning,
                ),
                filled: true,
                fillColor: isDark
                    ? AppTheme.darkSurface
                    : AppTheme.surfaceLight,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: AppTheme.warning.withValues(alpha: 0.30),
                  ),
                ),
                enabledBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide(
                    color: AppTheme.warning.withValues(alpha: 0.30),
                  ),
                ),
                focusedBorder: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: const BorderSide(
                    color: AppTheme.warning,
                    width: 2,
                  ),
                ),
              ),
            ),
          ],
        ],
      ),
    );
  }
}

