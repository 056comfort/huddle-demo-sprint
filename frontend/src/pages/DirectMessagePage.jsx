import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth.js";
import { endpoints, apiFetch } from "../api/apiConfig.js";

/* ─── Icons ──────────────────────────────────────────────────── */

function BackIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M19 12H5M11 6l-6 6 6 6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function VideoCallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3.5"
        y="6"
        width="12"
        height="12"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m15.5 10 5-2.8v9.6l-5-2.8V10Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function CallIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M7.2 4.5 5 5.8c-.8.5-1.1 1.5-.7 2.4 2.1 5.2 6.2 9.3 11.4 11.4.9.4 1.9.1 2.4-.7l1.3-2.2c.4-.7.2-1.6-.5-2l-2.5-1.5c-.6-.4-1.4-.2-1.8.3l-.9 1.1a14.3 14.3 0 0 1-5.3-5.3l1.1-.9c.5-.4.7-1.2.3-1.8L9.2 5c-.4-.7-1.3-.9-2-.5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SendIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M4 5.5 20 12 4 18.5l2.2-5.7L15 12l-8.8-.8L4 5.5Z"
        fill="currentColor"
      />
    </svg>
  );
}

function RefreshIcon() {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

/* ─── Main Component ─────────────────────────────────────────── */

function DirectMessagePage() {
  const { userId } = useParams();
  const navigate = useNavigate();
  const { user: me } = useAuth();

  const [otherUser, setOtherUser] = useState(null);
  const [convId, setConvId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const messagesEndRef = useRef(null);
  const requestIdRef = useRef(0);

  /* ── Load other user ── */

  useEffect(() => {
    let cancelled = false;

    const loadOtherUser = async () => {
      if (!userId) {
        if (!cancelled) {
          setOtherUser(null);
          setError("User not found.");
        }
        return;
      }

      try {
        const res = await apiFetch(
          endpoints.userById(userId)
        );

        const data = await res.json().catch(() => ({}));

        if (!res.ok) {
          throw new Error(
            data.message || "User not found."
          );
        }

        if (!cancelled) {
          setOtherUser(data.user || data || null);
        }
      } catch (error) {
        if (!cancelled) {
          console.error("Load user error:", error);

          setOtherUser(null);
          setError(
            error.message || "User not found."
          );
        }
      }
    };

    loadOtherUser();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  /* ── Find or create conversation ── */

  const initConversation = useCallback(async () => {
    if (!userId) {
      throw new Error("User ID is missing.");
    }

    const res = await apiFetch(
      endpoints.conversations,
      {
        method: "POST",
        body: JSON.stringify({
          userIds: [userId],
          isGroup: false,
        }),
      }
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.message ||
          "Failed to create or find conversation."
      );
    }

    const conversation = data?.conversation;

    if (!conversation?.id) {
      throw new Error(
        "Conversation ID was not returned by the server."
      );
    }

    return conversation.id;
  }, [userId]);

  /* ── Load messages ── */

  const loadMessages = useCallback(async (conversationId) => {
    if (!conversationId) {
      return [];
    }

    const res = await apiFetch(
      endpoints.dmMessages(conversationId)
    );

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      throw new Error(
        data.message ||
          "Failed to load conversation messages."
      );
    }

    if (!Array.isArray(data.messages)) {
      throw new Error(
        "Invalid messages response from the server."
      );
    }

    return data.messages;
  }, []);

  /* ── Initial conversation loading ── */

  useEffect(() => {
    let cancelled = false;

    const currentRequestId =
      ++requestIdRef.current;

    const bootstrap = async () => {
      setLoading(true);
      setError("");

      /*
       * We are navigating to a different user,
       * so the previous conversation must not
       * remain visible while the new one loads.
       */
      setConvId(null);
      setMessages([]);

      try {
        /*
         * STEP 1:
         * Find or create the conversation.
         */
        const cId = await initConversation();

        if (
          cancelled ||
          currentRequestId !== requestIdRef.current
        ) {
          return;
        }

        setConvId(cId);

        /*
         * STEP 2:
         * Load the messages for that conversation.
         */
        const loadedMessages =
          await loadMessages(cId);

        if (
          cancelled ||
          currentRequestId !== requestIdRef.current
        ) {
          return;
        }

        setMessages(loadedMessages);

        /*
         * Clear any previous error after
         * everything succeeds.
         */
        setError("");
      } catch (error) {
        if (
          cancelled ||
          currentRequestId !== requestIdRef.current
        ) {
          return;
        }

        console.error(
          "Conversation load error:",
          error
        );

        /*
         * IMPORTANT:
         *
         * Do NOT call setMessages([]) here.
         *
         * If messages were already loaded before
         * another part of the request failed,
         * preserve them.
         */
        setError(
          error.message ||
            "Failed to load conversation."
        );
      } finally {
        if (
          !cancelled &&
          currentRequestId === requestIdRef.current
        ) {
          setLoading(false);
        }
      }
    };

    bootstrap();

    return () => {
      cancelled = true;
    };
  }, [initConversation, loadMessages]);

  /* ── Auto-refresh every 10 seconds ── */

  useEffect(() => {
    if (!convId || loading) {
      return;
    }

    const interval = setInterval(async () => {
      try {
        const loadedMessages =
          await loadMessages(convId);

        setMessages(loadedMessages);

        /*
         * Successful refresh clears only the
         * refresh error.
         */
        setError("");
      } catch (error) {
        console.error(
          "Auto-refresh messages error:",
          error
        );

        /*
         * Preserve the messages currently
         * displayed.
         */
        setError(
          error.message ||
            "Unable to refresh messages."
        );
      }
    }, 10000);

    return () => {
      clearInterval(interval);
    };
  }, [convId, loading, loadMessages]);

  /* ── Scroll to latest message ── */

  useEffect(() => {
    if (loading) {
      return;
    }

    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, loading]);

  /* ── Manual refresh ── */

  const handleRefresh = async () => {
    if (
      !convId ||
      refreshing ||
      loading
    ) {
      return;
    }

    setRefreshing(true);

    try {
      const loadedMessages =
        await loadMessages(convId);

      setMessages(loadedMessages);
      setError("");
    } catch (error) {
      console.error(
        "Manual refresh error:",
        error
      );

      /*
       * Keep existing messages.
       */
      setError(
        error.message ||
          "Failed to refresh messages."
      );
    } finally {
      setRefreshing(false);
    }
  };

  /* ── Send message ── */

  const handleSend = async (event) => {
    event.preventDefault();

    const text = message.trim();

    if (
      !text ||
      !convId ||
      loading ||
      sending
    ) {
      return;
    }

    setSending(true);
    setError("");

    const optimisticId =
      `opt-${Date.now()}-${Math.random()
        .toString(36)
        .slice(2)}`;

    const optimistic = {
      id: optimisticId,
      content: text,
      senderId: me?.id,
      sender: {
        id: me?.id,
        name: me?.name,
        email: me?.email,
      },
      createdAt: new Date().toISOString(),
      isOptimistic: true,
    };

    /*
     * Show the message immediately.
     */
    setMessages((prev) => [
      ...prev,
      optimistic,
    ]);

    setMessage("");

    try {
      const res = await apiFetch(
        endpoints.dmMessages(convId),
        {
          method: "POST",
          body: JSON.stringify({
            content: text,
          }),
        }
      );

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(
          data.message ||
            `Failed to send message (${res.status}).`
        );
      }

      /*
       * Backend returns:
       *
       * {
       *   message: "Message sent successfully",
       *   data: { ...message }
       * }
       */
      if (data?.data) {
        setMessages((prev) =>
          prev.map((item) =>
            item.id === optimisticId
              ? data.data
              : item
          )
        );
      } else {
        /*
         * Fallback if the server doesn't
         * return the created message.
         */
        const loadedMessages =
          await loadMessages(convId);

        setMessages(loadedMessages);
      }
    } catch (error) {
      console.error(
        "Send message error:",
        error
      );

      /*
       * Remove only the failed optimistic
       * message. Existing messages remain.
       */
      setMessages((prev) =>
        prev.filter(
          (item) =>
            item.id !== optimisticId
        )
      );

      /*
       * Restore the text so it can be retried.
       */
      setMessage(text);

      setError(
        error.message ||
          "Failed to send message."
      );
    } finally {
      setSending(false);
    }
  };

  /* ── Enter to send ── */

  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();

      if (
        message.trim() &&
        !sending &&
        !loading &&
        convId
      ) {
        handleSend(event);
      }
    }
  };

  const displayName =
    otherUser?.name || "Loading…";

  const initial =
    displayName
      .charAt(0)
      .toUpperCase();

  return (
    <main className="dm-page">
      {/* Header */}
      <header className="dm-header">
        <div className="dm-header-left">
          <button
            type="button"
            className="dm-back-button"
            onClick={() => navigate(-1)}
            aria-label="Go back"
            title="Go back"
          >
            <BackIcon />
          </button>

          <div className="dm-person">
            <div className="dm-avatar-wrap">
              <div className="dm-avatar">
                {initial}
              </div>

              <span className="dm-status online" />
            </div>

            <div className="dm-person-info">
              <h1>{displayName}</h1>

              <p>
                {otherUser?.email || ""}
              </p>
            </div>
          </div>
        </div>

        <div className="dm-actions">
          <button
            type="button"
            title="Refresh"
            aria-label="Refresh messages"
            onClick={handleRefresh}
            disabled={
              refreshing ||
              loading ||
              !convId
            }
            style={{
              opacity:
                refreshing ||
                loading ||
                !convId
                  ? 0.4
                  : 1,
            }}
          >
            <RefreshIcon />
          </button>

          <button
            type="button"
            aria-label="Start video call"
            title="Video call"
            onClick={() =>
              navigate(
                `/call/video/${userId}`
              )
            }
            disabled={!userId}
          >
            <VideoCallIcon />
          </button>

          <button
            type="button"
            aria-label="Start audio call"
            title="Audio call"
            onClick={() =>
              navigate(
                `/call/audio/${userId}`
              )
            }
            disabled={!userId}
          >
            <CallIcon />
          </button>
        </div>
      </header>

      {/* Error banner */}
      {!loading &&
        error &&
        messages.length > 0 && (
          <div
            className="dm-error-banner"
            role="alert"
            style={{
              padding: "8px 16px",
              fontSize: "13px",
            }}
          >
            {error}
          </div>
        )}

      {/* Messages */}
      <section className="dm-messages">
        {loading && (
          <div className="dm-empty">
            <p>
              Loading conversation…
            </p>
          </div>
        )}

        {!loading &&
          error &&
          messages.length === 0 && (
            <div className="dm-empty">
              <p
                style={{
                  color: "#ef4444",
                }}
              >
                {error}
              </p>

              <button
                type="button"
                onClick={handleRefresh}
                disabled={!convId || refreshing}
                style={{
                  marginTop: "12px",
                }}
              >
                {refreshing
                  ? "Retrying…"
                  : "Try again"}
              </button>
            </div>
          )}

        {!loading &&
          !error &&
          messages.length === 0 && (
            <div className="dm-empty">
              <div className="dm-large-avatar">
                {initial}
              </div>

              <h2>{displayName}</h2>

              <p>
                This is the beginning of
                your direct conversation
                with{" "}
                <strong>
                  {displayName}
                </strong>
                .
              </p>

              <span className="dm-empty-hint">
                Send a message to start
                the conversation.
              </span>
            </div>
          )}

        {!loading &&
          messages.length > 0 && (
            <div className="dm-message-list">
              <div className="dm-start-divider">
                <span>Today</span>
              </div>

              {messages.map((item) => {
                const isMe =
                  item.senderId === me?.id ||
                  item.sender?.id === me?.id ||
                  item.isOptimistic;

                const senderName = isMe
                  ? "You"
                  : otherUser?.name ||
                    "Them";

                const timeStr =
                  item.createdAt
                    ? new Date(
                        item.createdAt
                      ).toLocaleTimeString(
                        [],
                        {
                          hour: "numeric",
                          minute: "2-digit",
                        }
                      )
                    : "";

                return (
                  <article
                    key={item.id}
                    className={`dm-message ${
                      isMe
                        ? "dm-message-own"
                        : ""
                    }`}
                    style={{
                      opacity:
                        item.isOptimistic
                          ? 0.6
                          : 1,
                    }}
                  >
                    <div className="dm-message-avatar">
                      {isMe
                        ? me?.name
                            ?.charAt(0)
                            .toUpperCase() ||
                          "Y"
                        : initial}
                    </div>

                    <div className="dm-message-body">
                      <div className="dm-message-meta">
                        <strong>
                          {senderName}
                        </strong>

                        <time>
                          {timeStr}
                        </time>
                      </div>

                      <div className="dm-message-bubble">
                        {item.content}
                      </div>
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
        <form
          className="dm-composer"
          onSubmit={handleSend}
        >
          <textarea
            value={message}
            onChange={(event) =>
              setMessage(
                event.target.value
              )
            }
            onKeyDown={handleKeyDown}
            placeholder={`Message ${displayName}…`}
            aria-label={`Message ${displayName}`}
            rows={2}
            disabled={
              loading ||
              sending ||
              !convId
            }
          />

          <div className="dm-composer-footer">
            <span>
              Enter to send · Shift +
              Enter for new line ·
              Auto-refreshes every 10 s
            </span>

            <button
              type="submit"
              className="dm-send-button"
              disabled={
                loading ||
                sending ||
                !convId ||
                !message.trim()
              }
            >
              <span>
                {sending
                  ? "Sending…"
                  : "Send"}
              </span>

              <SendIcon />
            </button>
          </div>
        </form>

        <p className="dm-composer-note">
          Messages are private between
          you and {displayName}.
        </p>
      </div>
    </main>
  );
}

export default DirectMessagePage;