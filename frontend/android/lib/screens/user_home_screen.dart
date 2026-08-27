import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/form_provider.dart';
import '../models/form_model.dart';
import '../widgets/custom_card.dart';
import '../widgets/hidocs_logo.dart';

import 'link_input_screen.dart';
import 'scan_form_screen.dart';
import 'settings_screen.dart';
import 'history_detail_screen.dart';
import '../providers/response_provider.dart';
import '../models/response_model.dart';

class UserHomeScreen extends StatefulWidget {
  const UserHomeScreen({super.key});

  @override
  State<UserHomeScreen> createState() => _UserHomeScreenState();
}

class _UserHomeScreenState extends State<UserHomeScreen> {
  int _tab = 0;

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (mounted) {
        context.read<FormProvider>().loadForms();
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final formProvider = Provider.of<FormProvider>(context);

    final List<Widget> screens = [
      _DashboardTab(auth: auth),
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
          if (mounted) {
            context.read<FormProvider>().loadForms();
          }
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

  const _DashboardTab({
    required this.auth,
  });

  @override
  Widget build(BuildContext context) {
    final responseProvider = Provider.of<ResponseProvider>(context);
    final formProvider = Provider.of<FormProvider>(context);

    final Map<String, ResponseModel> responseMap = {};
    final currentId = (auth.currentUser?.id ?? '').trim().toLowerCase();
    final currentEmail = (auth.currentUser?.email ?? '').trim().toLowerCase();

    for (final r in responseProvider.responses) {
      final rId = r.respondentId.trim().toLowerCase();
      final rEmail = r.respondentEmail.trim().toLowerCase();

      final matchesUser = (currentId.isNotEmpty && rId == currentId) ||
          (currentEmail.isNotEmpty && rEmail == currentEmail);

      if (matchesUser) {
        responseMap[r.formId] = r;
      }
    }

    final allUserResponses = responseMap.values.toList();
    allUserResponses.sort((a, b) => b.submittedAt.compareTo(a.submittedAt));
    final recentResponses = allUserResponses.take(5).toList();

    final isDark =
        Theme.of(context).brightness ==
            Brightness.dark;

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
            title: const Row(
              children: [
                HiDocsLogo(
                  size: 28,
                  showShadow: false,
                ),
                SizedBox(width: 10),
                Text(
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
                  const SizedBox(height: 4),
                  Row(
                    children: [
                      Expanded(
                        child: _QuickAccessCard(
                          icon: Icons.qr_code_scanner_rounded,
                          title: 'Scan Barcode / QR',
                          subtitle: 'Scan kode form',
                          color: AppTheme.primary,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) =>
                                    const ScanFormScreen(),
                              ),
                            );
                          },
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: _QuickAccessCard(
                          icon: Icons.link_rounded,
                          title: 'Enter Link',
                          subtitle: 'Paste link form',
                          color: AppTheme.info,
                          onTap: () {
                            Navigator.push(
                              context,
                              MaterialPageRoute(
                                builder: (_) =>
                                    const LinkInputScreen(),
                              ),
                            );
                          },
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  Text(
                    'Recent Forms',
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.w700,
                      color: isDark
                          ? AppTheme.darkTextPrimary
                          : AppTheme.textPrimary,
                    ),
                  ),
                  const SizedBox(height: 12),
                  if (recentResponses.isEmpty)
                    const _EmptyState(
                      icon: Icons.history_rounded,
                      title: 'No recent forms',
                      subtitle: 'Forms you fill out will appear here',
                    )
                  else
                    ...recentResponses
                        .where((r) =>
                            formProvider.getFormById(r.formId) != null ||
                            r.formTitle.isNotEmpty)
                        .map((response) {
                      final form = formProvider.getFormById(response.formId) ??
                          FormModel(
                            id: response.formId,
                            title: response.formTitle,
                            creatorId: '',
                            scheduledOpen: response.submittedAt,
                            scheduledClose: response.submittedAt,
                            createdAt: response.submittedAt,
                          );
                      return _HistoryCard(
                        form: form,
                        response: response,
                      );
                    }),
                ],
              ),
            ),
          ),
        ],
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
    final responseProvider = Provider.of<ResponseProvider>(context);
    final auth = Provider.of<AuthProvider>(context, listen: false);

    final Map<String, ResponseModel> responseMap = {};
    final currentId = (auth.currentUser?.id ?? '').trim().toLowerCase();
    final currentEmail = (auth.currentUser?.email ?? '').trim().toLowerCase();

    for (final r in responseProvider.responses) {
      final rId = r.respondentId.trim().toLowerCase();
      final rEmail = r.respondentEmail.trim().toLowerCase();

      final matchesUser = (currentId.isNotEmpty && rId == currentId) ||
          (currentEmail.isNotEmpty && rEmail == currentEmail);

      if (matchesUser) {
        responseMap[r.formId] = r;
      }
    }

    final myResponses = responseMap.values.toList();
    myResponses.sort((a, b) => b.submittedAt.compareTo(a.submittedAt));

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'History',
        ),
      ),
      body: myResponses.isEmpty
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
              itemCount: myResponses.length,
              itemBuilder: (_, index) {
                final response = myResponses[index];
                final form = formProvider.getFormById(response.formId);
                if (form == null && response.formTitle.isEmpty) {
                  return const SizedBox.shrink();
                }
                final displayForm = form ??
                    FormModel(
                      id: response.formId,
                      title: response.formTitle,
                      creatorId: '',
                      scheduledOpen: response.submittedAt,
                      scheduledClose: response.submittedAt,
                      createdAt: response.submittedAt,
                    );

                return _HistoryCard(
                  form: displayForm,
                  response: response,
                );
              },
            ),
    );
  }
}

class _HistoryCard extends StatelessWidget {
  final FormModel form;
  final ResponseModel response;

  const _HistoryCard({
    required this.form,
    required this.response,
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

    final subDate = response.submittedAt;
    final dateStr = '${subDate.day} ${_monthName(subDate.month)} ${subDate.year}';
    final timeStr = '${subDate.hour.toString().padLeft(2, '0')}:${subDate.minute.toString().padLeft(2, '0')}';

    return CustomCard(
      onTap: () {
        Navigator.push(
          context,
          MaterialPageRoute(
            builder: (_) => HistoryDetailScreen(
              form: form,
              response: response,
            ),
          ),
        );
      },
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
                      dateStr,
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
                      timeStr,
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
          Icon(
            Icons.chevron_right_rounded,
            size: 20,
            color: secondaryTextColor,
          ),
        ],
      ),
    );
  }

  static String _monthName(int month) {
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];
    return (month >= 1 && month <= 12) ? months[month - 1] : '';
  }
}

class _QuickAccessCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _QuickAccessCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
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
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment:
            CrossAxisAlignment.start,
        children: [
          Container(
            width: 44,
            height: 44,
            decoration: BoxDecoration(
              color: color.withValues(
                alpha: 0.10,
              ),
              borderRadius:
                  BorderRadius.circular(13),
            ),
            child: Icon(
              icon,
              size: 22,
              color: color,
            ),
          ),
          const SizedBox(height: 12),
          Text(
            title,
            style: TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w700,
              color: primaryTextColor,
            ),
          ),
          const SizedBox(height: 2),
          Text(
            subtitle,
            style: TextStyle(
              fontSize: 11,
              color: secondaryTextColor,
            ),
          ),
        ],
      ),
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