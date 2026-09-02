import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import {
  FaUsers,
  FaUserTie,
  FaFileAlt,
  FaClipboardCheck,
  FaTasks,
  FaChartLine,
  FaUserCog,
  FaSignOutAlt,
  FaShieldAlt,
} from "react-icons/fa";
import { useContext } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { getDashboardStats } from "../api/adminApi";
import "../assets/css/AdminPages.css";

function AdminDashboard() {
  const navigate = useNavigate();
  const location = useLocation();
  const { darkMode } = useContext(ThemeContext);

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    localStorage.setItem("activeMode", "admin");
  }, [location.pathname]);

  const loadStats = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await getDashboardStats();
      const data = res?.data?.data || res?.data || {};
      setStats(data);
    } catch (err) {
      console.error("Failed to load admin stats:", err);
      setError(
        err?.response?.data?.message ||
          "Gagal memuat statistik dashboard. Pastikan Anda memiliki akses admin."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const statCards = stats
    ? [
        { label: "Total Users", value: stats.total_users ?? 0, icon: <FaUsers />, color: "blue" },
        { label: "Total Creators", value: stats.total_creators ?? 0, icon: <FaUserTie />, color: "purple" },
        { label: "Total Forms", value: stats.total_forms ?? 0, icon: <FaFileAlt />, color: "green" },
        { label: "Active Exams", value: stats.active_exams ?? 0, icon: <FaTasks />, color: "orange" },
        { label: "Total Responses", value: stats.total_responses ?? 0, icon: <FaClipboardCheck />, color: "red" },
      ]
    : [];

  return (
    <div className={darkMode ? "admin-page dark" : "admin-page"}>
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-header-icon">
            <FaShieldAlt />
          </div>
          <div className="admin-header-title">
            <span>HiDocs</span>
            <h1>Admin Dashboard</h1>
          </div>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="admin-header-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <nav className="admin-navbar">
        <Link to="/admin" className="admin-nav-link active">
          <FaChartLine /> Dashboard
        </Link>
        <Link to="/admin/creators" className="admin-nav-link">
          <FaUserCog /> Manage Creators
        </Link>
        <Link to="/admin/forms" className="admin-nav-link">
          <FaFileAlt /> All Forms
        </Link>
        <Link to="/admin/monitoring" className="admin-nav-link">
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
            <button
              type="button"
              className="admin-action-btn primary"
              style={{ marginTop: 10 }}
              onClick={loadStats}
            >
              Ulangi
            </button>
          </div>
        )}

        {loading ? (
          <div className="admin-panel">
            <p style={{ margin: 0 }}>Memuat data...</p>
          </div>
        ) : (
          <div className="admin-stats-grid">
            {statCards.map((card) => (
              <div className="admin-stat-card" key={card.label}>
                <div className={`admin-stat-icon ${card.color}`}>{card.icon}</div>
                <div className="admin-stat-info">
                  <strong>{card.value}</strong>
                  <span>{card.label}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="admin-panel">
          <div className="admin-panel-title">
            <h2>Menu Admin</h2>
            <span>Kelola pengguna &amp; form platform</span>
          </div>
          <div className="admin-stats-grid">
            <Link to="/admin/creators" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="admin-stat-card">
                <div className="admin-stat-icon purple">
                  <FaUserCog />
                </div>
                <div className="admin-stat-info">
                  <strong>Creators</strong>
                  <span>Daftar &amp; buat akun creator</span>
                </div>
              </div>
            </Link>
            <Link to="/admin/forms" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="admin-stat-card">
                <div className="admin-stat-icon green">
                  <FaFileAlt />
                </div>
                <div className="admin-stat-info">
                  <strong>Forms</strong>
                  <span>Semua form di platform</span>
                </div>
              </div>
            </Link>
            <Link to="/admin/monitoring" style={{ textDecoration: "none", color: "inherit" }}>
              <div className="admin-stat-card">
                <div className="admin-stat-icon orange">
                  <FaTasks />
                </div>
                <div className="admin-stat-info">
                  <strong>Monitoring</strong>
                  <span>Traffic &amp; telemetry realtime</span>
                </div>
              </div>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminDashboard;