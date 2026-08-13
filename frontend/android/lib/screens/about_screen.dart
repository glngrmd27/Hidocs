import 'package:flutter/material.dart';
import '../app_theme.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';

class AboutScreen extends StatelessWidget {
  const AboutScreen({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      appBar: AppBar(
        title: const Text("About HiDocs"),
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

            const _SectionCard(
              title: "About",
              child: Text(
                "HiDocs! (Form & Exam Maker) is a multi-platform application (Web & Mobile) that provides an efficient solution for creating, managing, and completing digital forms, quizzes, and online exams. The platform features two user modes: Creator Mode for designing forms, managing questions, and analyzing responses, and User Mode for accessing forms via links or QR Codes, submitting answers, and viewing submission history."
              ),
            ),

            const SizedBox(height: 16),

            _SectionCard(
            title: auth.isAdmin ? "Administrator Features" : "User Features",
            child: Column(
                children: auth.isAdmin
                    ? const [
                        _FeatureTile(
                        Icons.add_box_rounded,
                        "Create & Manage Forms",
                        ),
                        _FeatureTile(
                        Icons.quiz_outlined,
                        "Manage Questions",
                        ),
                        _FeatureTile(
                        Icons.qr_code_rounded,
                        "Generate Link & QR Code",
                        ),
                        _FeatureTile(
                        Icons.bar_chart_rounded,
                        "View Responses",
                        ),
                        _FeatureTile(
                        Icons.grading_rounded,
                        "Review & Grade Answers",
                        ),
                        _FeatureTile(
                        Icons.download_rounded,
                        "Export Results",
                        ),
                    ]
                    : const [
                        _FeatureTile(
                        Icons.qr_code_scanner_rounded,
                        "Access Forms via Link or QR Code",
                        ),
                        _FeatureTile(
                        Icons.assignment_outlined,
                        "Fill Out Forms",
                        ),
                        _FeatureTile(
                        Icons.history_rounded,
                        "View Submission History",
                        ),
                        _FeatureTile(
                        Icons.check_circle_outline_rounded,
                        "One-Time Submission",
                        ),
                        _FeatureTile(
                        Icons.dark_mode_rounded,
                        "Light & Dark Mode",
                        ),
                    ],
                ),
            ),

            const SizedBox(height: 16),

            Text(
              "Thank you for using HiDocs!",
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