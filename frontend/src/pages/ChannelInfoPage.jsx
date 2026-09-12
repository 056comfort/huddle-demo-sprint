import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { apiFetch, endpoints } from "../api/apiConfig";

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
  const { channelId: channelParam } = useParams();
  const navigate = useNavigate();

  const [channelData, setChannelData] = useState(null);
  const [loading, setLoading] = useState(true);

  const resolveAndLoadChannel = useCallback(async () => {
    try {
      const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(channelParam);
      const url = isUUID ? endpoints.channelById(channelParam) : endpoints.channelByName(channelParam);
      
      const res = await apiFetch(url);
      if (res.ok) {
        const { channel } = await res.json();
        setChannelData(channel);
        if (!isUUID) {
          navigate(`/channel/${channel.id}/info`, { replace: true });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [channelParam, navigate]);

  useEffect(() => {
    resolveAndLoadChannel();
  }, [resolveAndLoadChannel]);

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  const data = channelData ? {
    name: channelData.name,
    description: channelData.description || "Team collaboration channel.",
    type: "Public channel", // Add logic for private channels if applicable
    creator: "Workspace Admin", // Update if backend tracks creator
    members: channelData._count?.members || channelData.members?.length || 0,
  } : {
    name: decodeURIComponent(channelParam),
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
          onClick={() => navigate(`/channel/${channelData?.id || channelParam}`)}
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

          <h2>#{data.name}</h2>

          <p>{data.description}</p>
        </div>

        <div className="channel-info-card">
          <button
            type="button"
            onClick={() =>
              navigate(`/channel/${channelData?.id || channelParam}/members`)
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
              navigate(`/channel/${channelData?.id || channelParam}/notifications`)
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
              navigate(`/channel/${channelData?.id || channelParam}/settings`)
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
            <strong>#{data.name}</strong>
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