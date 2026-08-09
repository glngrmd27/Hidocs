import "../assets/css/AboutModal.css";

function AboutModal({ show, onClose }) {

  if (!show) return null;

  return (

    <div className="modal-overlay">

      <div className="modal-box">

        <h2>HiDocs!</h2>

        <p className="version">
          Version 1.0.0
        </p>

        <div className="about-content">

          <p>
            HiDocs is a web application designed to help
            users fill out surveys, quizzes, and digital
            forms quickly and efficiently.
          </p>

          <br />

          <p>
            Developed by
            <br />
            <strong>Kelompok 4</strong>
          </p>

        </div>

        <button
          className="save-btn"
          onClick={onClose}
        >
          Close
        </button>

      </div>

    </div>

  );

}

export default AboutModal;