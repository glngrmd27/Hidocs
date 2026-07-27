import 'package:flutter/material.dart';
import '../app_theme.dart';

class CustomCard extends StatelessWidget {
  final Widget child;
  final EdgeInsetsGeometry? padding;
  final EdgeInsetsGeometry? margin;
  final VoidCallback? onTap;
  final Color? color;
  final double radius;
  final bool hasBorder;
  final bool hasShadow;

  const CustomCard({
    required this.child,
    this.padding,
    this.margin,
    this.onTap,
    this.color,
    this.radius    = 18,
    this.hasBorder = true,
    this.hasShadow = true,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bg     = color ?? (isDark ? AppTheme.darkCard : AppTheme.surfaceCard);
    final bd     = isDark ? AppTheme.darkBorder : AppTheme.border;

    return Container(
      margin:  margin  ?? const EdgeInsets.only(bottom: 12),
      decoration: BoxDecoration(
        color:         bg,
        borderRadius:  BorderRadius.circular(radius),
        border: hasBorder ? Border.all(color: bd) : null,
        boxShadow: hasShadow && !isDark ? [
          BoxShadow(
            color:  Colors.black.withOpacity(0.05),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ] : null,
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(radius),
        child: InkWell(
          borderRadius: BorderRadius.circular(radius),
          onTap: onTap,
          child: Padding(
            padding: padding ?? const EdgeInsets.all(18),
            child: child,
          ),
        ),
      ),
    );
  }
}

// ─── Stat card ────────────────────────────────────────────────────────────────
class StatCard extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color accentColor;
  final bool dark;

  const StatCard({
    required this.icon,
    required this.label,
    required this.value,
    required this.accentColor,
    this.dark = false,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16, horizontal: 12),
        decoration: BoxDecoration(
          color: dark
              ? Colors.white.withOpacity(0.08)
              : accentColor.withOpacity(0.07),
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
            color: dark
                ? Colors.white.withOpacity(0.12)
                : accentColor.withOpacity(0.18),
          ),
        ),
        child: Column(children: [
          Container(
            width: 36, height: 36,
            decoration: BoxDecoration(
              color: dark
                  ? accentColor.withOpacity(0.20)
                  : accentColor.withOpacity(0.14),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(icon, size: 18, color: accentColor),
          ),
          const SizedBox(height: 10),
          Text(value, style: TextStyle(
              fontSize: 22, fontWeight: FontWeight.w800,
              color: dark ? Colors.white : AppTheme.textPrimary)),
          const SizedBox(height: 2),
          Text(label, style: TextStyle(
              fontSize: 11, fontWeight: FontWeight.w500,
              color: dark ? Colors.white54 : AppTheme.textMuted),
              textAlign: TextAlign.center),
        ]),
      ),
    );
  }
}
