import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_theme.dart';
import '../models/form_model.dart';
import '../models/question_model.dart';
import '../models/response_model.dart';
import '../providers/auth_provider.dart';
import '../providers/form_provider.dart';
import '../providers/response_provider.dart';
import '../widgets/math_formula_widget.dart';
import '../widgets/code_block_widget.dart';
import '../widgets/rich_text_view.dart';
import '../l10n/app_localizations.dart';

class HistoryDetailScreen extends StatefulWidget {
  final FormModel form;
  final ResponseModel response;

  const HistoryDetailScreen({
    required this.form,
    required this.response,
    super.key,
  });

  @override
  State<HistoryDetailScreen> createState() => _HistoryDetailScreenState();
}

class _HistoryDetailScreenState extends State<HistoryDetailScreen> {
  late FormModel _form;
  late ResponseModel _response;
  bool _loadingQuestions = false;

  @override
  void initState() {
    super.initState();
    _form = widget.form;
    _response = widget.response;
    if (_form.questions.isEmpty) {
      _loadFullForm();
    } else {
      _ensureResponseLoaded();
    }
  }

  Future<void> _loadFullForm() async {
    if (_loadingQuestions) return;
    _loadingQuestions = true;

    final fp = Provider.of<FormProvider>(context, listen: false);
    final detail = await fp.loadFormDetail(_form.id);

    if (!mounted) return;
    _loadingQuestions = false;

    if (detail != null && detail.questions.isNotEmpty) {
      setState(() {
        _form = detail;
      });
    }

    await _ensureResponseLoaded();
  }

  Future<void> _ensureResponseLoaded() async {
    if (_response.answers.isNotEmpty) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);
    final rp = Provider.of<ResponseProvider>(context, listen: false);

    await rp.loadResponsesForForm(_form.id, form: _form);

    if (!mounted) return;

    final myEmail = auth.currentUser?.email ?? '';
    final myId = auth.currentUser?.id ?? '';
    final all = rp.getResponsesByForm(_form.id);
    final mine = all
        .where(
          (r) =>
              (myEmail.isNotEmpty && r.respondentEmail == myEmail) ||
              (myId.isNotEmpty && r.respondentId == myId),
        )
        .toList();
    final match = mine.isNotEmpty ? mine.first : null;

    if (match != null && match.answers.isNotEmpty) {
      setState(() {
        _response = match;
      });
    }
  }

  String _formatDateTime(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '${dt.day}/${dt.month}/${dt.year}  $h:$m';
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
        return answer.toString().trim().isEmpty
            ? '-'
            : answer.toString();
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final l10n = AppLocalizations.of(context);

    final primaryTextColor = isDark
        ? AppTheme.darkTextPrimary
        : AppTheme.textPrimary;

    // hasScore must ignore placeholder 0 essay entries
    final effectiveEssay = _response.essayScores.entries
        .where((e) => e.value != 0)
        .toList();
    final hasScore =
        _response.score > 0 || effectiveEssay.isNotEmpty;

    // Visibility is dummy (no backend column) — always show score if available
    final showScore = hasScore;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.surfaceLight,
      appBar: AppBar(
        title: Text(l10n.historyDetailTitle),
      ),
      body: ListView(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 40),
        children: [
          Container(
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [AppTheme.primary, AppTheme.primaryLight],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(18),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  _form.title,
                  style: const TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    height: 1.3,
                  ),
                ),
                const SizedBox(height: 12),
                _HeaderRow(
                  icon: Icons.person_outline_rounded,
                  label: l10n.respondent,
                  value: _response.respondentName,
                ),
                const SizedBox(height: 8),
                _HeaderRow(
                  icon: Icons.email_outlined,
                  label: 'Email',
                  value: _response.respondentEmail,
                ),
                const SizedBox(height: 8),
                _HeaderRow(
                  icon: Icons.calendar_today_outlined,
                  label: l10n.submittedAt,
                  value: _formatDateTime(_response.submittedAt),
                ),
                const SizedBox(height: 8),
                _HeaderRow(
                  icon: Icons.timer_outlined,
                  label: l10n.duration,
                  value: _response.durationText,
                ),
                if (showScore && hasScore) ...[
                  const SizedBox(height: 14),
                  Row(
                    children: [
                      const Icon(
                        Icons.emoji_events_outlined,
                        size: 18,
                        color: Colors.white,
                      ),
                      const SizedBox(width: 8),
                      Text(
                        '${l10n.score}: ${_response.percentage.round()}%',
                        style: const TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.w800,
                          color: Colors.white,
                        ),
                      ),
                    ],
                  ),
                ],
              ],
            ),
          ),
          const SizedBox(height: 24),
          Text(
            l10n.yourAnswers,
            style: TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w700,
              color: primaryTextColor,
            ),
          ),
          const SizedBox(height: 12),
          if (_loadingQuestions && _form.questions.isEmpty)
            const Padding(
              padding: EdgeInsets.symmetric(vertical: 24),
              child: Center(
                child: CircularProgressIndicator(),
              ),
            )
          else
            ..._form.questions.asMap().entries.map(
              (entry) {
                final index = entry.key;
                final q = entry.value;
                final answer = _response.answers[q.id];

                return _AnswerCard(
                  number: index + 1,
                  question: q,
                  answerText: _answerText(q, answer),
                  grade: _response.essayScores[q.id],
                  isDark: isDark,
                );
              },
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
  final double? grade;
  final bool isDark;

  const _AnswerCard({
    required this.number,
    required this.question,
    required this.answerText,
    this.grade,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final l10n = AppLocalizations.of(context);
    final primaryTextColor = isDark
        ? AppTheme.darkTextPrimary
        : AppTheme.textPrimary;

    final secondaryTextColor = isDark
        ? AppTheme.darkTextSecondary
        : AppTheme.textSecondary;

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : AppTheme.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppTheme.darkBorder : AppTheme.border,
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
                  color: AppTheme.primary.withValues(
                    alpha: 0.10,
                  ),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Center(
                  child: Text(
                    '$number',
                    style: const TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w800,
                      color: AppTheme.primary,
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
            l10n.answerLabel,
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
              color: AppTheme.success.withValues(alpha: 0.06),
              borderRadius: BorderRadius.circular(10),
              border: Border.all(
                color: AppTheme.success.withValues(alpha: 0.20),
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
          if (grade != null && grade != 0) ...[
            const SizedBox(height: 10),
            Container(
              padding:
                  const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
              decoration: BoxDecoration(
                color: const Color(0xFF1B9E5E).withValues(alpha: 0.10),
                borderRadius: BorderRadius.circular(8),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Icon(
                    Icons.check_circle_rounded,
                    size: 14,
                    color: Color(0xFF1B9E5E),
                  ),
                  const SizedBox(width: 6),
                  Text(
                    '${l10n.gradedLabel}: ${grade! % 1 == 0 ? grade!.round() : grade!}/100',
                    style: const TextStyle(
                      fontSize: 11,
                      fontWeight: FontWeight.w800,
                      color: Color(0xFF1B9E5E),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ],
      ),
    );
  }
}
