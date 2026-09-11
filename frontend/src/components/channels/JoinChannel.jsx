import { useState, useEffect, useCallback } from "react";
import { Link, useNavigate } from "react-router-dom";
import { endpoints, apiFetch } from "../../api/apiConfig";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true" width="18" height="18">
      <circle cx="10.8" cy="10.8" r="6" />
      <path d="m15.3 15.3 4.2 4.2" />
    </svg>
  );
}

function JoinChannel() {
  const navigate = useNavigate();

  const [channels, setChannels]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [query, setQuery]         = useState("");
  const [joining, setJoining]     = useState(null); // channelId being joined
  const [joined, setJoined]       = useState({});   // { [channelId]: true }
  const [error, setError]         = useState("");

  const currentUserId = JSON.parse(localStorage.getItem("huddle_user") || "{}").id;

  const loadChannels = useCallback(async () => {
    try {
      const res = await apiFetch(endpoints.channels);
      if (res.ok) {
        const { channels: all } = await res.json();
        setChannels(all || []);
        // Mark which ones the user is already in
        const alreadyJoined = {};
        (all || []).forEach((ch) => {
          if (ch.members.some((m) => m.userId === currentUserId)) {
            alreadyJoined[ch.id] = true;
          }
        });
        setJoined(alreadyJoined);
      }
    } catch { /* offline */ }
    finally { setLoading(false); }
  }, [currentUserId]);

  useEffect(() => { loadChannels(); }, [loadChannels]);

  const handleJoin = async (channelId) => {
    setJoining(channelId);
    setError("");
    try {
      const res = await apiFetch(endpoints.joinChannel(channelId), { method: "POST" });
      if (res.ok) {
        setJoined((prev) => ({ ...prev, [channelId]: true }));
        // Navigate straight to the channel
        navigate(`/channel/${channelId}`);
      } else {
        const data = await res.json().catch(() => ({}));
        setError(data.message || "Could not join channel.");
      }
    } catch {
      setError("Network error. Please try again.");
    } finally {
      setJoining(null);
    }
  };

  const q = query.toLowerCase().trim();
  const filtered = q
    ? channels.filter(
        (ch) =>
          ch.name.toLowerCase().includes(q) ||
          (ch.description || "").toLowerCase().includes(q)
      )
    : channels;

  return (
    <section className="auth-card" style={{ maxWidth: 560, width: "100%" }}>
      <div className="brand">
        <div className="brand-mark">H</div>
        <span>Huddle</span>
      </div>

      <h1>Browse channels</h1>
      <p className="auth-description">
        Find and join channels that your teammates have created.
      </p>

      {/* Search */}
      <div className="channel-search-bar">
        <SearchIcon />
        <input
          type="text"
          placeholder="Search channels…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Search channels"
        />
      </div>

      {error && <p className="form-error">{error}</p>}

      {/* Channel list */}
      <div className="channel-browse-list">
        {loading && <p style={{ color: "#6b7280", padding: "12px 0" }}>Loading channels…</p>}

        {!loading && filtered.length === 0 && (
          <p style={{ color: "#6b7280", padding: "12px 0" }}>
            {q ? `No channels match "${query}".` : "No channels have been created yet."}
          </p>
        )}

        {filtered.map((ch) => {
          const isMember = joined[ch.id];
          const isJoining = joining === ch.id;
          return (
            <div key={ch.id} className="channel-browse-item">
              <div className="channel-browse-info">
                <span className="channel-browse-name"># {ch.name}</span>
                {ch.description && (
                  <span className="channel-browse-desc">{ch.description}</span>
                )}
                <span className="channel-browse-meta">
                  {ch._count?.members ?? ch.members?.length ?? 0} member{(ch._count?.members ?? 1) !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="channel-browse-actions">
                {isMember ? (
                  <button
                    type="button"
                    className="primary-button"
                    style={{ padding: "6px 14px", fontSize: 13 }}
                    onClick={() => navigate(`/channel/${ch.id}`)}
                  >
                    View
                  </button>
                ) : (
                  <button
                    type="button"
                    className="primary-button"
                    style={{ padding: "6px 14px", fontSize: 13 }}
                    disabled={isJoining}
                    onClick={() => handleJoin(ch.id)}
                  >
                    {isJoining ? "Joining…" : "Join"}
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="secondary-action">
        Want to start something new?{" "}
        <Link to="/create-channel">Create a channel</Link>
      </p>
    </section>
  );
}

export default JoinChannel;
