import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_theme.dart';
import '../providers/form_provider.dart';
import '../widgets/custom_button.dart';
import '../widgets/user_form_detail_screen.dart';
import '../l10n/app_localizations.dart';
import 'scan_form_screen.dart';

class LinkInputScreen extends StatefulWidget {
  const LinkInputScreen({super.key});

  @override
  State<LinkInputScreen> createState() => _LinkInputScreenState();
}

class _LinkInputScreenState extends State<LinkInputScreen> {
  final TextEditingController _linkController = TextEditingController();
  final FocusNode _linkFocus = FocusNode();

  bool _isResolving = false;
  bool _hasHandled = false;

  @override
  void dispose() {
    _linkController.dispose();
    _linkFocus.dispose();
    super.dispose();
  }

  Future<void> _resolveLink() async {
    if (_isResolving || _hasHandled) return;

    final raw = _linkController.text.trim();
    _linkFocus.unfocus();

    if (raw.isEmpty) {
      _showMessage(
        'Masukkan link form terlebih dahulu.',
        isError: true,
      );
      return;
    }

    final code = extractFormCode(raw);
    if (code.isEmpty) {
      _showMessage(
        'Link tidak valid. Periksa kembali dan coba lagi.',
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

    if (!form.isActive) {
      _showMessage(
        'Form ini sudah ditutup dan tidak bisa diisi.',
        isError: true,
      );
      return;
    }

    final l10n = AppLocalizations.of(context);

    if (formProvider.hasSubmitted(form.id)) {
      _showMessage(
        l10n.alreadySubmittedForm,
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
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final l10n = AppLocalizations.of(context);

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.enterLink),
      ),
      body: Center(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              Container(
                width: 84,
                height: 84,
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: AppTheme.info.withValues(alpha: 0.10),
                  shape: BoxShape.circle,
                ),
                child: const Icon(
                  Icons.link_rounded,
                  size: 38,
                  color: AppTheme.info,
                ),
              ),
              const SizedBox(height: 20),
              Text(
                l10n.enterFormLinkTitle,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 20,
                  fontWeight: FontWeight.w800,
                  color: isDark ? AppTheme.darkTextPrimary : AppTheme.textPrimary,
                ),
              ),
              const SizedBox(height: 6),
              Text(
                l10n.enterFormLinkDesc,
                textAlign: TextAlign.center,
                style: TextStyle(
                  fontSize: 13,
                  color: isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 28),
              TextField(
                controller: _linkController,
                focusNode: _linkFocus,
                keyboardType: TextInputType.url,
                textInputAction: TextInputAction.go,
                onSubmitted: (_) => _resolveLink(),
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
                      color: isDark ? AppTheme.darkBorder : AppTheme.border,
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
              const SizedBox(height: 16),
              SizedBox(
                height: 52,
                child: CustomButton(
                  text: l10n.openForm,
                  icon: Icons.arrow_forward_rounded,
                  isLoading: _isResolving,
                  onPressed: _resolveLink,
                  height: 52,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}