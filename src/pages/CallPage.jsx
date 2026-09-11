import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

function MicIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 17v5" />
      <path d="M8 22h8" />
    </svg>
  );
}

function MicOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 1l22 22" />
      <path d="M9 9v3a3 3 0 0 0 5.12 2.12" />
      <path d="M15 9V5a3 3 0 0 0-5.12-2.12" />
      <path d="M5 10a7 7 0 0 0 11.13 5.66" />
      <path d="M12 17v5" />
      <path d="M8 22h8" />
    </svg>
  );
}

function VideoIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="6" width="12" height="12" rx="2" />
      <path d="M15 10l6-3v10l-6-3" />
    </svg>
  );
}

function VideoOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.5 6H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h9" />
      <path d="M16 9l4-3v12l-4-3" />
    </svg>
  );
}

function SpeakerIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 5L6 9H3v6h3l5 4V5z" />
      <path d="M15 9a4 4 0 0 1 0 6" />
      <path d="M18 6a8 8 0 0 1 0 12" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor"
      strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

function getAuthToken() {
  const possibleKeys = [
    "token",
    "accessToken",
    "access_token",
    "jwt",
    "authToken",
  ];

  for (const key of possibleKeys) {
    const value = localStorage.getItem(key);

    if (value) {
      return value;
    }
  }

  return null;
}

function CallPage({ callType = "video", targetType = "dm" }) {
  const { userId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const person = users[userId] || {
    name: "Sarah",
    avatar: "S",
  };

  const isVideo = callType === "video";

  const socketRef = useRef(null);
  const peerRef = useRef(null);
  const localStreamRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const remoteAudioRef = useRef(null);
  const pendingCandidatesRef = useRef([]);
  const [callId] = useState(
    () => location.state?.callId || crypto.randomUUID()
  );
  const callIdRef = useRef(callId);

  const incomingCall = Boolean(location.state?.incoming);
  const incomingCallerId = location.state?.callerId || userId;

  const [muted, setMuted] = useState(true);
  const [cameraOff, setCameraOff] = useState(!isVideo);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [connected, setConnected] = useState(false);
  const [status, setStatus] = useState(
    incomingCall ? "Incoming call..." : "Calling..."
  );
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState(() => {
    if (!SOCKET_URL) {
      return "VITE_SOCKET_URL is not configured. Add the deployed backend URL to your frontend environment.";
    }

    if (!getAuthToken()) {
      return "No authentication token was found. Please sign in again.";
    }

    return "";
  });

  const cleanupPeer = useCallback(() => {
    if (peerRef.current) {
      peerRef.current.onicecandidate = null;
      peerRef.current.ontrack = null;
      peerRef.current.onconnectionstatechange = null;
      peerRef.current.close();
      peerRef.current = null;
    }

    pendingCandidatesRef.current = [];
  }, []);

  const cleanupMedia = useCallback(() => {
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      localStreamRef.current = null;
    }

    if (remoteVideoRef.current) {
      remoteVideoRef.current.srcObject = null;
    }

    if (remoteAudioRef.current) {
      remoteAudioRef.current.srcObject = null;
    }
  }, []);

  const getMedia = useCallback(async () => {
    if (localStreamRef.current) {
      return localStreamRef.current;
    }

    if (!navigator.mediaDevices?.getUserMedia) {
      throw new Error(
        "Your browser does not support microphone/camera access."
      );
    }

    const stream = await navigator.mediaDevices.getUserMedia({
      audio: true,
      video: isVideo,
    });

    localStreamRef.current = stream;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });

    if (isVideo) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !cameraOff;
      });
    }

    return stream;
  }, [cameraOff, isVideo, muted]);

  const addPendingCandidates = useCallback(async (peer) => {
    const candidates = pendingCandidatesRef.current;

    pendingCandidatesRef.current = [];

    for (const candidate of candidates) {
      try {
        await peer.addIceCandidate(candidate);
      } catch (candidateError) {
        console.error("Unable to add queued ICE candidate:", candidateError);
      }
    }
  }, []);

  const createPeer = useCallback(
    async (targetId) => {
      if (peerRef.current) {
        return peerRef.current;
      }

      const stream = await getMedia();

      const peer = new RTCPeerConnection(ICE_SERVERS);

      stream.getTracks().forEach((track) => {
        peer.addTrack(track, stream);
      });

      peer.onicecandidate = (event) => {
        if (!event.candidate || !socketRef.current) {
          return;
        }

        socketRef.current.emit("call:ice-candidate", {
          targetUserId: targetId,
          callId: callIdRef.current,
          candidate: event.candidate,
        });
      };

      peer.ontrack = (event) => {
        const [remoteStream] = event.streams;

        if (remoteVideoRef.current && isVideo) {
          remoteVideoRef.current.srcObject = remoteStream;
        }

        if (remoteAudioRef.current) {
          remoteAudioRef.current.srcObject = remoteStream;
          remoteAudioRef.current.muted = !speakerOn;
          remoteAudioRef.current.play().catch(() => {});
        }
      };

      peer.onconnectionstatechange = () => {
        const state = peer.connectionState;

        if (state === "connected") {
          setConnected(true);
          setStatus("Connected");
        }

        if (
          state === "failed" ||
          state === "disconnected" ||
          state === "closed"
        ) {
          setConnected(false);
        }
      };

      peerRef.current = peer;

      return peer;
    },
    [getMedia, isVideo, speakerOn]
  );

  const makeOffer = useCallback(
    async (targetId) => {
      const peer = await createPeer(targetId);

      const offer = await peer.createOffer();

      await peer.setLocalDescription(offer);

      socketRef.current?.emit("call:offer", {
        targetUserId: targetId,
        callId: callIdRef.current,
        offer,
      });
    },
    [createPeer]
  );

  useEffect(() => {
    if (!SOCKET_URL) {
      return undefined;
    }

    const token = getAuthToken();

    if (!token) {
      return undefined;
    }

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    socket.on("connect", async () => {
      try {
        await getMedia();

        if (!incomingCall) {
          socket.emit("call:initiate", {
            targetUserId: userId,
            callId: callIdRef.current,
            type: isVideo ? "video" : "voice",
          });

          setStatus("Calling...");
        } else {
          socket.emit("call:accept", {
            targetUserId: incomingCallerId,
            callId: callIdRef.current,
            type: isVideo ? "video" : "voice",
          });

          setStatus("Connecting...");
        }
      } catch (mediaError) {
        console.error(mediaError);
        setError(
          mediaError?.message ||
            "Microphone/camera permission was denied."
        );
      }
    });

    socket.on("connect_error", (socketError) => {
      console.error("Socket connection error:", socketError);
      setError(socketError.message || "Unable to connect to call server.");
    });

    socket.on("call:unavailable", ({ callId }) => {
      if (callId !== callIdRef.current) {
        return;
      }

      setError("The other user is not currently connected.");
      setStatus("Unavailable");
    });

    socket.on("call:accepted", async ({ callId, userId: acceptedUserId }) => {
      if (callId !== callIdRef.current) {
        return;
      }

      try {
        setStatus("Connecting...");
        await makeOffer(acceptedUserId);
      } catch (offerError) {
        console.error("Unable to create WebRTC offer:", offerError);
        setError("Unable to start the WebRTC connection.");
      }
    });

    socket.on("call:offer", async ({ callId, callerId, offer }) => {
      if (callId !== callIdRef.current) {
        return;
      }

      try {
        const peer = await createPeer(callerId);

        await peer.setRemoteDescription(
          new RTCSessionDescription(offer)
        );

        await addPendingCandidates(peer);

        const answer = await peer.createAnswer();

        await peer.setLocalDescription(answer);

        socket.emit("call:answer", {
          targetUserId: callerId,
          callId: callIdRef.current,
          answer,
        });

        setStatus("Connecting...");
      } catch (offerError) {
        console.error("Unable to handle WebRTC offer:", offerError);
        setError("Unable to establish the call.");
      }
    });

    socket.on("call:answer", async ({ callId, answer }) => {
      if (callId !== callIdRef.current || !peerRef.current) {
        return;
      }

      try {
        await peerRef.current.setRemoteDescription(
          new RTCSessionDescription(answer)
        );

        await addPendingCandidates(peerRef.current);
      } catch (answerError) {
        console.error("Unable to handle WebRTC answer:", answerError);
        setError("Unable to complete the call connection.");
      }
    });

    socket.on(
      "call:ice-candidate",
      async ({ callId, candidate }) => {
        if (callId !== callIdRef.current || !candidate) {
          return;
        }

        if (!peerRef.current?.remoteDescription) {
          pendingCandidatesRef.current.push(
            new RTCIceCandidate(candidate)
          );
          return;
        }

        try {
          await peerRef.current.addIceCandidate(
            new RTCIceCandidate(candidate)
          );
        } catch (candidateError) {
          console.error(
            "Unable to add ICE candidate:",
            candidateError
          );
        }
      }
    );

    socket.on("call:ended", ({ callId }) => {
      if (callId !== callIdRef.current) {
        return;
      }

      cleanupPeer();
      cleanupMedia();

      if (targetType === "dm" && userId) {
        navigate(`/dm/${userId}`, {
          replace: true,
        });
      } else {
        navigate("/join-channel", {
          replace: true,
        });
      }
    });

    const activeCallId = callIdRef.current;

    return () => {
      socket.disconnect();
      socketRef.current = null;
      callIdRef.current = activeCallId;
      cleanupPeer();
      cleanupMedia();
    };
  }, [
    addPendingCandidates,
    cleanupMedia,
    cleanupPeer,
    createPeer,
    getMedia,
    incomingCall,
    incomingCallerId,
    isVideo,
    makeOffer,
    navigate,
    targetType,
    userId,
  ]);

  useEffect(() => {
    if (!connected) {
      return undefined;
    }

    const timer = setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [connected]);

  useEffect(() => {
    const stream = localStreamRef.current;

    if (!stream) {
      return;
    }

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });

    stream.getVideoTracks().forEach((track) => {
      track.enabled = !cameraOff;
    });
  }, [muted, cameraOff]);

  useEffect(() => {
    if (remoteAudioRef.current) {
      remoteAudioRef.current.muted = !speakerOn;
    }
  }, [speakerOn]);

  function formatDuration(value) {
    const minutes = Math.floor(value / 60);
    const secs = value % 60;

    return `${String(minutes).padStart(2, "0")}:${String(secs).padStart(
      2,
      "0"
    )}`;
  }

  function handleEndCall() {
    socketRef.current?.emit("call:end", {
      targetUserId: incomingCallerId,
      callId: callIdRef.current,
      type: isVideo ? "video" : "voice",
    });

    cleanupPeer();
    cleanupMedia();

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
        {error && (
          <div className="call-error">
            {error}
          </div>
        )}

        {isVideo ? (
          <>
            <div className="remote-video-placeholder">
              <video
                ref={remoteVideoRef}
                autoPlay
                playsInline
                className="remote-video"
              />

              {!connected && (
                <>
                  <div className="remote-video-avatar">
                    {person.avatar}
                  </div>

                  <div className="remote-video-name">
                    {person.name}
                  </div>
                </>
              )}
            </div>

            <audio
              ref={remoteAudioRef}
              autoPlay
            />

            <div className="video-call-info">
              <h1>{person.name}</h1>

              <div className="call-status">
                <span className="call-status-dot" />
                <span>
                  {connected
                    ? formatDuration(seconds)
                    : status}
                </span>
              </div>
            </div>

            <div className="self-video">
              {cameraOff ? (
                <div className="self-video-off">
                  <VideoOffIcon />
                  <span>Camera off</span>
                </div>
              ) : (
                <video
                  ref={(element) => {
                    if (element && localStreamRef.current) {
                      element.srcObject = localStreamRef.current;
                    }
                  }}
                  autoPlay
                  muted
                  playsInline
                  className="self-video-element"
                />
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
            <div className="audio-call-center">
              <div className="call-avatar-large">
                {person.avatar}
              </div>

              <h1>{person.name}</h1>

              <div className="call-status">
                <span className="call-status-dot" />
                <span>{connected ? "Connected" : status}</span>
              </div>

              <div className="call-duration">
                {formatDuration(seconds)}
              </div>
            </div>

            <audio
              ref={remoteAudioRef}
              autoPlay
            />

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