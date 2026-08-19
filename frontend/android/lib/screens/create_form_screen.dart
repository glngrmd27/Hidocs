import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_theme.dart';
import '../providers/form_provider.dart';
import '../providers/auth_provider.dart';
import '../models/form_model.dart';
import '../models/question_model.dart';
import '../widgets/info_tab.dart';
import '../widgets/questions_tab.dart';
import '../widgets/settings_tab.dart';

class CreateFormScreen extends StatefulWidget {
  final FormModel? existingForm;

  const CreateFormScreen({this.existingForm, super.key});

  bool get isEditing => existingForm != null;

  @override
  State<CreateFormScreen> createState() => _CreateFormScreenState();
}

class _CreateFormScreenState extends State<CreateFormScreen>
    with SingleTickerProviderStateMixin {
  final _titleCtrl = TextEditingController();
  final _linkCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  late TabController _tabCtrl;

  DateTime _openDate = DateTime.now();

  DateTime _closeDate = DateTime.now().add(
    const Duration(days: 1),
  );

  TimeOfDay _openTime = TimeOfDay.now();
  TimeOfDay _closeTime = TimeOfDay.now();

  bool _shuffleQ = false;
  bool _shuffleO = false;
  bool _oneTime = true;
  bool _isActive = true;

  bool _isPublic = true;

  ResultVisibility _resultVisibility =
      ResultVisibility.hidden;

  final List<QuestionModel> _questions = [];

  @override
  void initState() {
    super.initState();

    final existing = widget.existingForm;

    if (existing != null) {
      _titleCtrl.text = existing.title;
      _linkCtrl.text = existing.customLinkAlias.isEmpty
          ? existing.shortLink
          : existing.customLinkAlias;

      _openDate = DateTime(existing.scheduledOpen.year,
          existing.scheduledOpen.month, existing.scheduledOpen.day);
      _closeDate = DateTime(existing.scheduledClose.year,
          existing.scheduledClose.month, existing.scheduledClose.day);
      _openTime = TimeOfDay.fromDateTime(existing.scheduledOpen);
      _closeTime = TimeOfDay.fromDateTime(existing.scheduledClose);

      _shuffleQ = existing.shuffleQuestions;
      _shuffleO = existing.shuffleOptions;
      _oneTime = existing.oneTimeOnly;
      _isActive = existing.isActive;
      _isPublic = existing.isPublic;
      _resultVisibility = existing.resultVisibility;
      _questions.addAll(existing.questions);
    }

    _tabCtrl = TabController(
      length: 3,
      vsync: this,
    );
  }

  @override
  void dispose() {
    _titleCtrl.dispose();
    _linkCtrl.dispose();
    _tabCtrl.dispose();
    super.dispose();
  }

  DateTime get _openDateTime {
    return DateTime(
      _openDate.year,
      _openDate.month,
      _openDate.day,
      _openTime.hour,
      _openTime.minute,
    );
  }

  DateTime get _closeDateTime {
    return DateTime(
      _closeDate.year,
      _closeDate.month,
      _closeDate.day,
      _closeTime.hour,
      _closeTime.minute,
    );
  }

  Duration get _timerDuration {
    final duration = _closeDateTime.difference(
      _openDateTime,
    );

    return duration.isNegative
        ? Duration.zero
        : duration;
  }

  int get _timerMinutes {
    return _timerDuration.inMinutes;
  }

  void _addQuestion(QuestionType type) {
    final timestamp =
        DateTime.now().microsecondsSinceEpoch;

    List<OptionModel> options = [];
    int? ratingMax;

    switch (type) {
      case QuestionType.multipleChoice:
      case QuestionType.imageChoice:
        options = [
          OptionModel(
            id: 'o${timestamp}1',
            text: 'Option 1',
          ),
          OptionModel(
            id: 'o${timestamp}2',
            text: 'Option 2',
          ),
        ];
      case QuestionType.yesNo:
        options = [
          OptionModel(
            id: 'o${timestamp}y',
            text: 'Yes',
          ),
          OptionModel(
            id: 'o${timestamp}n',
            text: 'No',
          ),
        ];
      case QuestionType.rating:
        ratingMax = 5;
      case QuestionType.shortText:
      case QuestionType.longText:
      case QuestionType.codeInput:
      case QuestionType.mathFormula:
        break;
    }

    final question = QuestionModel(
      id: 'q$timestamp',
      type: type,
      text: '',
      isRequired: true,
      ratingMax: ratingMax,
      hasScore: false,
      score: 0,
      options: options,
    );

    setState(() {
      _questions.add(question);
    });

    _tabCtrl.animateTo(2);
  }

  void _removeQuestion(int index) {
    if (index < 0 ||
        index >= _questions.length) {
      return;
    }

    setState(() {
      _questions.removeAt(index);
    });
  }

  void _reorderQuestion(
    int oldIndex,
    int newIndex,
  ) {
    if (oldIndex < 0 ||
        oldIndex >= _questions.length ||
        newIndex < 0 ||
        newIndex > _questions.length) {
      return;
    }

    setState(() {
      final item = _questions.removeAt(oldIndex);
      _questions.insert(newIndex, item);
    });
  }

  String _generateSlug(String title) {
    var slug = title
        .toLowerCase()
        .trim()
        .replaceAll(RegExp(r'[^a-z0-9]+'), '-')
        .replaceAll(RegExp(r'^-+|-+$'), '');

    if (slug.isEmpty) {
      slug = 'form';
    }

    if (slug.length > 20) {
      slug = slug.substring(0, 20);
      slug = slug.replaceAll(
        RegExp(r'-+$'),
        '',
      );
    }

    return slug;
  }

  void _showMessage(
    String message, {
    Color? backgroundColor,
  }) {
    ScaffoldMessenger.of(context)
      ..hideCurrentSnackBar()
      ..showSnackBar(
        SnackBar(
          content: Text(message),
          backgroundColor: backgroundColor,
          behavior: SnackBarBehavior.floating,
        ),
      );
  }

  Future<void> _saveForm() async {
    if (!_formKey.currentState!.validate()) {
      _tabCtrl.animateTo(0);
      return;
    }

    if (_questions.isEmpty) {
      _showMessage(
        'Please add at least 1 question',
        backgroundColor: AppTheme.warning,
      );

      _tabCtrl.animateTo(2);
      return;
    }

    if (_closeDateTime.isBefore(_openDateTime)) {
      _showMessage(
        'Close time cannot be before open time',
        backgroundColor: AppTheme.error,
      );

      _tabCtrl.animateTo(0);
      return;
    }

    final auth = Provider.of<AuthProvider>(
      context,
      listen: false,
    );

    final formProvider = Provider.of<FormProvider>(
      context,
      listen: false,
    );

    final currentUser = auth.currentUser;

    if (currentUser == null) {
      _showMessage(
        'You must be logged in to create a form',
        backgroundColor: AppTheme.error,
      );
      return;
    }

    final title = _titleCtrl.text.trim();
    final customAlias = _linkCtrl.text.trim();

    final slug = customAlias.isEmpty
        ? _generateSlug(title)
        : customAlias;

    final now = DateTime.now();

    final editing = widget.existingForm;

    final form = FormModel(
      id: editing?.id ?? 'form${now.millisecondsSinceEpoch}',
      title: title,
      creatorId: currentUser.id,
      shortLink: slug,
      customLinkAlias: customAlias,
      scheduledOpen: _openDateTime,
      scheduledClose: _closeDateTime,
      timerMinutes: _timerMinutes,
      isPublic: _isPublic,
      shuffleQuestions: _shuffleQ,
      shuffleOptions: _shuffleO,
      oneTimeOnly: _oneTime,
      isActive: _isActive,
      resultVisibility: _resultVisibility,
      questions: List<QuestionModel>.from(
        _questions,
      ),
      createdAt: editing?.createdAt ?? now,
    );

    final ok = editing != null
        ? await formProvider.updateForm(form)
        : await formProvider.createForm(form);

    if (!mounted) {
      return;
    }

    if (!ok) {
      final errorMessage = formProvider.error ??
          'Gagal menyimpan form. Periksa jaringan Anda.';

      formProvider.clearError();

      _showMessage(
        errorMessage,
        backgroundColor: AppTheme.error,
      );

      return;
    }

    Navigator.pop(context);

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text(
          editing != null
              ? 'Form updated successfully!'
              : 'Form created successfully!',
        ),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: Text(widget.isEditing ? 'Edit Form' : 'Create Form'),
        bottom: TabBar(
          controller: _tabCtrl,
          indicatorColor: Colors.white,
          indicatorWeight: 3,
          labelColor: Colors.white,
          unselectedLabelColor: Colors.white70,
          labelStyle: const TextStyle(
            fontWeight: FontWeight.w700,
            fontSize: 13,
          ),
          unselectedLabelStyle: const TextStyle(
            fontWeight: FontWeight.w400,
            fontSize: 13,
          ),
          tabs: const [
            Tab(text: 'Info'),
            Tab(text: 'Settings'),
            Tab(text: 'Questions'),
          ],
        ),
        actions: [
          TextButton(
            onPressed: _saveForm,
            child: const Text(
              'Save',
              style: TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w700,
                fontSize: 15,
              ),
            ),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: TabBarView(
          controller: _tabCtrl,
          children: [
            InfoTab(
              titleController: _titleCtrl,
              linkController: _linkCtrl,
              openDate: _openDate,
              closeDate: _closeDate,
              openTime: _openTime,
              closeTime: _closeTime,
              timerMinutes: _timerMinutes,
              isPublic: _isPublic,
              onIsPublic: (value) {
                setState(() {
                  _isPublic = value;
                });
              },
              onOpenDate: (date) {
                setState(() {
                  _openDate = date;
                });
              },
              onCloseDate: (date) {
                setState(() {
                  _closeDate = date;
                });
              },
              onOpenTime: (time) {
                setState(() {
                  _openTime = time;
                });
              },
              onCloseTime: (time) {
                setState(() {
                  _closeTime = time;
                });
              },
            ),
            SettingsTab(
              shuffleQuestion: _shuffleQ,
              shuffleOption: _shuffleO,
              oneTime: _oneTime,
              active: _isActive,
              visibility: _resultVisibility,
              timerMinutes: _timerMinutes,
              onShuffleQuestion: (value) {
                setState(() {
                  _shuffleQ = value;
                });
              },
              onShuffleOption: (value) {
                setState(() {
                  _shuffleO = value;
                });
              },
              onOneTime: (value) {
                setState(() {
                  _oneTime = value;
                });
              },
              onActive: (value) {
                setState(() {
                  _isActive = value;
                });
              },
              onVisibility: (value) {
                setState(() {
                  _resultVisibility = value;
                });
              },
            ),
            QuestionsTab(
              questions: _questions,
              addQuestion: _addQuestion,
              removeQuestion: _removeQuestion,
              reorderQuestion: _reorderQuestion,
              onQuestionsChanged: (updated) {
                setState(() {
                  _questions
                    ..clear()
                    ..addAll(updated);
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}

