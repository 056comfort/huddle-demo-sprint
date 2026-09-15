import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { endpoints, apiFetch } from "../api/apiConfig.js";

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function NewDirectMessagePage() {
  const navigate = useNavigate();

  const [users, setUsers]     = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery]     = useState("");
  const [error, setError]     = useState("");

  const loadUsers = useCallback(async () => {
    try {
      const res = await apiFetch(endpoints.users);
      if (res.ok) {
        const { users: all } = await res.json();
        setUsers(all || []);
      } else {
        setError("Could not load users.");
      }
    } catch {
      setError("Network error. Please check your connection.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { loadUsers(); }, 0);
    return () => clearTimeout(t);
  }, [loadUsers]);

  const q = query.toLowerCase().trim();
  const filtered = q
    ? users.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    : users;

  const handleSelect = (userId) => {
    navigate(`/dm/${userId}`);
  };


  return (
    <main className="new-dm-page">
      <section className="new-dm-shell">
        <header className="new-dm-header">
          <button
            type="button"
            className="new-dm-back"
            onClick={() => navigate(-1)}
            aria-label="Go back"
          >
            <BackIcon />
            <span>Back</span>
          </button>
        </header>

        <div className="new-dm-content">
          <div className="new-dm-title">
            <h1>New direct message</h1>
            <p>Start a private conversation with any Huddle user.</p>
          </div>

          {/* Search */}
          <div className="new-dm-search">
            <SearchIcon />
            <input
              type="text"
              placeholder="Search by name or email…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search people"
              autoFocus
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                style={{ background: "none", border: "none", cursor: "pointer", color: "#9ca3af", fontSize: 18, lineHeight: 1 }}
                aria-label="Clear"
              >
                ×
              </button>
            )}
          </div>

          {error && <p style={{ color: "#ef4444", fontSize: 14, padding: "8px 0" }}>{error}</p>}

          <div className="new-dm-section-label">
            <span>
              {loading ? "Loading users…" : `${filtered.length} user${filtered.length !== 1 ? "s" : ""}`}
            </span>
          </div>

          <div className="new-dm-people">
            {!loading && filtered.length === 0 && (
              <p style={{ color: "#6b7280", fontSize: 14, padding: "12px 0" }}>
                {q ? `No users match "${query}".` : "No other users have signed up yet."}
              </p>
            )}

            {filtered.map((person) => (
              <button
                key={person.id}
                type="button"
                className="new-dm-person"
                onClick={() => handleSelect(person.id)}
              >
                <span className="new-dm-avatar-wrap">
                  <span className="new-dm-avatar">
                    {person.name.charAt(0).toUpperCase()}
                  </span>
                  {/* status dot — always grey until we have real presence */}
                  <span className="new-dm-status offline" />
                </span>

                <span className="new-dm-person-info">
                  <span className="new-dm-person-name">{person.name}</span>
                  <span className="new-dm-person-status">{person.email}</span>
                </span>

                <span className="new-dm-arrow">›</span>
              </button>
            ))}
          </div>

          <div className="new-dm-footer">
            <p>Select a teammate to open a private conversation.</p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default NewDirectMessagePage;