import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'dart:ui' as ui;

import 'package:crypto/crypto.dart';
import 'package:flutter/material.dart';
import 'package:flutter/rendering.dart';
import 'package:flutter_math_fork/flutter_math.dart';
import 'package:path_provider/path_provider.dart';

import '../models/question_model.dart';
import '../widgets/code_block_widget.dart';
import '../widgets/quill_embeds.dart';
import '../widgets/rich_text_view.dart';

/// Converts published questions into PNG images rendered off-screen.
///
/// Images are stored ONLY in the device temporary directory — nothing is
/// sent to the backend or saved into any database. The fill screen uses
/// these images when available and falls back to live rendering otherwise.
class QuestionImageRenderer {
  QuestionImageRenderer._();

  static const String _dirName = 'question_images';
  static const int _maxFiles = 80;

  /// hash -> absolute file path
  static final Map<String, String> _pathByHash = <String, String>{};
  static bool _indexScanned = false;

  /// Stable hash built ONLY from fields that survive the backend
  /// round-trip (text, markers-parsed math/code, options, points flags).
  /// The rich-text delta (`content`) is intentionally excluded because it
  /// is not persisted, so hashes stay identical on the fill side.
  static String hashQuestion(QuestionModel q) {
    final parts = <String>[
      q.type.name,
      q.text.trim(),
      q.mathFormula?.trim() ?? '',
      q.codeSnippet?.trim() ?? '',
      q.isRequired ? '1' : '0',
      if (q.type == QuestionType.rating) (q.ratingMax ?? 5).toString(),
      ...q.options.map((o) =>
          '${o.text.trim()}|${(o.isCorrect || o.score > 0) ? '1' : '0'}'),
    ];
    return md5.convert(utf8.encode(parts.join('|'))).toString();
  }

  /// Returns the cached image path for a question, or null when the
  /// question has never been rendered on this device. Call [warmup] once
  /// (e.g. in initState) so lookups work across app restarts.
  static String? pathFor(QuestionModel q) {
    final hash = hashQuestion(q);
    final path = _pathByHash[hash];
    if (path == null) return null;
    return File(path).existsSync() ? path : null;
  }

  static Future<Directory> _baseDir() async {
    String basePath;
    try {
      final tmp = await getTemporaryDirectory();
      basePath = tmp.path;
    } catch (_) {
      try {
        final docs = await getApplicationDocumentsDirectory();
        basePath = docs.path;
      } catch (_) {
        basePath = '/sdcard/Download';
      }
    }
    final dir = Directory('$basePath/$_dirName');
    if (!dir.existsSync()) dir.createSync(recursive: true);
    return dir;
  }

  /// Warms the in-memory index from disk so [pathFor] can answer
  /// synchronously. Call once early (e.g. before rendering screens).
  static Future<void> warmup() async {
    if (_indexScanned) return;
    _indexScanned = true;

    try {
      final dir = await _baseDir();
      for (final entity in dir.listSync()) {
        if (entity is File && entity.path.endsWith('.png')) {
          final name =
              entity.uri.pathSegments.last.replaceAll(RegExp(r'\.png$'), '');
          _pathByHash[name] = entity.path;
        }
      }
    } catch (_) {}
  }

  /// Renders every question to PNG (skipping ones already cached by hash).
  ///
  /// Returns how many questions have an image ready afterwards.
  /// This function never throws — failures simply leave that question
  /// without an image and the UI falls back to live rendering.
  static Future<int> renderAll(
    List<QuestionModel> questions, {
    required BuildContext context,
    double pixelRatio = 2.0,
    void Function(int done, int total)? onProgress,
  }) async {
    final overlay = Overlay.maybeOf(context, rootOverlay: true);
    if (overlay == null) return 0;

    var logicalWidth = 520.0;
    try {
      final screenWidth = MediaQuery.of(overlay.context).size.width;
      logicalWidth = (screenWidth * 0.86).clamp(300.0, 560.0);
    } catch (_) {}

    await warmup();
    final total = questions.length;
    var ready = 0;

    final dir = await _baseDir();

    for (var i = 0; i < total; i++) {
      onProgress?.call(i, total);

      final q = questions[i];
      final hash = hashQuestion(q);

      final cachedPath = _pathByHash[hash];
      if (cachedPath != null && File(cachedPath).existsSync()) {
        ready++;
        continue;
      }

      final outFile = File('${dir.path}/$hash.png');
      final ok = await _capture(
        overlay: overlay,
        question: q,
        outFile: outFile,
        logicalWidth: logicalWidth,
        pixelRatio: pixelRatio,
      );

      if (ok) {
        _pathByHash[hash] = outFile.path;
        ready++;
      }

      // Give the framework breathing room between captures.
      await Future<void>.delayed(Duration.zero);
    }

    onProgress?.call(total, total);
    unawaited(_prune(dir));
    return ready;
  }

  static Future<bool> _capture({
    required OverlayState overlay,
    required QuestionModel question,
    required File outFile,
    required double logicalWidth,
    required double pixelRatio,
  }) async {
    final boundaryKey = GlobalKey();
    OverlayEntry? entry;

    try {
      entry = OverlayEntry(
        builder: (_) => Positioned(
          left: -20000,
          top: 0,
          width: logicalWidth,
          child: Material(
            type: MaterialType.transparency,
            child: RepaintBoundary(
              key: boundaryKey,
              child: Container(
                color: Colors.white,
                padding: const EdgeInsets.all(18),
                child: _questionBody(question),
              ),
            ),
          ),
        ),
      );

      overlay.insert(entry);

      // Two frames guarantee layout + paint of the inserted entry; the
      // small delay lets inline base64 images inside the delta decode.
      await WidgetsBinding.instance.endOfFrame;
      await WidgetsBinding.instance.endOfFrame;
      await Future<void>.delayed(const Duration(milliseconds: 260));

      final renderObject = boundaryKey.currentContext?.findRenderObject();
      if (renderObject is! RenderRepaintBoundary) return false;

      final image = await renderObject.toImage(pixelRatio: pixelRatio);
      final byteData = await image.toByteData(format: ui.ImageByteFormat.png);
      image.dispose();

      if (byteData == null) return false;

      await outFile.writeAsBytes(byteData.buffer.asUint8List(), flush: true);
      return true;
    } catch (_) {
      return false;
    } finally {
      entry?.remove();
    }
  }

  /// Clean, light-styled body used for the captured image so it stays
  /// readable in both light & dark app themes.
  static Widget _questionBody(QuestionModel q) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        RichTextContentView(
          content: q.content,
          fallbackText: q.text,
          style: const TextStyle(
            fontSize: 15,
            fontWeight: FontWeight.w700,
            color: Color(0xFF15202E),
            height: 1.4,
          ),
        ),
        if (q.type == QuestionType.mathFormula &&
            (q.mathFormula?.trim().isNotEmpty ?? false)) ...[
          const SizedBox(height: 14),
          Container(
            width: double.infinity,
            padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 16),
            decoration: BoxDecoration(
              color: const Color(0xFFF2F7FD),
              borderRadius: BorderRadius.circular(12),
            ),
            child: FittedBox(
              fit: BoxFit.scaleDown,
              alignment: Alignment.centerLeft,
              child: Math.tex(
                cleanLatex(q.mathFormula!),
                mathStyle: MathStyle.display,
                textStyle: const TextStyle(
                  fontSize: 17,
                  color: Color(0xFF133E76),
                ),
                onErrorFallback: (_) => Text(
                  q.mathFormula!,
                  maxLines: 4,
                  overflow: TextOverflow.ellipsis,
                  style: const TextStyle(
                    fontSize: 13,
                    fontStyle: FontStyle.italic,
                    color: Color(0xFF133E76),
                  ),
                ),
              ),
            ),
          ),
        ],
        if (q.type == QuestionType.codeInput &&
            (q.codeSnippet?.trim().isNotEmpty ?? false)) ...[
          const SizedBox(height: 14),
          CodeBlockWidget(code: q.codeSnippet!),
        ],
      ],
    );
  }

  /// Keeps only the newest [_maxFiles] images to bound disk usage.
  static Future<void> _prune(Directory dir) async {
    try {
      final files = dir
          .listSync()
          .whereType<File>()
          .where((f) => f.path.endsWith('.png'))
          .toList();

      if (files.length <= _maxFiles) return;

      files.sort((a, b) {
        try {
          return a.lastModifiedSync().compareTo(b.lastModifiedSync());
        } catch (_) {
          return 0;
        }
      });

      for (final f in files.take(files.length - _maxFiles)) {
        try {
          await f.delete();
        } catch (_) {}
      }
    } catch (_) {}
  }
}
