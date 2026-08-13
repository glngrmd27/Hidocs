import 'package:flutter/material.dart';
import '../app_theme.dart';
import '../models/form_model.dart';

class SettingsTab extends StatelessWidget {
  final bool shuffleQuestion;
  final bool shuffleOption;
  final bool oneTime;
  final bool active;
  final ResultVisibility visibility;
  final int timerMinutes;

  final ValueChanged<bool> onShuffleQuestion;
  final ValueChanged<bool> onShuffleOption;
  final ValueChanged<bool> onOneTime;
  final ValueChanged<bool> onActive;
  final ValueChanged<ResultVisibility> onVisibility;

  const SettingsTab({
    super.key,
    required this.shuffleQuestion,
    required this.shuffleOption,
    required this.oneTime,
    required this.active,
    required this.visibility,
    required this.timerMinutes,
    required this.onShuffleQuestion,
    required this.onShuffleOption,
    required this.onOneTime,
    required this.onActive,
    required this.onVisibility,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return ListView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
      children: [
        _SectionLabel('Form Behavior', Icons.tune_rounded, isDark),
        const SizedBox(height: 16),

        _SwitchCard(
          key: const ValueKey('shuffle_question'),
          icon: Icons.shuffle_rounded,
          iconColor: AppTheme.primary,
          iconBg: AppTheme.primaryFaint,
          title: 'Shuffle question order',
          subtitle: 'Each respondent gets questions in a different order',
          value: shuffleQuestion,
          onChanged: onShuffleQuestion,
          isDark: isDark,
        ),
        _SwitchCard(
          key: const ValueKey('shuffle_option'),
          icon: Icons.swap_vert_rounded,
          iconColor: const Color(0xFF7B2FBE),
          iconBg: const Color(0xFF7B2FBE).withValues(alpha: 0.10),
          title: 'Shuffle answer options',
          subtitle: 'Multiple-choice options are randomized each time',
          value: shuffleOption,
          onChanged: onShuffleOption,
          isDark: isDark,
        ),
        _SwitchCard(
          key: const ValueKey('one_time'),
          icon: Icons.lock_outline_rounded,
          iconColor: AppTheme.error,
          iconBg: AppTheme.error.withValues(alpha: 0.10),
          title: 'One-time submission only',
          subtitle: 'Each person can only submit once',
          value: oneTime,
          onChanged: onOneTime,
          isDark: isDark,
        ),
        _SwitchCard(
          key: const ValueKey('active'),
          icon: Icons.play_circle_outline_rounded,
          iconColor: AppTheme.success,
          iconBg: AppTheme.success.withValues(alpha: 0.10),
          title: 'Activate immediately',
          subtitle: 'Form goes live right after you save',
          value: active,
          onChanged: onActive,
          isDark: isDark,
        ),
        const SizedBox(height: 28),

        _SectionLabel('Result Visibility', Icons.bar_chart_rounded, isDark),
        const SizedBox(height: 8),
        Text(
          'Choose what respondents see after submitting.',
          style: TextStyle(
            fontSize: 13,
            color: isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
          ),
        ),
        const SizedBox(height: 16),

        _RadioCard(
          icon: Icons.visibility_off_outlined,
          iconColor: AppTheme.textMuted,
          title: 'Hide results',
          subtitle: 'Respondents see nothing after submission',
          value: ResultVisibility.hidden,
          groupValue: visibility,
          onChanged: onVisibility,
          isDark: isDark,
        ),
        _RadioCard(
          icon: Icons.visibility_outlined,
          iconColor: AppTheme.info,
          title: 'Show result only',
          subtitle: 'They can see which answers were correct/incorrect',
          value: ResultVisibility.resultOnly,
          groupValue: visibility,
          onChanged: onVisibility,
          isDark: isDark,
        ),
        _RadioCard(
          icon: Icons.leaderboard_outlined,
          iconColor: AppTheme.success,
          title: 'Show result + score',
          subtitle: 'They can see both their answers and final score',
          value: ResultVisibility.resultAndScore,
          groupValue: visibility,
          onChanged: onVisibility,
          isDark: isDark,
        ),
      ],
    );
  }
}

class _SectionLabel extends StatelessWidget {
  final String text;
  final IconData icon;
  final bool isDark;

  const _SectionLabel(this.text, this.icon, this.isDark);

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            color: isDark
                ? AppTheme.primary.withValues(alpha: 0.15)
                : AppTheme.primaryFaint,
            borderRadius: BorderRadius.circular(10),
          ),
          child: Icon(
            icon,
            size: 17,
            color: isDark ? const Color(0xFF4A90D9) : AppTheme.primary,
          ),
        ),
        const SizedBox(width: 12),
        Text(
          text,
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w700,
            color: isDark ? AppTheme.darkTextPrimary : AppTheme.textPrimary,
          ),
        ),
      ],
    );
  }
}

class _SwitchCard extends StatefulWidget {
  final IconData icon;
  final Color iconColor;
  final Color iconBg;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;
  final bool isDark;

  const _SwitchCard({
    super.key,
    required this.icon,
    required this.iconColor,
    required this.iconBg,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
    required this.isDark,
  });

  @override
  State<_SwitchCard> createState() => _SwitchCardState();
}

class _SwitchCardState extends State<_SwitchCard> {
  late bool _currentValue;

  @override
  void initState() {
    super.initState();
    _currentValue = widget.value;
  }

  @override
  void didUpdateWidget(covariant _SwitchCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.value != widget.value) {
      _currentValue = widget.value;
    }
  }

  void _handleTap() {
    setState(() {
      _currentValue = !_currentValue;
    });
    widget.onChanged(_currentValue);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: GestureDetector(
        onTap: _handleTap,
        behavior: HitTestBehavior.opaque,
        child: Container(
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: widget.isDark ? AppTheme.darkCard : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: widget.isDark ? AppTheme.darkBorder : AppTheme.border,
            ),
            boxShadow: widget.isDark
                ? null
                : [
                    BoxShadow(
                      color: Colors.black.withValues(alpha: 0.03),
                      blurRadius: 6,
                      offset: const Offset(0, 2),
                    ),
                  ],
          ),
          child: Row(
            children: [
              Container(
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: widget.iconBg,
                  borderRadius: BorderRadius.circular(11),
                ),
                child: Icon(widget.icon, size: 20, color: widget.iconColor),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      widget.title,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: widget.isDark
                            ? AppTheme.darkTextPrimary
                            : AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      widget.subtitle,
                      style: TextStyle(
                        fontSize: 11,
                        color: widget.isDark
                            ? AppTheme.darkTextMuted
                            : AppTheme.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),

              AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                curve: Curves.fastOutSlowIn,
                width: 44,
                height: 26,
                padding: const EdgeInsets.all(3),
                decoration: BoxDecoration(
                  borderRadius: BorderRadius.circular(20),
                  color: _currentValue
                      ? AppTheme.primary
                      : (widget.isDark ? Colors.grey[700] : Colors.grey[300]),
                ),
                child: AnimatedAlign(
                  duration: const Duration(milliseconds: 180),
                  curve: Curves.fastOutSlowIn,
                  alignment: _currentValue
                      ? Alignment.centerRight
                      : Alignment.centerLeft,
                  child: Container(
                    width: 20,
                    height: 20,
                    decoration: const BoxDecoration(
                      shape: BoxShape.circle,
                      color: Colors.white,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _RadioCard extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final ResultVisibility value;
  final ResultVisibility groupValue;
  final ValueChanged<ResultVisibility> onChanged;
  final bool isDark;

  const _RadioCard({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.groupValue,
    required this.onChanged,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    final selected = value == groupValue;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      child: GestureDetector(
        onTap: () => onChanged(value),
        behavior: HitTestBehavior.opaque,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.fastOutSlowIn,
          padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
          decoration: BoxDecoration(
            color: isDark ? AppTheme.darkCard : Colors.white,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(
              color: selected
                  ? AppTheme.primary
                  : (isDark ? AppTheme.darkBorder : AppTheme.border),
              width: selected ? 2 : 1,
            ),
          ),
          child: Row(
            children: [
              AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                curve: Curves.fastOutSlowIn,
                width: 40,
                height: 40,
                decoration: BoxDecoration(
                  color: selected
                      ? AppTheme.primary.withValues(alpha: 0.10)
                      : (isDark
                          ? AppTheme.darkSurface
                          : AppTheme.surfaceLight),
                  borderRadius: BorderRadius.circular(11),
                ),
                child: Icon(
                  icon,
                  size: 20,
                  color: selected ? AppTheme.primary : iconColor,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      title,
                      style: TextStyle(
                        fontSize: 14,
                        fontWeight: FontWeight.w700,
                        color: isDark
                            ? AppTheme.darkTextPrimary
                            : AppTheme.textPrimary,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      subtitle,
                      style: TextStyle(
                        fontSize: 11,
                        color: isDark
                            ? AppTheme.darkTextMuted
                            : AppTheme.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),

              AnimatedContainer(
                duration: const Duration(milliseconds: 180),
                curve: Curves.fastOutSlowIn,
                width: 20,
                height: 20,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  border: Border.all(
                    color: selected
                        ? AppTheme.primary
                        : (isDark ? Colors.grey[600]! : Colors.grey[400]!),
                    width: selected ? 6 : 2,
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}