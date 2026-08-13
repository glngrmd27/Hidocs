import 'dart:typed_data';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';

import '../models/form_model.dart';
import '../services/api_client.dart';

class FormProvider extends ChangeNotifier {
  final List<FormModel> _forms = [];
  final Set<String> _submittedForms = {};
  bool _isLoading = false;
  String? _error;

  List<FormModel> get forms => List.unmodifiable(_forms);
  bool get isLoading => _isLoading;
  String? get error => _error;
  List<FormModel> get activeForms =>
      _forms.where((f) => f.isActive).toList();

  FormProvider() {
    _loadSubmitted();
  }

  Future<void> _loadSubmitted() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final ids = prefs.getStringList('submitted_forms') ?? [];
      _submittedForms.addAll(ids);
      notifyListeners();
    } catch (_) {}
  }

  Future<void> _saveSubmitted() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setStringList('submitted_forms', _submittedForms.toList());
    } catch (_) {}
  }

  bool hasSubmitted(String formId) => _submittedForms.contains(formId);

  void markSubmitted(String formId) {
    _submittedForms.add(formId);
    _saveSubmitted();
    notifyListeners();
  }

  Future<void> loadForms() async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiClient.get('/forms');
      final list = (data is List) ? data : <dynamic>[];

      _forms
        ..clear()
        ..addAll(
            list.whereType<Map>().map((e) => FormModel.fromJson({...e})));

      _isLoading = false;
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
      _isLoading = false;
    }

    notifyListeners();
  }

  Future<FormModel?> loadFormDetail(String formId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiClient.get('/forms/$formId');

      if (data is Map) {
        final detail = FormModel.fromJson(Map<String, dynamic>.from(data));

        final index = _forms.indexWhere((f) => f.id == detail.id);
        if (index >= 0) {
          _forms[index] = detail;
        } else {
          _forms.add(detail);
        }

        _isLoading = false;
        notifyListeners();

        return detail;
      }

      _isLoading = false;
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
      _isLoading = false;
    }

    notifyListeners();

    return null;
  }

  Future<FormModel?> loadPublicForm(String code) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiClient.get(
        '/public/forms/${Uri.encodeComponent(code)}',
      );

      if (data is Map) {
        final form = FormModel.fromJson(Map<String, dynamic>.from(data));

        final index = _forms.indexWhere((f) => f.id == form.id);
        if (index >= 0) {
          _forms[index] = form;
        } else {
          _forms.add(form);
        }

        _isLoading = false;
        notifyListeners();

        return form;
      }

      _isLoading = false;
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
      _isLoading = false;
    }

    notifyListeners();

    return null;
  }

  List<FormModel> getFormsByCreator(String creatorId) {
    return _forms.where((f) => f.creatorId == creatorId).toList();
  }

  Future<bool> createForm(FormModel form) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final created = await ApiClient.post('/forms', body: form.toCreateJson());

      if (created is! Map) {
        _error = 'Gagal membuat form.';
        _isLoading = false;
        notifyListeners();
        return false;
      }

      final formId = (created['id'] ?? '').toString();

      var orderIndex = 1;
      for (final question in form.questions) {
        await ApiClient.post(
          '/forms/$formId/questions',
          body: question.toQuestionJson(orderIndex: orderIndex),
        );
        orderIndex++;
      }

      await ApiClient.put(
        '/forms/$formId/settings',
        body: form.toSettingsJson(),
      );

      await loadForms();

      _isLoading = false;
      notifyListeners();

      return true;
    } on ApiException catch (e) {
      _error = e.message;
      _isLoading = false;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
      _isLoading = false;
    }

    notifyListeners();

    return false;
  }

  Future<bool> deleteForm(String formId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiClient.delete('/forms/$formId');
      _forms.removeWhere((f) => f.id == formId);
      _isLoading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
    }

    _isLoading = false;
    notifyListeners();

    return false;
  }

  Future<bool> toggleFormActive(String formId) async {
    final index = _forms.indexWhere((f) => f.id == formId);
    if (index < 0) return false;

    final form = _forms[index];
    final newActive = !form.isActive;

    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      await ApiClient.put('/forms/$formId', body: form.toUpdateJson());
      _forms[index] = copyFormModel(form, isActive: newActive);
      _isLoading = false;
      notifyListeners();
      return true;
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
    }

    _isLoading = false;
    notifyListeners();

    return false;
  }

  Future<Map<String, dynamic>?> submitForm(
    String formId, {
    required String respondentEmail,
    required List<Map<String, dynamic>> answers,
    bool auto = false,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiClient.post('/forms/$formId/submit', body: {
        'respondent_email': respondentEmail,
        'passcode': '',
        'is_auto_submitted': auto,
        'answers': answers,
      });

      markSubmitted(formId);

      _isLoading = false;
      notifyListeners();

      if (data is Map) {
        return Map<String, dynamic>.from(data);
      }

      return null;
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
    }

    _isLoading = false;
    notifyListeners();

    return null;
  }

  Future<List<Map<String, dynamic>>> loadResponses(String formId) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiClient.get('/forms/$formId/responses');
      _isLoading = false;
      notifyListeners();

      if (data is List) {
        return data
            .whereType<Map>()
            .map((e) => Map<String, dynamic>.from(e))
            .toList();
      }

      return [];
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
    }

    _isLoading = false;
    notifyListeners();

    return [];
  }

  Future<Map<String, dynamic>?> loadAnalytics(String formId) async {
    try {
      final data = await ApiClient.get('/forms/$formId/analytics');
      if (data is Map) {
        return Map<String, dynamic>.from(data);
      }
    } on ApiException catch (e) {
      _error = e.message;
    } catch (_) {}

    return null;
  }

  Future<Uint8List> exportResponses(String formId,
      {String format = 'xlsx'}) async {
    return ApiClient.getBytes('/forms/$formId/export', query: {
      'format': format,
    });
  }

  void clearError() {
    _error = null;
  }
}