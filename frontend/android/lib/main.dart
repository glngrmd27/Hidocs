import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import 'app_theme.dart';
import 'providers/auth_provider.dart';
import 'providers/theme_provider.dart';
import 'providers/form_provider.dart';
import 'screens/login_screen.dart';
import 'screens/register_screen.dart';
import 'screens/admin_home_screen.dart';
import 'screens/user_home_screen.dart';

void main() {
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
        ChangeNotifierProvider(create: (_) => FormProvider()),
      ],
      child: Consumer<ThemeProvider>(
        builder: (context, themeProvider, _) {
          return MaterialApp(
            title: 'HiDocs!',
            debugShowCheckedModeBanner: false,
            theme: AppTheme.lightTheme,
            darkTheme: AppTheme.darkTheme,
            themeMode: themeProvider.themeMode,
            home: const AuthWrapper(),
            routes: {
              '/login': (context) => const LoginScreen(),
              '/register': (context) => const RegisterScreen(),
              '/admin-home': (context) => const AdminHomeScreen(),
              '/user-home': (context) => UserHomeScreen(),
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

    if (auth.isLoggedIn) {
      if (auth.isAdmin) {
        return const AdminHomeScreen();
      } else {
        return UserHomeScreen();
      }
    }

    return const LoginScreen();
  }
}