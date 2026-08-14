import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'package:share_plus/share_plus.dart';

import '../app_theme.dart';
import '../models/form_model.dart';
import '../providers/form_provider.dart';
import '../widgets/gradient_button.dart';

class ResultsScreen extends StatefulWidget {
  final FormModel form;
  const ResultsScreen({required this.form, super.key});

  @override
  State<ResultsScreen> createState() => _ResultsScreenState();
}

class _ResultsScreenState extends State<ResultsScreen> {
  List<Map<String, dynamic>> _responses = [];
  bool _loading = true;
  bool _exporting = false;

  @override
  void initState() {
    super.initState();
    _load();
  }

  Future<void> _load() async {
    setState(() {
      _loading = true;
    });

    final provider = Provider.of<FormProvider>(context, listen: false);
    final responses = await provider.loadResponses(widget.form.id);

    if (!mounted) return;

    setState(() {
      _responses = responses;
      _loading = false;
    });
  }

  List<Map<String, dynamic>> get _rows {
    return _responses.map((r) {
      final submittedAt =
          DateTime.tryParse(r['submitted_at']?.toString() ?? '');
      final score = (r['total_score'] as num?)?.toDouble() ?? 0;

      return {
        'name': (r['respondent_email'] ?? 'Respondent').toString(),
        'date': submittedAt != null
            ? '${submittedAt.day}/${submittedAt.month}/${submittedAt.year}'
            : '-',
        'score': score,
        'duration': '-',
      };
    }).toList();
  }

  double? get _average {
    if (_rows.isEmpty) return 0;
    final total = _rows.fold(0.0, (s, r) => s + (r['score'] as double));
    return total / _rows.length;
  }

  double? get _highest {
    if (_rows.isEmpty) return 0;
    return _rows
        .map((r) => r['score'] as double)
        .reduce((a, b) => a > b ? a : b);
  }

  double? get _lowest {
    if (_rows.isEmpty) return 0;
    return _rows
        .map((r) => r['score'] as double)
        .reduce((a, b) => a < b ? a : b);
  }

  Future<void> _exportExcel() async {
    setState(() {
      _exporting = true;
    });

    try {
      final provider = Provider.of<FormProvider>(context, listen: false);
      final bytes = await provider.exportResponses(widget.form.id,
          format: 'xlsx');

      if (!mounted) return;

      final file = XFile.fromData(
        bytes,
        mimeType:
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        name: 'responses_${widget.form.id}.xlsx',
      );

      await Share.shareXFiles(
        [file],
        text: 'Ekspor respon form: ${widget.form.title}',
      );
    } catch (_) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          SnackBar(
            content: const Text(
              'Gagal mengekspor data. Periksa jaringan Anda.',
              style: TextStyle(fontWeight: FontWeight.w500),
            ),
            backgroundColor: AppTheme.error,
            behavior: SnackBarBehavior.floating,
            shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12)),
            margin: const EdgeInsets.all(16),
          ),
        );
      }
    }

    if (mounted) {
      setState(() {
        _exporting = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
                      Text(widget.form.title,
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
                      value: '${widget.form.totalResponses}',
                      icon: Icons.people_rounded,
                      color: AppTheme.primary),
                  const SizedBox(width: 10),
                  _SummaryCard(
                      label: 'Average',
                      value: '${_average?.toStringAsFixed(0) ?? 0}%',
                      icon: Icons.trending_up_rounded,
                      color: AppTheme.success),
                ]),
                const SizedBox(height: 10),
                Row(children: [
                  _SummaryCard(
                      label: 'Highest',
                      value: '${_highest?.toStringAsFixed(0) ?? 0}%',
                      icon: Icons.emoji_events_rounded,
                      color: AppTheme.warning),
                  const SizedBox(width: 10),
                  _SummaryCard(
                      label: 'Lowest',
                      value: '${_lowest?.toStringAsFixed(0) ?? 0}%',
                      icon: Icons.arrow_downward_rounded,
                      color: AppTheme.error),
                ]),
                const SizedBox(height: 24),

                Text('Score Distribution',
                    style: Theme.of(context).textTheme.titleMedium),
                const SizedBox(height: 14),
                if (_loading)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Center(child: CircularProgressIndicator()),
                  )
                else
                  ..._buildDistribution(context, isDark),
                const SizedBox(height: 24),

                Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                  Text('Respondents',
                      style: Theme.of(context).textTheme.titleMedium),
                  Text('${_rows.length} participants',
                      style: const TextStyle(
                          fontSize: 13, color: AppTheme.textMuted)),
                ]),
                const SizedBox(height: 12),
                if (_loading)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Center(child: CircularProgressIndicator()),
                  )
                else if (_rows.isEmpty)
                  const Padding(
                    padding: EdgeInsets.symmetric(vertical: 24),
                    child: Center(
                      child: Text('Belum ada respon.',
                          style: TextStyle(color: AppTheme.textMuted)),
                    ),
                  )
                else
                  ..._rows.map((r) =>
                      _RespondentRow(data: r, isDark: isDark)),
                const SizedBox(height: 28),

                GradientButton(
                  text: 'Export to Excel',
                  onPressed: _exportExcel,
                  isLoading: _exporting,
                  fullWidth: true,
                  icon: Icons.table_chart_rounded,
                  colors: const [AppTheme.success, Color(0xFF0D8A4B)],
                ),
                const SizedBox(height: 12),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildDistribution(BuildContext context, bool isDark) {
    final scores = _rows.map((r) => r['score'] as double).toList();

    int countInRange(double min, double max) {
      return scores
          .where((s) => s >= min && (max == 100 ? s <= max : s < max))
          .length;
    }

    final ranges = [
      {'label': '90–100%', 'count': countInRange(90, 100), 'color': AppTheme.success},
      {'label': '75–89%',  'count': countInRange(75, 90), 'color': AppTheme.info},
      {'label': '60–74%',  'count': countInRange(60, 75), 'color': AppTheme.warning},
      {'label': '< 60%',   'count': countInRange(0, 60), 'color': AppTheme.error},
    ];
    final max = ranges
        .map((r) => r['count'] as int)
        .fold(0, (a, b) => a > b ? a : b);

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

  Color _scoreColor(double s) {
    if (s >= 90) return AppTheme.success;
    if (s >= 75) return AppTheme.info;
    if (s >= 60) return AppTheme.warning;
    return AppTheme.error;
  }

  @override
  Widget build(BuildContext context) {
    final score = data['score'] as double;
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
              (data['name'] as String).substring(0, 1).toUpperCase(),
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
                        : AppTheme.textPrimary),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
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
          child: Text('${score.toStringAsFixed(0)}%',
              style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: color)),
        ),
      ]),
    );
  }
}