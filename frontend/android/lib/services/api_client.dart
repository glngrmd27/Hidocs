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
  /// [filePath] absolute path, [fileBytes] alternative if path is null (web).
  static Future<dynamic> importDocx({
    String? filePath,
    Uint8List? fileBytes,
    String? fileName,
  }) async {
    final uri = _uri('/forms/import-docx');
    final request = http.MultipartRequest('POST', uri);

    // Only Accept + Authorization, let MultipartRequest set Content-Type.
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
          filename: fileName ?? 'document.docx',
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
}
