import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { endpoints, apiFetch } from "../api/apiConfig.js";

/* ─── Icons ──────────────────────────────────────────────────── */
function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M19 12H5M11 6l-6 6 6 6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
function VideoCallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="3.5" y="6" width="12" height="12" rx="2" fill="none" stroke="currentColor" strokeWidth="1.7" />
      <path d="m15.5 10 5-2.8v9.6l-5-2.8V10Z" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
    </svg>
  );
}
function CallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7.2 4.5 5 5.8c-.8.5-1.1 1.5-.7 2.4 2.1 5.2 6.2 9.3 11.4 11.4.9.4 1.9.1 2.4-.7l1.3-2.2c.4-.7.2-1.6-.5-2l-2.5-1.5c-.6-.4-1.4-.2-1.8.3l-.9 1.1a14.3 14.3 0 0 1-5.3-5.3l1.1-.9c.5-.4.7-1.2.3-1.8L9.2 5c-.4-.7-1.3-.9-2-.5Z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  );
}
function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M4 5.5 20 12 4 18.5l2.2-5.7L15 12l-8.8-.8L4 5.5Z" fill="currentColor" />
    </svg>
  );
}
function RefreshIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */
function DirectMessagePage() {
  const { userId }  = useParams();
  const navigate    = useNavigate();
  const { user: me } = useAuth();

  const [otherUser, setOtherUser]       = useState(null);
  const [convId, setConvId]             = useState(null);
  const [messages, setMessages]         = useState([]);
  const [message, setMessage]           = useState("");
  const [loading, setLoading]           = useState(true);
  const [sending, setSending]           = useState(false);
  const [refreshing, setRefreshing]     = useState(false);
  const [error, setError]               = useState("");

  const messagesEndRef = useRef(null);

  /* ── Load other user info ── */
  useEffect(() => {
    apiFetch(endpoints.userById(userId))
      .then((r) => r.ok ? r.json() : Promise.reject())
      .then(({ user }) => setOtherUser(user))
      .catch(() => setError("User not found."));
  }, [userId]);

  /* ── Find or create the DM conversation ── */
  const initConversation = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiFetch(endpoints.conversations, {
        method: "POST",
        body: JSON.stringify({ userIds: [userId], isGroup: false }),
      });
      if (res.ok) {
        const { conversation } = await res.json();
        setConvId(conversation.id);
        return conversation.id;
      }
    } catch { /* ignore */ }
    finally { setLoading(false); }
    return null;
  }, [userId]);

  /* ── Load messages for a conversation ── */
  const loadMessages = useCallback(async (cId) => {
    if (!cId) return;
    try {
      const res = await apiFetch(endpoints.dmMessages(cId));
      if (res.ok) {
        const data = await res.json();
        setMessages(data.messages || []);
      }
    } catch { /* silent */ }
  }, []);

  /* ── Bootstrap ── */
  useEffect(() => {
    const t = setTimeout(() => {
      initConversation().then((cId) => { if (cId) loadMessages(cId); });
    }, 0);
    return () => clearTimeout(t);
  }, [initConversation, loadMessages]);

  /* ── Auto-poll every 10 s ── */
  useEffect(() => {
    if (!convId) return;
    const interval = setInterval(() => loadMessages(convId), 10_000);
    return () => clearInterval(interval);
  }, [convId, loadMessages]);

  /* ── Scroll to bottom on new messages ── */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  /* ── Manual refresh ── */
  const handleRefresh = async () => {
    if (!convId) return;
    setRefreshing(true);
    await loadMessages(convId);
    setRefreshing(false);
  };

  /* ── Send message ── */
  const handleSend = async (event) => {
    event.preventDefault();
    const text = message.trim();
    if (!text || !convId) return;

    setSending(true);

    // Optimistic
    const optimistic = {
      id: `opt-${Date.now()}`,
      content: text,
      senderId: me?.id,
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };
    setMessages((prev) => [...prev, optimistic]);
    setMessage("");

    try {
      await apiFetch(endpoints.dmMessages(convId), {
        method: "POST",
        body: JSON.stringify({ content: text }),
      });
      await loadMessages(convId);
    } catch {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setMessage(text); // restore the text so user can retry
    } finally {
      setSending(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      if (message.trim()) handleSend(event);
    }
  };

  const displayName = otherUser?.name || "Loading…";
  const initial     = displayName.charAt(0).toUpperCase();

  return (
    <main className="dm-page">
      {/* Header */}
      <header className="dm-header">
        <div className="dm-header-left">
          <button type="button" className="dm-back-button" onClick={() => navigate(-1)} aria-label="Go back" title="Go back">
            <BackIcon />
          </button>

          <div className="dm-person">
            <div className="dm-avatar-wrap">
              <div className="dm-avatar">{initial}</div>
              <span className="dm-status online" />
            </div>
            <div className="dm-person-info">
              <h1>{displayName}</h1>
              <p>{otherUser?.email || ""}</p>
            </div>
          </div>
        </div>

        <div className="dm-actions">
          <button type="button" title="Refresh" aria-label="Refresh messages" onClick={handleRefresh} style={{ opacity: refreshing ? 0.4 : 1 }}>
            <RefreshIcon />
          </button>
          <button type="button" aria-label="Start video call" title="Video call" onClick={() => navigate(`/call/video/${userId}`)}>
            <VideoCallIcon />
          </button>
          <button type="button" aria-label="Start audio call" title="Audio call" onClick={() => navigate(`/call/audio/${userId}`)}>
            <CallIcon />
          </button>
        </div>
      </header>

      {/* Messages */}
      <section className="dm-messages">
        {loading && (
          <div className="dm-empty">
            <p>Loading conversation…</p>
          </div>
        )}

        {error && (
          <div className="dm-empty">
            <p style={{ color: "#ef4444" }}>{error}</p>
          </div>
        )}

        {!loading && !error && messages.length === 0 && (
          <div className="dm-empty">
            <div className="dm-large-avatar">{initial}</div>
            <h2>{displayName}</h2>
            <p>This is the beginning of your direct conversation with <strong>{displayName}</strong>.</p>
            <span className="dm-empty-hint">Send a message to start the conversation.</span>
          </div>
        )}

        {messages.length > 0 && (
          <div className="dm-message-list">
            <div className="dm-start-divider"><span>Today</span></div>
            {messages.map((item) => {
              const isMe = item.senderId === me?.id || item.isOptimistic;
              const senderName = isMe ? "You" : (otherUser?.name || "Them");
              const timeStr = new Date(item.createdAt).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" });
              return (
                <article key={item.id} className={`dm-message ${isMe ? "dm-message-own" : ""}`} style={{ opacity: item.isOptimistic ? 0.6 : 1 }}>
                  <div className="dm-message-avatar">
                    {isMe ? (me?.name?.charAt(0).toUpperCase() || "Y") : initial}
                  </div>
                  <div className="dm-message-body">
                    <div className="dm-message-meta">
                      <strong>{senderName}</strong>
                      <time>{timeStr}</time>
                    </div>
                    <div className="dm-message-bubble">{item.content}</div>
                  </div>
                </article>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}
      </section>

      {/* Composer */}
      <div className="dm-composer-shell">
        <form className="dm-composer" onSubmit={handleSend}>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${displayName}…`}
            aria-label={`Message ${displayName}`}
            rows={2}
            disabled={sending || !convId}
          />
          <div className="dm-composer-footer">
            <span>Enter to send · Shift + Enter for new line · Auto-refreshes every 10 s</span>
            <button type="submit" className="dm-send-button" disabled={!message.trim() || sending || !convId}>
              <span>Send</span>
              <SendIcon />
            </button>
          </div>
        </form>
        <p className="dm-composer-note">Messages are private between you and {displayName}.</p>
      </div>
    </main>
  );
}

export default DirectMessagePage;