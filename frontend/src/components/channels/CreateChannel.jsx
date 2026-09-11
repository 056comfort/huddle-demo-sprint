import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { endpoints, apiFetch } from "../../api/apiConfig";

function CreateChannel() {
  const [channelName, setChannelName] = useState("");
  const [description, setDescription] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();

    const cleanName = channelName.trim();

    if (!cleanName) {
      setError("Please enter a channel name.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await apiFetch(endpoints.channels, {
        method: "POST",
        body: JSON.stringify({ name: cleanName, description: description.trim() || undefined }),
      });

      const data = await res.json();

      if (res.ok) {
        // Navigate using the channel's real ID so messages persist
        navigate(`/channel/${data.channel.id}`);
      } else if (res.status === 409) {
        setError("A channel with that name already exists. Try joining it instead.");
      } else {
        setError(data.message || "Failed to create channel. Please try again.");
      }
    } catch {
      setError("Network error. Please check your connection and try again.");
    } finally {
      setLoading(false);
    }
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
          placeholder="e.g. capstone-project"
          autoComplete="off"
          disabled={loading}
        />

        <label htmlFor="create-channel-desc" style={{ marginTop: "12px" }}>
          Description <span style={{ fontWeight: 400, color: "#9ca3af" }}>(optional)</span>
        </label>
        <input
          id="create-channel-desc"
          type="text"
          value={description}
          onChange={(event) => setDescription(event.target.value)}
          placeholder="What is this channel about?"
          autoComplete="off"
          disabled={loading}
        />

        {error && <p className="form-error">{error}</p>}

        <button type="submit" className="primary-button" disabled={loading}>
          {loading ? "Creating…" : "Create channel"}
        </button>
      </form>

      <p className="secondary-action">
        Already have a channel? <Link to="/join-channel">Browse &amp; join</Link>
      </p>
    </section>
  );
}

export default CreateChannel;
