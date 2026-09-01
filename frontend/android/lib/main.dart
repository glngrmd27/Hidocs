import 'package:flutter/material.dart';
import 'package:flutter_dotenv/flutter_dotenv.dart';
import 'package:flutter_quill/flutter_quill.dart';
import 'package:flutter_localizations/flutter_localizations.dart';
import 'package:provider/provider.dart';
import 'app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/language_provider.dart';
import 'providers/form_provider.dart';
import 'providers/response_provider.dart';
import 'providers/admin_provider.dart';
import 'providers/metrics_provider.dart';
import 'screens/admin_dashboard_screen.dart';
import 'screens/admin_traffic_screen.dart';
import 'screens/creator_home_screen.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/role_selection_screen.dart';
import 'screens/user_home_screen.dart';
import 'l10n/app_localizations.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await dotenv.load(fileName: ".env");
    print('✅ .env loaded successfully');
    print('🔗 API_BASE_URL: ${dotenv.env['API_BASE_URL']}');
  } catch (e) {
    print('⚠️ .env not found, using default URL');
    // .env optional saat test/widget test - fallback ke AppConstants default
  }
  runApp(const FormMakerApp());
}

class FormMakerApp extends StatelessWidget {
  const FormMakerApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MultiProvider(
      providers: [
        ChangeNotifierProvider(create: (_) => AuthProvider()),
        ChangeNotifierProvider(create: (_) => ThemeProvider()),
        ChangeNotifierProvider(create: (_) => LanguageProvider()),
        ChangeNotifierProvider(create: (_) => FormProvider()),
        ChangeNotifierProvider(create: (_) => ResponseProvider()),
        ChangeNotifierProvider(create: (_) => AdminProvider()),
        ChangeNotifierProvider(create: (_) => MetricsProvider()),
      ],
      child: Consumer2<ThemeProvider, LanguageProvider>(
        builder: (context, themeProvider, languageProvider, _) {
          return MaterialApp(
            title: 'HiDocs!',
            debugShowCheckedModeBanner: false,
            localizationsDelegates: const [
              AppLocalizationsDelegate(),
              FlutterQuillLocalizations.delegate,
              GlobalMaterialLocalizations.delegate,
              GlobalWidgetsLocalizations.delegate,
              GlobalCupertinoLocalizations.delegate,
            ],
            supportedLocales: const [
              Locale('en'),
              Locale('id'),
            ],
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeProvider.themeMode,
            locale: languageProvider.locale,
            home: const AuthWrapper(),
            routes: {
              '/login': (context) => const LoginScreen(),
              '/register': (context) => const RegisterScreen(),
              '/role-select': (context) => const RoleSelectionScreen(),
              '/user-home': (context) => const UserHomeScreen(),
              '/creator-home': (context) => const CreatorHomeScreen(),
              '/admin-home': (context) => const AdminDashboardScreen(),
              '/super-admin-home': (context) => const AdminDashboardScreen(),
              '/admin-traffic': (context) => const AdminTrafficScreen(),
            },
          );
        },
      ),
    );
  }
}

class AuthWrapper extends StatelessWidget {
  const AuthWrapper({super.key});

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final formProvider = Provider.of<FormProvider>(context, listen: false);

    if (auth.isLoggedIn && auth.currentUser != null) {
      formProvider.updateUser(auth.currentUser!.id);
      return const RoleSelectionScreen();
    } else {
      formProvider.clearUserCache();
    }

    return const LoginScreen();
  }
}
