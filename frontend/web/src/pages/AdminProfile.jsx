import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaChartLine,
  FaUserCog,
  FaFileAlt,
  FaTasks,
  FaSignOutAlt,
  FaShieldAlt,
  FaEnvelope,
  FaUser,
} from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext";
import "../assets/css/AdminPages.css";

function AdminProfile() {
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  const [userInfo, setUserInfo] = useState({
    name: "Admin",
    email: "admin@hidocs.app",
    role: "admin",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem("user");
      if (!raw) return;
      const parsed = JSON.parse(raw);
      setUserInfo({
        name: parsed.name || parsed.username || "Admin",
        email: parsed.email || "admin@hidocs.app",
        role: parsed.role || "admin",
      });
    } catch (err) {
      console.error("Failed to read admin profile:", err);
    }
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const goToUserMode = () => {
    localStorage.setItem("activeMode", "user");
    navigate("/dashboard");
  };

  const avatarInitial = (userInfo.name || "A").trim().charAt(0).toUpperCase();

  return (
    <div className={darkMode ? "admin-page dark" : "admin-page"}>
      <header className="admin-header">
        <div className="admin-header-left">
          <div className="admin-header-icon">
            <FaShieldAlt />
          </div>
          <div className="admin-header-title">
            <span>HiDocs</span>
            <h1>Admin Profile</h1>
          </div>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="admin-header-btn" onClick={goToUserMode}>
            <FaUser /> Mode User
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
        <Link to="/admin/monitoring" className="admin-nav-link">
          <FaTasks /> Monitoring
        </Link>
        <Link to="/admin/profile" className="admin-nav-link active">
          <FaUserCog /> Profile
        </Link>
      </nav>

      <main className="admin-content">
        <div className="admin-panel" style={{ maxWidth: 560, margin: "0 auto" }}>
          <div style={{ textAlign: "center", marginBottom: 18 }}>
            <div
              style={{
                width: 72,
                height: 72,
                borderRadius: "50%",
                background: "#2563eb",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 28,
                fontWeight: 700,
                margin: "0 auto 12px",
              }}
            >
              {avatarInitial}
            </div>
            <h2 style={{ margin: 0, fontSize: 20 }}>{userInfo.name}</h2>
            <span className="admin-badge active" style={{ marginTop: 8 }}>
              {String(userInfo.role).toUpperCase()}
            </span>
          </div>

          <div className="admin-form-group">
            <label><FaEnvelope style={{ marginRight: 6 }} /> Email</label>
            <div className="admin-input">{userInfo.email}</div>
          </div>

          <button
            type="button"
            className="admin-action-btn primary"
            style={{ width: "100%", justifyContent: "center" }}
            onClick={goToUserMode}
          >
            <FaUser /> Lanjut ke Mode User
          </button>
        </div>
      </main>
    </div>
  );
}

export default AdminProfile;