import 'dart:async';
import 'dart:convert';

import 'package:dart_quill_delta/dart_quill_delta.dart';
import 'package:flutter/material.dart';
import 'package:flutter_math_fork/flutter_math.dart';
import 'package:flutter_quill/flutter_quill.dart';
import 'package:image_picker/image_picker.dart';

import '../app_theme.dart';
import '../models/question_model.dart';
import 'quill_embeds.dart';

class QuestionsTab extends StatefulWidget {
  final List<QuestionModel> questions;
  final void Function(QuestionType) addQuestion;
  final void Function(int) removeQuestion;
  final void Function(int, int) reorderQuestion;
  final void Function(List<QuestionModel>) onQuestionsChanged;

  const QuestionsTab({
    super.key,
    required this.questions,
    required this.addQuestion,
    required this.removeQuestion,
    required this.reorderQuestion,
    required this.onQuestionsChanged,
  });

  @override
  State<QuestionsTab> createState() => _QuestionsTabState();
}

class _QuestionsTabState extends State<QuestionsTab> {
  void _updateQuestion(QuestionModel updated) {
    final list = List<QuestionModel>.from(widget.questions);
    final idx = list.indexWhere((q) => q.id == updated.id);
    if (idx < 0) return;
    list[idx] = updated;
    widget.onQuestionsChanged(list);
  }

  void _showAddMenu() {
    showModalBottomSheet(
      context: context,
      showDragHandle: true,
      builder: (sheetContext) {
        return SafeArea(
          child: SingleChildScrollView(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(20, 8, 20, 24),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  const Align(
                    alignment: Alignment.centerLeft,
                    child: Text(
                      'Add Question',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                      ),
                    ),
                  ),
                  const SizedBox(height: 16),
                  _questionTypeTile(
                    icon: Icons.radio_button_checked,
                    title: 'Multiple Choice',
                    subtitle: 'Choose one answer',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      widget.addQuestion(QuestionType.multipleChoice);
                    },
                  ),
                  _questionTypeTile(
                    icon: Icons.image_outlined,
                    title: 'Image Choice',
                    subtitle: 'Answer choices using images',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      widget.addQuestion(QuestionType.imageChoice);
                    },
                  ),
                  _questionTypeTile(
                    icon: Icons.subject_rounded,
                    title: 'Essay',
                    subtitle: 'Long-form answer',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      widget.addQuestion(QuestionType.longText);
                    },
                  ),
                  _questionTypeTile(
                    icon: Icons.short_text_rounded,
                    title: 'Short Answer',
                    subtitle: 'Brief written answer',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      widget.addQuestion(QuestionType.shortText);
                    },
                  ),
                  _questionTypeTile(
                    icon: Icons.check_circle_outline,
                    title: 'Yes / No',
                    subtitle: 'Yes or no question',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      widget.addQuestion(QuestionType.yesNo);
                    },
                  ),
                  _questionTypeTile(
                    icon: Icons.star_outline_rounded,
                    title: 'Rating',
                    subtitle: 'Rating using stars',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      widget.addQuestion(QuestionType.rating);
                    },
                  ),
                  _questionTypeTile(
                    icon: Icons.code_rounded,
                    title: 'Code Input',
                    subtitle: 'Answer using program code',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      widget.addQuestion(QuestionType.codeInput);
                    },
                  ),
                  _questionTypeTile(
                    icon: Icons.functions_rounded,
                    title: 'Math Formula',
                    subtitle: 'Question with a LaTeX formula',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      widget.addQuestion(QuestionType.mathFormula);
                    },
                  ),
                ],
              ),
            ),
          ),
        );
      },
    );
  }

  Widget _questionTypeTile({
    required IconData icon,
    required String title,
    required String subtitle,
    required VoidCallback onTap,
  }) {
    return ListTile(
      contentPadding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
      leading: Container(
        width: 42,
        height: 42,
        decoration: BoxDecoration(
          color: AppTheme.primary.withValues(alpha: 0.08),
          borderRadius: BorderRadius.circular(10),
        ),
        child: Icon(icon, color: AppTheme.primary),
      ),
      title: Text(
        title,
        style: const TextStyle(fontWeight: FontWeight.w700),
      ),
      subtitle: Text(subtitle),
      trailing: const Icon(Icons.chevron_right_rounded),
      onTap: onTap,
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (widget.questions.isEmpty) {
      return Center(
        child: Padding(
          padding: const EdgeInsets.all(32),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Container(
                width: 84,
                height: 84,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.08),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.help_outline_rounded,
                  size: 40,
                  color: AppTheme.primary,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                'No questions yet',
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: isDark ? AppTheme.darkTextPrimary : AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 8),
              Text(
                'Add your first question to start building this form.',
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 14,
                  color: isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 24),
              SizedBox(
                width: 220,
                height: 48,
                child: ElevatedButton.icon(
                  onPressed: _showAddMenu,
                  icon: const Icon(Icons.add_rounded),
                  label: const Text('Add Question'),
                ),
              ),
            ],
          ),
        ),
      );
    }

    return Column(
      children: [
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 16),
            itemCount: widget.questions.length,
            itemBuilder: (context, index) {
              final question = widget.questions[index];
              return Padding(
                padding: const EdgeInsets.only(bottom: 16),
                child: _QuestionCard(
                  key: ValueKey(question.id),
                  question: question,
                  index: index,
                  total: widget.questions.length,
                  onChanged: _updateQuestion,
                  onDelete: () => widget.removeQuestion(index),
                  onMoveUp: index > 0
                      ? () => widget.reorderQuestion(index, index - 1)
                      : null,
                  onMoveDown: index < widget.questions.length - 1
                      ? () => widget.reorderQuestion(index, index + 2)
                      : null,
                ),
              );
            },
          ),
        ),
        Container(
          padding: const EdgeInsets.fromLTRB(16, 8, 16, 16),
          child: SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              onPressed: _showAddMenu,
              icon: const Icon(Icons.add_rounded),
              label: const Text('Add Question'),
            ),
          ),
        ),
      ],
    );
  }
}

class _QuestionCard extends StatefulWidget {
  final QuestionModel question;
  final int index;
  final int total;
  final void Function(QuestionModel) onChanged;
  final VoidCallback onDelete;
  final VoidCallback? onMoveUp;
  final VoidCallback? onMoveDown;

  const _QuestionCard({
    super.key,
    required this.question,
    required this.index,
    required this.total,
    required this.onChanged,
    required this.onDelete,
    this.onMoveUp,
    this.onMoveDown,
  });

  @override
  State<_QuestionCard> createState() => _QuestionCardState();
}

class _QuestionCardState extends State<_QuestionCard> {
  late final QuillController _controller;
  final FocusNode _focusNode = FocusNode();
  final ScrollController _scrollController = ScrollController();
  final ImagePicker _imagePicker = ImagePicker();

  Timer? _syncTimer;
  bool _isUpdatingDocument = false;
  String? _lastSyncedContent;

  @override
  void initState() {
    super.initState();
    _controller = QuillController.basic();
    _controller.addListener(_onDocumentChanged);
    _loadFromQuestion();
  }

  @override
  void didUpdateWidget(covariant _QuestionCard oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.question.content != _lastSyncedContent) {
      _loadFromQuestion();
    }
  }

  @override
  void dispose() {
    _syncTimer?.cancel();
    _controller.removeListener(_onDocumentChanged);
    _controller.dispose();
    _focusNode.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _loadFromQuestion() {
    _isUpdatingDocument = true;
    try {
      final content = widget.question.content;
      if (content != null && content.trim().isNotEmpty) {
        _controller.document = Document.fromJson(jsonDecode(content) as List);
      } else {
        final t = widget.question.text.trim();
        if (t.isEmpty) {
          _controller.document = Document();
        } else {
          _controller.document =
              Document.fromDelta(Delta()..insert(t)..insert('\n'));
        }
      }
      _lastSyncedContent = widget.question.content;
    } catch (_) {
      _controller.document = Document();
      _lastSyncedContent = widget.question.content;
    } finally {
      _isUpdatingDocument = false;
    }
  }

  void _onDocumentChanged() {
    if (_isUpdatingDocument) return;

    _syncTimer?.cancel();
    _syncTimer = Timer(const Duration(milliseconds: 400), () {
      if (!mounted) return;
      final content = _serializeContent();
      final text = _controller.document.toPlainText().trim();
      _lastSyncedContent = content;
      widget.onChanged(
        _copy(
          widget.question,
          text: text,
          content: content,
        ),
      );
    });
  }

  String? _serializeContent() {
    final ops = _controller.document.toDelta().toList();
    final jsonOps = ops.map((op) => op.toJson()).toList();
    if (jsonOps.length == 1 && jsonOps.first['insert'] == '\n') {
      return null;
    }
    return jsonEncode(jsonOps);
  }

  QuestionModel _copy(
    QuestionModel q, {
    QuestionType? type,
    String? text,
    String? content,
    String? imageUrl,
    String? mathFormula,
    String? codeSnippet,
    List<OptionModel>? options,
    bool? isRequired,
    int? ratingMax,
    int? correctRating,
    bool? hasScore,
    double? score,
  }) {
    return QuestionModel(
      id: q.id,
      type: type ?? q.type,
      text: text ?? q.text,
      content: content ?? q.content,
      imageUrl: imageUrl ?? q.imageUrl,
      mathFormula: mathFormula ?? q.mathFormula,
      codeSnippet: codeSnippet ?? q.codeSnippet,
      options: options ?? q.options,
      isRequired: isRequired ?? q.isRequired,
      ratingMax: ratingMax ?? q.ratingMax,
      correctRating: correctRating ?? q.correctRating,
      scoreVisibility: q.scoreVisibility,
      hasScore: hasScore ?? q.hasScore,
      score: score ?? q.score,
    );
  }

  void _changeType(QuestionType type) {
    if (type == widget.question.type) return;
    final q = widget.question;

    QuestionModel updated;
    switch (type) {
      case QuestionType.multipleChoice:
      case QuestionType.imageChoice:
        final ts = DateTime.now().microsecondsSinceEpoch;
        final options = q.options.isEmpty
            ? [
                OptionModel(
                  id: 'o${ts}1',
                  text: 'Option 1',
                ),
                OptionModel(
                  id: 'o${ts}2',
                  text: 'Option 2',
                ),
              ]
            : q.options.map((o) => o.copyWith(isCorrect: false)).toList();
        updated = _copy(q, type: type, options: options);
      case QuestionType.yesNo:
        final ts = DateTime.now().microsecondsSinceEpoch;
        updated = _copy(q, type: type, options: [
          OptionModel(id: 'o${ts}y', text: 'Yes'),
          OptionModel(id: 'o${ts}n', text: 'No'),
        ]);
      case QuestionType.rating:
        updated = _copy(q, type: type, options: [], ratingMax: q.ratingMax ?? 5);
      case QuestionType.shortText:
      case QuestionType.longText:
      case QuestionType.codeInput:
      case QuestionType.mathFormula:
        updated = _copy(q, type: type, options: []);
    }
    widget.onChanged(updated);
  }

  void _setOptions(List<OptionModel> opts) {
    widget.onChanged(_copy(widget.question, options: opts));
  }

  void _addOption() {
    final ts = DateTime.now().microsecondsSinceEpoch;
    final opts = [
      ...widget.question.options,
      OptionModel(
        id: 'o${ts}_${widget.question.options.length}',
        text: 'Option ${widget.question.options.length + 1}',
      ),
    ];
    _setOptions(opts);
  }

  void _removeOption(int i) {
    final opts = List<OptionModel>.from(widget.question.options)..removeAt(i);
    _setOptions(opts);
  }

  void _updateOptionText(int i, String text) {
    final opts = List<OptionModel>.from(widget.question.options);
    opts[i] = opts[i].copyWith(text: text);
    _setOptions(opts);
  }

  void _setCorrectOption(int i) {
    final opts = widget.question.options.asMap().entries.map((e) {
      return e.key == i
          ? e.value.copyWith(isCorrect: true, score: 1)
          : e.value.copyWith(isCorrect: false, score: 0);
    }).toList();
    _setOptions(opts);
  }

  void _setCorrectRating(int value) {
    widget.onChanged(_copy(widget.question, correctRating: value));
  }

  void _setRatingMax(int value) {
    widget.onChanged(
      _copy(widget.question, ratingMax: value, correctRating: null),
    );
  }

  void _toggleRequired(bool value) {
    widget.onChanged(_copy(widget.question, isRequired: value));
  }

  void _setMathFormula(String value) {
    widget.onChanged(_copy(widget.question, mathFormula: value));
  }

  void _setCodeSnippet(String value) {
    widget.onChanged(_copy(widget.question, codeSnippet: value));
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppTheme.darkBorder : AppTheme.border,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.04),
            blurRadius: 8,
            offset: const Offset(0, 2),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          _buildHeader(isDark),
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 4, 14, 14),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.stretch,
              children: [
                _buildEditor(isDark),
                const SizedBox(height: 12),
                ..._buildBody(isDark),
                const SizedBox(height: 4),
                _buildRequiredRow(isDark),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildHeader(bool isDark) {
    return Padding(
      padding: const EdgeInsets.fromLTRB(14, 12, 8, 4),
      child: Row(
        children: [
          Container(
            width: 32,
            height: 32,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppTheme.primary,
              borderRadius: BorderRadius.circular(10),
            ),
            child: Text(
              '${widget.index + 1}',
              style: const TextStyle(
                color: Colors.white,
                fontWeight: FontWeight.w800,
                fontSize: 14,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: _TypeDropdown(
              value: widget.question.type,
              isDark: isDark,
              onChanged: _changeType,
            ),
          ),
          IconButton(
            tooltip: 'Move up',
            onPressed: widget.onMoveUp,
            icon: const Icon(Icons.arrow_upward_rounded, size: 18),
            color: AppTheme.textMuted,
            visualDensity: VisualDensity.compact,
          ),
          IconButton(
            tooltip: 'Move down',
            onPressed: widget.onMoveDown,
            icon: const Icon(Icons.arrow_downward_rounded, size: 18),
            color: AppTheme.textMuted,
            visualDensity: VisualDensity.compact,
          ),
          IconButton(
            tooltip: 'Delete question',
            onPressed: widget.onDelete,
            icon: const Icon(Icons.delete_outline_rounded, size: 18),
            color: AppTheme.error,
            visualDensity: VisualDensity.compact,
          ),
        ],
      ),
    );
  }

  Widget _buildEditor(bool isDark) {
    return Container(
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurface : AppTheme.surfaceLight,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(
          color: isDark ? AppTheme.darkBorder : AppTheme.border,
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.stretch,
        children: [
          QuillSimpleToolbar(
            controller: _controller,
            config: QuillSimpleToolbarConfig(
              multiRowsDisplay: false,
              showHeaderStyle: false,
              showFontFamily: false,
              showFontSize: false,
              showColorButton: false,
              showBackgroundColorButton: false,
              showClearFormat: false,
              showSubscript: false,
              showSuperscript: false,
              showDirection: false,
              showSearchButton: false,
              showQuote: false,
              showIndent: false,
              showListCheck: false,
              showListBullets: true,
              showListNumbers: true,
              showAlignmentButtons: true,
              showLink: true,
              showCodeBlock: false,
              showBoldButton: true,
              showItalicButton: true,
              showUnderLineButton: true,
              showStrikeThrough: true,
              showInlineCode: true,
              showUndo: true,
              showRedo: true,
              customButtons: [
                QuillToolbarCustomButtonOptions(
                  icon: const Icon(Icons.image_outlined, size: 18),
                  tooltip: 'Insert image',
                  onPressed: _insertImage,
                ),
                QuillToolbarCustomButtonOptions(
                  icon: const Icon(Icons.functions_rounded, size: 18),
                  tooltip: 'Insert math formula',
                  onPressed: _insertMath,
                ),
                QuillToolbarCustomButtonOptions(
                  icon: const Icon(Icons.code_rounded, size: 18),
                  tooltip: 'Insert code block',
                  onPressed: _insertCode,
                ),
              ],
            ),
          ),
          Container(
            height: 1,
            color: isDark ? AppTheme.darkBorder : AppTheme.border,
          ),
          QuillEditor(
            controller: _controller,
            focusNode: _focusNode,
            scrollController: _scrollController,
            config: QuillEditorConfig(
              placeholder: 'Write your question here...',
              padding: const EdgeInsets.fromLTRB(12, 12, 12, 12),
              autoFocus: false,
              expands: false,
              scrollable: true,
              minHeight: 80,
              maxHeight: 180,
              embedBuilders: buildQuillEmbedBuilders(),
            ),
          ),
        ],
      ),
    );
  }

  List<Widget> _buildBody(bool isDark) {
    final q = widget.question;
    switch (q.type) {
      case QuestionType.multipleChoice:
      case QuestionType.imageChoice:
        return [
          for (var i = 0; i < q.options.length; i++)
            _OptionEditor(
              key: ValueKey(q.options[i].id),
              option: q.options[i],
              isCorrect: q.options[i].isCorrect,
              isDark: isDark,
              onTextChanged: (text) => _updateOptionText(i, text),
              onCorrectTap: () => _setCorrectOption(i),
              onDelete: q.options.length > 2
                  ? () => _removeOption(i)
                  : null,
            ),
          _buildAddOptionButton(isDark),
        ];
      case QuestionType.yesNo:
        return [
          for (var i = 0; i < q.options.length; i++)
            _OptionEditor(
              key: ValueKey(q.options[i].id),
              option: q.options[i],
              isCorrect: q.options[i].isCorrect,
              isDark: isDark,
              onTextChanged: (text) => _updateOptionText(i, text),
              onCorrectTap: () => _setCorrectOption(i),
              onDelete: null,
            ),
        ];
      case QuestionType.rating:
        return [
          _buildRatingEditor(isDark),
        ];
      case QuestionType.shortText:
        return [
          _HintNote(
            icon: Icons.short_text_rounded,
            text: 'Respondents type a one-line answer.',
            isDark: isDark,
          ),
        ];
      case QuestionType.longText:
        return [
          _HintNote(
            icon: Icons.subject_rounded,
            text: 'Respondents type a long-form answer.',
            isDark: isDark,
          ),
        ];
      case QuestionType.codeInput:
        return [
          _CodeField(
            key: ValueKey('code_${q.id}'),
            initial: q.codeSnippet ?? '',
            isDark: isDark,
            onChanged: _setCodeSnippet,
          ),
        ];
      case QuestionType.mathFormula:
        return [
          _MathField(
            key: ValueKey('math_${q.id}'),
            initial: q.mathFormula ?? '',
            isDark: isDark,
            onChanged: _setMathFormula,
          ),
        ];
    }
  }

  Widget _buildAddOptionButton(bool isDark) {
    return Align(
      alignment: Alignment.centerLeft,
      child: Padding(
        padding: const EdgeInsets.only(top: 8),
        child: TextButton.icon(
          onPressed: _addOption,
          style: TextButton.styleFrom(
            foregroundColor: isDark ? const Color(0xFF4A90D9) : AppTheme.primary,
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
          ),
          icon: const Icon(Icons.add_rounded, size: 18),
          label: const Text(
            'Add option',
            style: TextStyle(fontWeight: FontWeight.w700),
          ),
        ),
      ),
    );
  }

  Widget _buildRatingEditor(bool isDark) {
    final q = widget.question;
    final max = (q.ratingMax ?? 5).clamp(1, 10);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Text(
              'Stars',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isDark ? AppTheme.darkTextSecondary : AppTheme.textSecondary,
              ),
            ),
            const SizedBox(width: 10),
            DropdownButton<int>(
              value: max,
              isDense: true,
              underline: const SizedBox.shrink(),
              items: [3, 5, 10]
                  .map(
                    (n) => DropdownMenuItem(value: n, child: Text('$n')),
                  )
                  .toList(),
              onChanged: (v) {
                if (v != null) _setRatingMax(v);
              },
            ),
          ],
        ),
        const SizedBox(height: 10),
        Text(
          'Correct answer (optional)',
          style: TextStyle(
            fontSize: 12,
            color: isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
          ),
        ),
        const SizedBox(height: 8),
        Wrap(
          spacing: 6,
          children: List.generate(max, (i) {
            final filled = q.correctRating == i + 1;
            return InkWell(
              borderRadius: BorderRadius.circular(8),
              onTap: () => _setCorrectRating(i + 1),
              child: Padding(
                padding: const EdgeInsets.all(2),
                child: Icon(
                  filled ? Icons.star_rounded : Icons.star_outline_rounded,
                  size: 28,
                  color: filled ? AppTheme.warning : AppTheme.textMuted,
                ),
              ),
            );
          }),
        ),
      ],
    );
  }

  Widget _buildRequiredRow(bool isDark) {
    final q = widget.question;
    final isRequired = q.isRequired;
    final hasScore = q.hasScore;
    final score = q.score;

    return Column(
      children: [
        Row(
          children: [
            Icon(
              Icons.verified_user_outlined,
              size: 16,
              color: isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
            ),
            const SizedBox(width: 8),
            Text(
              'Required',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isDark ? AppTheme.darkTextSecondary : AppTheme.textSecondary,
              ),
            ),
            const Spacer(),
            Switch(
              value: isRequired,
              onChanged: _toggleRequired,
            ),
          ],
        ),
        Row(
          children: [
            Icon(
              Icons.stars_rounded,
              size: 16,
              color: isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
            ),
            const SizedBox(width: 8),
            Text(
              'Assign Points',
              style: TextStyle(
                fontSize: 13,
                fontWeight: FontWeight.w600,
                color: isDark ? AppTheme.darkTextSecondary : AppTheme.textSecondary,
              ),
            ),
            const Spacer(),
            Switch(
              value: hasScore,
              onChanged: (val) {
                widget.onChanged(
                  _copy(q, hasScore: val, score: val ? (score > 0 ? score : 10) : 0),
                );
              },
            ),
          ],
        ),
        if (hasScore)
          Padding(
            padding: const EdgeInsets.only(top: 4, bottom: 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.end,
              children: [
                Text(
                  'Points: ',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w600,
                    color: isDark ? AppTheme.darkTextSecondary : AppTheme.textSecondary,
                  ),
                ),
                const SizedBox(width: 8),
                SizedBox(
                  width: 80,
                  height: 36,
                  child: TextFormField(
                    initialValue: score.toInt().toString(),
                    keyboardType: TextInputType.number,
                    decoration: InputDecoration(
                      contentPadding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(8)),
                      isDense: true,
                    ),
                    onChanged: (val) {
                      final s = double.tryParse(val) ?? 0;
                      widget.onChanged(_copy(q, score: s));
                    },
                  ),
                ),
              ],
            ),
          ),
      ],
    );
  }

  Future<void> _insertImage() async {
    try {
      final XFile? image = await _imagePicker.pickImage(
        source: ImageSource.gallery,
        imageQuality: 90,
      );
      if (image == null) return;

      final bytes = await image.readAsBytes();
      final base64Image = base64Encode(bytes);

      String extension = 'png';
      final String path = image.path.toLowerCase();
      if (path.endsWith('.jpg') || path.endsWith('.jpeg')) {
        extension = 'jpeg';
      } else if (path.endsWith('.gif')) {
        extension = 'gif';
      } else if (path.endsWith('.webp')) {
        extension = 'webp';
      }

      final String dataUrl = 'data:image/$extension;base64,$base64Image';

      int index = _controller.selection.baseOffset;
      if (index < 0) index = _controller.document.length - 1;
      if (index < 0) index = 0;

      _controller.replaceText(
        index,
        0,
        BlockEmbed.image(dataUrl),
        TextSelection.collapsed(offset: index + 1),
      );
      _controller.updateSelection(
        TextSelection.collapsed(offset: index + 1),
        ChangeSource.local,
      );

      _focusNode.requestFocus();
    } catch (e, stackTrace) {
      debugPrint('Image insertion error: $e\n$stackTrace');
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Failed to insert image: $e')),
      );
    }
  }

  void _insertCode() {
    final controller = TextEditingController();

    showDialog<void>(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: const Row(
            children: [
              Icon(Icons.code_rounded),
              SizedBox(width: 8),
              Text('Insert Code'),
            ],
          ),
          content: SizedBox(
            width: 700,
            child: TextField(
              controller: controller,
              maxLines: 18,
              style: const TextStyle(
                fontFamily: 'monospace',
                fontSize: 13,
              ),
              decoration: InputDecoration(
                hintText: '// Write or paste your code here...',
                filled: true,
                fillColor: Colors.grey.shade100,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(dialogContext),
              child: const Text('Cancel'),
            ),
            ElevatedButton(
              onPressed: () {
                final code = controller.text.trimRight();
                Navigator.pop(dialogContext);
                if (code.isEmpty) return;

                int index = _controller.selection.baseOffset;
                if (index < 0) {
                  index = _controller.document.length - 1;
                }
                if (index < 0) index = 0;

                _controller.replaceText(
                  index,
                  0,
                  '$code\n',
                  TextSelection.collapsed(offset: index + code.length + 1),
                );
                _controller.formatText(
                  index,
                  code.length,
                  Attribute.codeBlock,
                );
                _controller.updateSelection(
                  TextSelection.collapsed(offset: index + code.length + 1),
                  ChangeSource.local,
                );

                _focusNode.requestFocus();
              },
              child: const Text('Insert'),
            ),
          ],
        );
      },
    ).whenComplete(controller.dispose);
  }

  void _insertMath() {
    final controller = TextEditingController();

    showDialog<String>(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(
          builder: (context, setDialogState) {
            return AlertDialog(
              title: const Row(
                children: [
                  Icon(Icons.functions_rounded),
                  SizedBox(width: 8),
                  Text('Mathematical Formula'),
                ],
              ),
              content: SizedBox(
                width: 700,
                child: Column(
                  mainAxisSize: MainAxisSize.min,
                  crossAxisAlignment: CrossAxisAlignment.stretch,
                  children: [
                    TextField(
                      controller: controller,
                      maxLines: 3,
                      onChanged: (_) => setDialogState(() {}),
                      decoration: InputDecoration(
                        hintText: r'$\frac{a}{b} = x^2$',
                        helperText: r'Use $...$ or $$...$$',
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                      ),
                    ),
                    const SizedBox(height: 20),
                    const Text(
                      'Preview',
                      style: TextStyle(fontWeight: FontWeight.w700),
                    ),
                    const SizedBox(height: 12),
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: Colors.grey.shade100,
                        borderRadius: BorderRadius.circular(10),
                      ),
                      child: _buildMathPreview(controller.text),
                    ),
                  ],
                ),
              ),
              actions: [
                TextButton(
                  onPressed: () => Navigator.pop(dialogContext),
                  child: const Text('Cancel'),
                ),
                ElevatedButton(
                  onPressed: () {
                    final raw = controller.text.trim();
                    if (raw.isEmpty) return;
                    Navigator.pop(dialogContext, cleanLatex(raw));
                  },
                  child: const Text('Insert Formula'),
                ),
              ],
            );
          },
        );
      },
    ).then((formula) {
      if (formula == null || formula.isEmpty) return;

      int index = _controller.selection.baseOffset;
      if (index < 0) index = 0;
      if (index > _controller.document.length) {
        index = _controller.document.length;
      }

      final embed = BlockEmbed.custom(MathBlockEmbed(formula));
      _controller.replaceText(
        index,
        0,
        embed,
        TextSelection.collapsed(offset: index + 1),
      );
      _controller.updateSelection(
        TextSelection.collapsed(offset: index + 1),
        ChangeSource.local,
      );

      _focusNode.requestFocus();
    }).whenComplete(controller.dispose);
  }

  Widget _buildMathPreview(String input) {
    final expression = cleanLatex(input);
    if (expression.isEmpty) {
      return const Center(
        child: Text(
          'Enter a LaTeX formula',
          style: TextStyle(fontSize: 13),
        ),
      );
    }

    return FittedBox(
      fit: BoxFit.scaleDown,
      child: Math.tex(expression),
    );
  }
}

class _TypeDropdown extends StatelessWidget {
  final QuestionType value;
  final bool isDark;
  final ValueChanged<QuestionType> onChanged;

  const _TypeDropdown({
    required this.value,
    required this.isDark,
    required this.onChanged,
  });

  String _label(QuestionType t) {
    switch (t) {
      case QuestionType.multipleChoice:
        return 'Multiple Choice';
      case QuestionType.shortText:
        return 'Short Answer';
      case QuestionType.longText:
        return 'Essay';
      case QuestionType.rating:
        return 'Rating';
      case QuestionType.yesNo:
        return 'Yes / No';
      case QuestionType.imageChoice:
        return 'Image Choice';
      case QuestionType.mathFormula:
        return 'Math Formula';
      case QuestionType.codeInput:
        return 'Code Input';
    }
  }

  IconData _icon(QuestionType t) {
    switch (t) {
      case QuestionType.multipleChoice:
        return Icons.radio_button_checked;
      case QuestionType.shortText:
        return Icons.short_text_rounded;
      case QuestionType.longText:
        return Icons.subject_rounded;
      case QuestionType.rating:
        return Icons.star_outline_rounded;
      case QuestionType.yesNo:
        return Icons.check_circle_outline;
      case QuestionType.imageChoice:
        return Icons.image_outlined;
      case QuestionType.mathFormula:
        return Icons.functions_rounded;
      case QuestionType.codeInput:
        return Icons.code_rounded;
    }
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurface : AppTheme.surfaceLight,
        borderRadius: BorderRadius.circular(10),
        border: Border.all(
          color: isDark ? AppTheme.darkBorder : AppTheme.border,
        ),
      ),
      child: DropdownButtonHideUnderline(
        child: DropdownButton<QuestionType>(
          value: value,
          isExpanded: true,
          isDense: true,
          icon: const Icon(Icons.arrow_drop_down_rounded),
          style: TextStyle(
            fontSize: 13,
            fontWeight: FontWeight.w600,
            color: isDark ? AppTheme.darkTextPrimary : AppTheme.textPrimary,
          ),
          items: QuestionType.values.map((t) {
            return DropdownMenuItem<QuestionType>(
              value: t,
              child: Row(
                children: [
                  Icon(
                    _icon(t),
                    size: 16,
                    color: isDark ? const Color(0xFF4A90D9) : AppTheme.primary,
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _label(t),
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            );
          }).toList(),
          onChanged: (v) {
            if (v != null) onChanged(v);
          },
        ),
      ),
    );
  }
}

class _OptionEditor extends StatefulWidget {
  final OptionModel option;
  final bool isCorrect;
  final bool isDark;
  final void Function(String) onTextChanged;
  final VoidCallback onCorrectTap;
  final VoidCallback? onDelete;

  const _OptionEditor({
    super.key,
    required this.option,
    required this.isCorrect,
    required this.isDark,
    required this.onTextChanged,
    required this.onCorrectTap,
    this.onDelete,
  });

  @override
  State<_OptionEditor> createState() => _OptionEditorState();
}

class _OptionEditorState extends State<_OptionEditor> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.option.text);
  }

  @override
  void didUpdateWidget(covariant _OptionEditor oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.option.text != _controller.text) {
      _controller.text = widget.option.text;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      crossAxisAlignment: CrossAxisAlignment.center,
      children: [
        InkWell(
          onTap: widget.onCorrectTap,
          borderRadius: BorderRadius.circular(20),
          child: Container(
            width: 24,
            height: 24,
            margin: const EdgeInsets.only(right: 10),
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: widget.isCorrect
                  ? AppTheme.success
                  : Colors.transparent,
              border: Border.all(
                color: widget.isCorrect
                    ? AppTheme.success
                    : (widget.isDark ? AppTheme.darkBorder : AppTheme.border),
                width: 2,
              ),
            ),
            child: widget.isCorrect
                ? const Icon(Icons.check_rounded, size: 14, color: Colors.white)
                : null,
          ),
        ),
        Expanded(
          child: TextField(
            controller: _controller,
            onChanged: widget.onTextChanged,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w500,
              color: widget.isDark
                  ? AppTheme.darkTextPrimary
                  : AppTheme.textPrimary,
            ),
            decoration: InputDecoration(
              hintText: 'Option text',
              isDense: true,
              filled: true,
              fillColor:
                  widget.isDark ? AppTheme.darkSurface : AppTheme.surfaceLight,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(
                  color: widget.isDark
                      ? AppTheme.darkBorder
                      : AppTheme.border,
                ),
              ),
              enabledBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(
                  color: widget.isDark
                      ? AppTheme.darkBorder
                      : AppTheme.border,
                ),
              ),
              focusedBorder: OutlineInputBorder(
                borderRadius: BorderRadius.circular(10),
                borderSide: BorderSide(
                  color: widget.isDark
                      ? const Color(0xFF4A90D9)
                      : AppTheme.primary,
                  width: 2,
                ),
              ),
              contentPadding:
                  const EdgeInsets.symmetric(horizontal: 12, vertical: 12),
            ),
          ),
        ),
        if (widget.onDelete != null) ...[
          const SizedBox(width: 6),
          IconButton(
            tooltip: 'Delete option',
            onPressed: widget.onDelete,
            icon: const Icon(Icons.close_rounded, size: 18),
            color: AppTheme.textMuted,
            visualDensity: VisualDensity.compact,
          ),
        ],
      ],
    );
  }
}

class _HintNote extends StatelessWidget {
  final IconData icon;
  final String text;
  final bool isDark;

  const _HintNote({
    required this.icon,
    required this.text,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkSurface : AppTheme.surfaceLight,
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Icon(icon, size: 16, color: AppTheme.textMuted),
          const SizedBox(width: 8),
          Expanded(
            child: Text(
              text,
              style: TextStyle(
                fontSize: 13,
                color: isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _CodeField extends StatefulWidget {
  final String initial;
  final bool isDark;
  final ValueChanged<String> onChanged;

  const _CodeField({
    super.key,
    required this.initial,
    required this.isDark,
    required this.onChanged,
  });

  @override
  State<_CodeField> createState() => _CodeFieldState();
}

class _CodeFieldState extends State<_CodeField> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initial);
  }

  @override
  void didUpdateWidget(covariant _CodeField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initial != _controller.text) {
      _controller.text = widget.initial;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return TextField(
      controller: _controller,
      maxLines: 6,
      onChanged: widget.onChanged,
      style: const TextStyle(
        fontFamily: 'monospace',
        fontSize: 13,
      ),
      decoration: InputDecoration(
        hintText: '// Write the starter code here...',
        filled: true,
        fillColor: widget.isDark ? AppTheme.darkSurface : AppTheme.surfaceLight,
        border: OutlineInputBorder(
          borderRadius: BorderRadius.circular(10),
        ),
      ),
    );
  }
}

class _MathField extends StatefulWidget {
  final String initial;
  final bool isDark;
  final ValueChanged<String> onChanged;

  const _MathField({
    super.key,
    required this.initial,
    required this.isDark,
    required this.onChanged,
  });

  @override
  State<_MathField> createState() => _MathFieldState();
}

class _MathFieldState extends State<_MathField> {
  late final TextEditingController _controller;

  @override
  void initState() {
    super.initState();
    _controller = TextEditingController(text: widget.initial);
  }

  @override
  void didUpdateWidget(covariant _MathField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.initial != _controller.text) {
      _controller.text = widget.initial;
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        TextField(
          controller: _controller,
          maxLines: 3,
          onChanged: widget.onChanged,
          decoration: InputDecoration(
            hintText: r'$\frac{a}{b} = x^2$',
            helperText: r'Use $...$ or $$...$$',
            filled: true,
            fillColor:
                widget.isDark ? AppTheme.darkSurface : AppTheme.surfaceLight,
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(10),
            ),
          ),
        ),
        const SizedBox(height: 8),
        Container(
          width: double.infinity,
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: widget.isDark ? AppTheme.darkSurface : AppTheme.surfaceLight,
            borderRadius: BorderRadius.circular(10),
          ),
          child: _buildPreview(),
        ),
      ],
    );
  }

  Widget _buildPreview() {
    final expression = cleanLatex(_controller.text);
    if (expression.isEmpty) {
      return Text(
        'Preview appears here',
        style: TextStyle(
          fontSize: 13,
          color: widget.isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
        ),
      );
    }
    return FittedBox(
      fit: BoxFit.scaleDown,
      child: Math.tex(expression),
    );
  }
}