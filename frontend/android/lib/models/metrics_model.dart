class RealtimeMetricsModel {
  final double requestsPerSecond;
  final int activeConcurrentUsers;
  final double latencyP95Ms;
  final double latencyP99Ms;
  final int totalRequestsProcessed;
  final int totalErrorCount;
  final String serverStatus;

  RealtimeMetricsModel({
    required this.requestsPerSecond,
    required this.activeConcurrentUsers,
    required this.latencyP95Ms,
    required this.latencyP99Ms,
    required this.totalRequestsProcessed,
    required this.totalErrorCount,
    required this.serverStatus,
  });

  factory RealtimeMetricsModel.fromJson(Map<String, dynamic> json) {
    return RealtimeMetricsModel(
      requestsPerSecond: (json['requests_per_second'] as num?)?.toDouble() ?? 0.0,
      activeConcurrentUsers: (json['active_concurrent_users'] as num?)?.toInt() ?? 0,
      latencyP95Ms: (json['latency_p95_ms'] as num?)?.toDouble() ?? 0.0,
      latencyP99Ms: (json['latency_p99_ms'] as num?)?.toDouble() ?? 0.0,
      totalRequestsProcessed: (json['total_requests_processed'] as num?)?.toInt() ?? 0,
      totalErrorCount: (json['total_error_count'] as num?)?.toInt() ?? 0,
      serverStatus: (json['server_status'] ?? 'HEALTHY').toString(),
    );
  }
}

class SystemMetricsModel {
  final double cpuUsagePercent;
  final int goroutinesCount;
  final double memoryAllocatedMb;
  final int dbMaxConnections;
  final int dbOpenConnections;
  final int dbInUse;
  final int dbIdle;

  SystemMetricsModel({
    required this.cpuUsagePercent,
    required this.goroutinesCount,
    required this.memoryAllocatedMb,
    required this.dbMaxConnections,
    required this.dbOpenConnections,
    required this.dbInUse,
    required this.dbIdle,
  });

  factory SystemMetricsModel.fromJson(Map<String, dynamic> json) {
    return SystemMetricsModel(
      cpuUsagePercent: (json['cpu_usage_percent'] as num?)?.toDouble() ?? 0.0,
      goroutinesCount: (json['goroutines_count'] as num?)?.toInt() ?? 0,
      memoryAllocatedMb: (json['memory_allocated_mb'] as num?)?.toDouble() ?? 0.0,
      dbMaxConnections: (json['db_max_connections'] as num?)?.toInt() ?? 0,
      dbOpenConnections: (json['db_open_connections'] as num?)?.toInt() ?? 0,
      dbInUse: (json['db_in_use'] as num?)?.toInt() ?? 0,
      dbIdle: (json['db_idle'] as num?)?.toInt() ?? 0,
    );
  }
}

class LiveExamMetricsModel {
  final String formId;
  final String formTitle;
  final int activeStudents;
  final int submissionsCompleted;

  LiveExamMetricsModel({
    required this.formId,
    required this.formTitle,
    required this.activeStudents,
    required this.submissionsCompleted,
  });

  factory LiveExamMetricsModel.fromJson(Map<String, dynamic> json) {
    return LiveExamMetricsModel(
      formId: (json['form_id'] ?? '').toString(),
      formTitle: (json['form_title'] ?? '-').toString(),
      activeStudents: (json['active_students'] as num?)?.toInt() ?? 0,
      submissionsCompleted: (json['submissions_completed'] as num?)?.toInt() ?? 0,
    );
  }
}

class TrafficHistoryModel {
  final List<String> timestamps;
  final List<double> rpsSeries;
  final List<double> latencyMsSeries;
  final List<int> errorSeries;

  TrafficHistoryModel({
    required this.timestamps,
    required this.rpsSeries,
    required this.latencyMsSeries,
    required this.errorSeries,
  });

  factory TrafficHistoryModel.fromJson(Map<String, dynamic> json) {
    return TrafficHistoryModel(
      timestamps: List<String>.from(json['timestamps'] ?? []),
      rpsSeries: (json['rps_series'] as List? ?? []).map((e) => (e as num).toDouble()).toList(),
      latencyMsSeries: (json['latency_ms_series'] as List? ?? []).map((e) => (e as num).toDouble()).toList(),
      errorSeries: (json['error_series'] as List? ?? []).map((e) => (e as num).toInt()).toList(),
    );
  }
}
