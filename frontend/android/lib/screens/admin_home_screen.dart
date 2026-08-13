import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../app_theme.dart';
import '../providers/auth_provider.dart';
import '../providers/form_provider.dart';
import '../models/form_model.dart';
import '../widgets/custom_card.dart';
import '../widgets/hidocs_logo.dart';
import 'create_form_screen.dart';
import 'form_detail_screen.dart';
import 'settings_screen.dart';

class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({super.key});
  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  int _tab = 0;

  @override
  Widget build(BuildContext context) {
    final auth         = Provider.of<AuthProvider>(context);
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
      _FormsTab(
        formProvider: formProvider
      ),
      const SettingsScreen(),
    ];

    return Scaffold(
      body: screens[_tab],
      floatingActionButton: _tab == 1
          ? FloatingActionButton.extended(
              onPressed: () => Navigator.push(context,
                  MaterialPageRoute(
                      builder: (_) => const CreateFormScreen())),
              backgroundColor: AppTheme.primary,
              elevation: 3,
              icon: const Icon(Icons.add_rounded, color: Colors.white),
              label: const Text('New Form',
                  style: TextStyle(
                      color: Colors.white, fontWeight: FontWeight.w700)),
            )
          : null,
      bottomNavigationBar: _BottomNav(
        currentIndex: _tab,
        onTap: (i) => setState(() => _tab = i),
        items: const [
          _NavItem(
              icon: Icons.space_dashboard_outlined,
              activeIcon: Icons.space_dashboard_rounded,
              label: 'Home'),
          _NavItem(
              icon: Icons.article_outlined,
              activeIcon: Icons.article_rounded,
              label: 'Forms'),
          _NavItem(
              icon: Icons.settings_outlined,
              activeIcon: Icons.settings_rounded,
              label: 'Profile'),
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
    final myForms = formProvider.getFormsByCreator(auth.currentUser!.id);

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
              background: _HeaderBg(auth: auth),
            ),
            title: const Row(children: [
              HiDocsLogo(size: 28, showShadow: false),
              SizedBox(width: 10),
              Text('HiDocs!',
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: -0.5)),
            ]),
          ),

          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [

                Row(children: [
                  Expanded(
                    child: _QuickAction(
                      icon: Icons.add_circle_rounded,
                      label: 'New Form',
                      color: AppTheme.info,
                      onTap: () => Navigator.push(
                          context,
                          MaterialPageRoute(
                              builder: (_) =>
                                  const CreateFormScreen())),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: _QuickAction(
                      icon: Icons.upload_file_rounded,
                      label: 'Import Word',
                      color: AppTheme.info,
                      onTap: () => _showImportDialog(context),
                    ),
                  ),
                ]),
                const SizedBox(height: 28),

                Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                  Text('Recent Forms',
                      style: Theme.of(context).textTheme.titleLarge),
                  TextButton(
                    onPressed: onViewAll,
                    style: TextButton.styleFrom(
                      foregroundColor: AppTheme.info,
                    ),
                    child: const Text('View All'),
                  ),
                ]),
                const SizedBox(height: 8),

                if (myForms.isEmpty)
                  const _EmptyState(
                    icon: Icons.article_outlined,
                    title: 'No forms yet',
                    subtitle: 'Tap "New Form" to get started',
                  )
                else
                  ...myForms
                      .take(4)
                      .map((f) => _FormCard(
                            form: f,
                            onTap: () => Navigator.push(
                                context,
                                MaterialPageRoute(
                                    builder: (_) =>
                                        FormDetailScreen(form: f))),
                          )),
              ]),
            ),
          ),
        ],
      ),
    );
  }

  void _showImportDialog(BuildContext context) {
    showDialog(
      context: context,
      builder: (_) => AlertDialog(
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20)),
        title: const Row(children: [
          Icon(Icons.upload_file_rounded, color: AppTheme.primary),
          SizedBox(width: 10),
          Text('Import Word', style: TextStyle(fontSize: 18)),
        ]),
        content: const Text(
            'Convert a Word document (.docx) into a form template automatically.',
            style: TextStyle(height: 1.5)),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text('Cancel')),
          ElevatedButton.icon(
            onPressed: () => Navigator.pop(context),
            icon: const Icon(Icons.folder_open_rounded, size: 16),
            label: const Text('Choose File'),
          ),
        ],
      ),
    );
  }
}

class _HeaderBg extends StatelessWidget {
  final AuthProvider auth;
  const _HeaderBg({required this.auth});

  @override
  Widget build(BuildContext context) {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppTheme.primaryDark, AppTheme.primary, AppTheme.primaryLight],
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
        ),
      ),
      child: Stack(children: [
        Positioned(
            top: -30,
            right: -40,
            child: _blob(160, Colors.white.withValues(alpha: 0.05))),
        Positioned(
            bottom: 20,
            left: -60,
            child: _blob(140, Colors.white.withValues(alpha: 0.04))),
        SafeArea(
          child: Padding(
            padding: const EdgeInsets.fromLTRB(24, 60, 24, 20),
            child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.end,
                children: [
              Text(
                  'Hello, ${auth.currentUser!.name.split(' ').first}! 👋',
                  style: const TextStyle(
                      fontSize: 22,
                      fontWeight: FontWeight.w800,
                      color: Colors.white,
                      letterSpacing: -0.3)),
              const SizedBox(height: 4),
              Text('Manage your forms and track responses',
                  style: TextStyle(
                      fontSize: 13,
                      color: Colors.white.withValues(alpha: 0.65))),
            ]),
          ),
        ),
      ]),
    );
  }

  Widget _blob(double size, Color color) => Container(
      width: size,
      height: size,
      decoration: BoxDecoration(shape: BoxShape.circle, color: color));
}

class _FormsTab extends StatelessWidget {
  final FormProvider formProvider;
  const _FormsTab({required this.formProvider});

  @override
  Widget build(BuildContext context) {
    final forms  = formProvider.forms;
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor:
          isDark ? AppTheme.darkBg : AppTheme.surfaceLight,
      appBar: AppBar(
        title: const Text('Manage Forms'),
        actions: [
          IconButton(
              icon: const Icon(Icons.search_rounded),
              onPressed: () {}),
        ],
      ),
      body: forms.isEmpty
          ? const _EmptyState(
              icon: Icons.article_outlined,
              title: 'No forms yet',
              subtitle: 'Tap the + button to create your first form',
            )
          : ListView.builder(
              padding:
                  const EdgeInsets.fromLTRB(20, 16, 20, 100),
              itemCount: forms.length,
              itemBuilder: (_, i) => _FormCard(
                form: forms[i],
                onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                        builder: (_) =>
                            FormDetailScreen(form: forms[i]))),
              ),
            ),
    );
  }
}

class _FormCard extends StatelessWidget {
  final FormModel form;
  final VoidCallback onTap;
  const _FormCard({required this.form, required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    final primaryTextColor = isDark ? AppTheme.darkTextPrimary : AppTheme.textPrimary;
    final secondaryTextColor = isDark ? AppTheme.darkTextSecondary : AppTheme.textMuted;

    return CustomCard(
      onTap: onTap,
      margin: const EdgeInsets.only(bottom: 14),
      padding: const EdgeInsets.all(18),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Row(children: [
          Container(
            width: 46,
            height: 46,
            decoration: BoxDecoration(
              color: AppTheme.info.withValues(alpha: 0.15),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Icon(
              Icons.article_rounded,
              size: 22, 
              color: isDark ? AppTheme.primaryLight : AppTheme.primary,
            ),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  form.title,
                  style: TextStyle(
                    fontSize: 15,
                    fontWeight: FontWeight.w700,
                    color: primaryTextColor,
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(width: 10),
          _StatusPill(isActive: form.isActive),
        ]),
        const SizedBox(height: 12),
        Container(
          padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 7),
          decoration: BoxDecoration(
            color: isDark ? AppTheme.darkBg : AppTheme.primaryFaint, 
            borderRadius: BorderRadius.circular(10),
          ),
          child: Row(children: [
            Icon(
              Icons.link_rounded,
              size: 14, 
              color: isDark ? AppTheme.primaryLight : AppTheme.info,
            ),
            const SizedBox(width: 6),
            Expanded(
              child: Text(
                form.fullLink,
                style: TextStyle(
                  fontSize: 12,
                  color: isDark ? AppTheme.infoLight : AppTheme.info,
                  fontWeight: FontWeight.w500,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
            Icon(
              Icons.copy_rounded,
              size: 14, 
              color: secondaryTextColor,
            ),
          ]),
        ),
      ]),
    );
  }
}

class _QuickAction extends StatelessWidget {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  const _QuickAction(
      {required this.icon,
      required this.label,
      required this.color,
      required this.onTap});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return GestureDetector(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 16),
        decoration: BoxDecoration(
          color: isDark ? AppTheme.darkCard : AppTheme.surfaceCard,
          borderRadius: BorderRadius.circular(16),
          border: Border.all(
              color: isDark ? AppTheme.darkBorder : AppTheme.border),
          boxShadow: isDark
              ? null
              : [
                  BoxShadow(
                      color: Colors.black.withValues(alpha: 0.04),
                      blurRadius: 8,
                      offset: const Offset(0, 2))
                ],
        ),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
            width: 40,
            height: 40,
            decoration: BoxDecoration(
              color: color.withValues(alpha: 0.10),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, size: 20, color: color),
          ),
          const SizedBox(height: 8),
          Text(label,
              style: TextStyle(
                  fontSize: 11,
                  fontWeight: FontWeight.w600,
                  color: isDark
                      ? AppTheme.darkTextSecondary
                      : AppTheme.textSecondary),
              textAlign: TextAlign.center),
        ]),
      ),
    );
  }
}

class _StatusPill extends StatelessWidget {
  final bool isActive;
  const _StatusPill({required this.isActive});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 5),
      decoration: BoxDecoration(
        color: isActive
            ? AppTheme.success.withValues(alpha: 0.10)
            : AppTheme.error.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(20),
        border: Border.all(
            color: isActive
                ? AppTheme.success.withValues(alpha: 0.30)
                : AppTheme.error.withValues(alpha: 0.30)),
      ),
      child: Row(mainAxisSize: MainAxisSize.min, children: [
        Container(
          width: 6,
          height: 6,
          decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: isActive ? AppTheme.success : AppTheme.error),
        ),
        const SizedBox(width: 5),
        Text(isActive ? 'Active' : 'Closed',
            style: TextStyle(
                fontSize: 11,
                fontWeight: FontWeight.w700,
                color: isActive ? AppTheme.success : AppTheme.error)),
      ]),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  const _EmptyState(
      {required this.icon,
      required this.title,
      required this.subtitle});

  @override
  Widget build(BuildContext context) {
    return Center(
      child: Padding(
        padding: const EdgeInsets.all(48),
        child: Column(mainAxisSize: MainAxisSize.min, children: [
          Container(
            width: 80,
            height: 80,
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.07),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Icon(icon,
                size: 36,
                color: AppTheme.primary.withValues(alpha: 0.4)),
          ),
          const SizedBox(height: 20),
          Text(title,
              style: const TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: AppTheme.textPrimary)),
          const SizedBox(height: 6),
          Text(subtitle,
              style: const TextStyle(
                  fontSize: 13, color: AppTheme.textMuted),
              textAlign: TextAlign.center),
        ]),
      ),
    );
  }
}

class _NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;
  const _NavItem(
      {required this.icon,
      required this.activeIcon,
      required this.label});
}

class _BottomNav extends StatelessWidget {
  final int currentIndex;
  final ValueChanged<int> onTap;
  final List<_NavItem> items;
  const _BottomNav(
      {required this.currentIndex,
      required this.onTap,
      required this.items});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : AppTheme.surfaceCard,
        borderRadius: BorderRadius.circular(22),
        border: Border.all(
            color: isDark ? AppTheme.darkBorder : AppTheme.border),
        boxShadow: [
          BoxShadow(
              color: Colors.black
                  .withValues(alpha: isDark ? 0.30 : 0.08),
              blurRadius: 20,
              offset: const Offset(0, 6)),
        ],
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(22),
        child: BottomNavigationBar(
          currentIndex: currentIndex,
          onTap: onTap,
          items: items
              .map((i) => BottomNavigationBarItem(
                    icon: Icon(i.icon),
                    activeIcon: Icon(i.activeIcon),
                    label: i.label,
                  ))
              .toList(),
        ),
      ),
    );
  }
}
