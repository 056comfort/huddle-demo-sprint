import { Link } from "react-router-dom";

const channels = ["general", "design", "development"];

const directMessages = [
  { id: "sarah", name: "Sarah", status: "online", avatar: "S" },
  { id: "david", name: "David", status: "online", avatar: "D" },
];

function HashIcon() {
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

function HomeIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m4 10 8-6 8 6v9a1 1 0 0 1-1 1h-5v-5H10v5H5a1 1 0 0 1-1-1v-9Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 15.1a3.1 3.1 0 1 0 0-6.2 3.1 3.1 0 0 0 0 6.2Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-1.8 1.8-.1-.1a1.7 1.7 0 0 0-1.9-.3l-.4.2a1.7 1.7 0 0 0-1 1.6v.2h-2.6v-.2a1.7 1.7 0 0 0-1-1.6l-.4-.2a1.7 1.7 0 0 0-1.9.3l-.1.1-1.8-1.8.1-.1a1.7 1.7 0 0 0 .3-1.9l-.2-.4a1.7 1.7 0 0 0-1.6-1H5v-2.6h.2a1.7 1.7 0 0 0 1.6-1l.2-.4A1.7 1.7 0 0 0 6.7 7l-.1-.1 1.8-1.8.1.1a1.7 1.7 0 0 0 1.9.3l.4-.2a1.7 1.7 0 0 0 1-1.6v-.2h2.6v.2a1.7 1.7 0 0 0 1 1.6l.4.2a1.7 1.7 0 0 0 1.9-.3l.1-.1 1.8 1.8-.1.1a1.7 1.7 0 0 0-.3 1.9l.2.4a1.7 1.7 0 0 0 1.6 1h.2v2.6H21a1.7 1.7 0 0 0-1.6 1l-.2.4Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function HelpIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <circle
        cx="12"
        cy="12"
        r="8.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M9.8 9.3a2.4 2.4 0 1 1 4.2 1.6c-.9.9-2 1.2-2 2.5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <circle cx="12" cy="16.8" r=".9" fill="currentColor" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M12 5v14M5 12h14"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="m8 10 4 4 4-4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function StatusDot({ status = "online" }) {
  return <span className={`person-status ${status}`} />;
}

function PersonAvatar({ letter, status = "online" }) {
  return (
    <span className="person-avatar-wrap">
      <span className="person-avatar">{letter}</span>
      <StatusDot status={status} />
    </span>
  );
}

function ChannelList({ activeChannel }) {
  return (
    <div className="sidebar-navigation">
      <Link to="/channel/general" className="sidebar-home-link">
        <HomeIcon />
        <span>Go to home</span>
      </Link>

      <section className="sidebar-section">
        <div className="sidebar-section-heading">
          <span>Channels</span>

          <Link
            to="/create-channel"
            className="section-add-button"
            aria-label="Create channel"
          >
            <PlusIcon />
          </Link>
        </div>

        <nav className="sidebar-channel-list">
          {channels.map((channel) => (
            <Link
              key={channel}
              to={`/channel/${encodeURIComponent(channel)}`}
              className={`sidebar-channel-link ${
                activeChannel === channel ? "active" : ""
              }`}
            >
              <HashIcon />
              <span>{channel}</span>
            </Link>
          ))}
        </nav>
      </section>

      <section className="sidebar-section direct-message-section">
        <div className="sidebar-section-heading">
          <span>Direct messages</span>

          <button
            type="button"
            className="section-add-button"
            aria-label="Add direct message"
          >
            <PlusIcon />
          </button>
        </div>

        <div className="direct-message-list">
          {directMessages.map((person) => (
            <button
              key={person.id}
              type="button"
              className="direct-message-item"
            >
              <PersonAvatar letter={person.avatar} status={person.status} />

              <span>{person.name}</span>
            </button>
          ))}
        </div>
      </section>

      <div className="sidebar-bottom-links">
        <button type="button" className="sidebar-bottom-link">
          <SettingsIcon />
          <span>Settings</span>
        </button>

        <button type="button" className="sidebar-bottom-link">
          <HelpIcon />
          <span>Support</span>
        </button>
      </div>
    </div>
  );
}

export default ChannelList;
