import { useNavigate, useParams } from "react-router-dom";

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

function HashIcon() {
  return (
    <svg
      width="22"
      height="22"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="9" x2="20" y2="9" />
      <line x1="4" y1="15" x2="20" y2="15" />
      <line x1="10" y1="3" x2="8" y2="21" />
      <line x1="16" y1="3" x2="14" y2="21" />
    </svg>
  );
}

function ChevronIcon() {
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
      <path d="m9 18 6-6-6-6" />
    </svg>
  );
}

function ChannelInfoPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();

  const channelName = decodeURIComponent(channelId || "general");

  const channelData = {
    general: {
      description:
        "General team conversation for updates, questions and collaboration.",
      type: "Public channel",
      creator: "Workspace Admin",
      members: 8,
    },
    design: {
      description:
        "Discuss UI, UX, design feedback, visual direction and product decisions.",
      type: "Public channel",
      creator: "Workspace Admin",
      members: 5,
    },
    development: {
      description:
        "Engineering discussions, bugs, features, technical updates and deployments.",
      type: "Public channel",
      creator: "Workspace Admin",
      members: 6,
    },
  };

  const data = channelData[channelName] || {
    description: "Team collaboration channel.",
    type: "Public channel",
    creator: "Workspace Admin",
    members: 0,
  };

  return (
    <main className="channel-info-page">
      <header className="channel-info-header">
        <button
          type="button"
          className="page-back-button"
          onClick={() => navigate(`/channel/${channelId}`)}
          aria-label="Back to channel"
        >
          <BackIcon />
        </button>

        <h1>Channel info</h1>
      </header>

      <section className="channel-info-content">
        <div className="channel-info-hero">
          <div className="channel-info-icon">
            <HashIcon />
          </div>

          <h2>#{channelName}</h2>

          <p>{data.description}</p>
        </div>

        <div className="channel-info-card">
          <button
            type="button"
            onClick={() =>
              navigate(`/channel/${channelId}/members`)
            }
          >
            <div>
              <strong>Members</strong>
              <span>{data.members} members</span>
            </div>

            <ChevronIcon />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/channel/${channelId}/notifications`)
            }
          >
            <div>
              <strong>Notifications</strong>
              <span>Manage channel notifications</span>
            </div>

            <ChevronIcon />
          </button>

          <button
            type="button"
            onClick={() =>
              navigate(`/channel/${channelId}/settings`)
            }
          >
            <div>
              <strong>Permissions & settings</strong>
              <span>Manage channel configuration</span>
            </div>

            <ChevronIcon />
          </button>
        </div>

        <div className="channel-info-details">
          <div>
            <span>Channel type</span>
            <strong>{data.type}</strong>
          </div>

          <div>
            <span>Created by</span>
            <strong>{data.creator}</strong>
          </div>

          <div>
            <span>Channel name</span>
            <strong>#{channelName}</strong>
          </div>
        </div>

        <div className="channel-info-danger">
          <button
            type="button"
            onClick={() => navigate("/join-channel")}
          >
            Leave channel
          </button>
        </div>
      </section>
    </main>
  );
}

export default ChannelInfoPage;