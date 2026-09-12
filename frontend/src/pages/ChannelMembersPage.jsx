import { useMemo, useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { endpoints, apiFetch } from "../api/apiConfig";

function BackIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M19 12H5" />
      <path d="M12 19l-7-7 7-7" />
    </svg>
  );
}

function SearchIcon() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </svg>
  );
}

function ChannelMembersPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [channelName, setChannelName] = useState(decodeURIComponent(channelId || "general"));

  const loadMembers = useCallback(async () => {
    try {
      const res = await apiFetch(endpoints.channelById(channelId));
      if (res.ok) {
        const { channel } = await res.json();
        setChannelName(channel.name);
        
        const currentUserId = JSON.parse(localStorage.getItem("huddle_user") || "{}").id;
        
        const mappedMembers = channel.members.map((m) => {
          const u = m.user;
          const isMe = u.id === currentUserId;
          return {
            id: u.id,
            name: isMe ? "You" : u.name,
            role: isMe ? "You" : "Member",
            status: isMe ? "online" : "offline", // Dummy status for now
            initial: u.name.charAt(0).toUpperCase(),
            originalName: u.name,
          };
        });
        
        // Sort: "You" first, then alphabetical
        mappedMembers.sort((a, b) => {
          if (a.id === currentUserId) return -1;
          if (b.id === currentUserId) return 1;
          return a.originalName.localeCompare(b.originalName);
        });
        
        setMembers(mappedMembers);
      }
    } catch (e) {
      console.error(e);
    }
  }, [channelId]);

  useEffect(() => {
    const t = setTimeout(() => { loadMembers(); }, 0);
    return () => clearTimeout(t);
  }, [loadMembers]);

  const filteredMembers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return members;
    }

    return members.filter((member) =>
      member.originalName.toLowerCase().includes(value) || member.name.toLowerCase().includes(value)
    );
  }, [search, members]);

  return (
    <main className="channel-members-page">
      <header className="channel-members-header">
        <button
          type="button"
          className="page-back-button"
          onClick={() => navigate(`/channel/${channelId}`)}
          aria-label="Back to channel"
        >
          <BackIcon />
        </button>

        <div>
          <h1>Members</h1>
          <p>#{channelName}</p>
        </div>
      </header>

      <section className="channel-members-content">
        <div className="member-search">
          <SearchIcon />

          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search members"
          />
        </div>

        <div className="member-count">
          {filteredMembers.length} members
        </div>

        <div className="members-list">
          {filteredMembers.map((member) => (
            <article key={member.id} className="member-card">
              <div className="member-avatar-wrap">
                <div className="member-avatar">
                  {member.initial}
                </div>

                <span
                  className={`member-status ${member.status}`}
                />
              </div>

              <div className="member-info">
                <strong>{member.name}</strong>
                <span>
                  {member.status === "online"
                    ? "Online"
                    : "Offline"}
                </span>
              </div>

              <span className="member-role">{member.role}</span>
            </article>
          ))}

          {filteredMembers.length === 0 && (
            <div className="members-empty">
              No members found.
            </div>
          )}
        </div>
      </section>
    </main>
  );
}

export default ChannelMembersPage;