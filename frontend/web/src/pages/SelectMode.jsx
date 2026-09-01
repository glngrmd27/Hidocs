import { useNavigate } from "react-router-dom";
import { FaUser, FaTh, FaSignOutAlt, FaChevronRight } from "react-icons/fa";
import logo from "../assets/images/logo.png";
import "../assets/css/SelectMode.css";

function SelectMode() {
  const navigate = useNavigate();
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
  const username = currentUser.name || currentUser.username || "User";
  const role = currentUser.role || "user";

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login", { replace: true });
  };

  return (
    <div className="select-mode-page">
      <header className="select-mode-header">
        <div className="select-mode-brand">
          <div className="select-mode-logo-wrapper">
            <img src={logo} alt="HiDocs Logo" />
          </div>
          <span>HiDocs!</span>
        </div>
        <button
          type="button"
          className="select-mode-logout-icon"
          onClick={handleLogout}
          title="Logout"
        >
          <FaSignOutAlt />
        </button>
      </header>

      <div className="select-mode-card">
        <h1>
          Halo, {username}! <span>👋</span>
        </h1>
        <p>Pilih mode atau peran untuk melanjutkan ke dashboard.</p>

        <span className="select-mode-label">PILIHAN MODE</span>

        <button
          type="button"
          className="select-mode-option"
          onClick={() => navigate("/dashboard")}
        >
          <div className="select-mode-icon user">
            <FaUser />
          </div>
          <div className="select-mode-option-content">
            <h2>Mode User</h2>
            <p>Mengisi dan mengerjakan form / kuis, serta melihat riwayat.</p>
          </div>
          <FaChevronRight className="select-mode-arrow" />
        </button>

        <button
          type="button"
          className="select-mode-option"
          onClick={() => navigate("/admin")}
        >
          <div className="select-mode-icon creator">
            <FaTh />
          </div>
          <div className="select-mode-option-content">
            <h2>Mode Creator</h2>
            <p>Membuat dan mengelola form serta soal milik Anda.</p>
          </div>
          <FaChevronRight className="select-mode-arrow" />
        </button>

        <span className="select-mode-footnote">
          Akun Anda terdaftar sebagai{" "}
          {role.charAt(0).toUpperCase() + role.slice(1)}
        </span>
      </div>

      <button
        type="button"
        className="select-mode-logout-btn"
        onClick={handleLogout}
      >
        🔒 Logout / Ganti akun
      </button>
    </div>
  );
}

export default SelectMode;