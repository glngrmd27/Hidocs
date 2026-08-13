import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:qr_flutter/qr_flutter.dart';

import '../app_theme.dart';
import '../models/form_model.dart';

class QRGeneratorScreen extends StatelessWidget {
  final FormModel form;

  const QRGeneratorScreen({
    super.key,
    required this.form,
  });

  void _copyLink(BuildContext context) {
    Clipboard.setData(
      ClipboardData(text: form.fullLink),
    );

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text("Form link copied"),
        behavior: SnackBarBehavior.floating,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark =
        Theme.of(context).brightness == Brightness.dark;

    final textColor = isDark
        ? AppTheme.darkTextPrimary
        : AppTheme.textPrimary;

    final secondaryColor = isDark
        ? AppTheme.darkTextSecondary
        : AppTheme.textSecondary;

    return Scaffold(
      appBar: AppBar(
        title: const Text(
          "QR Form Link",
        ),
      ),

      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),

        child: Column(
          children: [

            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),

              decoration: BoxDecoration(
                color: isDark
                    ? AppTheme.darkCard
                    : AppTheme.surfaceCard,

                borderRadius:
                    BorderRadius.circular(20),

                border: Border.all(
                  color: isDark
                      ? AppTheme.darkBorder
                      : AppTheme.border,
                ),
              ),

              child: Column(
                children: [
                    
                  Text(
                    form.title,

                    textAlign:
                        TextAlign.center,

                    style: TextStyle(
                      fontSize: 13,
                      fontWeight:
                          FontWeight.w800,

                      color:
                          textColor,
                    ),
                  ),

                  const SizedBox(height: 8),

                  Text(
                    "Scan QR Code to open this form",

                    textAlign:
                        TextAlign.center,

                    style: TextStyle(
                      fontSize: 13,
                      color:
                          secondaryColor,
                    ),
                  ),

                ],
              ),
            ),


            const SizedBox(height: 25),


            Container(
              padding:
                  const EdgeInsets.all(25),

              decoration: BoxDecoration(
                color:
                    Colors.white,

                borderRadius:
                    BorderRadius.circular(28),

                boxShadow: [

                  BoxShadow(
                    color:
                        Colors.black.withValues(
                          alpha: 0.12,
                        ),

                    blurRadius:
                        20,

                    offset:
                        const Offset(0, 8),
                  ),

                ],
              ),

              child: QrImageView(
                data:
                    form.fullLink,

                size:
                    240,
              ),
            ),


            const SizedBox(height: 25),


            Container(
              padding:
                  const EdgeInsets.all(16),

              decoration: BoxDecoration(
                color: isDark
                    ? AppTheme.darkCard
                    : AppTheme.surfaceCard,

                borderRadius:
                    BorderRadius.circular(18),
              ),

              child: Row(
                children: [

                  Expanded(
                    child: Text(
                      form.fullLink,

                      maxLines:
                          2,

                      overflow:
                          TextOverflow.ellipsis,

                      style:
                          const TextStyle(
                        color:
                            AppTheme.info,

                        fontSize:
                            13,
                      ),
                    ),
                  ),


                  IconButton(
                    onPressed:
                        () => _copyLink(context),

                    icon:
                        const Icon(
                      Icons.copy_rounded,
                    ),
                  ),

                ],
              ),
            ),

            const SizedBox(height: 25),
          ],
        ),
      ),
    );
  }
}