import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

function MicIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v5" />
      <path d="M8 22h8" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M1 1l22 22" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
      <path d="M15 9V5a3 3 0 0 0-5.12-2.12" />
      <path d="M5 10a7 7 0 0 0 11.13 5.66" />
      <path d="M12 19v3" />
      <path d="M8 22h8" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <path d="M15 10l6-3v10l-6-3" />
    </svg>
  );
}

function VideoOffIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M3 3l18 18" />
      <path d="M10.5 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9" />
      <path d="M16 9l4-3v12l-4-3" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M11 5L6 9H3v6h3l5 4V5z" />
      <path d="M15 9a4 4 0 0 1 0 6" />
      <path d="M18 6a8 8 0 0 1 0 12" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.12.9.33 1.78.62 2.63a2 2 0 0 1-.45 2.11L8 9.73a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.85.29 1.73.5 2.63.62A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

const users = {
  sarah: {
    name: "Sarah",
    avatar: "S",
  },
  david: {
    name: "David",
    avatar: "D",
  },
};

function CallPage({ callType = "video", targetType = "dm" }) {
  const { userId } = useParams();
  const navigate = useNavigate();

  const person = users[userId] || {
    name: "Sarah",
    avatar: "S",
  };

  const isVideo = callType === "video";

  const [muted, setMuted] = useState(true);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(false);
  const [seconds, setSeconds] = useState(5);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  function formatDuration(value) {
    const minutes = Math.floor(value / 60);
    const secs = value % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  }

  /*
   * ONLY navigation behavior is changed here.
   *
   * replace:true removes the call page from browser history.
   *
   * Before:
   * DM → Call → DM
   *
   * After:
   * DM → Call
   *       ↓
   *      DM (call replaced)
   *
   * So pressing Back from the DM will NOT reopen the call.
   */
  function handleEndCall() {
    if (targetType === "dm" && userId) {
      navigate(`/dm/${userId}`, {
        replace: true,
      });

      return;
    }

    navigate("/join-channel", {
      replace: true,
    });
  }

  return (
    <div className="call-page">
      <div className="call-background">

        {isVideo ? (
          <>
            {/* =========================
                VIDEO CALL
            ========================== */}

            <div className="remote-video-placeholder">
              <div className="remote-video-avatar">
                {person.avatar}
              </div>

              <div className="remote-video-name">
                {person.name}
              </div>
            </div>

            <div className="video-call-info">
              <h1>{person.name}</h1>

              <div className="call-status">
                <span className="call-status-dot" />
                <span>{formatDuration(seconds)}</span>
              </div>
            </div>

            <div className="self-video">
              {cameraOff ? (
                <div className="self-video-off">
                  <VideoOffIcon />
                  <span>Camera off</span>
                </div>
              ) : (
                <div className="self-video-placeholder">
                  <span>You</span>
                </div>
              )}
            </div>

            <div className="call-controls">

              <button
                type="button"
                className={`call-control ${muted ? "active" : ""}`}
                onClick={() => setMuted((value) => !value)}
                aria-label={muted ? "Unmute microphone" : "Mute microphone"}
                title={muted ? "Unmute microphone" : "Mute microphone"}
              >
                {muted ? <MicOffIcon /> : <MicIcon />}
              </button>

              <button
                type="button"
                className={`call-control ${cameraOff ? "active" : ""}`}
                onClick={() => setCameraOff((value) => !value)}
                aria-label={cameraOff ? "Turn camera on" : "Turn camera off"}
                title={cameraOff ? "Turn camera on" : "Turn camera off"}
              >
                {cameraOff ? <VideoOffIcon /> : <VideoIcon />}
              </button>

              <button
                type="button"
                className={`call-control ${speakerOn ? "active" : ""}`}
                onClick={() => setSpeakerOn((value) => !value)}
                aria-label="Toggle speaker"
                title="Speaker"
              >
                <SpeakerIcon />
              </button>

              <button
                type="button"
                className="call-control end-call"
                onClick={handleEndCall}
                aria-label="End call"
                title="End call"
              >
                <PhoneIcon />
              </button>

            </div>
          </>
        ) : (
          <>
            {/* =========================
                AUDIO CALL
            ========================== */}

            <div className="audio-call-center">

              <div className="call-avatar-large">
                {person.avatar}
              </div>

              <h1>{person.name}</h1>

              <div className="call-status">
                <span className="call-status-dot" />
                <span>Connected</span>
              </div>

              <div className="call-duration">
                {formatDuration(seconds)}
              </div>

            </div>

            <div className="call-controls">

              <button
                type="button"
                className={`call-control ${muted ? "active" : ""}`}
                onClick={() => setMuted((value) => !value)}
                aria-label={muted ? "Unmute microphone" : "Mute microphone"}
                title={muted ? "Unmute microphone" : "Mute microphone"}
              >
                {muted ? <MicOffIcon /> : <MicIcon />}
              </button>

              <button
                type="button"
                className={`call-control ${speakerOn ? "active" : ""}`}
                onClick={() => setSpeakerOn((value) => !value)}
                aria-label="Toggle speaker"
                title="Speaker"
              >
                <SpeakerIcon />
              </button>

              <button
                type="button"
                className="call-control end-call"
                onClick={handleEndCall}
                aria-label="End call"
                title="End call"
              >
                <PhoneIcon />
              </button>

            </div>
          </>
        )}

      </div>
    </div>
  );
}

export default CallPage;