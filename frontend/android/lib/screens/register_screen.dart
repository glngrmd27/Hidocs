import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_theme.dart';
import '../providers/auth_provider.dart';
import '../models/user_model.dart';
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
  final _formKey = GlobalKey<FormState>();

  bool _obscure = true;
  UserRole _role = UserRole.user;

  @override
  void dispose() {
    _emailCtrl.dispose();
    _usernameCtrl.dispose();
    _passwordCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleRegister() async {
    if (!_formKey.currentState!.validate()) return;

    final auth = Provider.of<AuthProvider>(context, listen: false);

    await auth.register(
      _emailCtrl.text.trim(),
      _usernameCtrl.text.trim(),
      _passwordCtrl.text,
      _role,
    );

    if (!mounted) return;

    if (auth.error != null) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Row(
            children: [
              const Icon(
                Icons.error_outline_rounded,
                color: Colors.white,
                size: 18,
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Text(
                  auth.error!,
                  style: const TextStyle(
                    fontWeight: FontWeight.w500,
                  ),
                ),
              ),
            ],
          ),
          backgroundColor: AppTheme.error,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          margin: const EdgeInsets.all(16),
        ),
      );

      auth.clearError();
    }
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final size = MediaQuery.of(context).size;
    final bottom = MediaQuery.of(context).viewInsets.bottom;
    final isDark = Theme.of(context).brightness == Brightness.dark;

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
                        child: Form(
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

                              const SizedBox(height: 20),

                              Text(
                                'Role',
                                style: TextStyle(
                                  fontSize: 13,
                                  fontWeight: FontWeight.w600,
                                  color: isDark
                                      ? AppTheme.darkTextPrimary
                                      : AppTheme.textSecondary,
                                ),
                              ),

                              const SizedBox(height: 8),

                              Container(
                                decoration: BoxDecoration(
                                  color: isDark
                                      ? AppTheme.darkSurface
                                      : AppTheme.surfaceCard,
                                  borderRadius:
                                      BorderRadius.circular(14),
                                  border: Border.all(
                                    color: isDark
                                        ? AppTheme.darkBorder
                                        : AppTheme.border,
                                  ),
                                ),
                                child:
                                    DropdownButtonHideUnderline(
                                  child: ButtonTheme(
                                    alignedDropdown: true,
                                    child:
                                        DropdownButton<UserRole>(
                                      value: _role,
                                      isExpanded: true,
                                      borderRadius:
                                          BorderRadius.circular(14),
                                      dropdownColor: isDark
                                          ? AppTheme.darkCard
                                          : Colors.white,
                                      padding:
                                          const EdgeInsets.symmetric(
                                        horizontal: 6,
                                        vertical: 4,
                                      ),
                                      icon: Icon(
                                        Icons
                                            .keyboard_arrow_down_rounded,
                                        color: isDark
                                            ? AppTheme.darkTextMuted
                                            : AppTheme.textMuted,
                                        size: 22,
                                      ),
                                      style: TextStyle(
                                        fontSize: 15,
                                        fontWeight:
                                            FontWeight.w500,
                                        color: isDark
                                            ? AppTheme.darkTextPrimary
                                            : AppTheme.textPrimary,
                                      ),
                                      items: const [
                                        DropdownMenuItem(
                                          value: UserRole.admin,
                                          child: _RoleOption(
                                            icon: Icons
                                                .admin_panel_settings_rounded,
                                            label: 'Admin',
                                            color:
                                                AppTheme.warning,
                                          ),
                                        ),
                                        DropdownMenuItem(
                                          value: UserRole.user,
                                          child: _RoleOption(
                                            icon: Icons
                                                .person_rounded,
                                            label: 'User',
                                            color:
                                                AppTheme.primary,
                                          ),
                                        ),
                                      ],
                                      onChanged: (v) {
                                        if (v != null) {
                                          setState(() {
                                            _role = v;
                                          });
                                        }
                                      },
                                    ),
                                  ),
                                ),
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


class _RoleOption extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;

  const _RoleOption({
    required this.icon,
    required this.label,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    final isDark =
        Theme.of(context).brightness == Brightness.dark;

    return Padding(
      padding: const EdgeInsets.only(top: 1),
      child: Row(
        children: [
          Container(
            width: 34,
            height: 34,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(10),
            ),
            child: Icon(
              icon,
              size: 18,
              color: color,
            ),
          ),
          const SizedBox(width: 12),
          Text(
            label,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
              color: isDark
                  ? AppTheme.darkTextPrimary
                  : AppTheme.textPrimary,
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