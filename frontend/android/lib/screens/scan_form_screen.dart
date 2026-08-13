import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:provider/provider.dart';

import '../app_theme.dart';
import '../providers/form_provider.dart';
import '../widgets/user_form_detail_screen.dart';

class ScanFormScreen extends StatefulWidget {
  const ScanFormScreen({super.key});

  @override
  State<ScanFormScreen> createState() => _ScanFormScreenState();
}

class _ScanFormScreenState extends State<ScanFormScreen> {
  final MobileScannerController _scannerController = MobileScannerController(
    formats: BarcodeFormat.values,
  );
  final TextEditingController _linkController = TextEditingController();
  final FocusNode _linkFocus = FocusNode();

  bool _isResolving = false;
  bool _hasHandled = false;
  bool _torchEnabled = false;

  @override
  void dispose() {
    _scannerController.dispose();
    _linkController.dispose();
    _linkFocus.dispose();
    super.dispose();
  }

  Future<void> _resolveCode(String raw) async {
    if (_isResolving || _hasHandled) return;

    final code = extractFormCode(raw);
    if (code.isEmpty) {
      _showMessage(
        'Barcode / link tidak valid. Periksa kembali dan coba lagi.',
        isError: true,
      );
      return;
    }

    setState(() {
      _isResolving = true;
    });

    final formProvider = context.read<FormProvider>();
    final form = await formProvider.loadPublicForm(code);

    if (!mounted) return;

    setState(() {
      _isResolving = false;
    });

    if (form == null) {
      _showMessage(
        formProvider.error ?? 'Form tidak ditemukan.',
        isError: true,
      );
      return;
    }

    if (formProvider.hasSubmitted(form.id)) {
      _showMessage(
        "You've already submitted this form",
        isError: false,
      );
      return;
    }

    _hasHandled = true;

    await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => UserFormDetailScreen(form: form),
      ),
    );

    _hasHandled = false;
  }

  void _handleLinkSubmit() {
    final raw = _linkController.text;
    _linkFocus.unfocus();
    _resolveCode(raw);
  }

  void _showMessage(String message, {required bool isError}) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            Icon(
              isError
                  ? Icons.error_outline_rounded
                  : Icons.info_rounded,
              color: Colors.white,
              size: 16,
            ),
            const SizedBox(width: 8),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ),
          ],
        ),
        backgroundColor: isError ? AppTheme.error : AppTheme.warning,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Scan or Enter Link'),
      ),
      body: Column(
        children: [
          Expanded(
            child: Stack(
              children: [
                MobileScanner(
                  controller: _scannerController,
                  onDetect: (capture) {
                    final code = capture.barcodes.isNotEmpty
                        ? capture.barcodes.first.rawValue ?? ''
                        : '';
                    if (code.isNotEmpty) {
                      _resolveCode(code);
                    }
                  },
                ),
                const _ScannerOverlay(),
                SafeArea(
                  child: Align(
                    alignment: Alignment.topCenter,
                    child: Padding(
                      padding: const EdgeInsets.only(top: 16),
                      child: _ScannerHintCard(),
                    ),
                  ),
                ),
                SafeArea(
                  child: Align(
                    alignment: Alignment.bottomRight,
                    child: Padding(
                      padding: const EdgeInsets.all(16),
                      child: _RoundIconButton(
                        icon: _torchEnabled
                            ? Icons.flash_on_rounded
                            : Icons.flash_off_rounded,
                        onPressed: () async {
                          await _scannerController.toggleTorch();
                          setState(() {
                            _torchEnabled = !_torchEnabled;
                          });
                        },
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),
          _LinkInputPanel(
            controller: _linkController,
            focusNode: _linkFocus,
            isResolving: _isResolving,
            onSubmit: _handleLinkSubmit,
          ),
        ],
      ),
    );
  }
}

String extractFormCode(String input) {
  final raw = input.trim().replaceAll('"', '').trim();
  if (raw.isEmpty) return '';

  var uri = Uri.tryParse(raw);
  if (uri != null && !uri.hasScheme) {
    uri = Uri.tryParse('https://$raw');
  }

  if (uri != null && uri.hasAuthority) {
    final segments =
        uri.pathSegments.where((s) => s.isNotEmpty).toList();
    if (segments.isNotEmpty) {
      return Uri.decodeComponent(segments.last);
    }
  }

  return raw;
}

class _ScannerOverlay extends StatelessWidget {
  const _ScannerOverlay();

  @override
  Widget build(BuildContext context) {
    return IgnorePointer(
      child: CustomPaint(
        size: Size.infinite,
        painter: _ScannerOverlayPainter(),
      ),
    );
  }
}

class _ScannerOverlayPainter extends CustomPainter {
  @override
  void paint(Canvas canvas, Size size) {
    final overlayPaint = Paint()..color = Colors.black54;
    final side = size.shortestSide * 0.62;
    final frame = Rect.fromCenter(
      center: size.center(const Offset(0, -20)),
      width: side,
      height: side,
    );

    canvas.drawPath(
      Path.combine(
        PathOperation.difference,
        Path()..addRect(Rect.fromLTWH(0, 0, size.width, size.height)),
        Path()..addRRect(
          RRect.fromRectAndRadius(
            frame,
            const Radius.circular(24),
          ),
        ),
      ),
      overlayPaint,
    );

    final cornerPaint = Paint()
      ..color = Colors.white
      ..style = PaintingStyle.stroke
      ..strokeWidth = 4
      ..strokeCap = StrokeCap.round;

    const cornerLength = 26.0;
    final path = Path()
      // top-left
      ..moveTo(frame.left, frame.top + cornerLength)
      ..lineTo(frame.left, frame.top)
      ..lineTo(frame.left + cornerLength, frame.top)
      // top-right
      ..moveTo(frame.right - cornerLength, frame.top)
      ..lineTo(frame.right, frame.top)
      ..lineTo(frame.right, frame.top + cornerLength)
      // bottom-right
      ..moveTo(frame.right, frame.bottom - cornerLength)
      ..lineTo(frame.right, frame.bottom)
      ..lineTo(frame.right - cornerLength, frame.bottom)
      // bottom-left
      ..moveTo(frame.left + cornerLength, frame.bottom)
      ..lineTo(frame.left, frame.bottom)
      ..lineTo(frame.left, frame.bottom - cornerLength);

    canvas.drawPath(path, cornerPaint);
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => false;
}

class _ScannerHintCard extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.symmetric(horizontal: 32),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 10),
      decoration: BoxDecoration(
        color: Colors.black.withValues(alpha: 0.45),
        borderRadius: BorderRadius.circular(30),
      ),
      child: const Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Icon(Icons.qr_code_scanner_rounded, size: 18, color: Colors.white),
          SizedBox(width: 8),
          Flexible(
            child: Text(
              'Arahkan kamera ke barcode / QR code form',
              style: TextStyle(fontSize: 12, color: Colors.white),
            ),
          ),
        ],
      ),
    );
  }
}

class _RoundIconButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;

  const _RoundIconButton({
    required this.icon,
    required this.onPressed,
  });

  @override
  Widget build(BuildContext context) {
    return Material(
      color: Colors.black.withValues(alpha: 0.45),
      shape: const CircleBorder(),
      child: IconButton(
        onPressed: onPressed,
        icon: Icon(icon, color: Colors.white),
      ),
    );
  }
}

class _LinkInputPanel extends StatelessWidget {
  final TextEditingController controller;
  final FocusNode focusNode;
  final bool isResolving;
  final VoidCallback onSubmit;

  const _LinkInputPanel({
    required this.controller,
    required this.focusNode,
    required this.isResolving,
    required this.onSubmit,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : AppTheme.surfaceCard,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
        border: Border(
          top: BorderSide(
            color: isDark ? AppTheme.darkBorder : AppTheme.border,
          ),
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(
              alpha: isDark ? 0.30 : 0.06,
            ),
            blurRadius: 20,
            offset: const Offset(0, -4),
          ),
        ],
      ),
      child: SafeArea(
        top: false,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 28,
                height: 3,
                decoration: BoxDecoration(
                  color: isDark ? AppTheme.darkBorder : AppTheme.border,
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
            ),
            const SizedBox(height: 14),
            Row(
              children: [
                const Icon(Icons.link_rounded, size: 18, color: AppTheme.info),
                const SizedBox(width: 8),
                Text(
                  'Atau masukkan link form',
                  style: TextStyle(
                    fontSize: 13,
                    fontWeight: FontWeight.w700,
                    color: isDark
                        ? AppTheme.darkTextPrimary
                        : AppTheme.textPrimary,
                  ),
                ),
              ],
            ),
            const SizedBox(height: 12),
            Row(
              children: [
                Expanded(
                  child: TextField(
                    controller: controller,
                    focusNode: focusNode,
                    keyboardType: TextInputType.url,
                    textInputAction: TextInputAction.go,
                    onSubmitted: (_) => onSubmit(),
                    decoration: InputDecoration(
                      hintText: 'hidocs.app/f/<slug> atau URL lengkap',
                      hintStyle: TextStyle(
                        fontSize: 13,
                        color: isDark
                            ? AppTheme.darkTextSecondary
                            : AppTheme.textMuted,
                      ),
                      prefixIcon: const Icon(
                        Icons.qr_code_2_rounded,
                        size: 20,
                      ),
                      filled: true,
                      fillColor: isDark
                          ? AppTheme.darkSurface
                          : AppTheme.surfaceCard,
                      contentPadding: const EdgeInsets.symmetric(
                        horizontal: 16,
                        vertical: 14,
                      ),
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide.none,
                      ),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: BorderSide(
                          color: isDark
                              ? AppTheme.darkBorder
                              : AppTheme.border,
                        ),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(14),
                        borderSide: const BorderSide(
                          color: AppTheme.primary,
                          width: 1.5,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 10),
                SizedBox(
                  height: 50,
                  child: ElevatedButton(
                    onPressed: isResolving ? null : onSubmit,
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppTheme.primary,
                      foregroundColor: Colors.white,
                      elevation: 0,
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(14),
                      ),
                    ),
                    child: isResolving
                        ? const SizedBox(
                            width: 20,
                            height: 20,
                            child: CircularProgressIndicator(
                              strokeWidth: 2.5,
                              color: Colors.white,
                            ),
                          )
                        : const Icon(Icons.arrow_forward_rounded),
                  ),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
