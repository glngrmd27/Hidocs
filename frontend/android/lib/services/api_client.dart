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
  static const String baseUrl = AppConstants.appBaseUrl;

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
    final response = await http.get(_uri(path, query), headers: _headers());

    return _parse(response);
  }

  static Future<dynamic> post(
    String path, {
    Object? body,
    bool json = true,
  }) async {
    final response = await http.post(
      _uri(path),
      headers: _headers(),
      body: json ? jsonEncode(body ?? {}) : body,
    );

    return _parse(response);
  }

  static Future<dynamic> put(String path, {Object? body}) async {
    final response = await http.put(
      _uri(path),
      headers: _headers(),
      body: jsonEncode(body ?? {}),
    );

    return _parse(response);
  }

  static Future<dynamic> delete(String path) async {
    final response = await http.delete(_uri(path), headers: _headers());

    return _parse(response);
  }

  static Future<Uint8List> getBytes(
    String path, {
    Map<String, String>? query,
  }) async {
    final response = await http.get(_uri(path, query), headers: _headers());

    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.bodyBytes;
    }

    throw ApiException(
      'Terjadi kesalahan saat mengunduh (${response.statusCode})',
      statusCode: response.statusCode,
    );
  }
}
