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

function ChannelSettingsPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();

  const channelName = decodeURIComponent(channelId || "general");

  return (
    <main className="channel-settings-page">
      <header className="channel-settings-header">
        <button
          type="button"
          className="page-back-button"
          onClick={() => navigate(`/channel/${channelId}`)}
          aria-label="Back to channel"
        >
          <BackIcon />
        </button>

        <div>
          <h1>Channel settings</h1>
          <p>#{channelName}</p>
        </div>
      </header>

      <section className="channel-settings-content">
        <div className="settings-section">
          <h2>Channel</h2>

          <button className="settings-row" type="button">
            <div>
              <strong>Edit channel information</strong>
              <span>
                Change the channel name and description.
              </span>
            </div>

            <ChevronIcon />
          </button>

          <button
            className="settings-row"
            type="button"
            onClick={() =>
              navigate(`/channel/${channelId}/members`)
            }
          >
            <div>
              <strong>Manage members</strong>
              <span>
                View and manage people in this channel.
              </span>
            </div>

            <ChevronIcon />
          </button>
        </div>

        <div className="settings-section">
          <h2>Permissions</h2>

          <button className="settings-row" type="button">
            <div>
              <strong>Channel permissions</strong>
              <span>
                Control who can view, send messages, upload
                files and start calls.
              </span>
            </div>

            <ChevronIcon />
          </button>
        </div>

        <div className="settings-section">
          <h2>Communication</h2>

          <div className="permission-list">
            <div>
              <span>Send messages</span>
              <strong>Everyone</strong>
            </div>

            <div>
              <span>Reply to messages</span>
              <strong>Everyone</strong>
            </div>

            <div>
              <span>Upload files</span>
              <strong>Everyone</strong>
            </div>

            <div>
              <span>Start calls</span>
              <strong>Members</strong>
            </div>

            <div>
              <span>Manage members</span>
              <strong>Admins</strong>
            </div>
          </div>
        </div>

        <div className="danger-zone">
          <h2>Danger zone</h2>

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

export default ChannelSettingsPage;