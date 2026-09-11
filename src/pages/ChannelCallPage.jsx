import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";
import { useNavigate, useParams } from "react-router-dom";
import { io } from "socket.io-client";

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
      <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.6A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7 12.8 12.8 0 0 0 .7 2.8 2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5 12.8 12.8 0 0 0 2.8.7A2 2 0 0 1 22 16.9Z" />
    </svg>
  );
}

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL;

const ICE_SERVERS = {
  iceServers: [
    {
      urls: "stun:stun.l.google.com:19302",
    },
  ],
};

const fallbackParticipants = [
  {
    id: "sarah",
    name: "Sarah",
    initial: "S",
  },
  {
    id: "david",
    name: "David",
    initial: "D",
  },
  {
    id: "you",
    name: "You",
    initial: "Y",
  },
];

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

function getParticipantInfo(id) {
  const existing = fallbackParticipants.find(
    (participant) => participant.id === id
  );

  if (existing) {
    return existing;
  }

  return {
    id,
    name: id,
    initial: id?.charAt(0)?.toUpperCase() || "?",
  };
}

function ChannelCallPage({ callType = "audio" }) {
  const { channelId } = useParams();
  const navigate = useNavigate();

  const isVideo = callType === "video";
  const channelName = decodeURIComponent(channelId || "general");

  const socketRef = useRef(null);
  const localStreamRef = useRef(null);
  const peersRef = useRef(new Map());
  const pendingCandidatesRef = useRef(new Map());
  const remoteStreamsRef = useRef(new Map());
  const callIdRef = useRef(
    `${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  const [muted, setMuted] = useState(false);
  const [cameraOff, setCameraOff] = useState(false);
  const [speakerOn, setSpeakerOn] = useState(true);
  const [seconds, setSeconds] = useState(0);
  const [participants, setParticipants] = useState([]);
  const [remoteStreams, setRemoteStreams] = useState([]);
  const [connected, setConnected] = useState(false);
  const [error, setError] = useState("");

  const addParticipant = useCallback((id) => {
    if (!id) {
      return;
    }

    setParticipants((current) => {
      if (current.some((participant) => participant.id === id)) {
        return current;
      }

      return [
        ...current,
        {
          ...getParticipantInfo(id),
          status: "online",
        },
      ];
    });
  }, []);

  const removeParticipant = useCallback((id) => {
    setParticipants((current) =>
      current.filter((participant) => participant.id !== id)
    );

    setRemoteStreams((current) =>
      current.filter((stream) => stream.userId !== id)
    );
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

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });

    if (isVideo) {
      stream.getVideoTracks().forEach((track) => {
        track.enabled = !cameraOff;
      });
    }

    localStreamRef.current = stream;

    return stream;
  }, [cameraOff, isVideo, muted]);

  const closePeer = useCallback((userId) => {
    const peer = peersRef.current.get(userId);

    if (peer) {
      peer.close();
      peersRef.current.delete(userId);
    }

    pendingCandidatesRef.current.delete(userId);
    remoteStreamsRef.current.delete(userId);

    removeParticipant(userId);
  }, [removeParticipant]);

  const createPeer = useCallback(
    async (targetUserId) => {
      if (peersRef.current.has(targetUserId)) {
        return peersRef.current.get(targetUserId);
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

        socketRef.current.emit("channel-call:ice-candidate", {
          channelId,
          callId: callIdRef.current,
          targetUserId,
          candidate: event.candidate,
        });
      };

      peer.ontrack = (event) => {
        const [remoteStream] = event.streams;

        if (!remoteStream) {
          return;
        }

        remoteStreamsRef.current.set(targetUserId, remoteStream);

        setRemoteStreams((current) => {
          const withoutCurrent = current.filter(
            (item) => item.userId !== targetUserId
          );

          return [
            ...withoutCurrent,
            {
              userId: targetUserId,
              stream: remoteStream,
            },
          ];
        });

        addParticipant(targetUserId);
      };

      peer.onconnectionstatechange = () => {
        const state = peer.connectionState;

        if (state === "connected") {
          setConnected(true);
        }

        if (
          state === "failed" ||
          state === "disconnected" ||
          state === "closed"
        ) {
          closePeer(targetUserId);
        }
      };

      peersRef.current.set(targetUserId, peer);

      return peer;
    },
    [
      addParticipant,
      channelId,
      closePeer,
      getMedia,
    ]
  );

  const addPendingCandidates = useCallback(async (userId, peer) => {
    const candidates =
      pendingCandidatesRef.current.get(userId) || [];

    pendingCandidatesRef.current.delete(userId);

    for (const candidate of candidates) {
      try {
        await peer.addIceCandidate(candidate);
      } catch (candidateError) {
        console.error(
          "Unable to add queued ICE candidate:",
          candidateError
        );
      }
    }
  }, []);

  const createOfferForUser = useCallback(
    async (targetUserId) => {
      /*
       * Only one side creates the initial offer.
       * This prevents both peers from creating offers at the same time.
       */
      const myId = socketRef.current?.id || "";

      if (!myId || myId >= targetUserId) {
        return;
      }

      try {
        const peer = await createPeer(targetUserId);

        const offer = await peer.createOffer();

        await peer.setLocalDescription(offer);

        socketRef.current?.emit("channel-call:offer", {
          channelId,
          callId: callIdRef.current,
          targetUserId,
          offer,
        });
      } catch (offerError) {
        console.error(
          "Unable to create channel WebRTC offer:",
          offerError
        );
      }
    },
    [channelId, createPeer]
  );

  useEffect(() => {
    if (!SOCKET_URL) {
      setError(
        "VITE_SOCKET_URL is not configured. Add the deployed backend URL to your frontend environment."
      );
      return undefined;
    }

    const token = getAuthToken();

    if (!token) {
      setError(
        "No authentication token was found. Please sign in again."
      );
      return undefined;
    }

    let mounted = true;

    const socket = io(SOCKET_URL, {
      transports: ["websocket", "polling"],
      auth: {
        token,
      },
    });

    socketRef.current = socket;

    socket.on("connect", async () => {
      if (!mounted) {
        return;
      }

      try {
        await getMedia();

        socket.emit("channel-call:join", {
          channelId,
          callId: callIdRef.current,
          type: isVideo ? "video" : "voice",
        });
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

      if (mounted) {
        setError(
          socketError.message ||
            "Unable to connect to the call server."
        );
      }
    });

    socket.on(
      "channel-call:error",
      ({ message }) => {
        if (mounted) {
          setError(message || "Unable to join the channel call.");
        }
      }
    );

    socket.on(
      "channel-call:participants",
      async ({ participants: existingParticipants = [] }) => {
        if (!mounted) {
          return;
        }

        existingParticipants.forEach((participantId) => {
          addParticipant(participantId);
        });

        /*
         * Existing participants and the new participant need a
         * deterministic initiator. The backend gives us user IDs,
         * so the smaller ID creates the offer.
         */
        for (const participantId of existingParticipants) {
          const mySocketId = socket.id;

          if (mySocketId < participantId) {
            await createOfferForUser(participantId);
          }
        }
      }
    );

    socket.on(
      "channel-call:participant-joined",
      async ({ userId: joinedUserId }) => {
        if (!mounted || !joinedUserId) {
          return;
        }

        addParticipant(joinedUserId);

        await createOfferForUser(joinedUserId);
      }
    );

    socket.on(
      "channel-call:offer",
      async ({ userId: senderUserId, offer }) => {
        if (!senderUserId || !offer) {
          return;
        }

        try {
          const peer = await createPeer(senderUserId);

          await peer.setRemoteDescription(
            new RTCSessionDescription(offer)
          );

          await addPendingCandidates(senderUserId, peer);

          const answer = await peer.createAnswer();

          await peer.setLocalDescription(answer);

          socket.emit("channel-call:answer", {
            channelId,
            callId: callIdRef.current,
            targetUserId: senderUserId,
            answer,
          });
        } catch (offerError) {
          console.error(
            "Unable to handle channel offer:",
            offerError
          );
        }
      }
    );

    socket.on(
      "channel-call:answer",
      async ({ userId: senderUserId, answer }) => {
        if (!senderUserId || !answer) {
          return;
        }

        const peer = peersRef.current.get(senderUserId);

        if (!peer) {
          return;
        }

        try {
          await peer.setRemoteDescription(
            new RTCSessionDescription(answer)
          );

          await addPendingCandidates(senderUserId, peer);
        } catch (answerError) {
          console.error(
            "Unable to handle channel answer:",
            answerError
          );
        }
      }
    );

    socket.on(
      "channel-call:ice-candidate",
      async ({ userId: senderUserId, candidate }) => {
        if (!senderUserId || !candidate) {
          return;
        }

        const iceCandidate =
          new RTCIceCandidate(candidate);

        const peer =
          peersRef.current.get(senderUserId);

        if (!peer || !peer.remoteDescription) {
          const existing =
            pendingCandidatesRef.current.get(senderUserId) || [];

          existing.push(iceCandidate);

          pendingCandidatesRef.current.set(
            senderUserId,
            existing
          );

          return;
        }

        try {
          await peer.addIceCandidate(iceCandidate);
        } catch (candidateError) {
          console.error(
            "Unable to add channel ICE candidate:",
            candidateError
          );
        }
      }
    );

    socket.on(
      "channel-call:participant-left",
      ({ userId: leavingUserId }) => {
        if (leavingUserId) {
          closePeer(leavingUserId);
        }
      }
    );

    return () => {
      mounted = false;

      socket.emit("channel-call:leave", {
        channelId,
        callId: callIdRef.current,
        type: isVideo ? "video" : "voice",
      });

      socket.disconnect();

      peersRef.current.forEach((peer) => {
        peer.close();
      });

      peersRef.current.clear();
      pendingCandidatesRef.current.clear();
      remoteStreamsRef.current.clear();

      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((track) => {
          track.stop();
        });

        localStreamRef.current = null;
      }

      socketRef.current = null;
    };
  }, [
    SOCKET_URL,
    addParticipant,
    addPendingCandidates,
    channelId,
    closePeer,
    createOfferForUser,
    createPeer,
    getMedia,
    isVideo,
  ]);

  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((current) => current + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (!localStreamRef.current) {
      return;
    }

    localStreamRef.current.getAudioTracks().forEach((track) => {
      track.enabled = !muted;
    });

    localStreamRef.current.getVideoTracks().forEach((track) => {
      track.enabled = !cameraOff;
    });
  }, [muted, cameraOff]);

  function formatDuration() {
    const minutes = Math.floor(seconds / 60)
      .toString()
      .padStart(2, "0");

    const remainingSeconds = (seconds % 60)
      .toString()
      .padStart(2, "0");

    return `${minutes}:${remainingSeconds}`;
  }

  function handleLeaveCall() {
    socketRef.current?.emit("channel-call:leave", {
      channelId,
      callId: callIdRef.current,
      type: isVideo ? "video" : "voice",
    });

    peersRef.current.forEach((peer) => {
      peer.close();
    });

    peersRef.current.clear();

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => {
        track.stop();
      });

      localStreamRef.current = null;
    }

    navigate(`/channel/${encodeURIComponent(channelName)}`);
  }

  return (
    <main
      className={`channel-call-page ${
        isVideo
          ? "channel-video-call"
          : "channel-audio-call"
      }`}
    >
      <div className="channel-call-background" />

      {error && (
        <div className="call-error">
          {error}
        </div>
      )}

      <header className="channel-call-header">
        <div>
          <div className="channel-call-title">
            <span>#</span>
            <h1>{channelName}</h1>
          </div>

          <p>
            {participants.length + 1} people in call
            <span> · </span>
            {formatDuration()}
          </p>
        </div>
      </header>

      <section className="channel-call-participants">
        {participants.map((participant) => (
          <article
            key={participant.id}
            className="channel-participant"
          >
            {isVideo && remoteStreams.some(
              (item) => item.userId === participant.id
            ) ? (
              <video
                autoPlay
                playsInline
                className="channel-remote-video"
                ref={(element) => {
                  const remote = remoteStreams.find(
                    (item) =>
                      item.userId === participant.id
                  );

                  if (element && remote) {
                    element.srcObject = remote.stream;
                  }
                }}
              />
            ) : (
              <div className="channel-participant-avatar">
                {participant.initial}

                <span className="channel-participant-status" />
              </div>
            )}

            <div className="channel-participant-name">
              {participant.name}
            </div>
          </article>
        ))}

        <article className="channel-participant current-user">
          {isVideo && !cameraOff && localStreamRef.current ? (
            <video
              autoPlay
              muted
              playsInline
              className="channel-local-video"
              ref={(element) => {
                if (element) {
                  element.srcObject =
                    localStreamRef.current;
                }
              }}
            />
          ) : (
            <div className="channel-participant-avatar">
              Y
              <span className="channel-participant-status" />
            </div>
          )}

          <div className="channel-participant-name">
            You
          </div>

          {muted && (
            <div className="channel-participant-muted">
              Muted
            </div>
          )}
        </article>
      </section>

      {isVideo && (
        <div className="channel-self-preview">
          {cameraOff ? (
            <div className="channel-self-camera-off">
              <VideoOffIcon />
              <span>Camera off</span>
            </div>
          ) : (
            <>
              <div className="channel-self-avatar">
                Y
              </div>
              <span>You</span>
            </>
          )}
        </div>
      )}

      <div className="channel-call-controls">
        <button
          type="button"
          className={`channel-call-control ${
            muted ? "active" : ""
          }`}
          onClick={() => setMuted((value) => !value)}
          title={muted ? "Unmute" : "Mute"}
          aria-label={
            muted
              ? "Unmute microphone"
              : "Mute microphone"
          }
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
            title={
              cameraOff
                ? "Turn camera on"
                : "Turn camera off"
            }
            aria-label={
              cameraOff
                ? "Turn camera on"
                : "Turn camera off"
            }
          >
            {cameraOff ? (
              <VideoOffIcon />
            ) : (
              <VideoIcon />
            )}
          </button>
        )}

        <button
          type="button"
          className={`channel-call-control ${
            speakerOn ? "active" : ""
          }`}
          onClick={() => setSpeakerOn((value) => !value)}
          title={
            speakerOn
              ? "Speaker on"
              : "Speaker off"
          }
          aria-label={
            speakerOn
              ? "Turn speaker off"
              : "Turn speaker on"
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