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

function PlusIcon() {
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
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function ChannelMembersPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [members, setMembers] = useState([]);
  const [channelName, setChannelName] = useState(decodeURIComponent(channelId || "general"));
  
  // Add Member State
  const [isAdding, setIsAdding] = useState(false);
  const [addSearch, setAddSearch] = useState("");
  const [allUsers, setAllUsers] = useState([]);
  const [addingUserId, setAddingUserId] = useState(null);

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

  const loadAllUsers = useCallback(async () => {
    try {
      const res = await apiFetch(endpoints.users);
      if (res.ok) {
        const { users } = await res.json();
        setAllUsers(users || []);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  useEffect(() => {
    const t = setTimeout(() => { 
      loadMembers(); 
      loadAllUsers();
    }, 0);
    return () => clearTimeout(t);
  }, [loadMembers, loadAllUsers]);

  const handleAddMember = async (userId) => {
    if (addingUserId) return;
    setAddingUserId(userId);
    try {
      const res = await apiFetch(endpoints.addChannelMember(channelId), {
        method: "POST",
        body: JSON.stringify({ userId }),
      });
      if (res.ok) {
        await loadMembers();
        setIsAdding(false);
        setAddSearch("");
      } else {
        const err = await res.json();
        alert(err.message || "Failed to add member");
      }
    } catch (e) {
      console.error(e);
      alert("Failed to add member");
    } finally {
      setAddingUserId(null);
    }
  };

  const filteredMembers = useMemo(() => {
    const value = search.toLowerCase().trim();

    if (!value) {
      return members;
    }

    return members.filter((member) =>
      member.originalName.toLowerCase().includes(value) || member.name.toLowerCase().includes(value)
    );
  }, [search, members]);

  const addableUsers = useMemo(() => {
    const value = addSearch.toLowerCase().trim();
    const existingIds = new Set(members.map(m => m.id));
    const available = allUsers.filter(u => !existingIds.has(u.id));
    
    if (!value) return available;
    return available.filter(u => u.name.toLowerCase().includes(value) || u.email.toLowerCase().includes(value));
  }, [addSearch, allUsers, members]);

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

        <button 
          className="primary-button" 
          style={{ marginLeft: 'auto', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
          onClick={() => setIsAdding(!isAdding)}
        >
          <PlusIcon /> Add Member
        </button>
      </header>

      {isAdding && (
        <section className="channel-members-content" style={{ borderBottom: '1px solid var(--border-color)', paddingBottom: '20px', backgroundColor: 'var(--bg-secondary)' }}>
          <h3>Add people to #{channelName}</h3>
          <div className="member-search" style={{ marginTop: '10px' }}>
            <SearchIcon />
            <input
              type="search"
              value={addSearch}
              onChange={(e) => setAddSearch(e.target.value)}
              placeholder="Search by name or email"
            />
          </div>
          
          <div className="members-list" style={{ marginTop: '16px', maxHeight: '200px', overflowY: 'auto' }}>
            {addableUsers.map(user => (
              <article key={user.id} className="member-card">
                <div className="member-avatar-wrap">
                  <div className="member-avatar">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                </div>
                <div className="member-info">
                  <strong>{user.name}</strong>
                  <span style={{ fontSize: '12px' }}>{user.email}</span>
                </div>
                <button 
                  className="primary-button"
                  style={{ padding: '4px 12px', fontSize: '12px' }}
                  onClick={() => handleAddMember(user.id)}
                  disabled={addingUserId === user.id}
                >
                  {addingUserId === user.id ? 'Adding...' : 'Add'}
                </button>
              </article>
            ))}
            {addableUsers.length === 0 && (
              <div className="members-empty">No users found to add.</div>
            )}
          </div>
        </section>
      )}

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