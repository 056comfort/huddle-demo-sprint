import { useState } from "react";
import { useParams } from "react-router-dom";
import ChannelList from "../components/channels/ChannelList";
import MessageList from "../components/messaging/MessageList";
import MessageInput from "../components/messaging/MessageInput";

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="10.8"
        cy="10.8"
        r="6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="m15.3 15.3 4.2 4.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MembersIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="9"
        cy="8"
        r="3"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <path
        d="M3.5 18c.4-3.2 2.4-5 5.5-5s5.1 1.8 5.5 5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <path
        d="M16 6.2a2.6 2.6 0 0 1 0 5.1M16 14c2.4.2 4 1.6 4.5 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6.5 10.5a5.5 5.5 0 0 1 11 0c0 4 1.5 5 1.5 5h-14s1.5-1 1.5-5Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinejoin="round"
      />
      <path
        d="M10 18a2.2 2.2 0 0 0 4 0"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M5 8h14M5 12h14M5 16h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChannelHashIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M10 3 8 21M16 3l-2 18M4 9h17M3 15h17"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function UserAvatar({ letter = "Y", status = "online" }) {
  return (
    <div className="profile-avatar-wrap">
      <div className="profile-avatar">{letter}</div>

      <span className={`profile-status ${status}`} />
    </div>
  );
}

function ChannelMessagingPage() {
  const { channelId } = useParams();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const channelName = decodeURIComponent(channelId || "general");

  const handleSendMessage = (message) => {
    // This is intentionally ready for backend integration.
    console.log("Send message:", {
      channelId,
      message,
    });
  };

  return (
    <main className="chat-app">
      <aside className={`sidebar ${isSidebarOpen ? "mobile-open" : ""}`}>
        <div className="sidebar-header">
          <div className="workspace-identity">
            <div className="workspace-avatar">H</div>

            <div className="workspace-text">
              <strong>Huddle Team</strong>
              <span>Team workspace</span>
            </div>

            <button
              type="button"
              className="workspace-dropdown"
              aria-label="Workspace menu"
            >
              ⌄
            </button>
          </div>
        </div>

        <ChannelList activeChannel={channelName} />

        <div className="profile-area">
          <div className="profile">
            <UserAvatar letter="Y" status="online" />

            <div className="profile-info">
              <strong>Your Name</strong>
              <span>Online</span>
            </div>

            <button
              type="button"
              className="profile-menu"
              aria-label="Open profile menu"
            >
              ⋯
            </button>
          </div>
        </div>
      </aside>

      {isSidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      <section className="chat-panel">
        <header className="chat-header">
          <div className="chat-header-main">
            <button
              type="button"
              className="mobile-menu-button"
              onClick={() => setIsSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <MenuIcon />
            </button>

            <div className="channel-heading">
              <div className="channel-title-row">
                <ChannelHashIcon />

                <h1>{channelName}</h1>
              </div>

              <p>
                General team conversation for updates, questions and
                collaboration.
              </p>
            </div>
          </div>

          <div className="chat-header-actions">
            <button type="button" aria-label="Search">
              <SearchIcon />
            </button>

            <button type="button" aria-label="Members">
              <MembersIcon />
            </button>

            <button type="button" aria-label="Notifications">
              <BellIcon />
            </button>

            <div className="header-avatars">
              <span className="mini-avatar">S</span>
              <span className="mini-avatar">D</span>
            </div>
          </div>
        </header>

        <MessageList />

        <div className="composer-shell">
          <MessageInput onSend={handleSendMessage} />

          <p className="composer-footer-note">
            Messages are visible to everyone in #{channelName}
          </p>
        </div>
      </section>
    </main>
  );
}

export default ChannelMessagingPage;
