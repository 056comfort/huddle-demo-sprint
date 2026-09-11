import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function CreateChannel() {
  const [channelName, setChannelName] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanName = channelName.trim();

    if (!cleanName) {
      setError("Please enter a channel name.");
      return;
    }

    setError("");

    // Persist channel to localStorage so it shows in the sidebar
    try {
      const DEFAULT_CHANNELS = ["general", "design", "development"];
      const saved = localStorage.getItem("huddle_channels");
      const existing = saved ? JSON.parse(saved) : DEFAULT_CHANNELS;
      const lowerName = cleanName.toLowerCase();
      if (!existing.includes(lowerName)) {
        const updated = [...existing, lowerName];
        localStorage.setItem("huddle_channels", JSON.stringify(updated));
        window.dispatchEvent(new Event("huddle_channels_updated"));
      }
    } catch { /* ignore localStorage errors */ }

    navigate(`/channel/${encodeURIComponent(cleanName)}`);
  };

  return (
    <section className="auth-card">
      <div className="brand">
        <div className="brand-mark">H</div>
        <span>Huddle</span>
      </div>

      <h1>Create a channel</h1>

      <p className="auth-description">
        Give your team a place to have focused conversations.
      </p>

      <form onSubmit={handleSubmit} className="channel-form">
        <label htmlFor="create-channel-name">Channel name</label>

        <input
          id="create-channel-name"
          type="text"
          value={channelName}
          onChange={(event) => {
            setChannelName(event.target.value);
            setError("");
          }}
          placeholder="e.g. design"
          autoComplete="off"
        />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="primary-button">
          Create channel
        </button>
      </form>

      <p className="secondary-action">
        Already have a channel? <Link to="/join-channel">Join a channel</Link>
      </p>
    </section>
  );
}

export default CreateChannel;
