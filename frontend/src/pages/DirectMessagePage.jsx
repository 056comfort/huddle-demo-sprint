import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";

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

function SmileIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <circle cx="9" cy="10" r="1" fill="currentColor" />
      <circle cx="15" cy="10" r="1" fill="currentColor" />
      <path
        d="M8.5 14c1 1.4 2.2 2 3.5 2s2.5-.6 3.5-2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PaperclipIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m9 12.5 5.2-5.2a3 3 0 0 1 4.2 4.2l-6.8 6.8a4.5 4.5 0 0 1-6.4-6.4l7-7"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function DirectMessagePage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const people = {
    sarah: {
      name: "Sarah",
      initial: "S",
      status: "online",
    },
    david: {
      name: "David",
      initial: "D",
      status: "offline",
    },
  };

  const person = people[userId] || people.sarah;

  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState(() => {
    try {
      const saved = localStorage.getItem(`huddle_dm_${userId}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleSend = (event) => {
    event.preventDefault();

    const text = message.trim();

    if (!text) return;

    const newMessage = {
      id: Date.now(),
      text,
      time: new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      }),
    };

    setMessages((currentMessages) => {
      const updated = [...currentMessages, newMessage];
      try {
        localStorage.setItem(`huddle_dm_${userId}`, JSON.stringify(updated));
      } catch {}
      return updated;
    });

    setMessage("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();

      if (message.trim()) {
        handleSend(event);
      }
    }
  };

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
                {person.initial}
              </div>

              <span
                className={`dm-status ${person.status}`}
              />
            </div>

            <div className="dm-person-info">
              <h1>{person.name}</h1>

              <p>
                {person.status === "online"
                  ? "Active now"
                  : "Offline"}
              </p>
            </div>

          </div>
        </div>

        <div className="dm-actions">

          <button
            type="button"
            aria-label="Start video call"
            title="Video call"
            onClick={() =>
              navigate(`/call/video/${userId}`)
            }
          >
            <VideoCallIcon />
          </button>

          <button
            type="button"
            aria-label="Start audio call"
            title="Audio call"
            onClick={() =>
              navigate(`/call/audio/${userId}`)
            }
          >
            <CallIcon />
          </button>

        </div>

      </header>


      {/* Messages */}
      <section className="dm-messages">

        {messages.length === 0 ? (

          <div className="dm-empty">

            <div className="dm-large-avatar">
              {person.initial}
            </div>

            <h2>
              {person.name}
            </h2>

            <p>
              This is the beginning of your
              direct conversation with{" "}
              <strong>{person.name}</strong>.
            </p>

            <span className="dm-empty-hint">
              Send a message to start the conversation.
            </span>

          </div>

        ) : (

          <div className="dm-message-list">

            <div className="dm-start-divider">
              <span>Today</span>
            </div>

            {messages.map((item) => (

              <article
                key={item.id}
                className="dm-message dm-message-own"
              >

                <div className="dm-message-avatar">
                  Y
                </div>

                <div className="dm-message-body">

                  <div className="dm-message-meta">
                    <strong>You</strong>

                    <time>
                      {item.time}
                    </time>
                  </div>

                  <div className="dm-message-bubble">
                    {item.text}
                  </div>

                </div>

              </article>

            ))}

          </div>

        )}

      </section>


      {/* Composer */}
      <div className="dm-composer-shell">

        <form
          className="dm-composer"
          onSubmit={handleSend}
        >

          <div className="dm-composer-toolbar">

            <button
              type="button"
              aria-label="Attach file"
              title="Attach file"
            >
              <PaperclipIcon />
            </button>

            <button
              type="button"
              aria-label="Add emoji"
              title="Add emoji"
            >
              <SmileIcon />
            </button>

          </div>

          <textarea
            value={message}
            onChange={(event) =>
              setMessage(event.target.value)
            }
            onKeyDown={handleKeyDown}
            placeholder={`Message ${person.name}...`}
            aria-label={`Message ${person.name}`}
            rows={2}
          />

          <div className="dm-composer-footer">

            <span>
              Enter to send · Shift + Enter for new line
            </span>

            <button
              type="submit"
              className="dm-send-button"
              disabled={!message.trim()}
            >
              <span>Send</span>
              <SendIcon />
            </button>

          </div>

        </form>

        <p className="dm-composer-note">
          Messages are private between you and {person.name}.
        </p>

      </div>

    </main>
  );
}

export default DirectMessagePage;