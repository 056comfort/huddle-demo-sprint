import { useParams, useNavigate } from "react-router-dom";

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="3.5"
        y="6"
        width="12"
        height="12"
        rx="2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="m15.5 10 5-2.8v9.6l-5-2.8V10Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect
        x="8"
        y="3"
        width="8"
        height="12"
        rx="4"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
      />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function PhoneOffIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path
        d="M6 4.8 4.8 6.2c-.5.6-.6 1.5-.1 2.2 2.5 4.1 5.9 7.5 10 10 .7.4 1.6.4 2.2-.1l1.4-1.2"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M15.5 5.5 19 9M19 5.5 15.5 9"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function VideoCallPage() {
  const { userId } = useParams();
  const navigate = useNavigate();

  const names = {
    sarah: "Sarah",
    david: "David",
  };

  const name = names[userId] || "Participant";

  return (
    <main className="call-page">
      <section className="call-video-area">
        <div className="call-participant">
          <div className="call-avatar">
            {name.charAt(0)}
          </div>

          <h1>{name}</h1>
          <p>Connecting...</p>
        </div>

        <div className="call-self-preview">
          <span>You</span>
        </div>
      </section>

      <footer className="call-controls">
        <button type="button" aria-label="Toggle microphone">
          <MicIcon />
        </button>

        <button type="button" aria-label="Toggle camera">
          <VideoIcon />
        </button>

        <button
          type="button"
          className="end-call-button"
          aria-label="End call"
          onClick={() => navigate(-1)}
        >
          <PhoneOffIcon />
        </button>
      </footer>
    </main>
  );
}

export default VideoCallPage;