import 'package:flutter/material.dart';
import 'package:provider/provider.dart';

import '../app_theme.dart';
import '../providers/auth_provider.dart';
import '../services/api_client.dart';
import '../widgets/custom_card.dart';

class AdminDashboardScreen extends StatefulWidget {
  const AdminDashboardScreen({super.key});

  @override
  State<AdminDashboardScreen> createState() => _AdminDashboardScreenState();
}

class _AdminDashboardScreenState extends State<AdminDashboardScreen> {
  int _tab = 0;

  bool _loadingUsers = true;
  bool _loadingForms = true;

  Map<String, dynamic> _stats = {};
  List<Map<String, dynamic>> _users = [];
  List<Map<String, dynamic>> _forms = [];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadAll();
    });
  }

  Future<void> _loadAll() async {
    await Future.wait(
      [
        _loadStats(),
        if (_tab == 1) _loadUsers(),
        if (_tab == 2) _loadForms(),
      ],
    );
  }

  Future<void> _loadStats() async {
    try {
      final data = await ApiClient.get('/admin/dashboard/stats');
      if (mounted && data is Map) {
        setState(() {
          _stats = Map<String, dynamic>.from(data);
        });
      }
    } on ApiException catch (e) {
      if (mounted) _showSnack(e.message, AppTheme.error);
    } catch (_) {}
  }

  Future<void> _loadUsers() async {
    _loadingUsers = true;
    if (mounted) setState(() {});
    try {
      final data = await ApiClient.get('/admin/creators');
      if (mounted && data is List) {
        setState(() {
          _users = data
              .whereType<Map>()
              .map((e) => Map<String, dynamic>.from(e))
              .toList();
          _loadingUsers = false;
        });
      } else if (mounted) {
        setState(() => _loadingUsers = false);
      }
    } on ApiException catch (e) {
      if (mounted) {
        _showSnack(e.message, AppTheme.error);
        setState(() => _loadingUsers = false);
      }
    } catch (_) {
      if (mounted) setState(() => _loadingUsers = false);
    }
  }

  Future<void> _loadForms() async {
    _loadingForms = true;
    if (mounted) setState(() {});
    try {
      final data = await ApiClient.get('/admin/forms');
      if (mounted && data is List) {
        setState(() {
          _forms = data
              .whereType<Map>()
              .map((e) => Map<String, dynamic>.from(e))
              .toList();
          _loadingForms = false;
        });
      } else if (mounted) {
        setState(() => _loadingForms = false);
      }
    } on ApiException catch (e) {
      if (mounted) {
        _showSnack(e.message, AppTheme.error);
        setState(() => _loadingForms = false);
      }
    } catch (_) {
      if (mounted) setState(() => _loadingForms = false);
    }
  }

  Future<void> _toggleUserActive(int index, bool value) async {
    final user = _users[index];
    setState(() {
      _users[index] = {...user, 'is_active': value};
    });

    try {
      await ApiClient.put(
        '/admin/creators/${user['id']}/status',
        body: {'is_active': value},
      );
    } on ApiException catch (e) {
      if (mounted) {
        _showSnack(e.message, AppTheme.error);
        setState(() {
          _users[index] = {...user, 'is_active': !value};
        });
      }
    } catch (_) {
      if (mounted) {
        _showSnack('Koneksi gagal. Periksa jaringan atau server.',
            AppTheme.error);
        setState(() {
          _users[index] = {...user, 'is_active': !value};
        });
      }
    }
  }

  Future<void> _createUser(String name, String email, String password) async {
    try {
      await ApiClient.post(
        '/admin/creators',
        body: {'name': name, 'email': email, 'password': password},
      );
      if (mounted) {
        _showSnack('User berhasil ditambahkan.', AppTheme.success);
        await _loadUsers();
      }
    } on ApiException catch (e) {
      if (mounted) _showSnack(e.message, AppTheme.error);
    } catch (_) {
      if (mounted) {
        _showSnack('Koneksi gagal. Periksa jaringan atau server.',
            AppTheme.error);
      }
    }
  }

  Future<void> _deleteForm(int index) async {
    final form = _forms[index];

    final confirmed = await showDialog<bool>(
      context: context,
      builder: (ctx) => AlertDialog(
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(20)),
        title: const Row(children: [
          Icon(Icons.delete_outline_rounded,
              color: AppTheme.error),
          SizedBox(width: 10),
          Text('Delete Form', style: TextStyle(fontSize: 18)),
        ]),
        content: Text(
          'Yakin ingin menghapus form "${form['title']}"? Tindakan ini tidak dapat dibatalkan.',
          style: const TextStyle(height: 1.5),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx, false),
            child: const Text('Cancel'),
          ),
          ElevatedButton.icon(
            onPressed: () => Navigator.pop(ctx, true),
            style: ElevatedButton.styleFrom(
              backgroundColor: AppTheme.error,
              foregroundColor: Colors.white,
            ),
            icon: const Icon(Icons.delete_rounded, size: 16),
            label: const Text('Delete'),
          ),
        ],
      ),
    );

    if (confirmed != true || !mounted) return;

    try {
      await ApiClient.delete('/admin/forms/${form['id']}');
      if (mounted) {
        setState(() => _forms.removeAt(index));
        _showSnack('Form berhasil dihapus.', AppTheme.success);
      }
    } on ApiException catch (e) {
      if (mounted) _showSnack(e.message, AppTheme.error);
    } catch (_) {
      if (mounted) {
        _showSnack('Koneksi gagal. Periksa jaringan atau server.',
            AppTheme.error);
      }
    }
  }

  void _showSnack(String message, Color color) {
    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
      content: Row(children: [
        Icon(Icons.info_outline_rounded,
            color: Colors.white, size: 18),
        const SizedBox(width: 10),
        Expanded(
            child: Text(message,
                style: const TextStyle(fontWeight: FontWeight.w500))),
      ]),
      backgroundColor: color,
      behavior: SnackBarBehavior.floating,
      shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12)),
      margin: const EdgeInsets.all(16),
    ));
  }

  Future<void> _showAddUserDialog() async {
    final nameCtrl = TextEditingController();
    final emailCtrl = TextEditingController();
    final passCtrl = TextEditingController();
    final formKey = GlobalKey<FormState>();

    await showDialog(
      context: context,
      builder: (ctx) {
        final isDark =
            Theme.of(ctx).brightness == Brightness.dark;

        return AlertDialog(
          shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(20)),
          title: const Text('Tambah User', style: TextStyle(fontSize: 18)),
          content: Form(
            key: formKey,
            child: SingleChildScrollView(
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  TextFormField(
                    controller: nameCtrl,
                    decoration: const InputDecoration(
                      labelText: 'Name',
                      prefixIcon:
                          Icon(Icons.person_outline_rounded),
                    ),
                    validator: (v) => (v == null || v.trim().isEmpty)
                        ? 'Name is required'
                        : null,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: emailCtrl,
                    keyboardType: TextInputType.emailAddress,
                    decoration: const InputDecoration(
                      labelText: 'Email',
                      prefixIcon:
                          Icon(Icons.mail_outline_rounded),
                    ),
                    validator: (v) =>
                        (v == null || !v.contains('@'))
                            ? 'Email tidak valid'
                            : null,
                  ),
                  const SizedBox(height: 14),
                  TextFormField(
                    controller: passCtrl,
                    obscureText: true,
                    decoration: const InputDecoration(
                      labelText: 'Password',
                      prefixIcon:
                          Icon(Icons.lock_outline_rounded),
                    ),
                    validator: (v) => (v == null || v.length < 6)
                        ? 'Minimum 6 characters'
                        : null,
                  ),
                ],
              ),
            ),
          ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Cancel'),
            ),
            ElevatedButton.icon(
              onPressed: () async {
                if (!formKey.currentState!.validate()) return;
                await _createUser(
                  nameCtrl.text.trim(),
                  emailCtrl.text.trim(),
                  passCtrl.text,
                );
                if (ctx.mounted) Navigator.pop(ctx);
              },
              icon: const Icon(Icons.person_add_alt_1_rounded,
                  size: 16),
              label: const Text('Tambah'),
            ),
          ],
          backgroundColor:
              isDark ? AppTheme.darkCard : Colors.white,
        );
      },
    );
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final isSuper = auth.isSuperAdmin;

    final tabTitles = ['Overview', 'Users', 'Forms'];

    final List<Widget> bodies = [
      _buildOverview(),
      _buildUsers(),
      _buildForms(),
    ];

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.surfaceLight,
      appBar: AppBar(
        title: Text(
          isSuper ? 'Super Admin' : 'Admin',
        ),
        flexibleSpace: Container(
          decoration: BoxDecoration(
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
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(56),
          child: Container(
            margin: const EdgeInsets.fromLTRB(20, 0, 20, 12),
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: Colors.white.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Row(
              children: List.generate(tabTitles.length, (i) {
                final active = _tab == i;
                return Expanded(
                  child: GestureDetector(
                    onTap: () {
                      setState(() => _tab = i);
                      if (i == 1) {
                        _loadUsers();
                      } else if (i == 2) {
                        _loadForms();
                      } else {
                        _loadStats();
                      }
                    },
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      padding: const EdgeInsets.symmetric(vertical: 9),
                      decoration: BoxDecoration(
                        color: active
                            ? Colors.white.withValues(alpha: 0.95)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(11),
                      ),
                      child: Text(
                        tabTitles[i],
                        textAlign: TextAlign.center,
                        style: TextStyle(
                          fontSize: 12.5,
                          fontWeight: FontWeight.w700,
                          color: active
                              ? AppTheme.primary
                              : Colors.white.withValues(alpha: 0.75),
                        ),
                      ),
                    ),
                  ),
                );
              }),
            ),
          ),
        ),
      ),
      body: IndexedStack(
        index: _tab,
        children: bodies,
      ),
      floatingActionButton: _tab == 1
          ? FloatingActionButton.extended(
              onPressed: _showAddUserDialog,
              backgroundColor: AppTheme.primary,
              elevation: 3,
              icon: const Icon(Icons.person_add_alt_1_rounded,
                  color: Colors.white),
              label: const Text('Add User',
                  style: TextStyle(
                      color: Colors.white,
                      fontWeight: FontWeight.w700)),
            )
          : null,
    );
  }

  Widget _buildOverview() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final auth = Provider.of<AuthProvider>(context);

    return Scaffold(
      body: RefreshIndicator(
        onRefresh: _loadStats,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Row(children: [
              Expanded(
                child: _InfoTile(
                  icon: Icons.group_rounded,
                  label: 'Total Users',
                  value: (_stats['total_users'] ?? 0).toString(),
                  color: AppTheme.info,
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _InfoTile(
                  icon: Icons.edit_document,
                  label: 'Total Forms',
                  value: (_stats['total_forms'] ?? 0).toString(),
                  color: AppTheme.success,
                  isDark: isDark,
                ),
              ),
            ]),
            const SizedBox(height: 12),
            Row(children: [
              Expanded(
                child: _InfoTile(
                  icon: Icons.quiz_rounded,
                  label: 'Active Exams',
                  value: (_stats['active_exams'] ?? 0).toString(),
                  color: AppTheme.warning,
                  isDark: isDark,
                ),
              ),
              const SizedBox(width: 12),
              Expanded(
                child: _InfoTile(
                  icon: Icons.fact_check_rounded,
                  label: 'Responses',
                  value: (_stats['total_responses'] ?? 0).toString(),
                  color: AppTheme.accentDark,
                  isDark: isDark,
                ),
              ),
            ]),
            const SizedBox(height: 12),
            _InfoTile(
              icon: Icons.workspace_premium_rounded,
              label: 'Creators',
              value: (_stats['total_creators'] ?? 0).toString(),
              color: AppTheme.info,
              isDark: isDark,
              fullWidth: true,
            ),
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.primary.withValues(alpha: 0.06),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                    color: AppTheme.primary.withValues(alpha: 0.15)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.info_outline_rounded,
                      color: AppTheme.info, size: 20),
                  const SizedBox(width: 10),
                  Expanded(
                    child: Text(
                      'Admin berfokus pada manajemen pengguna serta melihat dan menghapus form. '
                      '${auth.currentUser?.name ?? 'Anda'} memiliki akses '
                      '${auth.isSuperAdmin ? 'Super Admin' : 'Admin'}.',
                      style: TextStyle(
                        fontSize: 12,
                        height: 1.5,
                        color: isDark
                            ? AppTheme.darkTextSecondary
                            : AppTheme.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildUsers() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_loadingUsers) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_users.isEmpty) {
      return _EmptyState(
        icon: Icons.group_outlined,
        title: 'Belum ada user',
        subtitle: 'Tap "+ Add User" untuk menambahkan user baru',
        isDark: isDark,
      );
    }

    return RefreshIndicator(
      onRefresh: _loadUsers,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 100),
        itemCount: _users.length,
        itemBuilder: (_, index) {
          final user = _users[index];
          final active = user['is_active'] == true;

          return CustomCard(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: (active
                            ? AppTheme.success
                            : AppTheme.error)
                        .withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(13),
                  ),
                  child: Center(
                    child: Text(
                      (user['name'] ?? '?')
                          .toString()
                          .substring(0, 1)
                          .toUpperCase(),
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.w800,
                        color: active
                            ? AppTheme.success
                            : AppTheme.error,
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        (user['name'] ?? '-').toString(),
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: isDark
                              ? AppTheme.darkTextPrimary
                              : AppTheme.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 3),
                      Text(
                        (user['email'] ?? '-').toString(),
                        style: const TextStyle(
                          fontSize: 12,
                          color: AppTheme.textMuted,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                Switch.adaptive(
                  value: active,
                  onChanged: (v) => _toggleUserActive(index, v),
                  activeTrackColor: AppTheme.success,
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  Widget _buildForms() {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    if (_loadingForms) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_forms.isEmpty) {
      return _EmptyState(
        icon: Icons.article_outlined,
        title: 'Belum ada form',
        subtitle: 'Form yang dibuat oleh seluruh pengguna akan tampil di sini',
        isDark: isDark,
      );
    }

    return RefreshIndicator(
      onRefresh: _loadForms,
      child: ListView.builder(
        padding: const EdgeInsets.fromLTRB(20, 16, 20, 24),
        itemCount: _forms.length,
        itemBuilder: (_, index) {
          final form = _forms[index];
          final status = (form['status'] ?? 'DRAFT').toString();
          final isActive = status == 'ACTIVE';

          return CustomCard(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            child: Row(
              children: [
                Container(
                  width: 44,
                  height: 44,
                  decoration: BoxDecoration(
                    color: AppTheme.info.withValues(alpha: 0.12),
                    borderRadius: BorderRadius.circular(13),
                  ),
                  child: const Icon(Icons.article_rounded,
                      size: 22, color: AppTheme.info),
                ),
                const SizedBox(width: 14),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        (form['title'] ?? '-').toString(),
                        style: TextStyle(
                          fontSize: 15,
                          fontWeight: FontWeight.w700,
                          color: isDark
                              ? AppTheme.darkTextPrimary
                              : AppTheme.textPrimary,
                        ),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                      ),
                      const SizedBox(height: 4),
                      Row(children: [
                        _MiniPill(
                          text: (form['type'] ?? 'SURVEY').toString(),
                          color: AppTheme.info,
                        ),
                        const SizedBox(width: 6),
                        _MiniPill(
                          text: isActive ? 'Active' : 'Closed',
                          color:
                              isActive ? AppTheme.success : AppTheme.error,
                        ),
                      ]),
                    ],
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: () => _deleteForm(index),
                  child: Container(
                    width: 38,
                    height: 38,
                    decoration: BoxDecoration(
                      color: AppTheme.error.withValues(alpha: 0.10),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: const Icon(Icons.delete_outline_rounded,
                        size: 19, color: AppTheme.error),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;
  final bool isDark;
  final bool fullWidth;

  const _InfoTile({
    required this.icon,
    required this.label,
    required this.value,
    required this.color,
    required this.isDark,
    this.fullWidth = false,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      width: fullWidth ? double.infinity : null,
      padding: const EdgeInsets.symmetric(vertical: 18, horizontal: 14),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : AppTheme.surfaceCard,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
            color: isDark ? AppTheme.darkBorder : AppTheme.border),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(children: [
            Container(
              width: 34,
              height: 34,
              decoration: BoxDecoration(
                color: color.withValues(alpha: 0.12),
                borderRadius: BorderRadius.circular(10),
              ),
              child: Icon(icon, size: 17, color: color),
            ),
            const SizedBox(width: 10),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  fontSize: 11.5,
                  fontWeight: FontWeight.w500,
                  color: isDark
                      ? AppTheme.darkTextMuted
                      : AppTheme.textMuted,
                ),
              ),
            ),
          ]),
          const SizedBox(height: 12),
          Text(
            value,
            style: TextStyle(
              fontSize: 26,
              fontWeight: FontWeight.w800,
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

class _MiniPill extends StatelessWidget {
  final String text;
  final Color color;

  const _MiniPill({required this.text, required this.color});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.10),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Text(
        text,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w700,
          color: color,
        ),
      ),
    );
  }
}

class _EmptyState extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final bool isDark;

  const _EmptyState({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.isDark,
  });

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
            child: Icon(
                icon, size: 36,
                color: AppTheme.primary.withValues(alpha: 0.4)),
          ),
          const SizedBox(height: 20),
          Text(title,
              style: TextStyle(
                  fontSize: 17,
                  fontWeight: FontWeight.w700,
                  color: isDark
                      ? AppTheme.darkTextPrimary
                      : AppTheme.textPrimary)),
          const SizedBox(height: 6),
          Text(subtitle,
              style: TextStyle(
                  fontSize: 13,
                  color: isDark
                      ? AppTheme.darkTextMuted
                      : AppTheme.textMuted),
              textAlign: TextAlign.center),
        ]),
      ),
    );
  }
}