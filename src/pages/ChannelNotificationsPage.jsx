import { useState } from "react";
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

function ChannelNotificationsPage() {
  const { channelId } = useParams();
  const navigate = useNavigate();

  const channelName = decodeURIComponent(channelId || "general");

  const [notificationLevel, setNotificationLevel] =
    useState("all");

  const [soundEnabled, setSoundEnabled] = useState(true);

  const [desktopEnabled, setDesktopEnabled] = useState(true);

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
          <h1>Notifications</h1>
          <p>#{channelName}</p>
        </div>
      </header>

      <section className="channel-settings-content">
        <div className="settings-section">
          <h2>Notify me about</h2>

          <label className="radio-setting">
            <input
              type="radio"
              name="notifications"
              value="all"
              checked={notificationLevel === "all"}
              onChange={() => setNotificationLevel("all")}
            />

            <div>
              <strong>All messages</strong>
              <span>
                Get notified whenever someone sends a message.
              </span>
            </div>
          </label>

          <label className="radio-setting">
            <input
              type="radio"
              name="notifications"
              value="mentions"
              checked={notificationLevel === "mentions"}
              onChange={() => setNotificationLevel("mentions")}
            />

            <div>
              <strong>Mentions only</strong>
              <span>
                Only notify me when someone mentions me.
              </span>
            </div>
          </label>

          <label className="radio-setting">
            <input
              type="radio"
              name="notifications"
              value="nothing"
              checked={notificationLevel === "nothing"}
              onChange={() => setNotificationLevel("nothing")}
            />

            <div>
              <strong>Nothing</strong>
              <span>
                Don't send notifications from this channel.
              </span>
            </div>
          </label>
        </div>

        <div className="settings-section">
          <h2>Notification preferences</h2>

          <div className="toggle-setting">
            <div>
              <strong>Notification sound</strong>
              <span>Play a sound for new notifications.</span>
            </div>

            <button
              type="button"
              className={`toggle ${
                soundEnabled ? "active" : ""
              }`}
              onClick={() => setSoundEnabled(!soundEnabled)}
              aria-label="Toggle notification sound"
            >
              <span />
            </button>
          </div>

          <div className="toggle-setting">
            <div>
              <strong>Desktop notifications</strong>
              <span>
                Show notifications on your desktop.
              </span>
            </div>

            <button
              type="button"
              className={`toggle ${
                desktopEnabled ? "active" : ""
              }`}
              onClick={() =>
                setDesktopEnabled(!desktopEnabled)
              }
              aria-label="Toggle desktop notifications"
            >
              <span />
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}

export default ChannelNotificationsPage;