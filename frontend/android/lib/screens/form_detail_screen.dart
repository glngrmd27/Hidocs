import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';
import '../app_theme.dart';
import '../providers/form_provider.dart';
import '../models/form_model.dart';
import '../models/question_model.dart';
import '../widgets/gradient_button.dart';
import 'results_screen.dart';

class FormDetailScreen extends StatelessWidget {
  final FormModel form;
  const FormDetailScreen({required this.form, super.key});

  @override
  Widget build(BuildContext context) {
    final formProvider = Provider.of<FormProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 160,
            pinned: true,
            backgroundColor: AppTheme.primary,
            elevation: 0,
            actions: [
              PopupMenuButton<String>(
                icon: const Icon(Icons.more_vert_rounded,
                    color: Colors.white),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
                onSelected: (val) {
                  if (val == 'toggle') {
                    formProvider.toggleFormActive(form.id);
                    Navigator.pop(context);
                  } else if (val == 'delete') {
                    _confirmDelete(context, formProvider);
                  } else if (val == 'share') {
                    Share.share('Fill out this form: ${form.fullLink}');
                  }
                },
                itemBuilder: (_) => [
                  const PopupMenuItem(
                      value: 'share',
                      child: ListTile(
                          leading: Icon(Icons.share_rounded),
                          title: Text('Share Link'),
                          dense: true,
                          contentPadding: EdgeInsets.zero)),
                  PopupMenuItem(
                      value: 'toggle',
                      child: ListTile(
                          leading: Icon(form.isActive
                              ? Icons.pause_circle_outline_rounded
                              : Icons.play_circle_outline_rounded),
                          title: Text(
                              form.isActive ? 'Close Form' : 'Activate Form'),
                          dense: true,
                          contentPadding: EdgeInsets.zero)),
                  const PopupMenuItem(
                      value: 'delete',
                      child: ListTile(
                          leading: Icon(Icons.delete_outline_rounded,
                              color: AppTheme.error),
                          title: Text('Delete Form',
                              style: TextStyle(color: AppTheme.error)),
                          dense: true,
                          contentPadding: EdgeInsets.zero)),
                ],
              ),
            ],
            flexibleSpace: FlexibleSpaceBar(
              background: Container(
                decoration: const BoxDecoration(
                  gradient: LinearGradient(
                    colors: [AppTheme.primaryDark, AppTheme.primaryLight],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  ),
                ),
                child: SafeArea(
                  child: Padding(
                    padding: const EdgeInsets.fromLTRB(20, 56, 20, 16),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                      Row(children: [
                        _StatusPill(isActive: form.isActive),
                      ]),
                      const SizedBox(height: 8),
                      Text(form.title,
                          style: const TextStyle(
                              fontSize: 20,
                              fontWeight: FontWeight.w800,
                              color: Colors.white,
                              height: 1.2),
                          maxLines: 2),
                    ]),
                  ),
                ),
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [

                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: isDark
                        ? AppTheme.darkCard
                        : AppTheme.primaryFaint,
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(
                        color: isDark
                            ? AppTheme.darkBorder
                            : AppTheme.info.withOpacity(0.20)),
                  ),
                  child: Row(children: [
                    const Icon(Icons.link_rounded,
                        size: 20, color: AppTheme.info),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(form.fullLink,
                          style: const TextStyle(
                              fontSize: 14,
                              color: AppTheme.info,
                              fontWeight: FontWeight.w600)),
                    ),
                    GestureDetector(
                      onTap: () {
                        Clipboard.setData(
                            ClipboardData(text: form.fullLink));
                        ScaffoldMessenger.of(context)
                            .showSnackBar(SnackBar(
                          content: const Text('Link copied!'),
                          backgroundColor: AppTheme.success,
                          behavior: SnackBarBehavior.floating,
                          shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(10)),
                          margin: const EdgeInsets.all(16),
                          duration:
                              const Duration(seconds: 2),
                        ));
                      },
                      child: Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 10, vertical: 6),
                        decoration: BoxDecoration(
                          color: AppTheme.primary,
                          borderRadius: BorderRadius.circular(8),
                        ),
                        child: const Text('Copy',
                            style: TextStyle(
                                color: Colors.white,
                                fontSize: 12,
                                fontWeight: FontWeight.w700)),
                      ),
                    ),
                  ]),
                ),
                const SizedBox(height: 20),

                Row(children: [
                  _StatBox(
                      icon: Icons.people_rounded,
                      label: 'Responses',
                      value: '${form.totalResponses}',
                      color: AppTheme.success),
                  const SizedBox(width: 10),
                  _StatBox(
                      icon: Icons.help_rounded,
                      label: 'Questions',
                      value: '${form.questions.length}',
                      color: AppTheme.info),
                  if (form.hasTimer) ...[
                    const SizedBox(width: 10),
                    _StatBox(
                        icon: Icons.timer_rounded,
                        label: 'Minutes',
                        value: '${form.timerMinutes}',
                        color: AppTheme.warning),
                  ],
                ]),
                const SizedBox(height: 20),

                Text('Active Features',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 10),
                Wrap(spacing: 8, runSpacing: 8, children: [
                  if (form.shuffleQuestions)
                    _FeatureChip(
                        Icons.shuffle_rounded, 'Shuffle questions',
                        AppTheme.primary),
                  if (form.shuffleOptions)
                    _FeatureChip(Icons.swap_vert_rounded,
                        'Shuffle answers', AppTheme.info),
                  if (form.oneTimeOnly)
                    _FeatureChip(Icons.lock_outline_rounded,
                        'One-time only', AppTheme.error),
                  if (form.hasTimer)
                    _FeatureChip(Icons.timer_rounded,
                        'Timer ${form.timerMinutes}m',
                        AppTheme.warning),
                  if (form.isScheduled)
                    _FeatureChip(Icons.schedule_rounded,
                        'Scheduled', AppTheme.success),
                ]),
                const SizedBox(height: 24),

                  if (form.isScheduled) ...[
                    Text('Schedule',
                        style: Theme.of(context).textTheme.titleMedium),
                    const SizedBox(height: 10),
                    Container(
                      padding: const EdgeInsets.all(14),
                      decoration: BoxDecoration(
                        color: isDark
                            ? AppTheme.darkCard
                            : AppTheme.surfaceCard,
                        borderRadius: BorderRadius.circular(14),
                        border: Border.all(
                            color: isDark
                                ? AppTheme.darkBorder
                                : AppTheme.border),
                      ),
                      child: DefaultTextStyle.merge(
                        style: const TextStyle(color: AppTheme.info),
                        child: Row(children: [
                          _ScheduleCol(
                              label: 'Opens',
                              dt: form.scheduledOpen),
                          Container(
                              width: 1, height: 40,
                              margin: const EdgeInsets.symmetric(horizontal: 16),
                              color: isDark ? AppTheme.darkBorder : AppTheme.border),
                          _ScheduleCol(
                              label: 'Closes',
                              dt: form.scheduledClose),
                        ]),
                      ),
                    ),
                    const SizedBox(height: 24),
                  ],

                Row(children: [
                  Expanded(
                    child: GradientButton(
                      text: 'View Results',
                      onPressed: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) =>
                                  ResultsScreen(form: form))),
                      fullWidth: true,
                      icon: Icons.bar_chart_rounded,
                    ),
                  ),
                ]),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  void _confirmDelete(BuildContext context, FormProvider fp) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20)),
        title: const Text('Delete Form?'),
        content: const Text(
            'This action cannot be undone. All data and responses will be permanently deleted.'),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          ElevatedButton(
            onPressed: () {
              fp.deleteForm(form.id);
              Navigator.pop(context);
              Navigator.pop(context);
            },
            style: ElevatedButton.styleFrom(
                backgroundColor: AppTheme.error),
            child: const Text('Delete'),
          ),
        ],
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  final bool isActive;
  const _StatusPill({required this.isActive});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: isActive
            ? AppTheme.success.withOpacity(0.15)
            : AppTheme.error.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Container(
            width: 6,
            height: 6,
            decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: isActive ? AppTheme.success : AppTheme.error)),
        const SizedBox(width: 5),
        Text(isActive ? 'Active' : 'Closed',
            style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: isActive ? AppTheme.success : AppTheme.error)),
      ]),
    );
  }
}

class _SmallPill extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _SmallPill(
      {required this.icon, required this.label, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding:
          const EdgeInsets.symmetric(horizontal: 8, vertical: 5),
      decoration: BoxDecoration(
        color: color.withOpacity(0.15),
        borderRadius: BorderRadius.circular(20),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 11, color: color),
        const SizedBox(width: 4),
        Text(label,
            style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w600,
                color: color)),
      ]),
    );
  }
}

class _StatBox extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;
  const _StatBox(
      {required this.icon,
      required this.label,
      required this.value,
      required this.color});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
          color: isDark
              ? color.withOpacity(0.12)
              : color.withOpacity(0.07),
          borderRadius: BorderRadius.circular(14),
          border: Border.all(color: color.withOpacity(0.20)),
        ),
        child: Column(children: [
          Icon(icon, size: 22, color: color),
          const SizedBox(height: 6),
          Text(value,
              style: TextStyle(
                  fontSize: 22,
                  fontWeight: FontWeight.w800,
                  color: isDark
                      ? AppTheme.darkTextPrimary
                      : AppTheme.textPrimary)),
          Text(label,
              style: const TextStyle(
                  fontSize: 11, color: AppTheme.textMuted)),
        ]),
      ),
    );
  }
}

class _FeatureChip extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  const _FeatureChip(this.icon, this.label, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      padding:
          const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
      decoration: BoxDecoration(
        color: color.withOpacity(0.08),
        borderRadius: BorderRadius.circular(10),
        border: Border.all(color: color.withOpacity(0.22)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Icon(icon, size: 12, color: color),
        const SizedBox(width: 5),
        Text(label,
            style: TextStyle(
                fontSize: 12,
                fontWeight: FontWeight.w600,
                color: color)),
      ]),
    );
  }
}

class _QuestionRow extends StatelessWidget {
  final int index;
  final QuestionModel q;
  const _QuestionRow({required this.index, required this.q});

  String get _typeName {
    switch (q.type) {
      case QuestionType.multipleChoice: return 'Multiple Choice';
      case QuestionType.shortText:      return 'Short Text';
      case QuestionType.longText:       return 'Long Text';
      case QuestionType.rating:         return 'Rating';
      case QuestionType.yesNo:          return 'Yes / No';
      case QuestionType.imageChoice:    return 'Image Choice';
      case QuestionType.mathFormula:    return 'Math Formula';
      case QuestionType.codeInput:      return 'Code Input';
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : AppTheme.surfaceCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
            color: isDark ? AppTheme.darkBorder : AppTheme.border),
      ),
      child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Container(
          width: 28,
          height: 28,
          decoration: BoxDecoration(
            color: AppTheme.primary.withOpacity(0.09),
            borderRadius: BorderRadius.circular(8),
          ),
          child: Center(
              child: Text('${index + 1}',
                  style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.w700,
                      color: AppTheme.primary))),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
            Text(q.text.isEmpty ? '(Question not filled)' : q.text,
                style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w500,
                    color: isDark
                        ? AppTheme.darkTextPrimary
                        : AppTheme.textPrimary)),
            const SizedBox(height: 4),
            Text(_typeName,
                style: const TextStyle(
                    fontSize: 12,
                    color: AppTheme.primary,
                    fontWeight: FontWeight.w500)),
          ]),
        ),
      ]),
    );
  }
}

class _ScheduleCol extends StatelessWidget {
  final String label;
  final DateTime dt;
  const _ScheduleCol({required this.label, required this.dt});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(label,
            style: const TextStyle(
                fontSize: 11,
                color: AppTheme.textMuted,
                fontWeight: FontWeight.w500)),
        const SizedBox(height: 4),
        Text('${dt.day}/${dt.month}/${dt.year}',
            style: const TextStyle(
                fontSize: 14,
                fontWeight: FontWeight.w700,
                color: AppTheme.textPrimary)),
      ]),
    );
  }
}
