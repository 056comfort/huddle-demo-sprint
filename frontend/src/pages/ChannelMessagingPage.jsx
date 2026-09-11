import { useState, useEffect, useRef, useCallback } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { endpoints, apiFetch } from "../api/apiConfig.js";

import ChannelList from "../components/channels/ChannelList.jsx";
import MessageInput from "../components/messaging/MessageInput.jsx";

import "../App.css";

/* ─── Icons ──────────────────────────────────────────────────── */
function VideoCallIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M15 10.5L19.5 7.5V16.5L15 13.5V10.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="3" y="6" width="12" height="12" rx="2" stroke="currentColor" strokeWidth="1.8" />
    </svg>
  );
}
function CallIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M6.6 3.5L9.4 6.8L7.6 9.1C8.6 11.2 10.3 12.9 12.4 13.9L14.7 12.1L18 14.9C18.6 15.4 18.8 16.2 18.4 16.9C17.8 18 16.7 19.2 15.3 19.4C12.5 19.8 8.8 17.8 6.1 15.1C3.4 12.4 1.4 8.7 1.8 5.9C2 4.5 3.2 3.4 4.3 2.8C5 2.4 5.8 2.6 6.6 3.5Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M18 9C18 5.7 15.8 3.5 12 3.5C8.2 3.5 6 5.7 6 9C6 13.5 4.5 15 4.5 16.5H19.5C19.5 15 18 13.5 18 9Z" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9.5 19C10.1 19.9 10.9 20.5 12 20.5C13.1 20.5 13.9 19.9 14.5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function MembersIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <circle cx="9" cy="8" r="3" stroke="currentColor" strokeWidth="1.8" />
      <path d="M3.5 19C3.5 15.7 5.7 13.5 9 13.5C12.3 13.5 14.5 15.7 14.5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M15 5.5C17.2 5.8 18.5 7.1 18.5 9C18.5 10.4 17.8 11.5 16.6 12.1" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 14C19.3 14.5 20.5 16.2 20.5 19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function MenuIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M4 6H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 12H20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M4 18H20" stroke="currentColor" strokeLinecap="round" strokeWidth="2" />
    </svg>
  );
}
function ChannelHashIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
      <path d="M9 3L7 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M17 3L15 21" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M4 9H20" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <path d="M3 15H19" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}
function UserAvatar({ letter = "Y" }) {
  return <div className="user-avatar" aria-hidden="true">{letter}</div>;
}

/* ─── UUID detection ─────────────────────────────────────────── */
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const isUUID = (s) => UUID_RE.test(s);

/* ─── Main Component ─────────────────────────────────────────── */
function ChannelMessagingPage() {
  const { channelId: channelParam } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  const currentUserName   = user?.name || "You";
  const currentUserAvatar = currentUserName.charAt(0).toUpperCase();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Resolved channel data from the API
  const [channel, setChannel]   = useState(null);
  const [messages, setMessages] = useState([]);
  const [loadingCh, setLoadingCh] = useState(true);
  const [loadingMsg, setLoadingMsg] = useState(true);
  const [error, setError]       = useState("");
  const [refreshing, setRefreshing] = useState(false);

  const messagesEndRef = useRef(null);

  /* ── Resolve channel (supports both UUID and name) ── */
  const resolveChannel = useCallback(async () => {
    setLoadingCh(true);
    setError("");
    try {
      let res;
      if (isUUID(channelParam)) {
        res = await apiFetch(endpoints.channelById(channelParam));
      } else {
        // Name-based URL — resolve via the by-name endpoint
        res = await apiFetch(endpoints.channelByName(channelParam));
        if (res.ok) {
          const { channel: found } = await res.json();
          // Canonicalise the URL to use the ID going forward
          navigate(`/channel/${found.id}`, { replace: true });
          setChannel(found);
          return found.id;
        }
      }

      if (res && res.ok) {
        const { channel: found } = await res.json();
        setChannel(found);
        return found.id;
      } else {
        setError("Channel not found or you don't have access.");
      }
    } catch {
      setError("Could not load channel. Check your connection.");
    } finally {
      setLoadingCh(false);
    }
    return null;
  }, [channelParam, navigate]);

  /* ── Load messages ── */
  const loadMessages = useCallback(async (chId) => {
    if (!chId) return;
    try {
      const res = await apiFetch(endpoints.channelMessages(chId));
      if (res.ok) {
        const { messages: msgs } = await res.json();
        setMessages(msgs || []);
      }
    } catch { /* silent — keep existing messages */ }
    finally { setLoadingMsg(false); }
  }, []);

  /* ── Bootstrap on mount / param change ── */
  useEffect(() => {
    let cancelled = false;
    // setTimeout(0) moves setState calls out of the synchronous effect body
    const t = setTimeout(() => {
      resolveChannel().then((chId) => {
        if (!cancelled && chId) loadMessages(chId);
      });
    }, 0);
    return () => { cancelled = true; clearTimeout(t); };
  }, [resolveChannel, loadMessages]);

  /* ── Auto-poll messages every 10 s ── */
  useEffect(() => {
    if (!channel) return;
    const interval = setInterval(() => loadMessages(channel.id), 10_000);
    return () => clearInterval(interval);
  }, [channel, loadMessages]);

  /* ── Scroll to latest message ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Manual refresh ── */
  const handleRefresh = async () => {
    if (!channel) return;
    setRefreshing(true);
    await loadMessages(channel.id);
    setRefreshing(false);
  };

  /* ── Send message ── */
  const handleSendMessage = async (messageText) => {
    if (!messageText?.trim() || !channel) return;

    // Optimistic UI — add the message immediately
    const optimistic = {
      id: `opt-${Date.now()}`,
      content: messageText.trim(),
      sender: { id: user?.id, name: currentUserName },
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);

    try {
      await apiFetch(endpoints.channelMessages(channel.id), {
        method: "POST",
        body: JSON.stringify({ content: messageText.trim() }),
      });
      // Reload to get the server-confirmed message
      await loadMessages(channel.id);
    } catch {
      // Remove optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
    }
  };

  const channelName = channel?.name || decodeURIComponent(channelParam);

  if (error) {
    return (
      <div className="app-shell">
        <aside className="app-sidebar">
          <div className="workspace-header">
            <div className="workspace-icon">H</div>
            <div className="workspace-details"><h1>Huddle</h1></div>
          </div>
          <ChannelList activeChannelId={channel?.id} />
        </aside>
        <main className="chat-main" style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", padding: "40px" }}>
            <p style={{ color: "#ef4444", marginBottom: "16px" }}>{error}</p>
            <button className="primary-button" onClick={() => navigate("/join-channel")}>Browse channels</button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="app-shell">
      {/* Mobile backdrop */}
      {isSidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`app-sidebar ${isSidebarOpen ? "sidebar-open" : ""}`}>
        <div className="workspace-header">
          <div className="workspace-icon">H</div>
          <div className="workspace-details">
            <h1>Huddle Team</h1>
            <span>Team workspace</span>
          </div>
        </div>

        <ChannelList activeChannelId={channel?.id} />

        <Link to="/profile" className="profile">
          <UserAvatar letter={currentUserAvatar} />
          <div className="profile-info">
            <strong>{currentUserName}</strong>
            <span>Online</span>
          </div>
          <span className="profile-menu" aria-hidden="true">⋯</span>
        </Link>
      </aside>

      {/* Main chat area */}
      <main className="chat-main">
        <header className="chat-header">
          <button type="button" className="mobile-menu-button" aria-label="Open navigation" onClick={() => setIsSidebarOpen(true)}>
            <MenuIcon />
          </button>

          <button
            type="button"
            className="chat-channel-title"
            onClick={() => channel && navigate(`/channel/${channel.id}/info`)}
            title="Open channel info"
          >
            <span className="channel-title-icon"><ChannelHashIcon /></span>
            <span className="chat-channel-title-content">
              <strong>{loadingCh ? "Loading…" : channelName}</strong>
              <span>
                {channel ? `${channel._count?.members ?? channel.members?.length ?? 0} members` : "Team conversation"}
              </span>
            </span>
          </button>

          <div className="chat-header-actions">
            <button type="button" aria-label="Refresh messages" title="Refresh" onClick={handleRefresh} style={{ opacity: refreshing ? 0.5 : 1 }}>
              <RefreshIcon />
            </button>
            <button type="button" aria-label="Start video call" title="Video call" onClick={() => channel && navigate(`/call/video/channel/${channel.id}`)}>
              <VideoCallIcon />
            </button>
            <button type="button" aria-label="Start audio call" title="Audio call" onClick={() => channel && navigate(`/call/audio/channel/${channel.id}`)}>
              <CallIcon />
            </button>
            <button type="button" aria-label="Notifications" title="Notifications" onClick={() => channel && navigate(`/channel/${channel.id}/notifications`)}>
              <BellIcon />
            </button>
            <button type="button" aria-label="View members" title="Members" onClick={() => channel && navigate(`/channel/${channel.id}/members`)}>
              <MembersIcon />
            </button>
          </div>
        </header>

        <section className="chat-content">
          {(loadingCh || loadingMsg) && (
            <div className="message-list-empty" style={{ paddingTop: 40 }}>
              <p>Loading messages…</p>
            </div>
          )}

          {!loadingCh && !loadingMsg && messages.length === 0 && (
            <div className="message-list-empty">
              <p>No messages yet. Be the first to say something! 👋</p>
            </div>
          )}

          <div className="message-list">
            {messages.map((msg) => {
              const senderName = msg.sender?.name || "Unknown";
              const avatar     = senderName.charAt(0).toUpperCase();
              const isMe       = msg.sender?.id === user?.id || msg.isOptimistic;
              const timeStr    = new Date(msg.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
              return (
                <div
                  key={msg.id}
                  className={`message-item ${isMe ? "message-own" : ""}`}
                  style={{ opacity: msg.isOptimistic ? 0.6 : 1 }}
                >
                  <div className="message-avatar">{avatar}</div>
                  <div className="message-body">
                    <div className="message-meta">
                      <strong>{isMe ? "You" : senderName}</strong>
                      <time>{timeStr}</time>
                    </div>
                    <div className="message-bubble">{msg.content}</div>
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        </section>

        <div className="chat-composer">
          <MessageInput onSend={handleSendMessage} disabled={loadingCh || !channel} />
        </div>

        <div className="chat-footer-note">
          Messages sent in this channel are visible to all members.
          <span style={{ marginLeft: 8, color: "#9ca3af", fontSize: 12 }}>
            Auto-refreshes every 10 s
          </span>
        </div>
      </main>
    </div>
  );
}

export default ChannelMessagingPage;