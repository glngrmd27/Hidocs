import { useState, useEffect } from "react";

import "../assets/css/EditProfileModal.css";

function EditProfileModal({
  show,
  onClose,
  user,
  setUser,
}) {

  const [formData, setFormData] = useState(user);

  useEffect(() => {

    setFormData(user);

  }, [user, show]);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });

  };

  const handleSave = () => {

    setUser(formData);

    onClose();

  };


  if (!show) return null;


  return (

    <div className="modal-overlay">

      <div className="edit-modal">

        {/* TITLE */}

        <h2>
          Edit Profile
        </h2>


        {/* FORM */}

        <div className="modal-form">

          {/* NAME */}

          <div className="form-group">

            <label>
              Full Name
            </label>

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
            />

          </div>


          {/* EMAIL */}

          <div className="form-group">

            <label>
              Email
            </label>

            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
            />

          </div>

        </div>


        {/* BUTTONS */}

        <div className="modal-buttons">

          <button
            className="cancel-btn"
            onClick={onClose}
          >

            Cancel

          </button>

          <button
            className="save-btn"
            onClick={handleSave}
          >

            Save

          </button>

        </div>

      </div>

    </div>

  );

}

export default EditProfileModal;