import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/form_provider.dart';
import '../models/form_model.dart';
import '../widgets/custom_card.dart';
import '../widgets/hidocs_logo.dart';

import 'fill_form_screen.dart';
import 'settings_screen.dart';

class UserHomeScreen extends StatefulWidget {
  const UserHomeScreen({super.key});

  @override
  State<UserHomeScreen> createState() => _UserHomeScreenState();
}

class _UserHomeScreenState extends State<UserHomeScreen> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final formProvider = Provider.of<FormProvider>(context);

    final List<Widget> screens = [
      _DashboardTab(
        auth: auth,
        formProvider: formProvider,
        onViewAll: () {
          setState(() {
            _tab = 1;
          });
        },
      ),
      _HistoryTab(
        formProvider: formProvider,
      ),
      const SettingsScreen(),
    ];

    return Scaffold(
      body: screens[_tab],
      bottomNavigationBar: _BottomNav(
        currentIndex: _tab,
        onTap: (index) {
          setState(() {
            _tab = index;
          });
        },
        items: const [
          _NavItem(
            icon: Icons.home_outlined,
            activeIcon: Icons.home_rounded,
            label: 'Home',
          ),
          _NavItem(
            icon: Icons.history_outlined,
            activeIcon: Icons.history_rounded,
            label: 'History',
          ),
          _NavItem(
            icon: Icons.settings_outlined,
            activeIcon: Icons.settings_rounded,
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

class _DashboardTab extends StatelessWidget {
  final AuthProvider auth;
  final FormProvider formProvider;
  final VoidCallback onViewAll;

  const _DashboardTab({
    required this.auth,
    required this.formProvider,
    required this.onViewAll,
  });

  @override
  Widget build(BuildContext context) {
    final forms = formProvider.activeForms;

    return Scaffold(
      body: CustomScrollView(
        slivers: [
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            backgroundColor: AppTheme.primary,
            elevation: 0,
            automaticallyImplyLeading: false,
            flexibleSpace: FlexibleSpaceBar(
              background: _HeaderBg(
                auth: auth,
              ),
            ),
            title: Row(
              children: [
                HiDocsLogo(
                  size: 28,
                  showShadow: false,
                ),
                const SizedBox(width: 10),
                const Text(
                  'HiDocs!',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.w800,
                    color: Colors.white,
                    letterSpacing: -0.5,
                  ),
                ),
              ],
            ),
          ),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment:
                        MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Available Forms',
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge,
                      ),
                      TextButton(
                        onPressed: onViewAll,
                        style: TextButton.styleFrom(
                          foregroundColor: AppTheme.info,
                        ),
                        child: const Text(
                          'View All',
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 8),
                  if (forms.isEmpty)
                    const _EmptyState(
                      icon: Icons.article_outlined,
                      title: 'No forms available',
                      subtitle:
                          'There are currently no forms to fill out',
                    )
                  else
                    ...forms.take(4).map(
                      (form) => _UserFormCard(
                        form: form,
                        hasSubmitted:
                            formProvider.hasSubmitted(
                          form.id,
                        ),
                        onTap: () {
                          _handleFormTap(
                            context,
                            form,
                            formProvider,
                          );
                        },
                      ),
                    ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  void _handleFormTap(
    BuildContext context,
    FormModel form,
    FormProvider formProvider,
  ) {
    if (formProvider.hasSubmitted(form.id)) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: const Row(
            children: [
              Icon(
                Icons.info_rounded,
                color: Colors.white,
                size: 16,
              ),
              SizedBox(width: 8),
              Text(
                "You've already submitted this form",
                style: TextStyle(
                  fontWeight: FontWeight.w500,
                ),
              ),
            ],
          ),
          backgroundColor: AppTheme.warning,
          behavior: SnackBarBehavior.floating,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
          ),
          margin: const EdgeInsets.all(16),
        ),
      );

      return;
    }

    Navigator.push(
      context,
      MaterialPageRoute(
        builder: (_) => _FormDetailScreen(
          form: form,
        ),
      ),
    );
  }
}

class _HeaderBg extends StatelessWidget {
  final AuthProvider auth;

  const _HeaderBg({
    required this.auth,
  });

  @override
  Widget build(BuildContext context) {
    final name = auth.currentUser?.name ?? 'User';

    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [
            AppTheme.primaryDark,
            AppTheme.primary,
            AppTheme.primaryLight,
          ],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(
        children: [
          Positioned(
            top: -30,
            right: -40,
            child: _blob(
              160,
              Colors.white.withValues(
                alpha: 0.05,
              ),
            ),
          ),
          Positioned(
            bottom: 20,
            left: -60,
            child: _blob(
              140,
              Colors.white.withValues(
                alpha: 0.04,
              ),
            ),
          ),
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.fromLTRB(
                24,
                60,
                24,
                20,
              ),
              child: Column(
                crossAxisAlignment:
                    CrossAxisAlignment.start,
                mainAxisAlignment:
                    MainAxisAlignment.end,
                children: [
                  Text(
                    'Hello, ${name.split(' ').first}! 👋',
                    style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: -0.3,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    'Fill out forms and submit your answers',
                    style: TextStyle(
                      fontSize: 13,
                      color: Colors.white.withValues(
                        alpha: 0.65,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  Widget _blob(
    double size,
    Color color,
  ) {
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

class _HistoryTab extends StatelessWidget {
  final FormProvider formProvider;

  const _HistoryTab({
    required this.formProvider,
  });

  @override
  Widget build(BuildContext context) {
    final submittedForms = formProvider.activeForms
        .where(
          (form) => formProvider.hasSubmitted(form.id),
        )
        .toList();

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'History',
        ),
      ),
      body: submittedForms.isEmpty
          ? const _EmptyState(
              icon: Icons.history_rounded,
              title: 'No submission history',
              subtitle:
                  'Forms you have submitted will appear here',
            )
          : ListView.builder(
              padding: const EdgeInsets.fromLTRB(
                20,
                16,
                20,
                100,
              ),
              itemCount: submittedForms.length,
              itemBuilder: (_, index) {
                final form = submittedForms[index];

                return _HistoryCard(
                  form: form,
                );
              },
            ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final FormModel form;

  const _HistoryCard({
    required this.form,
  });

  @override
  Widget build(BuildContext context) {
    final isDark =
        Theme.of(context).brightness ==
            Brightness.dark;

    final primaryTextColor = isDark
        ? AppTheme.darkTextPrimary
        : AppTheme.textPrimary;

    final secondaryTextColor = isDark
        ? AppTheme.darkTextSecondary
        : AppTheme.textSecondary;

    return CustomCard(
      margin: const EdgeInsets.only(
        bottom: 14,
      ),
      padding: const EdgeInsets.all(18),
      child: Row(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: AppTheme.success.withValues(
                alpha: 0.10,
              ),
              borderRadius:
                  BorderRadius.circular(14),
            ),
            child: const Icon(
              Icons.check_circle_rounded,
              size: 23,
              color: AppTheme.success,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment:
                  CrossAxisAlignment.start,
              children: [
                Text(
                  form.title,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight:
                        FontWeight.w700,
                    color: primaryTextColor,
                  ),
                  maxLines: 2,
                  overflow:
                      TextOverflow.ellipsis,
                ),

                const SizedBox(height: 6),

                Text(
                  'You have submitted this form',
                  style: TextStyle(
                    fontSize: 12,
                    color: secondaryTextColor,
                  ),
                ),

                const SizedBox(height: 10),

                Row(
                  children: [
                    Icon(
                      Icons.calendar_today_outlined,
                      size: 14,
                      color: secondaryTextColor,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '27 July 2026',
                      style: TextStyle(
                        fontSize: 11,
                        color: secondaryTextColor,
                      ),
                    ),
                    const SizedBox(width: 14),
                    Icon(
                      Icons.access_time_rounded,
                      size: 14,
                      color: secondaryTextColor,
                    ),
                    const SizedBox(width: 6),
                    Text(
                      '19:30',
                      style: TextStyle(
                        fontSize: 11,
                        color: secondaryTextColor,
                      ),
                    ),
                  ],
                ),

                const SizedBox(height: 12),

                Container(
                  padding:
                      const EdgeInsets.symmetric(
                    horizontal: 12,
                    vertical: 7,
                  ),
                  decoration: BoxDecoration(
                    color: AppTheme.success
                        .withValues(
                      alpha: 0.08,
                    ),
                    borderRadius:
                        BorderRadius.circular(10),
                  ),
                  child: const Row(
                    mainAxisSize:
                        MainAxisSize.min,
                    children: [
                      Icon(
                        Icons.check_circle_outline,
                        size: 15,
                        color:
                            AppTheme.success,
                      ),
                      SizedBox(width: 6),
                      Text(
                        'Submitted',
                        style: TextStyle(
                          fontSize: 11,
                          fontWeight:
                              FontWeight.w700,
                          color:
                              AppTheme.success,
                        ),
                      ),
                    ],
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

class _UserFormCard extends StatelessWidget {
  final FormModel form;
  final bool hasSubmitted;
  final VoidCallback onTap;

  const _UserFormCard({
    required this.form,
    required this.hasSubmitted,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final isDark =
        Theme.of(context).brightness ==
            Brightness.dark;

    final primaryTextColor = isDark
        ? AppTheme.darkTextPrimary
        : AppTheme.textPrimary;

    final secondaryTextColor = isDark
        ? AppTheme.darkTextSecondary
        : AppTheme.textSecondary;

    return CustomCard(
      onTap: onTap,
      margin: const EdgeInsets.only(
        bottom: 14,
      ),
      padding: const EdgeInsets.all(18),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: hasSubmitted
                      ? AppTheme.success.withValues(
                          alpha: 0.10,
                        )
                      : AppTheme.primary.withValues(
                          alpha: 0.09,
                        ),
                  borderRadius:
                      BorderRadius.circular(14),
                ),
                child: Icon(
                  hasSubmitted
                      ? Icons.check_circle_rounded
                      : Icons.article_rounded,
                  size: 23,
                  color: hasSubmitted
                      ? AppTheme.success
                      : AppTheme.primary,
                ),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment:
                      CrossAxisAlignment.start,
                  children: [
                    Text(
                      form.title,
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight:
                            FontWeight.w700,
                        color: primaryTextColor,
                      ),
                      maxLines: 2,
                      overflow:
                          TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 5),
                    Text(
                      hasSubmitted
                          ? 'You have already submitted this form'
                          : 'Tap to view form details',
                      style: TextStyle(
                        fontSize: 11,
                        color:
                            secondaryTextColor,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(width: 8),
              Icon(
                Icons.chevron_right_rounded,
                size: 22,
                color: isDark
                    ? AppTheme.darkTextSecondary
                    : AppTheme.textMuted,
              ),
            ],
          ),
          const SizedBox(height: 16),
          SizedBox(
            width: double.infinity,
            child: Container(
              padding:
                  const EdgeInsets.symmetric(
                horizontal: 14,
                vertical: 10,
              ),
              decoration: BoxDecoration(
                color: hasSubmitted
                    ? AppTheme.success.withValues(
                        alpha: 0.08,
                      )
                    : AppTheme.primary.withValues(
                        alpha: 0.06,
                      ),
                borderRadius:
                    BorderRadius.circular(12),
              ),
              child: Row(
                mainAxisAlignment:
                    MainAxisAlignment.center,
                children: [
                  Icon(
                    hasSubmitted
                        ? Icons.check_circle_outline_rounded
                        : Icons.visibility_outlined,
                    size: 16,
                    color: hasSubmitted
                        ? AppTheme.success
                        : AppTheme.primary,
                  ),
                  const SizedBox(width: 6),
                  Text(
                    hasSubmitted
                        ? 'Submitted'
                        : 'View Form Details',
                    style: TextStyle(
                      fontSize: 12,
                      fontWeight:
                          FontWeight.w700,
                      color: hasSubmitted
                          ? AppTheme.success
                          : AppTheme.primary,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _FormDetailScreen extends StatelessWidget {
  final FormModel form;

  const _FormDetailScreen({
    required this.form,
  });

  @override
  Widget build(BuildContext context) {
    final isDark =
        Theme.of(context).brightness ==
            Brightness.dark;

    final primaryTextColor = isDark
        ? AppTheme.darkTextPrimary
        : AppTheme.textPrimary;

    final secondaryTextColor = isDark
        ? AppTheme.darkTextSecondary
        : AppTheme.textSecondary;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Form Details',
        ),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 82,
                  height: 82,
                  decoration: BoxDecoration(
                    color: AppTheme.primary
                        .withValues(
                      alpha: 0.09,
                    ),
                    borderRadius:
                        BorderRadius.circular(24),
                  ),
                  child: const Icon(
                    Icons.article_rounded,
                    size: 40,
                    color: AppTheme.primary,
                  ),
                ),
              ),
              const SizedBox(height: 24),
              Text(
                form.title,
                style: TextStyle(
                  fontSize: 24,
                  fontWeight: FontWeight.w800,
                  color: primaryTextColor,
                ),
              ),
              const SizedBox(height: 10),
              Text(
                'Please read the information below before starting this form.',
                style: TextStyle(
                  fontSize: 14,
                  height: 1.5,
                  color: secondaryTextColor,
                ),
              ),
              const SizedBox(height: 28),
              Container(
                width: double.infinity,
                padding:
                    const EdgeInsets.all(18),
                decoration: BoxDecoration(
                  color: isDark
                      ? AppTheme.darkCard
                      : AppTheme.surfaceCard,
                  borderRadius:
                      BorderRadius.circular(18),
                  border: Border.all(
                    color: isDark
                        ? AppTheme.darkBorder
                        : AppTheme.border,
                  ),
                ),
                child: Column(
                  crossAxisAlignment:
                      CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Form Information',
                      style: TextStyle(
                        fontSize: 16,
                        fontWeight:
                            FontWeight.w700,
                        color:
                            primaryTextColor,
                      ),
                    ),
                    const SizedBox(height: 18),
                    _InfoRow(
                      icon: Icons.edit_document,
                      title: 'Form',
                      value: form.title,
                    ),
                    const SizedBox(height: 16),
                    const _InfoRow(
                      icon: Icons.info_outline_rounded,
                      title: 'Status',
                      value: 'Available to fill',
                    ),
                    const SizedBox(height: 16),
                    const _InfoRow(
                      icon: Icons.check_circle_outline,
                      title: 'Submission',
                      value:
                          'You can only submit once',
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),
              Container(
                width: double.infinity,
                padding:
                    const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: AppTheme.warning
                      .withValues(
                    alpha: 0.08,
                  ),
                  borderRadius:
                      BorderRadius.circular(16),
                  border: Border.all(
                    color: AppTheme.warning
                        .withValues(
                      alpha: 0.20,
                    ),
                  ),
                ),
                child: Row(
                  crossAxisAlignment:
                      CrossAxisAlignment.start,
                  children: [
                    const Icon(
                      Icons.info_outline_rounded,
                      color:
                          AppTheme.warning,
                      size: 20,
                    ),
                    const SizedBox(width: 10),
                    Expanded(
                      child: Text(
                        'Make sure you are ready before starting. Once you submit your answers, you will not be able to fill out this form again.',
                        style: TextStyle(
                          fontSize: 12,
                          height: 1.5,
                          color:
                              secondaryTextColor,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 32),
              SizedBox(
                width: double.infinity,
                height: 54,
                child: ElevatedButton.icon(
                  onPressed: () {
                    Navigator.pushReplacement(
                      context,
                      MaterialPageRoute(
                        builder: (_) =>
                            FillFormScreen(
                          form: form,
                        ),
                      ),
                    );
                  },
                  icon: const Icon(
                    Icons.play_arrow_rounded,
                  ),
                  label: const Text(
                    'Start Filling Form',
                    style: TextStyle(
                      fontSize: 15,
                      fontWeight:
                          FontWeight.w700,
                    ),
                  ),
                  style:
                      ElevatedButton.styleFrom(
                    backgroundColor:
                        AppTheme.primary,
                    foregroundColor:
                        Colors.white,
                    elevation: 0,
                    shape:
                        RoundedRectangleBorder(
                      borderRadius:
                          BorderRadius.circular(
                        15,
                      ),
                    ),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              SizedBox(
                width: double.infinity,
                height: 50,
                child: TextButton(
                  onPressed: () {
                    Navigator.pop(context);
                  },
                  child: Text(
                    'Cancel',
                    style: TextStyle(
                      fontWeight:
                          FontWeight.w600,
                      color:
                          secondaryTextColor,
                    ),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String title;
  final String value;

  const _InfoRow({
    required this.icon,
    required this.title,
    required this.value,
  });

  @override
  Widget build(BuildContext context) {
    final isDark =
        Theme.of(context).brightness ==
            Brightness.dark;

    return Row(
      crossAxisAlignment:
          CrossAxisAlignment.start,
      children: [
        Container(
          width: 36,
          height: 36,
          decoration: BoxDecoration(
            color: AppTheme.primary
                .withValues(
              alpha: 0.08,
            ),
            borderRadius:
                BorderRadius.circular(10),
          ),
          child: Icon(
            icon,
            size: 18,
            color: AppTheme.primary,
          ),
        ),
        const SizedBox(width: 12),
        Expanded(
          child: Column(
            crossAxisAlignment:
                CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: TextStyle(
                  fontSize: 11,
                  color: isDark
                      ? AppTheme.darkTextSecondary
                      : AppTheme.textMuted,
                ),
              ),
              const SizedBox(height: 3),
              Text(
                value,
                style: TextStyle(
                  fontSize: 13,
                  fontWeight:
                      FontWeight.w600,
                  color: isDark
                      ? AppTheme.darkTextPrimary
                      : AppTheme.textPrimary,
                ),
              ),
            ],
          ),
        ),
      ],
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
  });

  @override
  Widget build(BuildContext context) {
    final isDark =
        Theme.of(context).brightness ==
            Brightness.dark;

    return Center(
      child: Padding(
        padding:
            const EdgeInsets.all(48),
        child: Column(
          mainAxisSize:
              MainAxisSize.min,
          children: [
            Container(
              width: 80,
              height: 80,
              decoration: BoxDecoration(
                color: AppTheme.primary
                    .withValues(
                  alpha: 0.07,
                ),
                borderRadius:
                    BorderRadius.circular(24),
              ),
              child: Icon(
                icon,
                size: 36,
                color: AppTheme.primary
                    .withValues(
                  alpha: 0.4,
                ),
              ),
            ),
            const SizedBox(height: 20),
            Text(
              title,
              style: TextStyle(
                fontSize: 17,
                fontWeight:
                    FontWeight.w700,
                color: isDark
                    ? AppTheme.darkTextPrimary
                    : AppTheme.textPrimary,
              ),
            ),
            const SizedBox(height: 6),
            Text(
              subtitle,
              style: TextStyle(
                fontSize: 13,
                color: isDark
                    ? AppTheme.darkTextSecondary
                    : AppTheme.textMuted,
              ),
              textAlign:
                  TextAlign.center,
            ),
          ],
        ),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;

  const _NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}

class _BottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<_NavItem> items;

  const _BottomNav({
    required this.currentIndex,
    required this.onTap,
    required this.items,
  });

  @override
  Widget build(BuildContext context) {
    final isDark =
        Theme.of(context).brightness ==
            Brightness.dark;

    return Container(
      margin:
          const EdgeInsets.fromLTRB(
        16,
        0,
        16,
        12,
      ),
      decoration: BoxDecoration(
        color: isDark
            ? AppTheme.darkCard
            : AppTheme.surfaceCard,
        borderRadius:
            BorderRadius.circular(22),
        border: Border.all(
          color: isDark
              ? AppTheme.darkBorder
              : AppTheme.border,
        ),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(
              alpha: isDark
                  ? 0.30
                  : 0.08,
            ),
            blurRadius: 20,
            offset:
                const Offset(0, 6),
          ),
        ],
      ),
      child: ClipRRect(
        borderRadius:
            BorderRadius.circular(22),
        child: BottomNavigationBar(
          currentIndex:
              currentIndex,
          onTap: onTap,
          items: items
              .map(
                (item) =>
                    BottomNavigationBarItem(
                  icon: Icon(
                    item.icon,
                  ),
                  activeIcon:
                      Icon(
                    item.activeIcon,
                  ),
                  label:
                      item.label,
                ),
              )
              .toList(),
        ),
      ),
    );
  }
}