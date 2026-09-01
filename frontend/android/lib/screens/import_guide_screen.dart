import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import '../app_theme.dart';

class ImportGuideScreen extends StatefulWidget {
  final String initialTab; // 'word' or 'excel'

  const ImportGuideScreen({
    super.key,
    this.initialTab = 'word',
  });

  @override
  State<ImportGuideScreen> createState() => _ImportGuideScreenState();
}

class _ImportGuideScreenState extends State<ImportGuideScreen>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(
      length: 2,
      vsync: this,
      initialIndex: widget.initialTab == 'excel' ? 1 : 0,
    );
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  void _copyToClipboard(String text, String message) {
    Clipboard.setData(ClipboardData(text: text));
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Row(
          children: [
            const Icon(Icons.check_circle_rounded, color: Colors.white, size: 18),
            const SizedBox(width: 8),
            Expanded(child: Text(message)),
          ],
        ),
        backgroundColor: AppTheme.success,
        behavior: SnackBarBehavior.floating,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
        duration: const Duration(seconds: 2),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;

    return Scaffold(
      backgroundColor: isDark ? AppTheme.darkBg : AppTheme.surfaceLight,
      appBar: AppBar(
        title: const Text(
          'Panduan Format Impor',
          style: TextStyle(fontWeight: FontWeight.w800),
        ),
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(48),
          child: Container(
            color: isDark ? AppTheme.darkCard : Colors.white,
            child: TabBar(
              controller: _tabController,
              indicatorColor: AppTheme.primary,
              labelColor: AppTheme.primary,
              unselectedLabelColor:
                  isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
              labelStyle: const TextStyle(fontWeight: FontWeight.w700, fontSize: 13),
              tabs: const [
                Tab(
                  text: 'Dokumen Word (.docx)',
                ),
                Tab(
                  text: 'Spreadsheet Excel (.xlsx)',
                ),
              ],
            ),
          ),
        ),
      ),
      body: TabBarView(
        controller: _tabController,
        children: [
          _WordGuideView(
            isDark: isDark,
            onCopyExample: (text) =>
                _copyToClipboard(text, 'Contoh format Word berhasil disalin!'),
          ),
          _ExcelGuideView(
            isDark: isDark,
            onCopyExample: (text) =>
                _copyToClipboard(text, 'Contoh format Excel berhasil disalin!'),
          ),
        ],
      ),
    );
  }
}

class _WordGuideView extends StatelessWidget {
  final bool isDark;
  final ValueChanged<String> onCopyExample;

  const _WordGuideView({
    required this.isDark,
    required this.onCopyExample,
  });

  static const String wordExampleText = '''1. Apa ibu kota negara Indonesia?
A. Surabaya
*B. Nusantara
C. Bandung
D. Medan

2. Jelaskan pengertian dari Fotosintesis!
[Essay]

3. Apakah air mendidih pada suhu 100 derajat Celsius?
*A. Ya
B. Tidak''';

  @override
  Widget build(BuildContext context) {
    final cardBg = isDark ? AppTheme.darkCard : Colors.white;
    final borderClr = isDark ? AppTheme.darkBorder : AppTheme.border;
    final primaryTxt = isDark ? AppTheme.darkTextPrimary : AppTheme.textPrimary;
    final mutedTxt = isDark ? AppTheme.darkTextMuted : AppTheme.textMuted;

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        // Overview card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.primary.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.primary.withValues(alpha: 0.2)),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppTheme.primary.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.description_rounded,
                    color: AppTheme.primary, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Impor Otomatis Dokumen Word',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: primaryTxt,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Sistem akan membaca soal & opsi secara otomatis dari file .docx Anda.',
                      style: TextStyle(fontSize: 12, color: mutedTxt, height: 1.4),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        // Rules Section
        Text(
          'Aturan Penulisan Dokumen',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: primaryTxt,
          ),
        ),
        const SizedBox(height: 12),

        _RuleTile(
          number: '1',
          title: 'Format Soal (Nomor)',
          description:
              'Gunakan penomoran diawali angka dan titik / kurung. Contoh: "1.", "Soal 1", atau "Q1."',
          isDark: isDark,
        ),
        _RuleTile(
          number: '2',
          title: 'Pilihan Ganda (Opsi)',
          description:
              'Awali opsi dengan huruf A., B., C., D. atau a), b), c). Tulis setiap opsi di baris baru.',
          isDark: isDark,
        ),
        _RuleTile(
          number: '3',
          title: 'Kunci Jawaban (Pilihan Ganda)',
          description:
              'Berikan tanda bintang (*) di depan huruf opsi benar (contoh: "*B. Jawaban Benar") atau tambahkan baris "Kunci Jawaban: B" di bawah soal.',
          isDark: isDark,
        ),
        _RuleTile(
          number: '4',
          title: 'Soal Essay / Isian',
          description:
              'Untuk membuat soal essay tanpa opsi pilihan ganda, cukup tuliskan "[Essay]" atau tidak memberikan pilihan opsi A-D di bawah soal.',
          isDark: isDark,
        ),
        const SizedBox(height: 20),

        // Preview Example Code Box
        Row(
          children: [
            Expanded(
              child: Text(
                'Contoh Teks Dokumen Word',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: primaryTxt,
                ),
              ),
            ),
            TextButton.icon(
              onPressed: () => onCopyExample(wordExampleText),
              icon: const Icon(Icons.copy_rounded, size: 16),
              label: const Text('Salin Contoh'),
              style: TextButton.styleFrom(
                foregroundColor: AppTheme.primary,
                visualDensity: VisualDensity.compact,
                padding: const EdgeInsets.symmetric(horizontal: 8),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: borderClr),
          ),
          child: const Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              SelectableText(
                wordExampleText,
                style: TextStyle(
                  fontFamily: 'monospace',
                  fontSize: 13,
                  height: 1.5,
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

class _ExcelGuideView extends StatelessWidget {
  final bool isDark;
  final ValueChanged<String> onCopyExample;

  const _ExcelGuideView({
    required this.isDark,
    required this.onCopyExample,
  });

  static const String excelCsvExample = '''No,Soal,Tipe,Opsi A,Opsi B,Opsi C,Opsi D,Kunci Jawaban,Poin
1,Apa ibu kota Indonesia?,PG,Surabaya,Nusantara,Bandung,Medan,B,10
2,Jelaskan Fotosintesis!,Essay,,,,,,15
3,Apakah bumi itu bulat?,YaTidak,Ya,Tidak,,,A,5''';

  @override
  Widget build(BuildContext context) {
    final cardBg = isDark ? AppTheme.darkCard : Colors.white;
    final borderClr = isDark ? AppTheme.darkBorder : AppTheme.border;
    final primaryTxt = isDark ? AppTheme.darkTextPrimary : AppTheme.textPrimary;
    final mutedTxt = isDark ? AppTheme.darkTextMuted : AppTheme.textMuted;

    return ListView(
      padding: const EdgeInsets.all(20),
      children: [
        // Overview card
        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: AppTheme.success.withValues(alpha: 0.08),
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: AppTheme.success.withValues(alpha: 0.2)),
          ),
          child: Row(
            children: [
              Container(
                width: 44,
                height: 44,
                decoration: BoxDecoration(
                  color: AppTheme.success.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: const Icon(Icons.table_chart_rounded,
                    color: AppTheme.success, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Impor Tabel Spreadsheet Excel',
                      style: TextStyle(
                        fontSize: 15,
                        fontWeight: FontWeight.w800,
                        color: primaryTxt,
                      ),
                    ),
                    const SizedBox(height: 2),
                    Text(
                      'Susun kolom spreadsheet Excel (.xlsx) sesuai dengan tata letak header di bawah.',
                      style: TextStyle(fontSize: 12, color: mutedTxt, height: 1.4),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 20),

        Text(
          'Struktur Header Kolom Excel',
          style: TextStyle(
            fontSize: 16,
            fontWeight: FontWeight.w800,
            color: primaryTxt,
          ),
        ),
        const SizedBox(height: 12),

        // Table Structure representation
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          child: Container(
            decoration: BoxDecoration(
              color: cardBg,
              borderRadius: BorderRadius.circular(14),
              border: Border.all(color: borderClr),
            ),
            child: DataTable(
              headingRowColor: WidgetStateProperty.all(
                AppTheme.primary.withValues(alpha: 0.08),
              ),
              columns: const [
                DataColumn(label: Text('Kolom', style: TextStyle(fontWeight: FontWeight.bold))),
                DataColumn(label: Text('Header', style: TextStyle(fontWeight: FontWeight.bold))),
                DataColumn(label: Text('Deskripsi & Contoh', style: TextStyle(fontWeight: FontWeight.bold))),
              ],
              rows: const [
                DataRow(cells: [
                  DataCell(Text('A')),
                  DataCell(Text('No')),
                  DataCell(Text('Nomor urut soal (1, 2, 3...)')),
                ]),
                DataRow(cells: [
                  DataCell(Text('B')),
                  DataCell(Text('Soal')),
                  DataCell(Text('Teks pertanyaan')),
                ]),
                DataRow(cells: [
                  DataCell(Text('C')),
                  DataCell(Text('Tipe')),
                  DataCell(Text('PG / Essay / YaTidak / Rating / Code')),
                ]),
                DataRow(cells: [
                  DataCell(Text('D - G')),
                  DataCell(Text('Opsi A - D')),
                  DataCell(Text('Pilihan jawaban (Kosongkan jika Essay)')),
                ]),
                DataRow(cells: [
                  DataCell(Text('H')),
                  DataCell(Text('Kunci Jawaban')),
                  DataCell(Text('Huruf opsi benar (misal: A / B / C / D)')),
                ]),
                DataRow(cells: [
                  DataCell(Text('I')),
                  DataCell(Text('Poin')),
                  DataCell(Text('Bobot nilai soal (misal: 10)')),
                ]),
              ],
            ),
          ),
        ),
        const SizedBox(height: 24),

        // Example Box
        Row(
          children: [
            Expanded(
              child: Text(
                'Contoh Baris Excel (CSV)',
                style: TextStyle(
                  fontSize: 14,
                  fontWeight: FontWeight.w800,
                  color: primaryTxt,
                ),
              ),
            ),
            TextButton.icon(
              onPressed: () => onCopyExample(excelCsvExample),
              icon: const Icon(Icons.copy_rounded, size: 16),
              label: const Text('Salin Format'),
              style: TextButton.styleFrom(
                foregroundColor: AppTheme.success,
                visualDensity: VisualDensity.compact,
                padding: const EdgeInsets.symmetric(horizontal: 8),
              ),
            ),
          ],
        ),
        const SizedBox(height: 8),

        Container(
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: cardBg,
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: borderClr),
          ),
          child: const SelectableText(
            excelCsvExample,
            style: TextStyle(
              fontFamily: 'monospace',
              fontSize: 12,
              height: 1.6,
            ),
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }
}

class _RuleTile extends StatelessWidget {
  final String number;
  final String title;
  final String description;
  final bool isDark;

  const _RuleTile({
    required this.number,
    required this.title,
    required this.description,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: isDark ? AppTheme.darkCard : Colors.white,
        borderRadius: BorderRadius.circular(14),
        border: Border.all(color: isDark ? AppTheme.darkBorder : AppTheme.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Container(
            width: 28,
            height: 28,
            alignment: Alignment.center,
            decoration: BoxDecoration(
              color: AppTheme.primary.withValues(alpha: 0.12),
              shape: BoxShape.circle,
            ),
            child: Text(
              number,
              style: const TextStyle(
                color: AppTheme.primary,
                fontWeight: FontWeight.w800,
                fontSize: 13,
              ),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w700,
                    color: isDark ? AppTheme.darkTextPrimary : AppTheme.textPrimary,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  description,
                  style: TextStyle(
                    fontSize: 12,
                    height: 1.4,
                    color: isDark ? AppTheme.darkTextMuted : AppTheme.textMuted,
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
