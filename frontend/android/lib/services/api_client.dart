import 'dart:convert';
import 'dart:typed_data';

import 'package:http/http.dart' as http;

import '../utils/constants.dart';

class ApiException implements Exception {
  final String message;
  final int? statusCode;

  ApiException(this.message, {this.statusCode});

  @override
  String toString() => message;
}

class RateLimitException extends ApiException {
  final int retryAfterSeconds;

  RateLimitException(
    super.message, {
    super.statusCode = 429,
    this.retryAfterSeconds = 10,
  });
}

class ApiClient {
  static String get baseUrl => AppConstants.appBaseUrl;

  static const Duration _timeout = Duration(seconds: 30);

  static String? token;

  static Map<String, String> _headers({bool json = true}) {
    final headers = <String, String>{'Accept': 'application/json'};

    if (json) {
      headers['Content-Type'] = 'application/json';
    }

    if (token != null && token!.isNotEmpty) {
      headers['Authorization'] = 'Bearer $token';
    }

    return headers;
  }

  static Future<dynamic> _parse(http.Response response) async {
    dynamic decoded;

    try {
      decoded = jsonDecode(response.body);
    } catch (_) {
      decoded = null;
    }

    if (response.statusCode == 429) {
      int retryAfter = 10;
      final retryHeader = response.headers['retry-after'];
      if (retryHeader != null) {
        retryAfter = int.tryParse(retryHeader) ?? 10;
      } else if (decoded is Map && decoded['retry_after_seconds'] != null) {
        retryAfter = int.tryParse(decoded['retry_after_seconds'].toString()) ?? 10;
      }
      var msg = 'Terlalu banyak permintaan (429). Silakan tunggu sebentar.';
      if (decoded is Map && (decoded['error'] != null || decoded['message'] != null)) {
        msg = (decoded['error'] ?? decoded['message']).toString();
      }
      throw RateLimitException(msg, statusCode: 429, retryAfterSeconds: retryAfter);
    }

    if (response.statusCode >= 200 && response.statusCode < 300) {
      if (decoded is Map && decoded.containsKey('data')) {
        return decoded['data'];
      }

      return decoded;
    }

    var message = 'Terjadi kesalahan (${response.statusCode})';

    if (decoded is Map) {
      if (decoded['message'] != null) {
        message = decoded['message'].toString();
      } else if (decoded['error'] != null) {
        message = decoded['error'].toString();
      }
    } else if (response.body.isNotEmpty) {
      message = response.body;
    }

    throw ApiException(message, statusCode: response.statusCode);
  }

  static Uri _uri(String path, [Map<String, String>? query]) {
    return Uri.parse('$baseUrl$path').replace(queryParameters: query);
  }

  static Future<dynamic> get(
    String path, {
    Map<String, String>? query,
  }) async {
    final response =
        await http.get(_uri(path, query), headers: _headers()).timeout(
      _timeout,
      onTimeout: () => throw ApiException(
        'Koneksi timeout. Periksa jaringan Anda.',
      ),
    );

    return _parse(response);
  }

  static Future<dynamic> post(
    String path, {
    Object? body,
    bool json = true,
  }) async {
    print('🌐 POST Request: ${_uri(path)}');
    print('📦 Body: ${json ? jsonEncode(body ?? {}) : body}');

    final response = await http
        .post(
          _uri(path),
          headers: _headers(),
          body: json ? jsonEncode(body ?? {}) : body,
        )
        .timeout(
      _timeout,
      onTimeout: () => throw ApiException(
        'Koneksi timeout. Periksa jaringan Anda.',
      ),
    );

    print('📥 Response Status: ${response.statusCode}');
    print('📥 Response Body: ${response.body}');

    return _parse(response);
  }

  static Future<dynamic> put(String path, {Object? body}) async {
    final response = await http
        .put(
          _uri(path),
          headers: _headers(),
          body: jsonEncode(body ?? {}),
        )
        .timeout(
      _timeout,
      onTimeout: () => throw ApiException(
        'Koneksi timeout. Periksa jaringan Anda.',
      ),
    );

    return _parse(response);
  }

  static Future<dynamic> delete(String path) async {
    final response = await http
        .delete(_uri(path), headers: _headers())
        .timeout(
      _timeout,
      onTimeout: () => throw ApiException(
        'Koneksi timeout. Periksa jaringan Anda.',
      ),
    );

    return _parse(response);
  }

  static Future<Uint8List> getBytes(
    String path, {
    Map<String, String>? query,
  }) async {
    final response =
        await http.get(_uri(path, query), headers: _headers()).timeout(
      _timeout,
      onTimeout: () => throw ApiException(
        'Koneksi timeout. Periksa jaringan Anda.',
      ),
    );

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.bodyBytes;
    }

    throw ApiException(
      'Terjadi kesalahan saat mengunduh (${response.statusCode})',
      statusCode: response.statusCode,
    );
  }

  /// Upload a .docx file to import-docx endpoint.
  static Future<dynamic> importDocx({
    String? filePath,
    Uint8List? fileBytes,
    String? fileName,
  }) async {
    return _importFile(
      endpoint: '/forms/import-docx',
      filePath: filePath,
      fileBytes: fileBytes,
      fileName: fileName ?? 'document.docx',
    );
  }

  /// Upload an .xlsx/.csv file to import-excel endpoint.
  static Future<dynamic> importExcel({
    String? filePath,
    Uint8List? fileBytes,
    String? fileName,
  }) async {
    return _importFile(
      endpoint: '/forms/import-excel',
      filePath: filePath,
      fileBytes: fileBytes,
      fileName: fileName ?? 'spreadsheet.xlsx',
    );
  }

  static Future<dynamic> _importFile({
    required String endpoint,
    String? filePath,
    Uint8List? fileBytes,
    required String fileName,
  }) async {
    final uri = _uri(endpoint);
    final request = http.MultipartRequest('POST', uri);

    request.headers['Accept'] = 'application/json';
    if (token != null && token!.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
    }

    if (filePath != null && filePath.isNotEmpty) {
      request.files.add(
        await http.MultipartFile.fromPath(
          'file',
          filePath,
          filename: fileName,
        ),
      );
    } else if (fileBytes != null) {
      request.files.add(
        http.MultipartFile.fromBytes(
          'file',
          fileBytes,
          filename: fileName,
        ),
      );
    } else {
      throw ApiException('File tidak ditemukan');
    }

    final streamed = await request.send().timeout(
      const Duration(seconds: 60),
      onTimeout: () => throw ApiException(
        'Koneksi timeout. Periksa jaringan Anda.',
      ),
    );

    final response = await http.Response.fromStream(streamed);

    return _parse(response);
  }

  // --- Task 01: Admin & Superadmin Endpoints ---
  static Future<String?> uploadQuestionImage(Uint8List bytes, String fileName) async {
    final uri = _uri('/questions/upload-image');
    final request = http.MultipartRequest('POST', uri);
    request.headers['Accept'] = 'application/json';
    if (token != null && token!.isNotEmpty) {
      request.headers['Authorization'] = 'Bearer $token';
    }
    request.files.add(http.MultipartFile.fromBytes('image', bytes, filename: fileName));
    final streamed = await request.send().timeout(
      const Duration(seconds: 30),
      onTimeout: () => throw ApiException('Koneksi timeout. Periksa jaringan Anda.'),
    );
    final response = await http.Response.fromStream(streamed);
    final data = await _parse(response);
    if (data is Map && data['img_url'] != null) return data['img_url'].toString();
    if (data is Map && data['image_url'] != null) return data['image_url'].toString();
    // fallback: if backend returns full URL string
    if (data is String) return data;
    return null;
  }

  static Future<dynamic> getAdminDashboardStats() => get('/admin/dashboard/stats');
  static Future<dynamic> getAdminCreators() => get('/admin/creators');
  static Future<dynamic> createCreator(Map<String, dynamic> data) => post('/admin/creators', body: data);
  static Future<dynamic> updateCreatorStatus(String creatorId, bool isActive) => put('/admin/creators/$creatorId/status', body: {'is_active': isActive});
  static Future<dynamic> getAdminForms() => get('/admin/forms');
  static Future<dynamic> deleteAdminForm(String formId) => delete('/admin/forms/$formId');

  static Future<dynamic> getSuperadminAdmins() => get('/superadmin/list-admin');
  static Future<dynamic> createSuperadminAdmin(Map<String, dynamic> data) => post('/superadmin/create-admin', body: data);

  // --- Task 03: Telemetry & Traffic Endpoints ---
  static Future<dynamic> getRealtimeMetrics() => get('/admin/metrics/realtime');
  static Future<dynamic> getSystemMetrics() => get('/admin/metrics/system');
  static Future<dynamic> getLiveExamsMetrics() => get('/admin/metrics/live-exams');
  static Future<dynamic> getTrafficHistoryMetrics({String duration = '1h'}) => get('/admin/metrics/traffic-history', query: {'duration': duration});
  static Future<dynamic> getFormMetrics(String formId) => get('/admin/metrics/forms/$formId');
}
