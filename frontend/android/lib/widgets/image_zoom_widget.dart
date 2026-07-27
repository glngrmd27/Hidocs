import 'package:flutter/material.dart';
import '../app_theme.dart';

class ImageZoomWidget extends StatelessWidget {
  final String imageUrl;
  final double height;

  const ImageZoomWidget({
    required this.imageUrl,
    this.height = 200,
    super.key,
  });

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () => Navigator.push(
        context,
        MaterialPageRoute(builder: (_) => _FullScreenZoom(imageUrl: imageUrl)),
      ),
      child: ClipRRect(
        borderRadius: BorderRadius.circular(14),
        child: Container(
          height: height,
          color: AppTheme.primaryFaint,
          child: Stack(fit: StackFit.expand, children: [
            // Placeholder / image
            Center(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                Icon(Icons.image_rounded, size: 52,
                    color: AppTheme.primary.withOpacity(0.30)),
                const SizedBox(height: 8),
                Text('Ketuk untuk zoom HD',
                    style: TextStyle(fontSize: 13,
                        color: AppTheme.textMuted)),
              ]),
            ),
            // HD badge
            Positioned(top: 10, left: 10,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                decoration: BoxDecoration(
                  color: AppTheme.primary,
                  borderRadius: BorderRadius.circular(6),
                ),
                child: const Text('HD', style: TextStyle(
                    color: Colors.white, fontSize: 10,
                    fontWeight: FontWeight.w800, letterSpacing: 0.5)),
              ),
            ),
            // Zoom indicator
            Positioned(bottom: 10, right: 10,
              child: Container(
                padding: const EdgeInsets.all(7),
                decoration: BoxDecoration(
                  color: Colors.black.withOpacity(0.50),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: const Icon(Icons.zoom_in_rounded,
                    color: Colors.white, size: 18),
              ),
            ),
          ]),
        ),
      ),
    );
  }
}

class _FullScreenZoom extends StatelessWidget {
  final String imageUrl;
  const _FullScreenZoom({required this.imageUrl});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: Colors.black,
      appBar: AppBar(
        backgroundColor: const Color(0xFF0D0D0D),
        foregroundColor: Colors.white,
        title: const Text('Gambar HD', style: TextStyle(fontSize: 16)),
        actions: [
          IconButton(
            icon: const Icon(Icons.close_rounded),
            onPressed: () => Navigator.pop(context),
          ),
        ],
      ),
      body: Center(
        child: InteractiveViewer(
          minScale: 0.5,
          maxScale: 5.0,
          child: Container(
            margin: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF1A1A2A),
              borderRadius: BorderRadius.circular(14),
            ),
            child: Center(
              child: Column(mainAxisSize: MainAxisSize.min, children: [
                const Icon(Icons.image_rounded, size: 100, color: Colors.white24),
                const SizedBox(height: 16),
                const Text('Gambar akan ditampilkan di sini',
                    style: TextStyle(color: Colors.white54, fontSize: 14)),
                const SizedBox(height: 6),
                Text('Pinch to zoom  •  Drag to pan',
                    style: TextStyle(color: Colors.white38, fontSize: 12)),
              ]),
            ),
          ),
        ),
      ),
    );
  }
}
