import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useContext } from "react";
import {
  FaUsers,
  FaUserPlus,
  FaSignOutAlt,
  FaShieldAlt,
  FaChartLine,
  FaFileAlt,
  FaTasks,
  FaUserCog,
  FaToggleOn,
  FaToggleOff,
  FaTimes,
} from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext";
import { listCreators, createCreator, updateCreatorStatus } from "../api/adminApi";
import "../assets/css/AdminPages.css";

function AdminCreators() {
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  const [creators, setCreators] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [formError, setFormError] = useState("");
  const [saving, setSaving] = useState(false);
  const [busyId, setBusyId] = useState(null);

  const loadCreators = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listCreators();
      const data = res?.data?.data || res?.data || [];
      setCreators(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load creators:", err);
      setError(
        err?.response?.data?.message ||
          "Gagal memuat daftar creator. Pastikan Anda memiliki akses admin."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCreators();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setFormError("");

    if (!form.name.trim() || !form.email.trim() || !form.password) {
      setFormError("Nama, email, dan password wajib diisi.");
      return;
    }

    setSaving(true);
    try {
      await createCreator({
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        password: form.password,
      });
      setShowCreate(false);
      setForm({ name: "", email: "", password: "" });
      await loadCreators();
    } catch (err) {
      console.error("Failed to create creator:", err);
      setFormError(
        err?.response?.data?.message ||
          "Gagal membuat akun creator."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (creator) => {
    setBusyId(creator.id);
    try {
      await updateCreatorStatus(creator.id, !creator.is_active);
      await loadCreators();
    } catch (err) {
      console.error("Failed to update creator status:", err);
      alert(
        err?.response?.data?.message ||
          "Gagal mengubah status creator."
      );
    } finally {
      setBusyId(null);
    }
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
            <h1>Manage Creators</h1>
          </div>
        </div>
        <div className="admin-header-actions">
          <button type="button" className="admin-header-btn" onClick={handleLogout}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </header>

      <nav className="admin-navbar">
        <Link to="/admin" className="admin-nav-link">
          <FaChartLine /> Dashboard
        </Link>
        <Link to="/admin/creators" className="admin-nav-link active">
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
        <div className="admin-panel">
          <div className="admin-panel-title">
            <h2><FaUsers style={{ marginRight: 8 }} /> Daftar Creator</h2>
            <button
              type="button"
              className="admin-action-btn primary"
              onClick={() => setShowCreate(true)}
            >
              <FaUserPlus /> Tambah Creator
            </button>
          </div>

          {error && (
            <p style={{ color: "#b91c1c", marginBottom: 12 }}>
              <strong>{error}</strong>
            </p>
          )}

          {loading ? (
            <p style={{ margin: 0 }}>Memuat data...</p>
          ) : creators.length === 0 ? (
            <p style={{ margin: 0, color: "#7a8aa6" }}>Belum ada creator.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Creator</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Dibuat</th>
                    <th style={{ textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {creators.map((creator) => (
                    <tr key={creator.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="admin-avatar">
                            {(creator.name || "?").charAt(0).toUpperCase()}
                          </span>
                          <strong>{creator.name}</strong>
                        </div>
                      </td>
                      <td>{creator.email}</td>
                      <td>
                        <span className={`admin-badge ${creator.is_active ? "active" : "inactive"}`}>
                          {creator.is_active ? "Aktif" : "Nonaktif"}
                        </span>
                      </td>
                      <td>{creator.created_at || "-"}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="admin-action-btn soft"
                          disabled={busyId === creator.id}
                          onClick={() => handleToggleStatus(creator)}
                        >
                          {creator.is_active ? <FaToggleOff /> : <FaToggleOn />}
                          {creator.is_active ? "Nonaktifkan" : "Aktifkan"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {showCreate && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(15,23,42,.6)",
            display: "grid",
            placeItems: "center",
            padding: 16,
            zIndex: 50,
          }}
        >
          <div
            className="admin-panel"
            style={{ width: "100%", maxWidth: 440, marginBottom: 0 }}
          >
            <div className="admin-panel-title">
              <h2>Tambah Creator Baru</h2>
              <button
                type="button"
                className="admin-action-btn soft-danger"
                onClick={() => setShowCreate(false)}
              >
                <FaTimes />
              </button>
            </div>

            <form onSubmit={handleCreate}>
              <div className="admin-form-group">
                <label htmlFor="creator-name">Nama</label>
                <input
                  id="creator-name"
                  className="admin-input"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="Nama lengkap"
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="creator-email">Email</label>
                <input
                  id="creator-email"
                  type="email"
                  className="admin-input"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="creator@hidocs.app"
                />
              </div>
              <div className="admin-form-group">
                <label htmlFor="creator-password">Password</label>
                <input
                  id="creator-password"
                  type="password"
                  className="admin-input"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="Minimal 6 karakter"
                />
              </div>

              {formError && (
                <p style={{ color: "#b91c1c", marginBottom: 10 }}>
                  <strong>{formError}</strong>
                </p>
              )}

              <button
                type="submit"
                className="admin-action-btn primary"
                disabled={saving}
                style={{ width: "100%", justifyContent: "center" }}
              >
                {saving ? "Menyimpan..." : "Simpan Creator"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminCreators;