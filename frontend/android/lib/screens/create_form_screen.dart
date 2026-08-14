import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_theme.dart';
import '../providers/form_provider.dart';
import '../providers/auth_provider.dart';
import '../models/form_model.dart';
import '../models/question_model.dart';
import '../widgets/custom_input.dart';

class CreateFormScreen extends StatefulWidget {
  const CreateFormScreen({super.key});

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
    const Duration(days: 30),
  );

  TimeOfDay _openTime = TimeOfDay.now();
  TimeOfDay _closeTime = TimeOfDay.now();

  bool _shuffleQ = false;
  bool _shuffleO = false;
  bool _oneTime = true;
  bool _isActive = true;

  ResultVisibility _resultVisibility =
      ResultVisibility.hidden;

  final List<QuestionModel> _questions = [];

  @override
  void initState() {
    super.initState();

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

  String get _timerText {
    final duration = _timerDuration;

    if (duration <= Duration.zero) {
      return 'Set a valid opening and closing schedule';
    }

    final days = duration.inDays;
    final hours = duration.inHours.remainder(24);
    final minutes = duration.inMinutes.remainder(60);

    final parts = <String>[];

    if (days > 0) {
      parts.add(
        '$days ${days == 1 ? 'day' : 'days'}',
      );
    }

    if (hours > 0) {
      parts.add(
        '$hours ${hours == 1 ? 'hour' : 'hours'}',
      );
    }

    if (minutes > 0) {
      parts.add(
        '$minutes ${minutes == 1 ? 'minute' : 'minutes'}',
      );
    }

    if (parts.isEmpty) {
      return 'Less than 1 minute available';
    }

    return '${parts.join(' ')} available for responses';
  }

  void _addQuestion(QuestionType type) {
    final timestamp =
        DateTime.now().microsecondsSinceEpoch;

    final question = QuestionModel(
      id: 'q$timestamp',
      type: type,
      text: '',
      isRequired: true,
      ratingMax:
          type == QuestionType.rating ? 5 : null,
      hasScore: false,
      score: 0,
      options:
          type == QuestionType.multipleChoice
              ? [
                  OptionModel(
                    id: 'o${timestamp}1',
                    text: 'Option 1',
                  ),
                  OptionModel(
                    id: 'o${timestamp}2',
                    text: 'Option 2',
                  ),
                ]
              : [],
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

    final form = FormModel(
      id: 'form${now.millisecondsSinceEpoch}',
      title: title,
      creatorId: currentUser.id,
      shortLink: slug,
      customLinkAlias: customAlias,
      scheduledOpen: _openDateTime,
      scheduledClose: _closeDateTime,
      timerMinutes: _timerMinutes,
      shuffleQuestions: _shuffleQ,
      shuffleOptions: _shuffleO,
      oneTimeOnly: _oneTime,
      isActive: _isActive,
      resultVisibility: _resultVisibility,
      questions: List<QuestionModel>.from(
        _questions,
      ),
      createdAt: now,
    );

    final created = await formProvider.createForm(form);

    if (!mounted) {
      return;
    }

    if (!created) {
      final errorMessage = formProvider.error ??
          'Gagal membuat form. Periksa jaringan Anda.';

      formProvider.clearError();

      _showMessage(
        errorMessage,
        backgroundColor: AppTheme.error,
      );

      return;
    }

    Navigator.pop(context);

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text(
          'Form created successfully!',
        ),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Create Form'),
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
            _InfoTab(
              titleCtrl: _titleCtrl,
              linkCtrl: _linkCtrl,
              openDate: _openDate,
              closeDate: _closeDate,
              openTime: _openTime,
              closeTime: _closeTime,
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
            _SettingsTab(
              shuffleQ: _shuffleQ,
              shuffleO: _shuffleO,
              oneTime: _oneTime,
              isActive: _isActive,
              resultVisibility: _resultVisibility,
              onShuffleQ: (value) {
                setState(() {
                  _shuffleQ = value;
                });
              },
              onShuffleO: (value) {
                setState(() {
                  _shuffleO = value;
                });
              },
              onOneTime: (value) {
                setState(() {
                  _oneTime = value;
                });
              },
              onIsActive: (value) {
                setState(() {
                  _isActive = value;
                });
              },
              onResultVisibility: (value) {
                setState(() {
                  _resultVisibility = value;
                });
              },
              timerMinutes: _timerMinutes,
              timerText: _timerText,
            ),
            _QuestionsTab(
              questions: _questions,
              onAdd: _addQuestion,
              onRemove: _removeQuestion,
              onReorder: _reorderQuestion,
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoTab extends StatelessWidget {
  final TextEditingController titleCtrl;
  final TextEditingController linkCtrl;

  final DateTime openDate;
  final DateTime closeDate;

  final TimeOfDay openTime;
  final TimeOfDay closeTime;

  final ValueChanged<DateTime> onOpenDate;
  final ValueChanged<DateTime> onCloseDate;

  final ValueChanged<TimeOfDay> onOpenTime;
  final ValueChanged<TimeOfDay> onCloseTime;

  const _InfoTab({
    required this.titleCtrl,
    required this.linkCtrl,
    required this.openDate,
    required this.closeDate,
    required this.openTime,
    required this.closeTime,
    required this.onOpenDate,
    required this.onCloseDate,
    required this.onOpenTime,
    required this.onCloseTime,
  });

  Future<void> _selectDate(
    BuildContext context,
    DateTime initial,
    ValueChanged<DateTime> onSelected,
  ) async {
    final result = await showDatePicker(
      context: context,
      initialDate: initial,
      firstDate: DateTime(2024),
      lastDate: DateTime(2035),
    );

    if (result != null) {
      onSelected(result);
    }
  }

  Future<void> _selectTime(
    BuildContext context,
    TimeOfDay initial,
    ValueChanged<TimeOfDay> onSelected,
  ) async {
    final result = await showTimePicker(
      context: context,
      initialTime: initial,
    );

    if (result != null) {
      onSelected(result);
    }
  }

  String _formatTime(TimeOfDay time) {
    final hour = time.hourOfPeriod == 0
        ? 12
        : time.hourOfPeriod;

    final minute = time.minute
        .toString()
        .padLeft(2, '0');

    final period =
        time.period == DayPeriod.am
            ? 'AM'
            : 'PM';

    return '$hour:$minute $period';
  }

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          const _SectionHeader(
            'Basic Information',
            Icons.info_outline_rounded,
          ),
          const SizedBox(height: 18),
          CustomInput(
            controller: titleCtrl,
            label: 'Form Title',
            hint: 'e.g. Student Satisfaction Survey',
            prefixIcon: Icons.title_rounded,
            validator: (value) {
              if (value == null ||
                  value.trim().isEmpty) {
                return 'Title is required';
              }

              return null;
            },
          ),
          const SizedBox(height: 16),
          CustomInput(
            controller: linkCtrl,
            label: 'Custom Link',
            hint: 'e.g. student-survey-2026',
            prefixIcon: Icons.link_rounded,
          ),
          const SizedBox(height: 28),
          const _SectionHeader(
            'Schedule',
            Icons.schedule_rounded,
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _DateField(
                  label: 'Open Date',
                  date: openDate,
                  icon: Icons.calendar_today_rounded,
                  onTap: () => _selectDate(
                    context,
                    openDate,
                    onOpenDate,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _DateField(
                  label: 'Close Date',
                  date: closeDate,
                  icon: Icons.calendar_today_rounded,
                  onTap: () => _selectDate(
                    context,
                    closeDate,
                    onCloseDate,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: _TimeField(
                  label: 'Open Time',
                  time: _formatTime(openTime),
                  onTap: () => _selectTime(
                    context,
                    openTime,
                    onOpenTime,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _TimeField(
                  label: 'Close Time',
                  time: _formatTime(closeTime),
                  onTap: () => _selectTime(
                    context,
                    closeTime,
                    onCloseTime,
                  ),
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _SettingsTab extends StatelessWidget {
  final bool shuffleQ;
  final bool shuffleO;
  final bool oneTime;
  final bool isActive;

  final int timerMinutes;
  final String timerText;

  final ResultVisibility resultVisibility;

  final ValueChanged<bool> onShuffleQ;
  final ValueChanged<bool> onShuffleO;
  final ValueChanged<bool> onOneTime;
  final ValueChanged<bool> onIsActive;

  final ValueChanged<ResultVisibility>
      onResultVisibility;

  const _SettingsTab({
    required this.shuffleQ,
    required this.shuffleO,
    required this.oneTime,
    required this.isActive,
    required this.timerMinutes,
    required this.timerText,
    required this.resultVisibility,
    required this.onShuffleQ,
    required this.onShuffleO,
    required this.onOneTime,
    required this.onIsActive,
    required this.onResultVisibility,
  });

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          const _SectionHeader(
            'Form Options',
            Icons.tune_rounded,
          ),
          const SizedBox(height: 14),
          _ToggleTile(
            icon: Icons.shuffle_rounded,
            iconColor: AppTheme.info,
            title: 'Shuffle question order',
            subtitle: 'Each respondent gets a different order',
            value: shuffleQ,
            onChanged: onShuffleQ,
          ),
          _ToggleTile(
            icon: Icons.swap_vert_rounded,
            iconColor: AppTheme.info,
            title: 'Shuffle answer options',
            subtitle: 'Options are randomized on each display',
            value: shuffleO,
            onChanged: onShuffleO,
          ),
          _ToggleTile(
            icon: Icons.lock_outline_rounded,
            iconColor: AppTheme.error,
            title: 'One-time submission only',
            subtitle:
                'Respondents cannot re-submit',
            value: oneTime,
            onChanged: onOneTime,
          ),
          _ToggleTile(
            icon:
                Icons.play_circle_outline_rounded,
            iconColor: AppTheme.success,
            title: 'Activate immediately',
            subtitle:
                'Form can be filled after opening time',
            value: isActive,
            onChanged: onIsActive,
          ),
          const SizedBox(height: 24),
          const _SectionHeader(
            'Response Timer',
            Icons.timer_outlined,
          ),
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Theme.of(context).cardColor,
              borderRadius:
                  BorderRadius.circular(16),
              border: Border.all(
                color:
                    Theme.of(context).dividerColor,
              ),
            ),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color:
                        AppTheme.info.withValues(
                      alpha: 0.1,
                    ),
                    borderRadius:
                        BorderRadius.circular(12),
                  ),
                  child: const Icon(
                    Icons.hourglass_bottom_rounded,
                    color: AppTheme.info,
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Column(
                    crossAxisAlignment:
                        CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Automatically calculated',
                        style: TextStyle(
                          fontWeight: FontWeight.w700,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        timerText,
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.textMuted,
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          const _SectionHeader(
            'Result & Score',
            Icons.analytics_outlined,
          ),
          const SizedBox(height: 14),
          _ResultOption(
            value: ResultVisibility.hidden,
            groupValue: resultVisibility,
            title: 'Do not show results',
            subtitle:
                'Respondents cannot see their result or score',
            icon: Icons.visibility_off_outlined,
            onChanged: onResultVisibility,
          ),
          _ResultOption(
            value: ResultVisibility.resultOnly,
            groupValue: resultVisibility,
            title: 'Show result only',
            subtitle:
                'Respondents can see the result but not the score',
            icon: Icons.visibility_outlined,
            onChanged: onResultVisibility,
          ),
          _ResultOption(
            value:
                ResultVisibility.resultAndScore,
            groupValue: resultVisibility,
            title: 'Show result and score',
            subtitle:
                'Respondents can see both result and their score',
            icon: Icons.score_outlined,
            onChanged: onResultVisibility,
          ),
        ],
      ),
    );
  }
}

class _QuestionsTab extends StatelessWidget {
  final List<QuestionModel> questions;

  final ValueChanged<QuestionType> onAdd;

  final ValueChanged<int> onRemove;

  final void Function(int, int) onReorder;

  const _QuestionsTab({
    required this.questions,
    required this.onAdd,
    required this.onRemove,
    required this.onReorder,
  });

  static const List<_TypeDef> _typeList = [
    _TypeDef(
      QuestionType.multipleChoice,
      Icons.radio_button_checked_rounded,
      'Multiple Choice',
      AppTheme.warning,
    ),
    _TypeDef(
      QuestionType.shortText,
      Icons.short_text_rounded,
      'Short Text',
      AppTheme.success,
    ),
    _TypeDef(
      QuestionType.longText,
      Icons.notes_rounded,
      'Long Text',
      AppTheme.info,
    ),
    _TypeDef(
      QuestionType.rating,
      Icons.star_outline_rounded,
      'Rating',
      AppTheme.warning,
    ),
    _TypeDef(
      QuestionType.yesNo,
      Icons.toggle_on_rounded,
      'Yes / No',
      AppTheme.success,
    ),
    _TypeDef(
      QuestionType.mathFormula,
      Icons.functions_rounded,
      'Math',
      AppTheme.info,
    ),
    _TypeDef(
      QuestionType.codeInput,
      Icons.code_rounded,
      'Code',
      AppTheme.warning,
    ),
    _TypeDef(
      QuestionType.imageChoice,
      Icons.image_outlined,
      'Image',
      AppTheme.success,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          padding: const EdgeInsets.fromLTRB(
            16,
            14,
            16,
            14,
          ),
          decoration: BoxDecoration(
            color: Theme.of(context)
                .scaffoldBackgroundColor,
            border: Border(
              bottom: BorderSide(
                color:
                    Theme.of(context).dividerColor,
              ),
            ),
          ),
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              const Text(
                'Add Question',
                style: TextStyle(
                  fontSize: 13,
                  fontWeight: FontWeight.w700,
                ),
              ),
              const SizedBox(height: 10),
              SingleChildScrollView(
                scrollDirection: Axis.horizontal,
                child: Row(
                  children: _typeList.map(
                    (type) {
                      return Padding(
                        padding:
                            const EdgeInsets.only(
                          right: 8,
                        ),
                        child: InkWell(
                          borderRadius:
                              BorderRadius.circular(
                            10,
                          ),
                          onTap: () =>
                              onAdd(type.type),
                          child: Container(
                            padding:
                                const EdgeInsets
                                    .symmetric(
                              horizontal: 12,
                              vertical: 9,
                            ),
                            decoration:
                                BoxDecoration(
                              color:
                                  type.color.withValues(
                                alpha: 0.08,
                              ),
                              borderRadius:
                                  BorderRadius.circular(
                                10,
                              ),
                              border: Border.all(
                                color:
                                    type.color.withValues(
                                  alpha: 0.25,
                                ),
                              ),
                            ),
                            child: Row(
                              mainAxisSize:
                                  MainAxisSize.min,
                              children: [
                                Icon(
                                  type.icon,
                                  size: 15,
                                  color: type.color,
                                ),
                                const SizedBox(
                                  width: 6,
                                ),
                                Text(
                                  type.label,
                                  style:
                                      TextStyle(
                                    fontSize: 12,
                                    fontWeight:
                                        FontWeight
                                            .w600,
                                    color:
                                        type.color,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    },
                  ).toList(),
                ),
              ),
            ],
          ),
        ),
        Expanded(
          child: questions.isEmpty
              ? const _EmptyQuestions()
              : ReorderableListView.builder(
                  padding:
                      const EdgeInsets.all(16),
                  buildDefaultDragHandles: false,
                  itemCount: questions.length,
                  onReorderItem: onReorder,
                  itemBuilder:
                      (context, index) {
                    return _QuestionEditor(
                      key: ValueKey(
                        questions[index].id,
                      ),
                      question:
                          questions[index],
                      index: index,
                      onRemove: () =>
                          onRemove(index),
                    );
                  },
                ),
        ),
      ],
    );
  }
}

class _QuestionEditor extends StatefulWidget {
  final QuestionModel question;
  final int index;
  final VoidCallback onRemove;

  const _QuestionEditor({
    required this.question,
    required this.index,
    required this.onRemove,
    super.key,
  });

  @override
  State<_QuestionEditor> createState() =>
      _QuestionEditorState();
}

class _QuestionEditorState
    extends State<_QuestionEditor> {
  late final TextEditingController
      _questionCtrl;

  late final TextEditingController
      _ratingCtrl;

  late final TextEditingController
      _scoreCtrl;

  @override
  void initState() {
    super.initState();

    _questionCtrl =
        TextEditingController(
      text: widget.question.text,
    );

    _ratingCtrl =
        TextEditingController(
      text:
          (widget.question.ratingMax ?? 5)
              .toString(),
    );

    _scoreCtrl =
        TextEditingController(
      text:
          widget.question.score.toString(),
    );
  }

  @override
  void dispose() {
    _questionCtrl.dispose();
    _ratingCtrl.dispose();
    _scoreCtrl.dispose();
    super.dispose();
  }

  String _typeName() {
    switch (widget.question.type) {
      case QuestionType.multipleChoice:
        return 'Multiple Choice';
      case QuestionType.shortText:
        return 'Short Text';
      case QuestionType.longText:
        return 'Long Text';
      case QuestionType.rating:
        return 'Rating';
      case QuestionType.yesNo:
        return 'Yes / No';
      case QuestionType.mathFormula:
        return 'Math Formula';
      case QuestionType.codeInput:
        return 'Code';
      case QuestionType.imageChoice:
        return 'Image Choice';
    }
  }

  IconData _typeIcon() {
    switch (widget.question.type) {
      case QuestionType.multipleChoice:
        return Icons.radio_button_checked_rounded;
      case QuestionType.shortText:
        return Icons.short_text_rounded;
      case QuestionType.longText:
        return Icons.notes_rounded;
      case QuestionType.rating:
        return Icons.star_outline_rounded;
      case QuestionType.yesNo:
        return Icons.toggle_on_rounded;
      case QuestionType.mathFormula:
        return Icons.functions_rounded;
      case QuestionType.codeInput:
        return Icons.code_rounded;
      case QuestionType.imageChoice:
        return Icons.image_outlined;
    }
  }

  @override
  Widget build(BuildContext context) {
    final question = widget.question;

    return Container(
      margin: const EdgeInsets.only(
        bottom: 14,
      ),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius:
            BorderRadius.circular(18),
        border: Border.all(
          color: Theme.of(context).dividerColor,
        ),
      ),
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment:
              CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 38,
                  height: 38,
                  alignment: Alignment.center,
                  decoration: BoxDecoration(
                    color:
                        AppTheme.info.withValues(
                      alpha: 0.1,
                    ),
                    borderRadius:
                        BorderRadius.circular(11),
                  ),
                  child: Text(
                    '${widget.index + 1}',
                    style: const TextStyle(
                      color: AppTheme.primary,
                      fontWeight:
                          FontWeight.w800,
                      fontSize: 15,
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                Icon(
                  _typeIcon(),
                  size: 18,
                  color: AppTheme.primary,
                ),
                const SizedBox(width: 7),
                Expanded(
                  child: Text(
                    _typeName(),
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight:
                          FontWeight.w700,
                      color: AppTheme.primary,
                    ),
                  ),
                ),
                ReorderableDragStartListener(
                  index: widget.index,
                  child: const Icon(
                    Icons.drag_handle_rounded,
                    color: AppTheme.textMuted,
                  ),
                ),
                IconButton(
                  tooltip: 'Delete question',
                  onPressed: widget.onRemove,
                  icon: const Icon(
                    Icons.delete_outline_rounded,
                    color: AppTheme.error,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 18),
            TextFormField(
              controller: _questionCtrl,
              maxLines:
                  question.type ==
                          QuestionType.longText
                      ? 4
                      : 3,
              onChanged: (value) {
                question.text = value;
              },
              decoration: InputDecoration(
                labelText: 'Question *',
                hintText:
                    'Write your question here...',
                alignLabelWithHint: true,
                prefixIcon: const Icon(
                  Icons.help_outline_rounded,
                ),
                filled: true,
                fillColor: Theme.of(context)
                    .scaffoldBackgroundColor,
                border: OutlineInputBorder(
                  borderRadius:
                      BorderRadius.circular(14),
                ),
                enabledBorder:
                    OutlineInputBorder(
                  borderRadius:
                      BorderRadius.circular(14),
                  borderSide: BorderSide(
                    color: Theme.of(context)
                        .dividerColor,
                  ),
                ),
              ),
            ),
            if (question.type ==
                QuestionType.multipleChoice)
              _MultipleChoiceEditor(
                question: question,
              ),
            if (question.type ==
                QuestionType.rating)
              _RatingEditor(
                question: question,
                controller: _ratingCtrl,
              ),
            if (question.type ==
                QuestionType.mathFormula)
              _SimpleInput(
                label: 'Formula',
                hint: 'Example: E = mc²',
                initialValue:
                    question.mathFormula,
                onChanged: (value) {
                  question.mathFormula = value;
                },
              ),
            if (question.type ==
                QuestionType.codeInput)
              _SimpleInput(
                label: 'Code',
                hint: 'Write your code here...',
                initialValue:
                    question.codeSnippet,
                maxLines: 5,
                onChanged: (value) {
                  question.codeSnippet = value;
                },
              ),
            const SizedBox(height: 16),
            _ScoreSetting(
              question: question,
            ),
            const SizedBox(height: 12),
            _InlineSwitch(
              title: 'Required question',
              subtitle:
                  'Respondents must answer this question',
              value: question.isRequired,
              onChanged: (value) {
                setState(() {
                  question.isRequired = value;
                });
              },
            ),
          ],
        ),
      ),
    );
  }
}

class _MultipleChoiceEditor
    extends StatefulWidget {
  final QuestionModel question;

  const _MultipleChoiceEditor({
    required this.question,
  });

  @override
  State<_MultipleChoiceEditor> createState() =>
      _MultipleChoiceEditorState();
}

class _MultipleChoiceEditorState
    extends State<_MultipleChoiceEditor> {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment:
          CrossAxisAlignment.start,
      children: [
        const SizedBox(height: 20),
        Row(
          children: [
            const Text(
              'Answer Options',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w700,
                color: AppTheme.textSecondary,
              ),
            ),
            const Spacer(),
            Text(
              '${widget.question.options.length} options',
              style: const TextStyle(
                fontSize: 11,
                color: AppTheme.textMuted,
              ),
            ),
          ],
        ),
        const SizedBox(height: 12),
        ...List.generate(
          widget.question.options.length,
          (index) {
            final option =
                widget.question.options[index];

            return Padding(
              padding:
                  const EdgeInsets.only(
                bottom: 10,
              ),
              child: Row(
                children: [
                  const Icon(
                    Icons.radio_button_unchecked,
                    color: AppTheme.primary,
                  ),
                  const SizedBox(width: 10),
                  Expanded(
                    child: TextFormField(
                      initialValue: option.text,
                      onChanged: (value) {
                        option.text = value;
                      },
                      decoration:
                          InputDecoration(
                        hintText:
                            'Option ${index + 1}',
                        filled: true,
                        fillColor: Theme.of(context)
                            .scaffoldBackgroundColor,
                        border:
                            OutlineInputBorder(
                          borderRadius:
                              BorderRadius.circular(
                            12,
                          ),
                        ),
                        contentPadding:
                            const EdgeInsets
                                .symmetric(
                          horizontal: 14,
                          vertical: 12,
                        ),
                      ),
                    ),
                  ),
                  IconButton(
                    tooltip: 'Remove option',
                    onPressed:
                        widget.question.options
                                    .length >
                                2
                            ? () {
                                setState(() {
                                  widget.question
                                      .options
                                      .removeAt(
                                    index,
                                  );
                                });
                              }
                            : null,
                    icon: const Icon(
                      Icons.close_rounded,
                    ),
                  ),
                ],
              ),
            );
          },
        ),
        TextButton.icon(
          onPressed: () {
            setState(() {
              widget.question.options.add(
                OptionModel(
                  id:
                      'o${DateTime.now().microsecondsSinceEpoch}',
                  text:
                      'Option ${widget.question.options.length + 1}',
                ),
              );
            });
          },
          icon: const Icon(
            Icons.add_rounded,
          ),
          label: const Text(
            'Add option',
          ),
        ),
      ],
    );
  }
}

class _RatingEditor extends StatefulWidget {
  final QuestionModel question;
  final TextEditingController controller;

  const _RatingEditor({
    required this.question,
    required this.controller,
  });

  @override
  State<_RatingEditor> createState() =>
      _RatingEditorState();
}

class _RatingEditorState
    extends State<_RatingEditor> {
  @override
  Widget build(BuildContext context) {
    final max =
        widget.question.ratingMax ?? 5;

    final previewCount =
        max > 20 ? 20 : max;

    return Container(
      margin:
          const EdgeInsets.only(top: 18),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Theme.of(context)
            .scaffoldBackgroundColor,
        borderRadius:
            BorderRadius.circular(14),
        border: Border.all(
          color: Theme.of(context).dividerColor,
        ),
      ),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              const Icon(
                Icons.star_outline_rounded,
                color: AppTheme.warning,
              ),
              const SizedBox(width: 8),
              const Expanded(
                child: Text(
                  'Rating Scale',
                  style: TextStyle(
                    fontWeight: FontWeight.w700,
                  ),
                ),
              ),
              SizedBox(
                width: 110,
                child: TextFormField(
                  controller:
                      widget.controller,
                  keyboardType:
                      TextInputType.number,
                  textAlign: TextAlign.center,
                  decoration:
                      InputDecoration(
                    labelText: 'Maximum',
                    isDense: true,
                    border:
                        OutlineInputBorder(
                      borderRadius:
                          BorderRadius.circular(
                        10,
                      ),
                    ),
                  ),
                  onChanged: (value) {
                    final number =
                        int.tryParse(value);

                    if (number != null &&
                        number > 0) {
                      setState(() {
                        widget.question
                            .ratingMax = number;
                      });
                    }
                  },
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          Text(
            'Respondents can rate from 1 to $max',
            style: const TextStyle(
              fontSize: 12,
              color: AppTheme.textMuted,
            ),
          ),
          const SizedBox(height: 10),
          Wrap(
            spacing: 4,
            runSpacing: 4,
            children:
                List.generate(
              previewCount,
              (index) {
                return const Icon(
                  Icons.star_rounded,
                  size: 22,
                  color: AppTheme.warning,
                );
              },
            ),
          ),
          if (max > 20)
            Padding(
              padding:
                  const EdgeInsets.only(
                top: 8,
              ),
              child: Text(
                '+ ${max - 20} more rating levels',
                style: const TextStyle(
                  fontSize: 11,
                  color: AppTheme.textMuted,
                ),
              ),
            ),
        ],
      ),
    );
  }
}

class _ScoreSetting
    extends StatefulWidget {
  final QuestionModel question;

  const _ScoreSetting({
    required this.question,
  });

  @override
  State<_ScoreSetting> createState() =>
      _ScoreSettingState();
}

class _ScoreSettingState
    extends State<_ScoreSetting> {
  late final TextEditingController
      _maxScoreController;

  bool _showScore = false;

  @override
  void initState() {
    super.initState();

    _maxScoreController =
        TextEditingController(
      text:
          widget.question.score.toString(),
    );

    _showScore = widget.question.hasScore;
  }

  @override
  void dispose() {
    _maxScoreController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final question = widget.question;

    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Theme.of(context)
            .scaffoldBackgroundColor,
        borderRadius:
            BorderRadius.circular(14),
        border: Border.all(
          color: Theme.of(context).dividerColor,
        ),
      ),
      child: Column(
        children: [
          Row(
            children: [
              Container(
                width: 38,
                height: 38,
                decoration: BoxDecoration(
                  color:
                      AppTheme.primary.withValues(
                    alpha: 0.1,
                  ),
                  borderRadius:
                      BorderRadius.circular(10),
                ),
                child: const Icon(
                  Icons.grade_outlined,
                  size: 20,
                  color: AppTheme.primary,
                ),
              ),
              const SizedBox(width: 10),
              const Expanded(
                child: Column(
                  crossAxisAlignment:
                      CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Question scoring',
                      style: TextStyle(
                        fontWeight:
                            FontWeight.w700,
                      ),
                    ),
                    SizedBox(height: 3),
                    Text(
                      'Set points and control score visibility',
                      style: TextStyle(
                        fontSize: 11,
                        color:
                            AppTheme.textMuted,
                      ),
                    ),
                  ],
                ),
              ),
              _CustomSwitch(
                value: question.hasScore,
                onChanged: (value) {
                  setState(() {
                    question.hasScore = value;

                    if (!value) {
                      _showScore = false;
                    }
                  });
                },
              ),
            ],
          ),
          if (question.hasScore) ...[
            const SizedBox(height: 16),
            Container(
              padding:
                  const EdgeInsets.all(12),
              decoration: BoxDecoration(
                color:
                    AppTheme.primary.withValues(
                  alpha: 0.05,
                ),
                borderRadius:
                    BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  const Expanded(
                    child: Column(
                      crossAxisAlignment:
                          CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Show score on this question',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight:
                                FontWeight.w600,
                          ),
                        ),
                        SizedBox(height: 3),
                        Text(
                          'Display the score beside this question',
                          style: TextStyle(
                            fontSize: 10,
                            color:
                                AppTheme.textMuted,
                          ),
                        ),
                      ],
                    ),
                  ),
                  _CustomSwitch(
                    value: _showScore,
                    onChanged: (value) {
                      setState(() {
                        _showScore = value;
                      });
                    },
                  ),
                ],
              ),
            ),
            const SizedBox(height: 14),
            if (question.type ==
                QuestionType.multipleChoice)
              _MultipleChoiceScores(
                question: question,
              )
            else
              _GeneralScoreInput(
                question: question,
                controller:
                    _maxScoreController,
              ),
          ],
        ],
      ),
    );
  }
}

class _MultipleChoiceScores
    extends StatefulWidget {
  final QuestionModel question;

  const _MultipleChoiceScores({
    required this.question,
  });

  @override
  State<_MultipleChoiceScores> createState() =>
      _MultipleChoiceScoresState();
}

class _MultipleChoiceScoresState
    extends State<_MultipleChoiceScores> {
  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment:
          CrossAxisAlignment.start,
      children: [
        const Text(
          'Score for each answer',
          style: TextStyle(
            fontSize: 12,
            fontWeight: FontWeight.w700,
          ),
        ),
        const SizedBox(height: 8),
        ...List.generate(
          widget.question.options.length,
          (index) {
            final option =
                widget.question.options[index];

            return Padding(
              padding:
                  const EdgeInsets.only(
                bottom: 8,
              ),
              child: Row(
                children: [
                  Expanded(
                    child: Text(
                      option.text.isEmpty
                          ? 'Option ${index + 1}'
                          : option.text,
                      maxLines: 1,
                      overflow:
                          TextOverflow.ellipsis,
                      style:
                          const TextStyle(
                        fontSize: 12,
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  SizedBox(
                    width: 90,
                    child: TextFormField(
                      initialValue:
                          option.score
                              .toString(),
                      keyboardType:
                          const TextInputType
                              .numberWithOptions(
                        decimal: true,
                      ),
                      decoration:
                          InputDecoration(
                        labelText: 'Points',
                        isDense: true,
                        border:
                            OutlineInputBorder(
                          borderRadius:
                              BorderRadius
                                  .circular(
                            10,
                          ),
                        ),
                      ),
                      onChanged: (value) {
                        option.score =
                            double.tryParse(
                                  value,
                                ) ??
                                0;
                      },
                    ),
                  ),
                ],
              ),
            );
          },
        ),
      ],
    );
  }
}

class _GeneralScoreInput
    extends StatelessWidget {
  final QuestionModel question;
  final TextEditingController controller;

  const _GeneralScoreInput({
    required this.question,
    required this.controller,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        const Expanded(
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              Text(
                'Maximum score',
                style: TextStyle(
                  fontSize: 12,
                  fontWeight:
                      FontWeight.w700,
                ),
              ),
              SizedBox(height: 3),
              Text(
                'Maximum points for this question',
                style: TextStyle(
                  fontSize: 10,
                  color: AppTheme.textMuted,
                ),
              ),
            ],
          ),
        ),
        SizedBox(
          width: 90,
          child: TextFormField(
            controller: controller,
            keyboardType:
                const TextInputType.numberWithOptions(
              decimal: true,
            ),
            textAlign: TextAlign.center,
            decoration: InputDecoration(
              labelText: 'Points',
              isDense: true,
              border: OutlineInputBorder(
                borderRadius:
                    BorderRadius.circular(10),
              ),
            ),
            onChanged: (value) {
              question.score =
                  double.tryParse(value) ?? 0;
            },
          ),
        ),
      ],
    );
  }
}

class _CustomSwitch extends StatelessWidget {
  final bool value;
  final ValueChanged<bool> onChanged;

  const _CustomSwitch({
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Semantics(
      button: true,
      toggled: value,
      child: GestureDetector(
        behavior: HitTestBehavior.opaque,
        onTap: () => onChanged(!value),
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 180),
          curve: Curves.easeInOut,
          width: 55,
          height: 32,
          padding: const EdgeInsets.all(5),
          decoration: BoxDecoration(
            color: value
                ? const Color(0xFF5A9FE3)
                : const Color(0xFF4A5568),
            borderRadius: BorderRadius.circular(30),
          ),
          child: AnimatedAlign(
            duration: const Duration(milliseconds: 180),
            curve: Curves.easeInOut,
            alignment: value
                ? Alignment.centerRight
                : Alignment.centerLeft,
            child: Container(
              width: 24,
              height: 24,
              decoration: BoxDecoration(
                color: value
                    ? const Color(0xFF174A80)
                    : Colors.white,
                shape: BoxShape.circle,
              ),
            ),
          ),
        ),
      ),
    );
  }
}

class _ToggleTile extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _ToggleTile({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final isDark =
        Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: isDark
            ? AppTheme.darkCard
            : AppTheme.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark
              ? AppTheme.darkBorder
              : AppTheme.border,
        ),
      ),
      child: ListTile(
        contentPadding: const EdgeInsets.symmetric(
          horizontal: 16,
          vertical: 4,
        ),
        leading: Container(
          width: 40,
          height: 40,
          decoration: BoxDecoration(
            color: iconColor.withValues(alpha: 0.10),
            borderRadius: BorderRadius.circular(12),
          ),
          child: Icon(
            icon,
            size: 20,
            color: iconColor,
          ),
        ),
        title: Text(
          title,
          style: TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w600,
            color: isDark
                ? AppTheme.darkTextPrimary
                : AppTheme.textPrimary,
          ),
        ),
        subtitle: Text(
          subtitle,
          style: const TextStyle(
            fontSize: 12,
            color: AppTheme.textMuted,
          ),
        ),
        trailing: _CustomSwitch(
          value: value,
          onChanged: onChanged,
        ),
      ),
    );
  }
}

class _InlineSwitch
    extends StatelessWidget {
  final String title;
  final String subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _InlineSwitch({
    required this.title,
    required this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Expanded(
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  fontWeight:
                      FontWeight.w700,
                  fontSize: 13,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 11,
                  color: AppTheme.textMuted,
                ),
              ),
            ],
          ),
        ),
        _CustomSwitch(
          value: value,
          onChanged: onChanged,
        ),
      ],
    );
  }
}

class _ResultOption
    extends StatelessWidget {
  final ResultVisibility value;
  final ResultVisibility groupValue;
  final String title;
  final String subtitle;
  final IconData icon;
  final ValueChanged<ResultVisibility>
      onChanged;

  const _ResultOption({
    required this.value,
    required this.groupValue,
    required this.title,
    required this.subtitle,
    required this.icon,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    final selected =
        value == groupValue;

    return Container(
      margin:
          const EdgeInsets.only(
        bottom: 10,
      ),
      decoration: BoxDecoration(
        color: Theme.of(context).cardColor,
        borderRadius:
            BorderRadius.circular(14),
        border: Border.all(
          color: selected
              ? AppTheme.primary
              : Theme.of(context)
                  .dividerColor,
          width: selected ? 1.5 : 1,
        ),
      ),
      child: Material(
        color: Colors.transparent,
        borderRadius:
            BorderRadius.circular(14),
        child: InkWell(
          borderRadius:
              BorderRadius.circular(14),
          onTap: () =>
              onChanged(value),
          child: ListTile(
            leading: Icon(
              icon,
              color: selected
                  ? AppTheme.primary
                  : AppTheme.textMuted,
            ),
            title: Text(
              title,
              style: const TextStyle(
                fontSize: 13,
                fontWeight:
                    FontWeight.w700,
              ),
            ),
            subtitle: Text(
              subtitle,
              style: const TextStyle(
                fontSize: 11,
                color: AppTheme.textMuted,
              ),
            ),
            trailing: Container(
              width: 22,
              height: 22,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(
                  color: selected
                      ? AppTheme.primary
                      : AppTheme.textMuted,
                  width: 2,
                ),
              ),
              padding:
                  const EdgeInsets.all(4),
              child: selected
                  ? Container(
                      decoration:
                          const BoxDecoration(
                        shape:
                            BoxShape.circle,
                        color:
                            AppTheme.primary,
                      ),
                    )
                  : null,
            ),
          ),
        ),
      ),
    );
  }
}

class _DateField
    extends StatelessWidget {
  final String label;
  final DateTime date;
  final IconData icon;
  final VoidCallback onTap;

  const _DateField({
    required this.label,
    required this.date,
    required this.icon,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight:
                  FontWeight.w600,
            ),
          ),
          const SizedBox(height: 7),
          Container(
            width: double.infinity,
            padding:
                const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 14,
            ),
            decoration: BoxDecoration(
              color: Theme.of(context)
                  .cardColor,
              borderRadius:
                  BorderRadius.circular(13),
              border: Border.all(
                color: Theme.of(context)
                    .dividerColor,
              ),
            ),
            child: Row(
              children: [
                Icon(
                  icon,
                  size: 16,
                  color: AppTheme.primary,
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    '${date.day}/${date.month}/${date.year}',
                    style:
                        const TextStyle(
                      fontSize: 13,
                      fontWeight:
                          FontWeight.w500,
                    ),
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

class _TimeField
    extends StatelessWidget {
  final String label;
  final String time;
  final VoidCallback onTap;

  const _TimeField({
    required this.label,
    required this.time,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Text(
            label,
            style: const TextStyle(
              fontSize: 12,
              fontWeight:
                  FontWeight.w600,
            ),
          ),
          const SizedBox(height: 7),
          Container(
            width: double.infinity,
            padding:
                const EdgeInsets.symmetric(
              horizontal: 12,
              vertical: 14,
            ),
            decoration: BoxDecoration(
              color: Theme.of(context)
                  .cardColor,
              borderRadius:
                  BorderRadius.circular(13),
              border: Border.all(
                color: Theme.of(context)
                    .dividerColor,
              ),
            ),
            child: Row(
              children: [
                const Icon(
                  Icons.access_time_rounded,
                  size: 17,
                  color: AppTheme.primary,
                ),
                const SizedBox(width: 8),
                Text(
                  time,
                  style:
                      const TextStyle(
                    fontSize: 13,
                    fontWeight:
                        FontWeight.w600,
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

class _SimpleInput
    extends StatelessWidget {
  final String label;
  final String hint;
  final String? initialValue;
  final int maxLines;
  final ValueChanged<String> onChanged;

  const _SimpleInput({
    required this.label,
    required this.hint,
    required this.initialValue,
    required this.onChanged,
    this.maxLines = 2,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding:
          const EdgeInsets.only(
        top: 16,
      ),
      child: TextFormField(
        initialValue: initialValue,
        maxLines: maxLines,
        onChanged: onChanged,
        decoration: InputDecoration(
          labelText: label,
          hintText: hint,
          filled: true,
          fillColor: Theme.of(context)
              .scaffoldBackgroundColor,
          border: OutlineInputBorder(
            borderRadius:
                BorderRadius.circular(12),
          ),
        ),
      ),
    );
  }
}

class _EmptyQuestions
    extends StatelessWidget {
  const _EmptyQuestions();

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding:
            const EdgeInsets.all(30),
        child: Column(
          mainAxisSize:
              MainAxisSize.min,
          children: [
            Icon(
              Icons.quiz_outlined,
              size: 52,
              color:
                  AppTheme.primary.withValues(
                alpha: 0.25,
              ),
            ),
            const SizedBox(height: 12),
            const Text(
              'No questions yet',
              style: TextStyle(
                fontSize: 15,
                fontWeight:
                    FontWeight.w700,
              ),
            ),
            const SizedBox(height: 5),
            const Text(
              'Choose a question type above to start building your form',
              textAlign: TextAlign.center,
              style: TextStyle(
                fontSize: 12,
                color: AppTheme.textMuted,
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _SectionHeader
    extends StatelessWidget {
  final String title;
  final IconData icon;

  const _SectionHeader(
    this.title,
    this.icon,
  );

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Container(
          width: 34,
          height: 34,
          decoration: BoxDecoration(
            color:
                AppTheme.info.withValues(
              alpha: 0.09,
            ),
            borderRadius:
                BorderRadius.circular(10),
          ),
          child: Icon(
            icon,
            size: 18,
            color: AppTheme.info,
          ),
        ),
        const SizedBox(width: 10),
        Text(
          title,
          style: Theme.of(context)
              .textTheme
              .titleMedium
              ?.copyWith(
            fontWeight:
                FontWeight.w700,
          ),
        ),
      ],
    );
  }
}

class _TypeDef {
  final QuestionType type;
  final IconData icon;
  final String label;
  final Color color;

  const _TypeDef(
    this.type,
    this.icon,
    this.label,
    this.color,
  );
}