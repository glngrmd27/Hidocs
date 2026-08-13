import 'package:flutter/material.dart';
import '../app_theme.dart';
import '../models/form_model.dart';
import '../widgets/gradient_button.dart';

class ResultsScreen extends StatelessWidget {
  final FormModel form;
  const ResultsScreen({required this.form, super.key});

  static const _mock = [
    {'name': 'Budi Santoso',  'date': '10 Jun 2024', 'score': 85, 'duration': '22 min'},
    {'name': 'Ani Rahayu',    'date': '11 Jun 2024', 'score': 92, 'duration': '18 min'},
    {'name': 'Dedi Maulana',  'date': '12 Jun 2024', 'score': 78, 'duration': '28 min'},
    {'name': 'Sari Kusuma',   'date': '13 Jun 2024', 'score': 95, 'duration': '15 min'},
    {'name': 'Riko Pratama',  'date': '14 Jun 2024', 'score': 70, 'duration': '30 min'},
    {'name': 'Dewi Lestari',  'date': '14 Jun 2024', 'score': 88, 'duration': '20 min'},
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final avg  = _mock.fold(0, (s, r) => s + (r['score'] as int)) ~/ _mock.length;
    final high = _mock.map((r) => r['score'] as int).reduce((a, b) => a > b ? a : b);
    final low  = _mock.map((r) => r['score'] as int).reduce((a, b) => a < b ? a : b);

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 140,
            pinned: true,
            backgroundColor: AppTheme.primary,
            elevation: 0,
            
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
                    padding:
                        const EdgeInsets.fromLTRB(20, 52, 20, 14),
                    child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        mainAxisAlignment: MainAxisAlignment.end,
                        children: [
                      const Text('Form Results',
                          style: TextStyle(
                              fontSize: 13,
                              color: Colors.white60,
                              fontWeight: FontWeight.w500)),
                      const SizedBox(height: 4),
                      Text(form.title,
                          style: const TextStyle(
                              fontSize: 18,
                              fontWeight: FontWeight.w800,
                              color: Colors.white),
                          maxLines: 1,
                          overflow: TextOverflow.ellipsis),
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

                Row(children: [
                  _SummaryCard(
                      label: 'Total Responses',
                      value: '${form.totalResponses}',
                      icon: Icons.people_rounded,
                      color: AppTheme.primary),
                  const SizedBox(width: 10),
                  _SummaryCard(
                      label: 'Average',
                      value: '$avg%',
                      icon: Icons.trending_up_rounded,
                      color: AppTheme.success),
                ]),
                const SizedBox(height: 10),
                Row(children: [
                  _SummaryCard(
                      label: 'Highest',
                      value: '$high%',
                      icon: Icons.emoji_events_rounded,
                      color: AppTheme.warning),
                  const SizedBox(width: 10),
                  _SummaryCard(
                      label: 'Lowest',
                      value: '$low%',
                      icon: Icons.arrow_downward_rounded,
                      color: AppTheme.error),
                ]),
                const SizedBox(height: 24),

                Text('Score Distribution',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 14),
                ..._buildDistribution(context, isDark),
                const SizedBox(height: 24),

                Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                  Text('Respondents',
                      style: Theme.of(context).textTheme.titleMedium),
                  Text('${_mock.length} participants',
                      style: const TextStyle(
                          fontSize: 13, color: AppTheme.textMuted)),
                ]),
                const SizedBox(height: 12),
                ..._mock.map((r) =>
                    _RespondentRow(data: r, isDark: isDark)),
                const SizedBox(height: 28),

                GradientButton(
                  text: 'Export to Excel',
                  onPressed: () => _showExportSnack(context),
                  fullWidth: true,
                  icon: Icons.table_chart_rounded,
                  colors: const [AppTheme.success, Color(0xFF0D8A4B)],
                ),
                const SizedBox(height: 12),
                OutlinedButton.icon(
                  onPressed: () {},
                  icon: const Icon(Icons.picture_as_pdf_rounded, size: 17),
                  label: const Text('Export to PDF'),
                  style: OutlinedButton.styleFrom(
                      minimumSize:
                          const Size(double.infinity, 52),
                      shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(14))),
                ),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildDistribution(BuildContext context, bool isDark) {
    final ranges = [
      {'label': '90–100%', 'count': 2, 'color': AppTheme.success},
      {'label': '75–89%',  'count': 3, 'color': AppTheme.info},
      {'label': '60–74%',  'count': 1, 'color': AppTheme.warning},
      {'label': '< 60%',   'count': 0, 'color': AppTheme.error},
    ];
    final max = ranges
        .map((r) => r['count'] as int)
        .reduce((a, b) => a > b ? a : b);

    return ranges.map((r) {
      final count = r['count'] as int;
      final color = r['color'] as Color;
      final frac  = max == 0 ? 0.0 : count / max;

      return Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Row(children: [
          SizedBox(
            width: 66,
            child: Text(r['label'] as String,
                style: const TextStyle(
                    fontSize: 12, color: AppTheme.textMuted,
                    fontWeight: FontWeight.w500)),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: ClipRRect(
              borderRadius: BorderRadius.circular(6),
              child: LinearProgressIndicator(
                value: frac,
                minHeight: 12,
                backgroundColor: isDark
                    ? AppTheme.darkBorder
                    : AppTheme.border,
                valueColor: AlwaysStoppedAnimation(color),
              ),
            ),
          ),
          const SizedBox(width: 10),
          Text('$count',
              style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                  color: isDark
                      ? AppTheme.darkTextPrimary
                      : AppTheme.textPrimary)),
        ]),
      );
    }).toList();
  }

  void _showExportSnack(BuildContext context) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: const Row(children: [
        Icon(Icons.check_circle_rounded, color: Colors.white, size: 16),
        SizedBox(width: 8),
        Text('Data exported to Excel successfully!',
            style: TextStyle(fontWeight: FontWeight.w500)),
      ]),
      backgroundColor: AppTheme.success,
      behavior: SnackBarBehavior.floating,
      shape:
          RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.all(16),
    ));
  }
}

class _SummaryCard extends StatelessWidget {
  final String label;
  final String value;
  final IconData icon;
  final Color color;
  const _SummaryCard(
      {required this.label,
      required this.value,
      required this.icon,
      required this.color});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: isDark
              ? color.withValues(alpha: 0.12)
              : color.withValues(alpha: 0.07),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(color: color.withValues(alpha: 0.20)),
        ),
        child: Row(children: [
          Container(
            width: 38,
            height: 38,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(11),
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(width: 10),
          Expanded(
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
              Text(value,
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: isDark
                          ? AppTheme.darkTextPrimary
                          : AppTheme.textPrimary)),
              Text(label,
                  style: const TextStyle(
                      fontSize: 11, color: AppTheme.textMuted),
                  maxLines: 1,
                  overflow: TextOverflow.ellipsis),
            ]),
          ),
        ]),
      ),
    );
  }
}

class _RespondentRow extends StatelessWidget {
  final Map<String, dynamic> data;
  final bool isDark;
  const _RespondentRow({required this.data, required this.isDark});

  Color _scoreColor(int s) {
    if (s >= 90) return AppTheme.success;
    if (s >= 75) return AppTheme.info;
    if (s >= 60) return AppTheme.warning;
    return AppTheme.error;
  }

  @override
  Widget build(BuildContext context) {
    final score = data['score'] as int;
    final color = _scoreColor(score);

    return Container(
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : AppTheme.surfaceCard,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(
            color: isDark ? AppTheme.darkBorder : AppTheme.border),
      ),
      child: Row(children: [
        Container(
          width: 38,
          height: 38,
          decoration: BoxDecoration(
            color: AppTheme.primary.withValues(alpha: 0.09),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Center(
            child: Text(
              (data['name'] as String).substring(0, 1),
              style: const TextStyle(
                  fontSize: 16,
                  fontWeight: FontWeight.w800,
                  color: AppTheme.primary),
            ),
          ),
        ),
        const SizedBox(width: 12),

        Expanded(
          child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
            Text(data['name'] as String,
                style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    color: isDark
                        ? AppTheme.darkTextPrimary
                        : AppTheme.textPrimary)),
            const SizedBox(height: 2),
            Row(children: [
              const Icon(Icons.calendar_today_outlined,
                  size: 11, color: AppTheme.textMuted),
              const SizedBox(width: 4),
              Text(data['date'] as String,
                  style: const TextStyle(
                      fontSize: 11, color: AppTheme.textMuted)),
              const SizedBox(width: 10),
              const Icon(Icons.timer_outlined,
                  size: 11, color: AppTheme.textMuted),
              const SizedBox(width: 4),
              Text(data['duration'] as String,
                  style: const TextStyle(
                      fontSize: 11, color: AppTheme.textMuted)),
            ]),
          ]),
        ),

        Container(
          padding: const EdgeInsets.symmetric(
              horizontal: 12, vertical: 6),
          decoration: BoxDecoration(
            color: color.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(10),
            border: Border.all(color: color.withValues(alpha: 0.25)),
          ),
          child: Text('$score%',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: color)),
        ),
      ]),
    );
  }
}
