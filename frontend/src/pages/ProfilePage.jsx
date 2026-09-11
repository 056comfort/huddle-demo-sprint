import { useState } from "react";
import { useNavigate } from "react-router-dom";

function ArrowLeftIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function PencilIcon() {
  return (
    <svg width="17" height="17" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round"
      strokeLinejoin="round">
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}

function ProfilePage() {
  const navigate = useNavigate();

  const [name, setName] = useState("Emmanuel");
  const [email, setEmail] = useState("your@email.com");
  const [about, setAbout] = useState(
    "Available for collaboration"
  );

  const [editingField, setEditingField] = useState(null);

  function startEditing(field) {
    setEditingField(field);
  }

  function cancelEditing() {
    setEditingField(null);
  }

  function saveProfile() {
    setEditingField(null);

    console.log("Profile ready for backend:", {
      name,
      email,
      about,
    });
  }

  return (
    <div className="utility-page">
      <header className="utility-header">
        <button
          type="button"
          className="utility-back-button"
          onClick={() => navigate(-1)}
          aria-label="Go back"
          title="Go back"
        >
          <ArrowLeftIcon />
        </button>

        <div>
          <h1>Profile</h1>
          <p>Manage your personal information</p>
        </div>
      </header>

      <main className="profile-page-content profile-page-scroll">
        {/* PROFILE HERO */}
        <section className="profile-hero">
          <button
            type="button"
            className="profile-avatar-button"
            onClick={() =>
              console.log("Avatar upload ready for backend")
            }
            title="Change profile photo"
            aria-label="Change profile photo"
          >
            <div className="profile-large-avatar">
              E
            </div>

            <span className="avatar-edit-badge">
              <PencilIcon />
            </span>
          </button>

          <h2>{name}</h2>

          <div className="profile-online-status">
            <span />
            Online
          </div>

          <button
            type="button"
            className="profile-email-display"
            onClick={() => startEditing("email")}
          >
            {email}
          </button>
        </section>

        {/* INFORMATION */}
        <section className="profile-information-card">
          {/* NAME */}
          <div className="profile-field">
            <div className="profile-field-label">
              <span>Display name</span>

              <button
                type="button"
                className="profile-edit-icon"
                onClick={() => startEditing("name")}
                aria-label="Edit display name"
              >
                <PencilIcon />
              </button>
            </div>

            {editingField === "name" ? (
              <div className="profile-edit-area">
                <input
                  className="profile-input"
                  value={name}
                  onChange={(event) =>
                    setName(event.target.value)
                  }
                  autoFocus
                />

                <div className="profile-inline-actions">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="profile-secondary-button"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={saveProfile}
                    className="profile-primary-button"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="profile-field-value-button"
                onClick={() => startEditing("name")}
              >
                {name}
              </button>
            )}
          </div>

          {/* EMAIL */}
          <div className="profile-field">
            <div className="profile-field-label">
              <span>Email</span>

              <button
                type="button"
                className="profile-edit-icon"
                onClick={() => startEditing("email")}
                aria-label="Edit email"
              >
                <PencilIcon />
              </button>
            </div>

            {editingField === "email" ? (
              <div className="profile-edit-area">
                <input
                  className="profile-input"
                  type="email"
                  value={email}
                  onChange={(event) =>
                    setEmail(event.target.value)
                  }
                  autoFocus
                />

                <div className="profile-inline-actions">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="profile-secondary-button"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={saveProfile}
                    className="profile-primary-button"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="profile-field-value-button"
                onClick={() => startEditing("email")}
              >
                {email}
              </button>
            )}
          </div>

          {/* STATUS */}
          <div className="profile-field">
            <div className="profile-field-label">
              <span>Status</span>
            </div>

            <button
              type="button"
              className="profile-status-row"
              onClick={() =>
                console.log("Status selector ready for backend")
              }
            >
              <span className="profile-status-dot" />

              <span>Online</span>

              <ChevronIcon />
            </button>
          </div>

          {/* ABOUT */}
          <div className="profile-field">
            <div className="profile-field-label">
              <span>About</span>

              <button
                type="button"
                className="profile-edit-icon"
                onClick={() => startEditing("about")}
                aria-label="Edit about"
              >
                <PencilIcon />
              </button>
            </div>

            {editingField === "about" ? (
              <div className="profile-edit-area">
                <textarea
                  className="profile-textarea"
                  value={about}
                  onChange={(event) =>
                    setAbout(event.target.value)
                  }
                  rows="3"
                  autoFocus
                />

                <div className="profile-inline-actions">
                  <button
                    type="button"
                    onClick={cancelEditing}
                    className="profile-secondary-button"
                  >
                    Cancel
                  </button>

                  <button
                    type="button"
                    onClick={saveProfile}
                    className="profile-primary-button"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                className="profile-field-value-button"
                onClick={() => startEditing("about")}
              >
                {about}
              </button>
            )}
          </div>
        </section>

        <section className="profile-actions">
          <button
            type="button"
            className="profile-primary-button profile-main-edit-button"
            onClick={() => startEditing("name")}
          >
            Edit profile
          </button>
        </section>
      </main>
    </div>
  );
}

export default ProfilePage;