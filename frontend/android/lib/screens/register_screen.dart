import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../app_theme.dart';
import '../providers/auth_provider.dart';
import '../widgets/gradient_button.dart';
import '../widgets/custom_input.dart';
import '../widgets/hidocs_logo.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _emailCtrl = TextEditingController();
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();

  bool _obscure = true;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _usernameCtrl.dispose();
    _passwordCtrl.dispose();
    _otpCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);

    await auth.register(
      _emailCtrl.text.trim(),
      _usernameCtrl.text.trim(),
      _passwordCtrl.text,
    );

    if (!mounted) return;

    if (auth.error != null) {
      _showSnack(auth.error!, AppTheme.error);
      auth.clearError();
      return;
    }

    if (auth.otpSent) {
      _showSnack(
        'Kode OTP telah dikirim ke ${auth.pendingEmail}. Masukkan kode untuk menyelesaikan pendaftaran.',
        AppTheme.success,
      );
    }
  }

  Future<void> _handleVerifyOtp() async {
    final otp = _otpCtrl.text.trim();

    if (otp.length != 6) {
      _showSnack('Masukkan kode OTP 6 digit.', AppTheme.warning);
      return;
    }

    final auth = Provider.of<AuthProvider>(context, listen: false);

    final success = await auth.verifyOtp(otp);

    if (!mounted) return;

    if (auth.error != null) {
      _showSnack(auth.error!, AppTheme.error);
      auth.clearError();
      return;
    }

    if (success) {
      Navigator.pushNamedAndRemoveUntil(
        context,
        '/role-select',
        (route) => false,
      );
    }
  }

  Future<void> _handleResendOtp() async {
    final auth = Provider.of<AuthProvider>(context, listen: false);

    await auth.resendOtp();

    if (!mounted) return;

    if (auth.error != null) {
      _showSnack(auth.error!, AppTheme.warning);
      auth.clearError();
    }
  }

  void _showSnack(String message, Color backgroundColor) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(
              Icons.info_outline_rounded,
              color: Colors.white,
              size: 18,
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                message,
                style: const TextStyle(fontWeight: FontWeight.w500),
              ),
            ),
          ],
        ),
        backgroundColor: backgroundColor,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
        ),
        margin: const EdgeInsets.all(16),
      ),
    );
  }

  Widget _buildOtpStep(AuthProvider auth, bool isDark) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.stretch,
      children: [
        Text(
          'Verify Email',
          style: TextStyle(
            fontSize: 26,
            fontWeight: FontWeight.w800,
            color: isDark ? AppTheme.darkTextPrimary : AppTheme.textPrimary,
            letterSpacing: -0.5,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          'Masukkan kode OTP 6 digit yang dikirim ke email Anda untuk menyelesaikan pendaftaran.',
          style: TextStyle(
            fontSize: 13,
            height: 1.5,
            color: isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
          ),
        ),
        const SizedBox(height: 26),
        CustomInput(
          controller: _otpCtrl,
          label: 'OTP Code',
          hint: '6-digit code',
          prefixIcon: Icons.pin_outlined,
          keyboardType: TextInputType.number,
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(6),
          ],
          validator: (v) {
            if (v == null || v.length != 6) {
              return 'Masukkan 6 digit kode OTP';
            }
            return null;
          },
        ),
        const SizedBox(height: 8),
        Text(
          'Kode berlaku selama 180 detik. Periksa juga folder spam email Anda.',
          style: TextStyle(
            fontSize: 11,
            color: isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
          ),
        ),
        const SizedBox(height: 26),
        GradientButton(
          text: 'Verify & Create Account',
          onPressed: _handleVerifyOtp,
          isLoading: auth.isLoading,
          fullWidth: true,
          icon: Icons.verified_rounded,
        ),
        const SizedBox(height: 12),
        Center(
          child: TextButton(
            onPressed: _handleResendOtp,
            style: TextButton.styleFrom(
              foregroundColor: AppTheme.primary,
            ),
            child: const Text(
              'Resend OTP',
              style: TextStyle(fontWeight: FontWeight.w700),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Center(
          child: GestureDetector(
            onTap: () {
              auth.clearError();
              _otpCtrl.clear();
              Navigator.pop(context);
            },
            child: Text(
              'Back to registration',
              style: TextStyle(
                fontSize: 14,
                color: isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
              ),
            ),
          ),
        ),
      ],
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final size = MediaQuery.of(context).size;
    final bottom = MediaQuery.of(context).viewInsets.bottom;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final showOtp = auth.otpSent;

    return Scaffold(
      resizeToAvoidBottomInset: true,
      backgroundColor: AppTheme.primary,
      body: Stack(
        children: [
          Positioned(
            top: -50,
            right: -60,
            child: _Blob(
              200,
              AppTheme.primaryLight.withValues(alpha: 0.20),
            ),
          ),
          Positioned(
            bottom: 60,
            left: -80,
            child: _Blob(
              220,
              AppTheme.primaryDark.withValues(alpha: 0.40),
            ),
          ),
          Positioned(
            top: 160,
            right: 50,
            child: _Dot(
              7,
              AppTheme.accent.withValues(alpha: 0.80),
            ),
          ),
          Positioned(
            top: 240,
            left: 40,
            child: _Dot(
              4,
              Colors.white.withValues(alpha: 0.25),
            ),
          ),

          SafeArea(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              padding: EdgeInsets.only(
                bottom: bottom + 24,
              ),
              child: ConstrainedBox(
                constraints: BoxConstraints(
                  minHeight: size.height -
                      MediaQuery.of(context).padding.top -
                      MediaQuery.of(context).padding.bottom,
                ),
                child: IntrinsicHeight(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [

                      Padding(
                        padding: const EdgeInsets.fromLTRB(
                          24,
                          20,
                          24,
                          0,
                        ),
                        child: Row(
                          children: [
                            GestureDetector(
                              onTap: () => Navigator.pop(context),
                              child: Container(
                                width: 40,
                                height: 40,
                                decoration: BoxDecoration(
                                  color: Colors.white.withValues(
                                    alpha: 0.12,
                                  ),
                                  borderRadius: BorderRadius.circular(12),
                                  border: Border.all(
                                    color: Colors.white.withValues(
                                      alpha: 0.22,
                                    ),
                                  ),
                                ),
                                child: const Icon(
                                  Icons.arrow_back_ios_new_rounded,
                                  color: Colors.white,
                                  size: 17,
                                ),
                              ),
                            ),
                            const SizedBox(width: 16),
                            Row(
                              children: [
                                HiDocsLogo(
                                  size: 30,
                                  showShadow: false,
                                ),
                                const SizedBox(width: 10),
                                const Text(
                                  'HiDocs!',
                                  style: TextStyle(
                                    fontSize: 22,
                                    fontWeight: FontWeight.w800,
                                    color: Colors.white,
                                    letterSpacing: -0.8,
                                  ),
                                ),
                              ],
                            ),
                          ],
                        ),
                      ),

                      const SizedBox(height: 28),

                      Container(
                        margin: const EdgeInsets.symmetric(
                          horizontal: 20,
                        ),
                        padding: const EdgeInsets.fromLTRB(
                          28,
                          32,
                          28,
                          28,
                        ),
                        decoration: BoxDecoration(
                          color: isDark
                              ? AppTheme.darkCard
                              : Colors.white,
                          borderRadius: BorderRadius.circular(28),
                          border: isDark
                              ? Border.all(
                                  color: AppTheme.darkBorder,
                                )
                              : null,
                          boxShadow: [
                            BoxShadow(
                              color: Colors.black.withValues(
                                alpha: isDark ? 0.30 : 0.18,
                              ),
                              blurRadius: 40,
                              offset: const Offset(0, 12),
                            ),
                          ],
                        ),
                        child: showOtp
                            ? _buildOtpStep(auth, isDark)
                            : Form(
                          key: _formKey,
                          child: Column(
                            crossAxisAlignment:
                                CrossAxisAlignment.stretch,
                            children: [

                              Text(
                                'Create Account',
                                style: TextStyle(
                                  fontSize: 26,
                                  fontWeight: FontWeight.w800,
                                  color: isDark
                                      ? AppTheme.darkTextPrimary
                                      : AppTheme.textPrimary,
                                  letterSpacing: -0.5,
                                ),
                              ),

                              const SizedBox(height: 4),

                              Text(
                                'Sign up to start using HiDocs!',
                                style: TextStyle(
                                  fontSize: 13,
                                  color: isDark
                                      ? AppTheme.darkTextMuted
                                      : AppTheme.textMuted,
                                ),
                              ),

                              const SizedBox(height: 26),

                              CustomInput(
                                controller: _emailCtrl,
                                label: 'Email Address',
                                hint: 'example@hidocs.com',
                                prefixIcon:
                                    Icons.mail_outline_rounded,
                                keyboardType:
                                    TextInputType.emailAddress,
                                validator: (v) {
                                  if (v == null || v.isEmpty) {
                                    return 'Email is required';
                                  }

                                  if (!RegExp(
                                    r'^[^@]+@[^@]+\.[^@]+',
                                  ).hasMatch(v)) {
                                    return 'Invalid email format';
                                  }

                                  return null;
                                },
                              ),

                              const SizedBox(height: 16),

                              CustomInput(
                                controller: _usernameCtrl,
                                label: 'Username',
                                hint: 'Choose a username',
                                prefixIcon:
                                    Icons.badge_outlined,
                                validator: (v) {
                                  if (v == null || v.isEmpty) {
                                    return 'Username is required';
                                  }

                                  if (v.length < 3) {
                                    return 'Minimum 3 characters';
                                  }

                                  return null;
                                },
                              ),

                              const SizedBox(height: 16),

                              CustomInput(
                                controller: _passwordCtrl,
                                label: 'Password',
                                hint: 'Minimum 6 characters',
                                prefixIcon:
                                    Icons.lock_outline_rounded,
                                obscureText: _obscure,
                                suffixIcon: IconButton(
                                  icon: Icon(
                                    _obscure
                                        ? Icons.visibility_off_rounded
                                        : Icons.visibility_rounded,
                                    color: isDark
                                        ? AppTheme.darkTextMuted
                                        : AppTheme.textMuted,
                                    size: 20,
                                  ),
                                  onPressed: () {
                                    setState(() {
                                      _obscure = !_obscure;
                                    });
                                  },
                                ),
                                validator: (v) {
                                  if (v == null || v.isEmpty) {
                                    return 'Password is required';
                                  }

                                  if (v.length < 6) {
                                    return 'Minimum 6 characters';
                                  }

                                  return null;
                                },
                              ),

                              const SizedBox(height: 28),

                              GradientButton(
                                text: 'Create Account',
                                onPressed: _handleRegister,
                                isLoading: auth.isLoading,
                                fullWidth: true,
                                icon: Icons.how_to_reg_rounded,
                              ),

                              const SizedBox(height: 20),

                              Center(
                                child: GestureDetector(
                                  onTap: () =>
                                      Navigator.pop(context),
                                  child: RichText(
                                    text: TextSpan(
                                      style: TextStyle(
                                        fontSize: 14,
                                        color: isDark
                                            ? AppTheme.darkTextMuted
                                            : AppTheme.textMuted,
                                      ),
                                      children: const [
                                        TextSpan(
                                          text:
                                              'Already have an account? ',
                                        ),
                                        TextSpan(
                                          text: 'Sign in',
                                          style: TextStyle(
                                            color:
                                                AppTheme.primary,
                                            fontWeight:
                                                FontWeight.w700,
                                            decoration:
                                                TextDecoration
                                                    .underline,
                                            decorationColor:
                                                AppTheme.primary,
                                          ),
                                        ),
                                      ],
                                    ),
                                  ),
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),

                      const SizedBox(height: 40),
                    ],
                  ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}


class _Blob extends StatelessWidget {
  final double size;
  final Color color;

  const _Blob(this.size, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
      ),
    );
  }
}

class _Dot extends StatelessWidget {
  final double size;
  final Color color;

  const _Dot(this.size, this.color);

  @override
  Widget build(BuildContext context) {
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        shape: BoxShape.circle,
        color: color,
      ),
    );
  }
}