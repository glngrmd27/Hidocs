import 'package:flutter/material.dart';
import '../app_theme.dart';

// ─── Primary gradient button ───────────────────────────────────────────────────
class GradientButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool isLoading;
  final bool fullWidth;
  final IconData? icon;
  final List<Color>? colors;
  final double height;

  const GradientButton({
    required this.text,
    required this.onPressed,
    this.isLoading  = false,
    this.fullWidth  = false,
    this.icon,
    this.colors,
    this.height = 52,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final grad = colors ?? [AppTheme.primary, AppTheme.primaryLight];

    return AnimatedContainer(
      duration: const Duration(milliseconds: 150),
      width:   fullWidth ? double.infinity : null,
      height:  height,
      decoration: BoxDecoration(
        gradient: LinearGradient(
          colors: isLoading
              ? [grad.first.withOpacity(0.70), grad.last.withOpacity(0.70)]
              : grad,
          begin: Alignment.centerLeft,
          end:   Alignment.centerRight,
        ),
        borderRadius: BorderRadius.circular(14),
        boxShadow: isLoading ? null : [
          BoxShadow(
            color: grad.first.withOpacity(0.28),
            blurRadius: 14,
            offset: const Offset(0, 5),
          ),
        ],
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: isLoading ? null : onPressed,
          splashColor: Colors.white.withOpacity(0.15),
          child: Center(
            child: isLoading
                ? const SizedBox(
                    width: 22, height: 22,
                    child: CircularProgressIndicator(
                        strokeWidth: 2.5, color: Colors.white))
                : Row(mainAxisSize: MainAxisSize.min, children: [
                    if (icon != null) ...[
                      Icon(icon!, size: 19, color: Colors.white),
                      const SizedBox(width: 8),
                    ],
                    Text(text, style: const TextStyle(
                        fontSize: 16, fontWeight: FontWeight.w700,
                        color: Colors.white, letterSpacing: 0.2)),
                  ]),
          ),
        ),
      ),
    );
  }
}

// ─── Outlined / glass button ──────────────────────────────────────────────────
class GlassButton extends StatelessWidget {
  final String text;
  final VoidCallback onPressed;
  final bool fullWidth;
  final IconData? icon;
  final Color? textColor;
  final Color? borderColor;
  final double height;

  const GlassButton({
    required this.text,
    required this.onPressed,
    this.fullWidth   = false,
    this.icon,
    this.textColor,
    this.borderColor,
    this.height = 52,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final isDark  = Theme.of(context).brightness == Brightness.dark;
    final fgColor = textColor ?? (isDark ? const Color(0xFF4A90D9) : AppTheme.primary);
    final bdColor = borderColor ?? (isDark ? AppTheme.darkBorder : AppTheme.border);

    return Container(
      width:  fullWidth ? double.infinity : null,
      height: height,
      decoration: BoxDecoration(
        color:         isDark ? AppTheme.darkCard : AppTheme.surfaceCard,
        borderRadius:  BorderRadius.circular(14),
        border:        Border.all(color: bdColor, width: 1.5),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius: BorderRadius.circular(14),
        child: InkWell(
          borderRadius: BorderRadius.circular(14),
          onTap: onPressed,
          child: Center(
            child: Row(mainAxisSize: MainAxisSize.min, children: [
              if (icon != null) ...[
                Icon(icon!, size: 19, color: fgColor),
                const SizedBox(width: 8),
              ],
              Text(text, style: TextStyle(
                  fontSize: 16, fontWeight: FontWeight.w600, color: fgColor)),
            ]),
          ),
        ),
      ),
    );
  }
}

// ─── Icon action button (small) ───────────────────────────────────────────────
class IconActionButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;
  final Color? color;
  final Color? bgColor;
  final String? tooltip;

  const IconActionButton({
    required this.icon,
    required this.onPressed,
    this.color,
    this.bgColor,
    this.tooltip,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    final fg = color ?? AppTheme.primary;
    final bg = bgColor ?? AppTheme.primaryFaint;

    return Tooltip(
      message: tooltip ?? '',
      child: GestureDetector(
        onTap: onPressed,
        child: Container(
          width: 40, height: 40,
          decoration: BoxDecoration(
            color:         bg,
            borderRadius:  BorderRadius.circular(12),
          ),
          child: Icon(icon, size: 19, color: fg),
        ),
      ),
    );
  }
}
