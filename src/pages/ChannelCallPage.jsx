import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      <path d="M8 21h8" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M9 9v5a3 3 0 0 0 5.2 2" />
      <path d="M15 9V6a3 3 0 0 0-6 0v1" />
      <path d="M5 11a7 7 0 0 0 11.9 4.9" />
      <path d="M19 11a7 7 0 0 1-.7 3" />
      <path d="M12 18v3" />
      <path d="M8 21h8" />
      <path d="m3 3 18 18" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m15 10 5-3v10l-5-3" />
      <rect x="3" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function VideoOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 3 18 18" />
      <path d="m15 10 5-3v10l-5-3" />
      <rect x="3" y="6" width="12" height="12" rx="2" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5 6 9H3v6h3l5 4V5Z" />
      <path d="M15 9a4 4 0 0 1 0 6" />
      <path d="M18 6a8 8 0 0 1 0 12" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2
        19.8 19.8 0 0 1-8.6-3.1
        19.5 19.5 0 0 1-6-6
        19.8 19.8 0 0 1-3.1-8.6
        A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7
        12.8 12.8 0 0 0 .7 2.8
        2 2 0 0 1-.5 2.1L8 9.9
        a16 16 0 0 0 6 6l1.3-1.3
        a2 2 0 0 1 2.1-.5
        12.8 12.8 0 0 0 2.8.7
        A2 2 0 0 1 22 16.9Z"
      />
    </svg>
  );
}

const participants = [
  {
    id: "sarah",
    name: "Sarah",
    initial: "S",
    status: "online",
  },
  {
    id: "david",
    name: "David",
    initial: "D",
    status: "online",
  },
  {
    id: "you",
    name: "You",
    initial: "Y",
    status: "online",
  },
];

function ChannelCallPage({ callType = "audio" }) {
  const { channelId } = useParams();
  const navigate = useNavigate();

  const isVideo = callType === "video";
  const channelName = decodeURIComponent(channelId || "general");

  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatDuration = () => {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");

    const remainingSeconds = (seconds % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  };

  const handleLeaveCall = () => {
    navigate(`/channel/${encodeURIComponent(channelName)}`);
  };

  return (
    <main
      className={`channel-call-page ${
        isVideo ? "channel-video-call" : "channel-audio-call"
      }`}
    >
      <div className="channel-call-background" />

      {/* Top bar */}
      <header className="channel-call-header">
        <div>
          <div className="channel-call-title">
            <span>#</span>
            <h1>{channelName}</h1>
          </div>

          <p>
            {participants.length} people in call
            <span> · </span>
            {formatDuration()}
          </p>
        </div>
      </header>

      {/* Participants */}
      <section className="channel-call-participants">
        {participants.map((participant) => (
          <article
            key={participant.id}
            className={`channel-participant ${
              participant.id === "you" ? "current-user" : ""
            }`}
          >
            <div className="channel-participant-avatar">
              {participant.initial}

              <span className="channel-participant-status" />
            </div>

            <div className="channel-participant-name">
              {participant.name}
            </div>

            {participant.id !== "you" && (
              <div className="channel-participant-speaking">
                {participant.name === "Sarah" ? "Speaking" : ""}
              </div>
            )}

            {participant.id === "you" && muted && (
              <div className="channel-participant-muted">
                Muted
              </div>
            )}
          </article>
        ))}
      </section>

      {/* Video self-preview */}
      {isVideo && (
        <div className="channel-self-preview">
          {cameraOff ? (
            <div className="channel-self-camera-off">
              <VideoOffIcon />
              <span>Camera off</span>
            </div>
          ) : (
            <>
              <div className="channel-self-avatar">Y</div>
              <span>You</span>
            </>
          )}
        </div>
      )}

      {/* Bottom controls */}
      <div className="channel-call-controls">
        <button
          type="button"
          className={`channel-call-control ${
            muted ? "active" : ""
          }`}
          onClick={() => setMuted((value) => !value)}
          title={muted ? "Unmute" : "Mute"}
          aria-label={muted ? "Unmute microphone" : "Mute microphone"}
        >
          {muted ? <MicOffIcon /> : <MicIcon />}
        </button>

        {isVideo && (
          <button
            type="button"
            className={`channel-call-control ${
              cameraOff ? "active" : ""
            }`}
            onClick={() => setCameraOff((value) => !value)}
            title={cameraOff ? "Turn camera on" : "Turn camera off"}
            aria-label={
              cameraOff ? "Turn camera on" : "Turn camera off"
            }
          >
            {cameraOff ? <VideoOffIcon /> : <VideoIcon />}
          </button>
        )}

        <button
          type="button"
          className={`channel-call-control ${
            speakerOn ? "active" : ""
          }`}
          onClick={() => setSpeakerOn((value) => !value)}
          title={speakerOn ? "Speaker on" : "Speaker off"}
          aria-label={
            speakerOn ? "Turn speaker off" : "Turn speaker on"
          }
        >
          <SpeakerIcon />
        </button>

        <button
          type="button"
          className="channel-call-control leave-call"
          onClick={handleLeaveCall}
          title="Leave call"
          aria-label="Leave call"
        >
          <PhoneIcon />
        </button>
      </div>
    </main>
  );
}

export default ChannelCallPage;