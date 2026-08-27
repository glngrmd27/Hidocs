import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import '../models/form_model.dart';
import '../models/response_model.dart';
import '../services/api_client.dart';

class ResponseProvider extends ChangeNotifier {
  static const _storageKey = 'my_submissions';
  static const _gradesKey = 'response_grades';

  final List<ResponseModel> _responses = [];
  final Set<String> _submissionIds = {};

  /// Persisted manual grades per response id, so grading status survives
  /// app restarts (backend only stores total_score).
  final Map<String, Map<String, double>> _persistedGrades = {};

  bool _isLoading = false;
  String? _error;

  ResponseProvider() {
    _loadSubmissions();
    _loadGrades();
  }

  List<ResponseModel> get responses => List.unmodifiable(_responses);

  bool get isLoading => _isLoading;
  String? get error => _error;

  List<ResponseModel> getResponsesByForm(String formId) =>
      _responses.where((r) => r.formId == formId).toList();

  List<ResponseModel> getResponsesByRespondent(String respondentId) =>
      _responses.where((r) => r.respondentId == respondentId).toList();

  ResponseModel? getResponse(String id) {
    for (final r in _responses) {
      if (r.id == id) return r;
    }
    return null;
  }

  void addResponse(ResponseModel response) {
    _responses.add(response);
    notifyListeners();
  }

  void updateResponse(ResponseModel updated) {
    final index = _responses.indexWhere((r) => r.id == updated.id);
    if (index != -1) {
      _responses[index] = updated;
      if (_submissionIds.contains(updated.id)) {
        _saveSubmissions();
      }
      notifyListeners();
    }
  }

  Future<void> _loadSubmissions() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final stored = prefs.getStringList(_storageKey) ?? [];

      for (final raw in stored) {
        try {
          final map = Map<String, dynamic>.from(
            jsonDecode(raw) as Map,
          );
          final submission = ResponseModel.fromStoredJson(map);
          _responses.add(submission);
          _submissionIds.add(submission.id);
        } catch (_) {}
      }

      notifyListeners();
    } catch (_) {}
  }

  Future<void> _saveSubmissions() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final stored = _responses
          .where((r) => _submissionIds.contains(r.id))
          .map((r) => jsonEncode(r.toJson()))
          .toList();
      await prefs.setStringList(_storageKey, stored);
    } catch (_) {}
  }

  Future<void> _loadGrades() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      final raw = prefs.getString(_gradesKey);
      if (raw == null || raw.isEmpty) return;

      final decoded = jsonDecode(raw);
      if (decoded is! Map) return;

      decoded.forEach((key, value) {
        if (value is Map) {
          _persistedGrades[key.toString()] = _toDoubleMap(value);
        }
      });
    } catch (_) {}
  }

  Future<void> _saveGrades() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      await prefs.setString(
        _gradesKey,
        jsonEncode(_persistedGrades),
      );
    } catch (_) {}
  }

  void rememberGrades(String responseId, Map<String, double> essayScores) {
    if (essayScores.isEmpty) {
      _persistedGrades.remove(responseId);
    } else {
      _persistedGrades[responseId] = Map<String, double>.from(essayScores);
    }
    _saveGrades();
  }

  void recordSubmission({
    required String formId,
    required String respondentId,
    required String respondentEmail,
    required Map<String, dynamic> answers,
    String formTitle = '',
    String responseId = '',
    double? totalScore,
    DateTime? submittedAt,
    double maxScore = 100,
  }) {
    _responses.removeWhere(
      (r) => r.formId == formId && r.respondentId == respondentId,
    );

    _responses.add(
      ResponseModel.fromSubmission(
        formId: formId,
        respondentId: respondentId,
        respondentEmail: respondentEmail,
        answers: answers,
        formTitle: formTitle,
        responseId: responseId,
        totalScore: totalScore,
        submittedAt: submittedAt,
        maxScore: maxScore,
      ),
    );

    _submissionIds.add(
      responseId.isNotEmpty ? responseId : 'resp_$formId',
    );

    _saveSubmissions();
    notifyListeners();
  }

  void removeResponsesByForm(String formId) {
    _responses.removeWhere((r) => r.formId == formId);
    notifyListeners();
  }

  Future<void> loadResponsesForForm(
    String formId, {
    FormModel? form,
  }) async {
    _isLoading = true;
    _error = null;
    notifyListeners();

    try {
      final data = await ApiClient.get('/forms/$formId/responses');

      if (data is List) {
        final existingByRespId = <String, ResponseModel>{
          for (final r in _responses)
            if (r.formId == formId) r.id: r,
        };

        _responses.removeWhere((r) => r.formId == formId);
        _responses.addAll(
          data.whereType<Map>().map((e) {
            final parsed = ResponseModel.fromApiJson(
              Map<String, dynamic>.from(e),
              form: form,
            );

            // Ignore placeholder 0 from API for essay (backend keeps 0 until graded)
            final filteredParsed = <String, double>{};
            parsed.essayScores.forEach((k, v) {
              if (v != 0) filteredParsed[k] = v;
            });
            final merged = <String, double>{
              ..._persistedGrades[parsed.id] ?? const {},
              ...existingByRespId[parsed.id]?.essayScores ?? const {},
              ...filteredParsed,
            };
            // Also filter 0 from merged (so 0 never counts as graded)
            merged.removeWhere((k, v) => v == 0);

            if (merged.isNotEmpty) {
              return parsed.copyWith(essayScores: merged);
            }

            return parsed;
          }),
        );
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
  }

  Future<void> saveGrade(String responseId, double totalScore) async {
    _error = null;

    try {
      await ApiClient.put(
        '/responses/$responseId/grade',
        body: {'total_score': totalScore},
      );
    } on ApiException catch (e) {
      _error = e.message;
      rethrow;
    } catch (_) {
      _error = 'Koneksi gagal. Periksa jaringan atau server.';
      rethrow;
    }
  }

}

Map<String, double> _toDoubleMap(dynamic value) {
  if (value is! Map) return <String, double>{};

  return value.entries.fold<Map<String, double>>(
    <String, double>{},
    (acc, entry) {
      if (entry.value is num) {
        acc[entry.key.toString()] = (entry.value as num).toDouble();
      }
      return acc;
    },
  );
}
