import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../app_theme.dart';
import '../utils/constants.dart';
import 'custom_input.dart';

class InfoTab extends StatefulWidget {
  final TextEditingController titleController;
  final TextEditingController linkController;
  final DateTime openDate;
  final DateTime closeDate;
  final TimeOfDay openTime;
  final TimeOfDay closeTime;
  final int timerMinutes;
  final bool isPublic;
  final ValueChanged<bool> onIsPublic;
  final ValueChanged<DateTime> onOpenDate;
  final ValueChanged<DateTime> onCloseDate;
  final ValueChanged<TimeOfDay> onOpenTime;
  final ValueChanged<TimeOfDay> onCloseTime;

  const InfoTab({
    super.key,
    required this.titleController,
    required this.linkController,
    required this.openDate,
    required this.closeDate,
    required this.openTime,
    required this.closeTime,
    required this.timerMinutes,
    required this.isPublic,
    required this.onIsPublic,
    required this.onOpenDate,
    required this.onCloseDate,
    required this.onOpenTime,
    required this.onCloseTime,
  });

  @override
  State<InfoTab> createState() => _InfoTabState();
}

class _InfoTabState extends State<InfoTab> {
  void _randomizeLink() {
    setState(() {
      widget.linkController.text = generateRandomLink(10);
    });
  }

  Future<void> _pickDate(DateTime initial, ValueChanged<DateTime> cb) async {
    // Clamp initialDate to valid range to avoid assertion when stored date is old
    final safeInitial = initial.isBefore(DateTime(2024))
        ? DateTime(2024)
        : initial.isAfter(DateTime(2035))
            ? DateTime(2035)
            : initial;
    final d = await showDatePicker(
      context: context,
      initialDate: safeInitial,
      firstDate: DateTime(2024),
      lastDate: DateTime(2035),
      helpText: 'Pilih tanggal',
      cancelText: 'Batal',
      confirmText: 'OK',
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(primary: AppTheme.primary),
        ),
        child: child!,
      ),
    );
    if (d != null) cb(d);
  }

  Future<void> _pickTime(TimeOfDay initial, ValueChanged<TimeOfDay> cb) async {
    final t = await showTimePicker(
      context: context,
      initialTime: initial,
      // Force dial mode to prevent manual keyboard entry errors (e.g. 25:00, 9:5)
      initialEntryMode: TimePickerEntryMode.dial,
      helpText: 'Pilih waktu',
      cancelText: 'Batal',
      confirmText: 'OK',
      errorInvalidText: 'Format waktu tidak valid',
      hourLabelText: 'Jam',
      minuteLabelText: 'Menit',
      builder: (ctx, child) => Theme(
        data: Theme.of(ctx).copyWith(
          colorScheme: const ColorScheme.light(primary: AppTheme.primary),
        ),
        child: child!,
      ),
    );
    if (t != null) cb(t);
  }

  String _fmtDate(DateTime d) =>
      '${d.day.toString().padLeft(2, '0')}/${d.month.toString().padLeft(2, '0')}/${d.year}';

  String _fmtTime(TimeOfDay t) {
    final h = t.hourOfPeriod == 0 ? 12 : t.hourOfPeriod;
    final m = t.minute.toString().padLeft(2, '0');
    final p = t.period == DayPeriod.am ? 'AM' : 'PM';
    return '$h:$m $p';
  }

  String _timerLabel() {
    final m = widget.timerMinutes;
    if (m <= 0) return 'Tanpa batas waktu';
    if (m < 60) return '$m menit';
    final h = m ~/ 60;
    final rem = m % 60;
    return rem == 0 ? '${h} jam' : '${h} jam ${rem} menit';
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return SingleChildScrollView(
      padding: const EdgeInsets.fromLTRB(20, 24, 20, 40),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          _SectionLabel('Informasi Form', Icons.info_outline_rounded, isDark),
          const SizedBox(height: 16),
          CustomInput(
            controller: widget.titleController,
            label: 'Judul Form',
            hint: 'mis. Survei Kepuasan Siswa',
            prefixIcon: Icons.title_rounded,
            validator: (v) =>
                (v == null || v.trim().isEmpty) ? 'Judul wajib diisi' : null,
          ),
          const SizedBox(height: 24),

          _SectionLabel('Link Form', Icons.link_rounded, isDark),
          const SizedBox(height: 8),
          Text(
            'Buat link singkat yang mudah dibagikan untuk form Anda.',
            style: TextStyle(
              fontSize: 13,
              color: isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
            ),
          ),
          const SizedBox(height: 14),

          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Expanded(
                child: CustomInput(
                  controller: widget.linkController,
                  label: 'Link Kustom',
                  hint: 'mis. survei-saya-2026',
                  prefixIcon: Icons.link_rounded,
                  onChanged: (_) => setState(() {}),
                  inputFormatters: [
                    FilteringTextInputFormatter.allow(RegExp(r'[a-z0-9\-]')),
                  ],
                ),
              ),
              const SizedBox(width: 10),
              Tooltip(
                message: 'Buat link acak',
                child: GestureDetector(
                  onTap: _randomizeLink,
                  child: Container(
                    height: 52,
                    width: 52,
                    decoration: BoxDecoration(
                      color: AppTheme.primary,
                      borderRadius: BorderRadius.circular(14),
                      boxShadow: [
                        BoxShadow(
                          color: AppTheme.primary.withValues(alpha: 0.28),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: const Icon(
                      Icons.shuffle_rounded,
                      color: Colors.white,
                      size: 22,
                    ),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 28),

          _SectionLabel('Berbagi & Visibilitas', Icons.public_rounded, isDark),
          const SizedBox(height: 8),
          Text(
            'Form publik muncul di halaman pengguna dan dapat dibagikan lewat link '
            'dan QR code. Form privat hanya bisa diakses dengan scan QR code.',
            style: TextStyle(
              fontSize: 13,
              color: isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
            ),
          ),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _VisibilityCard(
                  selected: widget.isPublic,
                  icon: Icons.public_rounded,
                  title: 'Publik',
                  subtitle: 'QR · Link · Halaman pengguna',
                  color: AppTheme.success,
                  isDark: isDark,
                  onTap: () => widget.onIsPublic(true),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _VisibilityCard(
                  selected: !widget.isPublic,
                  icon: Icons.lock_outline_rounded,
                  title: 'Privat',
                  subtitle: 'QR saja',
                  color: AppTheme.warning,
                  isDark: isDark,
                  onTap: () => widget.onIsPublic(false),
                ),
              ),
            ],
          ),
          const SizedBox(height: 28),

          _SectionLabel('Jadwal', Icons.schedule_rounded, isDark),
          const SizedBox(height: 8),
          Text(
            'Atur kapan form dibuka dan ditutup. Timer dihitung otomatis.',
            style: TextStyle(
              fontSize: 13,
              color: isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
            ),
          ),
          const SizedBox(height: 16),

          Row(
            children: [
              Expanded(
                child: _DateTimeField(
                  label: 'Buka',
                  icon: Icons.calendar_today_rounded,
                  value: _fmtDate(widget.openDate),
                  isDark: isDark,
                  onTap: () => _pickDate(widget.openDate, widget.onOpenDate),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _DateTimeField(
                  label: 'At',
                  icon: Icons.access_time_rounded,
                  value: _fmtTime(widget.openTime),
                  isDark: isDark,
                  onTap: () => _pickTime(widget.openTime, widget.onOpenTime),
                ),
              ),
            ],
          ),
          const SizedBox(height: 12),

          Row(
            children: [
              Expanded(
                child: _DateTimeField(
                  label: 'Tutup',
                  icon: Icons.calendar_today_rounded,
                  value: _fmtDate(widget.closeDate),
                  isDark: isDark,
                  onTap: () => _pickDate(widget.closeDate, widget.onCloseDate),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _DateTimeField(
                  label: 'At',
                  icon: Icons.access_time_rounded,
                  value: _fmtTime(widget.closeTime),
                  isDark: isDark,
                  onTap: () => _pickTime(widget.closeTime, widget.onCloseTime),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),

          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: widget.timerMinutes > 0
                  ? AppTheme.warning.withValues(alpha: 0.08)
                  : (isDark ? AppTheme.darkSurface : AppTheme.surfaceLight),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: widget.timerMinutes > 0
                    ? AppTheme.warning.withValues(alpha: 0.35)
                    : (isDark ? AppTheme.darkBorder : AppTheme.border),
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: widget.timerMinutes > 0
                        ? AppTheme.warning.withValues(alpha: 0.15)
                        : AppTheme.primaryFaint,
                    borderRadius: BorderRadius.circular(11),
                  ),
                    child: Icon(
                    widget.timerMinutes > 0
                        ? Icons.timer_rounded
                        : Icons.timer_off_outlined,
                    size: 20,
                    color: widget.timerMinutes > 0
                        ? AppTheme.warning
                        : AppTheme.primary,
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        'Batas Waktu • Otomatis',
                        style: TextStyle(
                          fontSize: 12,
                          fontWeight: FontWeight.w600,
                          color: isDark
                              ? AppTheme.darkTextMuted
                              : AppTheme.textMuted,
                        ),
                      ),
                      const SizedBox(height: 3),
                      Text(
                        _timerLabel(),
                        style: TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w800,
                          color: widget.timerMinutes > 0
                              ? AppTheme.warning
                              : (isDark
                                  ? AppTheme.darkTextSecondary
                                  : AppTheme.textSecondary),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
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

class _VisibilityCard extends StatelessWidget {
  final bool selected;
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final bool isDark;
  final VoidCallback onTap;

  const _VisibilityCard({
    required this.selected,
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 180),
        curve: Curves.fastOutSlowIn,
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
        decoration: BoxDecoration(
          color: selected
              ? color.withValues(alpha: 0.09)
              : (isDark ? AppTheme.darkSurface : Colors.white),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: selected
                ? color
                : (isDark ? AppTheme.darkBorder : AppTheme.border),
            width: selected ? 2 : 1,
          ),
        ),
        child: Column(
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 180),
              width: 42,
              height: 42,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.14),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Icon(icon, size: 21, color: color),
            ),
            const SizedBox(height: 10),
            Text(
              title,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: selected
                    ? color
                    : (isDark
                        ? AppTheme.darkTextPrimary
                        : AppTheme.textPrimary),
              ),
            ),
            const SizedBox(height: 3),
            Text(
              subtitle,
              textAlign: TextAlign.center,
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
    );
  }
}

class _DateTimeField extends StatelessWidget {
  final String label;
  final IconData icon;
  final String value;
  final bool isDark;
  final VoidCallback onTap;

  const _DateTimeField({
    required this.label,
    required this.icon,
    required this.value,
    required this.isDark,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w600,
            color: isDark ? AppTheme.darkTextSecondary : AppTheme.textSecondary,
          ),
        ),
        const SizedBox(height: 6),
        InkWell(
          onTap: onTap,
          borderRadius: BorderRadius.circular(14),
          child: Container(
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 14),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.darkSurface : Colors.white,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                color: isDark ? AppTheme.darkBorder : AppTheme.border,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 16,
                  color: isDark ? const Color(0xFF4A90D9) : AppTheme.primary,
                ),
                const SizedBox(width: 8),
                Flexible(
                  child: Text(
                    value,
                    style: TextStyle(
                      fontSize: 13,
                      fontWeight: FontWeight.w600,
                      color: isDark
                          ? AppTheme.darkTextPrimary
                          : AppTheme.textPrimary,
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}