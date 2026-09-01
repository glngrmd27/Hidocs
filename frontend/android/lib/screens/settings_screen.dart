import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/theme_provider.dart';
import '../providers/language_provider.dart';
import '../widgets/gradient_button.dart';
import '../l10n/app_localizations.dart';
import 'about_screen.dart';

class SettingsScreen extends StatefulWidget {
  final bool isCreatorMode;

  const SettingsScreen({
    super.key,
    this.isCreatorMode = false,
  });

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final themeProvider = Provider.of<ThemeProvider>(context);
    final languageProvider = Provider.of<LanguageProvider>(context);
    final l10n = AppLocalizations.of(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final user = auth.currentUser;

    if (user == null) {
      return const Scaffold(
        body: Center(
          child: CircularProgressIndicator(),
        ),
      );
    }

    return Scaffold(
      appBar: AppBar(
        title: Text(l10n.profile),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(20, 20, 20, 40),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: isDark
                      ? [
                          AppTheme.darkCard,
                          AppTheme.darkSurface,
                        ]
                      : [
                          AppTheme.primaryFaint,
                          Colors.white,
                        ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(22),
                border: Border.all(
                  color: isDark
                      ? AppTheme.darkBorder
                      : AppTheme.primary.withValues(alpha: 0.15),
                ),
                boxShadow: isDark
                    ? null
                    : [
                        BoxShadow(
                          color: AppTheme.primary.withValues(alpha: 0.06),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
              ),
              child: Row(
                children: [
                  Container(
                    width: 58,
                    height: 58,
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: (auth.isAdmin || auth.isSuperAdmin)
                            ? [
                                AppTheme.warning,
                                const Color(0xFFE5890A),
                              ]
                            : [
                                AppTheme.primary,
                                AppTheme.primaryLight,
                              ],
                      ),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: (auth.isAdmin || auth.isSuperAdmin
                                  ? AppTheme.warning
                                  : AppTheme.primary)
                              .withValues(alpha: 0.25),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Center(
                      child: Text(
                        user.name.isEmpty
                            ? '?'
                            : user.name.substring(0, 1).toUpperCase(),
                        style: const TextStyle(
                          color: Colors.white,
                          fontWeight: FontWeight.w900,
                          fontSize: 26,
                        ),
                      ),
                    ),
                  ),
                  const SizedBox(width: 16),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          user.name,
                          style: TextStyle(
                            fontSize: 17,
                            fontWeight: FontWeight.w700,
                            color: isDark
                                ? AppTheme.darkTextPrimary
                                : AppTheme.textPrimary,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          user.email,
                          style: const TextStyle(
                            fontSize: 13,
                            color: AppTheme.textMuted,
                          ),
                        ),
                        if (user.phoneNumber != null &&
                            user.phoneNumber!.isNotEmpty) ...[
                          const SizedBox(height: 2),
                          Row(
                            children: [
                              const Icon(
                                Icons.phone_rounded,
                                size: 12,
                                color: AppTheme.textMuted,
                              ),
                              const SizedBox(width: 4),
                              Text(
                                user.phoneNumber!,
                                style: const TextStyle(
                                  fontSize: 12,
                                  color: AppTheme.textMuted,
                                ),
                              ),
                            ],
                          ),
                        ],
                        const SizedBox(height: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: (auth.isAdmin || auth.isSuperAdmin)
                                ? AppTheme.warning.withValues(alpha: 0.12)
                                : AppTheme.primary.withValues(alpha: 0.10),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Text(
                            auth.isSuperAdmin
                                ? 'SUPER ADMIN'
                                : auth.isAdmin
                                    ? 'ADMINISTRATOR'
                                    : 'USER',
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 0.8,
                              color: (auth.isAdmin || auth.isSuperAdmin)
                                  ? AppTheme.warning
                                  : AppTheme.primary,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 12),
                  GestureDetector(
                    onTap: () {
                      _showEditProfileDialog(
                        context,
                        auth,
                        user.name,
                        user.email,
                      );
                    },
                    child: Container(
                      width: 38,
                      height: 38,
                      decoration: BoxDecoration(
                        color: isDark ? AppTheme.darkBorder : AppTheme.border,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Icon(
                        Icons.edit_outlined,
                        size: 18,
                        color: isDark
                            ? AppTheme.darkTextMuted
                            : AppTheme.textMuted,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),
            _SettingsTile(
              icon: Icons.lock_reset_rounded,
              iconColor: AppTheme.warning,
              title: l10n.isIndonesian ? 'Ganti Password' : 'Change Password',
              subtitle: l10n.isIndonesian ? 'Verifikasi password lama' : 'Verify old password',
              onTap: () => _showChangePasswordDialog(context, auth),
              trailing: const Icon(Icons.chevron_right_rounded, size: 20, color: AppTheme.textMuted),
            ),
            const SizedBox(height: 8),
            _SettingsTile(
              icon: widget.isCreatorMode
                  ? Icons.person_rounded
                  : Icons.dashboard_customize_rounded,
              iconColor:
                  widget.isCreatorMode ? AppTheme.info : AppTheme.success,
              title: widget.isCreatorMode ? l10n.modeUser : l10n.modeCreator,
              subtitle: widget.isCreatorMode
                  ? l10n.modeUserDesc
                  : l10n.modeCreatorDesc,
              onTap: () {
                Navigator.pushNamedAndRemoveUntil(
                  context,
                  widget.isCreatorMode ? '/user-home' : '/creator-home',
                  (_) => false,
                );
              },
              trailing: const Icon(
                Icons.chevron_right_rounded,
                size: 20,
                color: AppTheme.textMuted,
              ),
            ),
            const SizedBox(height: 24),
            _SettingsTile(
              icon: isDark ? Icons.dark_mode_rounded : Icons.light_mode_rounded,
              iconColor: isDark ? const Color(0xFF4A90D9) : AppTheme.warning,
              title: isDark ? l10n.darkMode : l10n.lightMode,
              subtitle: l10n.switchTheme,
              trailing: Switch.adaptive(
                value: themeProvider.isDarkMode,
                onChanged: (_) {
                  themeProvider.toggleTheme();
                },
                activeThumbColor: AppTheme.primary,
              ),
            ),
            _SettingsTile(
              icon: Icons.language_rounded,
              iconColor: AppTheme.primary,
              title: l10n.language,
              subtitle: l10n.languageDescription,
              trailing: Container(
                padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
                decoration: BoxDecoration(
                  color: isDark 
                      ? AppTheme.darkBorder.withValues(alpha: 0.5)
                      : AppTheme.border.withValues(alpha: 0.5),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: DropdownButtonHideUnderline(
                  child: DropdownButton<String>(
                    value: languageProvider.locale.languageCode,
                    icon: const Icon(Icons.expand_more_rounded, size: 18),
                    isDense: true,
                    style: TextStyle(
                      fontSize: 14,
                      fontWeight: FontWeight.w600,
                      color: isDark ? AppTheme.darkTextPrimary : AppTheme.textPrimary,
                    ),
                    dropdownColor: isDark ? AppTheme.darkCard : Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    items: const [
                      DropdownMenuItem(
                        value: 'id',
                        child: Text(
                          'ID',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                        ),
                      ),
                      DropdownMenuItem(
                        value: 'en',
                        child: Text(
                          'EN',
                          style: TextStyle(fontSize: 14, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                    onChanged: (languageCode) {
                      if (languageCode != null) {
                        languageProvider.setLanguage(languageCode);
                      }
                    },
                  ),
                ),
              ),
            ),
            _SettingsTile(
              icon: Icons.info_outline_rounded,
              iconColor: AppTheme.info,
              title: l10n.aboutHidocs,
              subtitle: '',
              onTap: () {
                Navigator.push(
                  context,
                  MaterialPageRoute(
                    builder: (_) =>
                        AboutScreen(isCreatorMode: widget.isCreatorMode),
                  ),
                );
              },
              trailing: const Icon(
                Icons.chevron_right_rounded,
                size: 20,
                color: AppTheme.textMuted,
              ),
            ),
            const SizedBox(height: 24),
            GradientButton(
              text: l10n.signOut,
              onPressed: () async {
                final nav = Navigator.of(context);

                nav.pushNamedAndRemoveUntil(
                  '/login',
                  (_) => false,
                );

                await auth.logout();
              },
              fullWidth: true,
              icon: Icons.logout_rounded,
              colors: const [
                AppTheme.error,
                Color(0xFFB71C1C),
              ],
            ),
          ],
        ),
      ),
    );
  }

  void _showEditProfileDialog(
    BuildContext context,
    AuthProvider auth,
    String currentName,
    String currentEmail,
  ) {
    final messenger = ScaffoldMessenger.of(context);
    final l10n = AppLocalizations.of(context);
    final formKey = GlobalKey<FormState>();

    final nameController = TextEditingController(text: currentName);
    final emailController = TextEditingController(text: currentEmail);

    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          title: Text(l10n.editProfile),
          content: SingleChildScrollView(
            child: Form(
              key: formKey,
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: nameController,
                    decoration: InputDecoration(
                      labelText: l10n.isIndonesian ? 'Nama Pengguna' : 'Username',
                      prefixIcon: const Icon(Icons.person_outline_rounded),
                    ),
                    validator: (v) {
                      if (v == null || v.trim().isEmpty) {
                        return l10n.isIndonesian ? 'Nama pengguna wajib diisi' : 'Username is required';
                      }
                      return null;
                    },
                  ),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: emailController,
                    readOnly: true,
                    keyboardType: TextInputType.emailAddress,
                    decoration: InputDecoration(
                      labelText: 'Email',
                      prefixIcon: const Icon(Icons.email_outlined),
                      helperText: l10n.isIndonesian ? 'Email tidak dapat diubah' : 'Email cannot be changed',
                    ),
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () {
                Navigator.pop(dialogContext);
              },
              child: Text(l10n.cancel),
            ),
            ElevatedButton(
              onPressed: () async {
                if (!formKey.currentState!.validate()) {
                  return;
                }

                final name = nameController.text.trim();
                final email = emailController.text.trim();

                await auth.updateProfile(
                  name: name,
                  email: email,
                );

                if (dialogContext.mounted) {
                  Navigator.pop(dialogContext);
                }

                messenger.showSnackBar(
                  SnackBar(
                    content: Text(
                      auth.error != null
                          ? auth.error!
                          : (l10n.isIndonesian ? 'Profil berhasil diperbarui' : 'Profile updated successfully'),
                    ),
                    backgroundColor:
                        auth.error != null ? AppTheme.error : null,
                  ),
                );

                auth.clearError();
              },
              child: Text(l10n.save),
            ),
          ],
        );
      },
    );
  }

  void _showChangePasswordDialog(BuildContext context, AuthProvider auth) {
    final isIndonesian = AppLocalizations.of(context).isIndonesian;
    final l10n = AppLocalizations.of(context);
    final oldController = TextEditingController();
    final newController = TextEditingController();
    final confirmController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool obscureOld = true;
    bool obscureNew = true;
    String? dialogError;
    showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(builder: (ctx, setState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Row(children: [const Icon(Icons.lock_reset_rounded, color: AppTheme.warning), const SizedBox(width: 8), Text(isIndonesian ? 'Ganti Password' : 'Change Password')]),
            content: Form(
              key: formKey,
              child: SingleChildScrollView(
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  Text(isIndonesian ? 'Masukkan password lama untuk verifikasi, lalu password baru.' : 'Enter old password to verify, then new password.', style: const TextStyle(fontSize: 13, height: 1.4)),
                  const SizedBox(height: 16),
                  if (dialogError != null) ...[
                    Container(
                      width: double.infinity,
                      padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 10),
                      decoration: BoxDecoration(color: AppTheme.error.withValues(alpha: 0.10), borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.error.withValues(alpha: 0.25))),
                      child: Row(children: [const Icon(Icons.error_outline_rounded, size: 16, color: AppTheme.error), const SizedBox(width: 8), Expanded(child: Text(dialogError!, style: const TextStyle(fontSize: 12, color: AppTheme.error, fontWeight: FontWeight.w600)))]),
                    ),
                    const SizedBox(height: 12),
                  ],
                  TextFormField(
                    controller: oldController,
                    obscureText: obscureOld,
                    decoration: InputDecoration(labelText: isIndonesian ? 'Password Lama' : 'Old Password', prefixIcon: const Icon(Icons.lock_outline_rounded), suffixIcon: IconButton(icon: Icon(obscureOld ? Icons.visibility_off_rounded : Icons.visibility_rounded), onPressed: () => setState(() => obscureOld = !obscureOld)), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                    validator: (v) => (v == null || v.isEmpty) ? (isIndonesian ? 'Wajib diisi' : 'Required') : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: newController,
                    obscureText: obscureNew,
                    decoration: InputDecoration(labelText: isIndonesian ? 'Password Baru' : 'New Password', prefixIcon: const Icon(Icons.lock_rounded), suffixIcon: IconButton(icon: Icon(obscureNew ? Icons.visibility_off_rounded : Icons.visibility_rounded), onPressed: () => setState(() => obscureNew = !obscureNew)), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                    validator: (v) {
                      if (v == null || v.isEmpty) return isIndonesian ? 'Wajib diisi' : 'Required';
                      if (v.length < 6) return isIndonesian ? 'Minimal 6 karakter' : 'Min 6 characters';
                      if (v == oldController.text) return isIndonesian ? 'Password baru harus beda' : 'New password must differ';
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: confirmController,
                    obscureText: obscureNew,
                    decoration: InputDecoration(labelText: isIndonesian ? 'Konfirmasi Password Baru' : 'Confirm New Password', prefixIcon: const Icon(Icons.check_circle_outline_rounded), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                    validator: (v) => v != newController.text ? (isIndonesian ? 'Tidak cocok' : 'Not match') : null,
                  ),
                ]),
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dialogContext), child: Text(l10n.cancel)),
              ElevatedButton(
                onPressed: () async {
                  if (!formKey.currentState!.validate()) return;
                  final ok = await auth.changePassword(oldPassword: oldController.text, newPassword: newController.text);
                  if (!dialogContext.mounted) return;
                  if (ok) {
                    Navigator.pop(dialogContext);
                    if (context.mounted) {
                      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(isIndonesian ? 'Password berhasil diganti' : 'Password changed successfully'), backgroundColor: AppTheme.success, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), margin: const EdgeInsets.all(16)));
                    }
                  } else {
                    setState(() {
                      dialogError = auth.error ?? (isIndonesian ? 'Gagal ganti password. Periksa password lama.' : 'Failed to change password. Check old password.');
                    });
                    auth.clearError();
                  }
                },
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.warning, foregroundColor: Colors.white),
                child: Text(isIndonesian ? 'Simpan' : 'Save'),
              ),
            ],
          );
        });
      },
    );
  }

  // ignore: unused_element
  void _showForgotPasswordDialog(BuildContext context, AuthProvider auth) {
    final l10n = AppLocalizations.of(context);
    final isIndonesian = l10n.isIndonesian;
    final emailController = TextEditingController(text: auth.currentUser?.email ?? '');
    final formKey = GlobalKey<FormState>();
    showDialog(
      context: context,
      builder: (dialogContext) {
        return AlertDialog(
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
          title: Row(children: [const Icon(Icons.lock_reset_rounded, color: AppTheme.warning), const SizedBox(width: 8), Text(isIndonesian ? 'Lupa Password' : 'Forgot Password')]),
          content: Form(
            key: formKey,
            child: Column(mainAxisSize: MainAxisSize.min, crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(isIndonesian ? 'Masukkan email Anda. Kami akan mengirim token reset ke email tersebut.' : 'Enter your email. We will send a reset token to that email.', style: const TextStyle(fontSize: 13, height: 1.4)),
              const SizedBox(height: 16),
              TextFormField(
                controller: emailController,
                keyboardType: TextInputType.emailAddress,
                decoration: InputDecoration(labelText: 'Email', prefixIcon: const Icon(Icons.email_outlined), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                validator: (v) {
                  if (v == null || v.trim().isEmpty) return isIndonesian ? 'Email wajib diisi' : 'Email is required';
                  if (!RegExp(r'^[^@]+@[^@]+\.[^@]+').hasMatch(v.trim())) return isIndonesian ? 'Format email tidak valid' : 'Invalid email format';
                  return null;
                },
              ),
            ]),
          ),
          actions: [
            TextButton(onPressed: () => Navigator.pop(dialogContext), child: Text(l10n.cancel)),
            ElevatedButton(
              onPressed: () async {
                if (!formKey.currentState!.validate()) return;
                final email = emailController.text.trim();
                final token = await auth.forgotPassword(email);
                if (!dialogContext.mounted) return;
                if (token != null) {
                  Navigator.pop(dialogContext);
                  if (token.isNotEmpty) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Column(crossAxisAlignment: CrossAxisAlignment.start, mainAxisSize: MainAxisSize.min, children: [
                        Text(isIndonesian ? 'Token (salin & tempel di step berikut):' : 'Token (copy & paste in next step):', style: const TextStyle(fontWeight: FontWeight.w700, color: Colors.white, fontSize: 12)),
                        const SizedBox(height: 4),
                        SelectableText(token, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 12)),
                        const SizedBox(height: 2),
                        Text(isIndonesian ? 'Email belum terkonfigurasi di server, token ditampilkan di sini.' : 'Email not configured on server, token shown here.', style: const TextStyle(color: Colors.white70, fontSize: 11)),
                      ]),
                      backgroundColor: AppTheme.success,
                      behavior: SnackBarBehavior.floating,
                      duration: const Duration(seconds: 8),
                      shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                      margin: const EdgeInsets.all(16),
                    ));
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(isIndonesian ? 'Token reset telah dikirim ke $email. Cek email Anda.' : 'Reset token sent to $email. Check your email.'), backgroundColor: AppTheme.success, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), margin: const EdgeInsets.all(16)));
                  }
                  _showResetPasswordDialog(context, auth, email, initialToken: token);
                } else {
                  ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(auth.error ?? (isIndonesian ? 'Gagal mengirim token' : 'Failed to send token')), backgroundColor: AppTheme.error, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), margin: const EdgeInsets.all(16)));
                  auth.clearError();
                }
              },
              style: ElevatedButton.styleFrom(backgroundColor: AppTheme.warning, foregroundColor: Colors.white),
              child: Text(isIndonesian ? 'Kirim Token' : 'Send Token'),
            ),
          ],
        );
      },
    );
  }

  // ignore: unused_element
  void _showResetPasswordDialog(BuildContext context, AuthProvider auth, String emailHint, {String? initialToken}) {
    final l10n = AppLocalizations.of(context);
    final isIndonesian = l10n.isIndonesian;
    final tokenController = TextEditingController(text: initialToken ?? '');
    final passController = TextEditingController();
    final confirmController = TextEditingController();
    final formKey = GlobalKey<FormState>();
    bool obscure = true;
    showDialog(
      context: context,
      builder: (dialogContext) {
        return StatefulBuilder(builder: (ctx, setState) {
          return AlertDialog(
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
            title: Row(children: [const Icon(Icons.key_rounded, color: AppTheme.primary), const SizedBox(width: 8), Text(isIndonesian ? 'Reset Password' : 'Reset Password')]),
            content: Form(
              key: formKey,
              child: SingleChildScrollView(
                child: Column(mainAxisSize: MainAxisSize.min, children: [
                  Container(padding: const EdgeInsets.all(10), decoration: BoxDecoration(color: AppTheme.info.withValues(alpha: 0.08), borderRadius: BorderRadius.circular(10), border: Border.all(color: AppTheme.info.withValues(alpha: 0.15))), child: Row(children: [const Icon(Icons.info_outline_rounded, size: 16, color: AppTheme.info), const SizedBox(width: 8), Expanded(child: Text(isIndonesian ? 'Token dikirim ke $emailHint. Masukkan token dan password baru.' : 'Token sent to $emailHint. Enter token and new password.', style: const TextStyle(fontSize: 12, height: 1.4)))])),
                  const SizedBox(height: 16),
                  TextFormField(
                    controller: tokenController,
                    decoration: InputDecoration(labelText: isIndonesian ? 'Token Reset' : 'Reset Token', prefixIcon: const Icon(Icons.confirmation_number_outlined), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)), helperText: isIndonesian ? 'Cek email/spam' : 'Check email/spam'),
                    validator: (v) => (v == null || v.trim().isEmpty) ? (isIndonesian ? 'Token wajib diisi' : 'Token is required') : null,
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: passController,
                    obscureText: obscure,
                    decoration: InputDecoration(labelText: isIndonesian ? 'Password Baru' : 'New Password', prefixIcon: const Icon(Icons.lock_outline_rounded), suffixIcon: IconButton(icon: Icon(obscure ? Icons.visibility_off_rounded : Icons.visibility_rounded), onPressed: () => setState(() => obscure = !obscure)), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                    validator: (v) {
                      if (v == null || v.isEmpty) return isIndonesian ? 'Password wajib diisi' : 'Password is required';
                      if (v.length < 6) return isIndonesian ? 'Minimal 6 karakter' : 'Min 6 characters';
                      return null;
                    },
                  ),
                  const SizedBox(height: 12),
                  TextFormField(
                    controller: confirmController,
                    obscureText: obscure,
                    decoration: InputDecoration(labelText: isIndonesian ? 'Konfirmasi Password' : 'Confirm Password', prefixIcon: const Icon(Icons.lock_rounded), border: OutlineInputBorder(borderRadius: BorderRadius.circular(12))),
                    validator: (v) {
                      if (v != passController.text) return isIndonesian ? 'Password tidak cocok' : 'Passwords do not match';
                      return null;
                    },
                  ),
                ]),
              ),
            ),
            actions: [
              TextButton(onPressed: () => Navigator.pop(dialogContext), child: Text(l10n.cancel)),
              ElevatedButton(
                onPressed: () async {
                  if (!formKey.currentState!.validate()) return;
                  final ok = await auth.resetPassword(tokenController.text.trim(), passController.text);
                  if (!dialogContext.mounted) return;
                  if (ok) {
                    Navigator.pop(dialogContext);
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(isIndonesian ? 'Password berhasil direset. Silakan login dengan password baru.' : 'Password reset successful. Please login with new password.'), backgroundColor: AppTheme.success, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), margin: const EdgeInsets.all(16)));
                  } else {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text(auth.error ?? (isIndonesian ? 'Gagal reset password' : 'Failed to reset password')), backgroundColor: AppTheme.error, behavior: SnackBarBehavior.floating, shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)), margin: const EdgeInsets.all(16)));
                    auth.clearError();
                  }
                },
                style: ElevatedButton.styleFrom(backgroundColor: AppTheme.primary, foregroundColor: Colors.white),
                child: Text(isIndonesian ? 'Reset Password' : 'Reset Password'),
              ),
            ],
          );
        });
      },
    );
  }
}

class _SettingsTile extends StatelessWidget {
  final IconData icon;
  final Color iconColor;
  final String title;
  final String subtitle;
  final Widget trailing;
  final VoidCallback? onTap;

  const _SettingsTile({
    required this.icon,
    required this.iconColor,
    required this.title,
    required this.subtitle,
    required this.trailing,
    this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : AppTheme.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isDark ? AppTheme.darkBorder : AppTheme.border,
        ),
      ),
      child: ListTile(
        onTap: onTap,
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
            color: isDark ? AppTheme.darkTextPrimary : AppTheme.textPrimary,
          ),
        ),
        subtitle: subtitle.isNotEmpty
            ? Text(
                subtitle,
                style: const TextStyle(
                  fontSize: 12,
                  color: AppTheme.textMuted,
                ),
              )
            : null,
        trailing: trailing,
      ),
    );
  }
}
