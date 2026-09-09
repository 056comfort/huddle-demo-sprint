import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

function JoinChannel() {
  const [channel, setChannel] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleSubmit = (event) => {
    event.preventDefault();

    const cleanChannel = channel.trim();

    if (!cleanChannel) {
      setError("Please enter a channel name.");
      return;
    }

    setError("");

    navigate(`/channel/${encodeURIComponent(cleanChannel)}`);
  };

  return (
    <section className="auth-card">
      <div className="brand">
        <div className="brand-mark">H</div>
        <span>Huddle</span>
      </div>

      <h1>Join a channel</h1>

      <p className="auth-description">
        Enter a channel name to join the conversation.
      </p>

      <form onSubmit={handleSubmit} className="channel-form">
        <label htmlFor="channel-name">Channel name</label>

        <input
          id="channel-name"
          type="text"
          value={channel}
          onChange={(event) => {
            setChannel(event.target.value);
            setError("");
          }}
          placeholder="e.g. general"
          autoComplete="off"
        />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="primary-button">
          Join channel
        </button>
      </form>

      <p className="secondary-action">
        Want to start a new conversation?{" "}
        <Link to="/create-channel">Create a channel</Link>
      </p>
    </section>
  );
}

export default JoinChannel;
