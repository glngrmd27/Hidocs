import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_theme.dart';
import '../models/form_model.dart';
import '../models/response_model.dart';
import '../providers/auth_provider.dart';
import '../providers/form_provider.dart';
import '../providers/response_provider.dart';
import '../widgets/custom_card.dart';
import 'history_detail_screen.dart';

class HistoryScreen extends StatelessWidget {
  const HistoryScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final formProvider = Provider.of<FormProvider>(context);
    final responseProvider = Provider.of<ResponseProvider>(context);

    final userId = auth.currentUser?.id ?? '';

    final responses = responseProvider
        .getResponsesByRespondent(userId)
        .toList()
      ..sort((a, b) => b.submittedAt.compareTo(a.submittedAt));

    // Visibility is dummy (backend has no column); always show history.
    // Score badge itself is still guarded by hasScore.
    final visibleResponses = responses.where((r) {
      final form = formProvider.getFormById(r.formId);
      return form != null;
    }).toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text('History'),
      ),
      body: visibleResponses.isEmpty
          ? const _EmptyState(
              icon: Icons.history_rounded,
              title: 'No submission history',
              subtitle:
                  'Forms you have submitted will appear here',
            )
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(
                20,
                16,
                20,
                100,
              ),
              itemCount: visibleResponses.length,
              itemBuilder: (_, index) {
                final response = visibleResponses[index];
                final form = formProvider.getFormById(
                  response.formId,
                );

                if (form == null) {
                  return const SizedBox.shrink();
                }

                return _HistoryCard(
                  form: form,
                  response: response,
                  onTap: () {
                    Navigator.push(
                      context,
                      MaterialPageRoute(
                        builder: (_) => HistoryDetailScreen(
                          form: form,
                          response: response,
                        ),
                      ),
                    );
                  },
                );
              },
            ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final FormModel form;
  final ResponseModel response;
  final VoidCallback onTap;

  const _HistoryCard({
    required this.form,
    required this.response,
    required this.onTap,
  });

  String _formatDate(DateTime dt) {
    final h = dt.hour.toString().padLeft(2, '0');
    final m = dt.minute.toString().padLeft(2, '0');
    return '${dt.day}/${dt.month}/${dt.year}  $h:$m';
  }

  @override
  Widget build(BuildContext context) {
    final isDark =
        Theme.of(context).brightness == Brightness.dark;

    final primaryTextColor = isDark
        ? AppTheme.darkTextPrimary
        : AppTheme.textPrimary;

    final secondaryTextColor = isDark
        ? AppTheme.darkTextSecondary
        : AppTheme.textSecondary;

    final hasScore =
        response.score > 0 || response.essayScores.isNotEmpty;

    final visibility = form.resultVisibility;
    final showScore =
        visibility == ResultVisibility.resultAndScore;

    return CustomCard(
      onTap: onTap,
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(18),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppTheme.success.withValues(
                alpha: 0.10,
              ),
              borderRadius: BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.check_circle_rounded,
              size: 23,
              color: AppTheme.success,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  form.title,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: primaryTextColor,
                  ),
                  maxLines: 2,
                  overflow: TextOverflow.ellipsis,
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Icon(
                      Icons.calendar_today_outlined,
                      size: 13,
                      color: secondaryTextColor,
                    ),
                    const SizedBox(width: 5),
                    Expanded(
                      child: Text(
                        _formatDate(response.submittedAt),
                        style: TextStyle(
                          fontSize: 11,
                          color: secondaryTextColor,
                        ),
                      ),
                    ),
                  ],
                ),
                const SizedBox(height: 10),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 12,
                        vertical: 7,
                      ),
                      decoration: BoxDecoration(
                        color: AppTheme.success.withValues(
                          alpha: 0.08,
                        ),
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: const Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Icon(
                            Icons.check_circle_outline,
                            size: 15,
                            color: AppTheme.success,
                          ),
                          SizedBox(width: 6),
                          Text(
                            'Submitted',
                            style: TextStyle(
                              fontSize: 11,
                              fontWeight: FontWeight.w700,
                              color: AppTheme.success,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const Spacer(),
                    if (showScore && hasScore)
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 12,
                          vertical: 7,
                        ),
                        decoration: BoxDecoration(
                          color: AppTheme.primary.withValues(
                            alpha: 0.08,
                          ),
                          borderRadius: BorderRadius.circular(10),
                        ),
                        child: Text(
                          'Score ${response.percentage.round()}%',
                          style: const TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w800,
                            color: AppTheme.primary,
                          ),
                        ),
                      ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(width: 4),
          Icon(
            Icons.chevron_right_rounded,
            size: 22,
            color: isDark
                ? AppTheme.darkTextSecondary
                : AppTheme.textMuted,
          ),
        ],
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    final isDark =
        Theme.of(context).brightness == Brightness.dark;

    return Center(
      child: Padding(
        padding: const EdgeInsets.all(48),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(
                  alpha: 0.07,
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: Icon(
                icon,
                size: 36,
                color: AppTheme.primary.withValues(
                  alpha: 0.4,
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: TextStyle(
                fontSize: 17,
                fontWeight: FontWeight.w700,
                color: isDark
                    ? AppTheme.darkTextPrimary
                    : AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 13,
                color: isDark
                    ? AppTheme.darkTextSecondary
                    : AppTheme.textMuted,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}
