import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

class LanguageProvider extends ChangeNotifier {
  static const _preferenceKey = 'app_language';
  Locale _locale = const Locale('id');

  Locale get locale => _locale;
  bool get isIndonesian => _locale.languageCode == 'id';

  LanguageProvider() {
    _restoreLocale();
  }

  Future<void> _restoreLocale() async {
    final prefs = await SharedPreferences.getInstance();
    final languageCode = prefs.getString(_preferenceKey);
    if (languageCode == 'en' || languageCode == 'id') {
      _locale = Locale(languageCode!);
      notifyListeners();
    }
  }

  Future<void> setLanguage(String languageCode) async {
    if (languageCode != 'en' && languageCode != 'id') return;
    if (_locale.languageCode == languageCode) return;

    _locale = Locale(languageCode);
    notifyListeners();

    final prefs = await SharedPreferences.getInstance();
    await prefs.setString(_preferenceKey, languageCode);
  }
}
