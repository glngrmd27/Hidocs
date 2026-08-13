import 'package:flutter/material.dart';
import '../models/response_model.dart';

class ResponseProvider extends ChangeNotifier {
  final List<ResponseModel> _responses = [];

  ResponseProvider() {
    _seedMockData();
  }

  List<ResponseModel> get responses => List.unmodifiable(_responses);

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
      notifyListeners();
    }
  }

  void removeResponsesByForm(String formId) {
    _responses.removeWhere((r) => r.formId == formId);
    notifyListeners();
  }

  void _seedMockData() {
    final now = DateTime.now();

    _responses.addAll([
      ResponseModel(
        id: 'resp001',
        formId: 'form001',
        respondentId: 'user001',
        respondentName: 'Budi Santoso',
        respondentEmail: 'budi@email.com',
        startedAt: now.subtract(const Duration(minutes: 26)),
        submittedAt: now.subtract(const Duration(minutes: 24)),
        answers: {
          'q1': 5,
          'q2': 'o1',
          'q3': '1/3',
          'q4': 'def factorial(n):\n    return 1 if n < 2 else n * factorial(n-1)',
          'q5': 'The library needs more engineering books.',
        },
        essayScores: {'q3': 80, 'q4': 90, 'q5': 70},
        score: 80,
        maxScore: 100,
      ),
      ResponseModel(
        id: 'resp002',
        formId: 'form001',
        respondentId: 'user002',
        respondentName: 'Ani Rahayu',
        respondentEmail: 'ani@email.com',
        startedAt: now.subtract(const Duration(minutes: 20)),
        submittedAt: now.subtract(const Duration(minutes: 17)),
        answers: {
          'q1': 4,
          'q2': 'o3',
          'q3': '0.333',
          'q4': 'import math\ndef factorial(n):\n    return math.factorial(n)',
          'q5': '',
        },
      ),
      ResponseModel(
        id: 'resp003',
        formId: 'form001',
        respondentId: 'user003',
        respondentName: 'Dedi Maulana',
        respondentEmail: 'dedi@email.com',
        startedAt: now.subtract(const Duration(minutes: 31)),
        submittedAt: now.subtract(const Duration(minutes: 28)),
        answers: {
          'q1': 3,
          'q2': 'o2',
          'q3': '1/3',
          'q4': 'def factorial(n):\n    result = 1\n    for i in range(2, n+1):\n        result *= i\n    return result',
          'q5': 'Add more chairs in the hallway area.',
        },
        essayScores: {'q3': 100, 'q4': 85, 'q5': 60},
        score: 81,
        maxScore: 100,
      ),
      ResponseModel(
        id: 'resp004',
        formId: 'form002',
        respondentId: 'user004',
        respondentName: 'Sari Kusuma',
        respondentEmail: 'sari@email.com',
        startedAt: now.subtract(const Duration(minutes: 18)),
        submittedAt: now.subtract(const Duration(minutes: 16)),
        answers: {
          'q1': 'o1',
          'q2': 'class MyWidget extends StatefulWidget {\n  @override\n  State<MyWidget> createState() => _MyWidgetState();\n}',
          'q3': 'o1',
        },
      ),
      ResponseModel(
        id: 'resp005',
        formId: 'form002',
        respondentId: 'user005',
        respondentName: 'Riko Pratama',
        respondentEmail: 'riko@email.com',
        startedAt: now.subtract(const Duration(minutes: 40)),
        submittedAt: now.subtract(const Duration(minutes: 36)),
        answers: {
          'q1': 'o2',
          'q2': 'class MyWidget extends StatefulWidget { }',
          'q3': 'o2',
        },
      ),
    ]);
  }
}
