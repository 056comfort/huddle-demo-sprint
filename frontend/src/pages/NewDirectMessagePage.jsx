import { Link, useNavigate } from "react-router-dom";

const people = [
  {
    id: "sarah",
    name: "Sarah",
    avatar: "S",
    status: "online",
  },
  {
    id: "david",
    name: "David",
    avatar: "D",
    status: "offline",
  },
];

function BackIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function NewDirectMessagePage() {
  const navigate = useNavigate();

  const handleSelectPerson = (personId) => {
    navigate(`/dm/${personId}`);
  };

  return (
    <main className="new-dm-page">
      <section className="new-dm-shell">
        <header className="new-dm-header">
          <Link to="/channel/general" className="new-dm-back">
            <BackIcon />
            <span>Back to workspace</span>
          </Link>
        </header>

        <div className="new-dm-content">
          <div className="new-dm-title">
            <h1>New direct message</h1>
            <p>
              Start a private conversation with someone on your team.
            </p>
          </div>

          <div className="new-dm-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search people..."
              aria-label="Search people"
            />
          </div>

          <div className="new-dm-section-label">
            <span>People</span>
          </div>

          <div className="new-dm-people">
            {people.map((person) => (
              <button
                key={person.id}
                type="button"
                className="new-dm-person"
                onClick={() => handleSelectPerson(person.id)}
              >
                <span className="new-dm-avatar-wrap">
                  <span className="new-dm-avatar">
                    {person.avatar}
                  </span>

                  <span
                    className={`new-dm-status ${person.status}`}
                  />
                </span>

                <span className="new-dm-person-info">
                  <span className="new-dm-person-name">
                    {person.name}
                  </span>

                  <span className="new-dm-person-status">
                    {person.status === "online"
                      ? "Online"
                      : "Offline"}
                  </span>
                </span>

                <span className="new-dm-arrow">›</span>
              </button>
            ))}
          </div>

          <div className="new-dm-footer">
            <p>
              Select a teammate to open a private conversation.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default NewDirectMessagePage;