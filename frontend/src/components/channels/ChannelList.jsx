import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { endpoints, apiFetch } from "../../api/apiConfig";

/* ─── Icons ──────────────────────────────────────────────────── */
function HashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M10 3 8 21M16 3l-2 18M4 9h17M3 15h17" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="10.8" cy="10.8" r="6" fill="none" stroke="currentColor" strokeWidth="1.8" />
      <path d="m15.3 15.3 4.2 4.2" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 5v14M5 12h14" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 15.1a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3l-.4.2a1.7 1.7 0 0 0-1 1.6v.2h-2.6v-.2a1.7 1.7 0 0 0-1-1.6l-.4-.2a1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9l-.2-.4a1.7 1.7 0 0 0-1.6-1H5v-2.6h.2a1.7 1.7 0 0 0 1.6-1l.2-.4A1.7 1.7 0 0 0 6.7 7l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3l.4-.2a1.7 1.7 0 0 0 1-1.6v-.2h2.6v.2a1.7 1.7 0 0 0 1 1.6l.4.2a1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9l.2.4a1.7 1.7 0 0 0 1.6 1h.2v2.6H21a1.7 1.7 0 0 0-1.6 1l-.2.4Z" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
    </svg>
  );
}
function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="12" r="8.5" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M9.8 9.3a2.4 2.4 0 1 1 4.2 1.6c-.9.9-2 1.2-2 2.5" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
      <circle cx="12" cy="16.8" r=".9" fill="currentColor" />
    </svg>
  );
}
function PersonIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
function StatusDot({ online }) {
  return (
    <span
      style={{
        width: 8, height: 8, borderRadius: "50%",
        background: online ? "#22c55e" : "#9ca3af",
        border: "1.5px solid white",
        position: "absolute", bottom: 0, right: 0,
        display: "block",
      }}
    />
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
function ChannelList({ activeChannelId }) {
  const navigate = useNavigate();

  const [query, setQuery]           = useState("");
  const [myChannels, setMyChannels] = useState([]);
  const [allUsers, setAllUsers]     = useState([]);
  const [loading, setLoading]       = useState(true);

  const loadData = useCallback(async () => {
    try {
      const [chRes, usersRes] = await Promise.all([
        apiFetch(endpoints.channels),
        apiFetch(endpoints.users),
      ]);

      if (chRes.ok) {
        const { channels } = await chRes.json();
        const userId = JSON.parse(localStorage.getItem("huddle_user") || "{}").id;
        // Only show channels the current user is a member of
        const mine = (channels || []).filter((ch) =>
          ch.members.some((m) => m.userId === userId)
        );
        setMyChannels(mine);
      }

      if (usersRes.ok) {
        const { users } = await usersRes.json();
        setAllUsers(users || []);
      }
    } catch { /* network offline – keep existing state */ }
    finally { setLoading(false); }
  }, []);

  // Initial load + auto-refresh every 30 s
  useEffect(() => {
    loadData();
    const interval = setInterval(loadData, 30_000);
    return () => clearInterval(interval);
  }, [loadData]);

  // Filter channels and users based on the search query
  const q = query.toLowerCase().trim();
  const filteredChannels = q
    ? myChannels.filter((ch) => ch.name.toLowerCase().includes(q))
    : myChannels;
  const filteredUsers = q
    ? allUsers.filter(
        (u) =>
          u.name.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      )
    : allUsers;

  return (
    <div className="sidebar-navigation">

      {/* ── Global Search Bar ── */}
      <div className="sidebar-search-bar">
        <span className="sidebar-search-icon"><SearchIcon /></span>
        <input
          type="text"
          placeholder="Search channels & people…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search channels and people"
          className="sidebar-search-input"
        />
        {query && (
          <button
            type="button"
            className="sidebar-search-clear"
            onClick={() => setQuery("")}
            aria-label="Clear search"
          >
            ×
          </button>
        )}
      </div>

      {/* ── Channels Section ── */}
      <section className="sidebar-section">
        <div className="sidebar-section-heading">
          <span>Channels</span>
          <div style={{ display: "flex", gap: "4px" }}>
            <Link
              to="/create-channel"
              className="section-add-button"
              aria-label="Create channel"
              title="Create channel"
            >
              <PlusIcon />
            </Link>
          </div>
        </div>

        {/* Browse / Join link */}
        <Link to="/join-channel" className="sidebar-browse-link">
          <SearchIcon />
          <span>Browse &amp; join channels</span>
        </Link>

        <nav className="sidebar-channel-list">
          {loading && (
            <span className="sidebar-loading">Loading…</span>
          )}
          {!loading && filteredChannels.length === 0 && (
            <span className="sidebar-empty">
              {q ? "No channels match your search." : "You haven't joined any channels yet."}
            </span>
          )}
          {filteredChannels.map((ch) => (
            <Link
              key={ch.id}
              to={`/channel/${ch.id}`}
              className={`sidebar-channel-link ${
                activeChannelId === ch.id ? "active" : ""
              }`}
            >
              <HashIcon />
              <span>{ch.name}</span>
            </Link>
          ))}
        </nav>
      </section>

      {/* ── Direct Messages Section ── */}
      <section className="sidebar-section direct-message-section">
        <div className="sidebar-section-heading">
          <span>Direct messages</span>
          <Link
            to="/dm/new"
            className="section-add-button"
            aria-label="Start a new direct message"
            title="New message"
          >
            <PlusIcon />
          </Link>
        </div>

        <div className="direct-message-list">
          {loading && <span className="sidebar-loading">Loading…</span>}
          {!loading && filteredUsers.length === 0 && (
            <span className="sidebar-empty">
              {q ? "No users match your search." : "No other users yet."}
            </span>
          )}
          {filteredUsers.map((user) => (
            <button
              key={user.id}
              type="button"
              className="direct-message-item"
              onClick={() => navigate(`/dm/${user.id}`)}
            >
              <span
                style={{
                  position: "relative",
                  display: "inline-flex",
                  width: 28,
                  height: 28,
                  flexShrink: 0,
                }}
              >
                <span className="person-avatar">
                  {user.name.charAt(0).toUpperCase()}
                </span>
                <StatusDot online={false} />
              </span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {user.name}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ── Bottom Links ── */}
      <div className="sidebar-bottom-links">
        <Link to="/settings" className="sidebar-bottom-link">
          <SettingsIcon />
          <span>Settings</span>
        </Link>
        <Link to="/support" className="sidebar-bottom-link">
          <HelpIcon />
          <span>Support</span>
        </Link>
      </div>
    </div>
  );
}

export default ChannelList;
