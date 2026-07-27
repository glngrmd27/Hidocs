import 'package:flutter/material.dart';

class AppTheme {
  static const Color primary      = Color(0xFF133E76);
  static const Color primaryLight = Color(0xFF1A5FAB);
  static const Color primaryDark  = Color(0xFF0A2A55);
  static const Color primaryFaint = Color(0xFFEAF0FA);

  static const Color accent      = Color(0xFFFDEDDB);
  static const Color accentDark  = Color(0xFFE8C9A0);
  static const Color accentLight = Color(0xFFFFF8F2);
  static const Color accentCream = Color(0xFFFDEDDB);

  static const Color success      = Color(0xFF1B9E5E);
  static const Color successLight = Color(0xFFE6F7EF);
  static const Color warning      = Color(0xFFF0A500);
  static const Color warningLight = Color(0xFFFFF4E0);
  static const Color error        = Color(0xFFD93025);
  static const Color errorLight   = Color(0xFFFDEAE8);
  static const Color info         = Color(0xFF1976D2);
  static const Color infoLight    = Color(0xFFE3F0FF);

  static const Color errorRed      = Color(0xFFD93025);
  static const Color warningOrange = Color(0xFFF0A500);
  static const Color successGreen  = Color(0xFF1B9E5E);
  static const Color primaryBlue   = Color(0xFF133E76);

  static const Color textPrimary   = Color(0xFF0D1B2A);
  static const Color textSecondary = Color(0xFF3D4F63);
  static const Color textMuted     = Color(0xFF8A9BB0);
  static const Color border        = Color(0xFFDDE3EC);
  static const Color surfaceLight  = Color(0xFFF4F6FA);
  static const Color surfaceCard   = Color(0xFFFFFFFF);

  static const Color darkBg            = Color(0xFF0C1521);
  static const Color darkSurface       = Color(0xFF131F2E);
  static const Color darkCard          = Color(0xFF1A2840);
  static const Color darkBorder        = Color(0xFF243448);
  static const Color darkTextPrimary   = Color(0xFFEDF1F7);
  static const Color darkTextSecondary = Color(0xFFB0BFCE);
  static const Color darkTextMuted     = Color(0xFF5A7080);

  static ThemeData lightTheme = ThemeData(
    brightness: Brightness.light,
    primaryColor: primary,
    scaffoldBackgroundColor: surfaceLight,
    colorScheme: const ColorScheme.light(
      primary: primary,
      secondary: accentDark,
      surface: surfaceCard,
      onPrimary: Colors.white,
      onSecondary: primary,
      onSurface: textPrimary,
      error: error,
    ),
    textTheme: const TextTheme(
      displayLarge:  TextStyle(fontSize: 34, fontWeight: FontWeight.w800, color: primary,        letterSpacing: -1.0),
      displayMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: primary,        letterSpacing: -0.5),
      headlineLarge: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: textPrimary,    letterSpacing: -0.3),
      headlineSmall: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: textPrimary),
      titleLarge:    TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: textPrimary),
      titleMedium:   TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: textPrimary),
      titleSmall:    TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: textSecondary),
      bodyLarge:     TextStyle(fontSize: 16, fontWeight: FontWeight.w400, color: textSecondary, height: 1.55),
      bodyMedium:    TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: textSecondary, height: 1.45),
      bodySmall:     TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: textMuted),
      labelLarge:    TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: textPrimary),
      labelMedium:   TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: textSecondary),
      labelSmall:    TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: textMuted,     letterSpacing: 0.5),
    ),
    cardTheme: const CardThemeData(
      elevation: 0,
      color: surfaceCard,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(20))),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: primary,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700, letterSpacing: 0.2),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: primary,
        side: const BorderSide(color: border, width: 1.5),
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: surfaceCard,
      border:         OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: border)),
      enabledBorder:  OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: border)),
      focusedBorder:  OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: primary, width: 2)),
      errorBorder:    OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: error)),
      focusedErrorBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: error, width: 2)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      hintStyle:      const TextStyle(fontSize: 14, color: textMuted, fontWeight: FontWeight.w400),
      labelStyle:     const TextStyle(fontSize: 13, color: textSecondary, fontWeight: FontWeight.w500),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: primary,
      foregroundColor: Colors.white,
      elevation: 0,
      centerTitle: false,
      titleTextStyle: TextStyle(fontSize: 19, fontWeight: FontWeight.w700, color: Colors.white, letterSpacing: -0.2),
      iconTheme: IconThemeData(color: Colors.white, size: 22),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: surfaceCard,
      selectedItemColor: primary,
      unselectedItemColor: textMuted,
      type: BottomNavigationBarType.fixed,
      elevation: 0,
      selectedLabelStyle:   TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
      unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w400, fontSize: 11),
    ),
    dividerTheme: const DividerThemeData(color: border, thickness: 1, space: 1),
    chipTheme: ChipThemeData(
      backgroundColor: primaryFaint,
      selectedColor: primary,
      labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: primary),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      side: BorderSide.none,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    ),
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? Colors.white : Colors.white),
      trackColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? primary : border),
    ),
  );

  static const Color _darkPrimary = Color(0xFF4A90D9);

  static ThemeData darkTheme = ThemeData(
    brightness: Brightness.dark,
    primaryColor: _darkPrimary,
    scaffoldBackgroundColor: darkBg,
    colorScheme: const ColorScheme.dark(
      primary: _darkPrimary,
      secondary: accent,
      surface: darkCard,
      onPrimary: Colors.white,
      onSecondary: primary,
      onSurface: darkTextPrimary,
      error: error,
    ),
    textTheme: const TextTheme(
      displayLarge:  TextStyle(fontSize: 34, fontWeight: FontWeight.w800, color: _darkPrimary,       letterSpacing: -1.0),
      displayMedium: TextStyle(fontSize: 28, fontWeight: FontWeight.w700, color: _darkPrimary,       letterSpacing: -0.5),
      headlineLarge: TextStyle(fontSize: 24, fontWeight: FontWeight.w700, color: darkTextPrimary,    letterSpacing: -0.3),
      headlineSmall: TextStyle(fontSize: 20, fontWeight: FontWeight.w700, color: darkTextPrimary),
      titleLarge:    TextStyle(fontSize: 18, fontWeight: FontWeight.w600, color: darkTextPrimary),
      titleMedium:   TextStyle(fontSize: 16, fontWeight: FontWeight.w600, color: darkTextPrimary),
      titleSmall:    TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: darkTextSecondary),
      bodyLarge:     TextStyle(fontSize: 16, fontWeight: FontWeight.w400, color: darkTextSecondary, height: 1.55),
      bodyMedium:    TextStyle(fontSize: 14, fontWeight: FontWeight.w400, color: darkTextSecondary, height: 1.45),
      bodySmall:     TextStyle(fontSize: 12, fontWeight: FontWeight.w400, color: darkTextMuted),
      labelLarge:    TextStyle(fontSize: 14, fontWeight: FontWeight.w600, color: darkTextPrimary),
      labelMedium:   TextStyle(fontSize: 12, fontWeight: FontWeight.w500, color: darkTextSecondary),
      labelSmall:    TextStyle(fontSize: 11, fontWeight: FontWeight.w500, color: darkTextMuted,     letterSpacing: 0.5),
    ),
    cardTheme: const CardThemeData(
      elevation: 0,
      color: darkCard,
      surfaceTintColor: Colors.transparent,
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.all(Radius.circular(20))),
    ),
    elevatedButtonTheme: ElevatedButtonThemeData(
      style: ElevatedButton.styleFrom(
        backgroundColor: _darkPrimary,
        foregroundColor: Colors.white,
        elevation: 0,
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w700),
      ),
    ),
    outlinedButtonTheme: OutlinedButtonThemeData(
      style: OutlinedButton.styleFrom(
        foregroundColor: _darkPrimary,
        side: const BorderSide(color: darkBorder, width: 1.5),
        padding: const EdgeInsets.symmetric(horizontal: 28, vertical: 16),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
        textStyle: const TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
      ),
    ),
    inputDecorationTheme: InputDecorationTheme(
      filled: true,
      fillColor: darkSurface,
      border:         OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: darkBorder)),
      enabledBorder:  OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: darkBorder)),
      focusedBorder:  OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: _darkPrimary, width: 2)),
      errorBorder:    OutlineInputBorder(borderRadius: BorderRadius.circular(14), borderSide: const BorderSide(color: error)),
      contentPadding: const EdgeInsets.symmetric(horizontal: 18, vertical: 16),
      hintStyle:      const TextStyle(fontSize: 14, color: darkTextMuted),
      labelStyle:     const TextStyle(fontSize: 13, color: darkTextSecondary, fontWeight: FontWeight.w500),
    ),
    appBarTheme: const AppBarTheme(
      backgroundColor: darkBg,
      foregroundColor: Colors.white,
      elevation: 0,
      titleTextStyle: TextStyle(fontSize: 19, fontWeight: FontWeight.w700, color: Colors.white, letterSpacing: -0.2),
      iconTheme: IconThemeData(color: Colors.white, size: 22),
    ),
    bottomNavigationBarTheme: const BottomNavigationBarThemeData(
      backgroundColor: darkCard,
      selectedItemColor: _darkPrimary,
      unselectedItemColor: darkTextMuted,
      type: BottomNavigationBarType.fixed,
      elevation: 0,
      selectedLabelStyle:   TextStyle(fontWeight: FontWeight.w700, fontSize: 11),
      unselectedLabelStyle: TextStyle(fontWeight: FontWeight.w400, fontSize: 11),
    ),
    dividerTheme: const DividerThemeData(color: darkBorder, thickness: 1, space: 1),
    chipTheme: ChipThemeData(
      backgroundColor: darkSurface,
      selectedColor: _darkPrimary,
      labelStyle: const TextStyle(fontSize: 12, fontWeight: FontWeight.w600, color: _darkPrimary),
      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
      side: BorderSide.none,
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
    ),
    switchTheme: SwitchThemeData(
      thumbColor: WidgetStateProperty.resolveWith((s) => Colors.white),
      trackColor: WidgetStateProperty.resolveWith((s) => s.contains(WidgetState.selected) ? _darkPrimary : darkBorder),
    ),
  );
}
