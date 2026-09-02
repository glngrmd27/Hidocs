import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaChartLine,
  FaTachometerAlt,
  FaUserClock,
  FaFileAlt,
  FaSignOutAlt,
  FaShieldAlt,
  FaUserCog,
  FaTasks,
  FaMicrochip,
  FaDatabase,
  FaSync,
} from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext";
import {
  getRealtimeMetrics,
  getSystemMetrics,
  getLiveExams,
  getTrafficHistory,
} from "../api/adminApi";
import "../assets/css/AdminPages.css";

function AdminMonitoring() {
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  const [realtime, setRealtime] = useState(null);
  const [system, setSystem] = useState(null);
  const [exams, setExams] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAll = async () => {
    setLoading(true);
    setError("");
    try {
      const [r, s, e, h] = await Promise.all([
        getRealtimeMetrics(),
        getSystemMetrics(),
        getLiveExams(),
        getTrafficHistory("1h"),
      ]);
      setRealtime(r?.data?.data || r?.data || null);
      setSystem(s?.data?.data || s?.data || null);
      setExams(e?.data?.data || (Array.isArray(e?.data) ? e?.data : []));
      setHistory(h?.data?.data?.time_series || h?.data?.time_series || []);
    } catch (err) {
      console.error("Failed to load metrics:", err);
      setError(
        err?.response?.data?.message ||
          "Gagal memuat data monitoring. Pastikan Anda memiliki akses admin."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
    const timer = setInterval(loadAll, 15000);
    return () => clearInterval(timer);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const num = (v, digits = 2) => {
    const n = Number(v ?? 0);
    return Number.isFinite(n) ? n.toFixed(digits) : "0";
  };

  return (
    <div className={darkMode ? "admin-page dark" : "admin-page"}>
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-header-icon">
            <FaShieldAlt />
          </div>
          <div className="admin-header-title">
            <span>HiDocs</span>
            <h1>Monitoring</h1>
          </div>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="admin-header-btn" onClick={loadAll}>
            <FaSync /> Refresh
          </button>
          <button type="button" className="admin-header-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <nav className="admin-navbar">
        <Link to="/admin" className="admin-nav-link">
          <FaChartLine /> Dashboard
        </Link>
        <Link to="/admin/creators" className="admin-nav-link">
          <FaUserCog /> Manage Creators
        </Link>
        <Link to="/admin/forms" className="admin-nav-link">
          <FaFileAlt /> All Forms
        </Link>
        <Link to="/admin/monitoring" className="admin-nav-link active">
          <FaTasks /> Monitoring
        </Link>
        <Link to="/admin/profile" className="admin-nav-link">
          <FaUserCog /> Profile
        </Link>
      </nav>

      <main className="admin-content">
        {error && (
          <div className="admin-panel" style={{ border: "1px solid #fecaca" }}>
            <p style={{ color: "#b91c1c", margin: 0 }}>
              <strong>{error}</strong>
            </p>
          </div>
        )}

        {loading && !realtime ? (
          <div className="admin-panel">
            <p style={{ margin: 0 }}>Memuat data...</p>
          </div>
        ) : (
          <>
            <div className="admin-panel">
              <div className="admin-panel-title">
                <h2><FaTachometerAlt style={{ marginRight: 8 }} /> Realtime Traffic</h2>
                <span>Update setiap 15 detik</span>
              </div>
              <div className="admin-metric-grid">
                <div className="admin-metric">
                  <span>Active Users</span>
                  <strong>{realtime?.active_users ?? 0}</strong>
                </div>
                <div className="admin-metric">
                  <span>Active Connections</span>
                  <strong>{realtime?.active_connections ?? 0}</strong>
                </div>
                <div className="admin-metric">
                  <span>Requests / Detik</span>
                  <strong>{num(realtime?.requests_per_second)}</strong>
                </div>
                <div className="admin-metric">
                  <span>Submissions / Menit</span>
                  <strong>{realtime?.submissions_per_minute ?? 0}</strong>
                </div>
                <div className="admin-metric">
                  <span>Submissions Hari Ini</span>
                  <strong>{realtime?.total_submissions_today ?? 0}</strong>
                </div>
                <div className="admin-metric">
                  <span>Error Rate</span>
                  <strong>{num(realtime?.error_rate_percent)}%</strong>
                </div>
                <div className="admin-metric">
                  <span>Latency P95</span>
                  <strong>{num(realtime?.p95_response_time_ms)} ms</strong>
                </div>
                <div className="admin-metric">
                  <span>Latency P99</span>
                  <strong>{num(realtime?.p99_response_time_ms)} ms</strong>
                </div>
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-panel-title">
                <h2><FaMicrochip style={{ marginRight: 8 }} /> System Health</h2>
              </div>
              <div className="admin-metric-grid">
                <div className="admin-metric">
                  <span>CPU Usage</span>
                  <strong>{num(system?.cpu?.usage_percent)}%</strong>
                </div>
                <div className="admin-metric">
                  <span>Memory (Alloc)</span>
                  <strong>{num(system?.memory?.alloc_mb)} MB</strong>
                </div>
                <div className="admin-metric">
                  <span>Goroutines</span>
                  <strong>{system?.goroutines_count ?? 0}</strong>
                </div>
                <div className="admin-metric">
                  <span>DB Active Conn</span>
                  <strong>{system?.database_pool?.active_connections ?? 0}</strong>
                </div>
                <div className="admin-metric">
                  <span>DB Idle Conn</span>
                  <strong>{system?.database_pool?.idle_connections ?? 0}</strong>
                </div>
              </div>
            </div>

            <div className="admin-panel">
              <div className="admin-panel-title">
                <h2><FaUserClock style={{ marginRight: 8 }} /> Ujian / Form Berjalan</h2>
                <span>{exams.length} aktif</span>
              </div>
              {exams.length === 0 ? (
                <p style={{ margin: 0, color: "#7a8aa6" }}>
                  Tidak ada ujian/form yang sedang berjalan.
                </p>
              ) : (
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Judul</th>
                        <th>Creator</th>
                        <th>Active Students</th>
                        <th>Submitted</th>
                        <th>Target Students</th>
                      </tr>
                    </thead>
                    <tbody>
                      {exams.map((exam) => (
                        <tr key={exam.form_id}>
                          <td><strong>{exam.title}</strong></td>
                          <td>{exam.creator_name}</td>
                          <td>{exam.active_students ?? 0}</td>
                          <td>{exam.submitted_count ?? 0}</td>
                          <td>{exam.total_target_students ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {history.length > 0 && (
              <div className="admin-panel">
                <div className="admin-panel-title">
                  <h2><FaDatabase style={{ marginRight: 8 }} /> Traffic History (1 Jam)</h2>
                  <span>{history.length} poin</span>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Waktu</th>
                        <th>RPS</th>
                        <th>Latency (ms)</th>
                        <th>Errors</th>
                      </tr>
                    </thead>
                    <tbody>
                      {history.slice(-10).reverse().map((point, index) => (
                        <tr key={index}>
                          <td>{point.time}</td>
                          <td>{num(point.rps)}</td>
                          <td>{num(point.latency_ms)}</td>
                          <td>{point.errors ?? 0}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}

export default AdminMonitoring;