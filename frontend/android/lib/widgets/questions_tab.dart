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
  State<QuestionsTab> createState() => QuestionsTabState();
}

class QuestionsTabState extends State<QuestionsTab> {
  late final QuillController _controller;
  final FocusNode _focusNode = FocusNode();
  final ScrollController _scrollController = ScrollController();
  final ImagePicker _imagePicker = ImagePicker();

  bool _isUpdatingDocument = false;
  Timer? _syncTimer;

  @override
  void initState() {
    super.initState();
    _controller = QuillController.basic();
    _controller.addListener(_onDocumentChanged);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (!mounted) return;
      _loadDocumentFromQuestions();
    });
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

  void flushNow() {
    _syncTimer?.cancel();
    _syncTimer = null;
    if (!mounted) return;
    _parseAndSync();
  }

  void _onDocumentChanged() {
    if (_isUpdatingDocument) return;

    _syncTimer?.cancel();
    _syncTimer = Timer(const Duration(milliseconds: 400), () {
      if (!mounted) return;
      _parseAndSync();
    });
  }

  void _parseAndSync() {
    if (_isUpdatingDocument) return;
    if (!mounted) return;

    _isUpdatingDocument = true;
    try {
      final parsed = _parseDocument();
      if (!_sameQuestions(widget.questions, parsed)) {
        widget.onQuestionsChanged(parsed);
      }
    } catch (e, st) {
      debugPrint('Sync questions error: $e\n$st');
    } finally {
      _isUpdatingDocument = false;
    }
  }

  void _loadDocumentFromQuestions() {
    _isUpdatingDocument = true;
    try {
      final ops = _buildDocOps(widget.questions);
      if (ops.isEmpty) {
        _controller.document = Document();
      } else {
        _controller.document = Document.fromJson(ops);
      }
    } catch (e, st) {
      debugPrint('Failed to load questions doc: $e\n$st');
    } finally {
      _isUpdatingDocument = false;
    }
  }

  List<Map<String, dynamic>> _buildDocOps(List<QuestionModel> questions) {
    final ops = <Map<String, dynamic>>[];

    for (var i = 0; i < questions.length; i++) {
      final q = questions[i];

      ops.add({
        'insert': '${i + 1}. ',
        'attributes': {'bold': true},
      });

      if (q.content != null && q.content!.trim().isNotEmpty) {
        try {
          ops.addAll(
            (jsonDecode(q.content!) as List)
                .cast<Map<String, dynamic>>(),
          );
        } catch (_) {
          ops.add({'insert': '${q.text.trim()}\n'});
        }
      } else {
        final t = q.text.trim();
        ops.add({
          'insert':
              '${t.isEmpty ? 'Write your question here...' : t}\n',
        });
        if (q.imageUrl != null && q.imageUrl!.isNotEmpty) {
          ops.add({'insert': BlockEmbed.image(q.imageUrl!).toJson()});
          ops.add({'insert': '\n'});
        }
      }

      switch (q.type) {
        case QuestionType.multipleChoice:
        case QuestionType.imageChoice:
          final imageMode = q.type == QuestionType.imageChoice;
          final options = q.options.isNotEmpty
              ? q.options
              : [
                  OptionModel(
                    id: '${q.id}_o1',
                    text: imageMode ? '' : 'Option 1',
                  ),
                  OptionModel(
                    id: '${q.id}_o2',
                    text: imageMode ? '' : 'Option 2',
                  ),
                ];
          for (var j = 0; j < options.length; j++) {
            final o = options[j];
            final mark = o.isCorrect ? '✓' : (imageMode ? '▣' : '☐');
            final letter = String.fromCharCode(65 + j);
            ops.add({'insert': '$mark $letter. '});
            if (o.content != null && o.content!.trim().isNotEmpty) {
              try {
                ops.addAll(
                  (jsonDecode(o.content!) as List)
                      .cast<Map<String, dynamic>>(),
                );
              } catch (_) {
                ops.add({'insert': '${o.text.trim()}\n'});
              }
            } else if (o.text.trim().isNotEmpty) {
              ops.add({'insert': '${o.text.trim()}\n'});
            } else {
              ops.add({'insert': '\n'});
            }
          }
          break;

        case QuestionType.yesNo:
          bool yes = false;
          bool no = false;
          for (final o in q.options) {
            final t = o.text.trim().toLowerCase();
            if (t == 'yes' && o.isCorrect) yes = true;
            if (t == 'no' && o.isCorrect) no = true;
          }
          ops.add({'insert': '${yes ? '✓' : '☐'} Yes\n'});
          ops.add({'insert': '${no ? '✓' : '☐'} No\n'});
          break;

        case QuestionType.rating:
          final max = (q.ratingMax ?? 5).clamp(1, 10);
          final stars = List.generate(max, (_) => '☆ ').join();
          ops.add({
            'insert':
                'Rating: $stars'
                '${q.correctRating != null ? '(answer: ${q.correctRating})' : ''}'
                '\n',
          });
          break;

        case QuestionType.shortText:
          ops.add({'insert': 'Short answer: ______________________________\n'});
          break;

        case QuestionType.longText:
          ops.add({'insert': 'Essay answer:\n'});
          break;

        case QuestionType.codeInput:
          ops.add({
            'insert': 'Code:\n',
            'attributes': {'bold': true},
          });
          final code = q.codeSnippet?.trimRight() ?? '';
          ops.add({
            'insert':
                '${code.isEmpty ? '// Write your code here...' : code}\n',
            'attributes': {'code-block': true},
          });
          break;

        case QuestionType.mathFormula:
          ops.add({
            'insert': 'Math:\n',
            'attributes': {'bold': true},
          });
          final formula = q.mathFormula?.trim() ?? '';
          if (formula.isNotEmpty) {
            ops.add({
              'insert': {MathBlockEmbed.mathType: cleanLatex(formula)},
            });
            ops.add({'insert': '\n'});
          }
          break;
      }

      ops.add({'insert': '\n'});
    }

    return ops;
  }

  List<QuestionModel> _parseDocument() {
    final lines = _toLines(_controller.document.toDelta().toList());
    final parsed = <QuestionModel>[];
    final qHeader = RegExp(r'^\s*\d+[\.\)]\s*');

    String questionText = '';
    List<_Line> questionLines = [];
    List<_OptEntry> opts = [];
    int? correctRating;
    int ratingMax = 0;
    String mathFormula = '';
    String codeSnippet = '';
    bool afterCode = false;
    bool afterMath = false;
    QuestionType? inferredType;

    void resetBlock() {
      questionText = '';
      questionLines = [];
      opts = [];
      correctRating = null;
      ratingMax = 0;
      mathFormula = '';
      codeSnippet = '';
      afterCode = false;
      afterMath = false;
      inferredType = null;
    }

    void finishBlock() {
      final hasContent = questionText.trim().isNotEmpty ||
          questionLines.any((l) => l.segs.isNotEmpty) ||
          opts.isNotEmpty ||
          ratingMax > 0 ||
          mathFormula.isNotEmpty ||
          codeSnippet.isNotEmpty ||
          inferredType != null;

      if (hasContent) {
        final idx = parsed.length;
        final existing = idx < widget.questions.length
            ? widget.questions[idx]
            : null;
        final type =
            inferredType ?? existing?.type ?? QuestionType.shortText;
        parsed.add(_buildModel(
          existing: existing,
          type: type,
          text: questionText,
          questionLines: questionLines,
          opts: opts,
          ratingMax: ratingMax,
          correctRating: correctRating,
          mathFormula: mathFormula,
          codeSnippet: codeSnippet,
          index: idx,
        ));
      }
      resetBlock();
    }

    for (final line in lines) {
      final raw = line.plain;
      final trimmed = raw.trim();

      if (afterCode) {
        if (_isStructural(trimmed)) {
          afterCode = false;
        } else {
          codeSnippet = codeSnippet.isEmpty
              ? trimmed
              : '$codeSnippet\n$trimmed';
          continue;
        }
      }

      if (afterMath) {
        if (_isStructural(trimmed)) {
          afterMath = false;
        } else {
          if (mathFormula.isEmpty) {
            for (final s in line.segs) {
              if (s.data is Map &&
                  (s.data as Map)['math'] != null) {
                mathFormula =
                    cleanLatex((s.data as Map)['math'].toString());
                break;
              }
            }
          }
          continue;
        }
      }

      final qm = qHeader.firstMatch(raw);
      if (qm != null) {
        finishBlock();
        questionText = raw.substring(qm.end).trim();
        questionLines = [
          _Line(_stripSegs(line.segs, qm.end), line.attrs),
        ];
        continue;
      }

      if (trimmed.startsWith('Rating:')) {
        inferredType = QuestionType.rating;
        ratingMax = '☆'.allMatches(trimmed).length +
            '★'.allMatches(trimmed).length;
        final k = RegExp(r'\(answer:\s*(\d+)\)').firstMatch(trimmed);
        if (k != null) {
          correctRating = int.tryParse(k.group(1)!);
        }
        continue;
      }
      if (trimmed.startsWith('Short answer:')) {
        inferredType = QuestionType.shortText;
        continue;
      }
      if (trimmed.startsWith('Essay answer:')) {
        inferredType = QuestionType.longText;
        continue;
      }
      if (trimmed.startsWith('Code:')) {
        inferredType = QuestionType.codeInput;
        afterCode = true;
        continue;
      }
      if (trimmed.startsWith('Math:')) {
        inferredType = QuestionType.mathFormula;
        afterMath = true;
        continue;
      }

      final om = _matchOption(raw);
      if (om != null) {
        final low = om.contentPlain.trim().toLowerCase();
        final hasImage = line.segs.any(
          (s) => s.data is Map && (s.data as Map)['image'] != null,
        );
        if (low == 'yes' || low == 'no') {
          inferredType = QuestionType.yesNo;
        } else if (hasImage || om.marker == '▣') {
          inferredType = QuestionType.imageChoice;
        } else {
          inferredType = QuestionType.multipleChoice;
        }
        opts.add(_OptEntry(line, om.prefixLen, om.contentPlain,
            om.marker == '✓'));
        continue;
      }

      if (trimmed.isNotEmpty) {
        questionText = questionText.isEmpty
            ? trimmed
            : '$questionText $trimmed';
        questionLines.add(line);
      }
    }

    finishBlock();
    return parsed;
  }

  QuestionModel _buildModel({
    required QuestionModel? existing,
    required QuestionType type,
    required String text,
    required List<_Line> questionLines,
    required List<_OptEntry> opts,
    required int ratingMax,
    required int? correctRating,
    required String mathFormula,
    required String codeSnippet,
    required int index,
  }) {
    final ts = DateTime.now().microsecondsSinceEpoch;
    final contentJson = _contentJson(questionLines);

    final optionModels = <OptionModel>[];
    if (type == QuestionType.multipleChoice ||
        type == QuestionType.imageChoice ||
        type == QuestionType.yesNo) {
      for (var j = 0; j < opts.length; j++) {
        final o = opts[j];
        final id = (existing != null && j < existing.options.length)
            ? existing.options[j].id
            : 'o${ts}_$index$j';
        optionModels.add(OptionModel(
          id: id,
          text: o.contentPlain.trim(),
          content: _optionContentJson(o.line, o.prefixLen),
          isCorrect: o.correct,
        ));
      }
      if (type == QuestionType.yesNo && optionModels.isEmpty) {
        optionModels.add(OptionModel(id: 'o${ts}_y', text: 'Yes'));
        optionModels.add(OptionModel(id: 'o${ts}_n', text: 'No'));
      }
    }

    return QuestionModel(
      id: existing?.id ?? 'q$ts',
      type: type,
      text: text,
      content: contentJson,
      mathFormula: type == QuestionType.mathFormula
          ? mathFormula
          : existing?.mathFormula,
      codeSnippet: type == QuestionType.codeInput
          ? codeSnippet
          : existing?.codeSnippet,
      options: optionModels,
      isRequired: existing?.isRequired ?? true,
      ratingMax: type == QuestionType.rating
          ? (ratingMax > 0 ? ratingMax : existing?.ratingMax)
          : existing?.ratingMax,
      correctRating: type == QuestionType.rating
          ? (correctRating ?? existing?.correctRating)
          : existing?.correctRating,
      hasScore: existing?.hasScore ?? false,
      score: existing?.score ?? 0,
      scoreVisibility:
          existing?.scoreVisibility ?? ScoreVisibility.hidden,
    );
  }

  bool _sameQuestions(
    List<QuestionModel> a,
    List<QuestionModel> b,
  ) {
    if (a.length != b.length) return false;
    for (var i = 0; i < a.length; i++) {
      final qa = a[i];
      final qb = b[i];
      if (qa.text != qb.text ||
          qa.content != qb.content ||
          qa.type != qb.type ||
          qa.ratingMax != qb.ratingMax ||
          qa.correctRating != qb.correctRating ||
          qa.mathFormula != qb.mathFormula ||
          qa.codeSnippet != qb.codeSnippet ||
          qa.options.length != qb.options.length) {
        return false;
      }
      for (var j = 0; j < qa.options.length; j++) {
        if (qa.options[j].text != qb.options[j].text ||
            qa.options[j].content != qb.options[j].content ||
            qa.options[j].isCorrect != qb.options[j].isCorrect) {
          return false;
        }
      }
    }
    return true;
  }

  int _countQuestions() {
    var count = 0;
    for (final l in _toLines(_controller.document.toDelta().toList())) {
      if (RegExp(r'^\s*\d+[\.\)]\s*').hasMatch(l.plain)) count++;
    }
    return count;
  }

  String _templateFor(QuestionType type, int qNum) {
    switch (type) {
      case QuestionType.multipleChoice:
        return '$qNum. Write your question here...\n'
            '☐ A. Option 1\n'
            '☐ B. Option 2\n'
            '\n';
      case QuestionType.imageChoice:
        return '$qNum. Select an image for this question...\n'
            '▣ A. Add an image with the Image button\n'
            '▣ B. Add an image with the Image button\n'
            '\n';
      case QuestionType.longText:
        return '$qNum. Write your question here...\n'
            'Essay answer:\n'
            '\n';
      case QuestionType.shortText:
        return '$qNum. Write your question here...\n'
            'Short answer: ______________________________\n'
            '\n';
      case QuestionType.yesNo:
        return '$qNum. Write your question here...\n'
            '☐ Yes\n'
            '☐ No\n'
            '\n';
      case QuestionType.rating:
        return '$qNum. Write your question here...\n'
            'Rating: ☆ ☆ ☆ ☆ ☆\n'
            '\n';
      case QuestionType.codeInput:
        return '$qNum. Write a coding-related question...\n'
            'Code:\n'
            '// Write your code here...\n'
            '\n';
      case QuestionType.mathFormula:
        return '$qNum. Write your math question here...\n'
            'Math:\n'
            '\n';
    }
  }

  void _insertTemplate(QuestionType type) {
    if (!mounted) return;

    final qNum = _countQuestions() + 1;
    final template = _templateFor(type, qNum);

    int index = _controller.selection.baseOffset;
    if (index < 0) index = _controller.document.length - 1;
    if (index < 0) index = 0;

    _controller.replaceText(
      index,
      0,
      template,
      TextSelection.collapsed(offset: index + template.length),
    );
    _controller.updateSelection(
      TextSelection.collapsed(offset: index + template.length),
      ChangeSource.local,
    );

    _focusNode.requestFocus();

    Future.delayed(const Duration(milliseconds: 200), () {
      if (!mounted || !_scrollController.hasClients) return;
      _scrollController.animateTo(
        _scrollController.position.maxScrollExtent,
        duration: const Duration(milliseconds: 350),
        curve: Curves.easeOut,
      );
    });
  }

  void _showQuestionTypeMenu() {
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
                    subtitle: 'Choose one or more answers',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      _insertTemplate(QuestionType.multipleChoice);
                    },
                  ),
                  _questionTypeTile(
                    icon: Icons.image_outlined,
                    title: 'Image Choice',
                    subtitle: 'Answer choices using images',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      _insertTemplate(QuestionType.imageChoice);
                    },
                  ),
                  _questionTypeTile(
                    icon: Icons.subject_rounded,
                    title: 'Essay',
                    subtitle: 'Long-form answer',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      _insertTemplate(QuestionType.longText);
                    },
                  ),
                  _questionTypeTile(
                    icon: Icons.short_text_rounded,
                    title: 'Short Answer',
                    subtitle: 'Brief written answer',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      _insertTemplate(QuestionType.shortText);
                    },
                  ),
                  _questionTypeTile(
                    icon: Icons.check_circle_outline,
                    title: 'Yes / No',
                    subtitle: 'Yes or no question',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      _insertTemplate(QuestionType.yesNo);
                    },
                  ),
                  _questionTypeTile(
                    icon: Icons.star_outline_rounded,
                    title: 'Rating',
                    subtitle: 'Rating using stars',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      _insertTemplate(QuestionType.rating);
                    },
                  ),
                  _questionTypeTile(
                    icon: Icons.code_rounded,
                    title: 'Code Input',
                    subtitle: 'Answer using program code',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      _insertTemplate(QuestionType.codeInput);
                    },
                  ),
                  _questionTypeTile(
                    icon: Icons.functions_rounded,
                    title: 'Math Formula',
                    subtitle: 'Question with a LaTeX formula',
                    onTap: () {
                      Navigator.pop(sheetContext);
                      _insertTemplate(QuestionType.mathFormula);
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
      contentPadding: const EdgeInsets.symmetric(
        horizontal: 8,
        vertical: 2,
      ),
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

  Widget _buildToolbar(bool isDark) {
    return ClipRect(
      child: Container(
        width: double.infinity,
        decoration: BoxDecoration(
          color: isDark ? const Color(0xFF202124) : const Color(0xFFF8F9FA),
          border: Border(
            bottom: BorderSide(
              color: isDark ? AppTheme.darkBorder : const Color(0xFFDADCE0),
            ),
          ),
        ),
        child: QuillSimpleToolbar(
          controller: _controller,
          config: QuillSimpleToolbarConfig(
            multiRowsDisplay: false,

            showBoldButton: true,
            showItalicButton: true,
            showUnderLineButton: true,
            showStrikeThrough: true,
            showInlineCode: true,

            showHeaderStyle: true,
            showFontFamily: true,
            showFontSize: true,
            showColorButton: true,
            showBackgroundColorButton: true,
            showClearFormat: true,

            showAlignmentButtons: true,
            showListNumbers: true,
            showListBullets: true,
            showListCheck: true,
            showQuote: true,
            showIndent: true,
            showLink: true,
            showCodeBlock: true,

            showUndo: true,
            showRedo: true,
            showSubscript: true,
            showSuperscript: true,

            showDirection: false,
            showSearchButton: false,

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
              QuillToolbarCustomButtonOptions(
                icon: const Icon(
                  Icons.check_circle_outline_rounded,
                  size: 18,
                ),
                tooltip: 'Mark / unmark correct answer on this line',
                onPressed: _toggleCorrectLine,
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _buildInsertMenu() {
    return PopupMenuButton<String>(
      tooltip: 'Insert',
      icon: const Icon(Icons.add_box_outlined),
      onSelected: (value) {
        switch (value) {
          case 'question':
            _showQuestionTypeMenu();
            break;
          case 'image':
            _insertImage();
            break;
          case 'code':
            _insertCode();
            break;
          case 'math':
            _insertMath();
            break;
        }
      },
      itemBuilder: (context) {
        return const [
          PopupMenuItem<String>(
            value: 'question',
            child: ListTile(
              leading: Icon(Icons.help_outline_rounded),
              title: Text('Add Question'),
            ),
          ),
          PopupMenuItem<String>(
            value: 'image',
            child: ListTile(
              leading: Icon(Icons.image_outlined),
              title: Text('Image'),
            ),
          ),
          PopupMenuItem<String>(
            value: 'code',
            child: ListTile(
              leading: Icon(Icons.code_rounded),
              title: Text('Code'),
            ),
          ),
          PopupMenuItem<String>(
            value: 'math',
            child: ListTile(
              leading: Icon(Icons.functions_rounded),
              title: Text('Math Formula'),
            ),
          ),
        ];
      },
    );
  }

  void _toggleCorrectLine() {
    final doc = _controller.document;
    final text = doc.toPlainText();
    int pos = _controller.selection.baseOffset;
    if (pos < 0 || pos > text.length) return;

    int lineStart = 0;
    for (var i = pos - 1; i >= 0; i--) {
      if (text[i] == '\n') {
        lineStart = i + 1;
        break;
      }
    }

    int idx = lineStart;
    while (idx < text.length && (text[idx] == ' ' || text[idx] == '\t')) {
      idx++;
    }

    if (idx < text.length && (text[idx] == '☐' || text[idx] == '▣')) {
      _controller.replaceText(
        idx,
        1,
        '✓',
        TextSelection.collapsed(offset: idx + 1),
      );
    } else if (idx < text.length && text[idx] == '✓') {
      _controller.replaceText(
        idx,
        1,
        '☐',
        TextSelection.collapsed(offset: idx + 1),
      );
    } else {
      _controller.replaceText(
        lineStart,
        0,
        '☐ ',
        TextSelection.collapsed(offset: lineStart + 2),
      );
    }
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

  @override
  Widget build(BuildContext context) {
    final bool isDark = Theme.of(context).brightness == Brightness.dark;

    return Stack(
      children: [
        Positioned.fill(
          child: Container(
            margin: const EdgeInsets.fromLTRB(16, 16, 16, 16),
            decoration: BoxDecoration(
              color: isDark ? AppTheme.darkCard : Colors.white,
              border: Border.all(
                color: isDark ? AppTheme.darkBorder : const Color(0xFFD0D5DD),
              ),
              borderRadius: BorderRadius.circular(4),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.04),
                  blurRadius: 8,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            child: Column(
              children: [
                SizedBox(
                  width: double.infinity,
                  child: Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(child: _buildToolbar(isDark)),
                      Container(
                        height: 48,
                        color: isDark
                            ? const Color(0xFF202124)
                            : const Color(0xFFF8F9FA),
                        child: _buildInsertMenu(),
                      ),
                      const SizedBox(width: 8),
                    ],
                  ),
                ),
                Container(
                  width: double.infinity,
                  color: isDark
                      ? const Color(0xFF202124)
                      : const Color(0xFFF8F9FA),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 8,
                  ),
                  child: Row(
                    children: [
                      const Icon(
                        Icons.lightbulb_outline_rounded,
                        size: 15,
                        color: AppTheme.warning,
                      ),
                      const SizedBox(width: 6),
                      Expanded(
                        child: Text(
                          'Each question starts with a number (1. 2. ...). '
                          'Options start with A. B. ... — change ☐ to ✓ to '
                          'mark the correct answer. For rating, add (answer: 3).',
                          style: TextStyle(
                            fontSize: 12,
                            color: isDark
                                ? AppTheme.darkTextSecondary
                                : AppTheme.textMuted,
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
                Expanded(
                  child: Container(
                    color: isDark ? AppTheme.darkCard : Colors.white,
                    child: QuillEditor(
                      controller: _controller,
                      focusNode: _focusNode,
                      scrollController: _scrollController,
                      config: QuillEditorConfig(
                        placeholder: 'Write your question here.',
                        padding: const EdgeInsets.fromLTRB(
                          60,
                          40,
                          60,
                          120,
                        ),
                        autoFocus: false,
                        expands: true,
                        scrollable: true,
                        embedBuilders: buildQuillEmbedBuilders(),
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
        ),
      ],
    );
  }
}

class _Seg {
  _Seg(this.data, this.attrs);

  final Object data;
  final Map<String, dynamic>? attrs;
}

class _Line {
  _Line(this.segs, this.attrs);

  final List<_Seg> segs;
  final Map<String, dynamic>? attrs;

  String get plain {
    final b = StringBuffer();
    for (final s in segs) {
      if (s.data is String) {
        b.write(s.data);
      } else if (s.data is Map) {
        final m = s.data as Map;
        if (m.containsKey('image')) {
          b.write(' [image] ');
        } else if (m.containsKey('math')) {
          b.write(' [math] ');
        } else {
          b.write(' [embed] ');
        }
      }
    }
    return b.toString();
  }
}

class _OptEntry {
  _OptEntry(this.line, this.prefixLen, this.contentPlain, this.correct);

  final _Line line;
  final int prefixLen;
  final String contentPlain;
  final bool correct;
}

class _OptMatch {
  _OptMatch(this.marker, this.prefixLen, this.contentPlain);

  final String? marker;
  final int prefixLen;
  final String contentPlain;
}

const _blockKeys = {
  'header',
  'list',
  'code-block',
  'blockquote',
  'align',
  'indent',
  'direction',
};

Map<String, dynamic>? _inlineAttrs(Map<String, dynamic>? a) {
  if (a == null) return null;
  final m = <String, dynamic>{};
  a.forEach((k, v) {
    if (!_blockKeys.contains(k)) m[k] = v;
  });
  return m.isEmpty ? null : m;
}

Map<String, dynamic>? _blockAttrs(Map<String, dynamic>? a) {
  if (a == null) return null;
  final m = <String, dynamic>{};
  a.forEach((k, v) {
    if (_blockKeys.contains(k)) m[k] = v;
  });
  return m.isEmpty ? null : m;
}

List<_Seg> _stripSegs(List<_Seg> segs, int n) {
  if (n <= 0) return segs;
  final out = <_Seg>[];
  var remaining = n;
  for (final s in segs) {
    if (s.data is! String) {
      out.add(s);
      continue;
    }
    final t = s.data as String;
    if (remaining <= 0) {
      out.add(s);
      continue;
    }
    if (t.length <= remaining) {
      remaining -= t.length;
      continue;
    }
    out.add(_Seg(t.substring(remaining), s.attrs));
    remaining = 0;
  }
  return out;
}

List<_Line> _toLines(List<Operation> ops) {
  final lines = <_Line>[];
  final cur = <_Seg>[];
  Map<String, dynamic>? curAttrs;

  void flush() {
    lines.add(_Line(List.of(cur), curAttrs));
    cur.clear();
    curAttrs = null;
  }

  for (final op in ops) {
    if (!op.isInsert) continue;
    final data = op.data;
    final attrs = op.attributes;

    if (data is String) {
      final parts = data.split('\n');
      for (var i = 0; i < parts.length; i++) {
        if (i > 0) {
          curAttrs = _blockAttrs(attrs);
          flush();
        }
        if (parts[i].isNotEmpty) {
          cur.add(_Seg(parts[i], _inlineAttrs(attrs)));
        }
      }
    } else if (data is Map) {
      cur.add(_Seg(data, _inlineAttrs(attrs)));
    }
  }

  if (cur.isNotEmpty || curAttrs != null) flush();
  return lines;
}

String? _contentJson(List<_Line> lines) {
  final hasAny = lines.any(
    (l) => l.segs.any(
      (s) => s.data is String
          ? s.data.toString().trim().isNotEmpty
          : true,
    ),
  );
  if (!hasAny) return null;

  final ops = <Map<String, dynamic>>[];
  for (final l in lines) {
    for (final s in l.segs) {
      ops.add({
        'insert': s.data,
        if (s.attrs != null && s.attrs!.isNotEmpty) 'attributes': s.attrs,
      });
    }
    ops.add({
      'insert': '\n',
      if (l.attrs != null && l.attrs!.isNotEmpty) 'attributes': l.attrs,
    });
  }
  return jsonEncode(ops);
}

String? _optionContentJson(_Line line, int prefixLen) {
  final segs = _stripSegs(line.segs, prefixLen);
  final hasAny = segs.any(
    (s) => s.data is String ? s.data.toString().trim().isNotEmpty : true,
  );
  if (!hasAny) return null;

  final ops = <Map<String, dynamic>>[];
  for (final s in segs) {
    ops.add({
      'insert': s.data,
      if (s.attrs != null && s.attrs!.isNotEmpty) 'attributes': s.attrs,
    });
  }
  ops.add({
    'insert': '\n',
    if (line.attrs != null && line.attrs!.isNotEmpty) 'attributes': line.attrs,
  });
  return jsonEncode(ops);
}

bool _isAsciiLetter(String c) {
  final code = c.codeUnitAt(0);
  return (code >= 65 && code <= 90) || (code >= 97 && code <= 122);
}

_OptMatch? _matchOption(String raw) {
  var i = 0;
  while (i < raw.length && (raw[i] == ' ' || raw[i] == '\t')) {
    i++;
  }

  String? marker;
  if (i < raw.length &&
      (raw[i] == '✓' || raw[i] == '☐' || raw[i] == '▣')) {
    marker = raw[i];
    i++;
  }

  while (i < raw.length && raw[i] == ' ') {
    i++;
  }

  bool letterPrefixed = false;
  if (i < raw.length &&
      _isAsciiLetter(raw[i]) &&
      i + 1 < raw.length &&
      (raw[i + 1] == '.' || raw[i + 1] == ')') &&
      i + 2 < raw.length &&
      raw[i + 2] == ' ') {
    letterPrefixed = true;
    i += 2;
    while (i < raw.length && raw[i] == ' ') {
      i++;
    }
  }

  if (marker == null && !letterPrefixed) return null;
  return _OptMatch(marker, i, raw.substring(i));
}

bool _isStructural(String t) {
  if (t.isEmpty) return false;
  if (t.startsWith('Rating:')) return true;
  if (t.startsWith('Short answer:')) return true;
  if (t.startsWith('Essay answer:')) return true;
  if (t.startsWith('Code:')) return true;
  if (t.startsWith('Math:')) return true;
  if (RegExp(r'^\s*\d+[\.\)]\s*').hasMatch(t)) return true;
  if (_matchOption(t) != null) return true;
  return false;
}
