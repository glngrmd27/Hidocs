import { useEffect, useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaFileAlt,
  FaTrashAlt,
  FaSignOutAlt,
  FaShieldAlt,
  FaChartLine,
  FaUserCog,
  FaTasks,
  FaClipboardCheck,
  FaLink,
} from "react-icons/fa";
import { ThemeContext } from "../context/ThemeContext";
import { listAllForms, adminDeleteForm } from "../api/adminApi";
import "../assets/css/AdminPages.css";

function AdminForms() {
  const navigate = useNavigate();
  const { darkMode } = useContext(ThemeContext);

  const [forms, setForms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState(null);

  const loadForms = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await listAllForms();
      const data = res?.data?.data || res?.data || [];
      setForms(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load forms:", err);
      setError(
        err?.response?.data?.message ||
          "Gagal memuat daftar form. Pastikan Anda memiliki akses admin."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadForms();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  const handleDelete = async (form) => {
    if (
      !window.confirm(
        `Hapus form "${form.title}"? Tindakan ini tidak dapat dibatalkan.`
      )
    ) {
      return;
    }
    setBusyId(form.id);
    try {
      await adminDeleteForm(form.id);
      window.dispatchEvent(new CustomEvent("hidocs-forms-updated"));
      await loadForms();
    } catch (err) {
      console.error("Failed to delete form:", err);
      alert(err?.response?.data?.message || "Gagal menghapus form.");
    } finally {
      setBusyId(null);
    }
  };

  const formTypeBadge = (type) => {
    const label = type === "QUIZ" ? "Kuis" : type === "EXAM" ? "Ujian" : "Form";
    return (
      <span className={`admin-badge ${label === "Form" ? "active" : "inactive"}`}>
        {label}
      </span>
    );
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
            <h1>All Forms</h1>
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
        <Link to="/admin/creators" className="admin-nav-link">
          <FaUserCog /> Manage Creators
        </Link>
        <Link to="/admin/forms" className="admin-nav-link active">
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
            <h2><FaClipboardCheck style={{ marginRight: 8 }} /> Semua Form di Platform</h2>
            <span>{forms.length} form</span>
          </div>

          {error && (
            <p style={{ color: "#b91c1c", marginBottom: 12 }}>
              <strong>{error}</strong>
            </p>
          )}

          {loading ? (
            <p style={{ margin: 0 }}>Memuat data...</p>
          ) : forms.length === 0 ? (
            <p style={{ margin: 0, color: "#7a8aa6" }}>Belum ada form.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Judul</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Link</th>
                    <th>Dibuat</th>
                    <th style={{ textAlign: "right" }}>Aksi</th>
                  </tr>
                </thead>
                <tbody>
                  {forms.map((form) => (
                    <tr key={form.id}>
                      <td>
                        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                          <span className="admin-avatar">
                            {form.type === "QUIZ" ? "Q" : form.type === "EXAM" ? "E" : "F"}
                          </span>
                          <strong>{form.title}</strong>
                        </div>
                      </td>
                      <td>{formTypeBadge(form.type)}</td>
                      <td>
                        <span className={`admin-badge ${form.status === "ACTIVE" ? "active" : "inactive"}`}>
                          {form.status === "ACTIVE" ? "Aktif" : "Tidak Aktif"}
                        </span>
                      </td>
                      <td>
                        {form.custom_url ? (
                          <span style={{ display: "inline-flex", alignItems: "center", gap: 6 }}>
                            <FaLink style={{ fontSize: 12 }} />
                            {form.custom_url}
                          </span>
                        ) : (
                          "-"
                        )}
                      </td>
                      <td>{form.created_at ? form.created_at.slice(0, 10) : "-"}</td>
                      <td style={{ textAlign: "right" }}>
                        <button
                          type="button"
                          className="admin-action-btn soft-danger"
                          disabled={busyId === form.id}
                          onClick={() => handleDelete(form)}
                        >
                          <FaTrashAlt /> Hapus
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
    </div>
  );
}

export default AdminForms;