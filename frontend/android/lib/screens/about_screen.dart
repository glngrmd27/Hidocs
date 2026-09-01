import 'package:flutter/material.dart';
import '../app_theme.dart';
import '../l10n/app_localizations.dart';

class AboutScreen extends StatelessWidget {
  final bool isCreatorMode;

  const AboutScreen({
    super.key,
    this.isCreatorMode = false,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.aboutTitle),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          children: [
            Container(
              width: 90,
              height: 90,
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [
                    AppTheme.primary,
                    AppTheme.primaryLight,
                  ],
                ),
                borderRadius: BorderRadius.circular(24),
              ),
              child: const Icon(
                Icons.description_rounded,
                color: Colors.white,
                size: 46,
              ),
            ),

            const SizedBox(height: 20),

            Text(
              "HiDocs",
              style: TextStyle(
                fontSize: 26,
                fontWeight: FontWeight.bold,
                color: isDark
                    ? AppTheme.darkTextPrimary
                    : AppTheme.textPrimary,
              ),
            ),

            const SizedBox(height: 6),

            _SectionCard(
              title: l10n.aboutSectionTitle,
              child: Text(
                l10n.aboutDescription,
                style: TextStyle(
                  fontSize: 14,
                  height: 1.5,
                  color: isDark ? AppTheme.darkTextSecondary : AppTheme.textSecondary,
                ),
              ),
            ),

            const SizedBox(height: 16),

            _SectionCard(
              title: isCreatorMode ? l10n.creatorFeatures : l10n.userFeatures,
              child: Column(
                children: isCreatorMode
                    ? [
                        _FeatureTile(
                          Icons.add_box_rounded,
                          l10n.featCreateManageForms,
                        ),
                        _FeatureTile(
                          Icons.quiz_outlined,
                          l10n.featManageQuestions,
                        ),
                        _FeatureTile(
                          Icons.qr_code_rounded,
                          l10n.featGenerateQr,
                        ),
                        _FeatureTile(
                          Icons.bar_chart_rounded,
                          l10n.featViewResponses,
                        ),
                        _FeatureTile(
                          Icons.grading_rounded,
                          l10n.featReviewGrade,
                        ),
                        _FeatureTile(
                          Icons.download_rounded,
                          l10n.featExportResults,
                        ),
                      ]
                    : [
                        _FeatureTile(
                          Icons.qr_code_scanner_rounded,
                          l10n.featAccessViaQr,
                        ),
                        _FeatureTile(
                          Icons.assignment_outlined,
                          l10n.featFillForms,
                        ),
                        _FeatureTile(
                          Icons.history_rounded,
                          l10n.featViewHistory,
                        ),
                        _FeatureTile(
                          Icons.check_circle_outline_rounded,
                          l10n.featOneTimeSubmit,
                        ),
                        _FeatureTile(
                          Icons.dark_mode_rounded,
                          l10n.featLightDarkMode,
                        ),
                      ],
              ),
            ),

            const SizedBox(height: 16),

            Text(
              l10n.thankYouUsing,
              textAlign: TextAlign.center,
              style: TextStyle(
                color: isDark
                    ? AppTheme.darkTextMuted
                    : AppTheme.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionCard extends StatelessWidget {
  final String title;
  final Widget child;

  const _SectionCard({
    required this.title,
    required this.child,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      width: double.infinity,
      padding: const EdgeInsets.all(18),
      decoration: BoxDecoration(
        color: isDark
            ? AppTheme.darkCard
            : AppTheme.surfaceCard,
        borderRadius: BorderRadius.circular(18),
        border: Border.all(
          color: isDark
              ? AppTheme.darkBorder
              : AppTheme.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: TextStyle(
              fontSize: 17,
              fontWeight: FontWeight.bold,
              color: isDark
                  ? AppTheme.darkTextPrimary
                  : AppTheme.textPrimary,
            ),
          ),
          const SizedBox(height: 12),
          child,
        ],
      ),
    );
  }
}

class _FeatureTile extends StatelessWidget {
  final IconData icon;
  final String title;

  const _FeatureTile(this.icon, this.title);

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(vertical: 6),
      child: Row(
        children: [
          Icon(
            icon,
            color: AppTheme.primary,
            size: 20,
          ),
          const SizedBox(width: 10),
          Text(title),
        ],
      ),
    );
  }
}