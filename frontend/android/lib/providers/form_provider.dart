import 'package:flutter/material.dart';
import '../models/form_model.dart';
import '../models/question_model.dart';

class FormProvider extends ChangeNotifier {
  final List<FormModel> _forms = [];
  final Map<String, bool> _submittedForms = {};
  bool _isLoading = false;

  List<FormModel> get forms => _forms;
  bool get isLoading => _isLoading;
  List<FormModel> get activeForms => _forms.where((f) => f.isActive).toList();

  FormProvider() {
    _loadMockData();
  }

  void _loadMockData() {
    _forms.addAll([
      FormModel(
        id: 'form001',
        title: 'Survey Kepuasan Mahasiswa 2024',
        creatorId: 'admin001',
        shortLink: 'sv2024',
        customLinkAlias: 'survey-mhs-2024',
        scheduledOpen: DateTime(2024, 6, 1),
        scheduledClose: DateTime(2024, 7, 15),
        timerMinutes: 30,
        shuffleQuestions: true,
        shuffleOptions: true,
        oneTimeOnly: true,
        isActive: true,
        totalResponses: 247,
        createdAt: DateTime(2024, 5, 20),
        questions: [
          QuestionModel(id: 'q1', type: QuestionType.rating, text: 'Rate kualitas pengajaran overall', ratingMax: 5),
          QuestionModel(id: 'q2', type: QuestionType.multipleChoice, text: 'Fasilitas mana yang paling needs improvement?', options: [
            OptionModel(id: 'o1', text: 'Perpustakaan'),
            OptionModel(id: 'o2', text: 'Laboratorium'),
            OptionModel(id: 'o3', text: 'Ruang Kelas'),
            OptionModel(id: 'o4', text: 'Kantin'),
          ]),
          QuestionModel(id: 'q3', type: QuestionType.mathFormula, text: 'Hitung integral berikut:', mathFormula: '∫₀¹ x² dx = 1/3'),
          QuestionModel(id: 'q4', type: QuestionType.codeInput, text: 'Tulis fungsi Python untuk menghitung factorial:', codeSnippet: 'def factorial(n):\n    # Tulis kode di sini\n    pass'),
          QuestionModel(id: 'q5', type: QuestionType.longText, text: 'Saran dan masukan untuk kampus:', isRequired: false),
        ],
      ),
      FormModel(
        id: 'form002',
        title: 'Quiz Pemrograman Mobile - Flutter',
        creatorId: 'admin001',
        shortLink: 'qzflutter',
        customLinkAlias: 'quiz-flutter-w5',
        scheduledOpen: DateTime(2024, 6, 10, 8, 0),
        scheduledClose: DateTime(2024, 6, 10, 9, 30),
        timerMinutes: 45,
        shuffleQuestions: true,
        shuffleOptions: true,
        oneTimeOnly: true,
        isActive: true,
        totalResponses: 35,
        createdAt: DateTime(2024, 6, 5),
        questions: [
          QuestionModel(id: 'q1', type: QuestionType.multipleChoice, text: 'Widget Flutter untuk membuat scrollable list:', options: [
            OptionModel(id: 'o1', text: 'ListView'),
            OptionModel(id: 'o2', text: 'GridView'),
            OptionModel(id: 'o3', text: 'Column'),
            OptionModel(id: 'o4', text: 'Stack'),
          ]),
          QuestionModel(id: 'q2', type: QuestionType.codeInput, text: 'Buat StatefulWidget minimal:', codeSnippet: 'class MyWidget extends StatefulWidget {\n  // Lengkapi\n}'),
          QuestionModel(id: 'q3', type: QuestionType.multipleChoice, text: 'State management library yang populer:', options: [
            OptionModel(id: 'o1', text: 'Provider'),
            OptionModel(id: 'o2', text: 'GetX'),
            OptionModel(id: 'o3', text: 'BLoC'),
            OptionModel(id: 'o4', text: 'MobX'),
          ]),
        ],
      ),
      FormModel(
        id: 'form003',
        title: 'Form Pendaftaran Event Hackathon',
        creatorId: 'admin001',
        shortLink: 'hack24',
        scheduledOpen: DateTime(2024, 5, 1),
        scheduledClose: DateTime(2024, 8, 30),
        timerMinutes: 0,
        shuffleQuestions: false,
        shuffleOptions: false,
        oneTimeOnly: true,
        isActive: true,
        totalResponses: 89,
        createdAt: DateTime(2024, 4, 15),
        questions: [
          QuestionModel(id: 'q1', type: QuestionType.shortText, text: 'Nama lengkap:'),
          QuestionModel(id: 'q2', type: QuestionType.shortText, text: 'NIM:'),
          QuestionModel(id: 'q3', type: QuestionType.multipleChoice, text: 'Track yang dipilih:', options: [
            OptionModel(id: 'o1', text: 'Web Development'),
            OptionModel(id: 'o2', text: 'Mobile Development'),
            OptionModel(id: 'o3', text: 'AI/ML'),
            OptionModel(id: 'o4', text: 'IoT'),
          ]),
          QuestionModel(id: 'q4', type: QuestionType.yesNo, text: 'Apakah Anda sudah pernah ikut hackathon sebelumnya?'),
        ],
      ),
    ]);
  }

  FormModel? getFormById(String id) {
    try {
      return _forms.firstWhere((f) => f.id == id);
    } catch (e) {
      return null;
    }
  }

  List<FormModel> getFormsByCreator(String creatorId) {
    return _forms.where((f) => f.creatorId == creatorId).toList();
  }

  bool hasSubmitted(String formId) {
    return _submittedForms[formId] ?? false;
  }

  void markSubmitted(String formId) {
    _submittedForms[formId] = true;
    notifyListeners();
  }

  Future<void> createForm(FormModel form) async {
    _isLoading = true;
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 800));
    _forms.add(form);
    _isLoading = false;
    notifyListeners();
  }

  Future<void> deleteForm(String formId) async {
    _isLoading = true;
    notifyListeners();
    await Future.delayed(const Duration(milliseconds: 500));
    _forms.removeWhere((f) => f.id == formId);
    _isLoading = false;
    notifyListeners();
  }

  void toggleFormActive(String formId) {
    final index = _forms.indexWhere((f) => f.id == formId);
    if (index != -1) {
      _forms[index] = copyFormModel(_forms[index], isActive: !_forms[index].isActive);
      notifyListeners();
    }
  }
}